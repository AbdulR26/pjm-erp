<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Api\AuthController;
use App\Http\Controllers\Admin\Api\UserController;
use App\Http\Controllers\Admin\Api\CustomerController;
use App\Http\Controllers\Admin\Api\ProductController;

// Rute Halaman Depan E-Commerce (React Customer App)
Route::get('/', function () {
    return view('welcome');
});

// Rute Grup API Backend Admin
Route::prefix('adminv1/api')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // CRUD Staff & Admin (Hanya untuk role admin)
        Route::apiResource('/users', UserController::class);
        
        // CRUD Customer (Dapat diakses oleh admin & staff)
        Route::apiResource('/customers', CustomerController::class);

        Route::get('/categories/tree', [ProductController::class, 'categories']);
        Route::post('/products/{id}/mutate-stock', [ProductController::class, 'mutateStock']);
        Route::post('/products/upload', [ProductController::class, 'upload']);
        Route::apiResource('/products', ProductController::class);
    });
});

// Rute Fallback untuk React Admin SPA (memuat views/admin.blade.php)
Route::get('/adminv1/{any?}', function () {
    return view('admin');
})->where('any', '.*');
