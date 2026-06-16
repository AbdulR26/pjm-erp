<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\StockMutation;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Fetch dynamic dashboard stats and recent activities.
     */
    public function index()
    {
        $customerCount = Customer::count();
        $staffCount = User::count();
        $orderCount = Order::count();
        $pendingOrderCount = Order::whereIn('status', ['pending', 'processing'])->count();
        $productCount = ProductVariant::count();
        $totalSales = Payment::where('status', 'paid')->sum('amount');
        $poCount = PurchaseOrder::count();

        // Gather recent activities from multiple sources
        $activities = [];

        // 1. Recent Orders
        $recentOrders = Order::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        foreach ($recentOrders as $order) {
            $customerName = $order->customer->name ?? 'Pelanggan';
            $activities[] = [
                'type' => 'order',
                'title' => "Order #{$order->order_number} senilai Rp " . number_format($order->grand_total, 0, ',', '.') . " oleh {$customerName}.",
                'created_at' => $order->created_at,
                'time_label' => $order->created_at->diffForHumans(),
                'user' => 'Sistem'
            ];
        }

        // 2. Recent Suppliers
        $recentSuppliers = Supplier::orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        foreach ($recentSuppliers as $supplier) {
            $activities[] = [
                'type' => 'supplier',
                'title' => "Supplier baru {$supplier->name} ({$supplier->code}) telah ditambahkan.",
                'created_at' => $supplier->created_at,
                'time_label' => $supplier->created_at->diffForHumans(),
                'user' => 'Admin'
            ];
        }

        // 3. Recent POs
        $recentPOs = PurchaseOrder::with(['supplier', 'creator'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        foreach ($recentPOs as $po) {
            $supplierName = $po->supplier->name ?? 'Supplier';
            $activities[] = [
                'type' => 'purchase_order',
                'title' => "Purchase Order #{$po->po_number} senilai Rp " . number_format($po->grand_total, 0, ',', '.') . " untuk {$supplierName} telah dibuat.",
                'created_at' => $po->created_at,
                'time_label' => $po->created_at->diffForHumans(),
                'user' => $po->creator->name ?? 'Admin'
            ];
        }

        // 4. Recent Stock Mutations
        $recentMutations = StockMutation::with(['variant.product', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();
        foreach ($recentMutations as $mutation) {
            $productName = $mutation->variant->product->name ?? 'Produk';
            $variantName = $mutation->variant->name ?? 'Default';
            $typeLabel = $mutation->type === 'in' ? 'Stok masuk' : 'Stok keluar';
            $userName = $mutation->user->name ?? 'Sistem';
            $activities[] = [
                'type' => 'stock_mutation',
                'title' => "{$typeLabel} sebanyak {$mutation->quantity} item untuk {$productName} ({$variantName}).",
                'created_at' => $mutation->created_at,
                'time_label' => $mutation->created_at->diffForHumans(),
                'user' => $userName
            ];
        }

        // Sort activities by created_at desc
        usort($activities, function ($a, $b) {
            return $b['created_at']->timestamp <=> $a['created_at']->timestamp;
        });

        // Limit to 10 activities
        $activities = array_slice($activities, 0, 10);

        return response()->json([
            'customer_count' => $customerCount,
            'staff_count' => $staffCount,
            'order_count' => $orderCount,
            'pending_order_count' => $pendingOrderCount,
            'product_count' => $productCount,
            'total_sales' => (float)$totalSales,
            'po_count' => $poCount,
            'activities' => $activities
        ]);
    }
}
