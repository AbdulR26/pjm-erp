<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'main_image',
        'badge',
        'rating',
        'sold_count',
        'is_flash_sale',
        'flash_sale_stock',
        'discount_percent',
        'flash_sale_price',
        'flash_sale_start',
        'flash_sale_end',
        'attributes',
        'weight'
    ];

    protected $casts = [
        'attributes' => 'array',
        'is_flash_sale' => 'boolean',
        'rating' => 'float',
        'discount_percent' => 'integer',
        'flash_sale_price' => 'float',
        'flash_sale_start' => 'datetime',
        'flash_sale_end' => 'datetime',
        'weight' => 'integer',
    ];

    protected $appends = ['main_image'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name) . '-' . uniqid();
            }
        });
    }

    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'product_category_product',
            'product_id',
            'product_category_id'
        );
    }

    public function parent()
    {
        return $this->belongsTo(Product::class, 'parent_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants()
    {
        return $this->hasMany(Product::class, 'parent_id');
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(
            \Qollam\Product\Models\AttributeValue::class,
            'product_attribute_value',
            'product_id',
            'attribute_value_id'
        )->with('attribute');
    }

    public function getMainImageAttribute()
    {
        $primary = $this->images()->where('is_primary', true)->first();
        $path = $primary ? $primary->image_path : ($this->images()->first() ? $this->images()->first()->image_path : null);

        if ($path) {
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }
            return app(\App\Services\CloudflareR2Service::class)->url($path);
        }
        return null;
    }

    public function stockMutations()
    {
        return $this->hasMany(StockMutation::class, 'product_id');
    }
}
