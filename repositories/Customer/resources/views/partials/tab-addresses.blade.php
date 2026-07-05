<div class="d-flex align-items-center justify-content-between mb-2 mt-1">
    <h5 class="font-weight-bold text-dark mb-0">Daftar Alamat Pengiriman</h5>
    <button type="button" class="btn btn-sm btn-primary-premium" id="btn-add-address">
        <i data-feather="plus"></i> Tambah Alamat Baru
    </button>
</div>

<!-- Address Grid Layout -->
<div class="row" id="address-cards-container">
    <!-- Loaded via AJAX -->
</div>

<!-- Modal Address -->
<div class="modal fade" id="modal-address" tabindex="-1" role="dialog" aria-labelledby="modalAddressLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content premium-modal-content">
            <form id="form-address">
                <div class="modal-header premium-modal-header">
                    <h5 class="modal-title text-white font-weight-bold" id="modalAddressLabel">Tambah Alamat</h5>
                    <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-3">
                    <input type="hidden" name="id" id="address-id">
                    <div class="row">
                        <div class="col-md-6 form-group-premium">
                            <label class="form-label-premium" for="address-name">Nama / Label Alamat <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="tag"></i>
                                <input type="text" class="form-control-premium" name="name" id="address-name" required placeholder="cth: Rumah, Kantor">
                            </div>
                        </div>
                        <div class="col-md-6 form-group-premium">
                            <label class="form-label-premium" for="address-phone">No. Telepon Penerima <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="phone"></i>
                                <input type="text" class="form-control-premium" name="phone" id="address-phone" required placeholder="cth: 08123456789">
                            </div>
                        </div>
                        <div class="col-md-6 form-group-premium">
                            <label class="form-label-premium" for="address-province">Provinsi <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="map"></i>
                                <input type="text" class="form-control-premium" name="province" id="address-province" required placeholder="cth: Jawa Barat">
                            </div>
                        </div>
                        <div class="col-md-6 form-group-premium">
                            <label class="form-label-premium" for="address-city">Kota / Kabupaten <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="navigation"></i>
                                <input type="text" class="form-control-premium" name="city" id="address-city" required placeholder="cth: Bandung">
                            </div>
                        </div>
                        <div class="col-md-6 form-group-premium">
                            <label class="form-label-premium" for="address-district">Kecamatan <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="map-pin"></i>
                                <input type="text" class="form-control-premium" name="district" id="address-district" required placeholder="cth: Coblong">
                            </div>
                        </div>
                        <div class="col-md-6 form-group-premium">
                            <label class="form-label-premium" for="address-village">Kelurahan / Desa <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="home"></i>
                                <input type="text" class="form-control-premium" name="village" id="address-village" required placeholder="cth: Dago">
                            </div>
                        </div>
                        <div class="col-md-6 form-group-premium">
                            <label class="form-label-premium" for="address-postal_code">Kode Pos <span class="text-danger">*</span></label>
                            <div class="input-wrapper-premium">
                                <i class="input-icon" data-feather="hash"></i>
                                <input type="text" class="form-control-premium" name="postal_code" id="address-postal_code" required placeholder="cth: 40135">
                            </div>
                        </div>
                        <div class="col-md-6 form-group-premium d-flex align-items-center">
                            <div class="custom-control custom-checkbox mt-2">
                                <input type="checkbox" class="custom-control-input" name="is_primary" id="address-is_primary" value="1">
                                <label class="custom-control-label font-weight-bold text-dark" for="address-is_primary" style="cursor: pointer;">Jadikan Alamat Utama</label>
                            </div>
                        </div>
                        <div class="col-12 form-group-premium">
                            <label class="form-label-premium" for="address-detail">Alamat Lengkap (Jalan, No. Rumah, RT/RW) <span class="text-danger">*</span></label>
                            <textarea class="textarea-premium" name="address" id="address-detail" rows="3" required placeholder="cth: Jl. Dago No. 123, RT 01/RW 02"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer premium-modal-footer">
                    <button type="button" class="btn btn-cancel-premium" data-dismiss="modal">Tutup</button>
                    <button type="submit" class="btn btn-save-premium" id="btn-save-address">Simpan Alamat</button>
                </div>
            </form>
        </div>
    </div>
</div>

