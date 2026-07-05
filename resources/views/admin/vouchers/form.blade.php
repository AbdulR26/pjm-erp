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
                            <i data-feather="gift"></i>
                        </div>
                        <div class="header-text-wrapper ml-1">
                            <h4 class="card-title font-weight-bold text-white mb-0">{{ $title }}</h4>
                            <p class="text-white-50 small mb-0">Kelola informasi voucher belanja dan diskon e-commerce</p>
                        </div>
                    </div>
                </div>

                <div class="card-body pt-3">
                    <form action="{{ $voucher->exists ? route('admin.vouchers.edit', $voucher->id) : route('admin.vouchers.create') }}" method="POST" class="form-gd-custom" id="voucher-form">
                        @csrf
                        @if($voucher->exists)
                            @method('PATCH')
                        @else
                            @method('PUT')
                        @endif

                        <div class="row">
                            <!-- Left Column: Voucher Settings -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="tag" class="text-primary mr-50"></i> Parameter Utama
                                </div>
                                
                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_code">Kode Voucher <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="key"></i>
                                        <input type="text" name="code" id="field_code" value="{{ old('code') ?: $voucher->code }}" class="form-control-premium text-uppercase" required placeholder="Masukkan kode voucher, misal: FREEONGKIR">
                                    </div>
                                    @error('code') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_type">Tipe Potongan <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="sliders"></i>
                                        <select name="type" id="field_type" class="form-control-premium" required style="padding-top:2px; padding-bottom:2px;">
                                            <option value="fixed" {{ (old('type') ?: $voucher->type) == 'fixed' ? 'selected' : '' }}>Potongan Tetap (Rupiah)</option>
                                            <option value="percent" {{ (old('type') ?: $voucher->type) == 'percent' ? 'selected' : '' }}>Persentase (%)</option>
                                        </select>
                                    </div>
                                    @error('type') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_value">Nilai Potongan <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="dollar-sign"></i>
                                        <input type="number" step="any" name="value" id="field_value" value="{{ old('value') ?: $voucher->value }}" class="form-control-premium" required placeholder="Masukkan nilai potongan (persen atau rupiah)">
                                    </div>
                                    @error('value') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_min_spend">Minimal Belanja (Rupiah) <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="shopping-bag"></i>
                                        <input type="number" step="any" name="min_spend" id="field_min_spend" value="{{ old('min_spend') ?: ($voucher->min_spend ?? 0) }}" class="form-control-premium" required placeholder="0">
                                    </div>
                                    @error('min_spend') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_max_discount">Maksimal Diskon (Kosongkan jika tidak dibatasi)</label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="shield-off"></i>
                                        <input type="number" step="any" name="max_discount" id="field_max_discount" value="{{ old('max_discount') ?: $voucher->max_discount }}" class="form-control-premium" placeholder="Tidak ada batasan diskon maksimal">
                                    </div>
                                    @error('max_discount') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>
                            </div>

                            <!-- Right Column: Quota & Timing -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="calendar" class="text-primary mr-50"></i> Kuota & Periode Aktif
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_quota">Kuota Total Penggunaan <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="users"></i>
                                        <input type="number" name="quota" id="field_quota" value="{{ old('quota') ?: ($voucher->quota ?? 0) }}" class="form-control-premium" required placeholder="0">
                                    </div>
                                    @error('quota') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_used">Voucher Terpakai</label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="check-square"></i>
                                        <input type="number" id="field_used" value="{{ $voucher->used ?? 0 }}" class="form-control-premium" readonly disabled>
                                    </div>
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_start_date">Tanggal & Waktu Mulai</label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="calendar"></i>
                                        <input type="text" name="start_date" id="field_start_date" value="{{ old('start_date') ?: ($voucher->start_date ? $voucher->start_date->format('Y-m-d H:i:s') : '') }}" class="form-control-premium datetime-picker" placeholder="Pilih waktu mulai aktif">
                                    </div>
                                    @error('start_date') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_end_date">Tanggal & Waktu Berakhir</label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="clock"></i>
                                        <input type="text" name="end_date" id="field_end_date" value="{{ old('end_date') ?: ($voucher->end_date ? $voucher->end_date->format('Y-m-d H:i:s') : '') }}" class="form-control-premium datetime-picker" placeholder="Pilih waktu kedaluwarsa">
                                    </div>
                                    @error('end_date') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium mt-3">
                                    <label class="d-block form-label-premium mb-50">Status Keaktifan</label>
                                    <div class="custom-control custom-switch custom-control-inline">
                                        <input type="checkbox" class="custom-control-input" id="field_is_active" name="is_active" value="1" {{ (old('is_active') ?: ($voucher->is_active ?? true)) ? 'checked' : '' }}>
                                        <label class="custom-control-label font-weight-bold" for="field_is_active">Aktifkan Voucher Belanja Ini</label>
                                    </div>
                                    @error('is_active') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-end mt-2 pt-2 border-top border-light-2">
                            <a href="{{ url('admin/vouchers') }}" class="btn btn-cancel-premium mr-1">Batal</a>
                            <button type="submit" class="btn btn-save-premium">Simpan Perubahan</button>
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

@push('css_vendor')
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/pickers/flatpickr/flatpickr.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/plugins/forms/pickers/form-flat-pickr.css') }}">
@endpush

@push('script_vendor')
    <script src="{{ asset('template/app-assets/vendors/js/pickers/flatpickr/flatpickr.min.js') }}"></script>
@endpush

@push('script')
    <script>
        $(document).ready(function() {
            // Initialize flatpickr on start_date and end_date
            if ($('.datetime-picker').length) {
                $('.datetime-picker').flatpickr({
                    enableTime: true,
                    dateFormat: "Y-m-d H:i:S",
                    time_24hr: true
                });
            }
        });
    </script>
@endpush
