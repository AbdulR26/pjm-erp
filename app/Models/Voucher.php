<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Scaffolding\Traits\ScaffoldingModel;

class Voucher extends Model
{
    use HasFactory;
    use ScaffoldingModel {
        initializeScaffoldingModel as parentInitialize;
    }

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_spend',
        'max_discount',
        'quota',
        'used',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'value' => 'float',
        'min_spend' => 'float',
        'max_discount' => 'float',
        'quota' => 'integer',
        'used' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Customize scaffolding properties after table parsing.
     */
    public function initializeScaffoldingModel()
    {
        $this->parentInitialize();
        
        // Convert "type" text input to select dropdown
        $this->fieldSet('type', [
            'type' => 'select',
            'options' => [
                'fixed' => 'Potongan Tetap (Rp)',
                'percent' => 'Persentase (%)'
            ],
            'required' => true,
        ]);
        
        // Convert "is_active" check
        $this->fieldSet('is_active', [
            'type' => 'checkbox',
            'label' => 'Aktifkan Voucher',
        ]);

        // Configure Flatpickr datetime-pickers
        $this->fieldSet('start_date', [
            'type' => 'text',
            'attributes' => ['class' => 'form-control datetime-picker'],
        ]);

        $this->fieldSet('end_date', [
            'type' => 'text',
            'attributes' => ['class' => 'form-control datetime-picker'],
        ]);

        // Disable direct input edits for "used" count in creation/edit forms
        $this->fieldSet('used', [
            'type' => 'number',
            'attributes' => ['class' => 'form-control', 'readonly' => 'readonly'],
        ]);
    }

    /**
     * Check if the voucher is valid for a given subtotal.
     */
    public function isValidFor(float $subtotal): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->quota > 0 && $this->used >= $this->quota) {
            return false;
        }

        if ($this->start_date && now()->lt($this->start_date)) {
            return false;
        }

        if ($this->end_date && now()->gt($this->end_date)) {
            return false;
        }

        if ($subtotal < $this->min_spend) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount.
     */
    public function calculateDiscount(float $subtotal, float $shippingCost = 0): float
    {
        if ($this->type === 'free_shipping') {
            return (float) min($this->value, $shippingCost);
        }

        if ($this->type === 'percent') {
            $discount = $subtotal * ($this->value / 100);
            if ($this->max_discount && $discount > $this->max_discount) {
                return (float) $this->max_discount;
            }
            return (float) $discount;
        }

        return (float) min($this->value, $subtotal);
    }
}
