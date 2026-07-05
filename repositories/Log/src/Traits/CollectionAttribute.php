<?php

namespace Qollam\Log\Traits;

use Illuminate\Support\Collection;

trait CollectionAttribute
{
    public function getBeforeAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }

    public function getAfterAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }

    public function getDirtyAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }

    public function getParameterAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }

    public function getResponseAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }

    public function getDataAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }

    public function getErrorsAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }

    public function getHeadersAttribute($value)
    {
        return Collection::make(json_decode($value, true));
    }
}