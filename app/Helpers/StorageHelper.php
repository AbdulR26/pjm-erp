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
            return asset($path);
        }

        // Default to Laravel's public disk URL
        return Storage::disk('public')->url($path);
    }
}
