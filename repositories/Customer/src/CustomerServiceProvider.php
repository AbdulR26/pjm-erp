<?php
namespace Qollam\Customer;

use Feature\Support\ServiceProvider;

class CustomerServiceProvider extends ServiceProvider
{
    public function register()
    {
        $alias = CustomerModule::$alias;
        $this->init(new CustomerModule());
        $instance = app($alias);
        $this->mergeConfigFrom($instance->configPath('customer.php'), CustomerModule::$configKey);
    }

    public function boot()
    {
        parent::boot();
    }
}
