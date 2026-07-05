<?php

namespace Feature\Support;

use Feature\Traits\InitConfig;
use Feature\Traits\InitPath;

class Module
{
    use InitPath, InitConfig;

    public static $alias = 'scaffolding-module';

    public function alias()
    {
        return static::$alias;
    }

    /**
     * @return static
     */
    public static function instance()
    {
        return app(static::$alias);
    }

    public static function view(string $view, array $data = [])
    {
        return view(static::$alias . '::' . $view, $data);
    }
}
