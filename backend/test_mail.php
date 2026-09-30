<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Application;
use Illuminate\Contracts\Console\Kernel;

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(Kernel::class)->bootstrap();

try {
    Mail::raw('Test email from Chaabi LLD', function ($message) {
        $message->to('test@example.com')->subject('Test Email');
    });
    echo "Email sent successfully!\n";
} catch (\Exception $e) {
    echo "Error sending email: " . $e->getMessage() . "\n";
}