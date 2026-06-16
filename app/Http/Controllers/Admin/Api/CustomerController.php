<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource (accessible by Admin & Staff).
     */
    public function index()
    {
        $customers = Customer::with('addresses')->orderBy('name', 'asc')->get();

        foreach ($customers as $customer) {
            $primaryAddress = $customer->addresses->where('is_primary', true)->first();
            if ($primaryAddress) {
                $customer->province = $primaryAddress->province;
                $customer->city = $primaryAddress->city;
                $customer->district = $primaryAddress->district;
                $customer->village = $primaryAddress->village;
                $customer->address_detail = $primaryAddress->address;
            } else {
                $customer->province = '';
                $customer->city = '';
                $customer->district = '';
                $customer->village = '';
                $customer->address_detail = $customer->address;
            }
        }

        return response()->json([
            'status' => 'success',
            'customers' => $customers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:customers'],
            'phone' => ['nullable', 'string', 'max:20'],
            'province' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'village' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $fullAddress = null;
        if (!empty($validated['address'])) {
            $fullAddress = $validated['address'];
            if (!empty($validated['province'])) {
                $fullAddress .= ', Kel. ' . ($validated['village'] ?? '') . ', Kec. ' . ($validated['district'] ?? '') . ', ' . ($validated['city'] ?? '') . ', ' . $validated['province'];
            }
        }

        $customer = Customer::create(array_merge($validated, ['address' => $fullAddress]));

        if (!empty($validated['address'])) {
            CustomerAddress::create([
                'customer_id' => $customer->id,
                'name'        => $customer->name,
                'phone'       => $customer->phone ?: '081234567890',
                'province'    => $validated['province'] ?: '',
                'city'        => $validated['city'] ?: '',
                'district'    => $validated['district'] ?: '',
                'village'     => $validated['village'] ?: '',
                'address'     => $validated['address'],
                'postal_code' => $validated['postal_code'] ?: '10110',
                'latitude'    => $validated['latitude'] ?? null,
                'longitude'   => $validated['longitude'] ?? null,
                'is_primary'  => true,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Customer berhasil ditambahkan.',
            'customer' => $customer
        ], 210); // 210 custom response status code, works as 200/201
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('customers')->ignore($customer->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'province' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'village' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $fullAddress = null;
        if (!empty($validated['address'])) {
            $fullAddress = $validated['address'];
            if (!empty($validated['province'])) {
                $fullAddress .= ', Kel. ' . ($validated['village'] ?? '') . ', Kec. ' . ($validated['district'] ?? '') . ', ' . ($validated['city'] ?? '') . ', ' . $validated['province'];
            }
        }

        $customer->update(array_merge($validated, ['address' => $fullAddress]));

        if (!empty($validated['address'])) {
            $addr = CustomerAddress::where('customer_id', $customer->id)->where('is_primary', true)->first();
            if ($addr) {
                $addr->update([
                    'province'    => $validated['province'] ?: '',
                    'city'        => $validated['city'] ?: '',
                    'district'    => $validated['district'] ?: '',
                    'village'     => $validated['village'] ?: '',
                    'address'     => $validated['address'],
                    'postal_code' => $validated['postal_code'] ?: $addr->postal_code,
                    'latitude'    => $validated['latitude'] ?? $addr->latitude,
                    'longitude'   => $validated['longitude'] ?? $addr->longitude,
                ]);
            } else {
                CustomerAddress::create([
                    'customer_id' => $customer->id,
                    'name'        => $customer->name,
                    'phone'       => $customer->phone ?: '081234567890',
                    'province'    => $validated['province'] ?: '',
                    'city'        => $validated['city'] ?: '',
                    'district'    => $validated['district'] ?: '',
                    'village'     => $validated['village'] ?: '',
                    'address'     => $validated['address'],
                    'postal_code' => $validated['postal_code'] ?: '10110',
                    'latitude'    => $validated['latitude'] ?? null,
                    'longitude'   => $validated['longitude'] ?? null,
                    'is_primary'  => true,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data customer berhasil diperbarui.',
            'customer' => $customer
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Customer berhasil dihapus.'
        ]);
    }
}
