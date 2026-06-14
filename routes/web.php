<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Api\AuthController;
use App\Http\Controllers\Admin\Api\UserController;
use App\Http\Controllers\Admin\Api\CustomerController;
use App\Http\Controllers\Admin\Api\ProductController;
use App\Http\Controllers\Admin\Api\OrderController;
use App\Http\Controllers\Admin\Api\PaymentController;
use App\Http\Controllers\Admin\Api\ShipmentController;
use App\Http\Controllers\Admin\Api\CategoryController;
use App\Http\Controllers\Admin\Api\AttributeController;
use App\Http\Controllers\Admin\Api\StockController;
use App\Http\Controllers\Admin\Api\BannerController;
use App\Http\Controllers\Admin\Api\SettingController;
use App\Http\Controllers\Admin\Api\VoucherController as AdminVoucherController;
use App\Http\Controllers\CustomerAuthController;

// Rute Halaman Depan E-Commerce (React Customer App)
Route::get('/', function () {
    return view('welcome');
});

// ─── Webhook Routes (no auth - called by Midtrans/Biteship servers) ─────────
Route::post('/webhooks/midtrans', [PaymentController::class, 'midtransWebhook'])
    ->name('webhooks.midtrans');

Route::post('/webhooks/biteship', [ShipmentController::class, 'biteshipWebhook'])
    ->name('webhooks.biteship');

// ─── Public Customer API ─────────────────────────────────────────────────────
Route::prefix('api')->group(function () {
    Route::get('/products', [App\Http\Controllers\PublicProductController::class, 'index']);
    Route::get('/categories', [App\Http\Controllers\PublicProductController::class, 'categories']);
    Route::get('/banners', [App\Http\Controllers\PublicProductController::class, 'banners']);
    Route::get('/settings', [App\Http\Controllers\PublicProductController::class, 'settings']);

    // ── Customer Auth ──────────────────────────────────────────────────────────
    Route::get('/auth/me', [CustomerAuthController::class, 'me']);
    Route::post('/auth/logout', [CustomerAuthController::class, 'logout']);
    Route::post('/auth/register', [CustomerAuthController::class, 'register']);
    Route::post('/auth/login', [CustomerAuthController::class, 'login']);
    Route::put('/auth/profile', [CustomerAuthController::class, 'updateProfile']);

    // ── E-Commerce Orders ──────────────────────────────────────────────────────
    Route::get('/orders', [App\Http\Controllers\PublicOrderController::class, 'index']);
    Route::post('/orders', [App\Http\Controllers\PublicOrderController::class, 'store']);
    Route::post('/orders/{id}/pay-simulate', [App\Http\Controllers\PublicOrderController::class, 'paySimulate']);
    Route::post('/orders/{id}/payment', [App\Http\Controllers\PublicOrderController::class, 'getOrCreatePayment']);

    // ── E-Commerce Vouchers ────────────────────────────────────────────────────
    Route::get('/vouchers', [App\Http\Controllers\PublicOrderController::class, 'vouchers']);
    Route::post('/vouchers/apply', [App\Http\Controllers\PublicOrderController::class, 'applyVoucher']);
});

