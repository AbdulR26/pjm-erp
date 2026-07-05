<?php

use App\Providers\AppServiceProvider;
use Feature\FeatureServiceProvider;
use Qollam\Log\LogServiceProvider;
use Scaffolding\ScaffoldingServiceProvider;

use Qollam\Product\ProductServiceProvider;
use Qollam\Customer\CustomerServiceProvider;
use Qollam\Chat\ChatServiceProvider;
use Qollam\Order\OrderServiceProvider;

return [
    AppServiceProvider::class,
    FeatureServiceProvider::class,
    LogServiceProvider::class,
    ScaffoldingServiceProvider::class,
    ProductServiceProvider::class,
    CustomerServiceProvider::class,
    ChatServiceProvider::class,
    OrderServiceProvider::class,
];
