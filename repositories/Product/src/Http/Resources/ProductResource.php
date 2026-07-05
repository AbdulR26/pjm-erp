<?php

namespace Qollam\Product\Http\Resources;

use Feature\Support\Resource;

class ProductResource extends Resource
{
    protected $keyAliases = [
        'id',
        'parent_id',
        'product_type_id',
        'product_status_id',
        'name',
        'slug',
        'sku',
        'price',
        'stock',
        'description'
    ];

    protected function transformData($model, array &$data)
    {
        $data['type'] = $model->type ? $model->type->name : null;
        $data['status'] = $model->status ? $model->status->name : null;
        $data['categories'] = $model->categories->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ];
        })->toArray();
        $data['images'] = $model->images->map(function ($img) {
            return [
                'id' => $img->id,
                'image_path' => $img->image_path,
                'url' => app(\App\Services\CloudflareR2Service::class)->url($img->image_path),
                'is_primary' => (bool)$img->is_primary,
                'order' => $img->order,
            ];
        })->toArray();
    }
}
