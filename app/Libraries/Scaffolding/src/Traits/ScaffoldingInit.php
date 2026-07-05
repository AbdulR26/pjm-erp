<?php

namespace Scaffolding\Traits;

trait ScaffoldingInit
{
    /**
     * @return \Scaffolding\Scaffolding
     */
    private function scaffolding()
    {
        return app('scaffolding');
    }
}