<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $suppliers = $query->paginate($perPage);

        return response()->json($suppliers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers,code',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil ditambahkan.',
            'supplier' => $supplier,
        ], 211); // Standard 201 Created but let's use 200 or 201. Laravel's default is 201, let's use 201.
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);
        return response()->json($supplier);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:suppliers,code,' . $supplier->id,
            'company_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:1000',
        ]);

        $supplier->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil diperbarui.',
            'supplier' => $supplier,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);

        // Check if supplier has any purchase orders
        if ($supplier->purchaseOrders()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Supplier tidak dapat dihapus karena memiliki transaksi Purchase Order.',
            ], 422);
        }

        $supplier->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil dihapus.',
        ]);
    }
}
