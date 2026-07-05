<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

trait Query
{
    public function compile_query($model)
    {
        return $model->toSql();
    }
}