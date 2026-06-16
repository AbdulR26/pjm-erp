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
            'shipping_cost' => 'nullable|numeric|min:0',
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

        $shippingCost = $validated['shipping_cost'] ?? 0;
        $discount = $voucher->calculateDiscount($validated['subtotal'], $shippingCost);

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
            'address.postal_code' => 'required|string|max:10',
            'address.latitude' => 'nullable|numeric',
            'address.longitude' => 'nullable|numeric',
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
            $appliedVoucherIds = [];
            $shippingCostVal = $validated['courier']['price'];
            if (!empty($validated['voucher_code'])) {
                // Split by '+' for stacked vouchers
                $voucherCodes = explode('+', $validated['voucher_code']);
                foreach ($voucherCodes as $code) {
                    $vch = Voucher::where('code', trim($code))->first();
                    if ($vch) {
                        if (!$vch->isValidFor($subtotal)) {
                            DB::rollBack();
                            return response()->json(['message' => "Voucher {$vch->code} tidak valid untuk pembelanjaan ini."], 422);
                        }
                        
                        $vchDiscount = $vch->calculateDiscount($subtotal, $shippingCostVal);
                        $discount += $vchDiscount;

                        if (!$voucher) {
                            $voucher = $vch;
                        }
                        $appliedVoucherIds[] = $vch->id;
                    }
                }
            }

            $shippingCost = $shippingCostVal;
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
            if (!empty($appliedVoucherIds)) {
                Voucher::whereIn('id', $appliedVoucherIds)->increment('used');
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
                'destination_postal_code' => $validated['address']['postal_code'],
                'destination_latitude' => $validated['address']['latitude'] ?? null,
                'destination_longitude' => $validated['address']['longitude'] ?? null,
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

            // Create notification for customer
            \App\Models\CustomerNotification::create([
                'customer_id' => $customer['id'],
                'title' => 'Pesanan Dibuat',
                'message' => "Pesanan {$order->order_number} berhasil dibuat. Silakan lakukan pembayaran.",
                'type' => 'order',
                'link' => '?page=profile&tab=orders',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Order berhasil dibuat.',
                'order' => $order->load(['items.productVariant.product', 'payment', 'shipment']),
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

            // Create notification for customer
            \App\Models\CustomerNotification::create([
                'customer_id' => $order->customer_id,
                'title' => 'Pembayaran Berhasil',
                'message' => "Pembayaran untuk pesanan {$order->order_number} telah kami terima. Pesanan sedang diproses.",
                'type' => 'payment',
                'link' => '?page=profile&tab=orders',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Simulasi pembayaran berhasil.',
                'order' => $order->fresh(['items.productVariant.product', 'payment', 'shipment']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mensimulasikan pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Simulate shipment booking, tracking milestones, and delivery completion.
     */
    public function shipSimulate(Request $request, string $id)
    {
        $order = Order::with(['payment', 'shipment', 'customer'])->findOrFail($id);

        if ($order->payment && !$order->payment->isPaid()) {
            return response()->json(['message' => 'Pesanan harus dibayar terlebih dahulu untuk memulai simulasi pengiriman.'], 400);
        }

        DB::beginTransaction();
        try {
            $shipment = $order->shipment;
            
            $mockHistory = [
                [
                    'time' => now()->subHours(4)->toIso8601String(),
                    'note' => 'Penjual telah menyerahkan paket ke kurir ekspedisi.',
                    'status' => 'picked',
                ],
                [
                    'time' => now()->subHours(3)->toIso8601String(),
                    'note' => 'Paket sedang transit di pusat distribusi Jakarta.',
                    'status' => 'in_transit',
                ],
                [
                    'time' => now()->subHours(2)->toIso8601String(),
                    'note' => 'Paket sedang dibawa oleh kurir menuju alamat tujuan.',
                    'status' => 'dropping_off',
                ],
                [
                    'time' => now()->subMinutes(30)->toIso8601String(),
                    'note' => 'Paket telah berhasil diterima oleh yang bersangkutan.',
                    'status' => 'delivered',
                ],
            ];

            if (!$shipment) {
                $shipment = Shipment::create([
                    'order_id' => $order->id,
                    'courier_company' => strtolower($order->shipping_courier ?: 'jne'),
                    'courier_service' => strtolower($order->shipping_service ?: 'reg'),
                    'cost' => $order->shipping_cost ?: 15000,
                    'status' => Shipment::STATUS_DELIVERED,
                    'waybill_id' => 'PJM-MOCK-' . strtoupper(substr(uniqid(), -8)),
                    'destination_contact_name' => $order->shipping_recipient_name ?: $order->customer->name,
                    'destination_contact_phone' => $order->shipping_recipient_phone ?: ($order->customer->phone ?: '081234567890'),
                    'destination_address' => $order->shipping_address ?: ($order->customer->address ?: 'Alamat Penerima'),
                    'tracking_history' => $mockHistory,
                    'delivered_at' => now(),
                    'shipped_at' => now()->subHours(4),
                    'picked_at' => now()->subHours(5),
                ]);
            } else {
                $shipment->update([
                    'status' => Shipment::STATUS_DELIVERED,
                    'waybill_id' => $shipment->waybill_id ?: 'PJM-MOCK-' . strtoupper(substr(uniqid(), -8)),
                    'tracking_history' => $mockHistory,
                    'delivered_at' => now(),
                    'shipped_at' => now()->subHours(4),
                    'picked_at' => now()->subHours(5),
                ]);
            }

            $order->update([
                'status' => Order::STATUS_COMPLETED,
            ]);

            // Create notification for customer
            \App\Models\CustomerNotification::create([
                'customer_id' => $order->customer_id,
                'title' => 'Pesanan Selesai',
                'message' => "Pesanan {$order->order_number} telah tiba di tujuan dan selesai.",
                'type' => 'order',
                'link' => '?page=profile&tab=orders',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Simulasi pengiriman berhasil diselesaikan.',
                'order' => $order->fresh(['items.productVariant.product', 'payment', 'shipment', 'reviews']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mensimulasikan pengiriman: ' . $e->getMessage()], 500);
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

        $orders = Order::with(['items.productVariant.product', 'payment', 'shipment', 'reviews'])
            ->where('customer_id', $customer['id'])
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($orders as $order) {
            $this->syncPaymentStatus($order);
        }

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

        $order = Order::with(['customer', 'items.productVariant.product', 'payment', 'shipment', 'reviews'])
            ->where('customer_id', $customer['id'])
            ->findOrFail($orderId);

        // Sync payment status first in case it was paid
        $this->syncPaymentStatus($order);

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

    /**
     * Get shipping rates from Biteship for checkout.
     */
    public function getRates(Request $request, \App\Services\BiteshipService $biteshipService)
    {
        $validated = $request->validate([
            'postal_code' => 'required|string',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'items'       => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_name' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            $items = [];
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
                    continue;
                }

                // Resolve price for retail customer
                $unitPrice = $this->resolvePrice($variant, 'retail', $item['quantity']);

                // Resolve product weight (default 1000 grams)
                $weight = 1000;
                $product = $variant->product;
                if ($product->attributes && isset($product->attributes['weight'])) {
                    $weight = (int) $product->attributes['weight'];
                } elseif ($product->attributes && isset($product->attributes['berat'])) {
                    $weight = (int) $product->attributes['berat'];
                }

                $items[] = [
                    'name'     => $product->name . ($variant->name ? ' - ' . $variant->name : ''),
                    'value'    => (int) $unitPrice,
                    'weight'   => (int) $weight,
                    'quantity' => (int) $item['quantity'],
                ];
            }

            if (empty($items)) {
                return response()->json(['message' => 'Tidak ada item valid untuk pengiriman.'], 422);
            }

            $destination = [
                'postal_code' => $validated['postal_code'],
                'latitude'    => $validated['latitude'] ?? null,
                'longitude'   => $validated['longitude'] ?? null,
            ];

            // Fetch rates from Biteship Service
            $rates = $biteshipService->getRates(
                $destination,
                $items,
                'jne,jnt,sicepat,anteraja,ide'
            );

            return response()->json(['rates' => $rates]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Public rates error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal mendapatkan ongkos kirim: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Sync payment status from Midtrans for a given order if it is pending.
     */
    private function syncPaymentStatus(Order $order): void
    {
        if ($order->status === Order::STATUS_PENDING && $order->payment && $order->payment->isWaiting()) {
            try {
                $statusData = $this->midtransService->getTransactionStatus($order->order_number);
                $transactionStatus = $statusData['transaction_status'] ?? null;
                $fraudStatus       = $statusData['fraud_status'] ?? null;
                $paymentType       = $statusData['payment_type'] ?? null;

                if ($transactionStatus) {
                    $newStatus = $this->resolveMidtransStatus($transactionStatus, $fraudStatus);
                    
                    if ($newStatus !== $order->payment->status) {
                        DB::transaction(function () use ($order, $newStatus, $paymentType, $fraudStatus, $statusData) {
                            $order->payment->update([
                                'status' => $newStatus,
                                'midtrans_transaction_id' => $statusData['transaction_id'] ?? $order->payment->midtrans_transaction_id,
                                'midtrans_payment_type'   => $paymentType ?? $order->payment->midtrans_payment_type,
                                'midtrans_fraud_status'   => $fraudStatus ?? $order->payment->midtrans_fraud_status,
                            ]);

                            if ($newStatus === Payment::STATUS_PAID) {
                                $order->payment->update(['paid_at' => now(), 'payment_method' => $paymentType ?? $order->payment->payment_method]);
                                $order->update(['status' => Order::STATUS_PROCESSING]);
                            } elseif (in_array($newStatus, [Payment::STATUS_EXPIRED, Payment::STATUS_CANCELLED, Payment::STATUS_FAILED])) {
                                $order->update(['status' => Order::STATUS_FAILED]);
                            }
                        });
                        
                        $order->load(['payment', 'shipment']);
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Could not sync status for order ' . $order->order_number . ': ' . $e->getMessage());
            }
        }
    }

    /**
     * Resolve payment status from Midtrans transaction_status and fraud_status.
     */
    private function resolveMidtransStatus(string $transactionStatus, ?string $fraudStatus): string
    {
        return match (true) {
            $transactionStatus === 'capture' && $fraudStatus === 'accept' => Payment::STATUS_PAID,
            $transactionStatus === 'settlement'                            => Payment::STATUS_PAID,
            $transactionStatus === 'pending'                               => Payment::STATUS_WAITING,
            $transactionStatus === 'deny'                                  => Payment::STATUS_FAILED,
            $transactionStatus === 'expire'                                => Payment::STATUS_EXPIRED,
            $transactionStatus === 'cancel'                                => Payment::STATUS_CANCELLED,
            $transactionStatus === 'refund'                                => Payment::STATUS_REFUNDED,
            default                                                        => Payment::STATUS_PENDING,
        };
    }

    /**
     * Get shipment and tracking status from Biteship for a customer order.
     */
    public function getShipmentTracking(string $orderId, \App\Services\BiteshipService $biteshipService)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $order = Order::with('shipment')
            ->where('customer_id', $customer['id'])
            ->findOrFail($orderId);

        if (!$order->shipment) {
            return response()->json(['message' => 'Belum ada pengiriman untuk order ini.'], 404);
        }

        $shipment = $order->shipment;

        // Sync tracking status from Biteship if we have waybill details
        if ($shipment->waybill_id && $shipment->courier_company) {
            try {
                $trackingData = $biteshipService->getTrackingStatus(
                    $shipment->waybill_id,
                    $shipment->courier_company
                );

                $shipment->update([
                    'tracking_history' => $trackingData['history'] ?? $shipment->tracking_history,
                    'status'           => $trackingData['status'] ?? $shipment->status,
                ]);

                if ($trackingData['status'] === Shipment::STATUS_DELIVERED) {
                    $shipment->update(['delivered_at' => now()]);
                    $order->update(['status' => Order::STATUS_COMPLETED]);
                }

                $shipment = $shipment->fresh();
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Could not sync Biteship tracking for customer: ' . $e->getMessage());
            }
        }

        return response()->json($shipment);
    }

    /**
     * Store a product review for a completed order item.
     */
    public function storeReview(Request $request, string $orderId)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $order = Order::with('items.productVariant')
            ->where('customer_id', $customer['id'])
            ->findOrFail($orderId);

        if ($order->status !== Order::STATUS_COMPLETED) {
            return response()->json(['message' => 'Anda hanya dapat memberikan ulasan untuk pesanan yang sudah selesai.'], 400);
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:1000',
            'photo'      => 'nullable|image|max:2048', // max 2MB
        ], [
            'product_id.required' => 'Produk wajib dipilih.',
            'rating.required'     => 'Penilaian bintang wajib diisi.',
            'rating.integer'      => 'Penilaian bintang harus berupa angka.',
            'rating.min'          => 'Penilaian minimal 1 bintang.',
            'rating.max'          => 'Penilaian maksimal 5 bintang.',
            'photo.image'         => 'File harus berupa gambar.',
            'photo.max'           => 'Ukuran file gambar maksimal 2MB.',
        ]);

        // Verify that the product belongs to this order
        $hasProduct = false;
        foreach ($order->items as $item) {
            if ($item->productVariant && $item->productVariant->product_id == $validated['product_id']) {
                $hasProduct = true;
                break;
            }
        }

        if (!$hasProduct) {
            return response()->json(['message' => 'Produk tidak ditemukan dalam pesanan ini.'], 400);
        }

        // Check if already reviewed
        $existing = \App\Models\ProductReview::where('customer_id', $customer['id'])
            ->where('order_id', $order->id)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Anda sudah memberikan ulasan untuk produk ini pada pesanan ini.'], 400);
        }

        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('reviews', 'public');
        }

        $review = \App\Models\ProductReview::create([
            'customer_id' => $customer['id'],
            'product_id'  => $validated['product_id'],
            'order_id'     => $order->id,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'] ?? null,
            'photo_path'  => $photoPath,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Ulasan berhasil dikirim. Terima kasih!',
            'review'  => $review,
        ], 201);
    }
}

