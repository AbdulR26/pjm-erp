<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Scaffolding\Traits\ScaffoldingTrait;
use App\Models\Supplier;

class SupplierController extends Controller
{
    use ScaffoldingTrait;

    public function __construct()
    {
        $this->setConfig([
            'model' => new Supplier(),
            'title' => 'Supplier',
            'url' => 'admin/suppliers',
            'prefix' => 'admin.suppliers',
        ]);

        $this->scaffolding()->datatableColumnUnset(['created_at', 'updated_at', 'action']);
        
        $this->scaffolding()->datatableColumnSet('code', ['title' => 'Kode Supplier']);
        $this->scaffolding()->datatableColumnSet('company_name', ['title' => 'Nama Perusahaan']);
        $this->scaffolding()->datatableColumnSet('name', ['title' => 'Nama Kontak']);
        $this->scaffolding()->datatableColumnSet('phone', ['title' => 'Telepon']);
        $this->scaffolding()->datatableColumnSet('email', ['title' => 'Email']);

        $this->scaffolding()->datatableColumnSet('action', [
            'title' => 'Actions',
            'searchable' => false,
            'orderable' => false,
            'className' => 'text-center'
        ]);
    }

    /**
     * Show the form for creating a new supplier.
     */
    public function create(\Scaffolding\Requests\ScaffoldingRequest $request)
    {
        if ($request->isMethod('put')) return $this->save($request);
        
        $supplier = new Supplier();
        $title = 'Tambah Supplier Baru';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/suppliers'), 'name' => "Suppliers"],
            ['name' => "Tambah"],
        ];
        
        return view('admin.suppliers.form', get_defined_vars());
    }

    /**
     * Show the form for editing the specified supplier.
     */
    public function edit(\Scaffolding\Requests\ScaffoldingRequest $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        if ($request->isMethod('patch')) return $this->save($request);
        
        $title = 'Edit Supplier: ' . $supplier->company_name;
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['link' => url('admin/suppliers'), 'name' => "Suppliers"],
            ['name' => "Edit"],
        ];
        
        return view('admin.suppliers.form', get_defined_vars());
    }
}
