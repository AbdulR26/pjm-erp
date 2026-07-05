<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use App\Models\Voucher;

class VoucherController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new Voucher(),
            'title' => 'Voucher',
            'url' => 'admin/vouchers',
            'prefix' => 'admin.vouchers',
        ]);

        $this->scaffolding()->datatableColumnUnset(['created_at', 'updated_at', 'action']);
        
        $this->scaffolding()->datatableColumnSet('code', ['title' => 'Kode Voucher']);
        $this->scaffolding()->datatableColumnSet('type', [
            'title' => 'Tipe Potongan',
            'formatter' => function($model) {
                if ($model->type === 'percent') return 'Persentase (%)';
                if ($model->type === 'fixed') return 'Potongan Tetap (Rp)';
                return $model->type;
            }
        ]);
        $this->scaffolding()->datatableColumnSet('value', [
            'title' => 'Nilai Potongan',
            'formatter' => function($model) {
                if ($model->type === 'percent') {
                    return number_format($model->value, 0) . '%';
                }
                return 'Rp ' . number_format($model->value, 0, ',', '.');
            }
        ]);
        $this->scaffolding()->datatableColumnSet('min_spend', [
            'title' => 'Min. Belanja',
            'formatter' => function($model) {
                return 'Rp ' . number_format($model->min_spend, 0, ',', '.');
            }
        ]);
        $this->scaffolding()->datatableColumnSet('quota', [
            'title' => 'Kuota (Terpakai / Total)',
            'formatter' => function($model) {
                return $model->used . ' / ' . $model->quota;
            }
        ]);
        $this->scaffolding()->datatableColumnSet('is_active', [
            'title' => 'Status',
            'formatter' => function($model) {
                return $model->is_active 
                    ? '<span class="badge badge-pill badge-light-success font-weight-bold">Aktif</span>' 
                    : '<span class="badge badge-pill badge-light-danger font-weight-bold">Nonaktif</span>';
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
     * Show the form for creating a new voucher.
     */
    public function create(\Scaffolding\Requests\ScaffoldingRequest $request)
    {
        if ($request->isMethod('put')) return $this->save($request);
        
        $voucher = new Voucher();
        $title = 'Tambah Voucher Baru';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/vouchers'), 'name' => "Vouchers"],
            ['name' => "Tambah"],
        ];
        
        return view('admin.vouchers.form', get_defined_vars());
    }

    /**
     * Show the form for editing the specified voucher.
     */
    public function edit(\Scaffolding\Requests\ScaffoldingRequest $request, $id)
    {
        $voucher = Voucher::findOrFail($id);
        if ($request->isMethod('patch')) return $this->save($request);
        
        $title = 'Edit Voucher: ' . $voucher->code;
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/vouchers'), 'name' => "Vouchers"],
            ['name' => "Edit"],
        ];
        
        return view('admin.vouchers.form', get_defined_vars());
    }
}
