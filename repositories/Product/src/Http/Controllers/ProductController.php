<?php

namespace Qollam\Product\Http\Controllers;

use Illuminate\Routing\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use Qollam\Product\Models\Product;

class ProductController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new Product(),
            'title' => 'Product',
            'url' => 'admin/products',
            'prefix' => 'product',
            'hooks' => [
                // Custom redirect back to parent product page after saving variant
                'redirectTo' => function($scaffolding) {
                    $model = $scaffolding->getModel();
                    if ($model && $model->parent_id) {
                        $scaffolding->redirectPath(url("admin/products/{$model->parent_id}/edit"));
                    }
                }
            ]
        ]);

        // Eager load type and categories relationship to optimize index datatable queries
        $query = Product::with('type', 'status', 'categories');
        
        // Filter by parent_id if present in AJAX request (to load variants inside parent product page)
        if (request()->has('parent_id')) {
            $query->where('parent_id', request('parent_id'));
        }
        
        $this->scaffolding()->datatableSet('withQuery', $query);

        // Explicitly remove created_at, updated_at, and default action columns first
        $this->scaffolding()->datatableColumnUnset(['created_at', 'updated_at', 'action']);

        // Explicitly add custom columns in desired order
        $this->scaffolding()->datatableColumnSet('name', ['title' => 'Product Name']);
        $this->scaffolding()->datatableColumnSet('sku', ['title' => 'SKU']);

        // Add Categories column formatted with light primary badges
        $this->scaffolding()->datatableColumnSet('categories', [
            'title' => 'Categories',
            'orderable' => false,
            'searchable' => false,
            'formatter' => function ($model) {
                if ($model->categories->isEmpty()) {
                    return '<span class="text-muted small">-</span>';
                }
                
                $badges = [];
                foreach ($model->categories as $category) {
                    $badges[] = '<span class="badge badge-light-primary m-25" style="font-size: 11px; margin-right: 4px; display: inline-block;">' . e($category->name) . '</span>';
                }
                return implode('', $badges);
            }
        ]);
        
        $this->scaffolding()->datatableColumnSet('price', [
            'title' => 'Price',
            'formatter' => function ($model) {
                return 'Rp ' . number_format($model->price, 0, ',', '.');
            }
        ]);
        
        $this->scaffolding()->datatableColumnSet('stock', ['title' => 'Stock']);

        // Add Product Type column formatted with badge
        $this->scaffolding()->datatableColumnSet('product_type_id', [
            'title' => 'Type',
            'formatter' => function ($model) {
                $typeName = $model->type->name ?? '-';
                $badgeClass = 'primary';
                if ($typeName === 'configurable') {
                    $badgeClass = 'warning';
                } elseif ($typeName === 'variant') {
                    $badgeClass = 'info';
                }
                return '<span class="badge badge-light-' . $badgeClass . '">' . strtoupper($typeName) . '</span>';
            }
        ]);

        // Explicitly add action column back at the end
        $this->scaffolding()->datatableColumnSet('action', [
            'title' => 'Actions',
            'searchable' => false,
            'orderable' => false,
            'className' => 'text-center'
        ]);

        // Disable timestamps option in datatable config
        $this->scaffolding()->datatableSet('timestamp', false);
    }

    public function create(\Scaffolding\Requests\ScaffoldingRequest $request)
    {
        if ($request->isMethod('put')) {
            $slug = Product::generateUniqueSlug($request->name);
            $request->merge(['slug' => $slug]);
            return $this->save($request);
        }

        $product = new Product();
        
        // Pre-populate fields from query parameters (e.g. for variant creation redirect)
        if ($request->has('parent_id')) {
            $product->parent_id = $request->parent_id;
        }
        if ($request->has('product_type_id')) {
            $product->product_type_id = $request->product_type_id;
        }

        $title = 'Add Product';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/products'), 'name' => "Products"],
            ['name' => "Add"],
        ];

        $types = \Qollam\Product\Models\ProductType::all();
        $statuses = \Qollam\Product\Models\ProductStatus::all();
        $parents = \Qollam\Product\Models\Product::whereHas('type', function ($q) {
            $q->where('name', 'configurable');
        })->get();
        
        return view('product-module::form', get_defined_vars());
    }

    public function edit(\Scaffolding\Requests\ScaffoldingRequest $request, $id)
    {
        $product = Product::with('variants.status', 'variants.type')->findOrFail($id);
        
        $this->setConfig([
            'model' => $product,
        ]);

        if ($request->isMethod('patch')) {
            $slug = Product::generateUniqueSlug($request->name, $product->id);
            $request->merge(['slug' => $slug]);
            return $this->save($request);
        }

        $title = 'Edit Product';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/products'), 'name' => "Products"],
            ['name' => "Edit"],
        ];

        $types = \Qollam\Product\Models\ProductType::all();
        $statuses = \Qollam\Product\Models\ProductStatus::all();
        $parents = \Qollam\Product\Models\Product::whereHas('type', function ($q) {
            $q->where('name', 'configurable');
        })->where('id', '!=', $product->id)->get();

        return view('product-module::form', get_defined_vars());
    }

    /**
     * Sync categories for a product (called via AJAX from product form).
     */
    public function syncCategories(\Illuminate\Http\Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $categoryIds = $request->input('category_ids', []);
        $product->categories()->sync($categoryIds);

        return response()->json(['success' => true, 'message' => 'Categories saved.']);
    }

    /**
     * Get selected category IDs for a product.
     */
    public function getCategories($id)
    {
        $product = Product::with('categories')->findOrFail($id);
        return response()->json($product->categories->pluck('id'));
    }

    /**
     * Get list of images for a product.
     */
    public function getImages($id)
    {
        $product = Product::findOrFail($id);
        $images = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
            ->orderBy('order', 'asc')
            ->get();

        $data = $images->map(function ($img) {
            return [
                'id'         => $img->id,
                'image_path' => $img->image_path,
                'url'        => app(\App\Services\CloudflareR2Service::class)->url($img->image_path),
                'is_primary' => $img->is_primary,
                'order'      => $img->order,
            ];
        });

        return response()->json($data);
    }

    /**
     * Upload an image for a product.
     */
    public function uploadImage(\Illuminate\Http\Request $request, $id)
    {
        $product = Product::findOrFail($id);

        if (!$request->hasFile('file')) {
            return response()->json(['success' => false, 'message' => 'No file uploaded.'], 400);
        }

        $file = $request->file('file');
        
        // Save to Cloudflare R2 disk under product/{product-name-slug} folder
        $folderName = 'product/' . \Illuminate\Support\Str::slug($product->name);
        
        // Use CloudflareR2Service to upload
        $path = app(\App\Services\CloudflareR2Service::class)->upload($file, $folderName);

        // Determine order and if it should be primary (if no images exist yet)
        $hasImages = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)->exists();
        $maxOrder = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)->max('order') ?? 0;

        $image = \Qollam\Product\Models\ProductImage::create([
            'product_id' => $product->id,
            'image_path' => $path,
            'is_primary' => !$hasImages, // Set as primary if it's the first image
            'order'      => $maxOrder + 1,
        ]);

        return response()->json([
            'success' => true,
            'image'   => [
                'id'         => $image->id,
                'url'        => app(\App\Services\CloudflareR2Service::class)->url($image->image_path),
                'is_primary' => $image->is_primary,
                'order'      => $image->order,
            ]
        ]);
    }

    /**
     * Reorder product images.
     */
    public function reorderImages(\Illuminate\Http\Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $orders = $request->input('orders', []); // Array of image IDs

        foreach ($orders as $index => $imageId) {
            \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
                ->where('id', $imageId)
                ->update(['order' => $index + 1]);
        }

        return response()->json(['success' => true, 'message' => 'Image order updated.']);
    }

    /**
     * Set a primary image for a product.
     */
    public function setPrimaryImage(\Illuminate\Http\Request $request, $id, $imageId)
    {
        $product = Product::findOrFail($id);

        // Reset all images of this product to not primary
        \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
            ->update(['is_primary' => false]);

        // Set selected image as primary
        \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
            ->where('id', $imageId)
            ->update(['is_primary' => true]);

        return response()->json(['success' => true, 'message' => 'Primary image updated.']);
    }

    /**
     * Destroy a product image.
     */
    public function destroyImage($id, $imageId)
    {
        $product = Product::findOrFail($id);
        $image = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
            ->where('id', $imageId)
            ->firstOrFail();

        app(\App\Services\CloudflareR2Service::class)->delete($image->image_path);

        $image->delete();
        if ($image->is_primary) {
            $nextImage = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
                ->orderBy('order', 'asc')
                ->first();
            if ($nextImage) {
                $nextImage->update(['is_primary' => true]);
            }
        }

        return response()->json(['success' => true, 'message' => 'Image deleted.']);
    }

    /**
     * Get list of all attributes and values, marking which values are assigned to the product.
     */
    public function getAttributes($id)
    {
        $product = Product::with('attributeValues')->findOrFail($id);
        $selectedIds = $product->attributeValues->pluck('id')->toArray();

        $attributes = \Qollam\Product\Models\Attribute::with('values')->orderBy('name')->get();

        $data = $attributes->map(function ($attr) use ($selectedIds) {
            return [
                'id'     => $attr->id,
                'name'   => $attr->name,
                'values' => $attr->values->map(function ($val) use ($selectedIds) {
                    return [
                        'id'       => $val->id,
                        'value'    => $val->value,
                        'selected' => in_array($val->id, $selectedIds),
                    ];
                }),
            ];
        });

        return response()->json($data);
    }

    /**
     * Sync attribute values for a product.
     */
    public function syncAttributes(\Illuminate\Http\Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $valueIds = $request->input('attribute_value_ids', []);

        $product->attributeValues()->sync($valueIds);

        return response()->json(['success' => true, 'message' => 'Attributes saved.']);
    }

    /**
     * Store a new attribute globally.
     */
    public function storeAttribute(\Illuminate\Http\Request $request)
    {
        $name = trim($request->input('name', ''));
        if (!$name) {
            return response()->json(['success' => false, 'message' => 'Attribute name is required.'], 422);
        }

        $attr = \Qollam\Product\Models\Attribute::create([
            'name' => $name,
        ]);

        return response()->json([
            'success'   => true,
            'attribute' => [
                'id'     => $attr->id,
                'name'   => $attr->name,
                'values' => [],
            ]
        ]);
    }

    /**
     * Store a new value for a specific attribute.
     */
    public function storeAttributeValue(\Illuminate\Http\Request $request, $attributeId)
    {
        $value = trim($request->input('value', ''));
        if (!$value) {
            return response()->json(['success' => false, 'message' => 'Value name is required.'], 422);
        }

        $attr = \Qollam\Product\Models\Attribute::findOrFail($attributeId);

        $val = \Qollam\Product\Models\AttributeValue::create([
            'attribute_id' => $attr->id,
            'value'        => $value,
        ]);

        return response()->json([
            'success' => true,
            'value'   => [
                'id'    => $val->id,
                'value' => $val->value,
            ]
        ]);
    }

    /**
     * Get stock mutations history list for a product.
     */
    public function getMutations($id)
    {
        $product = Product::findOrFail($id);
        $mutations = $product->stockMutations()
            ->select(['id', 'type', 'quantity', 'reference_type', 'notes', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($mutations);
    }

    /**
     * Perform stock mutation adjustment (in/out) and record mutation.
     */
    public function adjustStock(\Illuminate\Http\Request $request, $id)
    {
        $request->validate([
            'type'     => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'notes'    => 'nullable|string',
        ]);

        $product = Product::findOrFail($id);
        $type = $request->input('type');
        $qty = (int) $request->input('quantity');
        $notes = trim($request->input('notes', ''));

        $newStock = $product->stock;
        if ($type === 'in') {
            $newStock += $qty;
        } else {
            $newStock -= $qty;
            if ($newStock < 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock for this adjustment. Current stock is ' . $product->stock . '.'
                ], 422);
            }
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($product, $type, $qty, $notes, $newStock) {
            $product->update(['stock' => $newStock]);
            
            $product->stockMutations()->create([
                'type'           => $type,
                'quantity'       => $qty,
                'reference_type' => 'adjustment',
                'reference_id'   => null,
                'notes'          => $notes,
            ]);
        });

        return response()->json([
            'success'  => true,
            'message'  => 'Stock adjusted successfully.',
            'new_stock'=> $newStock
        ]);
    }

    /**
     * Save product discount and flash sale settings.
     */
    public function saveDiscount(\Illuminate\Http\Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'discount_percent' => 'nullable|integer|min:0|max:100',
            'is_flash_sale' => 'nullable|boolean',
            'flash_sale_price' => 'nullable|numeric|min:0',
            'flash_sale_stock' => 'nullable|integer|min:0',
            'flash_sale_start' => 'nullable|date',
            'flash_sale_end' => 'nullable|date',
        ]);

        $validated['is_flash_sale'] = $request->has('is_flash_sale') ? 1 : 0;

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Discount settings saved successfully.'
        ]);
    }
}
