<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Olshop\OlshopManagerService;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\Request;

class OlshopManagementController extends Controller
{
    protected OlshopManagerService $manager;

    public function __construct(OlshopManagerService $manager)
    {
        $this->manager = $manager;
    }

    public function index(Request $request)
    {
        $activeShop = strtolower($request->get('shop', 'tokopedia'));
        if (!in_array($activeShop, ['tokopedia', 'tiktok', 'shopee'])) {
            $activeShop = 'tokopedia';
        }

        $connectionStatus = $this->manager->testShopConnection($activeShop);
        $olshopProducts = $this->manager->getOlshopProducts($activeShop);
        $olshopOrders = $this->manager->getOlshopOrders($activeShop);

        // Fetch local ERP orders originating from this Olshop channel
        $localOrders = Order::with(['customer', 'items', 'status'])
            ->where('ecommerce_platform', $activeShop)
            ->orWhere('source', $activeShop)
            ->orderBy('created_at', 'desc')
            ->get();

        $title = 'Manajemen Data Olshop';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => 'Home'],
            ['name' => 'Manajemen Data Olshop'],
        ];

        return view('admin.olshop.index', get_defined_vars());
    }

    public function cloneProduct(Request $request)
    {
        $request->validate([
            'shop' => 'required|string|in:tokopedia,tiktok,shopee',
            'product_ids' => 'required|array|min:1',
        ]);

        $shop = $request->input('shop');
        $productIds = $request->input('product_ids');

        $result = $this->manager->cloneProducts($shop, $productIds);

        return redirect()->back()->with('success', $result['message']);
    }

    public function syncOrders(Request $request)
    {
        $request->validate([
            'shop' => 'required|string|in:tokopedia,tiktok,shopee',
        ]);

        $shop = $request->input('shop');
        $result = $this->manager->syncOrders($shop);

        return redirect()->back()->with('success', $result['message']);
    }

    public function testConnection(Request $request)
    {
        $shop = strtolower($request->input('shop', 'tokopedia'));
        if (!in_array($shop, ['tokopedia', 'tiktok', 'shopee'])) {
            return response()->json(['success' => false, 'message' => 'Olshop tidak valid.'], 400);
        }

        $result = $this->manager->testShopConnection($shop);
        return response()->json($result);
    }

    public function printResi($id)
    {
        $order = Order::with(['customer', 'items', 'status'])->findOrFail($id);

        $shipment = \App\Models\Shipment::where('order_id', $order->id)->first();
        $storeName = Setting::get('store_name', 'Putri Jaya Mobil');
        $storePhone = Setting::get('store_phone', '081234567890');
        $storeAddress = Setting::get('store_address', 'Bekasi, Jawa Barat');

        $shop = strtolower($order->ecommerce_platform ?: ($order->source ?: 'tokopedia'));

        return view('admin.olshop.print_resi', get_defined_vars());
    }
}
