<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Fetch dynamic dashboard stats and recent activities.
     */
    public function index()
    {
        $customerCount = Customer::count();
        $staffCount = User::count();
        $orderCount = 0;
        $pendingOrderCount = 0;
        $productCount = 0;
        $totalSales = 0;
        $poCount = 0;

        $activities = [];

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
