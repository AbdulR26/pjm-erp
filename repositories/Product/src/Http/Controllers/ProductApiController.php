<?php

namespace Qollam\Product\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Qollam\Product\Models\Product;
use Qollam\Product\Http\Resources\ProductResource;
use Qollam\Product\Http\Resources\ProductResourceCollection;

class ProductApiController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request)
    {
        return ProductResource::render(function () use ($request) {
            $query = Product::with(['type', 'status', 'categories', 'images']);
            if ($request->has('type')) {
                $query->whereHas('type', function ($q) use ($request) {
                    $q->where('name', $request->type);
                });
            }
            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('sku', 'like', '%' . $request->search . '%');
                });
            }
            $products = $query->paginate($request->input('limit', 15));
            return new ProductResourceCollection($products);
        });
    }

    public function show($id)
    {
        return ProductResource::render(function () use ($id) {
            $product = Product::with(['type', 'status', 'categories', 'images', 'variants'])->findOrFail($id);
            return new ProductResource($product);
        });
    }

    
    public function store(Request $request)
    {
        return ProductResource::render(function () use ($request) {
            $request->validate([
                'name' => 'required|string|max:255',
                'product_type_id' => 'required|exists:product_types,id',
                'product_status_id' => 'required|exists:product_statuses,id',
                'sku' => 'required|string|unique:products,sku',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'description' => 'nullable|string',
            ]);

            $slug = Product::generateUniqueSlug($request->name);
            $data = $request->all();
            $data['slug'] = $slug;

            $product = Product::create($data);

            if ($request->has('category_ids')) {
                $product->categories()->sync($request->category_ids);
            }

            return new ProductResource($product->load(['type', 'status', 'categories', 'images']));
        });
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, $id)
    {
        return ProductResource::render(function () use ($request, $id) {
            $product = Product::findOrFail($id);

            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'product_type_id' => 'sometimes|required|exists:product_types,id',
                'product_status_id' => 'sometimes|required|exists:product_statuses,id',
                'sku' => 'sometimes|required|string|unique:products,sku,' . $product->id,
                'price' => 'sometimes|required|numeric|min:0',
                'stock' => 'sometimes|required|integer|min:0',
                'description' => 'nullable|string',
            ]);

            $data = $request->all();
            if ($request->has('name')) {
                $data['slug'] = Product::generateUniqueSlug($request->name, $product->id);
            }

            $product->update($data);

            if ($request->has('category_ids')) {
                $product->categories()->sync($request->category_ids);
            }

            return new ProductResource($product->load(['type', 'status', 'categories', 'images']));
        });
    }

    
    public function destroy($id)
    {
        return ProductResource::render(function () use ($id) {
            $product = Product::findOrFail($id);
            $product->delete();
            return response()->json(['success' => true, 'message' => 'Product deleted successfully.']);
        });
    }

    public function getImages($id)
    {
        return ProductResource::render(function () use ($id) {
            $product = Product::findOrFail($id);
            $images = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
                ->orderBy('order', 'asc')
                ->get()
                ->map(function ($img) {
                    return [
                        'id'         => $img->id,
                        'image_path' => $img->image_path,
                        'url'        => app(\App\Services\CloudflareR2Service::class)->url($img->image_path),
                        'is_primary' => (bool)$img->is_primary,
                        'order'      => $img->order,
                    ];
                });
            return response()->json($images);
        });
    }

    public function uploadImage(Request $request, $id)
    {
        return ProductResource::render(function () use ($request, $id) {
            $product = Product::findOrFail($id);

            if (!$request->hasFile('file')) {
                return response()->json(['success' => false, 'message' => 'No file uploaded.'], 400);
            }

            $file = $request->file('file');
            $folderName = 'product/' . \Illuminate\Support\Str::slug($product->name);
            $path = app(\App\Services\CloudflareR2Service::class)->upload($file, $folderName);

            $hasImages = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)->exists();
            $maxOrder = \Qollam\Product\Models\ProductImage::where('product_id', $product->id)->max('order') ?? 0;

            $image = \Qollam\Product\Models\ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $path,
                'is_primary' => !$hasImages,
                'order'      => $maxOrder + 1,
            ]);

            return response()->json([
                'success' => true,
                'image'   => [
                    'id'         => $image->id,
                    'url'        => app(\App\Services\CloudflareR2Service::class)->url($image->image_path),
                    'is_primary' => (bool)$image->is_primary,
                    'order'      => $image->order,
                ]
            ]);
        });
    }

    public function reorderImages(Request $request, $id)
    {
        return ProductResource::render(function () use ($request, $id) {
            $product = Product::findOrFail($id);
            $orders = $request->input('orders', []);

            foreach ($orders as $index => $imageId) {
                \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
                    ->where('id', $imageId)
                    ->update(['order' => $index + 1]);
            }

            return response()->json(['success' => true, 'message' => 'Image order updated.']);
        });
    }

    public function setPrimaryImage(Request $request, $id, $imageId)
    {
        return ProductResource::render(function () use ($id, $imageId) {
            $product = Product::findOrFail($id);

            \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
                ->update(['is_primary' => false]);

            \Qollam\Product\Models\ProductImage::where('product_id', $product->id)
                ->where('id', $imageId)
                ->update(['is_primary' => true]);

            return response()->json(['success' => true, 'message' => 'Primary image updated.']);
        });
    }

    public function destroyImage($id, $imageId)
    {
        return ProductResource::render(function () use ($id, $imageId) {
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
        });
    }
    public function getCategories($id)
    {
        return ProductResource::render(function () use ($id) {
            $product = Product::with('categories')->findOrFail($id);
            return response()->json($product->categories->pluck('id'));
        });
    }

    public function syncCategories(Request $request, $id)
    {
        return ProductResource::render(function () use ($request, $id) {
            $product = Product::findOrFail($id);
            $categoryIds = $request->input('category_ids', []);
            $product->categories()->sync($categoryIds);
            return response()->json(['success' => true, 'message' => 'Categories synced.']);
        });
    }
    public function getAttributes($id)
    {
        return ProductResource::render(function () use ($id) {
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
        });
    }

    public function syncAttributes(Request $request, $id)
    {
        return ProductResource::render(function () use ($request, $id) {
            $product = Product::findOrFail($id);
            $valueIds = $request->input('attribute_value_ids', []);
            $product->attributeValues()->sync($valueIds);
            return response()->json(['success' => true, 'message' => 'Attributes saved.']);
        });
    }

    public function storeAttribute(Request $request)
    {
        return ProductResource::render(function () use ($request) {
            $name = trim($request->input('name', ''));
            if (!$name) {
                return response()->json(['success' => false, 'message' => 'Attribute name is required.'], 422);
            }
            $attr = \Qollam\Product\Models\Attribute::create(['name' => $name]);
            return response()->json([
                'success'   => true,
                'attribute' => [
                    'id'     => $attr->id,
                    'name'   => $attr->name,
                    'values' => [],
                ]
            ]);
        });
    }
    public function storeAttributeValue(Request $request, $attributeId)
    {
        return ProductResource::render(function () use ($request, $attributeId) {
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
        });
    }
    public function getMutations($id)
    {
        return ProductResource::render(function () use ($id) {
            $product = Product::findOrFail($id);
            $mutations = $product->stockMutations()
                ->select(['id', 'type', 'quantity', 'reference_type', 'notes', 'created_at'])
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($mutations);
        });
    }
    public function adjustStock(Request $request, $id)
    {
        return ProductResource::render(function () use ($request, $id) {
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
        });
    }

    public function allCategories()
    {
        return ProductResource::render(function () {
            $categories = \Qollam\Product\Models\ProductCategory::where('status', 1)->orderBy('name')->get();
            return response()->json([
                'status'     => 'success',
                'categories' => $categories->map(function ($cat) {
                    return [
                        'id'        => $cat->id,
                        'name'      => $cat->name,
                        'parent_id' => $cat->parent_id,
                    ];
                }),
            ]);
        });
    }
}
