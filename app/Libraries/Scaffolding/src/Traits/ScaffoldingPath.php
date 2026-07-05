<?php

namespace Scaffolding\Traits;

trait ScaffoldingPath
{
    protected $basePath;

    protected $resourcePath;

    public function setBasePath($path)
    {
        $this->basePath = rtrim($path, '\/');

        $this->resourcePath = $this->basePath . DIRECTORY_SEPARATOR . 'resources';

        return $this;
    }

    public function basePath($path = '')
    {
        return $this->basePath . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }

    public function resourcePath($path = '')
    {
        return $this->resourcePath . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }

}