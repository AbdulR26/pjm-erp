<?php

namespace App\Services\Olshop;

use Illuminate\Support\Facades\Http;

class TikTokShopService
{
    protected string $appKey;
    protected string $appSecret;
    protected string $shopId;
    protected string $accessToken;
    protected string $apiUrl;

    public function __construct()
    {
        $this->appKey = config('olshop.tiktok.app_key', '');
        $this->appSecret = config('olshop.tiktok.app_secret', '');
        $this->shopId = config('olshop.tiktok.shop_id', '');
        $this->accessToken = config('olshop.tiktok.access_token', '');
        $this->apiUrl = config('olshop.tiktok.api_url', 'https://open-api.tiktokglobalshop.com');
    }

    public function testConnection(): array
    {
        if (empty($this->appKey) || empty($this->accessToken) || empty($this->shopId)) {
            return [
                'success' => false,
                'message' => 'Kredensial API TikTok Shop belum diisi di file .env (TIKTOK_SHOP_APP_KEY, TIKTOK_SHOP_ACCESS_TOKEN, TIKTOK_SHOP_ID).'
            ];
        }

        try {
            $response = Http::get($this->apiUrl . '/api/shop/get_authorized_shop', [
                'app_key' => $this->appKey,
                'access_token' => $this->accessToken
            ]);

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Koneksi API TikTok Shop Berhasil!'];
            }
            return ['success' => false, 'message' => 'Gagal koneksi ke TikTok Shop: HTTP ' . $response->status()];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error koneksi TikTok Shop: ' . $e->getMessage()];
        }
    }

    public function getProducts(): array
    {
        if (empty($this->appKey) || empty($this->accessToken) || empty($this->shopId)) {
            return [];
        }

        try {
            $response = Http::get($this->apiUrl . '/api/products/search', [
                'app_key' => $this->appKey,
                'access_token' => $this->accessToken,
                'shop_id' => $this->shopId
            ]);

            if ($response->successful() && isset($response->json()['data']['products'])) {
                $rawList = $response->json()['data']['products'];
                return array_map(function ($item) {
                    $firstSku = $item['skus'][0] ?? [];
                    return [
                        'id'          => (string)($item['id'] ?? $item['product_id'] ?? ''),
                        'name'        => $item['title'] ?? $item['product_name'] ?? '',
                        'sku'         => $firstSku['seller_sku'] ?? ('TTK-' . ($item['id'] ?? '')),
                        'price'       => (float)($firstSku['price']['original_price'] ?? 0),
                        'stock'       => (int)($firstSku['stock_infos'][0]['available_stock'] ?? 0),
                        'weight'      => (int)($item['package_weight'] ?? 1000),
                        'description' => $item['description'] ?? '',
                        'image'       => $item['images'][0]['url_list'][0] ?? null,
                        'category'    => $item['category_list'][0]['local_display_name'] ?? 'TikTok Shop'
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
        if (empty($this->appKey) || empty($this->accessToken) || empty($this->shopId)) {
            return [];
        }

        try {
            $response = Http::get($this->apiUrl . '/api/orders/search', [
                'app_key' => $this->appKey,
                'access_token' => $this->accessToken,
                'shop_id' => $this->shopId
            ]);

            if ($response->successful() && isset($response->json()['data']['order_list'])) {
                $rawOrders = $response->json()['data']['order_list'];
                return array_map(function ($ord) {
                    return [
                        'order_id'         => (string)($ord['order_id'] ?? ''),
                        'buyer_name'       => $ord['recipient_address']['name'] ?? 'Pembeli TikTok',
                        'buyer_phone'      => $ord['recipient_address']['phone_number'] ?? '',
                        'shipping_address' => $ord['recipient_address']['full_address'] ?? '',
                        'courier'          => $ord['shipping_provider'] ?? 'TikTok Express',
                        'resi_number'      => $ord['tracking_number'] ?? '',
                        'status'           => strtolower($ord['order_status'] ?? 'processing'),
                        'created_at'       => isset($ord['create_time']) ? date('Y-m-d H:i:s', $ord['create_time']) : now()->format('Y-m-d H:i:s'),
                        'total_amount'     => (float)($ord['payment_info']['total_amount'] ?? 0),
                        'items'            => array_map(function ($item) {
                            return [
                                'name'     => $item['product_name'] ?? '',
                                'price'    => (float)($item['sku_original_price'] ?? 0),
                                'quantity' => (int)($item['quantity'] ?? 1),
                                'sku'      => $item['seller_sku'] ?? ''
                            ];
                        }, $ord['item_list'] ?? [])
                    ];
                }, $rawOrders);
            }
        } catch (\Exception $e) {
            return [];
        }

        return [];
    }
}
