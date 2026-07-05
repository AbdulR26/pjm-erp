<?php

namespace Scaffolding;

use Illuminate\Support\Facades\Facade;

class ScaffoldingFacade extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'scaffolding';
    }
}