<?php

use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'admin', 'middleware' => ['auth']], function () {
    // Product
    Route::match(['get', 'put'], '/products/create', 'ProductController@create')->name('product.create');
    Route::match(['get', 'patch'], '/products/{id}/edit', 'ProductController@edit')->name('product.edit');
    Route::delete('/products/{id}', 'ProductController@destroy')->name('product.destroy');
    Route::get('/products', 'ProductController@index')->name('product.index');

    // Product Category
    Route::match(['get', 'put'], '/product-categories/create', 'ProductCategoryController@create')->name('product-category.create');
    Route::match(['get', 'patch'], '/product-categories/{id}/edit', 'ProductCategoryController@edit')->name('product-category.edit');
    Route::delete('/product-categories/{id}', 'ProductCategoryController@destroy')->name('product-category.destroy');
    Route::get('/product-categories', 'ProductCategoryController@index')->name('product-category.index');

    // Category API (for jsTree in product form)
    Route::get('/api/categories', 'ProductCategoryController@apiList')->name('api.categories.list');
    Route::post('/api/categories', 'ProductCategoryController@apiStore')->name('api.categories.store');
    Route::post('/api/products/{id}/categories', 'ProductController@syncCategories')->name('api.product.categories.sync');
    Route::get('/api/products/{id}/categories', 'ProductController@getCategories')->name('api.product.categories.get');

    // Product Images API
    Route::get('/api/products/{id}/images', 'ProductController@getImages')->name('api.product.images.list');
    Route::post('/api/products/{id}/images/upload', 'ProductController@uploadImage')->name('api.product.images.upload');
    Route::post('/api/products/{id}/images/reorder', 'ProductController@reorderImages')->name('api.product.images.reorder');
    Route::post('/api/products/{id}/images/{imageId}/primary', 'ProductController@setPrimaryImage')->name('api.product.images.primary');
    Route::delete('/api/products/{id}/images/{imageId}', 'ProductController@destroyImage')->name('api.product.images.destroy');

    // Product Attributes API
    Route::get('/api/products/{id}/attributes', 'ProductController@getAttributes')->name('api.product.attributes.list');
    Route::post('/api/products/{id}/attributes/sync', 'ProductController@syncAttributes')->name('api.product.attributes.sync');
    Route::post('/api/products/{id}/discount', 'ProductController@saveDiscount')->name('api.product.discount.save');
    Route::post('/api/attributes', 'ProductController@storeAttribute')->name('api.attributes.store');
    Route::post('/api/attributes/{attributeId}/values', 'ProductController@storeAttributeValue')->name('api.attributes.values.store');

    // Product Stock Mutations API
    Route::get('/api/products/{id}/mutations', 'ProductController@getMutations')->name('api.product.mutations.list');
    Route::post('/api/products/{id}/mutations/adjust', 'ProductController@adjustStock')->name('api.product.mutations.adjust');
});

Route::group(['middleware' => ['auth']], function () {
    Route::post('/product/bulk-delete', 'ProductController@bulkDelete')->name('product.bulk-delete');
    Route::post('/product-category/bulk-delete', 'ProductCategoryController@bulkDelete')->name('product-category.bulk-delete');
});
