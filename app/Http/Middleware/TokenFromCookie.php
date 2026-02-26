<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
class TokenFromCookie
{

    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('auth_token');
        
        if ($token && !$request->bearerToken()) {
            $request->headers->set('Authorization', 'Bearer ' . $token);
            $request->server->set('HTTP_AUTHORIZATION', 'Bearer ' . $token);
        }
        return $next($request);
    }
}