<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\CustomerOtp;
use App\Mail\AccountActivationMail;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CustomerAuthController extends Controller
{
    protected function generateAndSendOtp(Customer $customer)
    {
        $now = now();
        $otpRecord = CustomerOtp::where('customer_id', $customer->id)->first();

        if ($otpRecord) {
            if ($otpRecord->resend_blocked_until && $now->lt($otpRecord->resend_blocked_until)) {
                $diffSecs = $now->diffInSeconds($otpRecord->resend_blocked_until);
                $diffMins = ceil($diffSecs / 60);
                return [
                    'success' => false,
                    'message' => "Batas pengiriman ulang OTP tercapai (3x). Silakan tunggu {$diffMins} menit lagi untuk meminta OTP baru."
                ];
            }

            if ($otpRecord->resend_blocked_until && $now->gte($otpRecord->resend_blocked_until)) {
                $otpRecord->resend_blocked_until = null;
                $otpRecord->resend_count = 0;
            }

            $newResendCount = $otpRecord->resend_count + 1;

            if ($newResendCount > 3) {
                $otpRecord->update([
                    'resend_blocked_until' => $now->copy()->addHour(),
                ]);
                return [
                    'success' => false,
                    'message' => 'Batas pengiriman ulang OTP tercapai (3 kali dalam 1 jam). Layanan terblokir sementara selama 1 jam.'
                ];
            }

            $otpCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $otpRecord->update([
                'otp_code'     => $otpCode,
                'expires_at'   => $now->copy()->addMinutes(10),
                'resend_count' => $newResendCount,
            ]);
        } else {
            $otpCode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $otpRecord = CustomerOtp::create([
                'customer_id'  => $customer->id,
                'email'        => $customer->email,
                'otp_code'     => $otpCode,
                'expires_at'   => $now->copy()->addMinutes(10),
                'resend_count' => 1,
            ]);
        }

        try {
            Mail::to($customer->email)->send(new AccountActivationMail($customer, $otpCode));
        } catch (\Exception $e) {
            Log::error("Gagal mengirim email OTP aktivasi ke {$customer->email}: " . $e->getMessage());
        }

        return [
            'success' => true,
            'message' => 'Kode OTP aktivasi akun telah dikirimkan ke email ' . $customer->email . '.'
        ];
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $socialUser = Socialite::driver('google')->user();
            return $this->loginOrCreateCustomer('google', $socialUser);
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Login dengan Google gagal. Silakan coba lagi.');
        }
    }

    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')->redirect();
    }

    public function handleFacebookCallback()
    {
        try {
            $socialUser = Socialite::driver('facebook')->user();
            return $this->loginOrCreateCustomer('facebook', $socialUser);
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Login dengan Facebook gagal. Silakan coba lagi.');
        }
    }

    protected function loginOrCreateCustomer(string $provider, $socialUser)
    {
        $customer = Customer::where('social_provider', $provider)
                            ->where('social_id', $socialUser->getId())
                            ->first();

        if (!$customer && $socialUser->getEmail()) {
            $customer = Customer::where('email', $socialUser->getEmail())->first();
            if ($customer) {
                $customer->update([
                    'social_provider'   => $provider,
                    'social_id'         => $socialUser->getId(),
                    'avatar'            => $socialUser->getAvatar(),
                    'is_active'         => true,
                    'email_verified_at' => now(),
                ]);
            }
        }

        if (!$customer) {
            $customer = Customer::create([
                'name'              => $socialUser->getName() ?? 'Customer',
                'email'             => $socialUser->getEmail(),
                'social_provider'   => $provider,
                'social_id'         => $socialUser->getId(),
                'avatar'            => $socialUser->getAvatar(),
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);
        }

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

    public function me(Request $request)
    {
        $customer = Session::get('customer');

        if (!$customer) {
            return response()->json(null);
        }

        return response()->json($customer);
    }

    public function logout(Request $request)
    {
        Session::forget('customer');
        return response()->json(['status' => 'logged_out']);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:customers',
            'phone'    => 'required|string|max:20',
            'password' => 'required|string|min:6',
        ], [
            'name.required'     => 'Nama lengkap wajib diisi.',
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Email ini sudah terdaftar.',
            'phone.required'    => 'Nomor WhatsApp wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal harus 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'phone'     => $request->phone,
            'password'  => Hash::make($request->password),
            'is_active' => false,
        ]);

        $otpResult = $this->generateAndSendOtp($customer);

        if (!$otpResult['success']) {
            return response()->json([
                'status'  => 'error',
                'message' => $otpResult['message']
            ], 429);
        }

        return response()->json([
            'status'           => 'unverified',
            'needs_activation' => true,
            'email'            => $customer->email,
            'message'          => 'Pendaftaran berhasil! Kode OTP telah dikirimkan ke email Anda untuk aktivasi akun.'
        ]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
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
                'status'  => 'error',
                'message' => 'Email atau password salah.'
            ], 401);
        }

        if (!$customer->is_active) {
            $otpResult = $this->generateAndSendOtp($customer);

            return response()->json([
                'status'           => 'unverified',
                'needs_activation' => true,
                'email'            => $customer->email,
                'message'          => 'Akun Anda belum diaktivasi. Kode OTP baru telah dikirimkan ke email Anda (' . $customer->email . ').'
            ], 403);
        }

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
            'status'   => 'success',
            'customer' => $sessionData
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'otp_code' => 'required|string|size:6',
        ], [
            'email.required'    => 'Email wajib diisi.',
            'otp_code.required' => 'Kode OTP 6-digit wajib diisi.',
            'otp_code.size'     => 'Kode OTP harus 6 digit angka.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akun pelanggan tidak ditemukan.'
            ], 404);
        }

        if ($customer->is_active) {
            return response()->json([
                'status'  => 'already_verified',
                'message' => 'Akun Anda sudah diaktivasi sebelumnya. Silakan login.'
            ]);
        }

        $otpRecord = CustomerOtp::where('customer_id', $customer->id)->first();

        if (!$otpRecord) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kode OTP belum dibuat. Silakan klik "Kirim Ulang OTP".'
            ], 400);
        }

        $now = now();

        if ($otpRecord->failed_blocked_until && $now->lt($otpRecord->failed_blocked_until)) {
            $diffSecs = $now->diffInSeconds($otpRecord->failed_blocked_until);
            $diffMins = ceil($diffSecs / 60);
            return response()->json([
                'status'  => 'error',
                'message' => "Verifikasi OTP terkunci sementara karena salah 3 kali. Silakan coba lagi setelah {$diffMins} menit."
            ], 429);
        }

        if ($otpRecord->failed_blocked_until && $now->gte($otpRecord->failed_blocked_until)) {
            $otpRecord->update([
                'failed_blocked_until' => null,
                'failed_attempts'       => 0,
            ]);
        }

        if ($otpRecord->otp_code !== $request->otp_code) {
            $newFailedCount = $otpRecord->failed_attempts + 1;

            if ($newFailedCount >= 3) {
                $otpRecord->update([
                    'failed_attempts'       => $newFailedCount,
                    'failed_blocked_until' => $now->copy()->addHour(),
                ]);

                return response()->json([
                    'status'  => 'error',
                    'message' => 'Kode OTP salah 3 kali berturut-turut. Verifikasi akun terkunci sementara selama 1 jam.'
                ], 429);
            } else {
                $otpRecord->update([
                    'failed_attempts' => $newFailedCount,
                ]);

                $rem = 3 - $newFailedCount;
                return response()->json([
                    'status'  => 'error',
                    'message' => "Kode OTP yang Anda masukkan salah. Sisa percobaan: {$rem} kali."
                ], 422);
            }
        }

        if ($now->gt($otpRecord->expires_at)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Kode OTP telah kedaluwarsa (lebih dari 10 menit). Silakan klik "Kirim Ulang OTP".'
            ], 422);
        }

        $customer->update([
            'is_active'         => true,
            'email_verified_at' => $now,
        ]);

        $otpRecord->delete();

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
            'status'   => 'success',
            'message'  => 'Selamat! Akun Anda berhasil diaktivasi.',
            'customer' => $sessionData
        ]);
    }

    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ], [
            'email.required' => 'Email wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'validation_error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::where('email', $request->email)->first();

        if (!$customer) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Akun dengan email tersebut tidak ditemukan.'
            ], 404);
        }

        if ($customer->is_active) {
            return response()->json([
                'status'  => 'already_verified',
                'message' => 'Akun ini sudah aktif. Silakan langsung login.'
            ]);
        }

        $otpResult = $this->generateAndSendOtp($customer);

        if (!$otpResult['success']) {
            return response()->json([
                'status'  => 'error',
                'message' => $otpResult['message']
            ], 429);
        }

        return response()->json([
            'status'  => 'success',
            'message' => $otpResult['message']
        ]);
    }

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
            'name.required'  => 'Nama lengkap wajib diisi.',
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
            'status'   => 'success',
            'customer' => $sessionData
        ]);
    }

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

        $addressCount = CustomerAddress::where('customer_id', $customerId)->count();
        if ($addressCount === 0) {
            $validated['is_primary'] = true;
        } elseif (!empty($validated['is_primary']) && $validated['is_primary']) {
            CustomerAddress::where('customer_id', $customerId)->update(['is_primary' => false]);
        }

        $address = CustomerAddress::create(array_merge($validated, ['customer_id' => $customerId]));

        if ($address->is_primary) {
            $customer = Customer::find($customerId);
            $fullAddressStr = $address->address . ', Kel. ' . $address->village . ', Kec. ' . $address->district . ', ' . $address->city . ', ' . $address->province;
            $customer->update([
                'address'     => $fullAddressStr,
                'postal_code' => $address->postal_code,
                'latitude'    => $address->latitude,
                'longitude'   => $address->longitude,
            ]);
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
            CustomerAddress::where('customer_id', $customerId)->update(['is_primary' => false]);
        }

        $address->update($validated);

        if (!empty($validated['is_primary']) && $validated['is_primary']) {
            CustomerAddress::where('id', $address->id)->update(['is_primary' => true]);
            $address->is_primary = true;
        }

        if ($address->is_primary) {
            $customer = Customer::find($customerId);
            $fullAddressStr = $address->address . ', Kel. ' . $address->village . ', Kec. ' . $address->district . ', ' . $address->city . ', ' . $address->province;
            $customer->update([
                'address'     => $fullAddressStr,
                'postal_code' => $address->postal_code,
                'latitude'    => $address->latitude,
                'longitude'   => $address->longitude,
            ]);
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

        $customer = Customer::find($customerId);
        $fullAddressStr = $address->address . ', Kel. ' . $address->village . ', Kec. ' . $address->district . ', ' . $address->city . ', ' . $address->province;
        $customer->update([
            'address'     => $fullAddressStr,
            'postal_code' => $address->postal_code,
            'latitude'    => $address->latitude,
            'longitude'   => $address->longitude,
        ]);

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
