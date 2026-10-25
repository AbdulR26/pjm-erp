<?php

$envFile = __DIR__ . '/.env';
$env = [];
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos($line, '=') !== false) {
        list($k, $v) = explode('=', $line, 2);
        $env[trim($k)] = trim(trim($v), '"\'');
    }
}

$partnerId = (int)$env['SHOPEE_PARTNER_ID'];
$partnerKey = $env['SHOPEE_PARTNER_KEY'];
$shopId = (int)$env['SHOPEE_SHOP_ID'];
$accessToken = $env['SHOPEE_ACCESS_TOKEN'];
$host = 'https://partner.shopeemobile.com';

$allItemIds = [];
$offset = 0;
$hasNext = true;

$start = microtime(true);
while ($hasNext && count($allItemIds) < 1000) {
    $timestamp = time();
    $path = '/api/v2/product/get_item_list';
    $baseString = sprintf('%s%s%s%s%s', $partnerId, $path, $timestamp, $accessToken, $shopId);
    $sign = hash_hmac('sha256', $baseString, $partnerKey);
    $url = sprintf('%s%s?partner_id=%s&timestamp=%s&sign=%s&access_token=%s&shop_id=%s&offset=%s&page_size=100&item_status=NORMAL', $host, $path, $partnerId, $timestamp, $sign, $accessToken, $shopId, $offset);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    curl_close($ch);

    $json = json_decode($res, true);
    $items = $json['response']['item'] ?? [];
    if (empty($items)) break;

    foreach ($items as $it) {
        $allItemIds[] = $it['item_id'];
    }

    $hasNext = $json['response']['has_next_page'] ?? false;
    $offset = $json['response']['next_offset'] ?? ($offset + count($items));
}

echo "Total Item IDs Terkumpul: " . count($allItemIds) . " dalam " . round(microtime(true) - $start, 2) . " detik\n";
