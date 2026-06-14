<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VoucherController extends Controller
{
    /**
     * List all vouchers with pagination and search.
     */
    public function index(Request $request)
    {
        $query = Voucher::query();

        // Search by code
        if ($request->filled('search')) {
            $query->where('code', 'like', "%{$request->search}%");
        }

        // Filter by active status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sort
        $query->orderBy('created_at', 'desc');

        $vouchers = $query->paginate($request->get('per_page', 15));

        return response()->json($vouchers);
    }

    /**
     * Store a newly created voucher.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:vouchers,code|max:50',
            'type' => ['required', Rule::in(['fixed', 'percent'])],
            'value' => 'required|numeric|min:0',
            'min_spend' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'quota' => 'required|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'required|boolean',
        ]);

        $voucher = Voucher::create($validated);

        return response()->json([
            'message' => 'Voucher berhasil dibuat.',
            'voucher' => $voucher,
        ], 201);
    }

    /**
     * Display the specified voucher.
     */
    public function show(string $id)
    {
        $voucher = Voucher::findOrFail($id);
        return response()->json($voucher);
    }

    /**
     * Update the specified voucher.
     */
    public function update(Request $request, string $id)
    {
        $voucher = Voucher::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($voucher->id)],
            'type' => ['required', Rule::in(['fixed', 'percent'])],
            'value' => 'required|numeric|min:0',
            'min_spend' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'quota' => 'required|integer|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'required|boolean',
        ]);

        $voucher->update($validated);

        return response()->json([
            'message' => 'Voucher berhasil diperbarui.',
            'voucher' => $voucher,
        ]);
    }

    /**
     * Remove the specified voucher.
     */
    public function destroy(string $id)
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->delete();

        return response()->json([
            'message' => 'Voucher berhasil dihapus.',
        ]);
    }
}
