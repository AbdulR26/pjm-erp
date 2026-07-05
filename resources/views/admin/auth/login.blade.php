<!DOCTYPE html>
<html class="loading" lang="id" data-textdirection="ltr">
<!-- BEGIN: Head-->

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimal-ui">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login Admin - {{ $appSetting->app_name }}</title>
    
    <link rel="apple-touch-icon" href="{{ \App\Helpers\StorageHelper::url($appSetting->logo) ?: asset('template/app-assets/images/ico/logo2.png') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ \App\Helpers\StorageHelper::url($appSetting->logo_favicon) ?: asset('template/app-assets/images/ico/favicon.ico') }}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500;1,600" rel="stylesheet">

    <!-- BEGIN: Vendor CSS-->
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/vendors.min.css') }}">
    <!-- END: Vendor CSS-->

    <!-- BEGIN: Theme CSS-->
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/bootstrap.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/bootstrap-extended.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/colors.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/components.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/themes/dark-layout.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/themes/bordered-layout.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/themes/semi-dark-layout.css') }}">

    <!-- BEGIN: Page CSS-->
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/core/menu/menu-types/vertical-menu.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/plugins/forms/form-validation.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/pages/page-auth.css') }}">
    <!-- END: Page CSS-->

    <!-- BEGIN: Custom CSS-->
    <link rel="stylesheet" type="text/css" href="{{ asset('template/assets/css/style.css') }}">
    <!-- END: Custom CSS-->

    {{-- DYNAMIC THEME COLORS OVERRIDE --}}
    <style>
        .text-primary { color: {{ $appSetting->primary_color }} !important; }
        .bg-primary { background-color: {{ $appSetting->primary_color }} !important; }
        .btn-primary { 
            background-color: {{ $appSetting->primary_color }} !important; 
            border-color: {{ $appSetting->primary_color }} !important; 
        }
        .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
            background-color: {{ $appSetting->secondary_color }} !important;
            border-color: {{ $appSetting->secondary_color }} !important;
        }
        .brand-text {
            color: {{ $appSetting->primary_color }} !important;
        }
    </style>
</head>
<!-- END: Head-->

<!-- BEGIN: Body-->

