<?php

return [
    'tokopedia' => [
        'app_key'     => env('TOKOPEDIA_APP_KEY', ''),
        'app_secret'  => env('TOKOPEDIA_APP_SECRET', ''),
        'shop_id'     => env('TOKOPEDIA_SHOP_ID', ''),
        'api_url'     => env('TOKOPEDIA_API_URL', 'https://fs.tokopedia.net'),
    ],
    'tiktok' => [
        'app_key'      => env('TIKTOK_SHOP_APP_KEY', ''),
        'app_secret'   => env('TIKTOK_SHOP_APP_SECRET', ''),
        'shop_id'      => env('TIKTOK_SHOP_ID', ''),
        'access_token' => env('TIKTOK_SHOP_ACCESS_TOKEN', ''),
        'api_url'      => env('TIKTOK_SHOP_API_URL', 'https://open-api.tiktokglobalshop.com'),
    ],
    'shopee' => [
        'partner_id'   => env('SHOPEE_PARTNER_ID', ''),
        'partner_key'  => env('SHOPEE_PARTNER_KEY', ''),
        'shop_id'      => env('SHOPEE_SHOP_ID', ''),
        'access_token' => env('SHOPEE_ACCESS_TOKEN', ''),
        'api_url'      => env('SHOPEE_API_URL', 'https://partner.shopeemobile.com/api/v2'),
    ],
];
