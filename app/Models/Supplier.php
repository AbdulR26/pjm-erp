<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Scaffolding\Traits\ScaffoldingModel;

class Supplier extends Model
{
    use HasFactory;
    use ScaffoldingModel {
        initializeScaffoldingModel as parentInitialize;
    }

    protected $fillable = [
        'name',
        'code',
        'company_name',
        'phone',
        'email',
        'address',
    ];

    public function initializeScaffoldingModel()
    {
        $this->parentInitialize();
        
        // Define any field customizations for Scaffolding CRUD if needed
        $this->fieldSet('code', [
            'label' => 'Kode Supplier',
            'required' => true,
        ]);
        
        $this->fieldSet('name', [
            'label' => 'Nama Kontak',
            'required' => true,
        ]);

        $this->fieldSet('company_name', [
            'label' => 'Nama Perusahaan',
        ]);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
