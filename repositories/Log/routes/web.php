<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
 */

Route::middleware(['auth'])->prefix(config('backend.prefix'))->group(function(){
    Route::prefix('data-logs')->group(function(){
        Route::get('/', 'LogController@dataLogs')->name('data-logs.index');
        Route::post('/{id}/detail', 'LogController@detailDataLog')->name('data-logs.detail');
    });
    Route::prefix('api-logs')->group(function(){
        Route::get('/', 'LogController@apiLogs')->name('api-logs.index');
        Route::post('/{id}/detail', 'LogController@detailApiLog')->name('api-logs.detail');
    });
    Route::prefix('job-logs')->group(function(){
        Route::get('/', 'LogController@jobLogs')->name('job-logs.index');
        Route::post('/{id}/detail', 'LogController@detailJobLog')->name('job-logs.detail');
    });
});

Route::get('/api/jadwal', function() {
    return [
        [
            'id' => 1,
            'title' => 'Matematika',
            'start' => '2025-10-27T08:00:00',
            'end' => '2025-10-27T09:00:00',
            'extendedProps' => [
                'guru' => 'Pak Budi',
                'kelas' => 'X IPA 1'
            ]
        ],
    ];
});

Route::post('/api/jadwal', function(Request $request) {
    return response()->json(['status' => 'ok']);
});

Route::put('/api/jadwal/{id}', function($id, Request $request) {
    return response()->json(['status' => 'updated']);
});

Route::delete('/api/jadwal/{id}', function($id) {
    return response()->json(['status' => 'deleted']);
});
Route::get('/jadwal', function () {
    return view('pages.jadwal.index');
})->name('jadwal.index');
