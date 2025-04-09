<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!$request->user() || !$request->user()->can($permission)) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Permission denied'], 403);
            }

            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to access this resource');
        }

        return $next($request);
    }
}
