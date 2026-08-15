<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class StorageHelper
{
    public static function url($path)
    {
        if (!$path) {
            return null;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        $path = ltrim($path, '/');

        if (str_starts_with($path, 'storage/')) {
            $localPath = str_replace('storage/', '', $path);
            if (Storage::disk('public')->exists($localPath)) {
                return asset($path);
            }
            return app(\App\Services\CloudflareR2Service::class)->url($localPath);
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }

        return app(\App\Services\CloudflareR2Service::class)->url($path);
    }
}

