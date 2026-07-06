<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMutation;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockManagementController extends Controller
{
    /**
     * Display listing of stock and summary.
     */
    public function index(Request $request)
    {
        // Query products that hold stock:
        // 1. Products that are variants (parent_id is not null)
        // 2. Products that are parents and don't have variants (parent_id is null and doesn't have child variants)
        $query = Product::with(['categories', 'parent'])
            ->where(function($q) {
                $q->whereNull('parent_id')
                  ->whereDoesntHave('variants');
            })
            ->orWhereNotNull('parent_id');

        // Apply Search filter
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('sku', 'like', "%{$s}%");
            });
        }

        // Apply Category filter
        if ($request->filled('category_id')) {
            $categoryId = $request->category_id;
            $query->whereHas('categories', function($q) use ($categoryId) {
                $q->where('product_categories.id', $categoryId);
            });
        }

        // Apply Low Stock filter (stock <= 5)
        if ($request->boolean('low_stock')) {
            $query->where('stock', '<=', 5);
        }

        $products = $query->orderBy('name')->paginate(20)->withQueryString();

        // Calculate statistics
        $stockQuery = Product::where(function($q) {
                $q->whereNull('parent_id')
                  ->whereDoesntHave('variants');
            })
            ->orWhereNotNull('parent_id');
            
        $totalItems = $stockQuery->count();
        $lowStockCount = (clone $stockQuery)->where('stock', '<=', 5)->count();
        $emptyStockCount = (clone $stockQuery)->where('stock', 0)->count();
        $totalStockValue = (clone $stockQuery)->selectRaw('SUM(stock * price) as total')->value('total') ?? 0;

        $categories = Category::all();

        $title = 'Manajemen Stok & Penyesuaian';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['name' => "Manajemen Stok"],
        ];
        $pageConfigs = ['pageHeader' => true, 'isFabButton' => false];

        return view('admin.stock.index', get_defined_vars());
    }

    /**
     * Display stock mutations list.
     */
    public function mutations(Request $request)
    {
        $query = StockMutation::with(['product'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('source')) {
            $query->where('reference_type', $request->source);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $mutations = $query->paginate(30)->withQueryString();

        $title = 'Riwayat Mutasi Stok';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['name' => "Riwayat Mutasi Stok"],
        ];
        $pageConfigs = ['pageHeader' => true, 'isFabButton' => false];

        return view('admin.stock.mutations', get_defined_vars());
    }

    /**
     * Perform manual stock mutation adjustment (+/- quantity).
     */
    public function adjust(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'type'       => 'required|in:in,out',
            'quantity'   => 'required|integer|min:1',
            'source'     => 'required|in:purchase,sale,adjustment,return,damage,transfer',
            'notes'      => 'nullable|string|max:500',
        ]);

        $product = Product::findOrFail($request->product_id);
        $qty = (int) $request->quantity;
        $type = $request->type;

        if ($type === 'out' && $product->stock < $qty) {
            return response()->json([
                'success' => false,
                'message' => "Stok tidak mencukupi. Stok saat ini: {$product->stock}, dikurangi: {$qty}."
            ], 422);
        }

        $newStock = $type === 'in' ? $product->stock + $qty : $product->stock - $qty;

        DB::transaction(function () use ($product, $type, $qty, $newStock, $request) {
            $product->update(['stock' => $newStock]);

            StockMutation::create([
                'product_id'     => $product->id,
                'type'           => $type,
                'quantity'       => $qty,
                'reference_type' => $request->source,
                'notes'          => $request->notes ?? 'Mutasi stok manual',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Mutasi stok berhasil disimpan.',
            'new_stock' => $newStock
        ]);
    }

    /**
     * Correct stock directly to a target number (Stock Opname).
     */
    public function correct(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'stock'      => 'required|integer|min:0',
            'notes'      => 'nullable|string|max:500',
        ]);

        $product = Product::findOrFail($request->product_id);
        $newStock = (int) $request->stock;
        $currentStock = $product->stock;
        $diff = $newStock - $currentStock;

        if ($diff === 0) {
            return response()->json([
                'success' => true,
                'message' => 'Stok sama, tidak ada koreksi yang diperlukan.',
                'new_stock' => $newStock
            ]);
        }

        DB::transaction(function () use ($product, $newStock, $diff, $currentStock, $request) {
            $product->update(['stock' => $newStock]);

            StockMutation::create([
                'product_id'     => $product->id,
                'type'           => $diff > 0 ? 'in' : 'out',
                'quantity'       => abs($diff),
                'reference_type' => 'adjustment',
                'notes'          => $request->notes ?? "Stock Opname: {$currentStock} → {$newStock}",
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Stok berhasil dikoreksi (Stock Opname).',
            'new_stock' => $newStock
        ]);
    }
}
