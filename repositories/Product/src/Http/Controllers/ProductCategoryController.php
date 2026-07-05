<?php

namespace Qollam\Product\Http\Controllers;

use Illuminate\Routing\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use Scaffolding\Requests\ScaffoldingRequest as Request;
use Qollam\Product\Models\ProductCategory;
use Illuminate\Support\Str;

class ProductCategoryController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model'  => new ProductCategory(),
            'title'  => 'Product Category',
            'url'    => 'admin/product-categories',
            'prefix' => 'product-category',
        ]);

        // Eager load parent to optimize query on the index page
        $query = ProductCategory::with('parent');
        $this->scaffolding()->datatableSet('withQuery', $query);
        $this->scaffolding()->datatableSet('timestamp', false);
        $this->scaffolding()->datatableColumnUnset(['id', 'created_at', 'updated_at', 'action']);
        
        $this->scaffolding()->datatableColumnSet('name', ['title' => 'Category Name']);

        // Add Parent Category Column
        $this->scaffolding()->datatableColumnSet('parent_id', [
            'title'     => 'Parent Category',
            'formatter' => function ($model) {
                return $model->parent ? $model->parent->name : '<span class="text-muted">-</span>';
            },
        ]);

        $this->scaffolding()->datatableColumnSet('status', [
            'title'     => 'Status',
            'formatter' => function ($model) {
                return $model->status == 1
                    ? '<span class="badge badge-success">Active</span>'
                    : '<span class="badge badge-secondary">Inactive</span>';
            },
        ]);

        $this->scaffolding()->datatableColumnSet('action', [
            'title'     => 'Actions',
            'className' => 'text-center',
            'width'     => '120px',
            'orderable' => false,
            'searchable'=> false,
        ]);
    }

    /**
     * Return all active categories as jsTree-compatible JSON.
     */
    public function apiList()
    {
        $categories = ProductCategory::where('status', 1)->orderBy('name')->get();
        $activeIds = $categories->pluck('id')->toArray();

        $nodes = $categories->map(function ($cat) use ($activeIds) {
            $hasParent = $cat->parent_id && in_array($cat->parent_id, $activeIds);
            return [
                'id'     => (string) $cat->id,
                'parent' => $hasParent ? (string) $cat->parent_id : '#',
                'text'   => $cat->name,
                'icon'   => 'feather icon-tag',
            ];
        });

        return response()->json($nodes);
    }

    /**
     * Create a new category inline from product form.
     */
    public function apiStore(Request $request)
    {
        $name = trim($request->input('name', ''));
        if (!$name) {
            return response()->json(['success' => false, 'message' => 'Name is required.'], 422);
        }

        $parentId = $request->input('parent_id');
        if ($parentId && !ProductCategory::where('id', $parentId)->exists()) {
            $parentId = null;
        }

        $category = ProductCategory::create([
            'name'      => $name,
            'parent_id' => $parentId,
            'status'    => 1,
        ]);

        return response()->json([
            'success'  => true,
            'category' => [
                'id'     => (string) $category->id,
                'parent' => $category->parent_id ? (string) $category->parent_id : '#',
                'text'   => $category->name,
                'icon'   => 'feather icon-tag',
            ],
        ]);
    }
}
