<?php

namespace Qollam\Product\Models;

use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    protected $table = 'product_types';

    protected $fillable = ['name', 'description'];

    public $timestamps = false;
}
