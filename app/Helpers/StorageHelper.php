<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class StorageHelper
{
    /**
     * Get the public URL for a given storage path.
     *
     * @param string|null $path
     * @return string|null
     */
    public static function url($path)
    {
        if (!$path) {
            return null;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // Clean leading slashes
        $path = ltrim($path, '/');

        // If it already points to the storage folder
        if (str_starts_with($path, 'storage/')) {
            $localPath = str_replace('storage/', '', $path);
            if (Storage::disk('public')->exists($localPath)) {
                return asset($path);
            }
            return Storage::disk('r2')->url($localPath);
        }

        // Default to Laravel's public disk URL if exists, otherwise fallback to r2
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->url($path);
        }

        return Storage::disk('r2')->url($path);
    }
}
