<?php

namespace Qollam\Product\Models;

use Illuminate\Database\Eloquent\Model;
use Scaffolding\Traits\ScaffoldingModel;

class ProductCategory extends Model
{
    use ScaffoldingModel {
        initializeScaffoldingModel as parentInitialize;
    }

    protected $table = 'product_categories';

    protected $fillable = [
        'parent_id',
        'name',
        'status',
    ];

    public function initializeScaffoldingModel()
    {
        $this->parentInitialize();

        // Get parent options, excluding self to avoid self-reference loops
        $options = ['' => '-- None --'] + self::when($this->exists, function($query) {
            return $query->where('id', '!=', $this->id);
        })->orderBy('name')->pluck('name', 'id')->toArray();

        $this->fieldSet('parent_id', [
            'label'    => 'Parent Category',
            'required' => false,
            'type'     => 'select',
            'options'  => $options,
        ]);

        $this->fieldSet('status', [
            'required' => false,
            'type'     => 'select',
            'options'  => [
                1 => 'Active',
                0 => 'Inactive',
            ],
        ]);
    }

    public function parent()
    {
        return $this->belongsTo(ProductCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ProductCategory::class, 'parent_id');
    }

    public function products()
    {
        return $this->belongsToMany(
            \Qollam\Product\Models\Product::class,
            'product_category_product',
            'product_category_id',
            'product_id'
        );
    }
}
