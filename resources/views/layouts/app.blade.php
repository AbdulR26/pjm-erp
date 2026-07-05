<!DOCTYPE html>
<html class="loading" lang="en" data-textdirection="ltr">
<!-- BEGIN: Head-->

<head>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimal-ui">
    <meta name="description"
        content="Vuexy admin is super flexible, powerful, clean &amp; modern responsive bootstrap 4 admin template with unlimited possibilities.">
    <meta name="keywords"
        content="admin template, Vuexy admin template, dashboard template, flat admin template, responsive admin template, web app">
    <meta name="author" content="PIXINVENT">
    <title>{{ $appSetting->app_name }} | @yield('title')</title>
    <link rel="apple-touch-icon" href="{{ \App\Helpers\StorageHelper::url($appSetting->logo) ?: asset('template/app-assets/images/ico/logo2.png') }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ \App\Helpers\StorageHelper::url($appSetting->logo_favicon) ?: asset('template/app-assets/images/ico/favicon.ico') }}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500;1,600"
        rel="stylesheet">

    <!-- BEGIN: Vendor CSS-->
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/vendors.min.css') }}" />
    @stack('css_vendor')
    <link rel="stylesheet" type="text/css"
        href="{{ asset('template') }}/app-assets/vendors/css/tables/datatable/dataTables.bootstrap4.min.css">
    <link rel="stylesheet" type="text/css"
        href="{{ asset('template') }}/app-assets/vendors/css/tables/datatable/responsive.bootstrap4.min.css">
    <link rel="stylesheet" type="text/css"
        href="{{ asset('template') }}/app-assets/vendors/css/extensions/sweetalert2.min.css">
    <!-- END: Vendor CSS-->

    <!-- BEGIN: Theme CSS-->
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/bootstrap.css') }}" />
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/bootstrap-extended.css') }}" />
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/colors.css') }}" />
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/css/components.css') }}" />


    <!-- BEGIN: Page CSS-->
    <link rel="stylesheet" type="text/css"
        href="{{ asset('template/app-assets/css/core/menu/menu-types/vertical-menu.css') }}" />
    @stack('css')
    <link rel="stylesheet" type="text/css" href="{{ asset('template/assets/css/style.css') }}" />

    {{-- DYNAMIC THEME COLORS OVERRIDE --}}
    <style>
        .text-primary { color: {{ $appSetting->primary_color }} !important; }
        .bg-primary { background-color: {{ $appSetting->primary_color }} !important; }
        .btn-primary { 
            background-color: {{ $appSetting->primary_color }} !important; 
            border-color: {{ $appSetting->primary_color }} !important; 
        }
        .btn-primary:hover, .btn-primary:focus, .btn-primary:active, .btn-primary:not(:disabled):not(.disabled):active {
            background-color: {{ $appSetting->secondary_color }} !important;
            border-color: {{ $appSetting->secondary_color }} !important;
        }
        .btn-outline-primary {
            color: {{ $appSetting->primary_color }} !important;
            border-color: {{ $appSetting->primary_color }} !important;
        }
        .btn-outline-primary:hover {
            background-color: {{ $appSetting->primary_color }} !important;
            color: #fff !important;
        }
        .main-menu.menu-light .navigation .navigation-header {
            color: {{ $appSetting->primary_color }} !important;
        }
        .main-menu.menu-light .navigation > li.active > a {
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
            box-shadow: 0 4px 10px 0 rgba(59, 130, 246, 0.2), 0 4px 20px 0 rgba(59, 130, 246, 0.1) !important;
        }
        .main-menu.menu-light .navigation > li.sidebar-group-active > a {
            background: #f8fafc !important;
        }
        a {
            color: {{ $appSetting->primary_color }};
        }
        a:hover {
            color: {{ $appSetting->secondary_color }};
        }

        /* Sidebar Hover Blue Theme Override */
        .main-menu.menu-light .navigation > li:not(.active) > a:hover,
        .main-menu.menu-light .navigation > li:not(.active) > a:hover i,
        .main-menu.menu-light .navigation > li:not(.active) > a:hover svg,
        .main-menu.menu-light .navigation > li .menu-content > li:not(.active) > a:hover {
            color: #3b82f6 !important;
        }
    </style>
</head>