@push('css')
    <style>
        /* Address Card Layout */
        .address-grid-card {
            border-radius: 12px !important;
            border: 1.5px solid #ebe9f1 !important;
            background: #fff !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02) !important;
            transition: all 0.25s ease !important;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .address-grid-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(115, 103, 240, 0.08) !important;
            border-color: rgba(115, 103, 240, 0.3) !important;
        }
        
        /* Primary Address Styling */
        .address-grid-card-primary {
            border-color: #7367f0 !important;
            background: rgba(115, 103, 240, 0.01) !important;
            box-shadow: 0 4px 20px rgba(115, 103, 240, 0.08) !important;
        }
        
        .address-card-header {
            padding: 16px 20px;
            border-bottom: 1px solid #f3f2f7;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .address-label {
            font-size: 0.95rem;
            font-weight: 700;
            color: #4b4b4b;
        }
        
        .primary-badge {
            background-color: rgba(46, 213, 115, 0.12);
            color: #2ed573;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .address-card-body {
            padding: 18px 20px;
            flex-grow: 1;
        }
        
        .address-info-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-size: 0.9rem;
            color: #5e5873;
        }
        
        .address-info-row:last-child {
            margin-bottom: 0;
        }
        
        .address-info-row i, .address-info-row svg {
            width: 16px;
            height: 16px;
            color: #7367f0;
            margin-right: 12px;
            margin-top: 3px;
            flex-shrink: 0;
        }
        
        .address-info-content {
            line-height: 1.4;
        }
        
        .address-card-footer {
            padding: 12px 20px;
            background-color: #fafafc;
            border-top: 1px solid #f3f2f7;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        
        /* Mini Action Buttons */
        .btn-mini-edit {
            background-color: #ff9f43 !important;
            color: #fff !important;
            border: none;
            padding: 6px 14px;
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 6px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(255, 159, 67, 0.2);
        }
        .btn-mini-edit:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(255, 159, 67, 0.3);
        }
        
        .btn-mini-delete {
            background-color: #ea5455 !important;
            color: #fff !important;
            border: none;
            padding: 6px 14px;
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 6px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(234, 84, 85, 0.2);
        }
        .btn-mini-delete:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(234, 84, 85, 0.3);
        }

        /* Modal Premium Theme */
        .premium-modal-content {
            border-radius: 16px !important;
            border: none !important;
            overflow: hidden;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15) !important;
        }
        .premium-modal-header {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.85)) !important;
            border-bottom: none !important;
            padding: 20px 24px !important;
        }
        .premium-modal-footer {
            border-top: 1px solid #ebe9f1 !important;
            padding: 16px 24px !important;
            background-color: #f8f8fb;
        }
        .btn-primary-premium {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.85)) !important;
            color: #fff !important;
            border: none;
            padding: 8px 16px;
            font-weight: 600;
            border-radius: 6px;
            box-shadow: 0 4px 10px rgba(115, 103, 240, 0.15);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
        }
        .btn-primary-premium i, .btn-primary-premium svg {
            margin-right: 6px;
            width: 15px;
            height: 15px;
        }
        .btn-primary-premium:hover {
            transform: translateY(-1.5px);
            box-shadow: 0 6px 15px rgba(115, 103, 240, 0.25);
        }
    </style>
@endpush

