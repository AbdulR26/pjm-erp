<?php

namespace App\Services\Olshop;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

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

    public function getAuthUrl(string $redirectUrl): string
    {
        $timestamp = time();
        $path = '/api/v2/shop/auth_partner';
        $baseString = sprintf('%s%s%s', $this->partnerId, $path, $timestamp);
        $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

        $domain = preg_replace('/\/api\/v2\/?$/', '', $this->apiUrl);
        return sprintf('%s%s?partner_id=%s&timestamp=%s&sign=%s&redirect=%s', $domain, $path, $this->partnerId, $timestamp, $sign, urlencode($redirectUrl));
    }

    public function exchangeCodeForToken(string $code, int|string $shopId): array
    {
        $timestamp = time();
        $path = '/api/v2/auth/token/get';
        $baseString = sprintf('%s%s%s', $this->partnerId, $path, $timestamp);
        $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

        $url = sprintf('%s/auth/token/get?partner_id=%s&timestamp=%s&sign=%s', $this->apiUrl, (int)$this->partnerId, $timestamp, $sign);

        $response = Http::timeout(10)->post($url, [
            'code'       => $code,
            'partner_id' => (int)$this->partnerId,
            'shop_id'    => (int)$shopId,
        ]);

        return $response->json();
    }

    public function testConnection(): array
    {
        if (empty($this->partnerId) || empty($this->partnerKey)) {
            return [
                'success' => false,
                'message' => 'Kredensial API Shopee belum diisi di file .env (SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY).'
            ];
        }

        try {
            $timestamp = time();

            // Jika shop_id belum diisi, tes kredensial Partner via Public API
            if (empty($this->shopId)) {
                $path = '/api/v2/public/get_shops_by_partner';
                $baseString = sprintf('%s%s%s', $this->partnerId, $path, $timestamp);
                $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

                $response = Http::timeout(10)->get($this->apiUrl . '/public/get_shops_by_partner', [
                    'partner_id' => (int)$this->partnerId,
                    'timestamp'  => $timestamp,
                    'sign'       => $sign,
                    'page_no'    => 1,
                    'page_size'  => 10,
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    if (empty($data['error'])) {
                        $shopCount = count($data['authed_shop_list'] ?? []);
                        return [
                            'success' => true,
                            'message' => "Koneksi Partner API Shopee Berhasil! Partner terverifikasi ($shopCount toko terotorisasi). Silakan otorisasi toko untuk menghubungkan SHOPEE_SHOP_ID.",
                            'data'    => $data
                        ];
                    }
                    return [
                        'success' => false,
                        'message' => 'Shopee API Error: ' . ($data['message'] ?? $data['error'])
                    ];
                }
                return ['success' => false, 'message' => 'Gagal koneksi ke Shopee: HTTP ' . $response->status() . ' - ' . $response->body()];
            }

            // Jika shop_id sudah diisi, tes info toko
            $path = '/api/v2/shop/get_shop_info';
            $baseString = sprintf('%s%s%s%s%s', $this->partnerId, $path, $timestamp, $this->accessToken, $this->shopId);
            $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

            $response = Http::timeout(10)->get($this->apiUrl . '/shop/get_shop_info', [
                'partner_id'   => (int)$this->partnerId,
                'timestamp'    => $timestamp,
                'sign'         => $sign,
                'access_token' => $this->accessToken,
                'shop_id'      => (int)$this->shopId
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (empty($data['error'])) {
                    return [
                        'success' => true,
                        'message' => 'Koneksi Toko Shopee Berhasil! Toko: ' . ($data['response']['shop_name'] ?? 'Terkoneksi')
                    ];
                }
                return [
                    'success' => false,
                    'message' => 'Shopee API Error: ' . ($data['message'] ?? $data['error'])
                ];
            }
            return ['success' => false, 'message' => 'Gagal koneksi ke Shopee: HTTP ' . $response->status()];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error koneksi Shopee: ' . $e->getMessage()];
        }
    }

    public function getProducts(bool $forceRefresh = false): array
    {
        if (empty($this->partnerId) || empty($this->partnerKey) || empty($this->shopId) || empty($this->accessToken)) {
            return [];
        }

        if (request()->has('refresh') || $forceRefresh) {
            Cache::forget('shopee_products_' . $this->shopId);
        }

        return Cache::remember('shopee_products_' . $this->shopId, 600, function () {
            try {
                $allItemIds = [];
                $offset = 0;
                $hasNext = true;

                // Loop pagination untuk mengambil seluruh ID produk toko (hingga 1000 item)
                while ($hasNext && count($allItemIds) < 1000) {
                    $timestamp = time();
                    $path = '/api/v2/product/get_item_list';
                    $baseString = sprintf('%s%s%s%s%s', $this->partnerId, $path, $timestamp, $this->accessToken, $this->shopId);
                    $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

                    $response = Http::timeout(15)->get($this->apiUrl . '/product/get_item_list', [
                        'partner_id'   => (int)$this->partnerId,
                        'timestamp'    => $timestamp,
                        'sign'         => $sign,
                        'access_token' => $this->accessToken,
                        'shop_id'      => (int)$this->shopId,
                        'offset'       => $offset,
                        'page_size'    => 100,
                        'item_status'  => 'NORMAL'
                    ]);

                    if (!$response->successful() || !isset($response->json()['response']['item'])) {
                        break;
                    }

                    $resData = $response->json()['response'];
                    $items = $resData['item'] ?? [];
                    if (empty($items)) {
                        break;
                    }

                    foreach ($items as $it) {
                        if (!empty($it['item_id'])) {
                            $allItemIds[] = $it['item_id'];
                        }
                    }

                    $hasNext = $resData['has_next_page'] ?? false;
                    $offset = $resData['next_offset'] ?? ($offset + count($items));
                }

                if (empty($allItemIds)) {
                    return [];
                }

                // Ambil info lengkap produk dalam batch maksimal 50 per panggilan
                $allProducts = [];
                $chunks = array_chunk($allItemIds, 50);

                foreach ($chunks as $chunk) {
                    $basePath = '/api/v2/product/get_item_base_info';
                    $baseTime = time();
                    $baseStr = sprintf('%s%s%s%s%s', $this->partnerId, $basePath, $baseTime, $this->accessToken, $this->shopId);
                    $baseSign = hash_hmac('sha256', $baseStr, $this->partnerKey);

                    $detailResponse = Http::timeout(15)->get($this->apiUrl . '/product/get_item_base_info', [
                        'partner_id'   => (int)$this->partnerId,
                        'timestamp'    => $baseTime,
                        'sign'         => $baseSign,
                        'access_token' => $this->accessToken,
                        'shop_id'      => (int)$this->shopId,
                        'item_id_list' => implode(',', $chunk)
                    ]);

                    if ($detailResponse->successful() && isset($detailResponse->json()['response']['item_list'])) {
                        $detailItems = $detailResponse->json()['response']['item_list'];
                        foreach ($detailItems as $item) {
                            $allProducts[] = [
                                'id'          => (string)($item['item_id'] ?? ''),
                                'name'        => $item['item_name'] ?? 'Produk Shopee',
                                'sku'         => !empty($item['item_sku']) ? $item['item_sku'] : ('SHP-' . ($item['item_id'] ?? '')),
                                'price'       => (float)($item['price_info'][0]['current_price'] ?? ($item['price_info'][0]['original_price'] ?? 0)),
                                'stock'       => (int)($item['stock_info_v2']['summary_info']['total_available_stock'] ?? ($item['stock_info'][0]['current_stock'] ?? 0)),
                                'weight'      => (int)round((float)($item['weight'] ?? 1) * 1000),
                                'description' => $item['description'] ?? '',
                                'image'       => $item['image']['image_url_list'][0] ?? null,
                                'category'    => 'Shopee'
                            ];
                        }
                    }
                }

                return $allProducts;
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    public function getOrders(): array
    {
        if (empty($this->partnerId) || empty($this->partnerKey) || empty($this->shopId) || empty($this->accessToken)) {
            return [];
        }

        try {
            $timestamp = time();
            $path = '/api/v2/order/get_order_list';
            $baseString = sprintf('%s%s%s%s%s', $this->partnerId, $path, $timestamp, $this->accessToken, $this->shopId);
            $sign = hash_hmac('sha256', $baseString, $this->partnerKey);

            $response = Http::timeout(15)->get($this->apiUrl . '/order/get_order_list', [
                'partner_id'       => (int)$this->partnerId,
                'timestamp'        => $timestamp,
                'sign'             => $sign,
                'access_token'     => $this->accessToken,
                'shop_id'          => (int)$this->shopId,
                'time_range_field' => 'create_time',
                'time_from'        => strtotime('-15 days'),
                'time_to'          => $timestamp,
                'page_size'        => 50
            ]);

            if ($response->successful() && isset($response->json()['response']['order_list'])) {
                $rawOrders = $response->json()['response']['order_list'];
                $orderSns = array_filter(array_column($rawOrders, 'order_sn'));

                if (empty($orderSns)) {
                    return [];
                }

                // Ambil detail lengkap order via get_order_detail
                $detailPath = '/api/v2/order/get_order_detail';
                $detailTime = time();
                $detailBase = sprintf('%s%s%s%s%s', $this->partnerId, $detailPath, $detailTime, $this->accessToken, $this->shopId);
                $detailSign = hash_hmac('sha256', $detailBase, $this->partnerKey);

                $detailResp = Http::timeout(15)->get($this->apiUrl . '/order/get_order_detail', [
                    'partner_id'               => (int)$this->partnerId,
                    'timestamp'                => $detailTime,
                    'sign'                     => $detailSign,
                    'access_token'             => $this->accessToken,
                    'shop_id'                  => (int)$this->shopId,
                    'order_sn_list'            => implode(',', array_slice($orderSns, 0, 50)),
                    'response_optional_fields' => 'buyer_username,recipient_address,item_list,total_amount,shipping_carrier,package_list'
                ]);

                $orderDetailList = [];
                if ($detailResp->successful() && isset($detailResp->json()['response']['order_list'])) {
                    $orderDetailList = $detailResp->json()['response']['order_list'];
                } else {
                    $orderDetailList = $rawOrders;
                }

                return array_map(function ($ord) {
                    $recipient = $ord['recipient_address'] ?? [];
                    return [
                        'order_id'         => (string)($ord['order_sn'] ?? ''),
                        'buyer_name'       => $recipient['name'] ?? ($ord['buyer_username'] ?? 'Pembeli Shopee'),
                        'buyer_phone'      => $recipient['phone'] ?? '',
                        'shipping_address' => $recipient['full_address'] ?? '',
                        'courier'          => $ord['shipping_carrier'] ?? 'Shopee Express',
                        'resi_number'      => $ord['package_list'][0]['shipping_carrier_tracking_number'] ?? ($ord['tracking_number'] ?? ''),
                        'status'           => strtolower($ord['order_status'] ?? 'processing'),
                        'created_at'       => isset($ord['create_time']) ? date('Y-m-d H:i:s', $ord['create_time']) : now()->format('Y-m-d H:i:s'),
                        'total_amount'     => (float)($ord['total_amount'] ?? 0),
                        'items'            => array_map(function ($item) {
                            return [
                                'name'     => $item['item_name'] ?? '',
                                'price'    => (float)($item['model_discounted_price'] ?? ($item['model_original_price'] ?? 0)),
                                'quantity' => (int)($item['model_quantity_purchased'] ?? 1),
                                'sku'      => $item['item_sku'] ?? ''
                            ];
                        }, $ord['item_list'] ?? [])
                    ];
                }, $orderDetailList);
            }
        } catch (\Exception $e) {
            return [];
        }

        return [];
    }
}
