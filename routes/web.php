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
use App\Http\Controllers\Admin\Api\ChatController;
use App\Http\Controllers\Admin\Api\SupplierController;
use App\Http\Controllers\Admin\Api\PurchaseOrderController;
use App\Http\Controllers\Admin\Api\DashboardController;
use App\Http\Controllers\CustomerAuthController;
use App\Http\Controllers\Admin\LoginController;

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
    Route::post('/auth/verify-otp', [CustomerAuthController::class, 'verifyOtp']);
    Route::post('/auth/resend-otp', [CustomerAuthController::class, 'resendOtp']);
    Route::put('/auth/profile', [CustomerAuthController::class, 'updateProfile']);
    Route::get('/auth/addresses', [CustomerAuthController::class, 'getAddresses']);
    Route::post('/auth/addresses', [CustomerAuthController::class, 'storeAddress']);
    Route::put('/auth/addresses/{id}', [CustomerAuthController::class, 'updateAddress']);
    Route::delete('/auth/addresses/{id}', [CustomerAuthController::class, 'destroyAddress']);
    Route::post('/auth/addresses/{id}/primary', [CustomerAuthController::class, 'setPrimaryAddress']);

    // ── E-Commerce Orders ──────────────────────────────────────────────────────
    Route::get('/orders', [App\Http\Controllers\PublicOrderController::class, 'index']);
    Route::post('/orders', [App\Http\Controllers\PublicOrderController::class, 'store']);
    Route::post('/orders/{id}/pay-simulate', [App\Http\Controllers\PublicOrderController::class, 'paySimulate']);
    Route::post('/orders/{id}/ship-simulate', [App\Http\Controllers\PublicOrderController::class, 'shipSimulate']);
    Route::post('/orders/{id}/payment', [App\Http\Controllers\PublicOrderController::class, 'getOrCreatePayment']);
    Route::get('/orders/{id}/shipment', [App\Http\Controllers\PublicOrderController::class, 'getShipmentTracking']);
    Route::post('/orders/{id}/reviews', [App\Http\Controllers\PublicOrderController::class, 'storeReview']);
    Route::post('/reviews/{id}/like', [App\Http\Controllers\PublicReviewController::class, 'like']);
    Route::post('/reviews/{id}/reply', [App\Http\Controllers\PublicReviewController::class, 'reply']);
    Route::post('/shipment/rates', [App\Http\Controllers\PublicOrderController::class, 'getRates']);

    // ── E-Commerce Order Returns ────────────────────────────────────────────────
    Route::get('/customer/summary', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'summary']);
    Route::post('/orders/{id}/returns', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'store']);
    Route::get('/orders/{id}/returns', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'show']);
    Route::post('/returns/{returnId}/input-waybill', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'inputWaybill']);

    // ── Customer Notifications ────────────────────────────────────────────────
    Route::get('/notifications', [App\Http\Controllers\CustomerNotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [App\Http\Controllers\CustomerNotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [App\Http\Controllers\CustomerNotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [App\Http\Controllers\CustomerNotificationController::class, 'destroy']);

    // ── E-Commerce Vouchers ────────────────────────────────────────────────────
    Route::get('/vouchers', [App\Http\Controllers\PublicOrderController::class, 'vouchers']);
    Route::post('/vouchers/apply', [App\Http\Controllers\PublicOrderController::class, 'applyVoucher']);

    // ── E-Commerce Chat ────────────────────────────────────────────────────────
    Route::get('/chats', [App\Http\Controllers\PublicChatController::class, 'index']);
    Route::post('/chats', [App\Http\Controllers\PublicChatController::class, 'store']);
    Route::post('/chats/read', [App\Http\Controllers\PublicChatController::class, 'read']);
    Route::post('/chats/auth', [App\Http\Controllers\PublicChatController::class, 'auth']);

    // ── Customer Wishlist ──────────────────────────────────────────────────────
    Route::get('/wishlist', [App\Http\Controllers\PublicWishlistController::class, 'index']);
    Route::post('/wishlist', [App\Http\Controllers\PublicWishlistController::class, 'toggle']);
});

// Direct Web Aliases for Order Returns (supports both /api/orders/{id}/returns and /orders/{id}/returns)
Route::get('/customer/summary', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'summary']);
Route::post('/orders/{id}/returns', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'store']);
Route::get('/orders/{id}/returns', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'show']);
Route::post('/returns/{returnId}/input-waybill', [App\Http\Controllers\Api\OrderReturnCustomerController::class, 'inputWaybill']);

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
        Route::get('/dashboard/stats', [DashboardController::class, 'index']);
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
        Route::get('/orders/print-invoices', [OrderController::class, 'printInvoices']);
        Route::get('/orders/print-resis', [OrderController::class, 'printResis']);
        Route::get('/orders/{id}/print-invoice', [OrderController::class, 'printInvoice']);
        Route::get('/orders/{id}/print-resi', [OrderController::class, 'printResi']);
        Route::apiResource('/orders', OrderController::class);

        // ── Suppliers ────────────────────────────────────────────────────────
        Route::apiResource('/suppliers', SupplierController::class);

        // ── Purchase Orders ──────────────────────────────────────────────────
        Route::get('/purchase-orders/{id}/print', [PurchaseOrderController::class, 'printPO']);
        Route::post('/purchase-orders/{id}/receive', [PurchaseOrderController::class, 'receive']);
        Route::apiResource('/purchase-orders', PurchaseOrderController::class);

        // ── Banners & Settings ───────────────────────────────────────────────
        Route::post('/banners/upload', [BannerController::class, 'upload']);
        Route::apiResource('/banners', BannerController::class);
        Route::get('/settings', [SettingController::class, 'index']);
        Route::post('/settings', [SettingController::class, 'update']);

        // ── Customer Chat Support ────────────────────────────────────────────
        Route::get('/chats', [ChatController::class, 'index']);
        Route::get('/chats/{customerId}', [ChatController::class, 'show']);
        Route::post('/chats/{customerId}', [ChatController::class, 'store']);
        Route::post('/chats/{customerId}/read', [ChatController::class, 'read']);

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
        Route::post('/shipments/bulk-store', [ShipmentController::class, 'bulkStore']);
        Route::get('/orders/{orderId}/shipment/rates', [ShipmentController::class, 'rates']);
        Route::post('/orders/{orderId}/shipment', [ShipmentController::class, 'store']);
        Route::get('/orders/{orderId}/shipment', [ShipmentController::class, 'show']);
        Route::post('/orders/{orderId}/shipment/cancel', [ShipmentController::class, 'cancel']);
    });
});

