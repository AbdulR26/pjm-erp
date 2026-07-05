<?php

namespace Qollam\Product\Models;

use Illuminate\Database\Eloquent\Model;

class ProductStatus extends Model
{
    protected $table = 'product_statuses';

    protected $fillable = ['name', 'description'];

    public $timestamps = false;
}
