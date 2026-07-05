<?php

namespace Qollam\Product\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeValue extends Model
{
    protected $table = 'attribute_values';

    protected $fillable = [
        'attribute_id',
        'value',
    ];

    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'attribute_id');
    }

    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'product_attribute_value',
            'attribute_value_id',
            'product_id'
        );
    }
}
