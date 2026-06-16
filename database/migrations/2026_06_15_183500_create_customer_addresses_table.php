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
        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('name');
            $table->string('phone');
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->string('village')->nullable();
            $table->text('address');
            $table->string('postal_code', 10);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // Migrate existing customers' addresses to the new customer_addresses table
        $customers = DB::table('customers')->get();
        foreach ($customers as $customer) {
            if (!empty($customer->address)) {
                DB::table('customer_addresses')->insert([
                    'customer_id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone ?: '081234567890',
                    'province' => 'Jawa Barat',
                    'city' => 'Kota Bekasi',
                    'district' => 'Bekasi Timur',
                    'village' => 'Bekasi Jaya',
                    'address' => $customer->address,
                    'postal_code' => $customer->postal_code ?: '17112',
                    'latitude' => $customer->latitude,
                    'longitude' => $customer->longitude,
                    'is_primary' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_addresses');
    }
};
