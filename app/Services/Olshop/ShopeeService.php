<?php

namespace App\Services\Olshop;

use Illuminate\Support\Facades\Http;

class ShopeeService
{
    protected string $partnerId;
    protected string $partnerKey;
    protected string $shopId;
    protected string $accessToken;
    protected string $apiUrl;

    public function __construct()
    {
        $this->partnerId = config('olshop.shopee.partner_id', '');
        $this->partnerKey = config('olshop.shopee.partner_key', '');
        $this->shopId = config('olshop.shopee.shop_id', '');
        $this->accessToken = config('olshop.shopee.access_token', '');
        $this->apiUrl = config('olshop.shopee.api_url', 'https://partner.shopeemobile.com/api/v2');
    }

    public function testConnection(): array
    {
        if (empty($this->partnerId) || empty($this->partnerKey) || empty($this->shopId)) {
            return [
                'success' => false,
                'message' => 'Kredensial API Shopee belum diisi di file .env (SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY, SHOPEE_SHOP_ID).'
            ];
        }

        try {
            $timestamp = time();
            $path = '/api/v2/shop/get_shop_info';
            $baseString = sprintf('%s%s%s%s%s', $this->partnerId, $path, $timestamp, $this->accessToken, $this->shopId);
            $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

            $response = Http::get($this->apiUrl . '/shop/get_shop_info', [
                'partner_id' => (int)$this->partnerId,
                'timestamp' => $timestamp,
                'sign' => $sign,
                'access_token' => $this->accessToken,
                'shop_id' => (int)$this->shopId
            ]);

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Koneksi API Shopee Berhasil!'];
            }
            return ['success' => false, 'message' => 'Gagal koneksi ke Shopee: HTTP ' . $response->status()];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error koneksi Shopee: ' . $e->getMessage()];
        }
    }

    public function getProducts(): array
    {
        if (empty($this->partnerId) || empty($this->partnerKey) || empty($this->shopId)) {
            return [];
        }

        try {
            $timestamp = time();
            $path = '/api/v2/product/get_item_list';
            $baseString = sprintf('%s%s%s%s%s', $this->partnerId, $path, $timestamp, $this->accessToken, $this->shopId);
            $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

            $response = Http::get($this->apiUrl . '/product/get_item_list', [
                'partner_id' => (int)$this->partnerId,
                'timestamp' => $timestamp,
                'sign' => $sign,
                'access_token' => $this->accessToken,
                'shop_id' => (int)$this->shopId,
                'page_size' => 50,
                'item_status' => 'NORMAL'
            ]);

            if ($response->successful() && isset($response->json()['response']['item'])) {
                $rawList = $response->json()['response']['item'];
                return array_map(function ($item) {
                    return [
                        'id'          => (string)($item['item_id'] ?? ''),
                        'name'        => $item['item_name'] ?? '',
                        'sku'         => $item['item_sku'] ?? ('SHP-' . ($item['item_id'] ?? '')),
                        'price'       => (float)($item['price_info'][0]['original_price'] ?? $item['price'] ?? 0),
                        'stock'       => (int)($item['stock_info'][0]['current_stock'] ?? $item['stock'] ?? 0),
                        'weight'      => (int)($item['weight'] ?? 1000),
                        'description' => $item['description'] ?? '',
                        'image'       => $item['image']['image_url_list'][0] ?? null,
                        'category'    => 'Shopee'
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
        if (empty($this->partnerId) || empty($this->partnerKey) || empty($this->shopId)) {
            return [];
        }

        try {
            $timestamp = time();
            $path = '/api/v2/order/get_order_list';
            $baseString = sprintf('%s%s%s%s%s', $this->partnerId, $path, $timestamp, $this->accessToken, $this->shopId);
            $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

            $response = Http::get($this->apiUrl . '/order/get_order_list', [
                'partner_id' => (int)$this->partnerId,
                'timestamp' => $timestamp,
                'sign' => $sign,
                'access_token' => $this->accessToken,
                'shop_id' => (int)$this->shopId,
                'time_range_field' => 'create_time',
                'time_from' => strtotime('-7 days'),
                'time_to' => time(),
                'page_size' => 50
            ]);

            if ($response->successful() && isset($response->json()['response']['order_list'])) {
                $rawOrders = $response->json()['response']['order_list'];
                return array_map(function ($ord) {
                    return [
                        'order_id'         => (string)($ord['order_sn'] ?? ''),
                        'buyer_name'       => $ord['recipient_address']['name'] ?? 'Pembeli Shopee',
                        'buyer_phone'      => $ord['recipient_address']['phone'] ?? '',
                        'shipping_address' => $ord['recipient_address']['full_address'] ?? '',
                        'courier'          => $ord['shipping_carrier'] ?? 'Shopee Express',
                        'resi_number'      => $ord['tracking_number'] ?? '',
                        'status'           => strtolower($ord['order_status'] ?? 'processing'),
                        'created_at'       => isset($ord['create_time']) ? date('Y-m-d H:i:s', $ord['create_time']) : now()->format('Y-m-d H:i:s'),
                        'total_amount'     => (float)($ord['total_amount'] ?? 0),
                        'items'            => array_map(function ($item) {
                            return [
                                'name'     => $item['item_name'] ?? '',
                                'price'    => (float)($item['model_original_price'] ?? 0),
                                'quantity' => (int)($item['model_quantity_purchased'] ?? 1),
                                'sku'      => $item['item_sku'] ?? ''
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
