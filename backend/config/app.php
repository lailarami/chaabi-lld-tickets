<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

return [
    'name'            => env('APP_NAME', 'Chaabi LLD Ticketing'),
    'env'             => env('APP_ENV', 'production'),
    'debug'           => (bool) env('APP_DEBUG', false),
    'url'             => env('APP_URL', 'http://localhost'),
    'timezone'        => 'Africa/Casablanca',
    'locale'          => 'fr',
    'fallback_locale' => 'fr',
    'faker_locale'    => 'fr_MA',
    'cipher'          => 'AES-256-CBC',
    'key'             => env('APP_KEY'),
    'previous_keys'   => array_filter(explode(',', env('APP_PREVIOUS_KEYS', ''))),
    'maintenance'     => ['driver' => 'file'],
    'providers'       => ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
    ])->toArray(),
    'aliases' => Facade::defaultAliases()->merge([])->toArray(),
];
