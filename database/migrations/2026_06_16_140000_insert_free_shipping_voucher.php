<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('vouchers')->insert([
            'code' => 'FREEONGKIR',
            'type' => 'free_shipping',
            'value' => 20000.00,
            'min_spend' => 100000.00,
            'max_discount' => null,
            'quota' => 1000,
            'used' => 0,
            'start_date' => now(),
            'end_date' => now()->addDays(90),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('vouchers')->where('code', 'FREEONGKIR')->delete();
    }
};
