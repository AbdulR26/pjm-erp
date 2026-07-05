<?php

namespace Scaffolding\Helpers;

class ScaffoldingHelper
{
    protected static $basePath;

    protected static $resourcePath;

    public static function setBasePath($path)
    {
        self::$basePath = rtrim($path, '\/');

        self::$resourcePath = self::$basePath . DIRECTORY_SEPARATOR . 'resources';
    }

    public function basePath($path = '')
    {
        return self::$basePath . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }

    public function resourcePath($path = '')
    {
        return self::$resourcePath . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }
}