<?php

namespace App\Services;

class JwtService
{
    /**
     * Encode data to base64Url format.
     */
    private static function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    /**
     * Decode data from base64Url format.
     */
    private static function base64UrlDecode($data)
    {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    /**
     * Generate a signed JWT token.
     */
    public static function encode(array $payload, $expirySeconds = 86400)
    {
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expirySeconds;
        $payload = json_encode($payload);

        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);

        // Sign using APP_KEY config
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, config('app.key'), true);
        $base64UrlSignature = self::base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Decode and verify a JWT token. Returns null if invalid or expired.
     */
    public static function decode($token)
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($header, $payload, $signature) = $parts;

        // Verify signature matches
        $expectedSignature = hash_hmac('sha256', $header . "." . $payload, config('app.key'), true);
        if (!hash_equals(self::base64UrlEncode($expectedSignature), $signature)) {
            return null;
        }

        $decodedPayload = json_decode(self::base64UrlDecode($payload), true);
        if (!$decodedPayload) {
            return null;
        }

        // Verify expiration timestamp
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return null;
        }

        return $decodedPayload;
    }
}
