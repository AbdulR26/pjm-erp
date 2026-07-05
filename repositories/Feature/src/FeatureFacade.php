<?php

namespace Feature;

use Illuminate\Support\Facades\Facade;

class FeatureFacade extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'Feature';
    }
}