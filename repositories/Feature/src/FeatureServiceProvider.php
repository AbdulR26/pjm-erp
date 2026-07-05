<?php

namespace Feature;

use Feature\Support\ServiceProvider;

class FeatureServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->init(new Feature());
        require_once(Feature::instance()->basePath('src/Foundation/helpers.php'));
    }
}