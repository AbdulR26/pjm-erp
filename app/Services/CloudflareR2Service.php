<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CloudflareR2Service
{
    /**
     * Upload a file to Cloudflare R2 storage.
     *
     * @param UploadedFile $file The file from request
     * @param string $folder The destination folder in the bucket
     * @param string|null $filename Custom filename (optional)
     * @return string The relative path of the uploaded file
     */
    public function upload(UploadedFile $file, string $folder = 'uploads', ?string $filename = null): string
    {
        $disk = Storage::disk('r2');

        // Generate unique filename if not provided
        if (!$filename) {
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        }

        $path = rtrim($folder, '/') . '/' . $filename;

        // Store file on R2 disk
        $disk->put($path, file_get_contents($file->getRealPath()));

        return $path;
    }

    /**
     * Get the full public URL of a file stored in R2.
     *
     * @param string|null $path The relative path of the file
     * @return string|null The absolute public URL, or null if path is empty
     */
    public function url(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // Clean leading slashes
        $path = ltrim($path, '/');

        // Check if a custom R2 public URL domain is defined in configuration
        $baseUrl = config('filesystems.disks.r2.url');

        if ($baseUrl) {
            return rtrim($baseUrl, '/') . '/' . $path;
        }

        // Fallback to Laravel Storage's URL generator
        return Storage::disk('r2')->url($path);
    }

    /**
     * Delete a file from Cloudflare R2 storage.
     *
     * @param string|null $path The relative path of the file
     * @return bool True if successful, false otherwise
     */
    public function delete(?string $path): bool
    {
        if (!$path) {
            return false;
        }

        $disk = Storage::disk('r2');

        if ($disk->exists($path)) {
            return $disk->delete($path);
        }

        return false;
    }
}
