<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected string $serverKey;
    protected string $clientKey;
    protected string $merchantId;
    protected bool $isProduction;
    protected bool $is3ds;
    protected string $snapBaseUrl;
    protected string $apiBaseUrl;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key') ?? '';
        $this->clientKey = config('midtrans.client_key') ?? '';
        $this->merchantId = config('midtrans.merchant_id') ?? '';
        $this->isProduction = config('midtrans.is_production', false);
        $this->is3ds = config('midtrans.is_3ds', true);

        // Set URLs based on environment
        if ($this->isProduction) {
            $this->snapBaseUrl = 'https://app.midtrans.com/snap/v1';
            $this->apiBaseUrl = 'https://api.midtrans.com/v2';
        } else {
            $this->snapBaseUrl = 'https://app.sandbox.midtrans.com/snap/v1';
            $this->apiBaseUrl = 'https://api.sandbox.midtrans.com/v2';
        }
    }

    /**
     * Get request headers with Basic Auth authorization.
     */
    protected function getHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Basic ' . base64_encode($this->serverKey . ':'),
        ];
    }

    /**
     * Create snap token for a transaction.
     *
     * @param Order $order
     * @return array Contains 'token' and 'redirect_url'
     * @throws \Exception
     */
    public function createSnapToken(Order $order): array
    {
        if (empty($this->serverKey)) {
            throw new \Exception('Midtrans Server Key is not configured.');
        }

        // Load customer, items, and shipment relations if not loaded
        $order->load(['customer', 'items', 'shipment']);

        $customer = $order->customer;
        $shipment = $order->shipment;
        
        // Split name into first and last name safely
        $nameParts = explode(' ', trim($customer->name), 2);
        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? '';

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->grand_total,
            ],
            'customer_details' => [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'billing_address' => [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                    'address' => $customer->address,
                ],
                'shipping_address' => [
                    'first_name' => $shipment ? ($shipment->destination_contact_name ?: $firstName) : $firstName,
                    'last_name' => '',
                    'email' => $customer->email,
                    'phone' => $shipment ? ($shipment->destination_contact_phone ?: $customer->phone) : $customer->phone,
                    'address' => $shipment ? ($shipment->destination_address ?: $customer->address) : $customer->address,
                ],
            ],
            'item_details' => $order->items->map(function ($item) {
                $productName = $item->product_name;
                $variantName = $item->variant_name;
                $fullName = $productName . ($variantName ? ' - ' . $variantName : '');
                
                // Limit item name to Midtrans specs
                if (strlen($fullName) > 50) {
                    $fullName = substr($fullName, 0, 47) . '...';
                }

                return [
                    'id' => $item->sku ?: 'item-' . $item->id,
                    'price' => (int) $item->unit_price,
                    'quantity' => (int) $item->quantity,
                    'name' => $fullName,
                ];
            })->toArray(),
        ];

        // If there is a shipping cost, add it as a line item
        if ($order->shipping_cost > 0) {
            $courierName = $shipment ? $shipment->courier_company : 'kurir';
            $serviceName = $shipment ? $shipment->courier_service_name : 'reguler';
            $params['item_details'][] = [
                'id' => 'shipping-cost',
                'price' => (int) $order->shipping_cost,
                'quantity' => 1,
                'name' => 'Ongkos Kirim (' . strtoupper($courierName) . ' ' . strtoupper($serviceName) . ')',
            ];
        }

        // If there is a discount, add it as a negative price line item
        if ($order->discount > 0) {
            $params['item_details'][] = [
                'id' => 'discount',
                'price' => -((int) $order->discount),
                'quantity' => 1,
                'name' => 'Diskon Voucher (' . ($order->voucher_code ?: 'PROMO') . ')',
            ];
        }

        // Add 3DS parameters if needed
        if ($this->is3ds) {
            $params['credit_card'] = [
                'secure' => true,
            ];
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->snapBaseUrl . '/transactions', $params);

            if ($response->failed()) {
                Log::error('Midtrans Snap Error', [
                    'order_id' => $order->order_number,
                    'response' => $response->body(),
                    'status' => $response->status(),
                ]);
                throw new \Exception('Midtrans API Request failed: ' . $response->json('error_messages.0', $response->body()));
            }

            return [
                'token' => $response->json('token'),
                'redirect_url' => $response->json('redirect_url'),
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Snap Exception', [
                'order_id' => $order->order_number,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get transaction status from Midtrans.
     *
     * @param string $orderNumber
     * @return array
     * @throws \Exception
     */
    public function getTransactionStatus(string $orderNumber): array
    {
        if (empty($this->serverKey)) {
            throw new \Exception('Midtrans Server Key is not configured.');
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->get($this->apiBaseUrl . '/' . $orderNumber . '/status');

            if ($response->failed()) {
                Log::error('Midtrans Status Error', [
                    'order_number' => $orderNumber,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Midtrans status check failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Midtrans Status Exception', [
                'order_number' => $orderNumber,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Verify the signature key of Midtrans notification webhook.
     *
     * @param array $payload Webhook payload from Midtrans
     * @return bool True if valid signature
     */
    public function verifySignature(array $payload): bool
    {
        $orderId = $payload['order_id'] ?? '';
        $statusCode = $payload['status_code'] ?? '';
        $grossAmount = $payload['gross_amount'] ?? '';
        $signatureKey = $payload['signature_key'] ?? '';

        if (empty($orderId) || empty($statusCode) || empty($grossAmount) || empty($signatureKey)) {
            return false;
        }

        $input = $orderId . $statusCode . $grossAmount . $this->serverKey;
        $hash = hash('sha512', $input);

        return hash_equals($hash, $signatureKey);
    }

    /**
     * Cancel a transaction in Midtrans.
     *
     * @param string $orderNumber
     * @return array
     * @throws \Exception
     */
    public function cancelTransaction(string $orderNumber): array
    {
        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->apiBaseUrl . '/' . $orderNumber . '/cancel');

            if ($response->failed()) {
                Log::error('Midtrans Cancel Error', [
                    'order_number' => $orderNumber,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Midtrans cancel transaction failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Midtrans Cancel Exception', [
                'order_number' => $orderNumber,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Refund a transaction in Midtrans.
     *
     * @param string $orderNumber
     * @param string $reason
     * @param int|null $amount
     * @return array
     * @throws \Exception
     */
    public function refundTransaction(string $orderNumber, string $reason, ?int $amount = null): array
    {
        $params = [
            'reason' => $reason,
        ];

        if ($amount !== null) {
            $params['amount'] = $amount;
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->apiBaseUrl . '/' . $orderNumber . '/refund', $params);

            if ($response->failed()) {
                Log::error('Midtrans Refund Error', [
                    'order_number' => $orderNumber,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Midtrans refund transaction failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Midtrans Refund Exception', [
                'order_number' => $orderNumber,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
