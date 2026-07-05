<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $table = 'product_categories';

    protected $fillable = ['parent_id', 'name', 'slug'];

    // Auto-generate slug on creating
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    // Get parent category
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    // Get child subcategories
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    // Get products in this category
    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'product_category_product',
            'product_category_id',
            'product_id'
        );
    }
}
