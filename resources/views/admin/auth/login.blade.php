<!DOCTYPE html>
<html class="loading" lang="id" data-textdirection="ltr">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login Admin - {{ $appSetting->app_name }}</title>
    
    <link rel="apple-touch-icon" href="{{ \App\Helpers\StorageHelper::url($appSetting->logo) ?: asset('template/app-assets/images/ico/logo2.png') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ \App\Helpers\StorageHelper::url($appSetting->logo_favicon) ?: asset('template/app-assets/images/ico/favicon.ico') }}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Vendor & Bootstrap CSS -->
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/vendors.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/bootstrap.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/bootstrap-extended.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/colors.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/components.css') }}">

    <style>
        body {
            font-family: 'Montserrat', sans-serif;
            background-color: #f8f9fa;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Shopee-style Header */
        .shp-header {
            height: 80px;
            background: #ffffff;
            border-bottom: 1px solid #edf2f7;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            display: flex;
            align-items: center;
        }
        .shp-brand-title {
            font-size: 1.25rem;
            font-weight: 800;
            color: #2d3748;
            margin-bottom: 0;
        }
        .shp-header-divider {
            color: #cbd5e0;
            margin: 0 14px;
            font-size: 1.2rem;
        }
        .shp-header-subtitle {
            font-size: 1.2rem;
            font-weight: 700;
            color: {{ $appSetting->primary_color ?: '#dc2626' }};
            margin-bottom: 0;
        }

        /* Hero Body */
        .shp-body {
            flex: 1;
            background: linear-gradient(135deg, {{ $appSetting->primary_color ?: '#dc2626' }} 0%, {{ $appSetting->secondary_color ?: '#991b1b' }} 100%);
            display: flex;
            align-items: center;
            padding: 40px 0;
            position: relative;
            overflow: hidden;
        }

        /* Shopee Card */
        .shp-card {
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.18);
            border: none;
            overflow: hidden;
        }
        .shp-card-header {
            padding: 24px 28px 12px;
            border-bottom: 2px solid {{ $appSetting->primary_color ?: '#dc2626' }};
        }
        .shp-card-title {
            font-size: 1.3rem;
            font-weight: 800;
            color: #1a202c;
            margin-bottom: 4px;
        }

        .btn-primary-shopee {
            background-color: {{ $appSetting->primary_color ?: '#dc2626' }} !important;
            border-color: {{ $appSetting->primary_color ?: '#dc2626' }} !important;
            color: #fff !important;
            font-weight: 700 !important;
            font-size: 0.95rem !important;
            padding: 12px 20px !important;
            border-radius: 10px !important;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(220,38,38,0.3);
            transition: all 0.2s ease;
        }
        .btn-primary-shopee:hover {
            background-color: {{ $appSetting->secondary_color ?: '#b91c1c' }} !important;
            border-color: {{ $appSetting->secondary_color ?: '#b91c1c' }} !important;
            box-shadow: 0 6px 16px rgba(185,28,28,0.4);
        }

        /* Footer */
        .shp-footer {
            background: #ffffff;
            border-top: 1px solid #edf2f7;
            padding: 20px 0;
            text-align: center;
            font-size: 0.82rem;
            color: #718096;
        }
    </style>
</head>

