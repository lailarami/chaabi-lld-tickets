<?php

return [
    'defaults' => [
        'guard'     => 'web',
        'passwords' => 'utilisateurs',
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'utilisateurs',
        ],
        'sanctum' => [
            'driver'   => 'sanctum',
            'provider' => 'utilisateurs',
        ],
    ],

    'providers' => [
        'utilisateurs' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Utilisateur::class,
        ],
    ],

    'passwords' => [
        'utilisateurs' => [
            'provider' => 'utilisateurs',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];
