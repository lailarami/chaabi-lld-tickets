<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app'     => 'Chaabi LLD - Ticketing API',
        'version' => '1.0.0',
        'status'  => 'running',
    ]);
});