<body>
    <!-- Shopee Header -->
    <header class="shp-header">
        <div class="container d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                @if($appSetting->logo)
                    <img src="{{ \App\Helpers\StorageHelper::url($appSetting->logo) }}" alt="logo" style="max-height: 38px;" class="mr-2">
                @endif
                <h1 class="shp-brand-title">{{ $appSetting->app_name }}</h1>
                <span class="shp-header-divider">|</span>
                <h2 class="shp-header-subtitle">ERP Admin Panel</h2>
            </div>
            <div>
                <a href="{{ url('/') }}" class="btn btn-sm btn-outline-secondary font-weight-bold" style="border-radius: 8px;">
                    <i data-feather="arrow-left" class="mr-50"></i> Ke Toko Utama
                </a>
            </div>
        </div>
    </header>

    <!-- Shopee Main Body -->
    <main class="shp-body">
        <div class="container">
            <div class="row align-items-center justify-content-between">
                <!-- Left Hero Illustration -->
                <div class="col-lg-7 text-white d-none d-lg-block pr-lg-5">
                    <div class="mb-2">
                        <span class="badge badge-pill badge-light font-weight-bold px-1 py-50 text-uppercase" style="letter-spacing: 1px; color: {{ $appSetting->primary_color ?: '#ff5722' }};">
                            🔒 Admin Authentication
                        </span>
                    </div>
                    <h1 class="text-white font-weight-bolder display-4 mb-1" style="line-height: 1.2;">
                        Sistem Manajemen Dashboard ERP {{ $appSetting->app_short_name ?: $appSetting->app_name }}
                    </h1>
                    <p class="text-white-50 font-medium" style="font-size: 1.1rem; max-width: 540px;">
                        Kelola data inventori, transaksi pesanan, keuangan, retur barang, dan manajemen pelanggan secara terpusat & real-time.
                    </p>
                </div>

                <!-- Right Shopee Login Box -->
                <div class="col-lg-5 col-md-8 col-12 mx-auto">
                    <div class="card shp-card">
                        <div class="shp-card-header">
                            <h3 class="shp-card-title">Masuk Administrator</h3>
                            <p class="text-muted small mb-0">Silakan masukkan kredensial akun terdaftar Anda.</p>
                        </div>
                        <div class="card-body p-3">
                            @if (session('success'))
                                <div class="alert alert-success p-1 font-weight-bold" role="alert">
                                    {{ session('success') }}
                                </div>
                            @endif

                            @if ($errors->any())
                                <div class="alert alert-danger p-1 font-weight-bold" role="alert">
                                    <ul class="mb-0 pl-1">
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif

                            <form action="{{ route('admin.login.submit') }}" method="POST">
                                @csrf
                                <div class="form-group mb-2">
                                    <label class="form-label font-weight-bold text-dark" for="login-email">Email Admin</label>
                                    <input class="form-control form-control-lg @error('email') is-invalid @enderror" 
                                           id="login-email" 
                                           type="text" 
                                           name="email" 
                                           value="{{ old('email') }}" 
                                           placeholder="admin@putrijayamobil.com" 
                                           style="border-radius: 10px;" 
                                           autofocus 
                                           required />
                                </div>

                                <div class="form-group mb-2">
                                    <label class="form-label font-weight-bold text-dark" for="login-password">Password</label>
                                    <div class="input-group input-group-merge form-password-toggle">
                                        <input class="form-control form-control-lg form-control-merge @error('password') is-invalid @enderror" 
                                               id="login-password" 
                                               type="password" 
                                               name="password" 
                                               placeholder="············" 
                                               style="border-top-left-radius: 10px; border-bottom-left-radius: 10px;" 
                                               required />
                                        <div class="input-group-append">
                                            <span class="input-group-text cursor-pointer" style="border-top-right-radius: 10px; border-bottom-right-radius: 10px;">
                                                <i data-feather="eye"></i>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group mb-2">
                                    <div class="custom-control custom-checkbox">
                                        <input class="custom-control-input" id="remember-me" type="checkbox" name="remember" />
                                        <label class="custom-control-label font-weight-bold text-muted" for="remember-me"> Ingat Saya di perangkat ini</label>
                                    </div>
                                </div>

                                <button class="btn btn-primary-shopee btn-block mt-2">MASUK SEKARANG</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Shopee Footer -->
    <footer class="shp-footer">
        <div class="container">
            <p class="mb-1 font-weight-bold text-dark">
                © {{ date('Y') }} {{ $appSetting->app_name }}. ERP Management System.
            </p>
            <p class="mb-0 text-muted small">
                Data login Anda dilindungi dengan enkripsi SSL 256-bit.
            </p>
        </div>
    </footer>

    <!-- Vendor JS -->
    <script src="{{ asset('template/app-assets/vendors/js/vendors.min.js') }}"></script>
    <script src="{{ asset('template/app-assets/js/core/app-menu.js') }}"></script>
    <script src="{{ asset('template/app-assets/js/core/app.js') }}"></script>

    <script>
        $(window).on('load', function() {
            if (typeof feather !== 'undefined') {
                feather.replace({ width: 14, height: 14 });
            }
        });
    </script>
</body>
</html>