<body class="vertical-layout vertical-menu-modern navbar-floating footer-static menu-collapsed"
      data-open="click"
      data-menu="vertical-menu-modern"
      data-col="">

    </head>
    <!-- END: Head-->

    <!-- BEGIN: Body-->

        <!-- BEGIN: Header-->
        @includeIf('layouts.partials.header')
        <!-- END: Header-->


        <!-- BEGIN: Main Menu-->
        @includeIf('layouts.partials.sidebar')
        <!-- END: Main Menu-->

        <!-- BEGIN: Content-->
        <div class="app-content content ">
            <div class="content-overlay"></div>
            <div class="header-navbar-shadow"></div>
            <div class="content-wrapper">
                <div class="content-header row">
                    <div class="content-header-left col-md-9 col-12 mb-2">
                        <div class="row breadcrumbs-top">
                            <div class="col-12">
                                <h2 class="content-header-title float-left mb-0">@yield('title')</h2>
                                <div class="breadcrumb-wrapper">
                                    <ol class="breadcrumb">
                                        <li class="breadcrumb-item">
                                        </li>
                                        @section('breadcrumb')
                                        @show
                                        {{-- <li class="breadcrumb-item"><a href="#">Forms</a>
                                        </li> --}}

                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content-body">
                    {!! $pageConfigs['toolbar'] ?? '' !!}
                    <div class="row mb-2">
                        <div class="col-lg-12 mb-2">
                            @yield('content')
                            @yield('modal')
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- END: Content-->
        @includeIf('layouts.partials.footer')
        <!-- END: Footer-->


        <!-- BEGIN: Vendor JS-->
        <script src="{{ asset('template/app-assets/vendors/js/vendors.min.js') }}"></script>
        <script>
            var APP_URL = {!! json_encode(url('/')) !!}
        </script>
        <!-- BEGIN Vendor JS-->

        <!-- BEGIN: Page Vendor JS-->

        <script src="{{ asset('template') }}/app-assets/vendors/js/tables/datatable/jquery.dataTables.min.js"></script>
        <script src="{{ asset('template/app-assets/vendors/js/tables/datatable/datatables.checkboxes.min.js') }}"></script>
        <script src="{{ asset('template/app-assets/vendors/js/extensions/sweetalert2.all.min.js') }}"></script>
        <script src="{{ asset('template') }}/app-assets/vendors/js/tables/datatable/datatables.bootstrap4.min.js"></script>
        <script src="{{ asset('template') }}/app-assets/vendors/js/tables/datatable/dataTables.responsive.min.js"></script>
        <script src="{{ asset('template') }}/app-assets/vendors/js/extensions/sweetalert2.all.min.js"></script>

        <script src="{{ asset('template') }}/app-assets/vendors/js/pickers/pickadate/picker.js"></script>
        <script src="{{ asset('template') }}/app-assets/vendors/js/pickers/pickadate/picker.date.js"></script>
        <script src="{{ asset('template') }}/app-assets/vendors/js/pickers/pickadate/picker.time.js"></script>
        <script src="{{ asset('template') }}/app-assets/vendors/js/pickers/pickadate/legacy.js"></script>
        <script src="{{ asset('template') }}/app-assets/vendors/js/pickers/flatpickr/flatpickr.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.inputmask/5.0.9/jquery.inputmask.min.js"></script>
        <script>
            $(document).ready(function () {
                $('input.mask-currency').inputmask('decimal', {
                    alias: 'numeric',
                    groupSeparator: ',',
                    autoGroup: true,
                    digits: 2,
                    digitsOptional: false,
                    prefix: '',
                    placeholder: '0',
                    rightAlign: false,
                    removeMaskOnSubmit: true,
                });
                $('input.mask-rupiah').inputmask('decimal', {
                    alias: 'numeric',
                    groupSeparator: '.',
                    radixPoint: ',',
                    autoGroup: true,
                    digits: 0,
                    digitsOptional: false,
                    prefix: '',
                    placeholder: '0',
                    rightAlign: false,
                    removeMaskOnSubmit: true
                });
            });
          </script>
        @stack('script_vendor')
        <!-- END: Page Vendor JS-->

        <!-- BEGIN: Theme JS-->
        <script src="{{ asset('template/app-assets/js/core/app-menu.js') }}"></script>
        <script src="{{ asset('template/app-assets/js/core/app.js') }}"></script>
        <script>
            var APP_URL = {!! json_encode(url('/')) !!}
        </script>
        <script src="{{ asset('template/assets/js/custom-js.js') }}"></script>

        <!-- END: Theme JS-->

        <!-- BEGIN: Page JS-->

        <script>
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            });
        </script>
        <script>
            $('.custom-file-input').on('change', function() {
                let filename = $(this).val().split('\\').pop();
                $(this)
                    .next('.custom-file-label')
                    .addClass('selected')
                    .html(filename);
            });

            function preview(target, image) {
                $(target)
                    .attr('src', window.URL.createObjectURL(image))
                    .show();
            }
        </script>
        @stack('script')
        <!-- END: Page JS-->

        <script>
            $(window).on("load", function() {
                if (feather) {
                    feather.replace({
                        width: 14,
                        height: 14,
                    });
                }
            });
        </script>
    </body>
    <!-- END: Body-->

</html>
