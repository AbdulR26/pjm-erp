<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['middleware' => 'auth:passport-user', 'prefix' => 'v1'], function () {
    Route::group(['prefix' => 'product-group'], function () {
//        Route::post('/', 'ProductGroupController@data')->name('api.v1.product-group.data');
//        Route::post('bulk/save', 'ProductGroupController@bulkSave')->name('api.v1.product-group.bulk.save');
//        Route::put('store', 'ProductGroupController@store')->name('api.v1.product-group.store');
//        Route::patch('{id}/update', 'ProductGroupController@update')->name('api.v1.product-group.update');
//        Route::delete('{id}/delete', 'ProductGroupController@delete')->name('api.v1.product-group.delete');
    });
});
