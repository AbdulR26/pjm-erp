<?php

namespace Qollam\Order\Http\Controllers;

use Illuminate\Routing\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\OrderReturnItem;
use App\Models\OrderStatus;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderReturnController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new OrderReturn(),
            'title' => 'Retur & Refund',
            'url'   => 'admin/order-returns',
        ]);

        $this->scaffolding()->datatableColumnSet('return_number', [
            'title' => 'No. Retur',
            'formatter' => function ($model) {
                return '<strong>' . e($model->return_number) . '</strong><br><span class="text-muted small">Order: #' . e($model->order->order_number ?? '-') . '</span>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('customer_id', [
            'title' => 'Pelanggan',
            'formatter' => function ($model) {
                return '<strong>' . e($model->customer->name ?? '-') . '</strong><br><span class="text-muted small">' . e($model->customer->phone ?? '-') . '</span>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('reason_type', [
            'title' => 'Alasan Retur',
            'formatter' => function ($model) {
                $label = OrderReturn::REASON_LABELS[$model->reason_type] ?? $model->reason_type;
                return '<span class="badge badge-light-info font-weight-bold">' . e($label) . '</span>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('total_refund_amount', [
            'title' => 'Estimasi Refund',
            'formatter' => function ($model) {
                return '<strong>Rp ' . number_format($model->total_refund_amount, 0, ',', '.') . '</strong>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('status', [
            'title' => 'Status Retur',
            'formatter' => function ($model) {
                $status = $model->status;
                $label = OrderReturn::STATUS_LABELS[$status] ?? $status;
                $badge = 'secondary';
                if ($status === 'pending') $badge = 'warning';
                elseif (in_array($status, ['approved', 'shipping_back', 'received_at_warehouse'])) $badge = 'info';
                elseif ($status === 'completed') $badge = 'success';
                elseif (in_array($status, ['rejected', 'cancelled'])) $badge = 'danger';

                return '<span class="badge badge-light-' . $badge . '">' . e($label) . '</span>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('created_at', [
            'title' => 'Tgl Pengajuan',
            'formatter' => function ($model) {
                return $model->created_at ? $model->created_at->format('d M Y H:i') : '-';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('action', [
            'title' => 'Aksi',
            'searchable' => false,
            'orderable' => false,
            'className' => 'text-center',
            'formatter' => function ($model) {
                return '<a href="' . route('admin.order-returns.show', $model->id) . '" class="btn btn-sm btn-primary font-weight-bold"><i data-feather="eye"></i> Tinjau Retur</a>';
            }
        ]);
    }

    public function show($id)
    {
        $return = OrderReturn::with([
            'order.items',
            'order.payment',
            'customer',
            'items.orderItem',
            'items.product',
            'media'
        ])->findOrFail($id);

        $title = 'Detail Retur ' . $return->return_number;

        return view('order-module::returns.show', compact('return', 'title'));
    }

    public function approve(Request $request, $id, MidtransService $midtransService, \App\Services\StockService $stockService)
    {
        $return = OrderReturn::with(['order.payment', 'items'])->findOrFail($id);

        $request->validate([
            'approved_items' => 'required|array',
            'approved_items.*.id' => 'required|exists:order_return_items,id',
            'approved_items.*.approved_qty' => 'required|integer|min:0',
            'deducted_shipping_fee' => 'nullable|numeric|min:0',
            'refund_method' => 'required|string|in:midtrans_api,manual_transfer',
            'manual_transfer_proof' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'admin_notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $totalRefund = 0;

            foreach ($request->approved_items as $itemData) {
                $returnItem = $return->items->firstWhere('id', $itemData['id']);
                if ($returnItem) {
                    $approvedQty = min((int)$itemData['approved_qty'], $returnItem->requested_qty);
                    $refundSubtotal = $approvedQty * $returnItem->unit_price;

                    $returnItem->update([
                        'approved_qty' => $approvedQty,
                        'refund_subtotal' => $refundSubtotal,
                    ]);

                    $totalRefund += $refundSubtotal;
                }
            }

            $deductedFee = (float)($request->deducted_shipping_fee ?? 0);
            $finalRefund = max(0, $totalRefund - $deductedFee);

            $proofPath = $return->manual_transfer_proof;
            if ($request->hasFile('manual_transfer_proof')) {
                $file = $request->file('manual_transfer_proof');
                $stored = $file->store('refund-proofs', 'public');
                $proofPath = '/storage/' . $stored;
            }

            // Execute Midtrans Refund API if selected and valid
            if ($request->refund_method === 'midtrans_api' && $finalRefund > 0) {
                try {
                    $midtransService->refundTransaction(
                        $return->order->order_number,
                        'Retur Pesanan ' . $return->return_number . ': ' . ($request->admin_notes ?: 'Pengembalian Dana Retur'),
                        (int) $finalRefund
                    );
                } catch (\Exception $e) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal memicu Refund Midtrans API: ' . $e->getMessage()
                    ], 422);
                }
            }

            $return->update([
                'status' => OrderReturn::STATUS_COMPLETED,
                'deducted_shipping_fee' => $deductedFee,
                'total_refund_amount' => $finalRefund,
                'refund_method' => $request->refund_method,
                'manual_transfer_proof' => $proofPath,
                'admin_notes' => $request->admin_notes,
                'approved_at' => now(),
                'refunded_at' => now(),
            ]);

            // Restok barang retur ke inventori via StockService
            $stockService->recordReturnRestock($return);

            // Append Order History
            $return->order->histories()->create([
                'status_id' => $return->order->status_id,
                'description' => 'Pengajuan retur (' . $return->return_number . ') disetujui Admin. Total Refund: Rp ' . number_format($finalRefund, 0, ',', '.'),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan retur berhasil disetujui & refund senilai Rp ' . number_format($finalRefund, 0, ',', '.') . ' telah diproses.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $return = OrderReturn::findOrFail($id);

        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $return->update([
            'status' => OrderReturn::STATUS_REJECTED,
            'admin_notes' => $request->admin_notes,
            'rejected_at' => now(),
        ]);

        $return->order->histories()->create([
            'status_id' => $return->order->status_id,
            'description' => 'Pengajuan retur (' . $return->return_number . ') ditolak Admin. Alasan: ' . $request->admin_notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan retur telah ditolak.'
        ]);
    }
}
