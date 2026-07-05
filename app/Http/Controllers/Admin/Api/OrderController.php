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

            // Create notification for customer
            \App\Models\CustomerNotification::create([
                'customer_id' => $order->customer_id,
                'title' => 'Pesanan Dibuat',
                'message' => "Pesanan {$order->order_number} telah dibuat untuk Anda. Silakan periksa detail pesanan.",
                'type' => 'order',
                'link' => '?page=profile&tab=orders',
            ]);

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

            // Create notification for customer when status changes
            if (isset($updateData['status'])) {
                $statusMessages = [
                    Order::STATUS_PROCESSING => ['Pesanan Diproses', "Pesanan {$order->order_number} sedang diproses oleh admin."],
                    Order::STATUS_SHIPPING   => ['Pesanan Dikirim', "Pesanan {$order->order_number} sedang dalam pengiriman."],
                    Order::STATUS_COMPLETED  => ['Pesanan Selesai', "Pesanan {$order->order_number} telah selesai. Terima kasih atas pembelian Anda!"],
                    Order::STATUS_CANCELLED  => ['Pesanan Dibatalkan', "Pesanan {$order->order_number} telah dibatalkan."],
                    Order::STATUS_FAILED     => ['Pesanan Gagal', "Pesanan {$order->order_number} gagal diproses."],
                ];

                if (isset($statusMessages[$updateData['status']])) {
                    [$title, $message] = $statusMessages[$updateData['status']];
                    \App\Models\CustomerNotification::create([
                        'customer_id' => $order->customer_id,
                        'title' => $title,
                        'message' => $message,
                        'type' => 'order',
                        'link' => '?page=profile&tab=orders',
                    ]);
                }
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
     * Return print-friendly HTML Invoices for multiple orders.
     */
    public function printInvoices(Request $request)
    {

        $orderIds = $request->input('order_ids');
        if (is_string($orderIds)) {
            $orderIds = explode(',', $orderIds);
        }

        if (empty($orderIds)) {
            return response("Tidak ada order yang dipilih.", 400);
        }

        $orders = Order::with(['customer', 'items', 'payment', 'shipment'])->whereIn('id', $orderIds)->orderBy('created_at', 'desc')->get();

        if ($orders->isEmpty()) {
            return response("Order tidak ditemukan.", 404);
        }

        return view('admin.orders.print-invoice', compact('orders'));
    }

    /**
     * Return print-friendly HTML Shipping Labels (Resi) for multiple orders.
     */
    public function printResis(Request $request)
    {

        $orderIds = $request->input('order_ids');
        if (is_string($orderIds)) {
            $orderIds = explode(',', $orderIds);
        }

        if (empty($orderIds)) {
            return response("Tidak ada order yang dipilih.", 400);
        }

        $orders = Order::with(['customer', 'items', 'shipment'])->whereIn('id', $orderIds)->orderBy('created_at', 'desc')->get();

        if ($orders->isEmpty()) {
            return response("Order tidak ditemukan.", 404);
        }

        return view('admin.orders.print-resi', compact('orders'));
    }

    /**
     * Return print-friendly HTML Invoice for an order.
     */
    public function printInvoice(string $id)
    {

        $order = Order::with(['customer', 'items', 'payment', 'shipment'])->findOrFail($id);
        $orders = collect([$order]);

        return view('admin.orders.print-invoice', compact('orders'));
    }

    /**
     * Return print-friendly HTML Shipping Label (Resi) for an order.
     */
    public function printResi(string $id)
    {

        $order = Order::with(['customer', 'items', 'shipment'])->findOrFail($id);
        $orders = collect([$order]);

        return view('admin.orders.print-resi', compact('orders'));
    }
}
