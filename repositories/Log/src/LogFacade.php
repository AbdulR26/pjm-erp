<?php

namespace Qollam\Log;

use Illuminate\Support\Facades\Facade;

class LogFacade extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return LogModule::$alias;
    }
}