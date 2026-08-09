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

        // Sync Couriers from Biteship
        $('#btn-sync-couriers').on('click', function() {
            var btn = $(this);
            btn.prop('disabled', true);
            
            Swal.fire({
                title: 'Sinkronisasi Kurir...',
                text: 'Sedang menarik data kurir dari Biteship API. Harap tunggu.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            $.ajax({
                url: "{{ route('admin.settings.couriers.sync') }}",
                type: "POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    Swal.close();
                    if (response.success) {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: response.message,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(function() {
                            window.location.reload();
                        });
                    } else {
                        btn.prop('disabled', false);
                        Swal.fire('Gagal!', response.message || 'Terjadi kesalahan.', 'error');
                    }
                },
                error: function(xhr) {
                    Swal.close();
                    btn.prop('disabled', false);
                    var errMsg = 'Terjadi kesalahan sistem.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message;
                    }
                    Swal.fire('Error!', errMsg, 'error');
                }
            });
        });

        // Toggle Courier Status
        $(document).on('change', '.courier-toggle', function() {
            var checkbox = $(this);
            var id = checkbox.data('id');
            var isChecked = checkbox.prop('checked');
            
            checkbox.prop('disabled', true);

            $.ajax({
                url: "{{ url('/admin/settings/couriers') }}/" + id + "/toggle",
                type: "POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    checkbox.prop('disabled', false);
                    if (response.success) {
                        // Toast success message
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                        Toast.fire({
                            icon: 'success',
                            title: response.message
                        });
                    } else {
                        // Revert checkbox state
                        checkbox.prop('checked', !isChecked);
                        Swal.fire('Gagal!', response.message || 'Gagal mengubah status kurir.', 'error');
                    }
                },
                error: function(xhr) {
                    checkbox.prop('disabled', false);
                    checkbox.prop('checked', !isChecked);
                    var errMsg = 'Gagal mengubah status kurir.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message;
                    }
                    Swal.fire('Error!', errMsg, 'error');
                }
            });
        });

        // Toggle Payment Method Status
        $(document).on('change', '.payment-toggle', function() {
            var checkbox = $(this);
            var id = checkbox.data('id');
            var isChecked = checkbox.prop('checked');

            checkbox.prop('disabled', true);

            $.ajax({
                url: "{{ url('/admin/settings/payments') }}/" + id + "/toggle",
                type: "POST",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    checkbox.prop('disabled', false);
                    if (response.success) {
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true
                        });
                        Toast.fire({
                            icon: 'success',
                            title: response.message
                        });
                    } else {
                        // Revert checkbox state
                        checkbox.prop('checked', !isChecked);
                        Swal.fire('Gagal!', response.message || 'Gagal mengubah status metode pembayaran.', 'error');
                    }
                },
                error: function(xhr) {
                    checkbox.prop('disabled', false);
                    checkbox.prop('checked', !isChecked);
                    var errMsg = 'Gagal mengubah status metode pembayaran.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        errMsg = xhr.responseJSON.message;
                    }
                    Swal.fire('Error!', errMsg, 'error');
                }
            });
        });

        // Trigger Reset Data via SweetAlert2 directly
        $('#btn-trigger-reset-data').on('click', function() {
            Swal.fire({
                title: 'Konfirmasi Reset Data',
                html: `
                    <p class="text-muted small mb-1">Tindakan ini akan mengosongkan seluruh data produk, pesanan, kustomer, stok, pembayaran, dan log transaksi secara permanen.</p>
                    <div class="alert alert-warning p-1 text-left small mb-2">
                        <strong>Data Aman:</strong> User Admin, Role, Permission, dan Pengaturan Aplikasi tetap dipertahankan.
                    </div>
                    <p class="font-weight-bold text-danger mb-50">Ketik kata <span class="badge badge-light-danger">RESET</span> di bawah untuk melanjutkan:</p>
                `,
                input: 'text',
                inputPlaceholder: 'Ketik RESET di sini',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocomplete: 'off'
                },
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Reset Sekarang!',
                cancelButtonText: 'Batal',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-outline-secondary ml-1'
                },
                buttonsStyling: false,
                inputValidator: (value) => {
                    if (!value || value.trim().toUpperCase() !== 'RESET') {
                        return 'Anda harus mengetik kata RESET secara tepat!'
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    $('#hidden_confirm_text').val('RESET');
                    Swal.fire({
                        title: 'Mereset Database...',
                        text: 'Sedang mengosongkan data operasional. Harap tunggu.',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                    $('#resetDataForm').submit();
                }
            });
        });

        // Test Midtrans Connection AJAX
        $('#btn-test-midtrans').on('click', function() {
            var btn = $(this);
            var serverKey = $('#midtrans_server_key').val();
            var isProd = $('#midtrans_is_production').is(':checked') ? 1 : 0;
            var badge = $('#midtrans-status-badge');

            btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm mr-25" role="status"></span> Menghubungkan...');
            badge.removeClass('badge-light-success badge-light-danger badge-light-secondary').addClass('badge-light-warning').text('Memeriksa...');

            $.ajax({
                url: "{{ route('admin.settings.test-midtrans') }}",
                type: 'POST',
                data: {
                    _token: "{{ csrf_token() }}",
                    midtrans_server_key: serverKey,
                    midtrans_is_production: isProd
                },
                success: function(response) {
                    btn.prop('disabled', false).html('<i data-feather="wifi" class="mr-25"></i> Tes Koneksi Midtrans');
                    if (typeof feather !== 'undefined') feather.replace();

                    if (response.success) {
                        badge.removeClass('badge-light-warning badge-light-danger badge-light-secondary').addClass('badge-light-success').text('Terkoneksi');
                        Swal.fire({
                            icon: 'success',
                            title: 'Koneksi Midtrans Berhasil!',
                            text: response.message,
                            customClass: { confirmButton: 'btn btn-success' }
                        });
                    } else {
                        badge.removeClass('badge-light-warning badge-light-success badge-light-secondary').addClass('badge-light-danger').text('Gagal');
                        Swal.fire({
                            icon: 'error',
                            title: 'Koneksi Midtrans Gagal',
                            text: response.message,
                            customClass: { confirmButton: 'btn btn-danger' }
                        });
                    }
                },
                error: function(xhr) {
                    btn.prop('disabled', false).html('<i data-feather="wifi" class="mr-25"></i> Tes Koneksi Midtrans');
                    if (typeof feather !== 'undefined') feather.replace();
                    badge.removeClass('badge-light-warning badge-light-success badge-light-secondary').addClass('badge-light-danger').text('Error');

                    var msg = 'Terjadi kesalahan sistem saat mencoba koneksi Midtrans.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        msg = xhr.responseJSON.message;
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: msg,
                        customClass: { confirmButton: 'btn btn-danger' }
                    });
                }
            });
        });

        // Test Biteship Connection AJAX
        $('#btn-test-biteship').on('click', function() {
            var btn = $(this);
            var apiKey = $('#biteship_api_key').val();
            var isProd = $('#biteship_is_production').is(':checked') ? 1 : 0;
            var badge = $('#biteship-status-badge');

            btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm mr-25" role="status"></span> Menghubungkan...');
            badge.removeClass('badge-light-success badge-light-danger badge-light-secondary').addClass('badge-light-warning').text('Memeriksa...');

            $.ajax({
                url: "{{ route('admin.settings.test-biteship') }}",
                type: 'POST',
                data: {
                    _token: "{{ csrf_token() }}",
                    biteship_api_key: apiKey,
                    biteship_is_production: isProd
                },
                success: function(response) {
                    btn.prop('disabled', false).html('<i data-feather="wifi" class="mr-25"></i> Tes Koneksi Biteship');
                    if (typeof feather !== 'undefined') feather.replace();

                    if (response.success) {
                        badge.removeClass('badge-light-warning badge-light-danger badge-light-secondary').addClass('badge-light-success').text('Terkoneksi');
                        Swal.fire({
                            icon: 'success',
                            title: 'Koneksi Biteship Berhasil!',
                            text: response.message,
                            customClass: { confirmButton: 'btn btn-success' }
                        });
                    } else {
                        badge.removeClass('badge-light-warning badge-light-success badge-light-secondary').addClass('badge-light-danger').text('Gagal');
                        Swal.fire({
                            icon: 'error',
                            title: 'Koneksi Biteship Gagal',
                            text: response.message,
                            customClass: { confirmButton: 'btn btn-danger' }
                        });
                    }
                },
                error: function(xhr) {
                    btn.prop('disabled', false).html('<i data-feather="wifi" class="mr-25"></i> Tes Koneksi Biteship');
                    if (typeof feather !== 'undefined') feather.replace();
                    badge.removeClass('badge-light-warning badge-light-success badge-light-secondary').addClass('badge-light-danger').text('Error');

                    var msg = 'Terjadi kesalahan sistem saat mencoba koneksi Biteship.';
                    if (xhr.responseJSON && xhr.responseJSON.message) {
                        msg = xhr.responseJSON.message;
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: msg,
                        customClass: { confirmButton: 'btn btn-danger' }
                    });
                }
            });
        });

        // Get Current Location (GPS) JS
        $('#btn-get-current-location').on('click', function() {
            if ("geolocation" in navigator) {
                var btn = $(this);
                btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm mr-25"></span> Membaca GPS...');

                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;

                        $('#biteship_origin_latitude').val(lat.toFixed(7));
                        $('#biteship_origin_longitude').val(lng.toFixed(7));

                        btn.prop('disabled', false).html('<i data-feather="check" class="mr-25"></i> Terdeteksi!');
                        if (typeof feather !== 'undefined') feather.replace();

                        Swal.fire({
                            icon: 'success',
                            title: 'Lokasi Berhasil Dideteksi!',
                            html: `<strong>Latitude:</strong> ${lat.toFixed(7)}<br><strong>Longitude:</strong> ${lng.toFixed(7)}`,
                            customClass: { confirmButton: 'btn btn-success' }
                        });
                    },
                    function(error) {
                        btn.prop('disabled', false).html('<i data-feather="crosshair" class="mr-25"></i> Deteksi Lokasi Sekarang (GPS)');
                        if (typeof feather !== 'undefined') feather.replace();

                        var msg = 'Gagal mengakses GPS.';
                        if (error.code === error.PERMISSION_DENIED) {
                            msg = 'Izin lokasi (GPS) ditolak oleh browser. Silakan berikan izin lokasi di browser Anda.';
                        } else if (error.code === error.POSITION_UNAVAILABLE) {
                            msg = 'Informasi sinyal GPS lokasi tidak tersedia.';
                        } else if (error.code === error.TIMEOUT) {
                            msg = 'Waktu permintaan posisi GPS habis (timeout).';
                        }

                        Swal.fire({
                            icon: 'error',
                            title: 'Akses GPS Gagal',
                            text: msg,
                            customClass: { confirmButton: 'btn btn-danger' }
                        });
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Tidak Didukung',
                    text: 'Browser Anda tidak mendukung fitur Geolocation GPS.',
                    customClass: { confirmButton: 'btn btn-warning' }
                });
            }
        });
    });
</script>
@endpush
