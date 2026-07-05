<?php

namespace Qollam\Product\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductMasterSeeder extends Seeder
{
    public function run(): void
    {
        // Seed product_types
        DB::table('product_types')->updateOrInsert(
            ['name' => 'simple'],
            ['description' => 'Simple product with no variants']
        );
        DB::table('product_types')->updateOrInsert(
            ['name' => 'configurable'],
            ['description' => 'Product that acts as parent for multiple variant products']
        );
        DB::table('product_types')->updateOrInsert(
            ['name' => 'variant'],
            ['description' => 'Variant of a configurable parent product']
        );

        // Seed product_statuses
        DB::table('product_statuses')->updateOrInsert(
            ['name' => 'draft'],
            ['description' => 'Product is in draft mode']
        );
        DB::table('product_statuses')->updateOrInsert(
            ['name' => 'active'],
            ['description' => 'Product is active and visible']
        );
        DB::table('product_statuses')->updateOrInsert(
            ['name' => 'archived'],
            ['description' => 'Product is archived and no longer available']
        );
        DB::table('product_statuses')->updateOrInsert(
            ['name' => 'inactive'],
            ['description' => 'Product is temporarily inactive']
        );
    }
}
