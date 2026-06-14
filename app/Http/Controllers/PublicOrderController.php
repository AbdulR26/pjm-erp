<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Shipment;
use App\Models\ProductVariant;
use App\Models\ProductPrice;
use App\Models\Voucher;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicOrderController extends Controller
{
    public function __construct(protected MidtransService $midtransService) {}

    /**
     * Get list of active e-commerce vouchers.
     */
    public function vouchers()
    {
        $vouchers = Voucher::where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            })
            ->get()
            ->filter(function ($voucher) {
                return $voucher->quota === 0 || $voucher->used < $voucher->quota;
            })
            ->values();

        return response()->json($vouchers);
    }

    /**
     * Apply and validate a voucher code against a subtotal.
     */
    public function applyVoucher(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $voucher = Voucher::where('code', $validated['code'])->first();

        if (!$voucher) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode voucher tidak ditemukan.'
            ], 404);
        }

        if (!$voucher->isValidFor($validated['subtotal'])) {
            if ($validated['subtotal'] < $voucher->min_spend) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Min. belanja Rp ' . number_format($voucher->min_spend, 0, ',', '.') . ' belum terpenuhi.'
                ], 422);
            }
            return response()->json([
                'valid' => false,
                'message' => 'Voucher tidak aktif, kadaluwarsa, atau kuota habis.'
            ], 422);
        }

        $discount = $voucher->calculateDiscount($validated['subtotal']);

        return response()->json([
            'valid' => true,
            'discount' => $discount,
            'voucher' => $voucher
        ]);
    }

    /**
     * Create a new order, payment, and shipment from customer checkout.
     */
    public function store(Request $request)
    {
        // Authenticate via customer session
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $validated = $request->validate([
            'address' => 'required|array',
            'address.name' => 'required|string|max:255',
            'address.phone' => 'required|string|max:30',
            'address.detail' => 'required|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_name' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'courier' => 'required|array',
            'courier.id' => 'required|string',
            'courier.name' => 'required|string',
            'courier.service' => 'required|string',
            'courier.price' => 'required|numeric|min:0',
            'courier.eta' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'voucher_code' => 'nullable|string|exists:vouchers,code',
        ]);

        DB::beginTransaction();
        try {
            $subtotal = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                // Find matching product variant
                $variant = ProductVariant::where('product_id', $item['product_id'])
                    ->where('name', $item['variant_name'] ?? '')
                    ->first();
                
                // Fallback to first variant if not found by name
                if (!$variant) {
                    $variant = ProductVariant::where('product_id', $item['product_id'])->first();
                }

                if (!$variant) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Produk atau varian tidak ditemukan."
                    ], 422);
                }

                // Check stock availability
                if ($variant->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Stok tidak cukup untuk produk: {$variant->product->name} - {$variant->name}. Stok tersedia: {$variant->stock}"
                    ], 422);
                }

                // Resolve price for retail customer
                $unitPrice = $this->resolvePrice($variant, 'retail', $item['quantity']);
                $totalPrice = $unitPrice * $item['quantity'];
                $subtotal += $totalPrice;

                // Resolve product weight (default 1000 grams)
                $weight = 1000;
                $product = $variant->product;
                if ($product->attributes && isset($product->attributes['weight'])) {
                    $weight = (int) $product->attributes['weight'];
                } elseif ($product->attributes && isset($product->attributes['berat'])) {
                    $weight = (int) $product->attributes['berat'];
                }

                $orderItems[] = [
                    'product_variant_id' => $variant->id,
                    'product_name' => $product->name,
                    'variant_name' => $variant->name,
                    'sku' => $variant->sku ?: '',
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'weight' => $weight,
                ];
            }

            // Apply Voucher if provided
            $discount = 0;
            $voucher = null;
            if (!empty($validated['voucher_code'])) {
                $voucher = Voucher::where('code', $validated['voucher_code'])->first();
                if ($voucher) {
                    if (!$voucher->isValidFor($subtotal)) {
                        DB::rollBack();
                        return response()->json(['message' => 'Voucher tidak valid untuk pembelanjaan ini.'], 422);
                    }
                    $discount = $voucher->calculateDiscount($subtotal);
                }
            }

            $shippingCost = $validated['courier']['price'];
            $grandTotal = ($subtotal + $shippingCost) - $discount;

            // Create the Order
            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'customer_id' => $customer['id'],
                'customer_level' => 'retail',
                'voucher_id' => $voucher ? $voucher->id : null,
                'voucher_code' => $voucher ? $voucher->code : null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'status' => Order::STATUS_PENDING,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Save items and deduct stock
            foreach ($orderItems as $itemData) {
                $order->items()->create($itemData);

                // Decrement stock
                ProductVariant::where('id', $itemData['product_variant_id'])
                    ->decrement('stock', $itemData['quantity']);
            }

            // Increment voucher used count
            if ($voucher) {
                $voucher->increment('used');
            }

            // Create Payment record in pending state
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'Midtrans VA/QRIS',
                'status' => Payment::STATUS_PENDING,
                'amount' => $grandTotal,
                'expired_at' => now()->addHours(24),
            ]);

            // Create Shipment record first (so Midtrans can fetch shipping address)
            $shipment = Shipment::create([
                'order_id' => $order->id,
                'courier_company' => $validated['courier']['id'],
                'courier_service' => $validated['courier']['service'],
                'courier_service_name' => $validated['courier']['name'],
                'etd' => $validated['courier']['eta'],
                'cost' => $shippingCost,
                'status' => Shipment::STATUS_DRAFT,
                'destination_contact_name' => $validated['address']['name'],
                'destination_contact_phone' => $validated['address']['phone'],
                'destination_address' => $validated['address']['detail'],
            ]);

            // Set relations temporarily for token generation
            $order->setRelation('payment', $payment);
            $order->setRelation('shipment', $shipment);

            // Generate Midtrans Snap token
            $snapResult = $this->midtransService->createSnapToken($order);

            // Update payment details and status
            $payment->update([
                'snap_token'  => $snapResult['token'],
                'payment_url' => $snapResult['redirect_url'],
                'status'      => Payment::STATUS_WAITING,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order berhasil dibuat.',
                'order' => $order->load(['items', 'payment', 'shipment']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simulate payment success for a client order.
     */
    public function paySimulate(Request $request, string $id)
    {
        $order = Order::with('payment')->findOrFail($id);

        if (!$order->payment) {
            return response()->json(['message' => 'Tidak ada payment untuk order ini.'], 404);
        }

        if ($order->payment->isPaid()) {
            return response()->json(['message' => 'Order ini sudah dibayar.'], 400);
        }

        DB::beginTransaction();
        try {
            $paymentMethod = $request->input('payment_method', 'Midtrans VA/QRIS');

            $order->payment->update([
                'status' => Payment::STATUS_PAID,
                'paid_at' => now(),
                'payment_method' => $paymentMethod,
                'midtrans_transaction_id' => 'SIM-' . strtoupper(substr(uniqid(), -8)),
                'midtrans_payment_type' => $paymentMethod,
            ]);

            $order->update([
                'status' => Order::STATUS_PROCESSING,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Simulasi pembayaran berhasil.',
                'order' => $order->fresh(['items', 'payment', 'shipment']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mensimulasikan pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Resolve unit price based on tiered pricing or variant base price.
     */
    private function resolvePrice(ProductVariant $variant, string $level, int $qty): float
    {
        $tieredPrice = ProductPrice::where('product_variant_id', $variant->id)
            ->where('level', $level)
            ->where('min_qty', '<=', $qty)
            ->orderBy('min_qty', 'desc')
            ->first();

        if ($tieredPrice) {
            return (float) $tieredPrice->price;
        }

        return (float) $variant->base_price;
    }

    /**
     * Get list of orders for the currently logged-in customer.
     */
    public function index()
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $orders = Order::with(['items', 'payment', 'shipment'])
            ->where('customer_id', $customer['id'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get or generate a new Midtrans Snap payment token for an existing customer order.
     */
    public function getOrCreatePayment(string $orderId)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $order = Order::with(['customer', 'items', 'payment', 'shipment'])
            ->where('customer_id', $customer['id'])
            ->findOrFail($orderId);

        // Don't allow generating payment for a paid order
        if ($order->payment && $order->payment->isPaid()) {
            return response()->json(['message' => 'Order ini sudah memiliki pembayaran yang lunas.'], 422);
        }

        DB::beginTransaction();
        try {
            $payment = $order->payment;
            if (!$payment) {
                // Create Payment record
                $payment = Payment::create([
                    'order_id'        => $order->id,
                    'payment_method'  => 'Midtrans VA/QRIS',
                    'status'          => Payment::STATUS_PENDING,
                    'amount'          => $order->grand_total,
                    'expired_at'      => now()->addHours(24),
                ]);
            }

            // Generate Snap token if not present or expired (using a threshold of 23 hours)
            if (!$payment->snap_token || $payment->updated_at->addHours(23)->isPast()) {
                $order->setRelation('payment', $payment);
                $snapResult = $this->midtransService->createSnapToken($order);

                $payment->update([
                    'snap_token'  => $snapResult['token'],
                    'payment_url' => $snapResult['redirect_url'],
                    'status'      => Payment::STATUS_WAITING,
                ]);
            }

            DB::commit();

            return response()->json([
                'payment' => $payment->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mendapatkan token pembayaran: ' . $e->getMessage()], 500);
        }
    }
}
