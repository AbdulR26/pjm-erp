<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class PublicWishlistController extends Controller
{
    /**
     * Get the logged-in customer's wishlist items.
     */
    public function index(Request $request)
    {
        $customerSession = Session::get('customer');
        if (!$customerSession || !isset($customerSession['id'])) {
            return response()->json([]);
        }

        $customer = Customer::find($customerSession['id']);
        if (!$customer) {
            return response()->json([]);
        }

        $wishlistProducts = $customer->wishlist()
            ->with(['categories', 'variants.images', 'images', 'attributeValues.attribute'])
            ->whereNull('parent_id') // Ensure we only wishlist parent products
            ->get();

        $now = now();
        $formatted = $wishlistProducts->map(function ($product) use ($now) {
            return PublicProductController::formatProduct($product, $now);
        });

        return response()->json($formatted);
    }

    /**
     * Toggle product in the customer's wishlist.
     */
    public function toggle(Request $request)
    {
        $customerSession = Session::get('customer');
        if (!$customerSession || !isset($customerSession['id'])) {
            return response()->json([
                'status' => 'unauthenticated',
                'message' => 'Silakan login terlebih dahulu untuk menyimpan favorit.'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer|exists:products,id',
        ], [
            'product_id.required' => 'ID produk wajib diisi.',
            'product_id.exists' => 'Produk tidak ditemukan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::find($customerSession['id']);
        if (!$customer) {
            return response()->json([
                'status' => 'unauthenticated',
                'message' => 'Pelanggan tidak ditemukan.'
            ], 401);
        }

        $productId = (int) $request->product_id;
        $isAttached = $customer->wishlist()->where('product_id', $productId)->exists();

        if ($isAttached) {
            $customer->wishlist()->detach($productId);
            $status = 'removed';
            $message = 'Produk dihapus dari favorit.';
        } else {
            $customer->wishlist()->attach($productId);
            $status = 'added';
            $message = 'Produk ditambahkan ke favorit.';
        }

        return response()->json([
            'status' => 'success',
            'wishlist_status' => $status,
            'message' => $message
        ]);
    }
}
