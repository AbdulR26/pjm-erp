<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderStatusesSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'Menunggu Pembayaran',
                'slug' => 'pending',
                'description' => 'Pesanan baru dibuat dan menunggu pembayaran dari pelanggan.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Diproses',
                'slug' => 'processing',
                'description' => 'Pembayaran lunas, pesanan sedang diproses atau dikemas.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Dikirim',
                'slug' => 'shipping',
                'description' => 'Pesanan dalam proses pengiriman kurir (Biteship).',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Selesai',
                'slug' => 'completed',
                'description' => 'Pesanan telah diterima oleh pembeli dengan sukses.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Dibatalkan',
                'slug' => 'cancelled',
                'description' => 'Pesanan dibatalkan oleh pembeli, admin, atau sistem.',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Gagal',
                'slug' => 'failed',
                'description' => 'Transaksi pembayaran pesanan mengalami kegagalan.',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        foreach ($statuses as $status) {
            DB::table('order_statuses')->updateOrInsert(
                ['slug' => $status['slug']],
                $status
            );
        }
    }
}
