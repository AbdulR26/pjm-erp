<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ProductPrice;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * List all orders with filters, pagination.
     */
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'payment', 'shipment', 'items'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by customer
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Search by order number
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        $orders = $query->paginate($request->get('per_page', 15));

        return response()->json($orders);
    }

    /**
     * Create a new order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id'   => 'required|exists:customers,id',
            'customer_level' => ['required', Rule::in(Order::CUSTOMER_LEVELS)],
            'notes'          => 'nullable|string|max:500',
            'items'          => 'required|array|min:1',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity'           => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $subtotal    = 0;
            $orderItems  = [];
            $customerLevel = $validated['customer_level'];

            foreach ($validated['items'] as $item) {
                $variant = ProductVariant::with(['product', 'prices'])->findOrFail($item['product_variant_id']);

                // Validate stock
                if ($variant->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Stok tidak cukup untuk produk: {$variant->product->name} - {$variant->name}. Stok tersedia: {$variant->stock}"
                    ], 422);
                }

                // Resolve unit price: check tiered prices by level then fallback to base_price
                $unitPrice = $this->resolvePrice($variant, $customerLevel, $item['quantity']);

                $totalPrice = $unitPrice * $item['quantity'];
                $subtotal  += $totalPrice;

                // Get product weight from attributes
                $weight = 1000;
                if ($variant->product->attributes && isset($variant->product->attributes['weight'])) {
                    $weight = (int) $variant->product->attributes['weight'];
                } elseif ($variant->product->attributes && isset($variant->product->attributes['berat'])) {
                    $weight = (int) $variant->product->attributes['berat'];
                }

                $orderItems[] = [
                    'product_variant_id' => $variant->id,
                    'product_name'       => $variant->product->name,
                    'variant_name'       => $variant->name,
                    'sku'                => $variant->sku,
                    'quantity'           => $item['quantity'],
                    'unit_price'         => $unitPrice,
                    'total_price'        => $totalPrice,
                    'weight'             => $weight,
                ];
            }

            // Create Order
            $order = Order::create([
                'order_number'   => Order::generateOrderNumber(),
                'customer_id'    => $validated['customer_id'],
                'customer_level' => $customerLevel,
                'subtotal'       => $subtotal,
                'discount'       => 0,
                'shipping_cost'  => 0, // set when shipment is created
                'grand_total'    => $subtotal,
                'status'         => Order::STATUS_PENDING,
                'notes'          => $validated['notes'] ?? null,
            ]);

            // Create Order Items + reduce stock
            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);

                // Deduct stock
                ProductVariant::where('id', $itemData['product_variant_id'])
                    ->decrement('stock', $itemData['quantity']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order berhasil dibuat.',
                'order'   => $order->load(['customer', 'items', 'payment', 'shipment']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Show single order detail.
     */
    public function show(string $id)
    {
        $order = Order::with([
            'customer',
            'items.productVariant.product',
            'payment',
            'shipment',
        ])->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update order status or notes.
     */
    public function update(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in([
                Order::STATUS_PENDING,
                Order::STATUS_PROCESSING,
                Order::STATUS_SHIPPING,
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
                Order::STATUS_FAILED,
            ])],
            'notes'          => 'nullable|string|max:500',
            'shipping_cost'  => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $updateData = array_filter($validated, fn($v) => $v !== null);

            // Recalculate grand_total if shipping_cost changes
            if (isset($updateData['shipping_cost'])) {
                $updateData['grand_total'] = ($order->subtotal - $order->discount) + $updateData['shipping_cost'];
            }

            $order->update($updateData);

            // If order cancelled, restore stock
            if (isset($updateData['status']) && $updateData['status'] === Order::STATUS_CANCELLED) {
                $this->restoreStock($order);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order diperbarui.',
                'order'   => $order->fresh(['customer', 'items', 'payment', 'shipment']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cancel and delete an order (only if pending and no paid payment).
     */
    public function destroy(string $id)
    {
        $order = Order::with(['payment', 'items'])->findOrFail($id);

        if ($order->payment && $order->payment->isPaid()) {
            return response()->json(['message' => 'Order dengan pembayaran lunas tidak dapat dihapus.'], 422);
        }

        DB::beginTransaction();
        try {
            $this->restoreStock($order);
            $order->delete();
            DB::commit();

            return response()->json(['message' => 'Order berhasil dihapus.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus order: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Resolve price for a variant based on customer level and quantity.
     */
    private function resolvePrice(ProductVariant $variant, string $level, int $qty): float
    {
        // Get tiered pricing for this level, matching quantity
        $tieredPrice = ProductPrice::where('product_variant_id', $variant->id)
            ->where('level', $level)
            ->where('min_qty', '<=', $qty)
            ->orderBy('min_qty', 'desc')
            ->first();

        if ($tieredPrice) {
            return (float) $tieredPrice->price;
        }

        // Fallback to base_price
        return (float) $variant->base_price;
    }

    /**
     * Restore stock to product variants when order is cancelled.
     */
    private function restoreStock(Order $order): void
    {
        foreach ($order->items as $item) {
            ProductVariant::where('id', $item->product_variant_id)
                ->increment('stock', $item->quantity);
        }
    }

    /**
     * Return print-friendly HTML Invoice for an order.
     */
    public function printInvoice(string $id)
    {
        $order = Order::with(['customer', 'items', 'payment', 'shipment'])->findOrFail($id);

        $subtotal = $order->subtotal;
        $discount = $order->discount;
        $shippingCost = $order->shipping_cost;
        $grandTotal = $order->grand_total;

        $itemsHtml = '';
        foreach ($order->items as $index => $item) {
            $num = $index + 1;
            $name = htmlspecialchars($item->product_name);
            $variant = htmlspecialchars($item->variant_name);
            $sku = htmlspecialchars($item->sku);
            $qty = $item->quantity;
            $price = number_format($item->unit_price, 0, ',', '.');
            $total = number_format($item->total_price, 0, ',', '.');

            $itemsHtml .= "
                <tr>
                    <td class='text-center'>{$num}</td>
                    <td>
                        <div class='font-bold'>{$name}</div>
                        <div class='text-xs text-gray-500'>Varian: {$variant} | SKU: {$sku}</div>
                    </td>
                    <td class='text-center'>{$qty}</td>
                    <td class='text-right'>Rp {$price}</td>
                    <td class='text-right font-bold'>Rp {$total}</td>
                </tr>
            ";
        }

        $formattedSubtotal = number_format($subtotal, 0, ',', '.');
        $formattedDiscount = number_format($discount, 0, ',', '.');
        $formattedShipping = number_format($shippingCost, 0, ',', '.');
        $formattedTotal = number_format($grandTotal, 0, ',', '.');
        
        $orderDate = $order->created_at ? $order->created_at->format('d-m-Y H:i') : '-';
        $customerName = htmlspecialchars($order->customer->name ?? '-');
        $customerPhone = htmlspecialchars($order->customer->phone ?? '-');
        $customerEmail = htmlspecialchars($order->customer->email ?? '-');
        
        $shippingAddress = htmlspecialchars($order->shipment->destination_address ?? ($order->customer->address ?? '-'));
        $shippingPhone = htmlspecialchars($order->shipment->destination_contact_phone ?? $customerPhone);
        $shippingName = htmlspecialchars($order->shipment->destination_contact_name ?? $customerName);
        
        $statusLabel = strtoupper($order->status);
        $paymentStatus = strtoupper($order->payment->status ?? 'UNPAID');
        $paymentMethod = htmlspecialchars($order->paymentMethod ?? ($order->payment->payment_type ?? 'Midtrans / Online'));

        return response("
            <!DOCTYPE html>
            <html lang='id'>
            <head>
                <meta charset='UTF-8'>
                <title>Invoice - {$order->order_number}</title>
                <style>
                    body {
                        font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        color: #334155;
                        margin: 0;
                        padding: 30px;
                        font-size: 14px;
                        line-height: 1.5;
                        background: #fff;
                    }
                    .invoice-box {
                        max-width: 800px;
                        margin: auto;
                    }
                    .header-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .logo-title {
                        font-size: 24px;
                        font-weight: 800;
                        color: #dc2626;
                        letter-spacing: -0.5px;
                        margin: 0;
                    }
                    .store-sub {
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #94a3b8;
                        font-weight: 700;
                        margin-top: 2px;
                    }
                    .store-info {
                        font-size: 12px;
                        color: #64748b;
                        margin-top: 6px;
                        line-height: 1.4;
                    }
                    .invoice-title {
                        font-size: 28px;
                        font-weight: 900;
                        text-align: right;
                        color: #1e293b;
                        margin: 0;
                        text-transform: uppercase;
                    }
                    .invoice-meta {
                        text-align: right;
                        font-size: 13px;
                        color: #64748b;
                        margin-top: 8px;
                    }
                    .meta-item {
                        margin-bottom: 3px;
                    }
                    .meta-item span {
                        font-weight: 750;
                        color: #1e293b;
                    }
                    .badge {
                        display: inline-block;
                        padding: 2px 8px;
                        font-size: 10px;
                        font-weight: 800;
                        border-radius: 4px;
                        text-transform: uppercase;
                    }
                    .badge-paid { background: #dcfce7; color: #15803d; }
                    .badge-unpaid { background: #fef2f2; color: #b91c1c; }
                    .badge-pending { background: #fef9c3; color: #a16207; }
                    .badge-shipping { background: #e0e7ff; color: #4338ca; }
                    .badge-completed { background: #dcfce7; color: #15803d; }
                    
                    .addresses-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 40px;
                    }
                    .addresses-table td {
                        width: 50%;
                        vertical-align: top;
                    }
                    .section-title {
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: #94a3b8;
                        margin-bottom: 8px;
                        border-bottom: 2px solid #f1f5f9;
                        padding-bottom: 4px;
                        margin-right: 15px;
                    }
                    .address-box {
                        font-size: 13px;
                        color: #475569;
                        line-height: 1.5;
                        margin-right: 15px;
                    }
                    .address-name {
                        font-weight: 700;
                        color: #1e293b;
                        font-size: 14px;
                        margin-bottom: 4px;
                    }
                    
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .items-table th {
                        background: #f8fafc;
                        border-bottom: 2px solid #cbd5e1;
                        padding: 10px 12px;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: #64748b;
                    }
                    .items-table td {
                        padding: 12px;
                        border-bottom: 1px solid #e2e8f0;
                        vertical-align: top;
                    }
                    
                    .text-left { text-align: left; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    
                    .summary-table {
                        width: 45%;
                        margin-left: auto;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .summary-table td {
                        padding: 6px 12px;
                    }
                    .summary-table tr.total-row {
                        font-size: 16px;
                        font-weight: 950;
                        color: #1e293b;
                        border-top: 2px solid #cbd5e1;
                    }
                    .summary-table tr.total-row td {
                        padding-top: 12px;
                        color: #dc2626;
                    }
                    
                    .footer {
                        margin-top: 80px;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 20px;
                        text-align: center;
                        font-size: 11px;
                        color: #94a3b8;
                        font-weight: 500;
                    }
                    
                    @media print {
                        body { padding: 0; }
                        @page { margin: 1.5cm; }
                    }
                </style>
            </head>
            <body>
                <div class='invoice-box'>
                    <!-- Header -->
                    <table class='header-table'>
                        <tr>
                            <td>
                                <div class='logo-title'>PUTRI JAYA MOBIL</div>
                                <div class='store-sub'>Premium E-Commerce</div>
                                <div class='store-info'>
                                    Jl. Raya Putri Jaya Mobil No. 1, Bekasi<br>
                                    Telp: 0812-3456-7890<br>
                                    Email: support@putrijayamobil.com
                                </div>
                            </td>
                            <td>
                                <div class='invoice-title'>INVOICE</div>
                                <div class='invoice-meta'>
                                    <div class='meta-item'>No. Order: <span>{$order->order_number}</span></div>
                                    <div class='meta-item'>Tanggal: <span>{$orderDate}</span></div>
                                    <div class='meta-item'>Metode: <span>{$paymentMethod}</span></div>
                                    <div class='meta-item'>Status Bayar: 
                                        <span class='badge " . ($paymentStatus === 'PAID' ? 'badge-paid' : ($paymentStatus === 'PENDING' ? 'badge-pending' : 'badge-unpaid')) . "'>
                                            {$paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Addresses -->
                    <table class='addresses-table'>
                        <tr>
                            <td>
                                <div class='section-title'>DITAGIH KEPADA:</div>
                                <div class='address-box'>
                                    <div class='address-name'>{$customerName}</div>
                                    <div>Email: {$customerEmail}</div>
                                    <div>Telp: {$customerPhone}</div>
                                </div>
                            </td>
                            <td>
                                <div class='section-title'>DIKIRIM KEPADA:</div>
                                <div class='address-box'>
                                    <div class='address-name'>{$shippingName}</div>
                                    <div>Telp: {$shippingPhone}</div>
                                    <div>Alamat: {$shippingAddress}</div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Items -->
                    <table class='items-table'>
                        <thead>
                            <tr>
                                <th class='text-center' style='width: 40px;'>No</th>
                                <th class='text-left'>Deskripsi Produk</th>
                                <th class='text-center' style='width: 80px;'>Qty</th>
                                <th class='text-right' style='width: 140px;'>Harga Satuan</th>
                                <th class='text-right' style='width: 140px;'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {$itemsHtml}
                        </tbody>
                    </table>

                    <!-- Pricing Summary -->
                    <table class='summary-table'>
                        <tr>
                            <td>Subtotal</td>
                            <td class='text-right'>Rp {$formattedSubtotal}</td>
                        </tr>
                        " . ($discount > 0 ? "
                        <tr>
                            <td style='color: #16a34a;'>Diskon</td>
                            <td class='text-right' style='color: #16a34a;'>-Rp {$formattedDiscount}</td>
                        </tr>
                        " : "") . "
                        <tr>
                            <td>Ongkos Kirim</td>
                            <td class='text-right'>Rp {$formattedShipping}</td>
                        </tr>
                        <tr class='total-row'>
                            <td>Total Bayar</td>
                            <td class='text-right'>Rp {$formattedTotal}</td>
                        </tr>
                    </table>

                    <!-- Footer -->
                    <div class='footer'>
                        Terima kasih telah berbelanja di Putri Jaya Mobil.<br>
                        Jika Anda memiliki pertanyaan tentang invoice ini, silakan hubungi customer service kami.
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        ");
    }

    /**
     * Return print-friendly HTML Shipping Label (Resi) for an order.
     */
    public function printResi(string $id)
    {
        $order = Order::with(['customer', 'items', 'shipment'])->findOrFail($id);
        $shipment = $order->shipment;

        if (!$shipment) {
            return response("
                <div style='font-family: sans-serif; text-align: center; padding: 50px;'>
                    <h2>Pengiriman Belum Di-booking</h2>
                    <p>Silakan lakukan booking pengiriman terlebih dahulu di panel admin agar nomor resi/resi pengiriman tersedia.</p>
                    <button onclick='window.close()' style='padding: 8px 16px; background: #dc2626; color: #fff; border: none; border-radius: 4px; cursor: pointer;'>Tutup Halaman</button>
                </div>
            ", 404);
        }

        $courierName = strtoupper($shipment->courier_company);
        $courierService = strtoupper($shipment->courier_service_name ?? $shipment->courier_service);
        $waybill = $shipment->waybill_id ?? 'BELUM ADA RESI';
        
        $senderName = htmlspecialchars($shipment->origin_contact_name ?? 'Putri Jaya Mobil');
        $senderPhone = htmlspecialchars($shipment->origin_contact_phone ?? '0812-3456-7890');
        $senderAddress = htmlspecialchars($shipment->origin_address ?? 'Jl. Raya Putri Jaya Mobil No. 1, Bekasi');

        $receiverName = htmlspecialchars($shipment->destination_contact_name ?? ($order->customer->name ?? '-'));
        $receiverPhone = htmlspecialchars($shipment->destination_contact_phone ?? ($order->customer->phone ?? '-'));
        $receiverAddress = htmlspecialchars($shipment->destination_address ?? ($order->customer->address ?? '-'));
        $receiverPostal = htmlspecialchars($shipment->destination_postal_code ?? '');

        $itemsListHtml = '';
        foreach ($order->items as $index => $item) {
            $num = $index + 1;
            $name = htmlspecialchars($item->product_name);
            $variant = htmlspecialchars($item->variant_name);
            $qty = $item->quantity;
            $itemsListHtml .= "
                <div style='border-bottom: 1px dashed #cbd5e1; padding: 6px 0; font-size: 12px;'>
                    <span style='font-weight: bold;'>[ {$qty}x ]</span> {$name} ({$variant})
                </div>
            ";
        }

        return response("
            <!DOCTYPE html>
            <html lang='id'>
            <head>
                <meta charset='UTF-8'>
                <title>Label Pengiriman - {$order->order_number}</title>
                <style>
                    body {
                        font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                        color: #1e293b;
                        margin: 0;
                        padding: 15px;
                        background: #f8fafc;
                        display: flex;
                        justify-content: center;
                    }
                    .label-box {
                        width: 450px;
                        background: #fff;
                        border: 3px solid #000;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .header-label {
                        border-bottom: 3px double #000;
                        padding-bottom: 12px;
                        margin-bottom: 12px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .courier-badge {
                        font-size: 26px;
                        font-weight: 900;
                        color: #000;
                        letter-spacing: -1px;
                    }
                    .service-badge {
                        font-size: 13px;
                        font-weight: 750;
                        background: #000;
                        color: #fff;
                        padding: 3px 8px;
                        border-radius: 4px;
                    }
                    .resi-block {
                        text-align: center;
                        border: 2px solid #000;
                        padding: 12px;
                        margin-bottom: 15px;
                        background: #f8fafc;
                    }
                    .resi-title {
                        font-size: 11px;
                        font-weight: 750;
                        color: #64748b;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 4px;
                    }
                    .resi-val {
                        font-size: 22px;
                        font-weight: 900;
                        letter-spacing: 1px;
                        margin: 0;
                    }
                    .order-num {
                        font-size: 11px;
                        color: #475569;
                        margin-top: 4px;
                    }
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    .info-table td {
                        width: 50%;
                        vertical-align: top;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .info-table td:first-child {
                        border-right: 2px dashed #000;
                        padding-right: 12px;
                    }
                    .info-table td:last-child {
                        padding-left: 12px;
                    }
                    .title-bold {
                        font-weight: 800;
                        font-size: 11px;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                        color: #000;
                    }
                    .addr-name {
                        font-size: 13px;
                        font-weight: 750;
                        color: #000;
                        margin-bottom: 2px;
                    }
                    .packing-block {
                        border-top: 3px double #000;
                        padding-top: 12px;
                        margin-top: 15px;
                    }
                    .packing-title {
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                        color: #000;
                    }
                    
                    @media print {
                        body { background: #fff; padding: 0; }
                        .label-box { border: 3px solid #000; box-shadow: none; }
                        @page { margin: 0.5cm; }
                    }
                </style>
            </head>
            <body>
                <div class='label-box'>
                    <!-- Header -->
                    <div class='header-label'>
                        <div class='courier-badge'>{$courierName}</div>
                        <div class='service-badge'>{$courierService}</div>
                    </div>

                    <!-- Resi Val -->
                    <div class='resi-block'>
                        <div class='resi-title'>No. Resi Pengiriman</div>
                        <div class='resi-val'>{$waybill}</div>
                        <div class='order-num'>Order: {$order->order_number}</div>
                    </div>

                    <!-- Shipping Info -->
                    <table class='info-table'>
                        <tr>
                            <td>
                                <div class='title-bold'>PENGIRIM (SENDER):</div>
                                <div class='addr-name'>{$senderName}</div>
                                <div>Telp: {$senderPhone}</div>
                                <div style='margin-top: 4px; color: #334155;'>{$senderAddress}</div>
                            </td>
                            <td>
                                <div class='title-bold'>PENERIMA (RECIPIENT):</div>
                                <div class='addr-name'>{$receiverName}</div>
                                <div>Telp: {$receiverPhone}</div>
                                <div style='margin-top: 4px; color: #334155;'>
                                    {$receiverAddress}
                                    " . ($receiverPostal ? "<br><strong>Kode Pos: {$receiverPostal}</strong>" : "") . "
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Packing List -->
                    <div class='packing-block'>
                        <div class='packing-title'>Daftar Barang (Packing List)</div>
                        {$itemsListHtml}
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        ");
    }
}
