<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    /**
     * Get list of e-commerce products formatted for the React customer frontend.
     */
    public function index()
    {
        $products = Product::with(['category', 'variants'])->get();

        $formatted = $products->map(function ($product) {
            $firstVariant = $product->variants->first();
            $basePrice = $firstVariant ? (float) $firstVariant->base_price : 0.0;

            // Generate some nice dummy discount for display if product has badge
            $discount = 0;
            $originalPrice = $basePrice;
            if ($product->badge || $product->is_flash_sale) {
                // Determine a deterministic or semi-random discount based on id
                $discount = ($product->id % 3 === 0) ? 15 : (($product->id % 2 === 0) ? 10 : 20);
                $originalPrice = round($basePrice / (1 - ($discount / 100)));
                // Round to nearest 1000
                $originalPrice = round($originalPrice / 1000) * 1000;
            }

            // Specs mapping: combine attributes
            $specs = [];
            if ($product->attributes) {
                foreach ($product->attributes as $key => $val) {
                    // Beautify key names
                    $prettyKey = match(strtolower($key)) {
                        'brand' => 'Merk',
                        'viscosity' => 'Viskositas',
                        'base_oil' => 'Bahan Dasar',
                        'volume' => 'Volume / Isi',
                        'voltage' => 'Tegangan',
                        'capacity' => 'Kapasitas',
                        'material' => 'Bahan',
                        'gap' => 'Celah Elektroda',
                        'diameter' => 'Diameter',
                        'electrodes' => 'Jumlah Elektroda',
                        'compatibility' => 'Kesesuaian Mobil',
                        'position' => 'Posisi Pasang',
                        'type' => 'Tipe',
                        'socket' => 'Soket',
                        'scent' => 'Aroma',
                        'features' => 'Fitur Utama',
                        'resolution' => 'Resolusi',
                        'angle' => 'Sudut Pandang',
                        'use_case' => 'Penggunaan',
                        'scent' => 'Aroma',
                        default => ucfirst($key)
                    };
                    $specs[$prettyKey] = $val;
                }
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category ? $product->category->name : 'Uncategorized',
                'price' => $basePrice,
                'originalPrice' => $originalPrice,
                'discount' => $discount,
                'rating' => (float) $product->rating,
                'sold' => (int) $product->sold_count,
                'image' => $product->main_image ?: '/images/default-product.png',
                'badge' => $product->badge,
                'description' => $product->description,
                'specs' => !empty($specs) ? $specs : null,
                'variants' => $product->variants->pluck('name')->toArray(),
                'is_flash_sale' => (bool) $product->is_flash_sale,
                'flash_sale_stock' => (int) $product->flash_sale_stock
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Get list of categories.
     */
    public function categories()
    {
        $categories = Category::withCount('products')->get();
        return response()->json($categories);
    }

    /**
     * Get list of active banners for the client homepage carousel.
     */
    public function banners()
    {
        $banners = Banner::where('is_active', true)->orderBy('order')->get();
        return response()->json($banners);
    }

    /**
     * Get list of store settings.
     */
    public function settings()
    {
        $settings = Setting::all()->pluck('value', 'key');
        $settings['midtrans_client_key'] = config('midtrans.client_key');
        $settings['midtrans_is_production'] = config('midtrans.is_production');
        return response()->json($settings);
    }
}
