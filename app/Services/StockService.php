<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMutation;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class StockService
{
    /**
     * Potong stok saat pesanan berhasil dibayar.
     *
     * @param Order $order
     * @param int|null $userId
     * @return void
     */
    public function recordPaymentDeduction(Order $order, ?int $userId = null): void
    {
        $userId = $userId ?? Auth::id();

        DB::transaction(function () use ($order, $userId) {
            $order->loadMissing('items.product');

            foreach ($order->items as $item) {
                $product = $item->product;
                if (!$product) {
                    continue;
                }

                $qty = (int) $item->quantity;
                if ($qty <= 0) {
                    continue;
                }

                // Kurangi stok produk
                $product->decrement('stock', $qty);

                // Tambahkan jumlah terjual (sold_count)
                if (isset($product->sold_count)) {
                    $product->increment('sold_count', $qty);
                }

                // Catat Log Mutasi Stok Keluar
                StockMutation::create([
                    'product_id'     => $product->id,
                    'user_id'        => $userId,
                    'type'           => 'out',
                    'quantity'       => $qty,
                    'reference_type' => 'Order',
                    'reference_id'   => $order->id,
                    'notes'          => "Pengurangan stok pembayaran pesanan #{$order->order_number}",
                ]);
            }
        });
    }

    /**
     * Tambahkan kembali stok saat ada Retur Produk yang disetujui.
     *
     * @param OrderReturn $return
     * @param int|null $userId
     * @return void
     */
    public function recordReturnRestock(OrderReturn $return, ?int $userId = null): void
    {
        $userId = $userId ?? Auth::id();

        DB::transaction(function () use ($return, $userId) {
            $return->loadMissing('items.product');

            foreach ($return->items as $returnItem) {
                $product = $returnItem->product;
                $approvedQty = (int) $returnItem->approved_qty;

                if (!$product || $approvedQty <= 0) {
                    continue;
                }

                // Tambah stok kembali
                $product->increment('stock', $approvedQty);

                // Kurangi sold_count jika ada
                if (isset($product->sold_count) && $product->sold_count >= $approvedQty) {
                    $product->decrement('sold_count', $approvedQty);
                }

                // Catat Log Mutasi Stok Masuk
                StockMutation::create([
                    'product_id'     => $product->id,
                    'user_id'        => $userId,
                    'type'           => 'in',
                    'quantity'       => $approvedQty,
                    'reference_type' => 'Return',
                    'reference_id'   => $return->id,
                    'notes'          => "Restok retur barang pesanan #{$return->return_number}",
                ]);
            }
        });
    }

    /**
     * Tambahkan stok awal saat pembuatan produk baru / varian baru.
     *
     * @param Product $product
     * @param int $initialStock
     * @param int|null $userId
     * @return void
     */
    public function recordInitialProductStock(Product $product, int $initialStock, ?int $userId = null): void
    {
        if ($initialStock <= 0) {
            return;
        }

        $userId = $userId ?? Auth::id();

        StockMutation::create([
            'product_id'     => $product->id,
            'user_id'        => $userId,
            'type'           => 'in',
            'quantity'       => $initialStock,
            'reference_type' => 'InitialStock',
            'reference_id'   => $product->id,
            'notes'          => "Stok awal pembuatan produk: {$product->name}",
        ]);
    }

    /**
     * Tambahkan stok saat penerimaan barang Purchase Order (PO Supplier).
     *
     * @param PurchaseOrder $po
     * @param int $productId
     * @param int $receivedDiff
     * @param int|null $userId
     * @return void
     */
    public function recordPurchaseOrderReceive(PurchaseOrder $po, int $productId, int $receivedDiff, ?int $userId = null): void
    {
        if ($receivedDiff <= 0) {
            return;
        }

        $userId = $userId ?? Auth::id();
        $product = Product::find($productId);

        if (!$product) {
            return;
        }

        DB::transaction(function () use ($po, $product, $receivedDiff, $userId) {
            $product->increment('stock', $receivedDiff);

            StockMutation::create([
                'product_id'     => $product->id,
                'user_id'        => $userId,
                'type'           => 'in',
                'quantity'       => $receivedDiff,
                'reference_type' => 'PurchaseOrder',
                'reference_id'   => $po->id,
                'notes'          => "Terima barang PO #{$po->po_number}",
            ]);
        });
    }

    /**
     * Penyesuaian stok manual (In/Out) via Admin.
     *
     * @param Product $product
     * @param string $type ('in'|'out')
     * @param int $quantity
     * @param string $source
     * @param string|null $notes
     * @param int|null $userId
     * @return int Stok baru produk
     */
    public function recordManualAdjustment(Product $product, string $type, int $quantity, string $source, ?string $notes = null, ?int $userId = null): int
    {
        if ($quantity <= 0) {
            throw new Exception("Jumlah stok harus lebih dari 0.");
        }

        if ($type === 'out' && $product->stock < $quantity) {
            throw new Exception("Stok tidak mencukupi. Stok saat ini: {$product->stock}, dikurangi: {$quantity}.");
        }

        $userId = $userId ?? Auth::id();
        $newStock = $type === 'in' ? $product->stock + $quantity : $product->stock - $quantity;

        DB::transaction(function () use ($product, $type, $quantity, $newStock, $source, $notes, $userId) {
            $product->update(['stock' => $newStock]);

            StockMutation::create([
                'product_id'     => $product->id,
                'user_id'        => $userId,
                'type'           => $type,
                'quantity'       => $quantity,
                'reference_type' => $source,
                'notes'          => $notes ?? 'Mutasi stok manual',
            ]);
        });

        return $newStock;
    }

    /**
     * Koreksi stok (Stock Opname) ke target angka tertentu.
     *
     * @param Product $product
     * @param int $targetStock
     * @param string|null $notes
     * @param int|null $userId
     * @return int Stok baru produk
     */
    public function recordStockOpname(Product $product, int $targetStock, ?string $notes = null, ?int $userId = null): int
    {
        $currentStock = (int) $product->stock;
        $diff = $targetStock - $currentStock;

        if ($diff === 0) {
            return $targetStock;
        }

        $userId = $userId ?? Auth::id();

        DB::transaction(function () use ($product, $targetStock, $currentStock, $diff, $notes, $userId) {
            $product->update(['stock' => $targetStock]);

            StockMutation::create([
                'product_id'     => $product->id,
                'user_id'        => $userId,
                'type'           => $diff > 0 ? 'in' : 'out',
                'quantity'       => abs($diff),
                'reference_type' => 'adjustment',
                'notes'          => $notes ?? "Stock Opname: {$currentStock} → {$targetStock}",
            ]);
        });

        return $targetStock;
    }
}