// ─── Admin Web/Blade Routes ──────────────────────────────────────────────────
Route::prefix('adminv1')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login', [LoginController::class, 'login'])->name('admin.login.submit');
    Route::post('/logout', [LoginController::class, 'logout'])->name('admin.logout');

    Route::middleware('auth')->group(function () {
        Route::get('/dashboard', function () {
            $customerCount = \App\Models\Customer::count();
            $userCount = \App\Models\User::count();
            $productCount = \Qollam\Product\Models\Product::whereNull('parent_id')->count();
            $orderCount = \App\Models\Order::count();
            
            $pendingOrderCount = \App\Models\Order::whereHas('status', function($q) {
                $q->where('slug', 'pending');
            })->count();
            
            $totalSales = \App\Models\Order::whereHas('status', function($q) {
                $q->where('slug', 'completed');
            })->sum('grand_total');
            
            $poCount = \App\Models\PurchaseOrder::count();
            
            $recentOrders = \App\Models\Order::with(['customer', 'status'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
                
            $recentPOs = \App\Models\PurchaseOrder::with(['supplier'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
                
            return view('admin.dashboard', get_defined_vars());
        })->name('admin.dashboard');
    });
});

Route::group(['prefix' => 'admin', 'middleware' => ['auth']], function () {
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.settings.index');
    Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('admin.settings.update');
    Route::post('/settings/test-midtrans', [\App\Http\Controllers\Admin\SettingController::class, 'testMidtrans'])->name('admin.settings.test-midtrans');
    Route::post('/settings/test-biteship', [\App\Http\Controllers\Admin\SettingController::class, 'testBiteship'])->name('admin.settings.test-biteship');

    // Manajemen Data Olshop (Tokopedia, TikTok Shop, Shopee)
    Route::get('/olshop', [\App\Http\Controllers\Admin\OlshopManagementController::class, 'index'])->name('admin.olshop.index');
    Route::post('/olshop/clone-product', [\App\Http\Controllers\Admin\OlshopManagementController::class, 'cloneProduct'])->name('admin.olshop.clone-product');
    Route::post('/olshop/sync-orders', [\App\Http\Controllers\Admin\OlshopManagementController::class, 'syncOrders'])->name('admin.olshop.sync-orders');
    Route::post('/olshop/test-connection', [\App\Http\Controllers\Admin\OlshopManagementController::class, 'testConnection'])->name('admin.olshop.test-connection');
    Route::get('/olshop/orders/{id}/print-resi', [\App\Http\Controllers\Admin\OlshopManagementController::class, 'printResi'])->name('admin.olshop.print-resi');
    
    // Backup & Reset Data
    Route::get('/settings/backup/download', [\App\Http\Controllers\Admin\SettingController::class, 'downloadBackup'])->name('admin.settings.backup.download');
    Route::post('/settings/data/reset', [\App\Http\Controllers\Admin\SettingController::class, 'resetData'])->name('admin.settings.data.reset');

    // Banners management
    Route::post('/settings/banners', [\App\Http\Controllers\Admin\SettingController::class, 'storeBanner'])->name('admin.settings.banners.store');
    Route::post('/settings/banners/{id}/update', [\App\Http\Controllers\Admin\SettingController::class, 'updateBanner'])->name('admin.settings.banners.update');
    Route::post('/settings/banners/{id}/delete', [\App\Http\Controllers\Admin\SettingController::class, 'deleteBanner'])->name('admin.settings.banners.delete');

    // Courier management
    Route::post('/settings/couriers/sync', [\App\Http\Controllers\Admin\SettingController::class, 'syncCouriers'])->name('admin.settings.couriers.sync');
    Route::post('/settings/couriers/{id}/toggle', [\App\Http\Controllers\Admin\SettingController::class, 'toggleCourier'])->name('admin.settings.couriers.toggle');

    // Payment Method management
    Route::post('/settings/payments/{id}/toggle', [\App\Http\Controllers\Admin\SettingController::class, 'togglePaymentMethod'])->name('admin.settings.payments.toggle');

    // Reports Management
    Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('admin.reports.index');
    Route::get('/reports/export-pdf', [\App\Http\Controllers\Admin\ReportController::class, 'exportPdf'])->name('admin.reports.export-pdf');

    // Review Management
    Route::get('/reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index'])->name('admin.reviews.index');
    Route::post('/reviews/{id}/toggle', [\App\Http\Controllers\Admin\ReviewController::class, 'toggleVisibility'])->name('admin.reviews.toggle');
    Route::post('/reviews/{id}/reply', [\App\Http\Controllers\Admin\ReviewController::class, 'reply'])->name('admin.reviews.reply');
    Route::delete('/reviews/{id}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy'])->name('admin.reviews.destroy');

    // Stock Management
    Route::get('/stock', [\App\Http\Controllers\Admin\StockManagementController::class, 'index'])->name('admin.stock.index');
    Route::get('/stock/mutations', [\App\Http\Controllers\Admin\StockManagementController::class, 'mutations'])->name('admin.stock.mutations');
    Route::post('/stock/adjust', [\App\Http\Controllers\Admin\StockManagementController::class, 'adjust'])->name('admin.stock.adjust');
    Route::post('/stock/correct', [\App\Http\Controllers\Admin\StockManagementController::class, 'correct'])->name('admin.stock.correct');

    // Voucher management
    Route::get('/vouchers', [\App\Http\Controllers\Admin\VoucherController::class, 'index'])->name('admin.vouchers.index');
    Route::match(['get', 'put'], '/vouchers/create', [\App\Http\Controllers\Admin\VoucherController::class, 'create'])->name('admin.vouchers.create');
    Route::match(['get', 'patch'], '/vouchers/{id}/edit', [\App\Http\Controllers\Admin\VoucherController::class, 'edit'])->name('admin.vouchers.edit');
    Route::delete('/vouchers/{id}', [\App\Http\Controllers\Admin\VoucherController::class, 'destroy'])->name('admin.vouchers.destroy');
    Route::post('/vouchers/bulk-delete', [\App\Http\Controllers\Admin\VoucherController::class, 'bulkDelete'])->name('admin.vouchers.bulk-delete');

    // Supplier management
    Route::get('/suppliers', [\App\Http\Controllers\Admin\SupplierController::class, 'index'])->name('admin.suppliers.index');
    Route::match(['get', 'put'], '/suppliers/create', [\App\Http\Controllers\Admin\SupplierController::class, 'create'])->name('admin.suppliers.create');
    Route::match(['get', 'patch'], '/suppliers/{id}/edit', [\App\Http\Controllers\Admin\SupplierController::class, 'edit'])->name('admin.suppliers.edit');
    Route::delete('/suppliers/{id}', [\App\Http\Controllers\Admin\SupplierController::class, 'destroy'])->name('admin.suppliers.destroy');
    Route::post('/suppliers/bulk-delete', [\App\Http\Controllers\Admin\SupplierController::class, 'bulkDelete'])->name('admin.suppliers.bulk-delete');

    // Purchase Order management
    Route::get('/purchase-orders', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'index'])->name('admin.purchase-orders.index');
    Route::match(['get', 'put'], '/purchase-orders/create', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'create'])->name('admin.purchase-orders.create');
    Route::match(['get', 'patch'], '/purchase-orders/{id}/edit', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'edit'])->name('admin.purchase-orders.edit');
    Route::delete('/purchase-orders/{id}', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'destroy'])->name('admin.purchase-orders.destroy');
    Route::post('/purchase-orders/bulk-delete', [\App\Http\Controllers\Admin\PurchaseOrderController::class, 'bulkDelete'])->name('admin.purchase-orders.bulk-delete');

    // User management
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('admin.users.index');
    Route::match(['get', 'put'], '/users/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('admin.users.create');
    Route::match(['get', 'patch'], '/users/{id}/edit', [\App\Http\Controllers\Admin\UserController::class, 'edit'])->name('admin.users.edit');
    Route::delete('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/users/bulk-delete', [\App\Http\Controllers\Admin\UserController::class, 'bulkDelete'])->name('admin.users.bulk-delete');
});

// ─── Admin SPA Fallback / Redirection ────────────────────────────────────────
Route::get('/adminv1/{any?}', function () {
    return redirect()->route('admin.dashboard');
})->where('any', '.*');
