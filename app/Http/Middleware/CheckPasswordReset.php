<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPasswordReset
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && auth()->user()->restablecimiento == 0) {
            if (!$request->routeIs('password.change') && 
                !$request->routeIs('password.change.update') &&
                !$request->routeIs('logout')) {
                return redirect()->route('password.change');
            }
        }

        return $next($request);
    }
}