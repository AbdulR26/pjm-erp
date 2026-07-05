<?php

namespace Qollam\Product;

use Feature\Support\ServiceProvider;

class ProductServiceProvider extends ServiceProvider
{
    public function register()
    {
        $alias = ProductModule::$alias;
        $this->init(new ProductModule());

        $instance = app($alias);

        // Merge config
        $this->mergeConfigFrom($instance->configPath('product.php'), ProductModule::$configKey);
    }

    public function boot()
    {
        parent::boot();
    }
}
