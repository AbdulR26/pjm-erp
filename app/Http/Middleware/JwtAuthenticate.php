<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Support\Facades\Auth;

class JwtAuthenticate
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'status'  => 'UNAUTHORIZED',
                'message' => 'Authorization header (Bearer token) is required.'
            ], 401);
        }

        $token = substr($authHeader, 7);
        $decoded = JwtService::decode($token);

        if (!$decoded || !isset($decoded['sub'])) {
            return response()->json([
                'status'  => 'UNAUTHORIZED',
                'message' => 'Token is invalid or has expired.'
            ], 401);
        }

        $user = User::find($decoded['sub']);
        if (!$user) {
            return response()->json([
                'status'  => 'UNAUTHORIZED',
                'message' => 'User associated with this token not found.'
            ], 401);
        }

        // Authenticate user in context
        Auth::setUser($user);

        return $next($request);
    }
}
