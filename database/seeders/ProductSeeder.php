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
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign keys to safely truncate
        Schema::disableForeignKeyConstraints();
        StockMutation::truncate();
        ProductPrice::truncate();
        ProductVariant::truncate();
        ProductImage::truncate();
        Product::truncate();
        Category::truncate();
        Schema::enableForeignKeyConstraints();

        $adminUser = User::where('email', 'admin@pjm.com')->first();
        $adminId = $adminUser ? $adminUser->id : 1;

        // Default Image URL for all items (generic auto-parts/car background)
        $defaultImg = '/images/default-product.png';

        // 1. SEED CATEGORIES TREE
        // Root 1: Suku Cadang & Oli
        $spareparts = Category::create(['name' => 'Suku Cadang & Oli', 'slug' => 'suku-cadang-dan-oli']);
        // Level 2 for Root 1
        $mesin = Category::create(['parent_id' => $spareparts->id, 'name' => 'Mesin & Transmisi', 'slug' => 'mesin-dan-transmisi']);
        $pengereman = Category::create(['parent_id' => $spareparts->id, 'name' => 'Sistem Pengereman', 'slug' => 'sistem-pengereman']);
        $kakikaki = Category::create(['parent_id' => $spareparts->id, 'name' => 'Kaki-Kaki & Ban', 'slug' => 'kaki-kaki-dan-ban']);
        $pelumas = Category::create(['parent_id' => $spareparts->id, 'name' => 'Pelumas & Aki', 'slug' => 'pelumas-dan-aki']);

        // Level 3 for Mesin & Transmisi
        $filter = Category::create(['parent_id' => $mesin->id, 'name' => 'Filter Oli & Udara', 'slug' => 'filter-oli-dan-udara']);
        $busi = Category::create(['parent_id' => $mesin->id, 'name' => 'Busi & Pengapian', 'slug' => 'busi-dan-pengapian']);
        $piston = Category::create(['parent_id' => $mesin->id, 'name' => 'Piston & Klep', 'slug' => 'piston-dan-klep']);
        $vanbelt = Category::create(['parent_id' => $mesin->id, 'name' => 'Van Belt & Timing Belt', 'slug' => 'van-belt-dan-timing-belt']);

        // Level 3 for Sistem Pengereman
        $kampas = Category::create(['parent_id' => $pengereman->id, 'name' => 'Kampas Rem', 'slug' => 'kampas-rem']);
        $cakram = Category::create(['parent_id' => $pengereman->id, 'name' => 'Piringan Cakram / Disc', 'slug' => 'piringan-cakram-atau-disc']);
        $minyakrem = Category::create(['parent_id' => $pengereman->id, 'name' => 'Minyak Rem', 'slug' => 'minyak-rem']);

        // Level 3 for Kaki-Kaki & Ban
        $shock = Category::create(['parent_id' => $kakikaki->id, 'name' => 'Shockbreaker', 'slug' => 'shockbreaker']);
        $velg = Category::create(['parent_id' => $kakikaki->id, 'name' => 'Velg & Ban Mobil', 'slug' => 'velg-dan-ban-mobil']);
        $tierod = Category::create(['parent_id' => $kakikaki->id, 'name' => 'Tierod & Ball Joint', 'slug' => 'tierod-dan-ball-joint']);

        // Level 3 for Pelumas & Aki
        $oli = Category::create(['parent_id' => $pelumas->id, 'name' => 'Oli Mesin Mobil', 'slug' => 'oli-mesin-mobil']);
        $aki = Category::create(['parent_id' => $pelumas->id, 'name' => 'Aki Basah & Kering', 'slug' => 'aki-basah-dan-kering']);
        $coolant = Category::create(['parent_id' => $pelumas->id, 'name' => 'Cairan Pendingin / Coolant', 'slug' => 'cairan-pendingin-dan-coolant']);

        // Root 2: Aksesoris & Variasi
        $aksesoris = Category::create(['name' => 'Aksesoris & Variasi', 'slug' => 'aksesoris-dan-variasi']);
        // Level 2 for Root 2
        $dashcam = Category::create(['parent_id' => $aksesoris->id, 'name' => 'Kamera Mobil & Dashcam', 'slug' => 'kamera-mobil-dan-dashcam']);
        $lampu = Category::create(['parent_id' => $aksesoris->id, 'name' => 'Lampu LED & Xenon', 'slug' => 'lampu-led-dan-xenon']);
        $karpet = Category::create(['parent_id' => $aksesoris->id, 'name' => 'Karpet & Cover Mobil', 'slug' => 'karpet-dan-cover-mobil']);
        $perawatan = Category::create(['parent_id' => $aksesoris->id, 'name' => 'Parfum & Perawatan Mobil', 'slug' => 'parfum-dan-perawatan-mobil']);

        // 2. DEFINE PRODUCTS DATA
        $productsData = [
            // --- OLI ---
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Shell Helix Ultra 5W-40 Fully Synthetic',
                'description' => 'Shell Helix Ultra 5W-40 merupakan pelumas mesin mobil fully synthetic dengan teknologi pembersih aktif Shell PurePlus. Memberikan perlindungan keausan mesin yang maksimal.',
                'badge' => 'Laris',
                'rating' => 4.9,
                'sold_count' => 180,
                'is_flash_sale' => true,
                'flash_sale_stock' => 25,
                'attributes' => ['brand' => 'Shell', 'viscosity' => 'SAE 5W-40', 'base_oil' => 'Fully Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 450000, 'stock' => 42, 'sku' => 'SH-HU-5W40-4L'],
                    ['name' => 'Kemasan 1 Liter', 'base_price' => 125000, 'stock' => 15, 'sku' => 'SH-HU-5W40-1L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Shell Helix HX7 10W-40 Synthetic',
                'description' => 'Shell Helix HX7 membantu menjaga mesin tetap bersih dan bekerja efisien dengan mencegah pembentukan lumpur dan deposit pada mesin.',
                'badge' => 'Rekomendasi',
                'rating' => 4.8,
                'sold_count' => 320,
                'attributes' => ['brand' => 'Shell', 'viscosity' => 'SAE 10W-40', 'base_oil' => 'Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 320000, 'stock' => 60, 'sku' => 'SH-HX7-10W40-4L'],
                    ['name' => 'Kemasan 1 Liter', 'base_price' => 85000, 'stock' => 20, 'sku' => 'SH-HX7-10W40-1L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Castrol MAGNATEC 10W-40',
                'description' => 'Castrol MAGNATEC dengan molekul pintar melekat pada permukaan mesin sejak pertama kali dihidupkan, mengurangi keausan mesin secara signifikan.',
                'badge' => 'Promo',
                'rating' => 4.7,
                'sold_count' => 210,
                'attributes' => ['brand' => 'Castrol', 'viscosity' => 'SAE 10W-40', 'base_oil' => 'Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 360000, 'stock' => 35, 'sku' => 'CS-MAG-10W40-4L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Castrol EDGE 5W-40 Fully Synthetic',
                'description' => 'Castrol EDGE dengan Fluid TITANIUM secara fisik mengubah perilakunya di bawah tekanan ekstrim untuk menjaga logam tetap terpisah dan mengurangi gesekan.',
                'badge' => 'Premium',
                'rating' => 4.9,
                'sold_count' => 90,
                'attributes' => ['brand' => 'Castrol', 'viscosity' => 'SAE 5W-40', 'base_oil' => 'Fully Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 680000, 'stock' => 12, 'sku' => 'CS-EDG-5W40-4L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Mobil 1 Triple Action Formula 5W-30',
                'description' => 'Mobil 1 Triple Action Formula memberikan perlindungan mesin luar biasa, kebersihan, dan penghematan bahan bakar yang optimal.',
                'badge' => 'Terlaris',
                'rating' => 4.9,
                'sold_count' => 150,
                'attributes' => ['brand' => 'Mobil 1', 'viscosity' => 'SAE 5W-30', 'base_oil' => 'Fully Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 620000, 'stock' => 18, 'sku' => 'MB-1-5W30-4L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Pertamina Fastron Gold 5W-30',
                'description' => 'Fastron Gold adalah pelumas sintetis berkualitas tinggi yang dirancang untuk mobil bensin modern berspesifikasi tinggi.',
                'badge' => 'Produk Lokal',
                'rating' => 4.8,
                'sold_count' => 130,
                'attributes' => ['brand' => 'Pertamina', 'viscosity' => 'SAE 5W-30', 'base_oil' => 'Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 410000, 'stock' => 25, 'sku' => 'PT-FG-5W30-4L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Pertamina Fastron Techno 10W-40',
                'description' => 'Fastron Techno dengan teknologi Nano Guard memberikan perlindungan maksimal pada setiap celah mesin terkecil.',
                'badge' => 'Ekonomis',
                'rating' => 4.6,
                'sold_count' => 400,
                'attributes' => ['brand' => 'Pertamina', 'viscosity' => 'SAE 10W-40', 'base_oil' => 'Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 280000, 'stock' => 80, 'sku' => 'PT-FT-10W40-4L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Motul H-Tech Prime 5W-40',
                'description' => 'Motul H-Tech Prime memberikan kontrol oksidasi pelumas yang sangat baik untuk mencegah pengentalan dan penuaan pelumas dini.',
                'badge' => 'High Quality',
                'rating' => 4.9,
                'sold_count' => 110,
                'attributes' => ['brand' => 'Motul', 'viscosity' => 'SAE 5W-40', 'base_oil' => 'Fully Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 520000, 'stock' => 14, 'sku' => 'MT-HT-5W40-4L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Idemitsu 10W-40 Gasoline',
                'description' => 'Idemitsu pelumas mesin bensin semi-sintetis berkualitas tinggi yang diformulasikan khusus untuk meningkatkan efisiensi bahan bakar.',
                'badge' => 'Japan Tech',
                'rating' => 4.7,
                'sold_count' => 170,
                'attributes' => ['brand' => 'Idemitsu', 'viscosity' => 'SAE 10W-40', 'base_oil' => 'Semi Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 310000, 'stock' => 30, 'sku' => 'ID-GAS-10W40-4L'],
                ]
            ],
            [
                'category_id' => $oli->id,
                'name' => 'Oli Mesin Eneos Molybdenum 10W-40',
                'description' => 'Eneos Molybdenum memberikan lapisan pelindung anti-gesek dengan teknologi aditif Molybdenum yang canggih.',
                'badge' => 'Super Smooth',
                'rating' => 4.8,
                'sold_count' => 85,
                'attributes' => ['brand' => 'Eneos', 'viscosity' => 'SAE 10W-40', 'base_oil' => 'Synthetic'],
                'variants' => [
                    ['name' => 'Kemasan 4 Liter', 'base_price' => 350000, 'stock' => 15, 'sku' => 'EN-MOLY-10W40-4L'],
                ]
            ],

            // --- AKI ---
            [
                'category_id' => $aki->id,
                'name' => 'Aki GS Astra Hybrid NS60',
                'description' => 'Aki GS Astra Hybrid memadukan keunggulan aki basah dan aki kering, minim perawatan dan siap pakai langsung.',
                'badge' => 'Populer',
                'rating' => 4.8,
                'sold_count' => 140,
                'attributes' => ['brand' => 'GS Astra', 'type' => 'Hybrid', 'voltage' => '12V', 'capacity' => '45 Ah'],
                'variants' => [
                    ['name' => 'NS60L (Kiri)', 'base_price' => 740000, 'stock' => 22, 'sku' => 'GS-HB-NS60L'],
                    ['name' => 'NS60 (Kanan)', 'base_price' => 740000, 'stock' => 18, 'sku' => 'GS-HB-NS60'],
                ]
            ],
            [
                'category_id' => $aki->id,
                'name' => 'Aki GS Astra Maintenance Free NS40Z',
                'description' => 'Aki bebas perawatan / kering GS Astra MF, sangat cocok untuk iklim tropis dan penggunaan harian yang padat.',
                'badge' => 'Bebas Rawat',
                'rating' => 4.9,
                'sold_count' => 260,
                'attributes' => ['brand' => 'GS Astra', 'type' => 'Maintenance Free (Kering)', 'voltage' => '12V', 'capacity' => '35 Ah'],
                'variants' => [
                    ['name' => 'NS40ZL (Kiri)', 'base_price' => 890000, 'stock' => 25, 'sku' => 'GS-MF-NS40ZL'],
                    ['name' => 'NS40Z (Kanan)', 'base_price' => 890000, 'stock' => 14, 'sku' => 'GS-MF-NS40Z'],
                ]
            ],
            [
                'category_id' => $aki->id,
                'name' => 'Aki Yuasa Pafecta 55D23L',
                'description' => 'Aki basah Yuasa Pafecta dengan performa terpercaya dan ketahanan plat yang sangat baik terhadap guncangan jalan.',
                'badge' => 'Tahan Lama',
                'rating' => 4.7,
                'sold_count' => 95,
                'attributes' => ['brand' => 'Yuasa', 'type' => 'Premium Wet (Basah)', 'voltage' => '12V', 'capacity' => '60 Ah'],
                'variants' => [
                    ['name' => '55D23L', 'base_price' => 820000, 'stock' => 10, 'sku' => 'YS-PF-55D23L'],
                ]
            ],
            [
                'category_id' => $aki->id,
                'name' => 'Aki Amaron Hi-Life 55B24LS Maintenance Free',
                'description' => 'Aki Amaron dengan teknologi Silver Alloy (Silven X) memberikan daya tahan ekstra panjang dan garansi resmi.',
                'badge' => 'Garansi 1 Thn',
                'rating' => 4.9,
                'sold_count' => 190,
                'attributes' => ['brand' => 'Amaron', 'type' => 'Maintenance Free (Kering)', 'voltage' => '12V', 'capacity' => '45 Ah'],
                'variants' => [
                    ['name' => '55B24LS', 'base_price' => 980000, 'stock' => 12, 'sku' => 'AM-HL-55B24LS'],
                ]
            ],
            [
                'category_id' => $aki->id,
                'name' => 'Aki Incoe Gold NS70',
                'description' => 'Aki Incoe Gold dengan penguapan air aki yang sangat rendah sehingga menghemat waktu penambahan cairan aki.',
                'badge' => 'Ekonomis',
                'rating' => 4.6,
                'sold_count' => 60,
                'attributes' => ['brand' => 'Incoe', 'type' => 'Hybrid (Basah)', 'voltage' => '12V', 'capacity' => '65 Ah'],
                'variants' => [
                    ['name' => 'NS70L (Kiri)', 'base_price' => 850000, 'stock' => 8, 'sku' => 'IC-GD-NS70L'],
                ]
            ],

            // --- BUSI ---
            [
                'category_id' => $busi->id,
                'name' => 'Busi NGK Iridium IX CPR9EAGX-9',
                'description' => 'Busi Iridium IX menawarkan akselerasi responsif, efisiensi bahan bakar yang luar biasa, serta ketahanan tinggi terhadap korosi.',
                'badge' => 'Performa Tinggi',
                'rating' => 4.9,
                'sold_count' => 310,
                'is_flash_sale' => true,
                'flash_sale_stock' => 15,
                'attributes' => ['brand' => 'NGK', 'material' => 'Iridium', 'gap' => '0.9 mm'],
                'variants' => [
                    ['name' => 'Satuan (1 Pcs)', 'base_price' => 110000, 'stock' => 120, 'sku' => 'NGK-IR-CPR9-1P'],
                    ['name' => 'Paket (4 Pcs)', 'base_price' => 420000, 'stock' => 40, 'sku' => 'NGK-IR-CPR9-4P'],
                ]
            ],
            [
                'category_id' => $busi->id,
                'name' => 'Busi Denso Iridium Power IK20',
                'description' => 'Dengan elektroda pusat Iridium terkecil di dunia (0.4mm), busi Denso Iridium Power meningkatkan tenaga pengapian secara optimal.',
                'badge' => 'Japan Tech',
                'rating' => 4.8,
                'sold_count' => 150,
                'attributes' => ['brand' => 'Denso', 'material' => 'Iridium', 'diameter' => '0.4 mm'],
                'variants' => [
                    ['name' => 'Satuan (1 Pcs)', 'base_price' => 95000, 'stock' => 80, 'sku' => 'DN-IP-IK20-1P'],
                ]
            ],
            [
                'category_id' => $busi->id,
                'name' => 'Busi Bosch Super 4 WR78',
                'description' => 'Busi Bosch Super 4 memiliki 4 elektroda luar yang bekerja bergiliran menghasilkan bunga api terbaik demi pembakaran mesin yang bersih.',
                'badge' => '4 Elektroda',
                'rating' => 4.7,
                'sold_count' => 85,
                'attributes' => ['brand' => 'Bosch', 'material' => 'Nickel-Yttrium', 'electrodes' => '4'],
                'variants' => [
                    ['name' => 'Paket (4 Pcs)', 'base_price' => 240000, 'stock' => 20, 'sku' => 'BS-S4-WR78-4P'],
                ]
            ],
            [
                'category_id' => $busi->id,
                'name' => 'Busi NGK G-Power Platinum BKR6EGP',
                'description' => 'Busi Platinum G-Power menawarkan efisiensi bahan bakar yang lebih baik dan pembakaran yang lebih stabil dibandingkan busi standar.',
                'badge' => 'Best Value',
                'rating' => 4.7,
                'sold_count' => 420,
                'attributes' => ['brand' => 'NGK', 'material' => 'Platinum'],
                'variants' => [
                    ['name' => 'Satuan (1 Pcs)', 'base_price' => 45000, 'stock' => 200, 'sku' => 'NGK-GP-BKR6-1P'],
                ]
            ],

            // --- FILTER ---
            [
                'category_id' => $filter->id,
                'name' => 'Filter Oli Sakura C-1109 Toyota Avanza / Innova',
                'description' => 'Filter oli berkualitas tinggi dari Sakura Filter untuk menyaring kotoran mikro pada oli mesin secara presisi.',
                'badge' => 'OEM Standard',
                'rating' => 4.8,
                'sold_count' => 890,
                'attributes' => ['brand' => 'Sakura', 'type' => 'Filter Oli', 'compatibility' => 'Avanza, Xenia, Rush, Terios, Innova Bensin'],
                'variants' => [
                    ['name' => 'C-1109 (Toyota)', 'base_price' => 35000, 'stock' => 150, 'sku' => 'SK-C1109'],
                ]
            ],
            [
                'category_id' => $filter->id,
                'name' => 'Filter Oli Sakura C-1801 Honda Jazz / Brio',
                'description' => 'Filter oli Sakura didesain untuk menjaga tekanan oli tetap stabil dan menyaring partikel karbon sisa pembakaran.',
                'badge' => 'OEM Standard',
                'rating' => 4.8,
                'sold_count' => 630,
                'attributes' => ['brand' => 'Sakura', 'type' => 'Filter Oli', 'compatibility' => 'Jazz, Brio, Mobilio, Civic, City'],
                'variants' => [
                    ['name' => 'C-1801 (Honda)', 'base_price' => 35000, 'stock' => 120, 'sku' => 'SK-C1801'],
                ]
            ],
            [
                'category_id' => $filter->id,
                'name' => 'Filter Udara Sakura A-1188 Toyota Avanza',
                'description' => 'Menyaring partikel debu halus sebelum masuk ke ruang bakar untuk menjaga performa kompresi mesin tetap optimal.',
                'badge' => 'Best Seller',
                'rating' => 4.7,
                'sold_count' => 450,
                'attributes' => ['brand' => 'Sakura', 'type' => 'Filter Udara', 'compatibility' => 'Avanza / Xenia Dual VVT-i'],
                'variants' => [
                    ['name' => 'A-1188 (Dual VVT-i)', 'base_price' => 85000, 'stock' => 60, 'sku' => 'SK-A1188'],
                ]
            ],
            [
                'category_id' => $filter->id,
                'name' => 'Filter Udara Sakura A-16810 Honda Jazz',
                'description' => 'Filter udara Sakura memberikan efisiensi filtrasi udara masuk yang sangat tinggi sesuai standar pabrikan Honda.',
                'badge' => 'OEM Standard',
                'rating' => 4.8,
                'sold_count' => 310,
                'attributes' => ['brand' => 'Sakura', 'type' => 'Filter Udara', 'compatibility' => 'Honda Jazz GK5, Brio Gen 2, Freed'],
                'variants' => [
                    ['name' => 'A-16810 (Honda GK5)', 'base_price' => 90000, 'stock' => 45, 'sku' => 'SK-A16810'],
                ]
            ],
            [
                'category_id' => $filter->id,
                'name' => 'Filter AC/Kabin Ken Filter D-5931 Toyota Avanza',
                'description' => 'Ken Filter AC Carbon Aktif tidak hanya menyaring debu AC kabin tapi juga menyerap bau tidak sedap dan bakteri.',
                'badge' => 'Anti Bau',
                'rating' => 4.8,
                'sold_count' => 280,
                'attributes' => ['brand' => 'Ken Filter', 'type' => 'Filter Kabin Carbon Active', 'compatibility' => 'Avanza, Xenia, Rush, Terios'],
                'variants' => [
                    ['name' => 'D-5931 Carbon', 'base_price' => 75000, 'stock' => 50, 'sku' => 'KN-D5931-C'],
                ]
            ],

            // --- KAMPAS REM ---
            [
                'category_id' => $kampas->id,
                'name' => 'Kampas Rem Depan Bendix General CT DB1422',
                'description' => 'Kampas rem keramik Bendix General CT memberikan performa pengereman senyap, minim debu, dan daya tahan piringan cakram yang lama.',
                'badge' => '100% Ori',
                'rating' => 4.8,
                'sold_count' => 210,
                'attributes' => ['brand' => 'Bendix', 'material' => 'Ceramic / Keramik', 'position' => 'Roda Depan (Front)'],
                'variants' => [
                    ['name' => 'Toyota Avanza/Xenia/Terios', 'base_price' => 320000, 'stock' => 40, 'sku' => 'BX-GCT-DB1422'],
                ]
            ],
            [
                'category_id' => $kampas->id,
                'name' => 'Kampas Rem Depan Akebono AN-634WK',
                'description' => 'Akebono merupakan kampas rem OEM pabrikan Jepang yang mengedepankan keamanan maksimal dan kenyamanan hening.',
                'badge' => 'OEM Japan',
                'rating' => 4.9,
                'sold_count' => 130,
                'attributes' => ['brand' => 'Akebono', 'material' => 'Non-Asbestos organic', 'position' => 'Roda Depan (Front)'],
                'variants' => [
                    ['name' => 'Honda Jazz/Brio/Mobilio', 'base_price' => 410000, 'stock' => 15, 'sku' => 'AKB-AN-634WK'],
                ]
            ],
            [
                'category_id' => $kampas->id,
                'name' => 'Kampas Rem Depan Bosch Disc Pad BP1253',
                'description' => 'Didesain untuk menghentikan kendaraan secara konsisten pada segala kondisi suhu jalan ekstrem tanpa merusak cakram.',
                'badge' => 'Bosch Quality',
                'rating' => 4.7,
                'sold_count' => 110,
                'attributes' => ['brand' => 'Bosch', 'material' => 'Semi-Metallic', 'position' => 'Roda Depan (Front)'],
                'variants' => [
                    ['name' => 'Suzuki Ertiga/Swift', 'base_price' => 290000, 'stock' => 20, 'sku' => 'BS-BP1253'],
                ]
            ],
            [
                'category_id' => $kampas->id,
                'name' => 'Kampas Rem Belakang Bendix General CT DB1728',
                'description' => 'Bendix Kampas rem tromol / shoe belakang kualitas premium dengan daya cengkram merata dan stabil.',
                'badge' => 'Pakem',
                'rating' => 4.8,
                'sold_count' => 90,
                'attributes' => ['brand' => 'Bendix', 'material' => 'Ceramic / Keramik', 'position' => 'Roda Belakang (Rear)'],
                'variants' => [
                    ['name' => 'Avanza/Xenia Belakang', 'base_price' => 260000, 'stock' => 35, 'sku' => 'BX-GCT-DB1728'],
                ]
            ],

            // --- PIRINGAN CAKRAM ---
            [
                'category_id' => $cakram->id,
                'name' => 'Piringan Cakram Brembo Front Disc 09.A123.10',
                'description' => 'Cakram rem Brembo memberikan pembuangan panas yang superior dan jaminan keandalan pengereman merek legendaris.',
                'badge' => 'Brembo Racing',
                'rating' => 4.9,
                'sold_count' => 45,
                'attributes' => ['brand' => 'Brembo', 'type' => 'Ventilated Disc', 'diameter' => '256 mm'],
                'variants' => [
                    ['name' => 'Toyota Yaris / Vios (Sepasang)', 'base_price' => 1250000, 'stock' => 6, 'sku' => 'BRM-09A12310'],
                ]
            ],
            [
                'category_id' => $cakram->id,
                'name' => 'Piringan Cakram TRW Front Brake Rotor DF4932',
                'description' => 'Rotor TRW dibuat dengan material berkualitas tinggi demi kekuatan mekanik maksimum dan koefisien gesek yang stabil.',
                'badge' => 'TRW Quality',
                'rating' => 4.7,
                'sold_count' => 30,
                'attributes' => ['brand' => 'TRW', 'type' => 'Solid Disc', 'diameter' => '240 mm'],
                'variants' => [
                    ['name' => 'Honda Brio / Jazz GD3 (Sepasang)', 'base_price' => 780000, 'stock' => 8, 'sku' => 'TRW-DF4932'],
                ]
            ],

            // --- SHOCKBREAKER ---
            [
                'category_id' => $shock->id,
                'name' => 'Shockbreaker KYB Premium Depan Avanza (Sepasang)',
                'description' => 'Shockbreaker oli KYB Premium memberikan kenyamanan berkendara yang empuk di jalanan tidak rata.',
                'badge' => 'Empuk',
                'rating' => 4.8,
                'sold_count' => 120,
                'attributes' => ['brand' => 'KYB Kayaba', 'type' => 'Oil Type (Oli)', 'position' => 'Depan (Front)'],
                'variants' => [
                    ['name' => 'Depan Avanza/Xenia (L/R)', 'base_price' => 1450000, 'stock' => 15, 'sku' => 'KYB-PRM-AVZ-F'],
                ]
            ],
            [
                'category_id' => $shock->id,
                'name' => 'Shockbreaker KYB Excel-G Depan Innova (Sepasang)',
                'description' => 'Excel-G adalah shockbreaker jenis gas bertekanan tinggi dari KYB untuk pengendalian mobil yang lebih stabil dan responsif.',
                'badge' => 'High Stability',
                'rating' => 4.9,
                'sold_count' => 75,
                'attributes' => ['brand' => 'KYB Kayaba', 'type' => 'Gas Type (Gas)', 'position' => 'Depan (Front)'],
                'variants' => [
                    ['name' => 'Depan Innova (L/R)', 'base_price' => 1950000, 'stock' => 10, 'sku' => 'KYB-EXG-INV-F'],
                ]
            ],
            [
                'category_id' => $shock->id,
                'name' => 'Shockbreaker Monroe OESpectrum Depan Xenia',
                'description' => 'Dilengkapi teknologi Tenneco Twin Technology yang menyesuaikan daya redam otomatis terhadap kondisi permukaan jalan.',
                'badge' => 'USA Brand',
                'rating' => 4.8,
                'sold_count' => 40,
                'attributes' => ['brand' => 'Monroe', 'type' => 'Gas Type (Gas)', 'position' => 'Depan (Front)'],
                'variants' => [
                    ['name' => 'Depan Xenia (L/R)', 'base_price' => 1800000, 'stock' => 8, 'sku' => 'MNR-OES-XN-F'],
                ]
            ],
            [
                'category_id' => $shock->id,
                'name' => 'Shockbreaker Tokico Depan Yaris',
                'description' => 'Shockbreaker gas orisinil Tokico Japan untuk mengembalikan kualitas kenyamanan suspensi mobil hatchback kesayangan Anda.',
                'badge' => 'Japan Original',
                'rating' => 4.8,
                'sold_count' => 50,
                'attributes' => ['brand' => 'Tokico', 'type' => 'Gas Type (Gas)', 'position' => 'Depan (Front)'],
                'variants' => [
                    ['name' => 'Depan Yaris/Vios (L/R)', 'base_price' => 1650000, 'stock' => 12, 'sku' => 'TKC-YRS-F'],
                ]
            ],

            // --- VELG & BAN ---
            [
                'category_id' => $velg->id,
                'name' => 'Ban Mobil Bridgestone Ecopia EP150 185/70 R14',
                'description' => 'Ban ramah lingkungan yang hemat bahan bakar namun tetap menawarkan performa pengereman basah dan kering yang andal.',
                'badge' => 'Eco Friendly',
                'rating' => 4.8,
                'sold_count' => 340,
                'attributes' => ['brand' => 'Bridgestone', 'pattern' => 'Ecopia EP150', 'size' => '185/70 R14'],
                'variants' => [
                    ['name' => 'Bridgestone EP150 14"', 'base_price' => 690000, 'stock' => 48, 'sku' => 'BS-EP150-1857014'],
                ]
            ],
            [
                'category_id' => $velg->id,
                'name' => 'Ban Mobil Dunlop Enasave EC300 185/65 R15',
                'description' => 'Dunlop Enasave menawarkan tingkat kebisingan jalan yang sangat minim dan pengendaraan yang lembut bagi MPV Anda.',
                'badge' => 'OEM Avanza',
                'rating' => 4.7,
                'sold_count' => 290,
                'attributes' => ['brand' => 'Dunlop', 'pattern' => 'Enasave EC300', 'size' => '185/65 R15'],
                'variants' => [
                    ['name' => 'Dunlop EC300 15"', 'base_price' => 740000, 'stock' => 36, 'sku' => 'DL-EC300-1856515'],
                ]
            ],
            [
                'category_id' => $velg->id,
                'name' => 'Ban Mobil Michelin Energy XM2+ 195/60 R15',
                'description' => 'Ban Michelin dengan kompon karet silika penuh memberikan jarak pengereman basah yang jauh lebih pendek hingga ban aus.',
                'badge' => 'Top Quality',
                'rating' => 4.9,
                'sold_count' => 110,
                'attributes' => ['brand' => 'Michelin', 'pattern' => 'Energy XM2+', 'size' => '195/60 R15'],
                'variants' => [
                    ['name' => 'Michelin XM2+ 15"', 'base_price' => 1150000, 'stock' => 24, 'sku' => 'MCH-XM2-1956015'],
                ]
            ],
            [
                'category_id' => $velg->id,
                'name' => 'Ban Mobil GT Radial Champiro Eco 175/65 R14',
                'description' => 'GT Radial Champiro Eco sangat cocok untuk mobil LCGC perkotaan dengan traksi prima dan daya tahan ban tangguh.',
                'badge' => 'LCGC Choice',
                'rating' => 4.6,
                'sold_count' => 480,
                'attributes' => ['brand' => 'GT Radial', 'pattern' => 'Champiro Eco', 'size' => '175/65 R14'],
                'variants' => [
                    ['name' => 'GT Radial Eco 14"', 'base_price' => 480000, 'stock' => 64, 'sku' => 'GT-CECO-1756514'],
                ]
            ],

            // --- LAMPU ---
            [
                'category_id' => $lampu->id,
                'name' => 'Lampu Depan LED Philips Ultinon Essential H4',
                'description' => 'Lampu LED Philips H4 memancarkan cahaya putih 6000K stylish dengan sebaran fokus tajam tanpa menyilaukan pengendara lawan.',
                'badge' => '6000K White',
                'rating' => 4.9,
                'sold_count' => 240,
                'attributes' => ['brand' => 'Philips', 'type' => 'LED Headlight Bulb', 'socket' => 'H4 (Hi/Lo)'],
                'variants' => [
                    ['name' => 'H4 LED (Sepasang)', 'base_price' => 650000, 'stock' => 30, 'sku' => 'PH-ULT-H4'],
                ]
            ],
            [
                'category_id' => $lampu->id,
                'name' => 'Lampu Depan LED Osram LEDriving H7',
                'description' => 'Osram LEDriving memberikan kecerahan superior dibanding bohlam standar dengan temperatur warna putih murni.',
                'badge' => 'Osram Germany',
                'rating' => 4.8,
                'sold_count' => 140,
                'attributes' => ['brand' => 'Osram', 'type' => 'LED Headlight Bulb', 'socket' => 'H7'],
                'variants' => [
                    ['name' => 'H7 LED (Sepasang)', 'base_price' => 580000, 'stock' => 18, 'sku' => 'OSR-LDR-H7'],
                ]
            ],
            [
                'category_id' => $lampu->id,
                'name' => 'Lampu LED Autovision Carbon M3 H11',
                'description' => 'Autovision Carbon M3 memancarkan daya terang tinggi hingga 5000 Lumens per bohlam untuk visibility kabut yang maksimal.',
                'badge' => '5000 Lumens',
                'rating' => 4.7,
                'sold_count' => 95,
                'attributes' => ['brand' => 'Autovision', 'type' => 'LED Headlight/Foglight', 'socket' => 'H11/H8/H16'],
                'variants' => [
                    ['name' => 'H11 LED (Sepasang)', 'base_price' => 490000, 'stock' => 20, 'sku' => 'AV-CARBM3-H11'],
                ]
            ],

            // --- DASHCAM ---
            [
                'category_id' => $dashcam->id,
                'name' => 'Dashcam Yi Smart Dash Camera 1080p',
                'description' => 'Yi Smart Dashcam merekam video full HD dengan sudut lebar 165 derajat dan sistem asisten ADAS cerdas.',
                'badge' => 'Best Buy',
                'rating' => 4.7,
                'sold_count' => 130,
                'attributes' => ['brand' => 'Xiaomi Yi', 'resolution' => '1080p Full HD', 'angle' => '165 deg'],
                'variants' => [
                    ['name' => 'Yi Dashcam Grey', 'base_price' => 550000, 'stock' => 16, 'sku' => 'YI-DASH-GRY'],
                ]
            ],
            [
                'category_id' => $dashcam->id,
                'name' => 'Dashcam 70mai Dash Cam Pro Plus+ A500S',
                'description' => '70mai A500S merekam resolusi 2.7K Ultra HD dengan dual channel recording depan dan belakang serta GPS built-in.',
                'badge' => 'Dual Camera',
                'rating' => 4.9,
                'sold_count' => 220,
                'attributes' => ['brand' => '70mai', 'resolution' => '2.7K (1944p)', 'features' => 'GPS, ADAS, Parking Monitor'],
                'variants' => [
                    ['name' => 'Front + Rear Cam Set', 'base_price' => 1350000, 'stock' => 12, 'sku' => '70M-A500S-SET'],
                ]
            ],
            [
                'category_id' => $dashcam->id,
                'name' => 'Dashcam DDPAI Mola N3 GPS',
                'description' => 'DDPAI Mola N3 dibekali kamera 1600p Ultra HD tanpa layar (operasional via aplikasi smartphone) dengan holder putar inovatif.',
                'badge' => 'Sleek Design',
                'rating' => 4.8,
                'sold_count' => 110,
                'attributes' => ['brand' => 'DDPAI', 'resolution' => '1600p HD', 'features' => 'GPS, WiFi, App Control'],
                'variants' => [
                    ['name' => 'Mola N3 GPS Edition', 'base_price' => 950000, 'stock' => 15, 'sku' => 'DDP-N3-GPS'],
                ]
            ],

            // --- KARPET & COVER ---
            [
                'category_id' => $karpet->id,
                'name' => 'Cover Mobil Premium Krisbow Outdoor',
                'description' => 'Cover mobil Krisbow didesain khusus luar ruangan (outdoor) dengan 5 lapis serat kain anti air dan anti UV.',
                'badge' => 'Krisbow Premium',
                'rating' => 4.9,
                'sold_count' => 65,
                'attributes' => ['brand' => 'Krisbow', 'material' => '5-Layers Synthetic', 'use_case' => 'Outdoor (Luar Ruang)'],
                'variants' => [
                    ['name' => 'Size MPV (Innova/Avanza)', 'base_price' => 1650000, 'stock' => 5, 'sku' => 'KB-COV-MPV'],
                    ['name' => 'Size SUV (Fortuner/Pajero)', 'base_price' => 1850000, 'stock' => 4, 'sku' => 'KB-COV-SUV'],
                ]
            ],
            [
                'category_id' => $karpet->id,
                'name' => 'Karpet Mobil Comfort Premium Deluxe (Universal)',
                'description' => 'Karpet mie PVC Comfort Premium Deluxe dengan tebal 20mm empuk meredam bising lantai kabin dan menampung debu tanah.',
                'badge' => 'Karpet Mie',
                'rating' => 4.8,
                'sold_count' => 120,
                'attributes' => ['brand' => 'Comfort', 'material' => 'Premium PVC Coil', 'thickness' => '20 mm'],
                'variants' => [
                    ['name' => 'Tipe 2 Baris (Sedan/Hatchback)', 'base_price' => 850000, 'stock' => 10, 'sku' => 'CF-DLX-2B'],
                    ['name' => 'Tipe 3 Baris (MPV/SUV)', 'base_price' => 1350000, 'stock' => 8, 'sku' => 'CF-DLX-3B'],
                ]
            ],
            [
                'category_id' => $karpet->id,
                'name' => 'Cover Setir Mobil Kulit Synthetic Sparco',
                'description' => 'Sarung setir Sparco original terbuat dari bahan kulit sintetis berkualitas tinggi anti-slip untuk kenyamanan genggaman setir.',
                'badge' => 'Sparco Sporty',
                'rating' => 4.7,
                'sold_count' => 170,
                'attributes' => ['brand' => 'Sparco', 'material' => 'Synthetic Leather + Rubber', 'diameter' => '38 cm (Universal)'],
                'variants' => [
                    ['name' => 'Warna Hitam-Merah', 'base_price' => 185000, 'stock' => 25, 'sku' => 'SPC-COV-BR'],
                    ['name' => 'Warna Hitam-Biru', 'base_price' => 185000, 'stock' => 15, 'sku' => 'SPC-COV-BB'],
                ]
            ],

            // --- PERAWATAN & PARFUM ---
            [
                'category_id' => $perawatan->id,
                'name' => 'Air Radiator Prestone Ready To Use Coolant',
                'description' => 'Cairan pendingin radiator Prestone siap pakai, mencegah overheat, kerak, dan karat pada water pump mobil.',
                'badge' => 'Prestone Radiator',
                'rating' => 4.8,
                'sold_count' => 540,
                'attributes' => ['brand' => 'Prestone', 'volume' => '4 Liter', 'color' => 'Hijau / Green'],
                'variants' => [
                    ['name' => 'Galon 4 Liter (Green)', 'base_price' => 95000, 'stock' => 120, 'sku' => 'PR-COOL-4L'],
                ]
            ],
            [
                'category_id' => $perawatan->id,
                'name' => 'Cairan Pembersih Mesin Engine Flush STP 450ml',
                'description' => 'Engine Flush STP membersihkan endapan lumpur, varnish, dan kerak mesin sesaat sebelum proses ganti oli mesin.',
                'badge' => 'STP USA',
                'rating' => 4.7,
                'sold_count' => 290,
                'attributes' => ['brand' => 'STP', 'volume' => '450 ml', 'use_case' => 'Engine Flush'],
                'variants' => [
                    ['name' => 'Botol 450ml', 'base_price' => 55000, 'stock' => 80, 'sku' => 'STP-EF-450'],
                ]
            ],
            [
                'category_id' => $perawatan->id,
                'name' => 'Parfum Mobil Little Trees Black Ice',
                'description' => 'Pengharum kabin gantung Little Trees aroma ikonik Black Ice yang segar maskulin dan tahan hingga 45 hari.',
                'badge' => 'Original USA',
                'rating' => 4.8,
                'sold_count' => 1200,
                'attributes' => ['brand' => 'Little Trees', 'scent' => 'Black Ice', 'origin' => 'USA'],
                'variants' => [
                    ['name' => 'Gantungan Little Trees', 'base_price' => 22000, 'stock' => 350, 'sku' => 'LT-BI-ICE'],
                ]
            ],
            // Additional to hit 50+
            [
                'category_id' => $vanbelt->id,
                'name' => 'Van Belt Avanza V-Belt Gates Micro-V',
                'description' => 'Van belt orisinil pabrikan Gates dengan serat EPDM tahan panas tinggi dan hening saat mesin dinyalakan.',
                'badge' => 'Gates Belt',
                'rating' => 4.8,
                'sold_count' => 120,
                'attributes' => ['brand' => 'Gates', 'compatibility' => 'Avanza / Xenia 1.3 / 1.5'],
                'variants' => [
                    ['name' => 'Gates Micro-V 6PK', 'base_price' => 120000, 'stock' => 40, 'sku' => 'GT-VB-6PK'],
                ]
            ],
            [
                'category_id' => $minyakrem->id,
                'name' => 'Minyak Rem Prestone DOT 4 Synthetic',
                'description' => 'Minyak rem Prestone DOT 4 menawarkan titik didih basah tinggi untuk mencegah uap air menyumbat selang hidrolik rem.',
                'badge' => 'DOT 4',
                'rating' => 4.9,
                'sold_count' => 310,
                'attributes' => ['brand' => 'Prestone', 'specification' => 'DOT 4', 'volume' => '300 ml'],
                'variants' => [
                    ['name' => 'Prestone DOT4 300ml', 'base_price' => 45000, 'stock' => 90, 'sku' => 'PR-DOT4-300'],
                ]
            ],
            [
                'category_id' => $tierod->id,
                'name' => 'Tierod End 555 Japan Avanza (Sepasang)',
                'description' => 'Tierod End merk Three Five (555) buatan Jepang asli untuk suspensi stir Avanza yang presisi dan mantap.',
                'badge' => 'Three Five Japan',
                'rating' => 4.9,
                'sold_count' => 70,
                'attributes' => ['brand' => '555 Three Five', 'compatibility' => 'Avanza / Xenia / Rush / Terios', 'origin' => 'Japan'],
                'variants' => [
                    ['name' => 'Tierod End Avanza (L/R)', 'base_price' => 380000, 'stock' => 15, 'sku' => '555-TE-AVZ'],
                ]
            ],
            [
                'category_id' => $piston->id,
                'name' => 'Piston Kit Art Avanza 1.3 (Set)',
                'description' => 'Piston kit original merk Art Japan standar orisinil Toyota dengan ketahanan kompresi tinggi dan presisi diameter mikro.',
                'badge' => 'Art Japan',
                'rating' => 4.8,
                'sold_count' => 35,
                'attributes' => ['brand' => 'Art Piston', 'compatibility' => 'Toyota Avanza 1.3 / Xenia 1.3', 'origin' => 'Japan'],
                'variants' => [
                    ['name' => 'Piston Kit Size Standard', 'base_price' => 850000, 'stock' => 5, 'sku' => 'ART-PST-AVZ-STD'],
                    ['name' => 'Piston Kit Oversize 0.50', 'base_price' => 850000, 'stock' => 4, 'sku' => 'ART-PST-AVZ-050'],
                ]
            ]
        ];

        // 3. SEED THE PRODUCTS, VARIANTS, PRICES, IMAGES, MUTATIONS
        foreach ($productsData as $pData) {
            // Determine a beautiful Unsplash image based on product name keywords
            $img = $defaultImg;
            $nameLower = strtolower($pData['name']);
            if (str_contains($nameLower, 'oli') || str_contains($nameLower, 'fluid') || str_contains($nameLower, 'pelumas')) {
                $img = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'rem') || str_contains($nameLower, 'braker') || str_contains($nameLower, 'kampas') || str_contains($nameLower, 'cakram')) {
                $img = 'https://images.unsplash.com/photo-1606577924006-27d39b132c2a?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'shock') || str_contains($nameLower, 'suspensi') || str_contains($nameLower, 'tierod')) {
                $img = 'https://images.unsplash.com/photo-1635773054018-22c2005e8e80?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'ban') || str_contains($nameLower, 'velg') || str_contains($nameLower, 'wheel')) {
                $img = 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'lampu') || str_contains($nameLower, 'led') || str_contains($nameLower, 'hid')) {
                $img = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'camera') || str_contains($nameLower, 'dashcam') || str_contains($nameLower, 'yi')) {
                $img = 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'cover') || str_contains($nameLower, 'karpet') || str_contains($nameLower, 'krisbow')) {
                $img = 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'aki') || str_contains($nameLower, 'gs astra') || str_contains($nameLower, 'amaron') || str_contains($nameLower, 'incoe')) {
                $img = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'filter')) {
                $img = 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80';
            } elseif (str_contains($nameLower, 'coolant') || str_contains($nameLower, 'radiator')) {
                $img = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
            }

            $product = Product::create([
                'category_id' => $pData['category_id'],
                'name' => $pData['name'],
                'slug' => Str::slug($pData['name']) . '-' . uniqid(),
                'description' => $pData['description'],
                'main_image' => $img,
                'badge' => $pData['badge'],
                'rating' => $pData['rating'],
                'sold_count' => $pData['sold_count'],
                'is_flash_sale' => $pData['is_flash_sale'] ?? false,
                'flash_sale_stock' => $pData['flash_sale_stock'] ?? 0,
                'attributes' => $pData['attributes']
            ]);

            // Add standard product gallery images
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $img
            ]);

            // Seed Variants
            foreach ($pData['variants'] as $vData) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => $vData['name'],
                    'base_price' => $vData['base_price'],
                    'stock' => $vData['stock'],
                    'sku' => $vData['sku']
                ]);

                // Level prices: Retail, Reseller, Bengkel
                // Retail level
                ProductPrice::create([
                    'product_variant_id' => $variant->id,
                    'level' => 'retail',
                    'min_qty' => 1,
                    'price' => $vData['base_price']
                ]);
                // Retail bulk (5+ items gets 5% discount)
                ProductPrice::create([
                    'product_variant_id' => $variant->id,
                    'level' => 'retail',
                    'min_qty' => 5,
                    'price' => round($vData['base_price'] * 0.95)
                ]);
                // Reseller level (approx 10% discount)
                ProductPrice::create([
                    'product_variant_id' => $variant->id,
                    'level' => 'reseller',
                    'min_qty' => 1,
                    'price' => round($vData['base_price'] * 0.90)
                ]);
                // Bengkel level (approx 15% discount)
                ProductPrice::create([
                    'product_variant_id' => $variant->id,
                    'level' => 'bengkel',
                    'min_qty' => 1,
                    'price' => round($vData['base_price'] * 0.85)
                ]);

                // Log a stock mutation for initial stock load
                StockMutation::create([
                    'product_variant_id' => $variant->id,
                    'user_id' => $adminId,
                    'type' => 'in',
                    'quantity' => $vData['stock'] + 10,
                    'source' => 'purchase',
                    'notes' => 'Inisialisasi Stok Seeder Awal'
                ]);

                // Log a small sale mutation if there is enough stock
                if ($vData['stock'] > 10) {
                    StockMutation::create([
                        'product_variant_id' => $variant->id,
                        'user_id' => $adminId,
                        'type' => 'out',
                        'quantity' => 10,
                        'source' => 'sale',
                        'notes' => 'Penjualan Seeder Awal'
                    ]);
                }
            }
        }

        // Seed Banners
        Banner::truncate();
        Banner::create([
            'title' => 'Promo Suku Cadang Orisinil Terlengkap',
            'subtitle' => 'Dapatkan diskon hingga 15% untuk kampas rem Bendix, shockbreaker Tein, & filter udara K&N. Jaminan 100% Asli!',
            'badge' => 'Promo Suku Cadang',
            'button_text' => 'Belanja Suku Cadang',
            'image' => 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
            'link' => '#',
            'order' => 1,
            'is_active' => true
        ]);
        Banner::create([
            'title' => 'Upgrade Suspensi & Kaki-Kaki Mobil',
            'subtitle' => 'Hemat hingga 20% untuk paket Shockbreaker Tein EnduraPro, Velg Racing HSR, & Ban Michelin.',
            'badge' => 'Kaki-Kaki & Suspensi',
            'button_text' => 'Belanja Kaki-Kaki',
            'image' => 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
            'link' => '#',
            'order' => 2,
            'is_active' => true
        ]);
        Banner::create([
            'title' => 'Paket Tune-Up & Ganti Oli Mesin',
            'subtitle' => 'Dapatkan performa mesin maksimal dengan paket ganti Oli Shell Helix Ultra, filter Sakura, & gurah mesin.',
            'badge' => 'Servis & Bengkel',
            'button_text' => 'Booking Servis Mesin',
            'image' => 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
            'link' => '#',
            'order' => 3,
            'is_active' => true
        ]);

        // Seed Settings
        Setting::truncate();
        Setting::set('store_name', 'Putri Jaya Mobil');
        Setting::set('store_email', 'info@putrijayamobil.com');
        Setting::set('store_phone', '081234567890');
        Setting::set('store_whatsapp', '6281234567890');
        Setting::set('store_address', 'Jl. Raya Veteran No. 12, Bekasi, Jawa Barat');
        Setting::set('social_instagram', 'https://instagram.com/putrijayamobil');
        Setting::set('social_facebook', 'https://facebook.com/putrijayamobil');
        Setting::set('social_tiktok', 'https://tiktok.com/@putrijayamobil');

        // Seed Side Banners
        Setting::set('side_banner_1_badge', 'KONSULTASI GRATIS');
        Setting::set('side_banner_1_title', "Bingung Cari\nPart Number / Seri?");
        Setting::set('side_banner_1_subtitle', 'Kirim foto STNK & part Anda ke WhatsApp kami!');
        Setting::set('side_banner_1_image', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80');
        Setting::set('side_banner_1_link', '');

        Setting::set('side_banner_2_badge', 'JAMINAN ORISINIL');
        Setting::set('side_banner_2_title', '100% Suku Cadang Asli');
        Setting::set('side_banner_2_subtitle', 'Garansi uang kembali penuh jika palsu.');
        Setting::set('side_banner_2_image', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80');
        Setting::set('side_banner_2_link', '#');

        // Flash Sale Settings
        Setting::set('flash_sale_end_time', date('Y-m-d H:i:s', strtotime('+2 days')));
    }
}