@push('script')
<script>
    $(document).ready(function() {
        var customerId = "{{ $customer->id }}";
        var addresses = [];

        function loadAddresses() {
            $.ajax({
                url: '/admin/customers/' + customerId + '/addresses',
                method: 'GET',
                success: function(res) {
                    if (res.success) {
                        addresses = res.addresses;
                        renderAddresses();
                    }
                }
            });
        }

        function renderAddresses() {
            var html = '';
            if (addresses.length === 0) {
                html = '<div class="col-12 text-center py-3"><p class="text-muted mb-0">Belum ada data alamat untuk customer ini.</p></div>';
            } else {
                addresses.forEach(function(addr) {
                    var cardClass = addr.is_primary ? 'address-grid-card address-grid-card-primary' : 'address-grid-card';
                    var primaryTag = addr.is_primary ? '<span class="primary-badge">Alamat Utama</span>' : '';
                    var regionText = addr.village + ', ' + addr.district + ', ' + addr.city + ', ' + addr.province + ' (' + addr.postal_code + ')';

                    html += '<div class="col-lg-6 mb-2">' +
                        '    <div class="' + cardClass + '">' +
                        '        <div class="address-card-header">' +
                        '            <span class="address-label"><i data-feather="tag" style="width:14px; height:14px; margin-right:6px; color:#7367f0;"></i> ' + escapeHtml(addr.name) + '</span>' +
                        '            ' + primaryTag + '' +
                        '        </div>' +
                        '        <div class="address-card-body">' +
                        '            <div class="address-info-row">' +
                        '                <i data-feather="phone"></i>' +
                        '                <div class="address-info-content"><strong>No. Telepon:</strong><br>' + escapeHtml(addr.phone) + '</div>' +
                        '            </div>' +
                        '            <div class="address-info-row">' +
                        '                <i data-feather="map-pin"></i>' +
                        '                <div class="address-info-content"><strong>Alamat Lengkap:</strong><br>' + escapeHtml(addr.address) + '</div>' +
                        '            </div>' +
                        '            <div class="address-info-row">' +
                        '                <i data-feather="globe"></i>' +
                        '                <div class="address-info-content"><strong>Wilayah:</strong><br>' + escapeHtml(regionText) + '</div>' +
                        '            </div>' +
                        '        </div>' +
                        '        <div class="address-card-footer">' +
                        '            <button type="button" class="btn-mini-edit btn-edit-address mr-1" data-id="' + addr.id + '"><i data-feather="edit" style="width:12px;height:12px;margin-right:4px;"></i> Edit</button>' +
                        '            <button type="button" class="btn-mini-delete btn-delete-address" data-id="' + addr.id + '"><i data-feather="trash-2" style="width:12px;height:12px;margin-right:4px;"></i> Hapus</button>' +
                        '        </div>' +
                        '    </div>' +
                        '</div>';
                });
            }
            $('#address-cards-container').html(html);
            if (feather) {
                feather.replace({ width: 14, height: 14 });
            }
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        // Open modal to add address
        $('#btn-add-address').click(function() {
            $('#form-address')[0].reset();
            $('#address-id').val('');
            $('#address-is_primary').prop('checked', false);
            $('#modalAddressLabel').text('Tambah Alamat Baru');
            $('#modal-address').modal('show');
        });

        // Open modal to edit address
        $(document).on('click', '.btn-edit-address', function() {
            var id = $(this).data('id');
            var addr = addresses.find(function(a) { return a.id == id; });
            if (addr) {
                $('#address-id').val(addr.id);
                $('#address-name').val(addr.name);
                $('#address-phone').val(addr.phone);
                $('#address-province').val(addr.province);
                $('#address-city').val(addr.city);
                $('#address-district').val(addr.district);
                $('#address-village').val(addr.village);
                $('#address-postal_code').val(addr.postal_code);
                $('#address-is_primary').prop('checked', addr.is_primary);
                $('#address-detail').val(addr.address);

                $('#modalAddressLabel').text('Edit Alamat');
                $('#modal-address').modal('show');
            }
        });

        // Submit address form (Add / Update)
        $('#form-address').submit(function(e) {
            e.preventDefault();
            var id = $('#address-id').val();
            var url = '/admin/customers/' + customerId + '/addresses';
            var method = 'POST';

            if (id) {
                url += '/' + id;
                method = 'PUT';
            }

            var data = {
                name: $('#address-name').val(),
                phone: $('#address-phone').val(),
                province: $('#address-province').val(),
                city: $('#address-city').val(),
                district: $('#address-district').val(),
                village: $('#address-village').val(),
                postal_code: $('#address-postal_code').val(),
                is_primary: $('#address-is_primary').is(':checked') ? 1 : 0,
                address: $('#address-detail').val(),
                _token: $('meta[name=csrf-token]').attr('content')
            };

            $.ajax({
                url: url,
                method: method,
                data: data,
                success: function(res) {
                    if (res.success) {
                        $('#modal-address').modal('hide');
                        toastr.success(res.message);
                        loadAddresses();
                    } else {
                        toastr.error(res.message || 'Gagal menyimpan alamat.');
                    }
                },
                error: function(xhr) {
                    var errors = xhr.responseJSON.errors;
                    if (errors) {
                        var firstError = Object.values(errors)[0][0];
                        toastr.error(firstError);
                    } else {
                        toastr.error('Terjadi kesalahan. Silakan coba lagi.');
                    }
                }
            });
        });

        // Delete address
        $(document).on('click', '.btn-delete-address', function() {
            var id = $(this).data('id');
            Swal.fire({
                title: 'Hapus alamat ini?',
                text: "Alamat yang dihapus tidak dapat dikembalikan!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ea5455',
                cancelButtonColor: '#82868b',
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal',
                customClass: {
                    confirmButton: 'btn btn-primary',
                    cancelButton: 'btn btn-outline-danger ml-1'
                },
                buttonsStyling: false
            }).then(function(result) {
                if (result.isConfirmed) {
                    $.ajax({
                        url: '/admin/customers/' + customerId + '/addresses/' + id,
                        method: 'DELETE',
                        data: { _token: $('meta[name=csrf-token]').attr('content') },
                        success: function(res) {
                            if (res.success) {
                                toastr.success(res.message);
                                loadAddresses();
                            } else {
                                toastr.error(res.message || 'Gagal menghapus alamat.');
                            }
                        }
                    });
                }
            });
        });

        // Load data on init
        loadAddresses();
    });
</script>
@endpush
