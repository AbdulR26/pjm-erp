<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your product module.
| These routes are loaded by the ServiceProvider under prefix 'api'.
|
*/

Route::group(['prefix' => 'v1'], function () {
    // Public Auth Endpoint
    Route::post('login', 'AuthApiController@login')->name('api.v1.login');

    // JWT Protected Endpoints
    Route::group(['middleware' => 'auth.jwt'], function () {
        // Main Products Resource API
        Route::apiResource('products', 'ProductApiController');
        Route::get('categories', 'ProductApiController@allCategories')->name('api.v1.categories.all');

        // Product Categories Sub-resource API
        Route::get('products/{id}/categories', 'ProductApiController@getCategories')->name('api.v1.products.categories');
        Route::post('products/{id}/categories', 'ProductApiController@syncCategories')->name('api.v1.products.categories.sync');

        // Product Images Sub-resource API
        Route::get('products/{id}/images', 'ProductApiController@getImages')->name('api.v1.products.images');
        Route::post('products/{id}/images', 'ProductApiController@uploadImage')->name('api.v1.products.images.upload');
        Route::post('products/{id}/images/reorder', 'ProductApiController@reorderImages')->name('api.v1.products.images.reorder');
        Route::post('products/{id}/images/{imageId}/primary', 'ProductApiController@setPrimaryImage')->name('api.v1.products.images.primary');
        Route::delete('products/{id}/images/{imageId}', 'ProductApiController@destroyImage')->name('api.v1.products.images.destroy');

        // Product Attributes Sub-resource API
        Route::get('products/{id}/attributes', 'ProductApiController@getAttributes')->name('api.v1.products.attributes');
        Route::post('products/{id}/attributes/sync', 'ProductApiController@syncAttributes')->name('api.v1.products.attributes.sync');
        Route::post('attributes', 'ProductApiController@storeAttribute')->name('api.v1.attributes.store');
        Route::post('attributes/{attributeId}/values', 'ProductApiController@storeAttributeValue')->name('api.v1.attributes.values.store');

        // Product Stock Mutations Sub-resource API
        Route::get('products/{id}/mutations', 'ProductApiController@getMutations')->name('api.v1.products.mutations');
        Route::post('products/{id}/mutations/adjust', 'ProductApiController@adjustStock')->name('api.v1.products.mutations.adjust');
    });
});
