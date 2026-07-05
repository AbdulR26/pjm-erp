<?php

namespace Feature;

use Feature\Support\Module;
use Feature\Traits\SchemaTable;

class Feature extends Module
{
    use SchemaTable;

    public static $alias = 'Feature';

    public static $configKey = 'Feature';

    public function __construct($config = [])
    {
        $this->setBasePath(preg_replace('/src$/i', '', __DIR__));
    }

}