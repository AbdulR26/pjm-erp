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
        $dbApiKey = \App\Models\Setting::get('biteship_api_key');
        $this->apiKey = !empty($dbApiKey) ? $dbApiKey : (config('biteship.api_key') ?? '');

        $dbIsProd = \App\Models\Setting::get('biteship_is_production');
        if ($dbIsProd !== null) {
            $this->isProduction = ($dbIsProd === '1' || $dbIsProd === 'true' || $dbIsProd === 1 || $dbIsProd === true);
        } else {
            $this->isProduction = config('biteship.is_production', false);
        }

        $dbPostalCode = \App\Models\Setting::get('biteship_origin_postal_code');
        $dbLat = \App\Models\Setting::get('biteship_origin_latitude');
        $dbLong = \App\Models\Setting::get('biteship_origin_longitude');

        $this->origin = [
            'postal_code' => !empty($dbPostalCode) ? $dbPostalCode : (config('biteship.origin.postal_code') ?? 10430),
            'latitude'    => !empty($dbLat) ? (float) $dbLat : (config('biteship.origin.latitude') ?? -6.2088),
            'longitude'   => !empty($dbLong) ? (float) $dbLong : (config('biteship.origin.longitude') ?? 106.8456),
        ];

        $this->baseUrl = 'https://api.biteship.com';
    }

    public function testConnection(?string $testApiKey = null, ?bool $testIsProduction = null): array
    {
        $key = !empty($testApiKey) ? $testApiKey : $this->apiKey;
        $isProd = ($testIsProduction !== null) ? $testIsProduction : $this->isProduction;

        if (empty($key)) {
            return [
                'success' => false,
                'message' => 'Biteship API Key belum diisi. Silakan masukkan API Key terlebih dahulu.'
            ];
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => $key,
            ])->get($this->baseUrl . '/v1/couriers');

            if ($response->successful() && $response->json('success')) {
                $couriers = $response->json('couriers', []);
                $count = count($couriers);
                $modeText = $isProd ? 'Production (Live)' : 'Testing (Sandbox)';
                return [
                    'success' => true,
                    'message' => "Terkoneksi ke Biteship API [{$modeText}] ({$count} kurir aktif ditemukan)."
                ];
            }

            $errorMsg = $response->json('error') ?: ($response->json('message') ?: 'HTTP ' . $response->status() . ' - API Key tidak valid.');
            return [
                'success' => false,
                'message' => 'Gagal terhubung ke Biteship: ' . $errorMsg
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Gagal terhubung ke Biteship: ' . $e->getMessage()
            ];
        }
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
    public function getRates(array $destination, array $items, ?string $couriers = null): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Biteship API Key is not configured.');
        }

        // Resolve couriers list based on active status in database
        $activeCouriers = \App\Models\Courier::where('is_active', true)->pluck('code')->toArray();
        if (!empty($activeCouriers)) {
            if (empty($couriers)) {
                $couriers = implode(',', $activeCouriers);
            } else {
                $passedCouriers = explode(',', $couriers);
                $filteredCouriers = array_intersect($passedCouriers, $activeCouriers);
                if (!empty($filteredCouriers)) {
                    $couriers = implode(',', $filteredCouriers);
                } else {
                    $couriers = 'none';
                }
            }
        } else {
            // Fallback if table is empty (e.g. before first sync)
            if (empty($couriers)) {
                $couriers = 'jne,jnt,sicepat,anteraja,ide';
            }
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

        $order->load(['customer', 'items.product', 'shipment']);
        $customer = $order->customer;

        // Origin details (defaults to config origin if shipperDetails doesn't supply)
        $shipperName = $shipperDetails['shipper_name'] ?? config('app.name', 'Putri Jaya Mobil');
        $shipperPhone = preg_replace('/[^0-9]/', '', (string) ($shipperDetails['shipper_phone'] ?? '081234567890'));
        $shipperEmail = $shipperDetails['shipper_email'] ?? 'admin@putrijayamobil.com';
        $originAddress = $shipperDetails['origin_address'] ?? 'Jl. Raya Putri Jaya Mobil No 1';

        $originPostalRaw = $shipperDetails['origin_postal_code'] ?? ($this->origin['postal_code'] ?? 10430);
        $originPostalCode = (int) preg_replace('/[^0-9]/', '', (string) $originPostalRaw);
        if ($originPostalCode === 0) {
            $originPostalCode = 10430;
        }

        $originLat = $shipperDetails['origin_latitude'] ?? ($this->origin['latitude'] ?? 0);
        $originLng = $shipperDetails['origin_longitude'] ?? ($this->origin['longitude'] ?? 0);

        // Destination details (extract from shipperDetails -> shipment -> customer)
        $destinationLat = $shipperDetails['destination_latitude'] ?? ($order->shipment?->destination_latitude ?? 0);
        $destinationLng = $shipperDetails['destination_longitude'] ?? ($order->shipment?->destination_longitude ?? 0);

        $destPostalRaw = !empty($shipperDetails['destination_postal_code'])
            ? $shipperDetails['destination_postal_code']
            : (!empty($order->shipment?->destination_postal_code)
                ? $order->shipment->destination_postal_code
                : ($customer?->postal_code ?? ''));

        $destinationPostalCode = (int) preg_replace('/[^0-9]/', '', (string) $destPostalRaw);

        if (empty($destinationPostalCode) || strlen((string) $destinationPostalCode) < 5) {
            throw new \Exception('Kode pos tujuan pengiriman (postal code) tidak valid atau belum diisi (diperlukan 5 digit angka). Silakan lengkapi Kode Pos pada detail pengiriman order.');
        }

        // Synchronize shipment destination_postal_code if missing
        if ($order->shipment && (empty($order->shipment->destination_postal_code) || $order->shipment->destination_postal_code == 0)) {
            $order->shipment->update(['destination_postal_code' => $destinationPostalCode]);
        }

        // Parse items directly from OrderItem snapshot fields (no productVariant relationship needed)
        $items = $order->items->map(function ($item) {
            return [
                'name' => $item->product_name ?: 'Barang',
                'weight' => (int) ($item->weight ?: 1000),
                'quantity' => (int) $item->quantity,
                'value' => (int) ($item->unit_price ?: $item->price ?: 0),
            ];
        })->toArray();

        $params = [
            'shipper_contact_name' => $shipperName,
            'shipper_contact_phone' => $shipperPhone,
            'shipper_contact_email' => $shipperEmail,
            
            'origin_contact_name' => $shipperName,
            'origin_contact_phone' => $shipperPhone,
            'origin_address' => $originAddress,
            'origin_postal_code' => $originPostalCode,
            'origin_coordinate' => [
                'latitude' => (float) $originLat,
                'longitude' => (float) $originLng,
            ],

            'destination_contact_name' => $order->shipping_recipient_name ?: ($order->shipment?->destination_contact_name ?: ($customer->name ?? '')),
            'destination_contact_phone' => $order->shipping_recipient_phone ?: ($order->shipment?->destination_contact_phone ?: ($customer->phone ?? '081234567890')),
            'destination_contact_email' => $customer->email ?: 'customer@email.com',
            'destination_address' => $order->shipping_address ?: ($order->shipment?->destination_address ?: ($customer->address ?? 'Alamat Penerima')),
            'destination_postal_code' => $destinationPostalCode,
            'destination_coordinate' => [
                'latitude' => (float) $destinationLat,
                'longitude' => (float) $destinationLng,
            ],

            'courier_company' => strtolower($order->shipping_courier ?: ($order->shipment?->courier_company ?? 'jne')),
            'courier_type' => $this->mapCourierType(
                $order->shipping_courier ?: ($order->shipment?->courier_company ?? 'jne'),
                $order->shipping_service ?: ($order->shipment?->courier_service ?? 'reg')
            ),
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

    /**
     * Get list of couriers from Biteship.
     *
     * @return array
     * @throws \Exception
     */
    public function getAvailableCouriers(): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Biteship API Key is not configured.');
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->get($this->baseUrl . '/v1/couriers');

            if ($response->failed()) {
                Log::error('Biteship Couriers Error', [
                    'response' => $response->body(),
                ]);
                throw new \Exception('Biteship couriers request failed: ' . $response->json('error', $response->body()));
            }

            return $response->json('couriers') ?? [];
        } catch (\Exception $e) {
            Log::error('Biteship Couriers Exception', [
                'message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Map human-readable courier service names to Biteship technical courier_type codes.
     */
    public function mapCourierType(string $courierCompany, string $service): string
    {
        $courier = strtolower(trim($courierCompany));
        $svc = strtolower(trim($service));

        if (empty($svc)) {
            return 'reg';
        }

        // List of known Biteship technical courier_type codes
        $validCodes = [
            'reg', 'ez', 'yes', 'oke', 'ons', 'best', 'nextday', 'sameday', 
            'instant', 'cargo', 'eco', 'jtr', 'gokil', 'carg', 'siunt', 
            'super', 'onepack', 'regpack', 'poskil'
        ];

        if (in_array($svc, $validCodes)) {
            return $svc;
        }

        // Fuzzy match common Indonesian service names to Biteship courier_type
        return match(true) {
            str_contains($svc, 'reg') || str_contains($svc, 'standard') || str_contains($svc, 'standar') => match($courier) {
                'jnt', 'j&t' => 'ez',
                default => 'reg',
            },
            str_contains($svc, 'next') || str_contains($svc, 'esok') || str_contains($svc, 'yes') || str_contains($svc, 'ons') || str_contains($svc, 'best') => match($courier) {
                'jne' => 'yes',
                'tiki' => 'ons',
                'sicepat' => 'best',
                default => 'nextday',
            },
            str_contains($svc, 'same') => 'sameday',
            str_contains($svc, 'instant') || str_contains($svc, 'instan') => 'instant',
            str_contains($svc, 'cargo') || str_contains($svc, 'kargo') || str_contains($svc, 'trucking') || str_contains($svc, 'jtr') || str_contains($svc, 'gokil') => match($courier) {
                'jne' => 'jtr',
                'jnt', 'j&t' => 'carg',
                default => 'cargo',
            },
            str_contains($svc, 'hemat') || str_contains($svc, 'eco') || str_contains($svc, 'oke') => match($courier) {
                'jne' => 'oke',
                default => 'eco',
            },
            default => 'reg',
        };
    }
}
