<?php

namespace Database\Seeders;

use App\Models\Voucher;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Voucher::create([
            'code' => 'PJM10',
            'type' => 'percent',
            'value' => 10,
            'min_spend' => 100000,
            'max_discount' => 50000,
            'quota' => 100,
            'used' => 0,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'PJMPROMO',
            'type' => 'fixed',
            'value' => 25000,
            'min_spend' => 50000,
            'max_discount' => null,
            'quota' => 200,
            'used' => 0,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'PJMSUPER',
            'type' => 'fixed',
            'value' => 100000,
            'min_spend' => 500000,
            'max_discount' => null,
            'quota' => 50,
            'used' => 0,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);

        Voucher::create([
            'code' => 'DISKON50',
            'type' => 'percent',
            'value' => 50,
            'min_spend' => 2000000,
            'max_discount' => 500000,
            'quota' => 10,
            'used' => 0,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);
    }
}
