<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Product;

class StockMutation extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'user_id', 'type', 'quantity', 'reference_type', 'reference_id', 'notes'];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
