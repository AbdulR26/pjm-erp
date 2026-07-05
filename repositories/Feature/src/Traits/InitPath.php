<?php

namespace Feature\Traits;

trait InitPath
{
    protected $basePath;

    protected $resourcePath;

    protected $configPath;

    protected $databasePath;

    public function setBasePath($path)
    {
        $this->basePath = rtrim($path, '\/');

        $this->resourcePath = $this->basePath . DIRECTORY_SEPARATOR . 'resources';

        $this->configPath = $this->basePath . DIRECTORY_SEPARATOR . 'config';

        $this->databasePath = $this->basePath . DIRECTORY_SEPARATOR . 'database';

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

    public function configPath($path = '')
    {
        return $this->configPath . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }

    public function databasePath($path = '')
    {
        return $this->databasePath . ($path ? DIRECTORY_SEPARATOR . $path : $path);
    }

}