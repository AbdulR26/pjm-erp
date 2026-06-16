<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CustomerAuthController extends Controller
{
    /**
     * Redirect the user to the Google OAuth provider.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    /**
     * Handle the Google OAuth callback.
     */
    public function handleGoogleCallback()
    {
        try {
            $socialUser = Socialite::driver('google')->user();
            return $this->loginOrCreateCustomer('google', $socialUser);
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Login dengan Google gagal. Silakan coba lagi.');
        }
    }

    /**
     * Redirect the user to the Facebook OAuth provider.
     */
    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')->redirect();
    }

    /**
     * Handle the Facebook OAuth callback.
     */
    public function handleFacebookCallback()
    {
        try {
            $socialUser = Socialite::driver('facebook')->user();
            return $this->loginOrCreateCustomer('facebook', $socialUser);
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Login dengan Facebook gagal. Silakan coba lagi.');
        }
    }

    /**
     * Find or create a customer from the social login data, then save to session.
     */
    protected function loginOrCreateCustomer(string $provider, $socialUser)
    {
        // Find by social_id + provider, or by email (to merge accounts)
        $customer = Customer::where('social_provider', $provider)
                            ->where('social_id', $socialUser->getId())
                            ->first();

        if (!$customer && $socialUser->getEmail()) {
            // Try to find by email (user may have registered with the other provider)
            $customer = Customer::where('email', $socialUser->getEmail())->first();
            if ($customer) {
                // Upgrade the existing record with social login info
                $customer->update([
                    'social_provider' => $provider,
                    'social_id'       => $socialUser->getId(),
                    'avatar'          => $socialUser->getAvatar(),
                ]);
            }
        }

        if (!$customer) {
            // First-time user: create new customer record
            $customer = Customer::create([
                'name'            => $socialUser->getName() ?? 'Customer',
                'email'           => $socialUser->getEmail(),
                'social_provider' => $provider,
                'social_id'       => $socialUser->getId(),
                'avatar'          => $socialUser->getAvatar(),
            ]);
        }

        // Save customer data in session
        Session::put('customer', [
            'id'          => $customer->id,
            'name'        => $customer->name,
            'email'       => $customer->email,
            'avatar'      => $customer->avatar ?? $socialUser->getAvatar(),
            'phone'       => $customer->phone,
            'address'     => $customer->address,
            'postal_code' => $customer->postal_code,
            'latitude'    => $customer->latitude,
            'longitude'   => $customer->longitude,
            'provider'    => $provider,
        ]);

        return redirect('/');
    }

    /**
     * Return the currently-logged-in customer data (for React to check session).
     */
    public function me(Request $request)
    {
        $customer = Session::get('customer');

        if (!$customer) {
            return response()->json(null);
        }

        return response()->json($customer);
    }

    /**
     * Log out the customer by clearing the session.
     */
    public function logout(Request $request)
    {
        Session::forget('customer');
        return response()->json(['status' => 'logged_out']);
    }

    /**
     * Handle customer registration.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:customers',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal harus 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        // Save customer data in session
        $sessionData = [
            'id'          => $customer->id,
            'name'        => $customer->name,
            'email'       => $customer->email,
            'avatar'      => null,
            'phone'       => $customer->phone,
            'address'     => $customer->address,
            'postal_code' => $customer->postal_code,
            'latitude'    => $customer->latitude,
            'longitude'   => $customer->longitude,
            'provider'    => 'email',
        ];
        Session::put('customer', $sessionData);

        return response()->json([
            'status' => 'success',
            'customer' => $sessionData
        ]);
    }

    /**
     * Handle customer email login.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer || !$customer->password || !Hash::check($request->password, $customer->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau password salah.'
            ], 401);
        }

        // Save customer data in session
        $sessionData = [
            'id'          => $customer->id,
            'name'        => $customer->name,
            'email'       => $customer->email,
            'avatar'      => $customer->avatar,
            'phone'       => $customer->phone,
            'address'     => $customer->address,
            'postal_code' => $customer->postal_code,
            'latitude'    => $customer->latitude,
            'longitude'   => $customer->longitude,
            'provider'    => 'email',
        ];
        Session::put('customer', $sessionData);

        return response()->json([
            'status' => 'success',
            'customer' => $sessionData
        ]);
    }

    /**
     * Update the currently-logged-in customer profile (name, phone, address).
     */
    public function updateProfile(Request $request)
    {
        $sessionCustomer = Session::get('customer');
        if (!$sessionCustomer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $customer = Customer::findOrFail($sessionCustomer['id']);

        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:255',
            'phone'       => 'required|string|max:20',
            'address'     => 'nullable|string|max:1000',
            'postal_code' => 'nullable|string|max:10',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer->update([
            'name'        => $request->name,
            'phone'       => $request->phone,
            'address'     => $request->address,
            'postal_code' => $request->postal_code,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
        ]);

        // Update session data
        $sessionData = [
            'id'          => $customer->id,
            'name'        => $customer->name,
            'email'       => $customer->email,
            'avatar'      => $customer->avatar,
            'phone'       => $customer->phone,
            'address'     => $customer->address,
            'postal_code' => $customer->postal_code,
            'latitude'    => $customer->latitude,
            'longitude'   => $customer->longitude,
            'provider'    => $sessionCustomer['provider'] ?? 'email',
        ];
        Session::put('customer', $sessionData);

        return response()->json([
            'status' => 'success',
            'customer' => $sessionData
        ]);
    }

    /**
     * Get all addresses for the logged-in customer.
     */
    public function getAddresses(Request $request)
    {
        $sessionCustomer = Session::get('customer');
        if (!$sessionCustomer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $addresses = CustomerAddress::where('customer_id', $sessionCustomer['id'])
            ->orderBy('is_primary', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($addresses);
    }

    /**
     * Store a new address for the logged-in customer.
     */
    public function storeAddress(Request $request)
    {
        $sessionCustomer = Session::get('customer');
        if (!$sessionCustomer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'required|string|max:30',
            'province'    => 'required|string|max:255',
            'city'        => 'required|string|max:255',
            'district'    => 'required|string|max:255',
            'village'     => 'required|string|max:255',
            'address'     => 'required|string|max:1000',
            'postal_code' => 'required|string|max:10',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'is_primary'  => 'nullable|boolean',
        ]);

        $customerId = $sessionCustomer['id'];

        // If this is the first address, it must be primary
        $addressCount = CustomerAddress::where('customer_id', $customerId)->count();
        if ($addressCount === 0) {
            $validated['is_primary'] = true;
        } elseif (!empty($validated['is_primary']) && $validated['is_primary']) {
            // Unset other primary addresses
            CustomerAddress::where('customer_id', $customerId)->update(['is_primary' => false]);
        }

        $address = CustomerAddress::create(array_merge($validated, ['customer_id' => $customerId]));

        // Sync to customer table if it's primary (for backwards compatibility/fallbacks)
        if ($address->is_primary) {
            $customer = Customer::find($customerId);
            $fullAddressStr = $address->address . ', Kel. ' . $address->village . ', Kec. ' . $address->district . ', ' . $address->city . ', ' . $address->province;
            $customer->update([
                'address'     => $fullAddressStr,
                'postal_code' => $address->postal_code,
                'latitude'    => $address->latitude,
                'longitude'   => $address->longitude,
            ]);
            // Sync session
            $sessionCustomer['address'] = $fullAddressStr;
            $sessionCustomer['postal_code'] = $address->postal_code;
            $sessionCustomer['latitude'] = $address->latitude;
            $sessionCustomer['longitude'] = $address->longitude;
            Session::put('customer', $sessionCustomer);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Alamat berhasil ditambahkan.',
            'address' => $address
        ], 201);
    }

    /**
     * Update an address for the logged-in customer.
     */
    public function updateAddress(Request $request, $id)
    {
        $sessionCustomer = Session::get('customer');
        if (!$sessionCustomer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $customerId = $sessionCustomer['id'];
        $address = CustomerAddress::where('customer_id', $customerId)->findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'phone'       => 'required|string|max:30',
            'province'    => 'required|string|max:255',
            'city'        => 'required|string|max:255',
            'district'    => 'required|string|max:255',
            'village'     => 'required|string|max:255',
            'address'     => 'required|string|max:1000',
            'postal_code' => 'required|string|max:10',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'is_primary'  => 'nullable|boolean',
        ]);

        if (!empty($validated['is_primary']) && $validated['is_primary']) {
            // Unset other primary addresses
            CustomerAddress::where('customer_id', $customerId)->update(['is_primary' => false]);
        }

        $address->update($validated);

        if (!empty($validated['is_primary']) && $validated['is_primary']) {
            CustomerAddress::where('id', $address->id)->update(['is_primary' => true]);
            $address->is_primary = true;
        }

        // Sync to customer table if it's primary
        if ($address->is_primary) {
            $customer = Customer::find($customerId);
            $fullAddressStr = $address->address . ', Kel. ' . $address->village . ', Kec. ' . $address->district . ', ' . $address->city . ', ' . $address->province;
            $customer->update([
                'address'     => $fullAddressStr,
                'postal_code' => $address->postal_code,
                'latitude'    => $address->latitude,
                'longitude'   => $address->longitude,
            ]);
            // Sync session
            $sessionCustomer['address'] = $fullAddressStr;
            $sessionCustomer['postal_code'] = $address->postal_code;
            $sessionCustomer['latitude'] = $address->latitude;
            $sessionCustomer['longitude'] = $address->longitude;
            Session::put('customer', $sessionCustomer);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Alamat berhasil diperbarui.',
            'address' => $address
        ]);
    }

    /**
     * Delete an address for the logged-in customer.
     */
    public function destroyAddress(Request $request, $id)
    {
        $sessionCustomer = Session::get('customer');
        if (!$sessionCustomer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $customerId = $sessionCustomer['id'];
        $address = CustomerAddress::where('customer_id', $customerId)->findOrFail($id);

        $wasPrimary = $address->is_primary;
        $address->delete();

        if ($wasPrimary) {
            // Set another address as primary if any exists
            $nextAddress = CustomerAddress::where('customer_id', $customerId)->first();
            if ($nextAddress) {
                $nextAddress->update(['is_primary' => true]);
                $customer = Customer::find($customerId);
                $fullAddressStr = $nextAddress->address . ', Kel. ' . $nextAddress->village . ', Kec. ' . $nextAddress->district . ', ' . $nextAddress->city . ', ' . $nextAddress->province;
                $customer->update([
                    'address'     => $fullAddressStr,
                    'postal_code' => $nextAddress->postal_code,
                    'latitude'    => $nextAddress->latitude,
                    'longitude'   => $nextAddress->longitude,
                ]);
                $sessionCustomer['address'] = $fullAddressStr;
                $sessionCustomer['postal_code'] = $nextAddress->postal_code;
                $sessionCustomer['latitude'] = $nextAddress->latitude;
                $sessionCustomer['longitude'] = $nextAddress->longitude;
            } else {
                $customer = Customer::find($customerId);
                $customer->update([
                    'address'     => null,
                    'postal_code' => null,
                    'latitude'    => null,
                    'longitude'   => null,
                ]);
                $sessionCustomer['address'] = null;
                $sessionCustomer['postal_code'] = null;
                $sessionCustomer['latitude'] = null;
                $sessionCustomer['longitude'] = null;
            }
            Session::put('customer', $sessionCustomer);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Alamat berhasil dihapus.'
        ]);
    }

    /**
     * Set an address as primary.
     */
    public function setPrimaryAddress(Request $request, $id)
    {
        $sessionCustomer = Session::get('customer');
        if (!$sessionCustomer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $customerId = $sessionCustomer['id'];
        $address = CustomerAddress::where('customer_id', $customerId)->findOrFail($id);

        CustomerAddress::where('customer_id', $customerId)->update(['is_primary' => false]);
        $address->update(['is_primary' => true]);

        // Sync to customer table
        $customer = Customer::find($customerId);
        $fullAddressStr = $address->address . ', Kel. ' . $address->village . ', Kec. ' . $address->district . ', ' . $address->city . ', ' . $address->province;
        $customer->update([
            'address'     => $fullAddressStr,
            'postal_code' => $address->postal_code,
            'latitude'    => $address->latitude,
            'longitude'   => $address->longitude,
        ]);

        // Sync session
        $sessionCustomer['address'] = $fullAddressStr;
        $sessionCustomer['postal_code'] = $address->postal_code;
        $sessionCustomer['latitude'] = $address->latitude;
        $sessionCustomer['longitude'] = $address->longitude;
        Session::put('customer', $sessionCustomer);

        return response()->json([
            'status'  => 'success',
            'message' => 'Alamat utama berhasil diubah.',
            'address' => $address
        ]);
    }
}
