<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    /**
     * Ringkasan stok seluruh produk & varian.
     * Mendukung filter low-stock dan search.
     */
    public function index(Request $request)
    {
        $query = ProductVariant::with(['product.category'])
            ->select('product_variants.*')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->orderBy('products.name')
            ->orderBy('product_variants.name');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('product_variants.name', 'like', "%{$s}%")
                  ->orWhere('product_variants.sku', 'like', "%{$s}%")
                  ->orWhere('products.name', 'like', "%{$s}%");
            });
        }

        // Filter stok rendah (low stock threshold default 5)
        if ($request->boolean('low_stock')) {
            $threshold = (int) $request->get('threshold', 5);
            $query->where('product_variants.stock', '<=', $threshold);
        }

        // Filter by product
        if ($request->filled('product_id')) {
            $query->where('product_variants.product_id', $request->product_id);
        }

        $variants = $query->paginate($request->get('per_page', 20));

        $variants->getCollection()->transform(function ($v) {
            return [
                'id'           => $v->id,
                'product_id'   => $v->product_id,
                'product_name' => $v->product?->name,
                'category'     => $v->product?->category?->name,
                'variant_name' => $v->name,
                'sku'          => $v->sku,
                'stock'        => $v->stock,
                'base_price'   => (float) $v->base_price,
                'stock_status' => $this->getStockStatus($v->stock),
            ];
        });

        // Summary stats
        $totalVariants  = ProductVariant::count();
        $lowStockCount  = ProductVariant::where('stock', '<=', 5)->count();
        $emptyStockCount = ProductVariant::where('stock', 0)->count();
        $totalStockValue = ProductVariant::selectRaw('SUM(stock * base_price) as total')->value('total') ?? 0;

        return response()->json([
            'status'  => 'success',
            'summary' => [
                'total_variants'   => $totalVariants,
                'low_stock'        => $lowStockCount,
                'empty_stock'      => $emptyStockCount,
                'total_stock_value' => round($totalStockValue, 2),
            ],
            'data'    => $variants,
        ]);
    }

    /**
     * Riwayat mutasi stok — semua varian atau per produk/varian.
     */
    public function mutations(Request $request)
    {
        $query = StockMutation::with(['variant.product', 'user'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('product_id')) {
            $query->whereHas('variant', fn($q) => $q->where('product_id', $request->product_id));
        }

        if ($request->filled('variant_id')) {
            $query->where('product_variant_id', $request->variant_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $mutations = $query->paginate($request->get('per_page', 30));

        $mutations->getCollection()->transform(function ($m) {
            return [
                'id'           => $m->id,
                'variant_id'   => $m->product_variant_id,
                'product_name' => $m->variant?->product?->name,
                'variant_name' => $m->variant?->name,
                'sku'          => $m->variant?->sku,
                'type'         => $m->type,
                'type_label'   => $m->type === 'in' ? 'Masuk' : 'Keluar',
                'quantity'     => $m->quantity,
                'source'       => $m->source,
                'source_label' => $this->getSourceLabel($m->source),
                'notes'        => $m->notes,
                'created_by'   => $m->user?->name ?? 'System',
                'created_at'   => $m->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $mutations,
        ]);
    }

    /**
     * Manual mutasi stok — IN atau OUT untuk satu varian.
     */
    public function mutate(Request $request)
    {
        $validated = $request->validate([
            'product_variant_id' => 'required|exists:product_variants,id',
            'type'               => 'required|in:in,out',
            'quantity'           => 'required|integer|min:1',
            'source'             => 'required|in:purchase,sale,adjustment,return,damage,transfer',
            'notes'              => 'nullable|string|max:500',
        ]);

        $userId  = Auth::id() ?? 1;
        $variant = ProductVariant::findOrFail($validated['product_variant_id']);

        // Validate: can't take out more than available
        if ($validated['type'] === 'out' && $variant->stock < $validated['quantity']) {
            return response()->json([
                'message' => "Stok tidak mencukupi. Stok tersedia: {$variant->stock}, diminta: {$validated['quantity']}.",
            ], 422);
        }

        DB::transaction(function () use ($validated, $variant, $userId) {
            $qty      = $validated['quantity'];
            $newStock = $validated['type'] === 'in'
                ? $variant->stock + $qty
                : $variant->stock - $qty;

            $variant->update(['stock' => $newStock]);

            StockMutation::create([
                'product_variant_id' => $variant->id,
                'user_id'            => $userId,
                'type'               => $validated['type'],
                'quantity'           => $qty,
                'source'             => $validated['source'],
                'notes'              => $validated['notes'] ?? 'Mutasi stok manual',
            ]);
        });

        return response()->json([
            'status'    => 'success',
            'message'   => 'Mutasi stok berhasil dicatat.',
            'new_stock' => $variant->fresh()->stock,
        ]);
    }

    /**
     * Koreksi stok (set stok ke nilai tertentu, bukan +/-).
     * Otomatis buat mutasi in/out dengan selisih.
     */
    public function correct(Request $request, string $variantId)
    {
        $variant = ProductVariant::findOrFail($variantId);

        $request->validate([
            'stock' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $userId      = Auth::id() ?? 1;
        $newStock    = (int) $request->stock;
        $currentStock = $variant->stock;
        $diff        = $newStock - $currentStock;

        if ($diff === 0) {
            return response()->json(['message' => 'Stok tidak berubah, tidak ada yang perlu dikoreksi.'], 200);
        }

        DB::transaction(function () use ($variant, $newStock, $diff, $userId, $request) {
            $variant->update(['stock' => $newStock]);

            StockMutation::create([
                'product_variant_id' => $variant->id,
                'user_id'            => $userId,
                'type'               => $diff > 0 ? 'in' : 'out',
                'quantity'           => abs($diff),
                'source'             => 'adjustment',
                'notes'              => $request->notes ?? "Koreksi stok: {$variant->stock} → {$newStock}",
            ]);
        });

        return response()->json([
            'status'      => 'success',
            'message'     => 'Stok berhasil dikoreksi.',
            'old_stock'   => $currentStock,
            'new_stock'   => $newStock,
            'difference'  => $diff,
        ]);
    }

    /**
     * Bulk koreksi stok — untuk banyak varian sekaligus (misal: stock opname).
     * Body: { "corrections": [{ "variant_id": 1, "stock": 50, "notes": "Stock opname" }, ...] }
     */
    public function bulkCorrect(Request $request)
    {
        $request->validate([
            'corrections'                => 'required|array|min:1',
            'corrections.*.variant_id'   => 'required|exists:product_variants,id',
            'corrections.*.stock'        => 'required|integer|min:0',
            'corrections.*.notes'        => 'nullable|string|max:500',
        ]);

        $userId  = Auth::id() ?? 1;
        $updated = 0;
        $results = [];

        DB::transaction(function () use ($request, $userId, &$updated, &$results) {
            foreach ($request->corrections as $correction) {
                $variant      = ProductVariant::find($correction['variant_id']);
                $newStock     = (int) $correction['stock'];
                $currentStock = $variant->stock;
                $diff         = $newStock - $currentStock;

                if ($diff === 0) {
                    $results[] = ['variant_id' => $variant->id, 'status' => 'skipped', 'reason' => 'no change'];
                    continue;
                }

                $variant->update(['stock' => $newStock]);

                StockMutation::create([
                    'product_variant_id' => $variant->id,
                    'user_id'            => $userId,
                    'type'               => $diff > 0 ? 'in' : 'out',
                    'quantity'           => abs($diff),
                    'source'             => 'adjustment',
                    'notes'              => $correction['notes'] ?? 'Koreksi bulk / stock opname',
                ]);

                $results[] = [
                    'variant_id' => $variant->id,
                    'sku'        => $variant->sku,
                    'old_stock'  => $currentStock,
                    'new_stock'  => $newStock,
                    'status'     => 'updated',
                ];
                $updated++;
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => "{$updated} varian berhasil dikoreksi stoknya.",
            'results' => $results,
        ]);
    }

    /**
     * Hapus satu log mutasi stok (hanya untuk keperluan koreksi data, bukan reversal stok).
     */
    public function destroyMutation(string $mutationId)
    {
        $mutation = StockMutation::findOrFail($mutationId);
        $mutation->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Log mutasi stok berhasil dihapus.',
        ]);
    }

    // ── Private Helpers ──────────────────────────────────────────────────────

    private function getStockStatus(int $stock): array
    {
        return match (true) {
            $stock === 0 => ['label' => 'Habis',   'color' => 'red'],
            $stock <= 5  => ['label' => 'Kritis',  'color' => 'orange'],
            $stock <= 20 => ['label' => 'Rendah',  'color' => 'yellow'],
            default      => ['label' => 'Normal',  'color' => 'green'],
        };
    }

    private function getSourceLabel(string $source): string
    {
        return match ($source) {
            'purchase'   => 'Pembelian',
            'sale'       => 'Penjualan',
            'adjustment' => 'Penyesuaian',
            'return'     => 'Retur',
            'damage'     => 'Kerusakan',
            'transfer'   => 'Transfer Gudang',
            default      => ucfirst($source),
        };
    }
}
