<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\ProductPrice;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['category.parent.parent', 'images', 'variants.prices', 'variants.mutations.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedProducts = $products->map(function ($product) {
            // Build category breadcrumb path
            $categoryPath = [];
            if ($product->category) {
                $categoryPath = $this->getCategoryPath($product->category);
            }

            // Flatten all prices and mutations for variants
            $prices = [];
            $mutations = [];

            foreach ($product->variants as $variant) {
                foreach ($variant->prices as $price) {
                    $prices[] = [
                        'id' => $price->id,
                        'variant_id' => $price->product_variant_id,
                        'level' => $price->level,
                        'min_qty' => $price->min_qty,
                        'price' => (float) $price->price
                    ];
                }

                foreach ($variant->mutations as $mutation) {
                    $mutations[] = [
                        'id' => $mutation->id,
                        'variant_id' => $mutation->product_variant_id,
                        'type' => $mutation->type,
                        'quantity' => $mutation->quantity,
                        'source' => $mutation->source,
                        'notes' => $mutation->notes,
                        'user' => $mutation->user ? $mutation->user->name : 'System',
                        'created_at' => $mutation->created_at->format('Y-m-d H:i')
                    ];
                }
            }

            // Sort mutations by date descending (newest first)
            usort($mutations, function ($a, $b) {
                return strcmp($b['created_at'], $a['created_at']);
            });

            return [
                'id' => $product->id,
                'name' => $product->name,
                'category_id' => $product->category_id,
                'category_path' => $categoryPath,
                'description' => $product->description,
                'main_image' => $product->main_image,
                'gallery_images' => $product->images->pluck('image_path')->toArray(),
                'badge' => $product->badge,
                'rating' => (float) $product->rating,
                'sold_count' => $product->sold_count,
                'is_flash_sale' => (bool) $product->is_flash_sale,
                'flash_sale_stock' => $product->flash_sale_stock,
                'attributes' => $product->attributes ?: new \stdClass(),
                'variants' => $product->variants->map(function ($v) {
                    return [
                        'id' => $v->id,
                        'name' => $v->name,
                        'base_price' => (float) $v->base_price,
                        'stock' => $v->stock,
                        'sku' => $v->sku
                    ];
                })->toArray(),
                'prices' => $prices,
                'stock_mutations' => $mutations
            ];
        });

        return response()->json([
            'status' => 'success',
            'products' => $formattedProducts
        ]);
    }

    /**
     * Get Category Tree View
     */
    public function categories()
    {
        // Fetch nested categories
        $rootCategories = Category::whereNull('parent_id')
            ->with(['children.children'])
            ->get();

        // Recursively format to match React Tree View (id, name, isParent, children)
        $formatted = $rootCategories->map(function ($cat) {
            return $this->formatCategoryTreeNode($cat);
        });

        return response()->json([
            'status' => 'success',
            'categories' => $formatted
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'main_image' => 'nullable|string',
            'badge' => 'nullable|string|max:50',
            'attributes' => 'nullable|array',
            'variants' => 'required|array|min:1',
            'variants.*.name' => 'required|string|max:255',
            'variants.*.base_price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'required|string|unique:product_variants,sku',
            'prices' => 'nullable|array',
            'prices.*.variant_index' => 'nullable|integer', // maps index in variants array
            'prices.*.variant_sku' => 'nullable|string',   // maps sku
            'prices.*.level' => 'required|string|in:retail,bengkel,reseller',
            'prices.*.min_qty' => 'required|integer|min:1',
            'prices.*.price' => 'required|numeric|min:0',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'required|string'
        ]);

        $userId = Auth::id() ?: 1;

        $product = DB::transaction(function () use ($validated, $userId) {
            // 1. Create product
            $product = Product::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']) . '-' . uniqid(),
                'description' => $validated['description'] ?? null,
                'main_image' => $validated['main_image'] ?? null,
                'badge' => $validated['badge'] ?? null,
                'rating' => 5.0,
                'sold_count' => 0,
                'attributes' => $validated['attributes'] ?? []
            ]);

            // 2. Create Gallery Images
            if (!empty($validated['gallery_images'])) {
                foreach ($validated['gallery_images'] as $url) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $url
                    ]);
                }
            }

            // 3. Create variants
            $skuToVariantId = [];
            foreach ($validated['variants'] as $idx => $vData) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => $vData['name'],
                    'base_price' => $vData['base_price'],
                    'stock' => $vData['stock'],
                    'sku' => $vData['sku']
                ]);
                $skuToVariantId[$vData['sku']] = $variant->id;

                // Log initial stock as mutation if stock > 0
                if ($vData['stock'] > 0) {
                    StockMutation::create([
                        'product_variant_id' => $variant->id,
                        'user_id' => $userId,
                        'type' => 'in',
                        'quantity' => $vData['stock'],
                        'source' => 'adjustment',
                        'notes' => 'Saldo stok awal pembukaan produk'
                    ]);
                }
            }

            // 4. Create multi prices
            if (!empty($validated['prices'])) {
                foreach ($validated['prices'] as $pData) {
                    $variantId = null;
                    if (isset($pData['variant_sku']) && isset($skuToVariantId[$pData['variant_sku']])) {
                        $variantId = $skuToVariantId[$pData['variant_sku']];
                    } elseif (isset($pData['variant_index'])) {
                        // Map index to generated variant
                        $skuList = array_keys($skuToVariantId);
                        $targetSku = $skuList[$pData['variant_index']] ?? null;
                        if ($targetSku) {
                            $variantId = $skuToVariantId[$targetSku];
                        }
                    }

                    if ($variantId) {
                        ProductPrice::create([
                            'product_variant_id' => $variantId,
                            'level' => $pData['level'],
                            'min_qty' => $pData['min_qty'],
                            'price' => $pData['price']
                        ]);
                    }
                }
            }

            return $product;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Produk baru berhasil ditambahkan.',
            'product_id' => $product->id
        ]);
    }

    /**
     * Update specified product.
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'main_image' => 'nullable|string',
            'badge' => 'nullable|string|max:50',
            'attributes' => 'nullable|array',
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|integer', // variant ID if already exists
            'variants.*.name' => 'required|string|max:255',
            'variants.*.base_price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.sku' => 'required|string',
            'prices' => 'nullable|array',
            'prices.*.id' => 'nullable|integer',
            'prices.*.variant_id' => 'nullable|integer',
            'prices.*.variant_sku' => 'nullable|string',
            'prices.*.level' => 'required|string|in:retail,bengkel,reseller',
            'prices.*.min_qty' => 'required|integer|min:1',
            'prices.*.price' => 'required|numeric|min:0',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'required|string'
        ]);

        $userId = Auth::id() ?: 1;

        DB::transaction(function () use ($product, $validated, $userId) {
            // 1. Update Product Details
            $product->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'main_image' => $validated['main_image'] ?? null,
                'badge' => $validated['badge'] ?? null,
                'attributes' => $validated['attributes'] ?? []
            ]);

            // 2. Sync Gallery Images
            // Delete existing ones
            $product->images()->delete();
            // Re-insert new ones
            if (!empty($validated['gallery_images'])) {
                foreach ($validated['gallery_images'] as $url) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $url
                    ]);
                }
            }

            // 3. Sync Variants
            $newVariantIds = [];
            $skuToNewVariantId = [];
            foreach ($validated['variants'] as $vData) {
                // If SKU belongs to another product variant
                $existingBySku = ProductVariant::where('sku', $vData['sku'])->first();
                if ($existingBySku && $existingBySku->product_id !== $product->id) {
                    throw new \Exception("SKU {$vData['sku']} sudah digunakan oleh produk lain!");
                }

                $variant = null;
                if (!empty($vData['id'])) {
                    // Update existing
                    $variant = ProductVariant::where('product_id', $product->id)->find($vData['id']);
                }

                if ($variant) {
                    // Check if stock is adjusted
                    $stockDiff = $vData['stock'] - $variant->stock;
                    if ($stockDiff != 0) {
                        StockMutation::create([
                            'product_variant_id' => $variant->id,
                            'user_id' => $userId,
                            'type' => $stockDiff > 0 ? 'in' : 'out',
                            'quantity' => abs($stockDiff),
                            'source' => 'adjustment',
                            'notes' => 'Penyesuaian stok saat update produk'
                        ]);
                    }

                    $variant->update([
                        'name' => $vData['name'],
                        'base_price' => $vData['base_price'],
                        'stock' => $vData['stock'],
                        'sku' => $vData['sku']
                    ]);
                } else {
                    // Create new variant
                    $variant = ProductVariant::create([
                        'product_id' => $product->id,
                        'name' => $vData['name'],
                        'base_price' => $vData['base_price'],
                        'stock' => $vData['stock'],
                        'sku' => $vData['sku']
                    ]);

                    if ($vData['stock'] > 0) {
                        StockMutation::create([
                            'product_variant_id' => $variant->id,
                            'user_id' => $userId,
                            'type' => 'in',
                            'quantity' => $vData['stock'],
                            'source' => 'adjustment',
                            'notes' => 'Saldo stok awal varian baru'
                        ]);
                    }
                }

                $newVariantIds[] = $variant->id;
                $skuToNewVariantId[$vData['sku']] = $variant->id;
            }

            // Delete variants that were removed
            ProductVariant::where('product_id', $product->id)
                ->whereNotIn('id', $newVariantIds)
                ->delete();

            // 4. Sync Multi Prices
            // Delete old prices linked to this product's variants
            ProductPrice::whereIn('product_variant_id', $newVariantIds)->delete();

            // Re-insert pricing rules
            if (!empty($validated['prices'])) {
                foreach ($validated['prices'] as $pData) {
                    $variantId = null;
                    if (!empty($pData['variant_id']) && in_array($pData['variant_id'], $newVariantIds)) {
                        $variantId = $pData['variant_id'];
                    } elseif (!empty($pData['variant_sku']) && isset($skuToNewVariantId[$pData['variant_sku']])) {
                        $variantId = $skuToNewVariantId[$pData['variant_sku']];
                    }

                    if ($variantId) {
                        ProductPrice::create([
                            'product_variant_id' => $variantId,
                            'level' => $pData['level'],
                            'min_qty' => $pData['min_qty'],
                            'price' => $pData['price']
                        ]);
                    }
                }
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil diperbarui.'
        ]);
    }

    /**
     * Delete Product.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete(); // Cascade deletes variants, images, prices, mutations due to migration constraints

        return response()->json([
            'status' => 'success',
            'message' => 'Produk berhasil dihapus.'
        ]);
    }

    /**
     * Mutate Stock (manual IN / OUT adjustments).
     */
    public function mutateStock(Request $request, $productId)
    {
        $validated = $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'source' => 'required|string|in:purchase,sale,adjustment,return',
            'notes' => 'nullable|string'
        ]);

        $userId = Auth::id() ?: 1;
        $variant = ProductVariant::where('product_id', $productId)->findOrFail($validated['variant_id']);

        DB::transaction(function () use ($validated, $variant, $userId) {
            // Compute new stock
            $qty = $validated['quantity'];
            $newStock = $variant->stock;

            if ($validated['type'] === 'in') {
                $newStock += $qty;
            } else {
                $newStock = max(0, $newStock - $qty);
            }

            // Save variant stock
            $variant->update(['stock' => $newStock]);

            // Save log mutation
            StockMutation::create([
                'product_variant_id' => $variant->id,
                'user_id' => $userId,
                'type' => $validated['type'],
                'quantity' => $qty,
                'source' => $validated['source'],
                'notes' => $validated['notes'] ?? 'Penyesuaian stok manual'
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi mutasi stok berhasil diproses.'
        ]);
    }

    /**
     * Upload product image.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:2048'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            // Store in storage/app/public/uploads/products
            $path = $file->store('uploads/products', 'public');
            
            return response()->json([
                'status' => 'success',
                'url' => '/storage/' . $path
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengunggah berkas.'
        ], 400);
    }

    // Helper functions

    private function getCategoryPath($category)
    {
        $path = [$category->name];
        $parent = $category->parent;
        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }
        return $path;
    }

    private function formatCategoryTreeNode($category)
    {
        $hasChildren = $category->children->count() > 0;
        $childrenFormatted = $category->children->map(function ($child) {
            return $this->formatCategoryTreeNode($child);
        })->toArray();

        return [
            'id' => $category->id,
            'name' => $category->name,
            'isParent' => $hasChildren,
            'children' => $childrenFormatted
        ];
    }
}
