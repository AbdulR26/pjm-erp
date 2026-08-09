<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\Shipment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());
        $reportType = $request->input('report_type', 'order');

        $data = $this->queryReportData($reportType, $startDate, $endDate);

        $title = 'Laporan Sistem';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => 'Home'],
            ['name' => 'Laporan'],
        ];

        return view('admin.reports.index', array_merge($data, [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'reportType' => $reportType,
            'title' => $title,
            'breadcrumbs' => $breadcrumbs,
        ]));
    }

    public function exportPdf(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());
        $reportType = $request->input('report_type', 'order');

        $data = $this->queryReportData($reportType, $startDate, $endDate);

        $settings = Setting::all()->pluck('value', 'key');
        $storeName = $settings['store_name'] ?? 'Putri Jaya Mobil';
        $storeAddress = $settings['store_address'] ?? '';
        $storePhone = $settings['store_phone'] ?? '';
        $storeEmail = $settings['store_email'] ?? '';

        $logoBase64 = null;
        if (!empty($settings['logo'])) {
            $relative = str_replace('/storage/', 'storage/', $settings['logo']);
            $fullPath = public_path($relative);
            if (file_exists($fullPath)) {
                $ext = pathinfo($fullPath, PATHINFO_EXTENSION);
                $imageData = file_get_contents($fullPath);
                $logoBase64 = 'data:image/' . $ext . ';base64,' . base64_encode($imageData);
            }
        }

        $reportTitles = [
            'product'      => 'Laporan Master Produk',
            'top_product'  => 'Laporan Produk Terlaris',
            'stock'        => 'Laporan Stok & Varian Produk',
            'order'        => 'Laporan Penjualan & Order',
            'retur'        => 'Laporan Retur Pesanan',
            'customer'     => 'Laporan Data Pelanggan',
            'pengiriman'   => 'Laporan Pengiriman & Ekspedisi',
        ];
        $reportTitle = $reportTitles[$reportType] ?? 'Laporan Sistem';

        $pdfData = array_merge($data, [
            'startDate'    => $startDate,
            'endDate'      => $endDate,
            'reportType'   => $reportType,
            'reportTitle'  => $reportTitle,
            'storeName'    => $storeName,
            'storeAddress' => $storeAddress,
            'storePhone'   => $storePhone,
            'storeEmail'   => $storeEmail,
            'logoBase64'   => $logoBase64,
            'generatedAt'  => Carbon::now()->format('d/m/Y H:i:s'),
        ]);

        $pdf = Pdf::loadView('admin.reports.pdf', $pdfData);
        $pdf->setPaper('a4', 'landscape');

        $filename = 'Laporan_' . ucfirst($reportType) . '_' . str_replace('-', '', $startDate) . '_' . str_replace('-', '', $endDate) . '.pdf';

        return $pdf->download($filename);
    }

    private function queryReportData(string $reportType, string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $results = [];

        switch ($reportType) {
            case 'product':
                $results = Product::with(['categories', 'variants'])
                    ->whereNull('parent_id')
                    ->whereBetween('created_at', [$start, $end])
                    ->orderBy('created_at', 'desc')
                    ->get();
                break;

            case 'top_product':
                $results = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->leftJoin('product_category_product', 'products.id', '=', 'product_category_product.product_id')
                    ->leftJoin('product_categories', 'product_category_product.product_category_id', '=', 'product_categories.id')
                    ->whereBetween('orders.created_at', [$start, $end])
                    ->select(
                        'products.id',
                        'products.name as product_name',
                        'product_categories.name as category_name',
                        DB::raw('SUM(order_items.quantity) as total_qty_sold'),
                        DB::raw('SUM(order_items.subtotal) as total_revenue')
                    )
                    ->groupBy('products.id', 'products.name', 'product_categories.name')
                    ->orderBy('total_qty_sold', 'desc')
                    ->get();
                break;

            case 'stock':
                $results = Product::with(['categories', 'parent'])
                    ->where(function($q) {
                        $q->whereNull('parent_id')->whereDoesntHave('variants');
                    })
                    ->orWhereNotNull('parent_id')
                    ->orderBy('stock', 'asc')
                    ->get();
                break;

            case 'order':
                $results = Order::with(['customer', 'status', 'payment', 'shipment'])
                    ->whereBetween('created_at', [$start, $end])
                    ->orderBy('created_at', 'desc')
                    ->get();
                break;

            case 'retur':
                $results = OrderReturn::with(['order.customer'])
                    ->whereBetween('created_at', [$start, $end])
                    ->orderBy('created_at', 'desc')
                    ->get();
                break;

            case 'customer':
                $results = Customer::withCount(['orders' => function ($q) use ($start, $end) {
                        $q->whereBetween('created_at', [$start, $end]);
                    }])
                    ->withSum(['orders' => function ($q) use ($start, $end) {
                        $q->whereBetween('created_at', [$start, $end]);
                    }], 'grand_total')
                    ->orderBy('created_at', 'desc')
                    ->get();
                break;

            case 'pengiriman':
                $results = Shipment::with(['order.customer'])
                    ->whereBetween('created_at', [$start, $end])
                    ->orderBy('created_at', 'desc')
                    ->get();
                break;
        }

        return ['reportData' => $results];
    }
}
