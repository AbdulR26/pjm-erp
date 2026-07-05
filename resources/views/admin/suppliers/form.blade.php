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
                            <i data-feather="truck"></i>
                        </div>
                        <div class="header-text-wrapper ml-1">
                            <h4 class="card-title font-weight-bold text-white mb-0">{{ $title }}</h4>
                            <p class="text-white-50 small mb-0">Kelola informasi mitra pemasok / supplier barang</p>
                        </div>
                    </div>
                </div>

                <div class="card-body pt-3">
                    <form action="{{ $supplier->exists ? route('admin.suppliers.edit', $supplier->id) : route('admin.suppliers.create') }}" method="POST" class="form-gd-custom" id="supplier-form">
                        @csrf
                        @if($supplier->exists)
                            @method('PATCH')
                        @else
                            @method('PUT')
                        @endif

                        <div class="row">
                            <!-- Left Column: Company & Contact Profile -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="briefcase" class="text-primary mr-50"></i> Profil Pemasok
                                </div>
                                
                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_code">Kode Supplier <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="hash"></i>
                                        <input type="text" name="code" id="field_code" value="{{ old('code') ?: $supplier->code }}" class="form-control-premium text-uppercase" required placeholder="Contoh: SUP-001">
                                    </div>
                                    @error('code') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_company_name">Nama Perusahaan <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="briefcase"></i>
                                        <input type="text" name="company_name" id="field_company_name" value="{{ old('company_name') ?: $supplier->company_name }}" class="form-control-premium" required placeholder="Contoh: PT Auto Parts Indonesia">
                                    </div>
                                    @error('company_name') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_name">Nama Kontak Utama <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="user"></i>
                                        <input type="text" name="name" id="field_name" value="{{ old('name') ?: $supplier->name }}" class="form-control-premium" required placeholder="Masukkan nama kontak sales / penanggung jawab">
                                    </div>
                                    @error('name') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>
                            </div>

                            <!-- Right Column: Contact Details & Address -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="mail" class="text-primary mr-50"></i> Informasi Kontak & Alamat
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_phone">Nomor Telepon <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="phone"></i>
                                        <input type="text" name="phone" id="field_phone" value="{{ old('phone') ?: $supplier->phone }}" class="form-control-premium" required placeholder="Contoh: 021-xxxxxxx atau 08xxxxxxxxx">
                                    </div>
                                    @error('phone') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_email">Alamat Email</label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="mail"></i>
                                        <input type="email" name="email" id="field_email" value="{{ old('email') ?: $supplier->email }}" class="form-control-premium" placeholder="supplier@perusahaan.com">
                                    </div>
                                    @error('email') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_address">Alamat Kantor / Gudang</label>
                                    <textarea name="address" id="field_address" class="textarea-premium" rows="4" placeholder="Jalan, Gedung, Ruko, Nomor, RT/RW, Kota...">{{ old('address') ?: $supplier->address }}</textarea>
                                    @error('address') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-end mt-2 pt-2 border-top border-light-2">
                            <a href="{{ url('admin/suppliers') }}" class="btn btn-cancel-premium mr-1">Batal</a>
                            <button type="submit" class="btn btn-save-premium">Simpan Pemasok</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
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
            z-index: 10;
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
            cursor: pointer;
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
            text-decoration: none;
            display: inline-block;
        }
        .btn-cancel-premium:hover {
            background-color: #e4e2eb !important;
            color: #5e5873 !important;
        }
    </style>
@endpush
