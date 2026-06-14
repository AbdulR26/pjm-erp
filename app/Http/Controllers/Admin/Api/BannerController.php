<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('order')->get();
        return response()->json([
            'status' => 'success',
            'banners' => $banners
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge' => 'nullable|string|max:255',
            'button_text' => 'required|string|max:255',
            'image' => 'required|string',
            'link' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean'
        ]);

        $banner = Banner::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Banner berhasil ditambahkan.',
            'banner' => $banner
        ]);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge' => 'nullable|string|max:255',
            'button_text' => 'required|string|max:255',
            'image' => 'required|string',
            'link' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean'
        ]);

        $banner->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Banner berhasil diperbarui.',
            'banner' => $banner
        ]);
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Banner berhasil dihapus.'
        ]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:2048'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            // Store in storage/app/public/uploads/banners
            $path = $file->store('uploads/banners', 'public');
            
            return response()->json([
                'status' => 'success',
                'url' => '/storage/' . $path
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Gagal mengunggah berkas.'
        ], 400);
    }
}
