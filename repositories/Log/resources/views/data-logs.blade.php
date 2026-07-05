@extends(\Qollam\Log\LogModule::instance()->config('view.layout'))
@section('title', __('Data Logs'))
@section('content')
    <div class="card">
        <div class="card-header border-bottom bg-transparent pt-4 pb-0">
            <h3 class="font-weight-bold text-primary mb-3">📁 Data Logs List</h3>
        </div>
        <div class="card-body">
            <form id="filterForm" class="mb-4">
                <div class="row">
                    <div class="col-lg-3 mb-2">
                        <label for="date_from" class="control-label font-weight-bold">Date From</label>
                        <div class="input-group">
                            <input type="text" name="date_from" id="date_from"
                                value="{{ $dateFrom ? $dateFrom->format('d-m-Y H:i') : '' }}"
                                class="form-control datetime-picker" placeholder="Select Date & Time">
                            <div class="input-group-append">
                                <span class="input-group-text">
                                    <i data-feather="calendar"></i>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-3 mb-2">
                        <label for="date_to" class="control-label font-weight-bold">Date To</label>
                        <div class="input-group">
                            <input type="text" name="date_to" id="date_to"
                                value="{{ $dateTo ? $dateTo->format('d-m-Y H:i') : '' }}"
                                class="form-control datetime-picker" placeholder="Select Date & Time">
                            <div class="input-group-append">
                                <span class="input-group-text">
                                    <i data-feather="calendar"></i>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-3 mb-2">
                        <div class="form-group">
                            <label for="url" class="control-label font-weight-bold">URI</label>
                            <select name="url" id="url" class="form-control">
                                <option value="">All</option>
                                @foreach (\Qollam\Log\Models\DataLog::groupBy('url')->pluck('url', 'url') as $key => $value)
                                    <option value="{{ $key }}">{{ $value }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div class="col-lg-3 mb-2">
                        <label for="action" class="control-label font-weight-bold">Action</label>
                        <select name="action" id="action" class="form-control">
                            <option value="">All</option>
                            @foreach (\Qollam\Log\Models\DataLog::groupBy('action')->pluck('action', 'action') as $key => $value)
                                <option value="{{ $key }}">{{ $value }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-lg-3 mb-2">
                        <label for="table" class="control-label font-weight-bold">Data</label>
                        <select name="table" id="table" class="form-control">
                            <option value="">All</option>
                            @foreach (\Qollam\Log\Models\DataLog::groupBy('table')->pluck('table', 'table') as $key => $value)
                                <option value="{{ $key }}">{{ $value }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-lg-3 mb-2">
                        <label for="key" class="control-label font-weight-bold">Data Keys</label>
                        <input type="text" name="key" id="key" class="form-control" placeholder="Contoh: 15">
                    </div>

                    <div class="col-lg-3 mb-2">
                        <label for="ip_address" class="control-label font-weight-bold">IP Address</label>
                        <select name="ip_address" id="ip_address" class="form-control">
                            <option value="">All</option>
                            @foreach (\Qollam\Log\Models\DataLog::groupBy('ip_address')->pluck('ip_address', 'ip_address') as $key => $value)
                                <option value="{{ $key }}">{{ $value }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-lg-12 mt-3">
                        <button type="button" id="btnReset" class="btn btn-gd-dark">
                            <i data-feather="rotate-ccw"></i> Reset
                        </button>
                        <button type="submit" class="btn btn-gd-success">
                            <i data-feather="filter"></i> Filter Logs
                        </button>
                    </div>
                </div>
            </form>
            
            <div class="table-responsive pt-2">
                <table class="table invoice-data-table white border-radius-4 scaffolding-datatable table-gd-custom" id="dataLogsTable" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Data</th>
                            <th>Data Key</th>
                            <th>Action</th>
                            <th>Before</th>
                            <th>After</th>
                            <th>URI</th>
                            <th>Elapsed</th>
                            <th>IP Address</th>
                            <th>Logged At</th>
                            <th style="width: 1px"></th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
    
    <div id="modal-detail" class="modal">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="border-radius: 16px;">
                <div class="modal-header border-bottom pb-2">
                    <h4 class="modal-title font-weight-bold" style="color:#4f46e5; text-transform:uppercase;">🔍 Log Detail</h4>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body modal-body-scroller">
                    <div id="modal-detail-data"></div>
                </div>
                <div class="modal-footer border-top pt-2">
                    <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('css')
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/pickers/flatpickr/flatpickr.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ asset('template/app-assets/vendors/css/forms/select/select2.min.css')}}">
    <style>
        .card {
            border-radius: 16px !important;
            border: none !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
            overflow: hidden;
        }
        .card-header h3 {
            font-weight: 700;
            color: #4f46e5;
            margin: 0;
        }
        table thead tr {
            white-space: nowrap
        }
        table thead tr th {
            background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
            color: #fff !important;
            border: none !important;
            border-bottom: 4px solid #2563eb !important;
            text-align: center;
            font-weight: 600;
            padding: 12px !important;
        }
        .form-control, .input-group-text, select {
            border-radius: 8px !important;
            border: 1px solid #d1d5db !important;
        }
        .form-control:focus, select:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
        }
        .btn-gd-success, .btn-gd-dark, .btn-detail {
            border-radius: 8px !important;
            padding: 6px 14px !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
        }
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        table td ul {
            padding-left: 15px;
            max-height: 200px;
            overflow-x: auto;
        }
        table tbody td {
            text-transform: none;
        }
        .select2-container--default .select2-selection--single {
            border-radius: 8px !important;
            border: 1px solid #d1d5db !important;
            height: 38px !important;
            padding-top: 4px;
        }
    </style>
@endpush

@push('script_vendor')
    <script src="{{asset('template/app-assets/vendors/js/extensions/sweetalert2.all.min.js')}}"></script>
    <script src="{{asset('template/app-assets/vendors/js/forms/select/select2.full.min.js')}}"></script>
    <script src="{{ asset('template/app-assets/vendors/js/pickers/flatpickr/flatpickr.min.js') }}"></script>
@endpush

@push('script')
    <script>
        $(document).ready(function() {
            // Init components
            $('.select2').select2({
                width: '100%'
            });

            $('.datetime-picker').flatpickr({
                enableTime: true,
                dateFormat: "d-m-Y H:i",
                time_24hr: true
            });

            if (typeof feather !== 'undefined') {
                feather.replace();
            }

            // AJAX Datatable Setup
            const datatable = $('#dataLogsTable').DataTable({
                processing: true,
                serverSide: true,
                dom: '<"top display-flex">lrt<"bottom"p>',
                lengthMenu: [10, 30, 50, 100],
                ajax: {
                    url: "{{ route('data-logs.index') }}",
                    data: function(d) {
                        d.date_from = $('#date_from').val();
                        d.date_to = $('#date_to').val();
                        d.url = $('#url').val();
                        d.action = $('#action').val();
                        d.table = $('#table').val();
                        d.key = $('#key').val();
                        d.ip_address = $('#ip_address').val();
                    }
                },
                columns: [
                    { data: 'id', name: 'id' },
                    { data: 'table', name: 'table' },
                    { data: 'key', name: 'key' },
                    { data: 'action', name: 'action', className: 'text-center' },
                    { data: 'before', name: 'before', orderable: false, searchable: false },
                    { data: 'after', name: 'after', orderable: false, searchable: false },
                    { data: 'url', name: 'url' },
                    { data: 'elapsed', name: 'elapsed', className: 'text-center' },
                    { data: 'ip_address', name: 'ip_address' },
                    { data: 'created_at', name: 'created_at', className: 'text-center' },
                    { data: 'options', name: 'options', orderable: false, searchable: false }
                ],
                order: [[0, 'desc']],
                drawCallback: function() {
                    if (typeof feather !== 'undefined') {
                        feather.replace();
                    }
                }
            });

            // Filter submit
            $('#filterForm').on('submit', function(e) {
                e.preventDefault();
                datatable.ajax.reload();
            });

            // Reset filters
            $('#btnReset').on('click', function() {
                $('#filterForm')[0].reset();
                $('.select2').val('').trigger('change');
                datatable.ajax.reload();
            });

            // Detail AJAX popup
            const $modalDetail = $('#modal-detail');
            $(document).on('click', '.btn-detail', function() {
                const url = $(this).data('url');
                if (!url) return;

                Swal.fire({
                    title: 'Memuat Detail...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                $.ajax({
                    type: 'POST',
                    url: url,
                    data: {
                        _token: "{{ csrf_token() }}"
                    },
                    success: function(res) {
                        Swal.close();
                        if (res.html) {
                            $('#modal-detail-data', $modalDetail).html(res.html);
                            $modalDetail.modal('show');
                            if (typeof feather !== 'undefined') {
                                feather.replace();
                            }
                        }
                    },
                    error: function() {
                        Swal.close();
                        Swal.fire('Gagal', 'Gagal memuat rincian logs', 'error');
                    }
                });
            });
        });
    </script>
@endpush
