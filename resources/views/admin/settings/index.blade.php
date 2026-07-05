@extends('layouts.app')
@section('title', 'Pengaturan Aplikasi')

@section('content')
<div class="row">
    <!-- Header -->
    <div class="col-12 mb-2">
        <div class="card bg-primary text-white mb-0" style="background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7)) !important; border-radius: 8px;">
            <div class="card-header d-flex align-items-center py-2">
                <div class="d-flex align-items-center">
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">
                        <i data-feather="settings" style="width: 24px; height: 24px; color: white;"></i>
                    </div>
                    <div class="ml-1">
                        <h4 class="card-title font-weight-bold text-white mb-0">Pengaturan Sistem</h4>
                        <p class="text-white-50 small mb-0">Kelola preferensi toko, tampilan, sosial media, banner promo, Midtrans, dan ekspedisi Biteship.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content Form -->
    <div class="col-12">
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show mt-1" role="alert">
                <div class="alert-body">
                    <i data-feather="check-circle" class="mr-50"></i>
                    <strong>Sukses!</strong> {{ session('success') }}
                </div>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        @endif

        @if($errors->any())
            <div class="alert alert-danger alert-dismissible fade show mt-1" role="alert">
                <div class="alert-body">
                    <i data-feather="alert-triangle" class="mr-50"></i>
                    <strong>Ada kesalahan pengisian data:</strong>
                    <ul class="mb-0 mt-25 pl-15">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        @endif

        <!-- Tabs Navigation -->
        <div class="card mt-2">
            <div class="card-header p-0">
                <ul class="nav nav-tabs card-header-tabs ml-0 mr-0" id="settingsTabs" role="tablist" style="border-bottom: 1px solid #ebe9f1; width: 100%;">
                    <li class="nav-item">
                        <a class="nav-link active font-weight-bold px-2 py-1" id="general-tab" data-toggle="tab" href="#general" role="tab" aria-controls="general" aria-selected="true">
                            <i data-feather="monitor" class="mr-25"></i> Toko & Tampilan
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold px-2 py-1" id="social-tab" data-toggle="tab" href="#social" role="tab" aria-controls="social" aria-selected="false">
                            <i data-feather="share-2" class="mr-25"></i> Sosial Media
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold px-2 py-1" id="banner-tab" data-toggle="tab" href="#banner" role="tab" aria-controls="banner" aria-selected="false">
                            <i data-feather="image" class="mr-25"></i> Banner Promo & Flash Sale
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold px-2 py-1" id="slider-tab" data-toggle="tab" href="#slider" role="tab" aria-controls="slider" aria-selected="false">
                            <i data-feather="layers" class="mr-25"></i> Banner Slider Utama
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold px-2 py-1" id="midtrans-tab" data-toggle="tab" href="#midtrans" role="tab" aria-controls="midtrans" aria-selected="false">
                            <i data-feather="credit-card" class="mr-25"></i> Midtrans Payment
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold px-2 py-1" id="biteship-tab" data-toggle="tab" href="#biteship" role="tab" aria-controls="biteship" aria-selected="false">
                            <i data-feather="truck" class="mr-25"></i> Biteship Logistic
                        </a>
                    </li>
                </ul>
            </div>

            <div class="card-body pt-2">
                <div class="tab-content" id="settingsTabsContent">
                    
                    <!-- TAB 1: General & Appearance -->
                    <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="general-tab">
                        <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <div class="row">
                                <div class="col-md-6">
                                    <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="info" class="mr-50"></i>Identitas Toko & Aplikasi</h5>
                                    
                                    <div class="form-group">
                                        <label for="store_name" class="font-weight-bold">Nama Toko</label>
                                        <input type="text" id="store_name" name="store_name" class="form-control" value="{{ old('store_name', $settings['store_name'] ?? 'Putri Jaya Mobil') }}" required>
                                    </div>

                                    <div class="form-group">
                                        <label for="app_name" class="font-weight-bold">Nama Aplikasi Admin</label>
                                        <input type="text" id="app_name" name="app_name" class="form-control" value="{{ old('app_name', $settings['app_name'] ?? 'Putri Jaya Mobil') }}" required>
                                    </div>

                                    <div class="form-group">
                                        <label for="app_short_name" class="font-weight-bold">Singkatan Nama Aplikasi</label>
                                        <input type="text" id="app_short_name" name="app_short_name" class="form-control" value="{{ old('app_short_name', $settings['app_short_name'] ?? 'PJM') }}" required>
                                    </div>

                                    <div class="form-group">
                                        <label for="store_email" class="font-weight-bold">Email Toko</label>
                                        <input type="email" id="store_email" name="store_email" class="form-control" value="{{ old('store_email', $settings['store_email'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="store_phone" class="font-weight-bold">No. Telepon Toko</label>
                                        <input type="text" id="store_phone" name="store_phone" class="form-control" value="{{ old('store_phone', $settings['store_phone'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="store_whatsapp" class="font-weight-bold">No. WhatsApp Toko (Format: 628xxx)</label>
                                        <input type="text" id="store_whatsapp" name="store_whatsapp" class="form-control" value="{{ old('store_whatsapp', $settings['store_whatsapp'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="store_address" class="font-weight-bold">Alamat Toko</label>
                                        <textarea id="store_address" name="store_address" class="form-control" rows="3">{{ old('store_address', $settings['store_address'] ?? '') }}</textarea>
                                    </div>

                                    <div class="form-group">
                                        <label for="store_city" class="font-weight-bold">Kota / Lokasi Toko (Untuk Tampilan Produk)</label>
                                        <input type="text" id="store_city" name="store_city" class="form-control" value="{{ old('store_city', $settings['store_city'] ?? 'Kota Bekasi') }}">
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="palette" class="mr-50"></i>Tema Warna Panel Admin</h5>
                                    
                                    <div class="row">
                                        <div class="col-md-6 form-group">
                                            <label for="primary_color" class="font-weight-bold">Warna Utama (Primary)</label>
                                            <div class="input-group">
                                                <input type="color" class="form-control p-25" style="height: 38px; max-width: 50px;" value="{{ old('primary_color', $settings['primary_color'] ?? '#7367f0') }}" oninput="document.getElementById('primary_color_text').value = this.value">
                                                <input type="text" id="primary_color_text" name="primary_color" class="form-control" value="{{ old('primary_color', $settings['primary_color'] ?? '#7367f0') }}" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6 form-group">
                                            <label for="secondary_color" class="font-weight-bold">Warna Sekunder</label>
                                            <div class="input-group">
                                                <input type="color" class="form-control p-25" style="height: 38px; max-width: 50px;" value="{{ old('secondary_color', $settings['secondary_color'] ?? '#82868b') }}" oninput="document.getElementById('secondary_color_text').value = this.value">
                                                <input type="text" id="secondary_color_text" name="secondary_color" class="form-control" value="{{ old('secondary_color', $settings['secondary_color'] ?? '#82868b') }}" required>
                                            </div>
                                        </div>
                                    </div>

                                    <h5 class="mt-2 mb-1 font-weight-bold text-primary"><i data-feather="image" class="mr-50"></i>Logo & Favicon</h5>

                                    <div class="form-group">
                                        <label for="logo" class="font-weight-bold">Logo Aplikasi</label>
                                        <div class="custom-file mb-1">
                                            <input type="file" class="custom-file-input" id="logo" name="logo">
                                            <label class="custom-file-label" for="logo">Pilih File Logo</label>
                                        </div>
                                        @if(!empty($settings['logo']))
                                            <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                                                <img src="{{ \App\Helpers\StorageHelper::url($settings['logo']) }}" alt="App Logo" style="max-height: 50px;">
                                                <p class="small text-muted mb-0 mt-25">Logo aktif saat ini</p>
                                            </div>
                                        @endif
                                    </div>

                                    <div class="form-group mt-2">
                                        <label for="logo_favicon" class="font-weight-bold">Favicon Aplikasi</label>
                                        <div class="custom-file mb-1">
                                            <input type="file" class="custom-file-input" id="logo_favicon" name="logo_favicon">
                                            <label class="custom-file-label" for="logo_favicon">Pilih File Favicon</label>
                                        </div>
                                        @if(!empty($settings['logo_favicon']))
                                            <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                                                <img src="{{ \App\Helpers\StorageHelper::url($settings['logo_favicon']) }}" alt="App Favicon" style="max-height: 32px;">
                                                <p class="small text-muted mb-0 mt-25">Favicon aktif saat ini</p>
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mt-2 pt-1 border-top">
                                <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Perubahan Toko</button>
                            </div>
                        </form>
                    </div>

                    <!-- TAB 2: Social Media -->
                    <div class="tab-pane fade" id="social" role="tabpanel" aria-labelledby="social-tab">
                        <form action="{{ route('admin.settings.update') }}" method="POST">
                            @csrf
                            <input type="hidden" name="app_name" value="{{ $settings['app_name'] ?? '' }}">
                            <input type="hidden" name="app_short_name" value="{{ $settings['app_short_name'] ?? '' }}">
                            <input type="hidden" name="primary_color" value="{{ $settings['primary_color'] ?? '' }}">
                            <input type="hidden" name="secondary_color" value="{{ $settings['secondary_color'] ?? '' }}">
                            <input type="hidden" name="store_name" value="{{ $settings['store_name'] ?? '' }}">

                            <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="share-2" class="mr-50"></i>Pranala Sosial Media</h5>
                            <p class="text-muted small">Tautkan akun sosial media toko Anda untuk ditampilkan di halaman depan web.</p>
                            
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label for="social_instagram" class="font-weight-bold">Instagram URL</label>
                                    <input type="url" id="social_instagram" name="social_instagram" class="form-control" value="{{ old('social_instagram', $settings['social_instagram'] ?? '') }}" placeholder="https://instagram.com/username">
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="social_facebook" class="font-weight-bold">Facebook URL</label>
                                    <input type="url" id="social_facebook" name="social_facebook" class="form-control" value="{{ old('social_facebook', $settings['social_facebook'] ?? '') }}" placeholder="https://facebook.com/page">
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="social_tiktok" class="font-weight-bold">Tiktok URL</label>
                                    <input type="url" id="social_tiktok" name="social_tiktok" class="form-control" value="{{ old('social_tiktok', $settings['social_tiktok'] ?? '') }}" placeholder="https://tiktok.com/@username">
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mt-2 pt-1 border-top">
                                <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Sosial Media</button>
                            </div>
                        </form>
                    </div>

                    <!-- TAB 3: Banner Promo & Flash Sale -->
                    <div class="tab-pane fade" id="banner" role="tabpanel" aria-labelledby="banner-tab">
                        <form action="{{ route('admin.settings.update') }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            <input type="hidden" name="app_name" value="{{ $settings['app_name'] ?? '' }}">
                            <input type="hidden" name="app_short_name" value="{{ $settings['app_short_name'] ?? '' }}">
                            <input type="hidden" name="primary_color" value="{{ $settings['primary_color'] ?? '' }}">
                            <input type="hidden" name="secondary_color" value="{{ $settings['secondary_color'] ?? '' }}">
                            <input type="hidden" name="store_name" value="{{ $settings['store_name'] ?? '' }}">

                            <div class="row">
                                <!-- Banner Promo 1 -->
                                <div class="col-md-6 border-right">
                                    <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="sidebar" class="mr-50"></i>Banner Samping 1</h5>
                                    
                                    <div class="form-group">
                                        <label for="side_banner_1_badge" class="font-weight-bold">Badge Text</label>
                                        <input type="text" id="side_banner_1_badge" name="side_banner_1_badge" class="form-control" value="{{ old('side_banner_1_badge', $settings['side_banner_1_badge'] ?? '') }}" placeholder="Contoh: KONSULTASI GRATIS">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_1_title" class="font-weight-bold">Judul Banner</label>
                                        <input type="text" id="side_banner_1_title" name="side_banner_1_title" class="form-control" value="{{ old('side_banner_1_title', $settings['side_banner_1_title'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_1_subtitle" class="font-weight-bold">Subjudul Banner</label>
                                        <input type="text" id="side_banner_1_subtitle" name="side_banner_1_subtitle" class="form-control" value="{{ old('side_banner_1_subtitle', $settings['side_banner_1_subtitle'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_1_link" class="font-weight-bold">Link URL Banner</label>
                                        <input type="text" id="side_banner_1_link" name="side_banner_1_link" class="form-control" value="{{ old('side_banner_1_link', $settings['side_banner_1_link'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_1_image" class="font-weight-bold">Gambar Banner 1</label>
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input" id="side_banner_1_image" name="side_banner_1_image">
                                            <label class="custom-file-label" for="side_banner_1_image">Ganti Gambar Banner</label>
                                        </div>
                                        @if(!empty($settings['side_banner_1_image']))
                                            <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                                                <img src="{{ \App\Helpers\StorageHelper::url($settings['side_banner_1_image']) }}" alt="Banner 1" style="max-height: 80px; max-width: 150px; object-fit: cover;">
                                                <p class="small text-muted mb-0 mt-25">Gambar aktif</p>
                                            </div>
                                        @endif
                                    </div>
                                </div>

                                <!-- Banner Promo 2 -->
                                <div class="col-md-6">
                                    <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="sidebar" class="mr-50"></i>Banner Samping 2</h5>
                                    
                                    <div class="form-group">
                                        <label for="side_banner_2_badge" class="font-weight-bold">Badge Text</label>
                                        <input type="text" id="side_banner_2_badge" name="side_banner_2_badge" class="form-control" value="{{ old('side_banner_2_badge', $settings['side_banner_2_badge'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_2_title" class="font-weight-bold">Judul Banner</label>
                                        <input type="text" id="side_banner_2_title" name="side_banner_2_title" class="form-control" value="{{ old('side_banner_2_title', $settings['side_banner_2_title'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_2_subtitle" class="font-weight-bold">Subjudul Banner</label>
                                        <input type="text" id="side_banner_2_subtitle" name="side_banner_2_subtitle" class="form-control" value="{{ old('side_banner_2_subtitle', $settings['side_banner_2_subtitle'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_2_link" class="font-weight-bold">Link URL Banner</label>
                                        <input type="text" id="side_banner_2_link" name="side_banner_2_link" class="form-control" value="{{ old('side_banner_2_link', $settings['side_banner_2_link'] ?? '') }}">
                                    </div>

                                    <div class="form-group">
                                        <label for="side_banner_2_image" class="font-weight-bold">Gambar Banner 2</label>
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input" id="side_banner_2_image" name="side_banner_2_image">
                                            <label class="custom-file-label" for="side_banner_2_image">Ganti Gambar Banner</label>
                                        </div>
                                        @if(!empty($settings['side_banner_2_image']))
                                            <div class="mt-1 p-50 border rounded d-inline-block bg-light">
                                                <img src="{{ \App\Helpers\StorageHelper::url($settings['side_banner_2_image']) }}" alt="Banner 2" style="max-height: 80px; max-width: 150px; object-fit: cover;">
                                                <p class="small text-muted mb-0 mt-25">Gambar aktif</p>
                                            </div>
                                        @endif
                                    </div>
                                </div>

                                <!-- Flash Sale Schedule -->
                                <div class="col-12 mt-3 pt-2 border-top">
                                    <h5 class="mb-1 font-weight-bold text-danger"><i data-feather="clock" class="mr-50"></i>Penjadwalan Flash Sale</h5>
                                    
                                    <div class="row">
                                        <div class="col-md-6 form-group">
                                            <label for="flash_sale_end_time" class="font-weight-bold">Waktu Berakhir Flash Sale (Format: YYYY-MM-DD HH:MM)</label>
                                            <input type="text" id="flash_sale_end_time" name="flash_sale_end_time" class="form-control" value="{{ old('flash_sale_end_time', $settings['flash_sale_end_time'] ?? '') }}" placeholder="Contoh: 2026-06-15 08:54">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mt-2 pt-1 border-top">
                                <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Banner & Promo</button>
                            </div>
                        </form>
                    </div>

                    <!-- TAB 4: Banner Slider Utama (CRUD Banners Table) -->
                    <div class="tab-pane fade" id="slider" role="tabpanel" aria-labelledby="slider-tab">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <h5 class="font-weight-bold text-primary mb-0"><i data-feather="layers" class="mr-50"></i>Kelola Banner Slider Utama</h5>
                                <p class="text-muted small mb-0">Slider besar utama/carousel di halaman depan toko.</p>
                            </div>
                            <button type="button" class="btn btn-primary btn-sm font-weight-bold" data-toggle="modal" data-target="#addBannerModal">
                                <i data-feather="plus" class="mr-25"></i> Tambah Banner Baru
                            </button>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover border">
                                <thead class="thead-light">
                                    <tr>
                                        <th style="width: 70px;">Urutan</th>
                                        <th style="width: 120px;">Gambar</th>
                                        <th>Badge & Judul</th>
                                        <th>Tombol & Link</th>
                                        <th style="width: 100px;">Status</th>
                                        <th style="width: 150px;" class="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($banners as $banner)
                                        <tr>
                                            <td class="font-weight-bold text-center">{{ $banner->order }}</td>
                                            <td>
                                                <img src="{{ \App\Helpers\StorageHelper::url($banner->image) }}" alt="image" style="width: 100px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                                            </td>
                                            <td>
                                                @if($banner->badge)
                                                    <span class="badge badge-light-primary mb-25">{{ $banner->badge }}</span><br>
                                                @endif
                                                <span class="font-weight-bold">{{ $banner->title }}</span><br>
                                                <small class="text-muted">{{ $banner->subtitle }}</small>
                                            </td>
                                            <td>
                                                <span class="badge badge-light-secondary mb-25"><i data-feather="play-circle" style="width: 12px; height: 12px;"></i> {{ $banner->button_text }}</span><br>
                                                <small class="text-muted">{{ $banner->link ?: '-' }}</small>
                                            </td>
                                            <td>
                                                @if($banner->is_active)
                                                    <span class="badge badge-pill badge-light-success font-weight-bold">Aktif</span>
                                                @else
                                                    <span class="badge badge-pill badge-light-danger font-weight-bold">Nonaktif</span>
                                                @endif
                                            </td>
                                            <td class="text-center">
                                                <button type="button" class="btn btn-sm btn-outline-warning btn-edit-banner py-25 px-50" 
                                                        data-id="{{ $banner->id }}"
                                                        data-title="{{ $banner->title }}"
                                                        data-subtitle="{{ $banner->subtitle }}"
                                                        data-badge="{{ $banner->badge }}"
                                                        data-button_text="{{ $banner->button_text }}"
                                                        data-link="{{ $banner->link }}"
                                                        data-order="{{ $banner->order }}"
                                                        data-is_active="{{ $banner->is_active ? 1 : 0 }}"
                                                        data-image="{{ \App\Helpers\StorageHelper::url($banner->image) }}">
                                                    <i data-feather="edit-2"></i> Edit
                                                </button>
                                                
                                                <form action="{{ route('admin.settings.banners.delete', $banner->id) }}" method="POST" class="d-inline delete-banner-form ml-50">
                                                    @csrf
                                                    <button type="submit" class="btn btn-sm btn-outline-danger btn-delete-banner py-25 px-50">
                                                        <i data-feather="trash-2"></i> Hapus
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="6" class="text-center text-muted py-3">Belum ada banner slider yang terdaftar.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- TAB 5: Midtrans Payment Integration -->
                    <div class="tab-pane fade" id="midtrans" role="tabpanel" aria-labelledby="midtrans-tab">
                        <form action="{{ route('admin.settings.update') }}" method="POST">
                            @csrf
                            <input type="hidden" name="app_name" value="{{ $settings['app_name'] ?? '' }}">
                            <input type="hidden" name="app_short_name" value="{{ $settings['app_short_name'] ?? '' }}">
                            <input type="hidden" name="primary_color" value="{{ $settings['primary_color'] ?? '' }}">
                            <input type="hidden" name="secondary_color" value="{{ $settings['secondary_color'] ?? '' }}">
                            <input type="hidden" name="store_name" value="{{ $settings['store_name'] ?? '' }}">

                            <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="shield" class="mr-50"></i>Integrasi Midtrans Snap</h5>
                            <p class="text-muted small">Konfigurasi akun payment gateway Midtrans Anda untuk pembayaran instan Snap Popup.</p>
                            
                            <div class="row">
                                <div class="col-md-6 form-group">
                                    <label for="midtrans_merchant_id" class="font-weight-bold">Merchant ID</label>
                                    <input type="text" id="midtrans_merchant_id" name="midtrans_merchant_id" class="form-control" value="{{ old('midtrans_merchant_id', $settings['midtrans_merchant_id'] ?? '') }}" placeholder="Gxxxxxxxxx">
                                </div>

                                <div class="col-md-6 form-group">
                                    <label class="d-block font-weight-bold mb-50">Environment Mode</label>
                                    <div class="custom-control custom-switch custom-control-inline mt-25">
                                        <input type="checkbox" class="custom-control-input" id="midtrans_is_production" name="midtrans_is_production" {{ (old('midtrans_is_production', $settings['midtrans_is_production'] ?? '0') == '1') ? 'checked' : '' }}>
                                        <label class="custom-control-label" for="midtrans_is_production">Aktifkan Mode Produksi (Lunas Asli)</label>
                                    </div>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="midtrans_client_key" class="font-weight-bold">Client Key</label>
                                    <input type="text" id="midtrans_client_key" name="midtrans_client_key" class="form-control" value="{{ old('midtrans_client_key', $settings['midtrans_client_key'] ?? '') }}" placeholder="SB-Mid-client-xxxxxxx">
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="midtrans_server_key" class="font-weight-bold">Server Key</label>
                                    <input type="password" id="midtrans_server_key" name="midtrans_server_key" class="form-control" value="{{ old('midtrans_server_key', $settings['midtrans_server_key'] ?? '') }}" placeholder="SB-Mid-server-xxxxxxx">
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mt-2 pt-1 border-top">
                                <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Midtrans</button>
                            </div>
                        </form>
                    </div>

                    <!-- TAB 6: Biteship Logistic Integration -->
                    <div class="tab-pane fade" id="biteship" role="tabpanel" aria-labelledby="biteship-tab">
                        <form action="{{ route('admin.settings.update') }}" method="POST">
                            @csrf
                            <input type="hidden" name="app_name" value="{{ $settings['app_name'] ?? '' }}">
                            <input type="hidden" name="app_short_name" value="{{ $settings['app_short_name'] ?? '' }}">
                            <input type="hidden" name="primary_color" value="{{ $settings['primary_color'] ?? '' }}">
                            <input type="hidden" name="secondary_color" value="{{ $settings['secondary_color'] ?? '' }}">
                            <input type="hidden" name="store_name" value="{{ $settings['store_name'] ?? '' }}">

                            <h5 class="mb-1 font-weight-bold text-primary"><i data-feather="package" class="mr-50"></i>Koneksi Biteship API</h5>
                            <p class="text-muted small">Konfigurasi akun Biteship Anda untuk penarikan ongkos kirim real-time dan booking kurir otomatis.</p>
                            
                            <div class="row">
                                <div class="col-12 form-group">
                                    <label for="biteship_api_key" class="font-weight-bold">Biteship API Key (Token)</label>
                                    <input type="password" id="biteship_api_key" name="biteship_api_key" class="form-control" value="{{ old('biteship_api_key', $settings['biteship_api_key'] ?? '') }}" placeholder="biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                                </div>

                                <div class="col-12">
                                    <h5 class="mt-1 mb-1 font-weight-bold text-primary"><i data-feather="map-pin" class="mr-50"></i>Detail Lokasi Pengirim (Gudang/Toko Asal)</h5>
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="biteship_origin_postal_code" class="font-weight-bold">Kode Pos Toko Asal</label>
                                    <input type="text" id="biteship_origin_postal_code" name="biteship_origin_postal_code" class="form-control" value="{{ old('biteship_origin_postal_code', $settings['biteship_origin_postal_code'] ?? '') }}" placeholder="14240">
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="biteship_shipper_phone" class="font-weight-bold">No. Telp Pengirim Utama</label>
                                    <input type="text" id="biteship_shipper_phone" name="biteship_shipper_phone" class="form-control" value="{{ old('biteship_shipper_phone', $settings['biteship_shipper_phone'] ?? '') }}" placeholder="08123456789">
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="biteship_origin_latitude" class="font-weight-bold">Latitude Toko Asal</label>
                                    <input type="text" id="biteship_origin_latitude" name="biteship_origin_latitude" class="form-control" value="{{ old('biteship_origin_latitude', $settings['biteship_origin_latitude'] ?? '') }}" placeholder="-6.1234567">
                                </div>

                                <div class="col-md-6 form-group">
                                    <label for="biteship_origin_longitude" class="font-weight-bold">Longitude Toko Asal</label>
                                    <input type="text" id="biteship_origin_longitude" name="biteship_origin_longitude" class="form-control" value="{{ old('biteship_origin_longitude', $settings['biteship_origin_longitude'] ?? '') }}" placeholder="106.1234567">
                                </div>

                                <div class="col-12 form-group">
                                    <label for="biteship_shipper_address" class="font-weight-bold">Alamat Fisik Toko Asal</label>
                                    <textarea id="biteship_shipper_address" name="biteship_shipper_address" class="form-control" rows="3" placeholder="Jl. Raya Putri Jaya Mobil No. 12, Kel. Sunter Agung, Jakarta Utara">{{ old('biteship_shipper_address', $settings['biteship_shipper_address'] ?? '') }}</textarea>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mt-2 pt-1 border-top">
                                <button type="submit" class="btn btn-primary font-weight-bold"><i data-feather="save" class="mr-25"></i> Simpan Biteship</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL TAMBAH BANNER -->
