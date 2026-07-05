<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Display the settings form page.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        $banners = Banner::orderBy('order')->get();
        
        $title = 'Pengaturan Aplikasi';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['name' => "Settings"],
        ];
        $pageConfigs = ['pageHeader' => true, 'isFabButton' => false];

        return view('admin.settings.index', get_defined_vars());
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            // General & Toko
            'app_name' => 'required|string|max:100',
            'app_short_name' => 'required|string|max:20',
            'primary_color' => 'required|string|max:10',
            'secondary_color' => 'required|string|max:10',
            'store_name' => 'required|string|max:100',
            'store_email' => 'nullable|email|max:100',
            'store_phone' => 'nullable|string|max:30',
            'store_whatsapp' => 'nullable|string|max:30',
            'store_address' => 'nullable|string',
            'store_city' => 'nullable|string|max:100',

            // Socials
            'social_instagram' => 'nullable|url',
            'social_facebook' => 'nullable|url',
            'social_tiktok' => 'nullable|url',

            // Promo Banners
            'side_banner_1_badge' => 'nullable|string|max:50',
            'side_banner_1_title' => 'nullable|string|max:150',
            'side_banner_1_subtitle' => 'nullable|string|max:200',
            'side_banner_1_link' => 'nullable|string',
            'side_banner_1_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

            'side_banner_2_badge' => 'nullable|string|max:50',
            'side_banner_2_title' => 'nullable|string|max:150',
            'side_banner_2_subtitle' => 'nullable|string|max:200',
            'side_banner_2_link' => 'nullable|string',
            'side_banner_2_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

            // Flash Sale
            'flash_sale_end_time' => 'nullable|string',

            // Midtrans
            'midtrans_merchant_id' => 'nullable|string',
            'midtrans_client_key' => 'nullable|string',
            'midtrans_server_key' => 'nullable|string',
            
            // Biteship
            'biteship_api_key' => 'nullable|string',
            'biteship_origin_postal_code' => 'nullable|string',
            'biteship_origin_latitude' => 'nullable|numeric',
            'biteship_origin_longitude' => 'nullable|numeric',
            'biteship_shipper_phone' => 'nullable|string',
            'biteship_shipper_address' => 'nullable|string',
            
            // Files
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'logo_favicon' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,ico|max:1024',
        ]);

        // General settings
        Setting::set('app_name', $request->app_name);
        Setting::set('app_short_name', $request->app_short_name);
        Setting::set('primary_color', $request->primary_color);
        Setting::set('secondary_color', $request->secondary_color);

        // Toko settings
        Setting::set('store_name', $request->store_name);
        Setting::set('store_email', $request->store_email);
        Setting::set('store_phone', $request->store_phone);
        Setting::set('store_whatsapp', $request->store_whatsapp);
        Setting::set('store_address', $request->store_address);
        Setting::set('store_city', $request->store_city);

        // Socials
        Setting::set('social_instagram', $request->social_instagram);
        Setting::set('social_facebook', $request->social_facebook);
        Setting::set('social_tiktok', $request->social_tiktok);

        // Promo Banners Text
        Setting::set('side_banner_1_badge', $request->side_banner_1_badge);
        Setting::set('side_banner_1_title', $request->side_banner_1_title);
        Setting::set('side_banner_1_subtitle', $request->side_banner_1_subtitle);
        Setting::set('side_banner_1_link', $request->side_banner_1_link);

        Setting::set('side_banner_2_badge', $request->side_banner_2_badge);
        Setting::set('side_banner_2_title', $request->side_banner_2_title);
        Setting::set('side_banner_2_subtitle', $request->side_banner_2_subtitle);
        Setting::set('side_banner_2_link', $request->side_banner_2_link);

        // Flash Sale
        Setting::set('flash_sale_end_time', $request->flash_sale_end_time);

        // Midtrans
        Setting::set('midtrans_merchant_id', $request->midtrans_merchant_id);
        Setting::set('midtrans_client_key', $request->midtrans_client_key);
        Setting::set('midtrans_server_key', $request->midtrans_server_key);
        Setting::set('midtrans_is_production', $request->has('midtrans_is_production') ? '1' : '0');

        // Biteship
        Setting::set('biteship_api_key', $request->biteship_api_key);
        Setting::set('biteship_origin_postal_code', $request->biteship_origin_postal_code);
        Setting::set('biteship_origin_latitude', $request->biteship_origin_latitude);
        Setting::set('biteship_origin_longitude', $request->biteship_origin_longitude);
        Setting::set('biteship_shipper_phone', $request->biteship_shipper_phone);
        Setting::set('biteship_shipper_address', $request->biteship_shipper_address);

        // Handle logo file upload
        if ($request->hasFile('logo')) {
            $oldLogo = Setting::get('logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }
            $logoPath = $request->file('logo')->store('settings', 'public');
            Setting::set('logo', $logoPath);
        }

        // Handle favicon upload
        if ($request->hasFile('logo_favicon')) {
            $oldFavicon = Setting::get('logo_favicon');
            if ($oldFavicon) {
                Storage::disk('public')->delete($oldFavicon);
            }
            $faviconPath = $request->file('logo_favicon')->store('settings', 'public');
            Setting::set('logo_favicon', $faviconPath);
        }

        // Handle banner 1 image upload
        if ($request->hasFile('side_banner_1_image')) {
            $oldImg = Setting::get('side_banner_1_image');
            if ($oldImg && !filter_var($oldImg, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($oldImg);
            }
            $banner1Path = $request->file('side_banner_1_image')->store('settings', 'public');
            Setting::set('side_banner_1_image', $banner1Path);
        }

        // Handle banner 2 image upload
        if ($request->hasFile('side_banner_2_image')) {
            $oldImg = Setting::get('side_banner_2_image');
            if ($oldImg && !filter_var($oldImg, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($oldImg);
            }
            $banner2Path = $request->file('side_banner_2_image')->store('settings', 'public');
            Setting::set('side_banner_2_image', $banner2Path);
        }

        return redirect()->back()->with('success', 'Pengaturan aplikasi berhasil diperbarui.');
    }

    /**
     * Store a new carousel banner.
     */
    public function storeBanner(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge' => 'nullable|string|max:255',
            'button_text' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:2048',
            'link' => 'nullable|string',
            'order' => 'integer',
        ]);

        $imagePath = $request->file('image')->store('uploads/banners', 'public');
        
        Banner::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'badge' => $request->badge,
            'button_text' => $request->button_text,
            'image' => '/storage/' . $imagePath,
            'link' => $request->link,
            'order' => $request->order ?? 0,
            'is_active' => $request->has('is_active') ? true : false,
        ]);

        return redirect()->back()->with('success', 'Banner slider berhasil ditambahkan.');
    }

    /**
     * Update an existing carousel banner.
     */
    public function updateBanner(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge' => 'nullable|string|max:255',
            'button_text' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:2048',
            'link' => 'nullable|string',
            'order' => 'integer',
        ]);

        $data = [
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'badge' => $request->badge,
            'button_text' => $request->button_text,
            'link' => $request->link,
            'order' => $request->order ?? 0,
            'is_active' => $request->has('is_active') ? true : false,
        ];

        if ($request->hasFile('image')) {
            // Delete old file
            $oldPath = str_replace('/storage/', '', $banner->image);
            Storage::disk('public')->delete($oldPath);

            $imagePath = $request->file('image')->store('uploads/banners', 'public');
            $data['image'] = '/storage/' . $imagePath;
        }

        $banner->update($data);

        return redirect()->back()->with('success', 'Banner slider berhasil diperbarui.');
    }

    /**
     * Delete a carousel banner.
     */
    public function deleteBanner($id)
    {
        $banner = Banner::findOrFail($id);

        // Delete file
        $oldPath = str_replace('/storage/', '', $banner->image);
        Storage::disk('public')->delete($oldPath);

        $banner->delete();

        return redirect()->back()->with('success', 'Banner slider berhasil dihapus.');
    }
}
