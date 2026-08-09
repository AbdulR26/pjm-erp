<?php

use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'admin', 'middleware' => ['auth']], function () {
    Route::get('/orders', 'OrderController@index')->name('admin.orders.index');
    Route::post('/orders/validate-voucher', 'OrderController@validateVoucher')->name('admin.orders.validate-voucher');
    Route::post('/orders/calculate-shipping-rates', 'OrderController@calculateShippingRates')->name('admin.orders.shipping-rates');
    Route::match(['get', 'put'], '/orders/create', 'OrderController@create')->name('admin.orders.create');
    Route::match(['get', 'patch'], '/orders/{id}/edit', 'OrderController@edit')->name('admin.orders.edit');
    Route::post('/orders/{id}/update-status', 'OrderController@updateStatus')->name('admin.orders.update-status');
    Route::post('/orders/{id}/update-details', 'OrderController@updateDetails')->name('admin.orders.update-details');
    Route::post('/orders/{id}/sync-payment', 'OrderController@syncPayment')->name('admin.orders.sync-payment');
    Route::post('/orders/{id}/generate-payment-link', 'OrderController@generatePaymentLink')->name('admin.orders.generate-payment-link');
    Route::post('/orders/{id}/book-shipment', 'OrderController@bookShipment')->name('admin.orders.book-shipment');
    Route::get('/orders/{id}/print-label', 'OrderController@printLabel')->name('admin.orders.print-label');
    Route::delete('/orders/{id}', 'OrderController@destroy')->name('admin.orders.destroy');
    Route::post('/orders/bulk-book-shipment', 'OrderController@bulkBookShipment')->name('admin.orders.bulk-book-shipment');
    Route::get('/orders/bulk-print-labels', 'OrderController@bulkPrintLabels')->name('admin.orders.bulk-print-labels');
    Route::post('/orders/bulk-delete', 'OrderController@bulkDelete')->name('admin.orders.bulk-delete');

    // Order Returns Routes
    Route::get('/order-returns', 'AdminOrderReturnController@index')->name('admin.order-returns.index');
    Route::get('/order-returns/{id}', 'AdminOrderReturnController@show')->name('admin.order-returns.show');
    Route::post('/order-returns/{id}/approve', 'AdminOrderReturnController@approve')->name('admin.order-returns.approve');
    Route::post('/order-returns/{id}/reject', 'AdminOrderReturnController@reject')->name('admin.order-returns.reject');
});
