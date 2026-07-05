<?php

namespace Qollam\Product\Models;

use Illuminate\Database\Eloquent\Model;
use Scaffolding\Traits\ScaffoldingModel;

class Product extends Model
{
    use ScaffoldingModel {
        initializeScaffoldingModel as parentInitialize;
    }

    protected $table = 'products';

    protected $fillable = [
        'parent_id',
        'product_type_id',
        'product_status_id',
        'name',
        'slug',
        'sku',
        'price',
        'stock',
        'description',
        'discount_percent',
        'is_flash_sale',
        'flash_sale_price',
        'flash_sale_stock',
        'flash_sale_start',
        'flash_sale_end',
        'weight'
    ];

    /**
     * Boot the scaffolding model and customize fields.
     */
    public function initializeScaffoldingModel()
    {
        $this->parentInitialize();

        // Make slug and optional fields not required in scaffolding validation/forms
        $this->fieldSet('slug', ['required' => false]);
        $this->fieldSet('sku', ['required' => false]);
        $this->fieldSet('parent_id', ['required' => false]);
        $this->fieldSet('price', ['required' => false]);
        $this->fieldSet('stock', ['required' => false]);
        $this->fieldSet('description', ['required' => false]);
        $this->fieldSet('discount_percent', ['required' => false]);
        $this->fieldSet('is_flash_sale', ['required' => false]);
        $this->fieldSet('flash_sale_price', ['required' => false]);
        $this->fieldSet('flash_sale_stock', ['required' => false]);
        $this->fieldSet('flash_sale_start', ['required' => false]);
        $this->fieldSet('flash_sale_end', ['required' => false]);
        $this->fieldSet('weight', ['required' => false]);
    }

    public static function generateUniqueSlug($name, $excludeId = null)
    {
        $slug = \Illuminate\Support\Str::slug($name);
        $originalSlug = $slug;

        $count = 1;
        while (static::where('slug', $slug)->when($excludeId, function ($query, $id) {
            return $query->where('id', '!=', $id);
        })->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }

    /**
     * Relations
     */
    public function type()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id');
    }

    public function status()
    {
        return $this->belongsTo(ProductStatus::class, 'product_status_id');
    }

    public function parent()
    {
        return $this->belongsTo(Product::class, 'parent_id');
    }

    public function variants()
    {
        return $this->hasMany(Product::class, 'parent_id');
    }

    public function categories()
    {
        return $this->belongsToMany(
            ProductCategory::class,
            'product_category_product',
            'product_id',
            'product_category_id'
        );
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('order', 'asc');
    }

    public function attributeValues()
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_attribute_value',
            'product_id',
            'attribute_value_id'
        );
    }

    public function stockMutations()
    {
        return $this->hasMany(StockMutation::class, 'product_id')->orderBy('created_at', 'desc');
    }
}
