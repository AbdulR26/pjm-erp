<?php

namespace Feature\Traits;

use Config;

trait InitConfig
{

    public static $configKey = 'Feature';

    public function configKey()
    {
        return static::$configKey;
    }

    public function config(string $key, $default = null)
    {
        return Config::get(self::configKey() . ".$key", $default);
    }
}