<!-- ============================================== -->
<div class="modal fade" id="addBannerModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title text-white font-weight-bold">Tambah Banner Baru</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form action="{{ route('admin.settings.banners.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <label for="title" class="font-weight-bold">Judul Banner <span class="text-danger">*</span></label>
                        <input type="text" id="title" name="title" class="form-control" placeholder="Contoh: Suku Cadang Asli Toyota" required>
                    </div>
                    <div class="form-group">
                        <label for="subtitle" class="font-weight-bold">Subjudul Banner</label>
                        <input type="text" id="subtitle" name="subtitle" class="form-control" placeholder="Contoh: Diskon Hingga 30% untuk Oli Mesin">
                    </div>
                    <div class="form-group">
                        <label for="badge" class="font-weight-bold">Badge Text</label>
                        <input type="text" id="badge" name="badge" class="form-control" placeholder="Contoh: BEST SELLER">
                    </div>
                    <div class="form-group">
                        <label for="button_text" class="font-weight-bold">Teks Tombol <span class="text-danger">*</span></label>
                        <input type="text" id="button_text" name="button_text" class="form-control" value="Belanja Sekarang" required>
                    </div>
                    <div class="form-group">
                        <label for="link" class="font-weight-bold">Link URL Tujuan</label>
                        <input type="text" id="link" name="link" class="form-control" placeholder="Contoh: /produk-kategori/oli">
                    </div>
                    <div class="form-group">
                        <label for="order" class="font-weight-bold">Urutan Tampil (Order)</label>
                        <input type="number" id="order" name="order" class="form-control" value="0">
                    </div>
                    <div class="form-group">
                        <label for="image" class="font-weight-bold">Gambar Banner <span class="text-danger">*</span></label>
                        <div class="custom-file">
                            <input type="file" class="custom-file-input" id="image" name="image" required>
                            <label class="custom-file-label" for="image">Pilih Gambar</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="custom-control custom-checkbox mt-50">
                            <input type="checkbox" class="custom-control-input" id="is_active" name="is_active" value="1" checked>
                            <label class="custom-control-label font-weight-bold" for="is_active">Aktifkan Banner Ini</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary btn-sm font-weight-bold"><i data-feather="save" class="mr-25"></i> Tambah Banner</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- MODAL EDIT BANNER -->
