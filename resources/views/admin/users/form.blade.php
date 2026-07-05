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
                            <i data-feather="user-check"></i>
                        </div>
                        <div class="header-text-wrapper ml-1">
                            <h4 class="card-title font-weight-bold text-white mb-0">{{ $title }}</h4>
                            <p class="text-white-50 small mb-0">Kelola identitas, kredensial masuk, dan peran (roles) hak akses administrator/staf</p>
                        </div>
                    </div>
                </div>

                <div class="card-body pt-3">
                    <form action="{{ $user->exists ? route('admin.users.edit', $user->id) : route('admin.users.create') }}" method="POST" class="form-gd-custom" id="user-form">
                        @csrf
                        @if($user->exists)
                            @method('PATCH')
                        @else
                            @method('PUT')
                        @endif

                        <div class="row">
                            <!-- Left Column: Identity & Credentials -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="user" class="text-primary mr-50"></i> Identitas & Akun Masuk
                                </div>
                                
                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_name">Nama Lengkap <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="user"></i>
                                        <input type="text" name="name" id="field_name" value="{{ old('name') ?: $user->name }}" class="form-control-premium" required placeholder="Masukkan nama lengkap user">
                                    </div>
                                    @error('name') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_email">Alamat Email <span class="text-danger">*</span></label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="mail"></i>
                                        <input type="email" name="email" id="field_email" value="{{ old('email') ?: $user->email }}" class="form-control-premium" required placeholder="nama@email.com">
                                    </div>
                                    @error('email') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium" for="field_password">
                                        Password 
                                        @if($user->exists)
                                            <span class="text-muted">(Kosongkan jika tidak ingin diganti)</span>
                                        @else
                                            <span class="text-danger">*</span>
                                        @endif
                                    </label>
                                    <div class="input-wrapper-premium">
                                        <i class="input-icon" data-feather="lock"></i>
                                        <input type="password" name="password" id="field_password" class="form-control-premium" {{ $user->exists ? '' : 'required' }} placeholder="Minimal 6 karakter">
                                    </div>
                                    @error('password') <span class="error-msg d-block mt-25">{{ $message }}</span> @enderror
                                </div>
                            </div>

                            <!-- Right Column: Roles Allocation -->
                            <div class="col-lg-6">
                                <div class="form-section-title">
                                    <i data-feather="shield" class="text-primary mr-50"></i> Alokasi Peran (Roles)
                                </div>

                                <div class="form-group-premium">
                                    <label class="form-label-premium mb-1">Pilih Peran Hak Akses</label>
                                    
                                    <div class="row pl-50">
                                        @forelse($roles as $role)
                                            <div class="col-md-6 mb-1">
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" name="roles[]" class="custom-control-input" id="role-{{ $role->id }}" value="{{ $role->name }}"
                                                        {{ (is_array(old('roles')) && in_array($role->name, old('roles'))) || ($user->exists && $user->hasRole($role->name)) ? 'checked' : '' }}>
                                                    <label class="custom-control-label font-weight-bold" for="role-{{ $role->id }}">
                                                        {{ strtoupper($role->name) }}
                                                    </label>
                                                </div>
                                            </div>
                                        @empty
                                            <p class="text-muted col-12 small">Belum ada pilihan peran (roles) di sistem database.</p>
                                        @endforelse
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-end mt-2 pt-2 border-top border-light-2">
                            <a href="{{ url('admin/users') }}" class="btn btn-cancel-premium mr-1">Batal</a>
                            <button type="submit" class="btn btn-save-premium">Simpan User</button>
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
