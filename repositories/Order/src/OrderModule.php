<?php
namespace Qollam\Order;

use Feature\Support\Module;

class OrderModule extends Module
{
    public static $alias = 'order-module';
    public static $configKey = 'order';

    public function __construct()
    {
        $this->setBasePath(preg_replace('/src$/i', '', __DIR__));
    }
}
