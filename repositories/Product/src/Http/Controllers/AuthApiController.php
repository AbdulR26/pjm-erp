<?php

namespace Qollam\Product\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Support\Facades\Hash;
use Qollam\Product\Http\Resources\ProductResource;

class AuthApiController extends Controller
{
    /**
     * Authenticate user and issue JWT token.
     */
    public function login(Request $request)
    {
        return ProductResource::render(function () use ($request) {
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status'  => 'UNAUTHORIZED',
                    'message' => 'Invalid email or password.'
                ], 401);
            }

            // Generate JWT valid for 24 hours
            $token = JwtService::encode([
                'sub'   => $user->id,
                'email' => $user->email,
                'name'  => $user->name,
            ], 86400);

            return response()->json([
                'status'  => 'SUCCESS',
                'message' => 'Login successful.',
                'token'   => $token,
                'user'    => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                ]
            ]);
        });
    }
}
