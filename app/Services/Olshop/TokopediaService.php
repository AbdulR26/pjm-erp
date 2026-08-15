<?php

namespace App\Services\Olshop;

use Illuminate\Support\Facades\Http;

class TokopediaService
{
    protected string $appKey;
    protected string $appSecret;
    protected string $shopId;
    protected string $apiUrl;

    public function __construct()
    {
        $this->appKey = config('olshop.tokopedia.app_key', '');
        $this->appSecret = config('olshop.tokopedia.app_secret', '');
        $this->shopId = config('olshop.tokopedia.shop_id', '');
        $this->apiUrl = config('olshop.tokopedia.api_url', 'https://fs.tokopedia.net');
    }

    public function testConnection(): array
    {
        if (empty($this->appKey) || empty($this->appSecret) || empty($this->shopId)) {
            return [
                'success' => false,
                'message' => 'Kredensial API Tokopedia belum diisi di file .env (TOKOPEDIA_APP_KEY, TOKOPEDIA_APP_SECRET, TOKOPEDIA_SHOP_ID).'
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . base64_encode($this->appKey . ':' . $this->appSecret)
            ])->timeout(5)->get($this->apiUrl . '/inventory/v1/fs/' . $this->shopId . '/info');

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Koneksi API Tokopedia Berhasil!'];
            }
            return ['success' => false, 'message' => 'Gagal koneksi ke Tokopedia: HTTP ' . $response->status()];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error koneksi Tokopedia: ' . $e->getMessage()];
        }
    }

    public function getProducts(): array
    {
        if (empty($this->appKey) || empty($this->appSecret) || empty($this->shopId)) {
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . base64_encode($this->appKey . ':' . $this->appSecret)
            ])->get($this->apiUrl . '/inventory/v1/fs/' . $this->shopId . '/product/list');

            if ($response->successful() && isset($response->json()['data'])) {
                $rawList = $response->json()['data'];
                return array_map(function ($item) {
                    return [
                        'id'          => (string)($item['basic']['productID'] ?? $item['id'] ?? ''),
                        'name'        => $item['basic']['name'] ?? $item['name'] ?? '',
                        'sku'         => $item['other']['sku'] ?? $item['sku'] ?? ('TKP-' . ($item['basic']['productID'] ?? '')),
                        'price'       => (float)($item['price']['value'] ?? $item['price'] ?? 0),
                        'stock'       => (int)($item['stock']['value'] ?? $item['stock'] ?? 0),
                        'weight'      => (int)($item['weight']['value'] ?? $item['weight'] ?? 1000),
                        'description' => $item['basic']['shortDesc'] ?? $item['description'] ?? '',
                        'image'       => $item['pictures'][0]['URLOriginal'] ?? $item['image'] ?? null,
                        'category'    => $item['category']['name'] ?? 'Tokopedia'
                    ];
                }, $rawList);
            }
        } catch (\Exception $e) {
            return [];
        }

        return [];
    }

    public function getOrders(): array
    {
        if (empty($this->appKey) || empty($this->appSecret) || empty($this->shopId)) {
            return [];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . base64_encode($this->appKey . ':' . $this->appSecret)
            ])->get($this->apiUrl . '/v2/order/list', ['shop_id' => $this->shopId]);

            if ($response->successful() && isset($response->json()['data'])) {
                $rawOrders = $response->json()['data'];
                return array_map(function ($ord) {
                    return [
                        'order_id'         => (string)($ord['order_id'] ?? $ord['invoice_number'] ?? ''),
                        'buyer_name'       => $ord['buyer_info']['buyer_name'] ?? 'Pembeli Tokopedia',
                        'buyer_phone'      => $ord['buyer_info']['buyer_phone'] ?? '',
                        'shipping_address' => $ord['recipient']['address']['address_full'] ?? '',
                        'courier'          => $ord['logistic']['shipping_agency'] ?? 'Tokopedia Logistics',
                        'resi_number'      => $ord['logistic']['no_resi'] ?? '',
                        'status'           => strtolower($ord['order_status_name'] ?? 'processing'),
                        'created_at'       => $ord['created_at'] ?? now()->format('Y-m-d H:i:s'),
                        'total_amount'     => (float)($ord['payment_info']['total_amount'] ?? 0),
                        'items'            => array_map(function ($item) {
                            return [
                                'name'     => $item['product_name'] ?? '',
                                'price'    => (float)($item['product_price'] ?? 0),
                                'quantity' => (int)($item['quantity'] ?? 1),
                                'sku'      => $item['sku'] ?? ''
                            ];
                        }, $ord['products'] ?? [])
                    ];
                }, $rawOrders);
            }
        } catch (\Exception $e) {
            return [];
        }

        return [];
    }
}
