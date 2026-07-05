<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Qollam\Product\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new PurchaseOrder(),
            'title' => 'Purchase Orders',
            'url' => 'admin/purchase-orders',
            'prefix' => 'admin.purchase-orders',
        ]);

        $this->scaffolding()->datatableColumnUnset(['created_at', 'updated_at', 'action']);

        $this->scaffolding()->datatableColumnSet('po_number', [
            'title' => 'PO Number',
            'formatter' => function ($model) {
                return '<strong>' . e($model->po_number) . '</strong>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('supplier', [
            'title' => 'Supplier',
            'orderable' => false,
            'formatter' => function ($model) {
                return '<strong>' . e($model->supplier->company_name ?? $model->supplier->name ?? '-') . '</strong><br><span class="text-muted small">' . e($model->supplier->name ?? '-') . '</span>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('order_date', [
            'title' => 'Tanggal PO',
            'formatter' => function ($model) {
                return $model->order_date ? $model->order_date->format('d M Y') : '-';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('grand_total', [
            'title' => 'Grand Total',
            'formatter' => function ($model) {
                return '<strong>Rp ' . number_format($model->grand_total, 0, ',', '.') . '</strong>';
            }
        ]);

        $this->scaffolding()->datatableColumnSet('status', [
            'title' => 'Status',
            'formatter' => function ($model) {
                $status = strtolower($model->status);
                $badge = 'secondary';
                if ($status === 'draft') $badge = 'light-secondary';
                elseif ($status === 'ordered') $badge = 'light-info';
                elseif ($status === 'received') $badge = 'light-success';
                elseif ($status === 'cancelled') $badge = 'light-danger';
                
                return '<span class="badge badge-pill badge-' . $badge . ' font-weight-bold">' . strtoupper($status) . '</span>';
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
     * Show the form for creating a new PO.
     */
    public function create(\Scaffolding\Requests\ScaffoldingRequest $request)
    {
        if ($request->isMethod('put')) return $this->save($request);
        
        $po = new PurchaseOrder();
        $title = 'Tambah Purchase Order Baru';
        $suppliers = Supplier::all();
        $products = Product::with('parent')->get();
        
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/purchase-orders'), 'name' => "Purchase Orders"],
            ['name' => "Tambah"],
        ];
        
        return view('admin.purchase_orders.form', get_defined_vars());
    }

    /**
     * Show the form for editing the specified PO.
     */
    public function edit(\Scaffolding\Requests\ScaffoldingRequest $request, $id)
    {
        $po = PurchaseOrder::with(['items.product.parent', 'supplier'])->findOrFail($id);
        if ($request->isMethod('patch')) return $this->save($request, $id);
        
        $title = 'Edit Purchase Order: ' . $po->po_number;
        $suppliers = Supplier::all();
        $products = Product::with('parent')->get();
        
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/purchase-orders'), 'name' => "Purchase Orders"],
            ['name' => "Edit"],
        ];
        
        return view('admin.purchase_orders.form', get_defined_vars());
    }

    /**
     * Save the Purchase Order and its items.
     */
    public function save(Request $request, $id = null)
    {
        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'tax' => 'nullable|numeric|min:0',
            'shipping_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function() use ($request, $id) {
            $po = $id ? PurchaseOrder::findOrFail($id) : new PurchaseOrder();
            
            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['quantity'] * $item['unit_cost'];
            }

            $tax = (float) $request->get('tax', 0);
            $shippingCost = (float) $request->get('shipping_cost', 0);
            $grandTotal = $subtotal + $tax + $shippingCost;

            $po->fill([
                'supplier_id' => $request->supplier_id,
                'order_date' => $request->order_date,
                'expected_delivery_date' => $request->expected_delivery_date,
                'notes' => $request->notes,
                'status' => $request->get('status', $po->status ?: 'draft'),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'grand_total' => $grandTotal,
                'created_by' => Auth::id() ?: 1,
            ]);
            $po->save();

            // Sync items
            $po->items()->delete();
            foreach ($request->items as $item) {
                $po->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $item['quantity'] * $item['unit_cost'],
                ]);
            }
        });

        return redirect()->route('admin.purchase-orders.index')->with('success', 'Purchase Order berhasil disimpan.');
    }
}
