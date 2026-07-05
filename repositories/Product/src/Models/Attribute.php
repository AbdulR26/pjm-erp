<?php

namespace Qollam\Product\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $table = 'attributes';

    protected $fillable = [
        'name',
    ];

    public function values()
    {
        return $this->hasMany(AttributeValue::class, 'attribute_id')->orderBy('value');
    }
}