// ─── Customer Social Login ──────────────────────────────────────────────────
Route::get('/auth/google', [CustomerAuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [CustomerAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
Route::get('/auth/facebook', [CustomerAuthController::class, 'redirectToFacebook'])->name('auth.facebook');
Route::get('/auth/facebook/callback', [CustomerAuthController::class, 'handleFacebookCallback'])->name('auth.facebook.callback');

// ─── Admin API ───────────────────────────────────────────────────────────────
Route::prefix('adminv1/api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // ── Users & Customers ────────────────────────────────────────────────
        Route::apiResource('/users', UserController::class);
        Route::apiResource('/customers', CustomerController::class);
        Route::apiResource('/vouchers', AdminVoucherController::class);

        // ── Products ─────────────────────────────────────────────────────────
        Route::get('/categories/tree', [ProductController::class, 'categories']);
        Route::post('/products/{id}/mutate-stock', [ProductController::class, 'mutateStock']);
        Route::post('/products/upload', [ProductController::class, 'upload']);
        Route::apiResource('/products', ProductController::class);

        // ── Categories ───────────────────────────────────────────────────────
        Route::get('/categories/tree-full', [CategoryController::class, 'tree']);
        Route::apiResource('/categories', CategoryController::class);

        // ── Product Attributes ───────────────────────────────────────────────
        // GET    /products/{id}/attributes               → get attributes
        // PUT    /products/{id}/attributes               → replace all attributes
        // POST   /products/{id}/attributes/upsert        → add/update single key
        // DELETE /products/{id}/attributes/{key}         → remove single key
        // DELETE /products/{id}/attributes               → clear all
        // POST   /attributes/bulk-merge                  → bulk merge across products
        // GET    /attributes/keys                        → all unique keys used
        Route::get('/attributes/keys', [AttributeController::class, 'keys']);
        Route::post('/attributes/bulk-merge', [AttributeController::class, 'bulkMerge']);
        Route::get('/products/{productId}/attributes', [AttributeController::class, 'show']);
        Route::put('/products/{productId}/attributes', [AttributeController::class, 'update']);
        Route::post('/products/{productId}/attributes/upsert', [AttributeController::class, 'upsertOne']);
        Route::delete('/products/{productId}/attributes/{key}', [AttributeController::class, 'destroyOne']);
        Route::delete('/products/{productId}/attributes', [AttributeController::class, 'destroyAll']);

        // ── Stock Management ─────────────────────────────────────────────────
        // GET    /stock                            → ringkasan stok semua varian
        // GET    /stock/mutations                  → riwayat mutasi stok (filterable)
        // POST   /stock/mutate                     → manual IN/OUT satu varian
        // PUT    /stock/{variantId}/correct        → set stok ke nilai tertentu
        // POST   /stock/bulk-correct               → koreksi bulk / stock opname
        // DELETE /stock/mutations/{id}             → hapus log mutasi
        Route::get('/stock', [StockController::class, 'index']);
        Route::get('/stock/mutations', [StockController::class, 'mutations']);
        Route::post('/stock/mutate', [StockController::class, 'mutate']);
        Route::put('/stock/{variantId}/correct', [StockController::class, 'correct']);
        Route::post('/stock/bulk-correct', [StockController::class, 'bulkCorrect']);
        Route::delete('/stock/mutations/{mutationId}', [StockController::class, 'destroyMutation']);

        // ── Orders ───────────────────────────────────────────────────────────
        Route::get('/orders/{id}/print-invoice', [OrderController::class, 'printInvoice']);
        Route::get('/orders/{id}/print-resi', [OrderController::class, 'printResi']);
        Route::apiResource('/orders', OrderController::class);

        // ── Banners & Settings ───────────────────────────────────────────────
        Route::post('/banners/upload', [BannerController::class, 'upload']);
        Route::apiResource('/banners', BannerController::class);
        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'update']);

        // ── Payments (per-order) ─────────────────────────────────────────────
        // POST   /orders/{orderId}/payment        → Create payment + Snap token
        // GET    /orders/{orderId}/payment        → Get payment detail (add ?sync=1 to pull from Midtrans)
        // DELETE /orders/{orderId}/payment/cancel → Cancel payment
        Route::post('/orders/{orderId}/payment', [PaymentController::class, 'store']);
        Route::get('/orders/{orderId}/payment', [PaymentController::class, 'show']);
        Route::post('/orders/{orderId}/payment/cancel', [PaymentController::class, 'cancel']);

        // ── Shipments (per-order) ─────────────────────────────────────────────
        // GET    /orders/{orderId}/shipment/rates → Check ongkir
        // POST   /orders/{orderId}/shipment       → Book shipment
        // GET    /orders/{orderId}/shipment       → Get shipment detail (add ?sync=1 to pull tracking)
        // POST   /orders/{orderId}/shipment/cancel → Cancel shipment
        Route::get('/orders/{orderId}/shipment/rates', [ShipmentController::class, 'rates']);
        Route::post('/orders/{orderId}/shipment', [ShipmentController::class, 'store']);
        Route::get('/orders/{orderId}/shipment', [ShipmentController::class, 'show']);
        Route::post('/orders/{orderId}/shipment/cancel', [ShipmentController::class, 'cancel']);
    });
});

// ─── Admin SPA Fallback ──────────────────────────────────────────────────────
Route::get('/adminv1/{any?}', function () {
    return view('admin');
})->where('any', '.*');
