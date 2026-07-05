@extends('layouts.app')
@section('title', $title)
@section('content')
    <div class="row">
        <!-- Main Form Section -->
        <div class="col-12">
            <div class="card premium-card">
                <div class="card-header premium-card-header">
                    <div class="d-flex align-items-center">
                        <div class="header-icon-wrapper">
                            <i data-feather="user"></i>
                        </div>
                        <div class="header-text-wrapper ml-1">
                            <h4 class="card-title font-weight-bold text-white mb-0">{{ $title }}</h4>
                            <p class="text-white-50 small mb-0">Kelola informasi profil utama customer</p>
                        </div>
                    </div>
                </div>

                <div class="card-body pt-3">
                    <form action="{{ $customer->exists ? route('customer.edit', $customer->id) : route('customer.create') }}" method="POST" class="form-gd-custom" id="customer-form">
                        @csrf
                        @if($customer->exists)
                            @method('PATCH')
                        @else
                            @method('PUT')
                        @endif

                        <div class="row">
                            <!-- Left Column: Profile -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="info" class="text-primary mr-50"></i> Informasi Kontak
                                </div>
                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_name">Nama Lengkap <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="user"></i>
                                        <input type="text" name="name" id="field_name" value="{{ old('name') ?: $customer->name }}" class="form-control-premium" required placeholder="Masukkan nama lengkap">
                                    </div>
                                    @error('name') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_email">Alamat Email <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="mail"></i>
                                        <input type="email" name="email" id="field_email" value="{{ old('email') ?: $customer->email }}" class="form-control-premium" required placeholder="nama@email.com">
                                    </div>
                                    @error('email') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_phone">Nomor Telepon <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="phone"></i>
                                        <input type="text" name="phone" id="field_phone" value="{{ old('phone') ?: $customer->phone }}" class="form-control-premium" required placeholder="08xxxxxxxxxx">
                                    </div>
                                    @error('phone') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>
                            </div>

                            <!-- Right Column: Address Details -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="map-pin" class="text-primary mr-50"></i> Alamat Default
                                </div>
                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_postal_code">Kode Pos <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="hash"></i>
                                        <input type="text" name="postal_code" id="field_postal_code" value="{{ old('postal_code') ?: $customer->postal_code }}" class="form-control-premium" required placeholder="Kode Pos">
                                    </div>
                                    @error('postal_code') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_address">Alamat Rumah Lengkap <span class="text-danger">*</span></label>
                                    <textarea name="address" id="field_address" class="textarea-premium" rows="5" required placeholder="Jalan, Nomor Rumah, RT/RW, Kecamatan, Kota...">{{ old('address') ?: $customer->address }}</textarea>
                                    @error('address') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-end mt-2 pt-2 border-top border-light-2">
                            <a href="{{ url('admin/customers') }}" class="btn btn-cancel-premium mr-1">Batal</a>
                            <button type="submit" class="btn btn-save-premium">Simpan Perubahan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Tabs Section (Addresses) -->
        @if($customer->exists)
            <div class="col-12 mt-3">
                <div class="card premium-tabs-card">
                    <div class="card-body p-0">
                        <ul class="nav nav-pills premium-nav-pills" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="addresses-tab" data-toggle="tab" href="#addresses-pane" aria-controls="addresses-pane" role="tab" aria-selected="true">
                                    <i data-feather="map" class="mr-50"></i> Daftar Alamat Pengiriman ({{ $customer->addresses->count() }})
                                </a>
                            </li>
                        </ul>
                        <div class="tab-content p-3 pt-2">
                            <div class="tab-pane active" id="addresses-pane" role="tabpanel" aria-labelledby="addresses-tab">
                                @include('customer-module::partials.tab-addresses')
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endif
    </div>
@endsection

@push('css')
    <style>
        /* Premium Card Design */
        .premium-card {
            border-radius: 16px !important;
            border: none !important;
            box-shadow: 0 10px 30px rgba(115, 103, 240, 0.05) !important;
            overflow: hidden !important;
            background: #fff !important;
            margin-bottom: 24px !important;
        }
        .premium-card-header {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.78)) !important;
            padding: 20px 24px !important;
            border-bottom: none !important;
        }
        .header-icon-wrapper {
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
            width: 42px;
            height: 42px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        
        /* Section Headers inside form */
        .form-section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #4b4b4b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            border-bottom: 2px solid #f3f2f7;
            padding-bottom: 8px;
        }

        /* Form Premium Inputs */
        .form-group-premium {
            margin-bottom: 20px !important;
        }
        .form-label-premium {
            font-size: 0.85rem;
            font-weight: 600;
            color: #5e5873;
            margin-bottom: 6px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .input-wrapper-premium {
            position: relative;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
        }
        .input-icon {
            position: absolute;
            left: 15px;
            color: #b9b9c3;
            width: 17px;
            height: 17px;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        .form-control-premium {
            width: 100%;
            height: 46px;
            padding: 10px 16px 10px 45px;
            font-size: 0.95rem;
            color: #6e6b7b;
            background-color: #fff;
            border: 1.5px solid #d8d6de;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .form-control-premium:focus {
            border-color: #7367f0 !important;
            box-shadow: 0 4px 15px rgba(115, 103, 240, 0.15) !important;
            outline: none;
        }
        .form-control-premium:focus + .input-icon,
        .input-wrapper-premium:focus-within .input-icon {
            color: #7367f0;
        }
        
        .textarea-premium {
            width: 100%;
            padding: 12px 16px;
            font-size: 0.95rem;
            color: #6e6b7b;
            background-color: #fff;
            border: 1.5px solid #d8d6de;
            border-radius: 8px;
            transition: all 0.3s ease;
            resize: vertical;
        }
        .textarea-premium:focus {
            border-color: #7367f0 !important;
            box-shadow: 0 4px 15px rgba(115, 103, 240, 0.15) !important;
            outline: none;
        }

        /* Error Messages */
        .error-msg {
            color: #ea5455;
            font-size: 0.8rem;
            font-weight: 500;
        }

        /* Premium Buttons */
        .btn-save-premium {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.85)) !important;
            color: #fff !important;
            font-weight: 600;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(115, 103, 240, 0.2);
            transition: all 0.2s ease;
        }
        .btn-save-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(115, 103, 240, 0.3);
        }
        .btn-save-premium:active {
            transform: translateY(0);
        }
        .btn-cancel-premium {
            background-color: #f3f2f7 !important;
            color: #6e6b7b !important;
            font-weight: 600;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            transition: all 0.2s ease;
        }
        .btn-cancel-premium:hover {
            background-color: #e4e2eb !important;
            color: #5e5873 !important;
        }

        /* Tab System Styling */
        .premium-tabs-card {
            border-radius: 16px !important;
            border: none !important;
            box-shadow: 0 10px 30px rgba(115, 103, 240, 0.05) !important;
            background: #fff !important;
            overflow: hidden;
        }
        .premium-nav-pills {
            border-bottom: 2px solid #f3f2f7;
            padding: 12px 16px 0;
            background: #fafafc;
        }
        .premium-nav-pills .nav-link {
            border-radius: 8px 8px 0 0 !important;
            color: #6e6b7b !important;
            font-weight: 600 !important;
            padding: 12px 20px !important;
            border: none !important;
            background: transparent !important;
            position: relative;
            transition: all 0.2s ease;
        }
        .premium-nav-pills .nav-link.active {
            color: #7367f0 !important;
            background: transparent !important;
        }
        .premium-nav-pills .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 3px;
            background: #7367f0;
            border-radius: 3px 3px 0 0;
        }
    </style>
@endpush
