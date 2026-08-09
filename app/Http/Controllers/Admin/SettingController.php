<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    /**
     * Display the settings form page.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        $banners = Banner::orderBy('order')->get();
        $couriers = \App\Models\Courier::all();
        $paymentMethods = \App\Models\PaymentMethod::all();
        $payments = \App\Models\Payment::with('order.customer')->orderBy('created_at', 'desc')->limit(15)->get();
        $shipments = \App\Models\Shipment::with('order.customer')->orderBy('created_at', 'desc')->limit(15)->get();
        
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
        Setting::set('biteship_is_production', $request->has('biteship_is_production') ? '1' : '0');
        Setting::set('biteship_origin_postal_code', $request->biteship_origin_postal_code);
        Setting::set('biteship_origin_latitude', $request->biteship_origin_latitude);
        Setting::set('biteship_origin_longitude', $request->biteship_origin_longitude);
        Setting::set('biteship_shipper_phone', $request->biteship_shipper_phone);
        Setting::set('biteship_shipper_address', $request->biteship_shipper_address);

        // Helper to delete from public/r2 safely
        $deleteOldFile = function ($path) {
            if ($path && !filter_var($path, FILTER_VALIDATE_URL)) {
                $cleanPath = str_replace('/storage/', '', $path);
                if (Storage::disk('public')->exists($cleanPath)) {
                    Storage::disk('public')->delete($cleanPath);
                } else {
                    Storage::disk('r2')->delete($cleanPath);
                }
            }
        };

        // Handle logo file upload
        if ($request->hasFile('logo')) {
            $oldLogo = Setting::get('logo');
            $deleteOldFile($oldLogo);
            $logoPath = $request->file('logo')->store('settings', 'r2');
            Setting::set('logo', $logoPath);
        }

        // Handle favicon upload
        if ($request->hasFile('logo_favicon')) {
            $oldFavicon = Setting::get('logo_favicon');
            $deleteOldFile($oldFavicon);
            $faviconPath = $request->file('logo_favicon')->store('settings', 'r2');
            Setting::set('logo_favicon', $faviconPath);
        }

        // Handle banner 1 image upload
        if ($request->hasFile('side_banner_1_image')) {
            $oldImg = Setting::get('side_banner_1_image');
            $deleteOldFile($oldImg);
            $banner1Path = $request->file('side_banner_1_image')->store('settings', 'r2');
            Setting::set('side_banner_1_image', $banner1Path);
        }

        // Handle banner 2 image upload
        if ($request->hasFile('side_banner_2_image')) {
            $oldImg = Setting::get('side_banner_2_image');
            $deleteOldFile($oldImg);
            $banner2Path = $request->file('side_banner_2_image')->store('settings', 'r2');
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

        $imagePath = $request->file('image')->store('uploads/banners', 'r2');
        $imageUrl = Storage::disk('r2')->url($imagePath);
        
        Banner::create([
            'title' => $request->title,
            'subtitle' => $request->subtitle,
            'badge' => $request->badge,
            'button_text' => $request->button_text,
            'image' => $imageUrl,
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
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            } else {
                $parsed = parse_url($banner->image);
                $r2Path = ltrim($parsed['path'] ?? '', '/');
                Storage::disk('r2')->delete($r2Path);
            }

            $imagePath = $request->file('image')->store('uploads/banners', 'r2');
            $data['image'] = Storage::disk('r2')->url($imagePath);
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
        if (Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        } else {
            $parsed = parse_url($banner->image);
            $r2Path = ltrim($parsed['path'] ?? '', '/');
            Storage::disk('r2')->delete($r2Path);
        }

        $banner->delete();

        return redirect()->back()->with('success', 'Banner slider berhasil dihapus.');
    }

    /**
     * Sync couriers from Biteship API.
     */
    public function syncCouriers(\App\Services\BiteshipService $biteshipService)
    {
        try {
            $biteshipCouriers = $biteshipService->getAvailableCouriers();
            
            if (empty($biteshipCouriers)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada data kurir yang dikembalikan dari Biteship.'
                ], 422);
            }

            // Group by courier_code
            $groupedCouriers = [];
            foreach ($biteshipCouriers as $item) {
                $code = $item['courier_code'] ?? null;
                $name = $item['courier_name'] ?? null;
                $serviceName = $item['courier_service_name'] ?? '';

                if (!$code || !$name) {
                    continue;
                }

                if (!isset($groupedCouriers[$code])) {
                    $groupedCouriers[$code] = [
                        'code' => $code,
                        'name' => $name,
                        'services' => []
                    ];
                }

                if (!empty($serviceName) && !in_array($serviceName, $groupedCouriers[$code]['services'])) {
                    $groupedCouriers[$code]['services'][] = $serviceName;
                }
            }

            // Update or create in database
            foreach ($groupedCouriers as $code => $data) {
                \App\Models\Courier::updateOrCreate(
                    ['code' => $code],
                    [
                        'name' => $data['name'],
                        'service_names' => implode(', ', $data['services']),
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Berhasil menyinkronkan data kurir dari Biteship.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal sinkronisasi kurir: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle active status of a courier.
     */
    public function toggleCourier($id)
    {
        try {
            $courier = \App\Models\Courier::findOrFail($id);
            $courier->is_active = !$courier->is_active;
            $courier->save();

            return response()->json([
                'success' => true,
                'message' => "Kurir {$courier->name} berhasil " . ($courier->is_active ? 'diaktifkan' : 'dinonaktifkan') . ".",
                'is_active' => $courier->is_active
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status kurir: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle active status of a Midtrans payment method.
     */
    public function togglePaymentMethod($id)
    {
        try {
            $paymentMethod = \App\Models\PaymentMethod::findOrFail($id);
            $paymentMethod->is_active = !$paymentMethod->is_active;
            $paymentMethod->save();

            return response()->json([
                'success' => true,
                'message' => "Metode pembayaran {$paymentMethod->name} berhasil " . ($paymentMethod->is_active ? 'diaktifkan' : 'dinonaktifkan') . ".",
                'is_active' => $paymentMethod->is_active
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status metode pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download database SQL backup.
     */
    public function downloadBackup()
    {
        $dbName = config('database.connections.' . config('database.default') . '.database');
        $tables = DB::select('SHOW TABLES');
        $keyName = 'Tables_in_' . $dbName;
        
        $tableNames = [];
        foreach ($tables as $table) {
            if (isset($table->$keyName)) {
                $tableNames[] = $table->$keyName;
            } else {
                $array = (array) $table;
                $tableNames[] = reset($array);
            }
        }

        $appName = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', Setting::get('app_short_name', 'pjm')));
        $filename = 'backup-' . $appName . '-' . date('Y-m-d_H-i-s') . '.sql';

        return response()->streamDownload(function () use ($tableNames) {
            echo "-- Database Backup for " . config('app.name', 'Laravel') . "\n";
            echo "-- Date: " . date('Y-m-d H:i:s') . "\n\n";
            echo "SET FOREIGN_KEY_CHECKS=0;\n\n";

            $pdo = DB::getPdo();

            foreach ($tableNames as $table) {
                $createTable = DB::select("SHOW CREATE TABLE `$table`");
                if (!empty($createTable)) {
                    $createSql = ((array)$createTable[0])['Create Table'] ?? null;
                    if ($createSql) {
                        echo "DROP TABLE IF EXISTS `$table`;\n";
                        echo $createSql . ";\n\n";
                    }
                }

                $rows = DB::table($table)->get();
                if ($rows->isNotEmpty()) {
                    foreach ($rows->chunk(100) as $chunk) {
                        $insertSql = "INSERT INTO `$table` VALUES ";
                        $valueLines = [];
                        foreach ($chunk as $row) {
                            $values = [];
                            foreach ((array)$row as $val) {
                                if (is_null($val)) {
                                    $values[] = "NULL";
                                } elseif (is_numeric($val) && !is_string($val)) {
                                    $values[] = $val;
                                } else {
                                    $values[] = $pdo->quote($val);
                                }
                            }
                            $valueLines[] = "(" . implode(", ", $values) . ")";
                        }
                        $insertSql .= implode(",\n", $valueLines) . ";\n";
                        echo $insertSql . "\n";
                    }
                }
                echo "\n";
            }

            echo "SET FOREIGN_KEY_CHECKS=1;\n";
        }, $filename, [
            'Content-Type' => 'application/sql',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Reset database data preserving users, roles, permissions, settings, and migrations.
     */
    public function resetData(Request $request)
    {
        $request->validate([
            'confirm_text' => 'required|string',
        ]);

        if (strtoupper(trim($request->confirm_text)) !== 'RESET') {
            return redirect()->back()->withErrors(['confirm_text' => 'Kata konfirmasi harus persis tulisan RESET.']);
        }

        $preservedTables = [
            'users',
            'roles',
            'permissions',
            'model_has_roles',
            'model_has_permissions',
            'role_has_permissions',
            'migrations',
            'settings',
            'order_statuses',
            'product_statuses',
            'product_types',
            'sessions',
            'cache',
            'cache_locks',
        ];

        try {
            $tables = DB::select('SHOW TABLES');
            $allTables = [];
            foreach ($tables as $table) {
                $array = (array) $table;
                $tableName = reset($array);
                if ($tableName) {
                    $allTables[] = $tableName;
                }
            }

            $tablesToReset = array_diff($allTables, $preservedTables);

            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            foreach ($tablesToReset as $table) {
                DB::table($table)->truncate();
            }
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            return redirect()->back()->with('success', 'Semua data operasional & transaksi berhasil di-reset. Data User, Role, Permission, dan Pengaturan Sistem tetap dipertahankan.');
        } catch (\Throwable $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return redirect()->back()->withErrors(['error' => 'Gagal mereset data: ' . $e->getMessage()]);
        }
    }

    public function testMidtrans(Request $request)
    {
        $serverKey = $request->input('midtrans_server_key');
        $isProduction = $request->has('midtrans_is_production') ? ($request->input('midtrans_is_production') == '1' || $request->input('midtrans_is_production') === true) : null;

        $midtransService = new \App\Services\MidtransService();
        $result = $midtransService->testConnection($serverKey, $isProduction);

        return response()->json($result);
    }

    public function testBiteship(Request $request)
    {
        $apiKey = $request->input('biteship_api_key');
        $isProduction = $request->has('biteship_is_production') ? ($request->input('biteship_is_production') == '1' || $request->input('biteship_is_production') === true) : null;

        $biteshipService = new \App\Services\BiteshipService();
        $result = $biteshipService->testConnection($apiKey, $isProduction);

        return response()->json($result);
    }
}
