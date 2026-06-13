<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\ProductPrice;
use App\Models\StockMutation;
use App\Models\User;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@pjm.com')->first();
        $adminId = $adminUser ? $adminUser->id : 1;

        // 1. Seed Categories Tree
        // Root Category 1
        $spareparts = Category::create([
            'name' => 'Suku Cadang & Oli',
            'slug' => 'suku-cadang-dan-oli'
        ]);

        // Level 2 Categories
        $mesin = Category::create([
            'parent_id' => $spareparts->id,
            'name' => 'Mesin & Transmisi',
            'slug' => 'mesin-dan-transmisi'
        ]);
        $pengereman = Category::create([
            'parent_id' => $spareparts->id,
            'name' => 'Sistem Pengereman',
            'slug' => 'sistem-pengereman'
        ]);
        $kakikaki = Category::create([
            'parent_id' => $spareparts->id,
            'name' => 'Kaki-Kaki & Ban',
            'slug' => 'kaki-kaki-dan-ban'
        ]);
        $pelumas = Category::create([
            'parent_id' => $spareparts->id,
            'name' => 'Pelumas & Aki',
            'slug' => 'pelumas-dan-aki'
        ]);

        // Level 3 Categories (Leaf nodes)
        $filter = Category::create(['parent_id' => $mesin->id, 'name' => 'Filter Oli & Udara', 'slug' => 'filter-oli-dan-udara']);
        $busi = Category::create(['parent_id' => $mesin->id, 'name' => 'Busi & Pengapian', 'slug' => 'busi-dan-pengapian']);
        $piston = Category::create(['parent_id' => $mesin->id, 'name' => 'Piston & Klep', 'slug' => 'piston-dan-klep']);

        $kampas = Category::create(['parent_id' => $pengereman->id, 'name' => 'Kampas Rem', 'slug' => 'kampas-rem']);
        $cakram = Category::create(['parent_id' => $pengereman->id, 'name' => 'Piringan Cakram / Disc', 'slug' => 'piringan-cakram-atau-disc']);

        $shock = Category::create(['parent_id' => $kakikaki->id, 'name' => 'Shockbreaker', 'slug' => 'shockbreaker']);
        $velg = Category::create(['parent_id' => $kakikaki->id, 'name' => 'Velg & Ban Mobil', 'slug' => 'velg-dan-ban-mobil']);

        $oli = Category::create(['parent_id' => $pelumas->id, 'name' => 'Oli Mesin Mobil', 'slug' => 'oli-mesin-mobil']);
        $aki = Category::create(['parent_id' => $pelumas->id, 'name' => 'Aki Basah & Kering', 'slug' => 'aki-basah-dan-kering']);


        // Root Category 2
        $aksesoris = Category::create([
            'name' => 'Aksesoris & Variasi',
            'slug' => 'aksesoris-dan-variasi'
        ]);

        // Level 2 Categories (Leaf nodes)
        $dashcam = Category::create(['parent_id' => $aksesoris->id, 'name' => 'Kamera Mobil & Dashcam', 'slug' => 'kamera-mobil-dan-dashcam']);
        $lampu = Category::create(['parent_id' => $aksesoris->id, 'name' => 'Lampu LED & Xenon', 'slug' => 'lampu-led-dan-xenon']);
        $karpet = Category::create(['parent_id' => $aksesoris->id, 'name' => 'Karpet & Cover Mobil', 'slug' => 'karpet-dan-cover-mobil']);


        // 2. Seed Product 1: Oli Mesin Shell
        $prod1 = Product::create([
            'category_id' => $oli->id,
            'name' => 'Oli Mesin Shell Helix Ultra 5W-40 Fully Synthetic',
            'slug' => 'oli-mesin-shell-helix-ultra-5w-40-fully-synthetic',
            'description' => 'Shell Helix Ultra 5W-40 merupakan pelumas mesin mobil fully synthetic dengan teknologi pembersih aktif Shell PurePlus. Memberikan perlindungan keausan mesin yang maksimal di segala kondisi jalan.',
            'main_image' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
            'badge' => 'Laris',
            'rating' => 4.9,
            'sold_count' => 180,
            'attributes' => [
                'brand' => 'Shell',
                'viscosity' => 'SAE 5W-40',
                'base_oil' => 'Fully Synthetic',
                'api_service' => 'API SP / SN Plus'
            ]
        ]);

        ProductImage::create([
            'product_id' => $prod1->id,
            'image_path' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=150&q=80'
        ]);
        ProductImage::create([
            'product_id' => $prod1->id,
            'image_path' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80'
        ]);

        // Variants for Product 1
        $v1 = ProductVariant::create([
            'product_id' => $prod1->id,
            'name' => 'Kemasan 4 Liter',
            'base_price' => 450000,
            'stock' => 42,
            'sku' => 'SH-HU-5W40-4L'
        ]);
        $v2 = ProductVariant::create([
            'product_id' => $prod1->id,
            'name' => 'Kemasan 1 Liter',
            'base_price' => 125000,
            'stock' => 15,
            'sku' => 'SH-HU-5W40-1L'
        ]);

        // Prices for Product 1 - Varian 4L
        ProductPrice::create(['product_variant_id' => $v1->id, 'level' => 'retail', 'min_qty' => 1, 'price' => 450000]);
        ProductPrice::create(['product_variant_id' => $v1->id, 'level' => 'retail', 'min_qty' => 6, 'price' => 430000]); // Wholesale
        ProductPrice::create(['product_variant_id' => $v1->id, 'level' => 'bengkel', 'min_qty' => 1, 'price' => 410000]); // B2B level
        // Prices for Product 1 - Varian 1L
        ProductPrice::create(['product_variant_id' => $v2->id, 'level' => 'retail', 'min_qty' => 1, 'price' => 125000]);
        ProductPrice::create(['product_variant_id' => $v2->id, 'level' => 'bengkel', 'min_qty' => 1, 'price' => 115000]);

        // Mutations for Product 1
        StockMutation::create([
            'product_variant_id' => $v1->id,
            'user_id' => $adminId,
            'type' => 'in',
            'quantity' => 50,
            'source' => 'purchase',
            'notes' => 'Restock Bulanan Supplier Utama'
        ]);
        StockMutation::create([
            'product_variant_id' => $v1->id,
            'user_id' => $adminId,
            'type' => 'out',
            'quantity' => 8,
            'source' => 'sale',
            'notes' => 'Penjualan Pembeli via Web'
        ]);


        // 3. Seed Product 2: Kampas Rem Bendix
        $prod2 = Product::create([
            'category_id' => $kampas->id,
            'name' => 'Kampas Rem Depan Bendix General CT Ceramic',
            'slug' => 'kampas-rem-depan-bendix-general-ct-ceramic',
            'description' => 'Kampas rem keramik Bendix General CT memberikan performa pengereman senyap, minim debu, dan daya tahan piringan cakram yang lama dengan teknologi Blue Titanium Stripe.',
            'main_image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
            'badge' => '100% Ori',
            'rating' => 4.8,
            'sold_count' => 95,
            'attributes' => [
                'brand' => 'Bendix',
                'material' => 'Ceramic / Keramik',
                'position' => 'Roda Depan (Front)'
            ]
        ]);

        ProductImage::create([
            'product_id' => $prod2->id,
            'image_path' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=150&q=80'
        ]);

        // Variants for Product 2
        $v3 = ProductVariant::create([
            'product_id' => $prod2->id,
            'name' => 'Toyota Avanza/Xenia',
            'base_price' => 320000,
            'stock' => 24,
            'sku' => 'BX-GCT-AVZ-F'
        ]);
        $v4 = ProductVariant::create([
            'product_id' => $prod2->id,
            'name' => 'Honda Jazz/Brio',
            'base_price' => 310000,
            'stock' => 18,
            'sku' => 'BX-GCT-JAZ-F'
        ]);

        // Prices for Product 2 - Varian Avanza
        ProductPrice::create(['product_variant_id' => $v3->id, 'level' => 'retail', 'min_qty' => 1, 'price' => 320000]);
        ProductPrice::create(['product_variant_id' => $v3->id, 'level' => 'retail', 'min_qty' => 5, 'price' => 300000]);
        ProductPrice::create(['product_variant_id' => $v3->id, 'level' => 'bengkel', 'min_qty' => 1, 'price' => 280000]);

        // Mutations for Product 2
        StockMutation::create([
            'product_variant_id' => $v3->id,
            'user_id' => $adminId,
            'type' => 'in',
            'quantity' => 30,
            'source' => 'purchase',
            'notes' => 'Kirim dari Gudang Pusat'
        ]);
    }
}
