<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\OrderReturnItem;
use App\Models\OrderReturnMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderReturnCustomerController extends Controller
{
    /**
     * Store a new return request from customer.
     */
    public function store(Request $request, $id)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $order = Order::with(['items', 'customer'])->where('customer_id', $customer['id'])->findOrFail($id);

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'reason_type' => 'required|string|in:missing_item,damaged_item,wrong_item,other',
            'customer_notes' => 'required|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.order_item_id' => 'required|exists:order_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'media' => 'required|array|min:1',
            'media.*' => 'file|mimes:jpeg,png,jpg,webp,mp4,mov,avi,webm|max:20480', // Max 20MB per file
        ], [
            'reason_type.required' => 'Pilih alasan pengajuan retur.',
            'customer_notes.required' => 'Keterangan retur wajib diisi.',
            'items.required' => 'Pilih produk yang akan diretur.',
            'media.required' => 'Wajib melampirkan minimal 1 foto/video bukti.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Check if there is already an active pending/approved return request for this order
        $existingReturn = OrderReturn::where('order_id', $order->id)
            ->whereIn('status', ['pending', 'approved', 'shipping_back', 'received_at_warehouse'])
            ->first();

        if ($existingReturn) {
            $statusLabel = OrderReturn::STATUS_LABELS[$existingReturn->status] ?? $existingReturn->status;
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah memiliki pengajuan retur aktif (' . $existingReturn->return_number . ') dengan status: "' . $statusLabel . '". Pengajuan retur baru hanya dapat dibuat apabila pengajuan sebelumnya telah selesai atau ditolak Admin.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $orderReturn = OrderReturn::create([
                'return_number' => OrderReturn::generateReturnNumber(),
                'order_id' => $order->id,
                'customer_id' => $customer['id'],
                'reason_type' => $request->reason_type,
                'customer_notes' => $request->customer_notes,
                'status' => OrderReturn::STATUS_PENDING,
                'return_shipping_fee_paid_by' => 'customer',
            ]);

            // Save return items
            foreach ($request->items as $itemData) {
                $orderItem = $order->items->firstWhere('id', $itemData['order_item_id']);
                if (!$orderItem) {
                    continue;
                }

                $requestedQty = min((int) $itemData['quantity'], $orderItem->quantity);

                OrderReturnItem::create([
                    'order_return_id' => $orderReturn->id,
                    'order_item_id' => $orderItem->id,
                    'product_id' => $orderItem->product_id,
                    'requested_qty' => $requestedQty,
                    'approved_qty' => $requestedQty, // Default proposal, to be reviewed by admin
                    'unit_price' => $orderItem->unit_price ?: ($orderItem->price ?: 0),
                    'refund_subtotal' => $requestedQty * ($orderItem->unit_price ?: ($orderItem->price ?: 0)),
                ]);
            }

            // Save uploaded proof media (photos and videos)
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $path = $file->store('order-returns', 'public');
                    $mime = $file->getMimeType();
                    $type = str_contains($mime, 'video') ? 'video' : 'image';

                    OrderReturnMedia::create([
                        'order_return_id' => $orderReturn->id,
                        'file_path' => '/storage/' . $path,
                        'file_type' => $type,
                        'file_name' => $file->getClientOriginalName(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan retur berhasil dikirim. Admin akan meninjau bukti foto/video Anda.',
                'return' => $orderReturn->load(['items.product', 'media']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal membuat pengajuan retur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit return shipping courier & waybill ID from customer.
     */
    public function inputWaybill(Request $request, $returnId)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $orderReturn = OrderReturn::where('customer_id', $customer['id'])->findOrFail($returnId);

        $request->validate([
            'return_courier_name' => 'required|string|max:100',
            'return_waybill_id'   => 'required|string|max:100',
        ]);

        if (!in_array($orderReturn->status, ['approved', 'shipping_back'])) {
            return response()->json([
                'message' => 'Resi pengembalian hanya dapat diisi jika pengajuan telah disetujui Admin.'
            ], 422);
        }

        $orderReturn->update([
            'return_courier_name' => $request->return_courier_name,
            'return_waybill_id'   => $request->return_waybill_id,
            'status'              => OrderReturn::STATUS_SHIPPING_BACK,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nomor resi pengembalian berhasil disimpan. Barang dalam proses pengiriman balik ke gudang.',
            'return'  => $orderReturn
        ]);
    }

    /**
     * Show return details for customer.
     */
    public function show($id)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $orderReturn = OrderReturn::with(['order', 'items.product', 'items.orderItem', 'media'])
            ->where('customer_id', $customer['id'])
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('order_id', $id);
            })
            ->latest()
            ->firstOrFail();

        return response()->json([
            'return' => $orderReturn,
            'warehouse_address' => [
                'name' => config('app.name', 'Putri Jaya Mobil Warehouse'),
                'phone' => '081234567890',
                'address' => 'Jl. Raya Putri Jaya Mobil No. 1, Jakarta Pusat',
                'postal_code' => '10430',
                'instructions' => 'Ongkos kirim pengembalian barang dibebankan kepada pembeli. Pastikan barang dikemas rapi dan aman.',
            ]
        ]);
    }

    /**
     * Get order summary, recent orders, and refund balance history for customer profile.
     */
    public function summary()
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $customerId = $customer['id'];

        $orders = Order::with('statusRelation')->where('customer_id', $customerId)->get();

        $pendingCount    = $orders->filter(fn($o) => $o->status_id == 1 || $o->status === 'pending')->count();
        $processingCount = $orders->filter(fn($o) => $o->status_id == 2 || $o->status === 'processing')->count();
        $shippingCount   = $orders->filter(fn($o) => $o->status_id == 3 || $o->status === 'shipping')->count();
        $completedCount  = $orders->filter(fn($o) => $o->status_id == 4 || $o->status === 'completed')->count();
        $totalOrders     = $orders->count();

        $approvedReturns = OrderReturn::with('order')
            ->where('customer_id', $customerId)
            ->where('status', OrderReturn::STATUS_COMPLETED)
            ->orderBy('refunded_at', 'desc')
            ->get();

        $totalRefundBalance = $approvedReturns->sum('total_refund_amount');

        $refundHistory = $approvedReturns->map(function ($ret) {
            return [
                'id'                  => $ret->id,
                'return_number'       => $ret->return_number,
                'order_number'        => $ret->order->order_number ?? '-',
                'reason_type'         => $ret->reason_type,
                'reason_label'        => OrderReturn::REASON_LABELS[$ret->reason_type] ?? $ret->reason_type,
                'refund_amount'       => (float) $ret->total_refund_amount,
                'refund_method'       => $ret->refund_method,
                'refund_method_label' => $ret->refund_method === 'midtrans_api' ? 'Midtrans API' : 'Transfer Manual',
                'manual_transfer_proof' => $ret->manual_transfer_proof,
                'refunded_at'         => $ret->refunded_at ? $ret->refunded_at->format('d M Y H:i') : ($ret->updated_at->format('d M Y H:i')),
            ];
        });

        $recentOrders = Order::with(['items.product', 'payment', 'shipment'])
            ->where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'summary' => [
                'pending_orders'       => $pendingCount,
                'processing_orders'    => $processingCount,
                'shipping_orders'      => $shippingCount,
                'completed_orders'     => $completedCount,
                'total_orders'         => $totalOrders,
                'total_refund_balance' => (float) $totalRefundBalance,
                'total_refund_count'   => $approvedReturns->count(),
            ],
            'refund_history' => $refundHistory,
            'recent_orders'  => $recentOrders,
        ]);
    }
}
