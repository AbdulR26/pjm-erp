<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'name', 'base_price', 'stock', 'sku'];

    protected $casts = [
        'base_price' => 'float',
        'stock' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function prices()
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function mutations()
    {
        return $this->hasMany(StockMutation::class)->orderBy('created_at', 'desc');
    }
}
