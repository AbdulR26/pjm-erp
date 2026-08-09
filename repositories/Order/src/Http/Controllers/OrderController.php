<?php

namespace Qollam\Order\Http\Controllers;

use Illuminate\Routing\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use App\Models\Order;
use App\Models\OrderStatus;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new Order(),
            'title' => 'Orders',
            'url' => 'admin/orders',
            'prefix' => 'admin.orders',
        ]);

        $this->scaffolding()->datatableColumnUnset(['created_at', 'updated_at', 'action']);

        $this->scaffolding()->datatableColumnSet('order_number', [
            'title' => 'Order Number',
            'formatter' => function ($model) {
                return '<strong>' . e($model->order_number) . '</strong>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('customer', [
            'title' => 'Customer',
            'orderable' => false,
            'formatter' => function ($model) {
                return '<strong>' . e($model->customer->name ?? '-') . '</strong><br><span class="text-muted small">' . e($model->customer->phone ?? '-') . '</span>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('grand_total', [
            'title' => 'Total Pembayaran',
            'formatter' => function ($model) {
                return '<strong>Rp ' . number_format($model->grand_total, 0, ',', '.') . '</strong>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('status_id', [
            'title' => 'Status Order',
            'formatter' => function ($model) {
                $statusObj = $model->statusRelation ?: \App\Models\OrderStatus::find($model->status_id);
                $slug = $statusObj?->slug ?? 'pending';
                $name = $statusObj?->name ?? 'Pending';
                $badge = 'secondary';
                if ($slug === 'processing') $badge = 'info';
                elseif ($slug === 'shipping') $badge = 'warning';
                elseif ($slug === 'completed') $badge = 'success';
                elseif (in_array($slug, ['cancelled', 'failed'])) $badge = 'danger';
                
                return '<span class="badge badge-light-' . $badge . '">' . e($name) . '</span>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('created_at', [
            'title' => 'Tanggal Transaksi',
            'formatter' => function ($model) {
                return $model->created_at ? $model->created_at->format('d M Y H:i') : '-';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('action', [
            'title' => 'Actions',
            'searchable' => false,
            'orderable' => false,
            'className' => 'text-center'
        ]);
    }

    /**
     * Validate voucher code and calculate discount.
     */
    public function validateVoucher(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
        ]);

        $voucher = \App\Models\Voucher::where('code', $request->code)->first();

        if (!$voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Kode voucher tidak ditemukan.'
            ]);
        }

        $subtotal = floatval($request->subtotal);
        $shippingCost = floatval($request->shipping_cost ?? 0);

        if (!$voucher->isValidFor($subtotal)) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher tidak memenuhi syarat (kuota habis, kedaluwarsa, atau minimal belanja tidak terpenuhi).'
            ]);
        }

        $discount = $voucher->calculateDiscount($subtotal, $shippingCost);

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil diterapkan!',
            'discount' => $discount,
            'voucher_id' => $voucher->id,
            'voucher_code' => $voucher->code
        ]);
    }

    /**
     * Calculate shipping rates from Biteship API based on destination and items.
     */
    public function calculateShippingRates(Request $request, \App\Services\BiteshipService $biteshipService)
    {
        $request->validate([
            'postal_code' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            $items = [];
            foreach ($request->items as $item) {
                $product = \Qollam\Product\Models\Product::find($item['product_id']);
                if ($product) {
                    $weight = 1000;
                    if ($product->attributes && isset($product->attributes['weight'])) {
                        $weight = (int) $product->attributes['weight'];
                    } elseif ($product->attributes && isset($product->attributes['berat'])) {
                        $weight = (int) $product->attributes['berat'];
                    }

                    $items[] = [
                        'name' => $product->name,
                        'value' => (int) ($product->price ?: 0),
                        'weight' => $weight,
                        'quantity' => (int) $item['quantity'],
                    ];
                }
            }

            if (empty($items)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada produk belanja valid untuk menghitung ongkir.'
                ]);
            }

            $destination = [
                'postal_code' => $request->postal_code,
                'latitude' => $request->latitude ?? null,
                'longitude' => $request->longitude ?? null,
            ];

            $rates = $biteshipService->getRates($destination, $items);

            return response()->json([
                'success' => true,
                'rates' => $rates
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungkan ke Biteship API: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $order = new Order();
        
        $this->setConfig([
            'model' => $order,
        ]);
        
        if ($request->isMethod('put')) {
            $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'status_id' => 'required|exists:order_statuses,id',
                'discount' => 'nullable|numeric',
                'shipping_cost' => 'nullable|numeric',
                'notes' => 'nullable|string',
                'voucher_id' => 'nullable|exists:vouchers,id',
                'voucher_code' => 'nullable|string',
                'items' => 'required|array',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                
                // Shipment validation
                'courier_company' => 'required|string',
                'courier_service' => 'required|string',
                'destination_contact_name' => 'required|string',
                'destination_contact_phone' => 'required|string',
                'destination_address' => 'required|string',
                'destination_postal_code' => 'nullable|string',
                'destination_latitude' => 'nullable',
                'destination_longitude' => 'nullable',
            ]);
            
            $subtotal = 0;
            $itemsData = [];
            
            foreach ($request->items as $itemArr) {
                $qty = intval($itemArr['quantity']);
                $product = \Qollam\Product\Models\Product::find($itemArr['product_id']);
                if ($product && $qty > 0) {
                    $unitPrice = $product->price ?: 0;
                    $totalPrice = $unitPrice * $qty;
                    $subtotal += $totalPrice;
                    
                    $itemsData[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'sku' => $product->sku ?: 'SKU-NONE',
                        'quantity' => $qty,
                        'unit_price' => $unitPrice,
                        'total_price' => $totalPrice,
                        'weight' => 1000, // Default 1kg
                    ];
                }
            }
            
            $discount = floatval($request->discount ?? 0);
            $shippingCost = floatval($request->shipping_cost ?? 0);
            $grandTotal = max(0, $subtotal - $discount + $shippingCost);
            
            $createdOrder = Order::create([
                'customer_id' => $request->customer_id,
                'status_id' => $request->status_id,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'voucher_id' => $request->voucher_id,
                'voucher_code' => $request->voucher_code,
                'notes' => $request->notes,
                'order_number' => Order::generateOrderNumber(),
            ]);
            
            // Create Order items
            foreach ($itemsData as $itemInfo) {
                $createdOrder->items()->create($itemInfo);
            }
            
            // Create status log history
            $statusName = OrderStatus::find($request->status_id)->name;
            $createdOrder->histories()->create([
                'status_id' => $request->status_id,
                'description' => 'Pesanan dibuat secara manual dengan status ' . $statusName,
            ]);
            
            // Auto initialize payment with Midtrans integration
            $payment = $createdOrder->payment()->create([
                'payment_method' => 'Midtrans VA/QRIS',
                'amount' => $createdOrder->grand_total,
                'status' => 'waiting_payment',
            ]);

            // Attempt to generate Midtrans Snap Token & URL
            try {
                $midtransService = app(\App\Services\MidtransService::class);
                $snapData = $midtransService->createSnapToken($createdOrder);
                if (isset($snapData['token']) && isset($snapData['redirect_url'])) {
                    $payment->update([
                        'snap_token' => $snapData['token'],
                        'payment_url' => $snapData['redirect_url'],
                    ]);
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to generate Midtrans Snap Token: ' . $e->getMessage());
            }
            
            // Initialize shipment with submitted courier & address details
            $createdOrder->shipment()->create([
                'courier_company' => $request->courier_company,
                'courier_service' => $request->courier_service,
                'cost' => $shippingCost,
                'status' => 'draft',
                'destination_contact_name' => $request->destination_contact_name,
                'destination_contact_phone' => $request->destination_contact_phone,
                'destination_address' => $request->destination_address,
                'destination_postal_code' => preg_replace('/[^0-9]/', '', (string)$request->destination_postal_code),
                'destination_latitude' => $request->destination_latitude,
                'destination_longitude' => $request->destination_longitude,
            ]);
            
            return redirect('admin/orders/' . $createdOrder->id . '/edit')->with('success', 'Pesanan berhasil dibuat.');
        }
        
        $statuses = OrderStatus::all();
        $customers = \App\Models\Customer::all();
        $products = \Qollam\Product\Models\Product::all();
        
        $title = 'Buat Pesanan Baru';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/orders'), 'name' => "Orders"],
            ['name' => "Create"],
        ];
        
        return view('order-module::form', get_defined_vars());
    }

    /**
     * Show the custom details form.
     */
    public function edit(Request $request, $id)
    {
        $order = Order::with(['customer', 'status', 'items.product', 'payment.histories', 'shipment', 'histories.status'])->findOrFail($id);
        
        $this->setConfig([
            'model' => $order,
        ]);
        
        $statuses = OrderStatus::all();
        
        $title = 'Order Detail - ' . $order->order_number;
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/orders'), 'name' => "Orders"],
            ['name' => "Detail / Edit"],
        ];
        
        return view('order-module::form', get_defined_vars());
    }

    /**
     * Update order status and log history.
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $request->validate([
            'status_id' => 'required|exists:order_statuses,id',
            'description' => 'nullable|string',
        ]);
        
        $oldStatusId = $order->status_id;
        $newStatusId = $request->status_id;
        
        if ($oldStatusId != $newStatusId) {
            $order->update(['status_id' => $newStatusId]);
            
            $newStatus = OrderStatus::find($newStatusId);
            $order->histories()->create([
                'status_id' => $newStatusId,
                'description' => $request->description ?: 'Status pesanan diubah menjadi ' . $newStatus->name,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Status pesanan berhasil diperbarui.'
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Tidak ada perubahan status.'
        ]);
    }

    /**
     * Update general order notes & waybill ID.
     */
    public function updateDetails(Request $request, $id)
    {
        $order = Order::with('shipment')->findOrFail($id);
        $request->validate([
            'notes' => 'nullable|string',
            'waybill_id' => 'nullable|string',
            'shipment_status' => 'nullable|string',
            'destination_contact_name' => 'nullable|string',
            'destination_contact_phone' => 'nullable|string',
            'destination_address' => 'nullable|string',
            'destination_postal_code' => 'nullable|string',
            'courier_company' => 'nullable|string',
            'courier_service' => 'nullable|string',
        ]);

        $order->update(['notes' => $request->notes]);

        if ($order->shipment) {
            $shipmentData = [
                'waybill_id' => $request->waybill_id,
                'status' => $request->shipment_status ?? $order->shipment->status,
            ];

            if ($request->filled('courier_company')) {
                $shipmentData['courier_company'] = strtolower($request->courier_company);
            }
            if ($request->filled('courier_service')) {
                $shipmentData['courier_service'] = $request->courier_service;
            }
            if ($request->filled('destination_contact_name')) {
                $shipmentData['destination_contact_name'] = $request->destination_contact_name;
            }
            if ($request->filled('destination_contact_phone')) {
                $shipmentData['destination_contact_phone'] = $request->destination_contact_phone;
            }
            if ($request->filled('destination_address')) {
                $shipmentData['destination_address'] = $request->destination_address;
            }
            $order->shipment->update($shipmentData);

            // Auto update order status to 'shipping' (Dikirim) if resi/waybill_id exists and status is pending/processing
            $effectiveWaybill = $request->waybill_id ?: $order->shipment->waybill_id;
            if (!empty($effectiveWaybill) && in_array($order->status_id, [1, 2])) {
                $shippingStatus = OrderStatus::where('slug', 'shipping')->first();
                if ($shippingStatus) {
                    $order->update(['status_id' => $shippingStatus->id]);
                    $order->histories()->create([
                        'status_id' => $shippingStatus->id,
                        'description' => 'Status otomatis diperbarui menjadi Dikirim karena nomor resi (' . $effectiveWaybill . ') telah tersedia.',
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan berhasil disimpan.'
        ]);
    }

    /**
     * Sync payment status from Midtrans API.
     */
    public function syncPayment(Request $request, $id, \App\Services\MidtransService $midtransService)
    {
        $order = Order::with('payment')->findOrFail($id);
        
        if (!$order->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Tagihan pembayaran belum dibuat untuk order ini.'
            ]);
        }

        try {
            $statusData = $midtransService->getTransactionStatus($order->order_number);
            
            $transactionStatus = $statusData['transaction_status'] ?? null;
            $fraudStatus = $statusData['fraud_status'] ?? null;
            $paymentType = $statusData['payment_type'] ?? null;
            
            if ($transactionStatus) {
                $newStatus = match (true) {
                    $transactionStatus === 'capture' && $fraudStatus === 'accept' => 'paid',
                    $transactionStatus === 'settlement' => 'paid',
                    $transactionStatus === 'pending' => 'waiting_payment',
                    $transactionStatus === 'deny' => 'failed',
                    $transactionStatus === 'expire' => 'expired',
                    $transactionStatus === 'cancel' => 'cancelled',
                    $transactionStatus === 'refund' => 'refunded',
                    default => $order->payment->status,
                };
                
                \Illuminate\Support\Facades\DB::transaction(function () use ($order, $newStatus, $paymentType, $fraudStatus, $statusData) {
                    $order->payment->update([
                        'status' => $newStatus,
                        'midtrans_transaction_id' => $statusData['transaction_id'] ?? $order->payment->midtrans_transaction_id,
                        'midtrans_payment_type' => $paymentType ?? $order->payment->midtrans_payment_type,
                        'midtrans_fraud_status' => $fraudStatus ?? $order->payment->midtrans_fraud_status,
                    ]);

                    if ($newStatus === 'paid') {
                        $order->payment->update(['paid_at' => now(), 'payment_method' => $paymentType ?? $order->payment->payment_method]);
                        
                        $processingStatus = OrderStatus::where('slug', 'processing')->first();
                        if ($processingStatus) {
                            $order->update(['status_id' => $processingStatus->id]);
                            $order->histories()->create([
                                'status_id' => $processingStatus->id,
                                'description' => 'Status otomatis diperbarui menjadi Processing karena pembayaran berhasil dikonfirmasi.',
                            ]);
                        }

                        // Deduct product stock automatically
                        Order::deductStock($order);
                    } elseif (in_array($newStatus, ['expired', 'cancelled', 'failed'])) {
                        $failedStatus = OrderStatus::where('slug', 'failed')->first();
                        if ($failedStatus) {
                            $order->update(['status_id' => $failedStatus->id]);
                            $order->histories()->create([
                                'status_id' => $failedStatus->id,
                                'description' => 'Status otomatis diperbarui menjadi Failed karena pembayaran gagal/kedaluwarsa.',
                            ]);
                        }
                    }
                });

                return response()->json([
                    'success' => true,
                    'message' => 'Status pembayaran berhasil disinkronisasi: ' . strtoupper($newStatus),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Midtrans tidak mengembalikan data status transaksi valid.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal sinkronisasi dengan Midtrans: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Generate Midtrans Snap Token and Payment URL for an existing order payment.
     */
    public function generatePaymentLink(Request $request, $id, \App\Services\MidtransService $midtransService)
    {
        $order = Order::with('payment')->findOrFail($id);

        if (!$order->payment) {
            $order->payment()->create([
                'payment_method' => 'Midtrans VA/QRIS',
                'amount' => $order->grand_total,
                'status' => 'waiting_payment',
            ]);
            $order->load('payment');
        }

        try {
            $snapData = $midtransService->createSnapToken($order);
            if (isset($snapData['token']) && isset($snapData['redirect_url'])) {
                $order->payment->update([
                    'snap_token' => $snapData['token'],
                    'payment_url' => $snapData['redirect_url'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Link pembayaran Midtrans berhasil dibuat!',
                    'payment_url' => $snapData['redirect_url'],
                    'snap_token' => $snapData['token']
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat snap token dari Midtrans.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi Midtrans: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Book shipping and generate waybill ID from Biteship API.
     */
    public function bookShipment(Request $request, $id, \App\Services\BiteshipService $biteshipService)
    {
        $order = Order::with(['payment', 'shipment', 'customer'])->findOrFail($id);

        if (!$order->payment || $order->payment->status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan belum lunas. Kurir Biteship hanya dapat di-booking jika pembayaran sudah Lunas.'
            ]);
        }

        if (!$order->shipment) {
            return response()->json([
                'success' => false,
                'message' => 'Detail pengiriman tidak ditemukan.'
            ]);
        }

        if ($order->shipment->biteship_order_id) {
            return response()->json([
                'success' => false,
                'message' => 'Kurir sudah di-booking sebelumnya. Biteship Order ID: ' . $order->shipment->biteship_order_id
            ]);
        }

        try {
            $shipperDetails = [
                'shipper_name' => config('app.name', 'Putri Jaya Mobil'),
                'shipper_phone' => '081234567890',
                'shipper_email' => 'admin@putrijayamobil.com',
                'origin_address' => 'Jl. Raya Putri Jaya Mobil No 1',
                'origin_postal_code' => config('biteship.origin.postal_code') ?? 14240,
            ];

            $result = $biteshipService->createOrder($order, $shipperDetails);

            $biteshipOrderId = $result['id'] ?? null;
            $waybillId = $result['courier']['waybill_id'] ?? null;
            $status = $result['status'] ?? 'pickup_requested';

            if (!$biteshipOrderId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Biteship tidak mengembalikan ID order yang valid.'
                ]);
            }

            $order->shipment->update([
                'biteship_order_id' => $biteshipOrderId,
                'waybill_id' => $waybillId,
                'status' => $status,
            ]);

            $shippingStatus = OrderStatus::where('slug', 'shipping')->first();
            if ($shippingStatus) {
                $order->update(['status_id' => $shippingStatus->id]);
                $order->histories()->create([
                    'status_id' => $shippingStatus->id,
                    'description' => 'Status otomatis diperbarui menjadi Shipping karena kurir Biteship telah berhasil di-booking dengan nomor resi: ' . ($waybillId ?: '-'),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Kurir Biteship berhasil di-booking! Nomor Resi: ' . ($waybillId ?: 'Menunggu pickup'),
                'waybill_id' => $waybillId,
                'biteship_order_id' => $biteshipOrderId
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal booking kurir Biteship: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get Biteship shipping label PDF and redirect.
     */
    public function printLabel($id, \App\Services\BiteshipService $biteshipService)
    {
        $order = Order::with('shipment')->findOrFail($id);

        if (!$order->shipment || !$order->shipment->biteship_order_id) {
            abort(404, 'Biteship order ID not found for this shipment.');
        }

        try {
            $apiKey = config('biteship.api_key') ?: config('order.biteship.api_key');
            $baseUrl = 'https://api.biteship.com';

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => $apiKey
            ])->get("{$baseUrl}/v1/orders/{$order->shipment->biteship_order_id}/label");

            if ($response->failed()) {
                return 'Gagal memuat label dari Biteship: ' . $response->body();
            }

            $data = $response->json();
            $fileUrl = $data['shipping_label']['file_url'] ?? null;

            if ($fileUrl) {
                return redirect()->away($fileUrl);
            }

            return 'Gagal mendapatkan URL file PDF label dari Biteship: ' . $response->body();
        } catch (\Exception $e) {
            return 'Gagal memuat label: ' . $e->getMessage();
        }
    }

    /**
     * Bulk book shipments for selected orders.
     */
    public function bulkBookShipment(Request $request, \App\Services\BiteshipService $biteshipService)
    {
        $ids = $request->ids;
        if (!is_array($ids) || empty($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada order yang dipilih.'
            ]);
        }

        $orders = Order::with(['payment', 'shipment', 'customer'])->whereIn('id', $ids)->get();

        $successCount = 0;
        $failedCount = 0;
        $errors = [];

        foreach ($orders as $order) {
            if (!$order->payment || $order->payment->status !== 'paid') {
                $failedCount++;
                $errors[] = "Order #{$order->order_number}: Belum lunas.";
                continue;
            }

            if (!$order->shipment) {
                $failedCount++;
                $errors[] = "Order #{$order->order_number}: Detail pengiriman tidak ditemukan.";
                continue;
            }

            if ($order->shipment->biteship_order_id) {
                $successCount++;
                continue;
            }

            try {
                $shipperDetails = [
                    'shipper_name' => config('app.name', 'Putri Jaya Mobil'),
                    'shipper_phone' => '081234567890',
                    'shipper_email' => 'admin@putrijayamobil.com',
                    'origin_address' => 'Jl. Raya Putri Jaya Mobil No 1',
                    'origin_postal_code' => config('biteship.origin.postal_code') ?? 14240,
                ];

                $result = $biteshipService->createOrder($order, $shipperDetails);

                $biteshipOrderId = $result['id'] ?? null;
                $waybillId = $result['courier']['waybill_id'] ?? null;
                $status = $result['status'] ?? 'pickup_requested';

                if (!$biteshipOrderId) {
                    $failedCount++;
                    $errors[] = "Order #{$order->order_number}: Biteship tidak mengembalikan ID order.";
                    continue;
                }

                $order->shipment->update([
                    'biteship_order_id' => $biteshipOrderId,
                    'waybill_id' => $waybillId,
                    'status' => $status,
                ]);

                $shippingStatus = OrderStatus::where('slug', 'shipping')->first();
                if ($shippingStatus) {
                    $order->update(['status_id' => $shippingStatus->id]);
                    $order->histories()->create([
                        'status_id' => $shippingStatus->id,
                        'description' => 'Status otomatis diperbarui menjadi Shipping karena kurir Biteship telah berhasil di-booking secara massal.',
                    ]);
                }

                $successCount++;
            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = "Order #{$order->order_number}: " . $e->getMessage();
            }
        }

        $msg = "Bulk booking selesai. Berhasil: {$successCount}, Gagal: {$failedCount}.";
        if (!empty($errors)) {
            $msg .= " Detail error: " . implode(" | ", $errors);
        }

        return response()->json([
            'success' => $successCount > 0,
            'message' => $msg
        ]);
    }

    /**
     * Bulk print shipping labels using an iframe container.
     */
    public function bulkPrintLabels(Request $request)
    {
        $idsString = $request->get('ids');
        if (!$idsString) {
            return 'Tidak ada order yang dipilih.';
        }

        $ids = explode(',', $idsString);
        
        $orders = Order::with(['shipment', 'customer'])
            ->whereIn('id', $ids)
            ->whereHas('shipment', function($q) {
                $q->whereNotNull('biteship_order_id')
                  ->where('biteship_order_id', '!=', '')
                  ->whereRaw('LENGTH(biteship_order_id) >= 20');
            })
            ->get();

        if ($orders->isEmpty()) {
            return 'Tidak ada order terpilih yang memiliki data booking Biteship yang valid.';
        }

        // Return a beautiful HTML wrapper with iframes
        $html = '<!DOCTYPE html>
<html>
<head>
    <title>Cetak Label Massal - Putri Jaya Mobil</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="' . asset('template/app-assets/css/bootstrap.min.css') . '">
    <style>
        body { margin: 0; padding: 0; background: #f8f9fa; font-family: "Montserrat", sans-serif; }
        .no-print-bar { background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7)); color: white; padding: 15px; position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 20px 0 rgba(0,0,0,0.1); }
        .label-card { background: white; border-radius: 8px; box-shadow: 0 4px 24px 0 rgba(34, 41, 47, 0.1); margin: 30px auto; max-width: 850px; padding: 20px; border: 1px solid rgba(34, 41, 47, 0.05); }
        .label-header { border-bottom: 2px solid #f3f3f3; padding-bottom: 10px; margin-bottom: 15px; font-weight: 700; color: #5e5873; display: flex; justify-content: space-between; align-items: center; }
        iframe { width: 100%; height: 650px; border: 1px solid #ebe9f1; border-radius: 6px; background: #fafafb; }
        @media print {
            .no-print-bar { display: none; }
            body { background: white; }
            .label-card { margin: 0; padding: 0; box-shadow: none; border: none; page-break-after: always; max-width: 100%; }
            iframe { height: 99vh; border: none; }
        }
    </style>
</head>
<body>
    <div class="no-print-bar d-flex justify-content-between align-items-center">
        <div>
            <h5 class="m-0 text-white font-weight-bold">📦 Cetak Label Massal (' . $orders->count() . ' Order)</h5>
            <small class="text-white-50">Silakan cetak halaman ini menggunakan printer thermal atau printer biasa Anda.</small>
        </div>
        <button onclick="window.print()" class="btn btn-success font-weight-bold btn-sm">Cetak Halaman Ini (Ctrl + P)</button>
    </div>
    <div class="container-fluid">';

        foreach ($orders as $order) {
            $printUrl = route('admin.orders.print-label', $order->id);
            $html .= '
            <div class="label-card">
                <div class="label-header">
                    <span>Order: ' . e($order->order_number) . ' (' . e($order->customer->name ?? '-') . ')</span>
                    <a href="' . $printUrl . '" target="_blank" class="btn btn-outline-primary btn-xs py-25">Buka di Tab Baru</a>
                </div>
                <iframe src="' . $printUrl . '"></iframe>
            </div>';
        }

        $html .= '
    </div>
</body>
</html>';

        return response($html, 200)->header('Content-Type', 'text/html');
    }
}