<!-- ============================================== -->
<div class="modal fade" id="editBannerModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header bg-warning text-white">
                <h5 class="modal-title text-white font-weight-bold">Edit Banner Slider</h5>
                <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <form id="editBannerForm" action="" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="modal-body">
                    <div class="form-group">
                        <label for="edit_title" class="font-weight-bold">Judul Banner <span class="text-danger">*</span></label>
                        <input type="text" id="edit_title" name="title" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_subtitle" class="font-weight-bold">Subjudul Banner</label>
                        <input type="text" id="edit_subtitle" name="subtitle" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_badge" class="font-weight-bold">Badge Text</label>
                        <input type="text" id="edit_badge" name="badge" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_button_text" class="font-weight-bold">Teks Tombol <span class="text-danger">*</span></label>
                        <input type="text" id="edit_button_text" name="button_text" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_link" class="font-weight-bold">Link URL Tujuan</label>
                        <input type="text" id="edit_link" name="link" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_order" class="font-weight-bold">Urutan Tampil (Order)</label>
                        <input type="number" id="edit_order" name="order" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="edit_image" class="font-weight-bold">Gambar Banner (Kosongkan jika tidak diganti)</label>
                        <div class="custom-file mb-1">
                            <input type="file" class="custom-file-input" id="edit_image" name="image">
                            <label class="custom-file-label" for="edit_image">Pilih Gambar Baru</label>
                        </div>
                        <img id="edit_image_preview" src="" alt="preview" style="max-height: 80px; max-width: 150px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; display: none;">
                    </div>
                    <div class="form-group">
                        <div class="custom-control custom-checkbox mt-50">
                            <input type="checkbox" class="custom-control-input" id="edit_is_active" name="is_active" value="1">
                            <label class="custom-control-label font-weight-bold" for="edit_is_active">Aktifkan Banner Ini</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-warning btn-sm font-weight-bold text-white"><i data-feather="save" class="mr-25"></i> Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@push('script_vendor')
