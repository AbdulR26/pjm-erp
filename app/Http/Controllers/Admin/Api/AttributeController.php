<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    /**
     * Get semua key atribut unik yang pernah dipakai di seluruh produk.
     * Berguna untuk menampilkan dropdown key saat input atribut baru.
     */
    public function keys()
    {
        $products = Product::whereNotNull('attributes')
            ->get(['attributes']);

        $allKeys = [];
        foreach ($products as $product) {
            if (is_array($product->attributes)) {
                foreach (array_keys($product->attributes) as $key) {
                    $allKeys[$key] = true;
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'keys'   => array_keys($allKeys),
        ]);
    }

    /**
     * Get atribut dari satu produk.
     */
    public function show(string $productId)
    {
        $product = Product::select(['id', 'name', 'attributes'])->findOrFail($productId);

        return response()->json([
            'status'     => 'success',
            'product_id' => $product->id,
            'product'    => $product->name,
            'attributes' => $product->attributes ?? [],
        ]);
    }

    /**
     * Set (replace) semua atribut produk.
     * Body: { "attributes": { "brand": "Pertamina", "viscosity": "10W-40", "volume": "1L" } }
     */
    public function update(Request $request, string $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'attributes'   => 'required|array',
            'attributes.*' => 'nullable|string|max:255',
        ]);

        // Sanitize: remove empty string keys and empty string values
        $cleaned = [];
        foreach ($request->attributes as $key => $value) {
            $key = trim($key);
            if ($key !== '' && $value !== '' && $value !== null) {
                $cleaned[$key] = trim((string) $value);
            }
        }

        $product->update(['attributes' => $cleaned]);

        return response()->json([
            'status'     => 'success',
            'message'    => 'Atribut produk berhasil diperbarui.',
            'attributes' => $product->fresh()->attributes,
        ]);
    }

    /**
     * Tambah atau update satu key-value atribut saja (PATCH-style).
     * Body: { "key": "viscosity", "value": "10W-40" }
     */
    public function upsertOne(Request $request, string $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'key'   => 'required|string|max:100',
            'value' => 'required|string|max:500',
        ]);

        // Sanitize key: trim, lowercase, replace spaces with underscore
        $key   = strtolower(trim(preg_replace('/\s+/', '_', $request->key)));
        $value = trim($request->value);

        if (empty($key)) {
            return response()->json(['message' => 'Nama atribut tidak boleh kosong.'], 422);
        }

        // Ensure attributes is always an array (not stdClass from JSON decode)
        $attributes = is_array($product->attributes) ? $product->attributes : (array) ($product->attributes ?? []);
        $attributes[$key] = $value;

        $product->update(['attributes' => $attributes]);

        return response()->json([
            'status'     => 'success',
            'message'    => "Atribut '{$key}' berhasil diperbarui.",
            'attributes' => $product->fresh()->attributes,
        ]);
    }

    /**
     * Hapus satu key dari atribut produk.
     * Route: DELETE /products/{productId}/attributes/{key}
     */
    public function destroyOne(string $productId, string $key)
    {
        $product = Product::findOrFail($productId);

        // Ensure attributes is always an array
        $attributes = is_array($product->attributes) ? $product->attributes : (array) ($product->attributes ?? []);

        if (!array_key_exists($key, $attributes)) {
            return response()->json(['message' => "Atribut '{$key}' tidak ditemukan."], 404);
        }

        unset($attributes[$key]);
        $product->update(['attributes' => $attributes]);

        return response()->json([
            'status'     => 'success',
            'message'    => "Atribut '{$key}' berhasil dihapus.",
            'attributes' => $product->fresh()->attributes,
        ]);
    }

    /**
     * Hapus semua atribut produk.
     */
    public function destroyAll(string $productId)
    {
        $product = Product::findOrFail($productId);
        $product->update(['attributes' => []]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Semua atribut produk berhasil dihapus.',
        ]);
    }

    /**
     * Bulk update atribut untuk banyak produk sekaligus.
     * Body: { "product_ids": [1,2,3], "attributes": { "brand": "Pertamina" } }
     * Hanya menambah/update key yang disebutkan (tidak menghapus yang lain).
     */
    public function bulkMerge(Request $request)
    {
        $request->validate([
            'product_ids'   => 'required|array|min:1',
            'product_ids.*' => 'required|integer|exists:products,id',
            'attributes'    => 'required|array|min:1',
            'attributes.*'  => 'required|string|max:255',
        ]);

        $products = Product::whereIn('id', $request->product_ids)->get();
        $count    = 0;

        foreach ($products as $product) {
            $existing = $product->attributes ?? [];
            foreach ($request->attributes as $key => $value) {
                $key = trim($key);
                if ($key !== '') {
                    $existing[$key] = trim((string) $value);
                }
            }
            $product->update(['attributes' => $existing]);
            $count++;
        }

        return response()->json([
            'status'  => 'success',
            'message' => "{$count} produk berhasil diperbarui atributnya.",
        ]);
    }
}
