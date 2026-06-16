<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\WebhookLog;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(protected MidtransService $midtransService) {}

    /**
     * Create a new payment record and generate Midtrans Snap token.
     */
    public function store(Request $request, string $orderId)
    {
        $order = Order::with(['customer', 'items.productVariant.product', 'payment'])->findOrFail($orderId);

        // Don't allow re-creating a paid payment
        if ($order->payment && $order->payment->isPaid()) {
            return response()->json(['message' => 'Order ini sudah memiliki pembayaran yang lunas.'], 422);
        }

        $request->validate([
            'payment_method' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Delete old unpaid payment if exists
            if ($order->payment && !$order->payment->isPaid()) {
                $order->payment->delete();
            }

            // Create Payment record
            $payment = Payment::create([
                'order_id'        => $order->id,
                'payment_method'  => $request->payment_method,
                'status'          => Payment::STATUS_PENDING,
                'amount'          => $order->grand_total,
                'expired_at'      => now()->addHours(24),
            ]);

            // Get Snap token from Midtrans (attach payment to order temporarily for service)
            $order->setRelation('payment', $payment);
            $snapResult = $this->midtransService->createSnapToken($order);

            // Update payment with Snap token
            $payment->update([
                'snap_token'  => $snapResult['token'],
                'payment_url' => $snapResult['redirect_url'],
                'status'      => Payment::STATUS_WAITING,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Snap token berhasil dibuat.',
                'payment' => $payment->fresh(),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PaymentController@store error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal membuat pembayaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get payment detail and optionally sync status from Midtrans.
     */
    public function show(Request $request, string $orderId)
    {
        $order = Order::with('payment')->findOrFail($orderId);

        if (!$order->payment) {
            return response()->json(['message' => 'Payment belum dibuat untuk order ini.'], 404);
        }

        $payment = $order->payment;

        // Optionally sync status from Midtrans
        if ($request->boolean('sync') && $order->order_number) {
            try {
                $status = $this->midtransService->getTransactionStatus($order->order_number);
                $payment = $this->applyMidtransStatus($payment, $status);
            } catch (\Exception $e) {
                // Don't fail, just return stale data
                Log::warning('Could not sync Midtrans status for order ' . $order->order_number);
            }
        }

        return response()->json($payment);
    }

    /**
     * Cancel a payment.
     */
    public function cancel(string $orderId)
    {
        $order = Order::with('payment')->findOrFail($orderId);

        if (!$order->payment) {
            return response()->json(['message' => 'Tidak ada payment untuk order ini.'], 404);
        }

        $payment = $order->payment;

        if ($payment->isPaid()) {
            return response()->json(['message' => 'Payment yang sudah lunas tidak dapat dibatalkan.'], 422);
        }

        DB::beginTransaction();
        try {
            // Try to cancel on Midtrans
            if ($payment->midtrans_transaction_id) {
                try {
                    $this->midtransService->cancelTransaction($order->order_number);
                } catch (\Exception $e) {
                    Log::warning('Midtrans cancel failed: ' . $e->getMessage());
                }
            }

            $payment->update(['status' => Payment::STATUS_CANCELLED]);
            $order->update(['status' => Order::STATUS_CANCELLED]);

            DB::commit();

            return response()->json(['message' => 'Payment berhasil dibatalkan.', 'payment' => $payment->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membatalkan payment: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle incoming webhook notification from Midtrans.
     * This route is public (no auth middleware).
     */
    public function midtransWebhook(Request $request)
    {
        $payload = $request->all();

        // Log the incoming webhook
        $webhookLog = WebhookLog::create([
            'provider' => 'midtrans',
            'event'    => $payload['transaction_status'] ?? 'unknown',
            'payload'  => $payload,
            'status'   => 'pending',
        ]);

        try {
            // Verify signature
            if (!$this->midtransService->verifySignature($payload)) {
                $webhookLog->update(['status' => 'failed', 'error_message' => 'Invalid signature']);
                return response()->json(['message' => 'Invalid signature'], 403);
            }

            $orderNumber       = $payload['order_id'] ?? null;
            $transactionStatus = $payload['transaction_status'] ?? null;
            $fraudStatus       = $payload['fraud_status'] ?? null;
            $paymentType       = $payload['payment_type'] ?? null;
            $vaNumbers         = $payload['va_numbers'][0]['va_number'] ?? null;

            if (!$orderNumber) {
                $webhookLog->update(['status' => 'failed', 'error_message' => 'Missing order_id']);
                return response()->json(['message' => 'Missing order_id'], 422);
            }

            $order = Order::with('payment')->where('order_number', $orderNumber)->first();

            if (!$order || !$order->payment) {
                $webhookLog->update(['status' => 'failed', 'error_message' => 'Order or payment not found']);
                return response()->json(['message' => 'Order not found'], 404);
            }

            $payment = $order->payment;
            $payment->update([
                'midtrans_transaction_id' => $payload['transaction_id'] ?? $payment->midtrans_transaction_id,
                'midtrans_payment_type'   => $paymentType,
                'midtrans_va_number'      => $vaNumbers,
                'midtrans_fraud_status'   => $fraudStatus,
                'midtrans_raw_response'   => $payload,
            ]);

            // Determine payment status from Midtrans
            $newStatus = $this->resolveMidtransStatus($transactionStatus, $fraudStatus);
            $payment->update(['status' => $newStatus]);

            // Update order status based on payment outcome
            if ($newStatus === Payment::STATUS_PAID) {
                $payment->update(['paid_at' => now(), 'payment_method' => $paymentType]);
                $order->update(['status' => Order::STATUS_PROCESSING]);

                // Notify customer of payment success
                \App\Models\CustomerNotification::create([
                    'customer_id' => $order->customer_id,
                    'title' => 'Pembayaran Berhasil',
                    'message' => "Pembayaran untuk pesanan {$order->order_number} telah kami terima. Pesanan sedang diproses.",
                    'type' => 'payment',
                    'link' => '?page=profile&tab=orders',
                ]);
            } elseif (in_array($newStatus, [Payment::STATUS_EXPIRED, Payment::STATUS_CANCELLED, Payment::STATUS_FAILED])) {
                $order->update(['status' => Order::STATUS_FAILED]);

                $statusLabel = match($newStatus) {
                    Payment::STATUS_EXPIRED   => 'kedaluwarsa',
                    Payment::STATUS_CANCELLED => 'dibatalkan',
                    default                   => 'gagal',
                };
                \App\Models\CustomerNotification::create([
                    'customer_id' => $order->customer_id,
                    'title' => 'Pembayaran ' . ucfirst($statusLabel),
                    'message' => "Pembayaran untuk pesanan {$order->order_number} {$statusLabel}. Silakan coba lagi.",
                    'type' => 'payment',
                    'link' => '?page=profile&tab=orders',
                ]);
            }

            $webhookLog->update(['status' => 'processed']);

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            Log::error('Midtrans webhook error', ['message' => $e->getMessage(), 'payload' => $payload]);
            $webhookLog->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            return response()->json(['message' => 'Internal error'], 500);
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
     * Apply status from Midtrans response to Payment model.
     */
    private function applyMidtransStatus(Payment $payment, array $statusData): Payment
    {
        $transactionStatus = $statusData['transaction_status'] ?? null;
        $fraudStatus       = $statusData['fraud_status'] ?? null;
        $paymentType       = $statusData['payment_type'] ?? null;

        if ($transactionStatus) {
            $newStatus = $this->resolveMidtransStatus($transactionStatus, $fraudStatus);

            DB::transaction(function () use ($payment, $newStatus, $paymentType, $fraudStatus, $statusData) {
                $payment->update([
                    'status' => $newStatus,
                    'midtrans_transaction_id' => $statusData['transaction_id'] ?? $payment->midtrans_transaction_id,
                    'midtrans_payment_type'   => $paymentType ?? $payment->midtrans_payment_type,
                    'midtrans_fraud_status'   => $fraudStatus ?? $payment->midtrans_fraud_status,
                ]);

                $order = $payment->order;
                if ($order) {
                    if ($newStatus === Payment::STATUS_PAID) {
                        $payment->update(['paid_at' => now(), 'payment_method' => $paymentType ?? $payment->payment_method]);
                        $order->update(['status' => Order::STATUS_PROCESSING]);
                    } elseif (in_array($newStatus, [Payment::STATUS_EXPIRED, Payment::STATUS_CANCELLED, Payment::STATUS_FAILED])) {
                        $order->update(['status' => Order::STATUS_FAILED]);
                    }
                }
            });
        }

        return $payment->fresh();
    }
}
