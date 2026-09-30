<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Ticket;
use App\Policies\TicketPolicy;

class AppServiceProvider extends ServiceProvider
{
    protected $policies = [
        Ticket::class => TicketPolicy::class,
    ];

    public function register(): void {}

    public function boot(): void
    {
        // Force HTTPS in production
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Register policies
        \Illuminate\Support\Facades\Gate::policy(Ticket::class, TicketPolicy::class);
    }
}
