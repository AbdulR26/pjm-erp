<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\ProductVariant;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'creator']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'like', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $perPage = $request->get('per_page', 10);
        $purchaseOrders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($purchaseOrders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'notes' => 'nullable|string|max:1000',
            'tax' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $po = DB::transaction(function () use ($request) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $totalCost = $item['quantity'] * $item['unit_cost'];
                $subtotal += $totalCost;

                $itemsData[] = [
                    'product_variant_id' => $item['product_variant_id'],
                    'quantity' => $item['quantity'],
                    'quantity_received' => 0,
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $totalCost,
                ];
            }

            $tax = (float) $request->get('tax', 0);
            $shippingCost = (float) $request->get('shipping_cost', 0);
            $grandTotal = $subtotal + $tax + $shippingCost;

            $po = PurchaseOrder::create([
                'supplier_id' => $request->supplier_id,
                'status' => 'draft',
                'order_date' => $request->order_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'created_by' => Auth::id() ?? 1,
            ]);

            foreach ($itemsData as $itemData) {
                $po->items()->create($itemData);
            }

            return $po;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase Order berhasil dibuat.',
            'purchase_order' => $po->load(['supplier', 'items.variant.product']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $po = PurchaseOrder::with(['supplier', 'creator', 'items.variant.product'])->findOrFail($id);
        return response()->json($po);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $po = PurchaseOrder::findOrFail($id);

        if ($po->status !== 'draft') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Purchase Order berstatus Draft yang dapat diperbarui.',
            ], 422);
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date|after_or_equal:order_date',
            'notes' => 'nullable|string|max:1000',
            'status' => 'nullable|string|in:draft,ordered,cancelled',
            'tax' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $po) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($request->items as $item) {
                $totalCost = $item['quantity'] * $item['unit_cost'];
                $subtotal += $totalCost;

                $itemsData[] = [
                    'product_variant_id' => $item['product_variant_id'],
                    'quantity' => $item['quantity'],
                    'quantity_received' => 0,
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $totalCost,
                ];
            }

            $tax = (float) $request->get('tax', 0);
            $shippingCost = (float) $request->get('shipping_cost', 0);
            $grandTotal = $subtotal + $tax + $shippingCost;

            $po->update([
                'supplier_id' => $request->supplier_id,
                'status' => $request->get('status', $po->status),
                'order_date' => $request->order_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
            ]);

            // Clear old items and write new ones
            $po->items()->delete();
            foreach ($itemsData as $itemData) {
                $po->items()->create($itemData);
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase Order berhasil diperbarui.',
            'purchase_order' => $po->load(['supplier', 'items.variant.product']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $po = PurchaseOrder::findOrFail($id);

        if ($po->status === 'received') {
            return response()->json([
                'status' => 'error',
                'message' => 'Purchase Order yang telah diterima tidak dapat dihapus.',
            ], 422);
        }

        $po->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase Order berhasil dihapus.',
        ]);
    }

    /**
     * Mark items as received and increment stocks.
     */
    public function receive(Request $request, $id)
    {
        $po = PurchaseOrder::with(['items.variant'])->findOrFail($id);

        if (in_array($po->status, ['received', 'cancelled'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Purchase Order dengan status Diterima atau Dibatalkan tidak dapat memproses penerimaan barang.',
            ], 422);
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity_received' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($request, $po) {
            $userId = Auth::id() ?? 1;

            foreach ($request->items as $receivedData) {
                $poItem = $po->items()->where('product_variant_id', $receivedData['product_variant_id'])->first();
                if ($poItem) {
                    $oldReceived = $poItem->quantity_received;
                    // Cap new received to order quantity
                    $newReceived = min((int) $receivedData['quantity_received'], $poItem->quantity);

                    $diff = $newReceived - $oldReceived;
                    if ($diff > 0) {
                        $variant = $poItem->variant;
                        $variant->increment('stock', $diff);

                        // Log Stock Mutation
                        StockMutation::create([
                            'product_variant_id' => $variant->id,
                            'user_id' => $userId,
                            'type' => 'in',
                            'quantity' => $diff,
                            'source' => 'purchase',
                            'notes' => "Terima barang PO #{$po->po_number}",
                        ]);
                    }

                    $poItem->update([
                        'quantity_received' => $newReceived,
                    ]);
                }
            }

            // Fresh load items to check total status
            $po->load('items');
            $allReceived = true;
            $anyReceived = false;

            foreach ($po->items as $item) {
                if ($item->quantity_received < $item->quantity) {
                    $allReceived = false;
                }
                if ($item->quantity_received > 0) {
                    $anyReceived = true;
                }
            }

            if ($allReceived) {
                $po->update([
                    'status' => 'received',
                    'received_date' => now(),
                ]);
            } else if ($anyReceived) {
                // If some items are received, mark it as ordered (or custom partially_received)
                // Let's use 'ordered' to allow further receives
                $po->update([
                    'status' => 'ordered',
                ]);
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Penerimaan barang PO berhasil disimpan.',
            'purchase_order' => $po->fresh()->load(['supplier', 'items.variant.product']),
        ]);
    }

    /**
     * Print PO Layout.
     */
    public function printPO($id)
    {
        $po = PurchaseOrder::with(['supplier', 'creator', 'items.variant.product'])->findOrFail($id);

        $itemsHtml = '';
        foreach ($po->items as $index => $item) {
            $num = $index + 1;
            $name = htmlspecialchars($item->variant->product->name ?? '-');
            $variant = htmlspecialchars($item->variant->name ?? '-');
            $sku = htmlspecialchars($item->variant->sku ?? '-');
            $qty = $item->quantity;
            $qtyRec = $item->quantity_received;
            $price = number_format($item->unit_cost, 0, ',', '.');
            $total = number_format($item->total_cost, 0, ',', '.');

            $itemsHtml .= "
                <tr>
                    <td class='text-center'>{$num}</td>
                    <td>
                        <div class='font-bold'>{$name}</div>
                        <div class='text-xs text-gray-500'>Varian: {$variant} | SKU: {$sku}</div>
                    </td>
                    <td class='text-center'>{$qty}</td>
                    <td class='text-center'>{$qtyRec}</td>
                    <td class='text-right'>Rp {$price}</td>
                    <td class='text-right font-bold'>Rp {$total}</td>
                </tr>
            ";
        }

        $formattedSubtotal = number_format($po->subtotal, 0, ',', '.');
        $formattedTax = number_format($po->tax, 0, ',', '.');
        $formattedShipping = number_format($po->shipping_cost, 0, ',', '.');
        $formattedTotal = number_format($po->grand_total, 0, ',', '.');
        
        $orderDate = $po->order_date ? $po->order_date->format('d-m-Y') : '-';
        $expectedDate = $po->expected_delivery_date ? $po->expected_delivery_date->format('d-m-Y') : '-';
        $supplierName = htmlspecialchars($po->supplier->name ?? '-');
        $supplierCompanyHtml = $po->supplier->company_name ? "<div>" . htmlspecialchars($po->supplier->company_name) . "</div>" : "";
        $supplierPhone = htmlspecialchars($po->supplier->phone ?? '-');
        $supplierEmail = htmlspecialchars($po->supplier->email ?? '-');
        $supplierAddress = htmlspecialchars($po->supplier->address ?? '-');
        $creatorName = htmlspecialchars($po->creator->name ?? 'System');
        $notesHtml = $po->notes ? "<div style='margin-top: 30px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px;'><div class='font-bold' style='color: #d97706; font-size: 12px; text-transform: uppercase;'>Catatan PO:</div><p style='margin: 5px 0 0 0; font-size: 13px; color: #92400e;'>" . nl2br(htmlspecialchars($po->notes)) . "</p></div>" : "";
        
        $taxHtml = $po->tax > 0 ? "<tr><td class='text-gray-500'>Pajak:</td><td class='text-right font-bold'>Rp {$formattedTax}</td></tr>" : "";
        $shippingHtml = $po->shipping_cost > 0 ? "<tr><td class='text-gray-500'>Biaya Kirim:</td><td class='text-right font-bold'>Rp {$formattedShipping}</td></tr>" : "";
        
        $statusLabel = strtoupper($po->status);

        return response("
            <!DOCTYPE html>
            <html lang='id'>
            <head>
                <meta charset='UTF-8'>
                <title>Purchase Order - {$po->po_number}</title>
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
                    .doc-title {
                        text-align: right;
                        font-size: 20px;
                        font-weight: 900;
                        color: #1e293b;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .info-table td {
                        vertical-align: top;
                        width: 50%;
                    }
                    .info-card {
                        background: #f8fafc;
                        border: 1px border #e2e8f0;
                        border-radius: 8px;
                        padding: 15px;
                        margin-right: 10px;
                        height: 100%;
                    }
                    .info-card-right {
                        background: #f8fafc;
                        border: 1px border #e2e8f0;
                        border-radius: 8px;
                        padding: 15px;
                        margin-left: 10px;
                        height: 100%;
                    }
                    .card-title {
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        color: #64748b;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #e2e8f0;
                        padding-bottom: 5px;
                    }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .items-table th {
                        background: #f1f5f9;
                        border-bottom: 2px solid #cbd5e1;
                        padding: 10px;
                        font-size: 11px;
                        text-transform: uppercase;
                        font-weight: 850;
                        color: #475569;
                    }
                    .items-table td {
                        padding: 10px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .totals-table {
                        width: 40%;
                        margin-left: auto;
                        border-collapse: collapse;
                    }
                    .totals-table td {
                        padding: 6px 10px;
                    }
                    .totals-table tr.grand-total {
                        background: #fef2f2;
                        font-weight: bold;
                        color: #dc2626;
                        border-top: 2px solid #fca5a5;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    .text-xs { font-size: 11px; }
                    .text-gray-500 { color: #64748b; }
                    .footer-notes {
                        margin-top: 50px;
                        font-size: 11px;
                        color: #94a3b8;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 15px;
                    }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class='invoice-box'>
                    <!-- Header -->
                    <table class='header-table'>
                        <tr>
                            <td>
                                <h1 class='logo-title'>PUTRI JAYA MOBIL</h1>
                                <div class='store-sub'>Suku Cadang & Aksesoris Mobil</div>
                            </td>
                            <td class='doc-title'>
                                Purchase Order
                                <div style='font-size: 12px; font-weight: bold; color: #64748b; margin-top: 5px;'>
                                    No: {$po->po_number}
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Info Cards -->
                    <table class='info-table'>
                        <tr>
                            <td>
                                <div class='info-card'>
                                    <div class='card-title'>Supplier</div>
                                    <div class='font-bold'>{$supplierName}</div>
                                    {$supplierCompanyHtml}
                                    <div>Tlp: {$supplierPhone}</div>
                                    <div>Email: {$supplierEmail}</div>
                                    <div style='margin-top: 5px; font-size: 12px;'>{$supplierAddress}</div>
                                </div>
                            </td>
                            <td>
                                <div class='info-card-right'>
                                    <div class='card-title'>Detail Transaksi</div>
                                    <table style='width: 100%; font-size: 13px;'>
                                        <tr><td style='width: 50%; color: #64748b;'>Tgl Order:</td><td class='font-bold'>{$orderDate}</td></tr>
                                        <tr><td style='color: #64748b;'>Estimasi Datang:</td><td class='font-bold'>{$expectedDate}</td></tr>
                                        <tr><td style='color: #64748b;'>Status PO:</td><td><span style='font-weight: 800; color: #dc2626;'>{$statusLabel}</span></td></tr>
                                        <tr><td style='color: #64748b;'>Dibuat Oleh:</td><td>{$creatorName}</td></tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Items Table -->
                    <table class='items-table'>
                        <thead>
                            <tr>
                                <th style='width: 5%;' class='text-center'>No</th>
                                <th style='width: 45%;'>Item Produk</th>
                                <th style='width: 10%;' class='text-center'>Qty Order</th>
                                <th style='width: 10%;' class='text-center'>Qty Terima</th>
                                <th style='width: 15%;' class='text-right'>Harga Beli</th>
                                <th style='width: 15%;' class='text-right'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {$itemsHtml}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <table class='totals-table'>
                        <tr>
                            <td class='text-gray-500'>Subtotal:</td>
                            <td class='text-right font-bold'>Rp {$formattedSubtotal}</td>
                        </tr>
                        {$taxHtml}
                        {$shippingHtml}
                        <tr class='grand-total'>
                            <td>Total PO:</td>
                            <td class='text-right'>Rp {$formattedTotal}</td>
                        </tr>
                    </table>

                    {$notesHtml}

                    <div class='footer-notes text-center'>
                        Dokumen ini adalah bukti transaksi resmi Purchase Order Putri Jaya Mobil.<br>
                        Silakan hubungi kami untuk informasi lebih lanjut mengenai pengiriman barang.
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
