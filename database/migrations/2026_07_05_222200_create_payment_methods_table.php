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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default Midtrans payment methods
        $methods = [
            ['code' => 'credit_card', 'name' => 'Kartu Kredit (Visa/Mastercard)', 'category' => 'Kartu'],
            
            // Virtual Accounts
            ['code' => 'bca_va', 'name' => 'BCA Virtual Account', 'category' => 'Virtual Account'],
            ['code' => 'bni_va', 'name' => 'BNI Virtual Account', 'category' => 'Virtual Account'],
            ['code' => 'bri_va', 'name' => 'BRI Virtual Account', 'category' => 'Virtual Account'],
            ['code' => 'bsi_va', 'name' => 'BSI Virtual Account', 'category' => 'Virtual Account'],
            ['code' => 'cimb_va', 'name' => 'CIMB Virtual Account', 'category' => 'Virtual Account'],
            ['code' => 'echannel', 'name' => 'Mandiri Bill Payment (e-Channel)', 'category' => 'Virtual Account'],
            ['code' => 'permata_va', 'name' => 'Permata Virtual Account', 'category' => 'Virtual Account'],
            ['code' => 'other_va', 'name' => 'Bank Lainnya (Mandiri/ATM Bersama)', 'category' => 'Virtual Account'],
            
            // E-Wallets
            ['code' => 'gopay', 'name' => 'GoPay', 'category' => 'E-Wallet'],
            ['code' => 'shopeepay', 'name' => 'ShopeePay', 'category' => 'E-Wallet'],
            ['code' => 'qris', 'name' => 'QRIS (GoPay/OVO/Dana/LinkAja)', 'category' => 'E-Wallet'],
            
            // Convenience Stores
            ['code' => 'indomaret', 'name' => 'Indomaret', 'category' => 'Gerai Retail'],
            ['code' => 'alfamart', 'name' => 'Alfamart', 'category' => 'Gerai Retail'],
            
            // Cardless Credit / Paylater
            ['code' => 'akulaku', 'name' => 'AkuLaku PayLater', 'category' => 'PayLater'],
            ['code' => 'kredivo', 'name' => 'Kredivo', 'category' => 'PayLater'],
        ];

        $now = now();
        foreach ($methods as &$method) {
            $method['created_at'] = $now;
            $method['updated_at'] = $now;
        }

        DB::table('payment_methods')->insert($methods);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
