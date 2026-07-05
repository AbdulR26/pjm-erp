<?php
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'admin', 'middleware' => ['auth']], function () {
    Route::match(['get', 'put'], '/customers/create', 'CustomerController@create')->name('customer.create');
    Route::match(['get', 'patch'], '/customers/{id}/edit', 'CustomerController@edit')->name('customer.edit');
    Route::delete('/customers/{id}', 'CustomerController@destroy')->name('customer.destroy');
    Route::get('/customers', 'CustomerController@index')->name('customer.index');

    // Customer Address CRUD Endpoints
    Route::get('/customers/{customerId}/addresses', 'CustomerController@getAddresses')->name('customer.addresses.list');
    Route::post('/customers/{customerId}/addresses', 'CustomerController@storeAddress')->name('customer.addresses.store');
    Route::put('/customers/{customerId}/addresses/{addressId}', 'CustomerController@updateAddress')->name('customer.addresses.update');
    Route::delete('/customers/{customerId}/addresses/{addressId}', 'CustomerController@deleteAddress')->name('customer.addresses.destroy');
});

Route::group(['middleware' => ['auth']], function () {
    Route::post('/customer/bulk-delete', 'CustomerController@bulkDelete')->name('customer.bulk-delete');
});
