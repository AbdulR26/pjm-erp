<?php
namespace Qollam\Customer;

use Feature\Support\Module;

class CustomerModule extends Module
{
    public static $alias = 'customer-module';
    public static $configKey = 'customer';

    public function __construct()
    {
        $this->setBasePath(preg_replace('/src$/i', '', __DIR__));
    }
}
