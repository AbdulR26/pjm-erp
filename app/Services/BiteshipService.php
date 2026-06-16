<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BiteshipService
{
    protected string $apiKey;
    protected bool $isProduction;
    protected string $baseUrl;
    protected array $origin;

    public function __construct()
    {
        $this->apiKey = config('biteship.api_key') ?? '';
        $this->isProduction = config('biteship.is_production', false);
        $this->origin = config('biteship.origin') ?? [];
        
        $this->baseUrl = 'https://api.biteship.com';
    }

    /**
     * Get request headers with Authorization token.
     */
    protected function getHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Authorization' => $this->apiKey,
        ];
    }

    /**
     * Get shipping rates from Biteship.
     *
     * @param array $destination Details of the destination (latitude, longitude, postal_code)
     * @param array $items List of items, each containing name, quantity, price/value, weight (optional, default 1000g)
     * @param string|null $couriers Comma separated list of couriers (e.g., 'jne,jnt,sicepat')
     * @return array
     * @throws \Exception
     */
    public function getRates(array $destination, array $items, ?string $couriers = 'jne,jnt,sicepat'): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Biteship API Key is not configured.');
        }

        // Format items for Biteship
        $formattedItems = [];
        foreach ($items as $item) {
            $formattedItems[] = [
                'name' => $item['name'] ?? 'Barang',
                'value' => (int) ($item['value'] ?? $item['price'] ?? 0),
                'weight' => (int) ($item['weight'] ?? 1000), // default to 1000 grams if not provided
                'quantity' => (int) ($item['quantity'] ?? 1),
            ];
        }

        $params = [
            'origin_latitude' => (float) ($this->origin['latitude'] ?? 0),
            'origin_longitude' => (float) ($this->origin['longitude'] ?? 0),
            'origin_postal_code' => (int) ($this->origin['postal_code'] ?? 0),
            'destination_latitude' => (float) ($destination['latitude'] ?? 0),
            'destination_longitude' => (float) ($destination['longitude'] ?? 0),
            'destination_postal_code' => (int) ($destination['postal_code'] ?? 0),
            'couriers' => $couriers,
            'items' => $formattedItems,
        ];

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->baseUrl . '/v1/rates/couriers', $params);

            if ($response->failed()) {
                Log::error('Biteship Rates Error', [
                    'params' => $params,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Biteship rates request failed: ' . $response->json('error', $response->body()));
            }

            return $response->json('pricing') ?? [];
        } catch (\Exception $e) {
            Log::error('Biteship Rates Exception', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Create a shipment order in Biteship.
     *
     * @param Order $order
     * @param array $shipperDetails Custom sender/shipper details (e.g. shipper_name, shipper_phone, origin_address, origin_postal_code)
     * @return array
     * @throws \Exception
     */
    public function createOrder(Order $order, array $shipperDetails = []): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Biteship API Key is not configured.');
        }

        $order->load(['customer', 'items.productVariant.product', 'shipment']);
        $customer = $order->customer;

        // Origin details (defaults to config origin if shipperDetails doesn't supply)
        $shipperName = $shipperDetails['shipper_name'] ?? config('app.name', 'Putri Jaya Mobil');
        $shipperPhone = $shipperDetails['shipper_phone'] ?? '081234567890';
        $shipperEmail = $shipperDetails['shipper_email'] ?? 'admin@putrijayamobil.com';
        $originAddress = $shipperDetails['origin_address'] ?? 'Jl. Raya Putri Jaya Mobil No 1';
        $originPostalCode = $shipperDetails['origin_postal_code'] ?? ($this->origin['postal_code'] ?? 0);
        $originLat = $shipperDetails['origin_latitude'] ?? ($this->origin['latitude'] ?? 0);
        $originLng = $shipperDetails['origin_longitude'] ?? ($this->origin['longitude'] ?? 0);

        // Destination details (we can extract from order address or prompt coordinates if present)
        $destinationLat = $shipperDetails['destination_latitude'] ?? ($order->shipment?->destination_latitude ?? 0);
        $destinationLng = $shipperDetails['destination_longitude'] ?? ($order->shipment?->destination_longitude ?? 0);
        $destinationPostalCode = $shipperDetails['destination_postal_code'] ?? ($order->shipment?->destination_postal_code ?? 0);

        // Parse items to determine weights (checking dynamic attributes first, fallback to 1000g)
        $items = $order->items->map(function ($item) {
            $product = $item->productVariant->product;
            
            // Try to resolve weight from dynamic JSON product attributes
            $weight = 1000; // default 1kg
            if ($product && is_array($product->attributes)) {
                if (isset($product->attributes['weight'])) {
                    $weight = (int) $product->attributes['weight'];
                } elseif (isset($product->attributes['berat'])) {
                    $weight = (int) $product->attributes['berat'];
                }
            }

            $productName = $product ? $product->name : 'Produk';
            $variantName = $item->productVariant->name;
            $fullName = $productName . ($variantName ? ' - ' . $variantName : '');

            return [
                'name' => $fullName,
                'weight' => $weight,
                'quantity' => $item->quantity,
                'value' => (int) $item->price,
            ];
        })->toArray();

        $params = [
            'shipper_contact_name' => $shipperName,
            'shipper_contact_phone' => $shipperPhone,
            'shipper_contact_email' => $shipperEmail,
            
            'origin_contact_name' => $shipperName,
            'origin_contact_phone' => $shipperPhone,
            'origin_address' => $originAddress,
            'origin_postal_code' => (int) $originPostalCode,
            'origin_coordinate' => [
                'latitude' => (float) $originLat,
                'longitude' => (float) $originLng,
            ],

            'destination_contact_name' => $order->shipping_recipient_name ?: ($order->shipment?->destination_contact_name ?: ($customer->name ?? '')),
            'destination_contact_phone' => $order->shipping_recipient_phone ?: ($order->shipment?->destination_contact_phone ?: ($customer->phone ?? '081234567890')),
            'destination_contact_email' => $customer->email ?: 'customer@email.com',
            'destination_address' => $order->shipping_address ?: ($order->shipment?->destination_address ?: ($customer->address ?? 'Alamat Penerima')),
            'destination_postal_code' => (int) $destinationPostalCode ?: null,
            'destination_coordinate' => [
                'latitude' => (float) $destinationLat,
                'longitude' => (float) $destinationLng,
            ],

            'courier_company' => strtolower($order->shipping_courier ?: ($order->shipment?->courier_company ?? '')),
            'courier_type' => strtolower($order->shipping_service ?: ($order->shipment?->courier_service ?? '')),
            'delivery_type' => 'now', // 'now', 'scheduled'
            'items' => $items,
        ];

        // Clean coordinates if they are empty
        if ($params['destination_coordinate']['latitude'] == 0 && $params['destination_coordinate']['longitude'] == 0) {
            unset($params['destination_coordinate']);
        }
        if ($params['origin_coordinate']['latitude'] == 0 && $params['origin_coordinate']['longitude'] == 0) {
            unset($params['origin_coordinate']);
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->baseUrl . '/v1/orders', $params);

            if ($response->failed()) {
                Log::error('Biteship Create Order Error', [
                    'order_number' => $order->order_number,
                    'params' => $params,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Biteship order creation failed: ' . $response->json('error', $response->body()));
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Biteship Create Order Exception', [
                'order_number' => $order->order_number,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get tracking status of a shipment.
     *
     * @param string $waybill Airway bill / tracking number
     * @param string $courier Courier company (e.g. 'jne', 'jnt', 'sicepat')
     * @return array
     * @throws \Exception
     */
    public function getTrackingStatus(string $waybill, string $courier): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Biteship API Key is not configured.');
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->get($this->baseUrl . "/v1/trackings/{$waybill}/couriers/" . strtolower($courier));

            if ($response->failed()) {
                Log::error('Biteship Track Error', [
                    'waybill' => $waybill,
                    'courier' => $courier,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Biteship tracking failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Biteship Track Exception', [
                'waybill' => $waybill,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get details of a Biteship order.
     *
     * @param string $biteshipOrderId
     * @return array
     * @throws \Exception
     */
    public function getOrderDetails(string $biteshipOrderId): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Biteship API Key is not configured.');
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->get($this->baseUrl . "/v1/orders/{$biteshipOrderId}");

            if ($response->failed()) {
                Log::error('Biteship Order Info Error', [
                    'biteship_order_id' => $biteshipOrderId,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Biteship get order details failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Biteship Order Info Exception', [
                'biteship_order_id' => $biteshipOrderId,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Cancel a Biteship shipment.
     *
     * @param string $biteshipOrderId
     * @param string $reason
     * @return array
     * @throws \Exception
     */
    public function cancelShipment(string $biteshipOrderId, string $reason): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Biteship API Key is not configured.');
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->post($this->baseUrl . "/v1/orders/{$biteshipOrderId}/cancellation", [
                    'reason' => $reason,
                ]);

            if ($response->failed()) {
                Log::error('Biteship Cancel Shipment Error', [
                    'biteship_order_id' => $biteshipOrderId,
                    'response' => $response->body(),
                ]);
                throw new \Exception('Biteship cancellation failed: ' . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Biteship Cancel Shipment Exception', [
                'biteship_order_id' => $biteshipOrderId,
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
