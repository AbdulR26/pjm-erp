<?php

namespace Feature\Eloquent;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class LimitTableScope implements Scope
{

    protected $limit = 0;

    public function __construct(int $value)
    {
        $this->limit = $value;
    }

    public function apply(Builder $builder, Model $model)
    {
        if($this->limit > 0) {
            $builder->limit($this->limit);
        }
    }
}