<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's route middleware.
     *
     * @var array
     */
    protected $routeMiddleware = [
        // Add to the $routeMiddleware array:
        'permission' => \App\Http\Middleware\CheckPermission::class,
    ];
}
