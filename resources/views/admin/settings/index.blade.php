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

        @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show mt-1" role="alert">
                <div class="alert-body">
                    <i data-feather="alert-circle" class="mr-50"></i>
                    <strong>Error!</strong> {{ session('error') }}
                </div>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        @endif

        <div class="card mt-1">
            <div class="card-header border-bottom pb-0">
                <ul class="nav nav-tabs card-header-tabs flex-column flex-sm-row" id="settingsTabs" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active font-weight-bold" id="general-tab" data-toggle="tab" href="#general" role="tab" aria-controls="general" aria-selected="true">
                            <i data-feather="store" class="mr-25"></i> Toko & Tampilan
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold" id="social-tab" data-toggle="tab" href="#social" role="tab" aria-controls="social" aria-selected="false">
                            <i data-feather="share-2" class="mr-25"></i> Sosial Media
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold" id="banner-tab" data-toggle="tab" href="#banner" role="tab" aria-controls="banner" aria-selected="false">
                            <i data-feather="sidebar" class="mr-25"></i> Banner Promo & Flash Sale
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold" id="slider-tab" data-toggle="tab" href="#slider" role="tab" aria-controls="slider" aria-selected="false">
                            <i data-feather="layers" class="mr-25"></i> Banner Slider Utama
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold" id="midtrans-tab" data-toggle="tab" href="#midtrans" role="tab" aria-controls="midtrans" aria-selected="false">
                            <i data-feather="shield" class="mr-25"></i> Midtrans Payment
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold" id="biteship-tab" data-toggle="tab" href="#biteship" role="tab" aria-controls="biteship" aria-selected="false">
                            <i data-feather="package" class="mr-25"></i> Biteship Logistic
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link font-weight-bold text-danger" id="backup-tab" data-toggle="tab" href="#backup" role="tab" aria-controls="backup" aria-selected="false">
                            <i data-feather="database" class="mr-25"></i> Backup & Reset Data
                        </a>
                    </li>
                </ul>
            </div>

            <div class="card-body pt-2">
                <div class="tab-content" id="settingsTabsContent">
                    @include('admin.settings.partials.general')
                    @include('admin.settings.partials.social')
                    @include('admin.settings.partials.banner')
                    @include('admin.settings.partials.slider')
                    @include('admin.settings.partials.midtrans')
                    @include('admin.settings.partials.biteship')
                    @include('admin.settings.partials.backup')
                </div>
            </div>
        </div>
    </div>
</div>

@include('admin.settings.partials.banner_modals')
@endsection

@include('admin.settings.partials.scripts')