<body class="vertical-layout vertical-menu-modern blank-page navbar-floating footer-static" data-open="click" data-menu="vertical-menu-modern" data-col="blank-page">
    <!-- BEGIN: Content-->
    <div class="app-content content ">
        <div class="content-overlay"></div>
        <div class="header-navbar-shadow"></div>
        <div class="content-wrapper">
            <div class="content-header row">
            </div>
            <div class="content-body">
                <div class="auth-wrapper auth-v2">
                    <div class="auth-inner row m-0">
                        <!-- Brand logo-->
                        <a class="brand-logo" href="javascript:void(0);" style="display: flex; align-items: center; margin-top: 10px;">
                            <span class="brand-logo" style="display: flex; align-items: center; justify-content: center;">
                                @if($appSetting->logo)
                                    <img src="{{ \App\Helpers\StorageHelper::url($appSetting->logo) }}" alt="logo" style="max-height: 36px; border-radius: 4px;">
                                @else
                                    <svg viewBox="0 0 139 95" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="28">
                                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <g id="Artboard" transform="translate(-400.000000, -178.000000)">
                                                <g id="Group" transform="translate(400.000000, 178.000000)">
                                                    <path class="text-primary" id="Path" d="M-5.68434189e-14,2.84217094e-14 L39.1816085,2.84217094e-14 L69.3453773,32.2519224 L101.428699,2.84217094e-14 L138.784583,2.84217094e-14 L94.7579721,42.0205676 L138.784583,82.8421709 L101.428699,82.8421709 L69.3453773,50.7077556 L39.1816085,82.8421709 L-5.68434189e-14,82.8421709 L44.0266008,42.0205676 L-5.68434189e-14,2.84217094e-14 Z" style="fill: currentColor"></path>
                                                </g>
                                            </g>
                                        </g>
                                    </svg>
                                @endif
                            </span>
                            <h2 class="brand-text text-primary ml-1" style="font-weight: 800; margin-bottom: 0;">
                                {{ $appSetting->app_name }}
                            </h2>
                        </a>
                        <!-- /Brand logo-->
                        
                        <!-- Left Text-->
                        <div class="d-none d-lg-flex col-lg-8 align-items-center p-5">
                            <div class="w-100 d-lg-flex align-items-center justify-content-center px-5">
                                <img class="img-fluid" src="{{ asset('template/app-assets/images/pages/login-v2.svg') }}" alt="Login V2" />
                            </div>
                        </div>
                        <!-- /Left Text-->
                        
                        <!-- Login-->
                        <div class="d-flex col-lg-4 align-items-center auth-bg px-2 p-lg-5">
                            <div class="col-12 col-sm-8 col-md-6 col-lg-12 px-xl-2 mx-auto">
                                <h2 class="card-title font-weight-bold mb-1">PJM ERP Panel 👋</h2>
                                <p class="card-text mb-2">Silakan masuk menggunakan akun admin Anda.</p>
                                
                                @if (session('success'))
                                    <div class="alert alert-success p-1" role="alert">
                                        {{ session('success') }}
                                    </div>
                                @endif

                                @if ($errors->any())
                                    <div class="alert alert-danger p-1" role="alert">
                                        <ul class="mb-0 pl-1">
                                            @foreach ($errors->all() as $error)
                                                <li>{{ $error }}</li>
                                            @endforeach
                                        </ul>
                                    </div>
                                @endif

                                <form class="auth-login-form mt-2" action="{{ route('admin.login.submit') }}" method="POST">
                                    @csrf
                                    <div class="form-group">
                                        <label class="form-label" for="login-email">Email</label>
                                        <input class="form-control @error('email') is-invalid @enderror" id="login-email" type="text" name="email" value="{{ old('email') }}" placeholder="admin@putrijayamobil.com" aria-describedby="login-email" autofocus="" tabindex="1" required />
                                    </div>
                                    <div class="form-group">
                                        <div class="d-flex justify-content-between">
                                            <label for="login-password">Password</label>
                                        </div>
                                        <div class="input-group input-group-merge form-password-toggle">
                                            <input class="form-control form-control-merge @error('password') is-invalid @enderror" id="login-password" type="password" name="password" placeholder="············" aria-describedby="login-password" tabindex="2" required />
                                            <div class="input-group-append">
                                                <span class="input-group-text cursor-pointer"><i data-feather="eye"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <div class="custom-control custom-checkbox">
                                            <input class="custom-control-input" id="remember-me" type="checkbox" name="remember" tabindex="3" />
                                            <label class="custom-control-label" for="remember-me"> Ingat Saya</label>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary btn-block" tabindex="4">Masuk</button>
                                </form>
                            </div>
                        </div>
                        <!-- /Login-->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- END: Content-->

    <!-- BEGIN: Vendor JS-->
    <script src="{{ asset('template/app-assets/vendors/js/vendors.min.js') }}"></script>
    <!-- BEGIN Vendor JS-->

    <!-- BEGIN: Page Vendor JS-->
    <script src="{{ asset('template/app-assets/vendors/js/forms/validation/jquery.validate.min.js') }}"></script>
    <!-- END: Page Vendor JS-->

    <!-- BEGIN: Theme JS-->
    <script src="{{ asset('template/app-assets/js/core/app-menu.js') }}"></script>
    <script src="{{ asset('template/app-assets/js/core/app.js') }}"></script>
    <!-- END: Theme JS-->

    <script>
        $(window).on('load', function() {
            if (feather) {
                feather.replace({
                    width: 14,
                    height: 14
                });
            }
        })
    </script>
</body>
<!-- END: Body-->

</html>
