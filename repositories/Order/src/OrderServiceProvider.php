<?php
namespace Qollam\Order;

use Feature\Support\ServiceProvider;

class OrderServiceProvider extends ServiceProvider
{
    public function register()
    {
        $alias = OrderModule::$alias;
        $this->init(new OrderModule());
        $instance = app($alias);
        $this->mergeConfigFrom($instance->configPath('order.php'), OrderModule::$configKey);
    }

    public function boot()
    {
        parent::boot();
    }
}
