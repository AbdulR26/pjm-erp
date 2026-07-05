<?php
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'admin', 'middleware' => ['auth']], function () {
    Route::get('/chats', 'ChatController@index')->name('admin.chats.index');
    Route::get('/chats/customers', 'ChatController@getCustomers')->name('admin.chats.customers');
    Route::get('/chats/{customerId}/messages', 'ChatController@getMessages')->name('admin.chats.messages');
    Route::post('/chats/{customerId}/send', 'ChatController@sendMessage')->name('admin.chats.send');
    Route::post('/chats/{customerId}/read', 'ChatController@read')->name('admin.chats.read');
});
