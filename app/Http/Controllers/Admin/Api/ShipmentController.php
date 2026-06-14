<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\WebhookLog;
use App\Services\BiteshipService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShipmentController extends Controller
{
    public function __construct(protected BiteshipService $biteshipService) {}

    /**
     * Get shipping rates from Biteship for an order.
     */
    public function rates(Request $request, string $orderId)
    {
        $order = Order::with(['items'])->findOrFail($orderId);

        $request->validate([
            'destination_postal_code' => 'required|string',
            'destination_latitude'    => 'nullable|numeric',
            'destination_longitude'   => 'nullable|numeric',
            'couriers'                => 'nullable|string', // comma-separated
        ]);

        try {
            // Build items array from order items
            $items = $order->items->map(fn($item) => [
                'name'     => $item->product_name . ' - ' . $item->variant_name,
                'value'    => (int) $item->unit_price,
                'weight'   => (int) $item->weight,
                'quantity' => $item->quantity,
            ])->toArray();

            $destination = [
                'postal_code' => $request->destination_postal_code,
                'latitude'    => $request->destination_latitude,
                'longitude'   => $request->destination_longitude,
            ];

            $rates = $this->biteshipService->getRates(
                $destination,
                $items,
                $request->get('couriers', 'jne,jnt,sicepat,anteraja,ide')
            );

            return response()->json(['rates' => $rates]);
        } catch (\Exception $e) {
            Log::error('Rates error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal mendapatkan ongkir: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create a shipment and book courier via Biteship.
     */
    public function store(Request $request, string $orderId)
    {
        $order = Order::with(['customer', 'items', 'payment', 'shipment'])->findOrFail($orderId);

        if ($order->payment && !$order->payment->isPaid()) {
            return response()->json(['message' => 'Order harus sudah dibayar sebelum membuat pengiriman.'], 422);
        }

        if ($order->shipment && !in_array($order->shipment->status, [Shipment::STATUS_CANCELLED])) {
            return response()->json(['message' => 'Order ini sudah memiliki pengiriman aktif.'], 422);
        }

        $request->validate([
            'courier_company'           => 'required|string',
            'courier_service'           => 'required|string',
            'courier_service_name'      => 'nullable|string',
            'etd'                       => 'nullable|string',
            'cost'                      => 'required|numeric|min:0',
            'destination_contact_name'  => 'required|string',
            'destination_contact_phone' => 'required|string',
            'destination_address'       => 'required|string',
            'destination_postal_code'   => 'nullable|string',
            'destination_latitude'      => 'nullable|numeric',
            'destination_longitude'     => 'nullable|numeric',
            // Origin can be overridden; defaults to config biteship.origin
            'origin_contact_name'       => 'nullable|string',
            'origin_contact_phone'      => 'nullable|string',
            'origin_address'            => 'nullable|string',
            'origin_postal_code'        => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Create shipment record
            $shipment = Shipment::create([
                'order_id'                  => $order->id,
                'courier_company'           => strtolower($request->courier_company),
                'courier_service'           => strtolower($request->courier_service),
                'courier_service_name'      => $request->courier_service_name,
                'etd'                       => $request->etd,
                'cost'                      => $request->cost,
                'status'                    => Shipment::STATUS_DRAFT,
                'origin_contact_name'       => $request->origin_contact_name ?? config('app.name'),
                'origin_contact_phone'      => $request->origin_contact_phone ?? '081234567890',
                'origin_address'            => $request->origin_address ?? 'Jl. Raya Putri Jaya Mobil No 1',
                'origin_postal_code'        => $request->origin_postal_code ?? config('biteship.origin.postal_code'),
                'destination_contact_name'  => $request->destination_contact_name,
                'destination_contact_phone' => $request->destination_contact_phone,
                'destination_address'       => $request->destination_address,
                'destination_postal_code'   => $request->destination_postal_code,
                'destination_latitude'      => $request->destination_latitude,
                'destination_longitude'     => $request->destination_longitude,
            ]);

            // Update order shipping_cost and grand_total
            $order->update([
                'shipping_cost' => $request->cost,
                'grand_total'   => $order->subtotal - $order->discount + $request->cost,
                'status'        => Order::STATUS_PROCESSING,
            ]);

            // Book courier via Biteship
            $shipperDetails = [
                'shipper_name'          => $shipment->origin_contact_name,
                'shipper_phone'         => $shipment->origin_contact_phone,
                'origin_address'        => $shipment->origin_address,
                'origin_postal_code'    => $shipment->origin_postal_code,
                'destination_latitude'  => $shipment->destination_latitude ?? 0,
                'destination_longitude' => $shipment->destination_longitude ?? 0,
                'destination_postal_code' => $shipment->destination_postal_code,
            ];

            // Attach shipment to order for BiteshipService
            $order->setRelation('shipment', $shipment);
            $biteshipResult = $this->biteshipService->createOrder($order, $shipperDetails);

            // Update shipment with Biteship response
            $shipment->update([
                'biteship_order_id' => $biteshipResult['id'] ?? null,
                'waybill_id'        => $biteshipResult['courier']['waybill_id'] ?? null,
                'status'            => $biteshipResult['status'] ?? Shipment::STATUS_PICKUP_REQUESTED,
            ]);

            // Update order to shipping status
            $order->update(['status' => Order::STATUS_SHIPPING]);

            DB::commit();

            return response()->json([
                'message'  => 'Pengiriman berhasil dibuat.',
                'shipment' => $shipment->fresh(),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('ShipmentController@store error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal membuat pengiriman: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get shipment detail + tracking status.
     */
    public function show(Request $request, string $orderId)
    {
        $order = Order::with('shipment')->findOrFail($orderId);

        if (!$order->shipment) {
            return response()->json(['message' => 'Belum ada pengiriman untuk order ini.'], 404);
        }

        $shipment = $order->shipment;

        // Sync tracking status from Biteship if requested
        if ($request->boolean('sync') && $shipment->waybill_id && $shipment->courier_company) {
            try {
                $trackingData = $this->biteshipService->getTrackingStatus(
                    $shipment->waybill_id,
                    $shipment->courier_company
                );

                // Update tracking history
                $shipment->update([
                    'tracking_history' => $trackingData['history'] ?? $shipment->tracking_history,
                    'status'           => $trackingData['status'] ?? $shipment->status,
                ]);

                // Mark delivered
                if ($trackingData['status'] === Shipment::STATUS_DELIVERED) {
                    $shipment->update(['delivered_at' => now()]);
                    $order->update(['status' => Order::STATUS_COMPLETED]);
                }

                $shipment = $shipment->fresh();
            } catch (\Exception $e) {
                Log::warning('Could not sync Biteship tracking: ' . $e->getMessage());
            }
        }

        return response()->json($shipment);
    }

    /**
     * Cancel a shipment.
     */
    public function cancel(Request $request, string $orderId)
    {
        $order = Order::with('shipment')->findOrFail($orderId);

        if (!$order->shipment) {
            return response()->json(['message' => 'Tidak ada pengiriman untuk order ini.'], 404);
        }

        $shipment = $order->shipment;

        if (!$shipment->isCancellable()) {
            return response()->json(['message' => 'Pengiriman dengan status "' . $shipment->status . '" tidak dapat dibatalkan.'], 422);
        }

        $request->validate(['reason' => 'required|string|max:255']);

        DB::beginTransaction();
        try {
            // Cancel in Biteship
            if ($shipment->biteship_order_id) {
                try {
                    $this->biteshipService->cancelShipment($shipment->biteship_order_id, $request->reason);
                } catch (\Exception $e) {
                    Log::warning('Biteship cancel error: ' . $e->getMessage());
                }
            }

            $shipment->update(['status' => Shipment::STATUS_CANCELLED]);
            $order->update(['status' => Order::STATUS_PROCESSING]); // revert to processing

            DB::commit();

            return response()->json(['message' => 'Pengiriman berhasil dibatalkan.', 'shipment' => $shipment->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membatalkan pengiriman: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle incoming webhook notification from Biteship.
     * This route is public (no auth middleware).
     */
    public function biteshipWebhook(Request $request)
    {
        $payload = $request->all();

        $webhookLog = WebhookLog::create([
            'provider' => 'biteship',
            'event'    => $payload['event'] ?? 'unknown',
            'payload'  => $payload,
            'status'   => 'pending',
        ]);

        try {
            $biteshipOrderId = $payload['order_id'] ?? null;
            $newStatus       = $payload['status'] ?? null;
            $waybillId       = $payload['courier']['waybill_id'] ?? null;

            if (!$biteshipOrderId || !$newStatus) {
                $webhookLog->update(['status' => 'failed', 'error_message' => 'Missing order_id or status']);
                return response()->json(['message' => 'Invalid payload'], 422);
            }

            $shipment = Shipment::where('biteship_order_id', $biteshipOrderId)->first();

            if (!$shipment) {
                $webhookLog->update(['status' => 'failed', 'error_message' => 'Shipment not found']);
                return response()->json(['message' => 'Shipment not found'], 404);
            }

            $updateData = ['status' => $newStatus];

            if ($waybillId) {
                $updateData['waybill_id'] = $waybillId;
            }

            // Set timestamps based on status
            if ($newStatus === Shipment::STATUS_PICKED) {
                $updateData['picked_at'] = now();
            } elseif ($newStatus === Shipment::STATUS_IN_TRANSIT) {
                $updateData['shipped_at'] = now();
            } elseif ($newStatus === Shipment::STATUS_DELIVERED) {
                $updateData['delivered_at'] = now();
                // Complete the order
                $shipment->order->update(['status' => Order::STATUS_COMPLETED]);
            }

            $shipment->update($updateData);

            // Also update order status
            $order = $shipment->order;
            if (in_array($newStatus, [Shipment::STATUS_IN_TRANSIT, Shipment::STATUS_PICKING_UP, Shipment::STATUS_PICKED])) {
                $order->update(['status' => Order::STATUS_SHIPPING]);
            }

            $webhookLog->update(['status' => 'processed']);

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            Log::error('Biteship webhook error', ['message' => $e->getMessage()]);
            $webhookLog->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
            return response()->json(['message' => 'Internal error'], 500);
        }
    }
}
