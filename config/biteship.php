<?php

return [
    'api_key' => env('BITESHIP_API_KEY'),
    'is_production' => filter_var(env('BITESHIP_IS_PRODUCTION', false), FILTER_VALIDATE_BOOLEAN),
    'origin' => [
        'latitude' => env('BITESHIP_ORIGIN_LATITUDE', -6.2088),
        'longitude' => env('BITESHIP_ORIGIN_LONGITUDE', 106.8456),
        'postal_code' => env('BITESHIP_ORIGIN_POSTAL_CODE', 10430),
    ],
];
