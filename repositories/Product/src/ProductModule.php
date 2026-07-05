<?php

namespace Qollam\Product;

use Feature\Support\Module;

class ProductModule extends Module
{
    public static $alias = 'product-module';

    public static $configKey = 'product';

    public function __construct()
    {
        $this->setBasePath(preg_replace('/src$/i', '', __DIR__));
    }
}