<script src="{{asset('template/app-assets/vendors/js/extensions/sweetalert2.all.min.js')}}"></script>
@endpush

@push('script')
<script>
    $(document).ready(function() {
        // Show selected file name on upload inputs
        $(document).on('change', '.custom-file-input', function() {
            var fileName = $(this).val().split('\\').pop();
            $(this).next('.custom-file-label').addClass("selected").html(fileName);
        });

        // Trigger Edit Banner Modal and fill the fields
        $('.btn-edit-banner').on('click', function() {
            var id = $(this).data('id');
            var title = $(this).data('title');
            var subtitle = $(this).data('subtitle');
            var badge = $(this).data('badge');
            var buttonText = $(this).data('button_text');
            var link = $(this).data('link');
            var order = $(this).data('order');
            var isActive = $(this).data('is_active');
            var image = $(this).data('image');

            var form = $('#editBannerForm');
            // Set dynamic action URL
            form.attr('action', '{{ url("/admin/settings/banners") }}/' + id + '/update');
            form.find('#edit_title').val(title);
            form.find('#edit_subtitle').val(subtitle);
            form.find('#edit_badge').val(badge);
            form.find('#edit_button_text').val(buttonText);
            form.find('#edit_link').val(link);
            form.find('#edit_order').val(order);
            
            // Check active status
            if (isActive == 1) {
                form.find('#edit_is_active').prop('checked', true);
            } else {
                form.find('#edit_is_active').prop('checked', false);
            }
            
            // Preview Image
            if (image) {
                form.find('#edit_image_preview').attr('src', image).show();
            } else {
                form.find('#edit_image_preview').hide();
            }

            $('#editBannerModal').modal('show');
        });

        // Confirm Banner Deletion
        $('.delete-banner-form').on('submit', function(e) {
            e.preventDefault();
            var form = this;

            Swal.fire({
                title: 'Hapus Banner?',
                text: "Tindakan ini akan menghapus data banner slider dari database secara permanen.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-outline-secondary ml-1'
                },
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    form.submit();
                }
            });
        });
    });
</script>
@endpush
