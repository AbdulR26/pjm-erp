@php
    try {
        $config = $scaffolding->datatable();
        $columns = $scaffolding->datatableColumns();
        $fields = $model->fields();
        $html5Attr = collect($config)
            ->transform(function ($value, $key) {
                if (in_array($key, ['viewSearch', 'withQuery', 'viewScript', 'dom', 'buttons', 'viewToolbar'])) {
                    return '';
                }
                if ((!is_bool($value) && !$value) || $value instanceof \Closure) {
                    return '';
                }
                $key = str_replace('_', '-', Str::snake($key));
                if (is_array($value) || is_bool($value)) {
                    $value = json_encode($value);
                }
                return "data-$key='$value'";
            })
            ->implode(' ');
    } catch (\Exception $e) {
        dd($e);
    }
@endphp

@push('css')
<style>
    /* Premium Scaffolding Card */
    .scaffolding-card {
        border-radius: 16px !important;
        border: none !important;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06) !important;
        overflow: hidden;
    }

    /* Elegant Table Header Gradient */
    table.dataTable th {
        background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
        color: #ffffff !important;
        border: none !important;
        border-bottom: 4px solid #2563eb !important;
        text-align: center !important;
        font-weight: 600 !important;
        padding: 14px !important;
        letter-spacing: 0.5px;
    }

    /* Sleek Search Inputs & Select Filter Dropdowns */
    table.dataTable thead input,
    table.dataTable thead select {
        border-radius: 8px !important;
        border: 1px solid #d1d5db !important;
        padding: 6px 12px !important;
        width: 100% !important;
        box-sizing: border-box;
        outline: none;
        transition: all 0.2s ease;
        font-size: 13px;
        background-color: #ffffff;
    }
    table.dataTable thead input:focus,
    table.dataTable thead select:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
        background-color: #ffffff;
    }

    /* Alternating rows */
    table.dataTable tbody tr:nth-child(even) { background-color: #f8f9ff; }
    table.dataTable tbody tr:hover { background-color: #eff6ff !important; transition: background .15s; }

    /* Modern Pill Action Buttons */
    .scaffolding-datatable td .btn,
    .scaffolding-datatable-false td .btn {
        border-radius: 8px !important;
        padding: 5px 11px !important;
        font-weight: 600 !important;
        font-size: 11px !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.07);
        transition: all 0.2s ease;
        margin: 2px !important;
    }
    .scaffolding-datatable td .btn:hover,
    .scaffolding-datatable-false td .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 14px rgba(0,0,0,0.12);
    }

    /* Export Buttons */
    .dt-buttons { display: inline-flex; gap: 6px; margin-bottom: 10px; }
    .dt-button {
        padding: 7px 14px !important;
        border-radius: 8px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        border: none !important;
        cursor: pointer;
        transition: all 0.2s ease !important;
    }
    .dt-button.buttons-excel  { background: #22c55e !important; color: #fff !important; }
    .dt-button.buttons-csv    { background: #3b82f6 !important; color: #fff !important; }
    .dt-button.buttons-pdf    { background: #ef4444 !important; color: #fff !important; }
    .dt-button.buttons-print  { background: #8b5cf6 !important; color: #fff !important; }
    .dt-button.buttons-colvis { background: #f59e0b !important; color: #fff !important; }
    .dt-button:hover { opacity: .88 !important; transform: translateY(-1px); }

    /* Bulk Delete Bar */
    #bulk-action-bar {
        display: none;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: #fff;
        padding: 10px 18px;
        border-radius: 10px;
        margin-bottom: 12px;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        animation: slideDown .2s ease;
    }
    #bulk-action-bar.show { display: flex; }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    #bulk-delete-btn {
        background: rgba(255,255,255,.2);
        border: 1px solid rgba(255,255,255,.5);
        color: #fff;
        padding: 5px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        transition: background .2s;
    }
    #bulk-delete-btn:hover { background: rgba(255,255,255,.35); }

    /* Action column always centered */
    table.dataTable td.text-center,
    table.dataTable th.text-center {
        text-align: center !important;
    }
    table.dataTable td:last-child {
        text-align: center;
        white-space: nowrap;
    }
    table.dataTable th:last-child {
        text-align: center !important;
    }
</style>
@endpush
@push('css_vendor')
@endpush
@extends('layouts.app')
@section('title', $title)
@section('breadcrumb')
@parent
@endsection


{{-- page content --}}
@section('content')
{!! $config['viewStyle'] ? implode("\n", $config['viewStyle']) : '' !!}
{!! is_array($config['viewSearch']) ? implode("\n", $config['viewSearch']) : $config['viewSearch'] !!}

            {{-- Bulk Action Bar --}}
            <div id="bulk-action-bar">
                <span id="bulk-selected-count">0</span> data dipilih &nbsp;
                @if($prefix === 'admin.orders')
                    <button type="button" id="bulk-book-shipment-btn" class="btn btn-primary btn-sm py-25 mr-50 text-white font-weight-bold" style="border: 1px solid rgba(255,255,255,0.2);"><i data-feather="truck" style="width:14px;height:14px;" class="mr-25"></i> Booking Kurir</button>
                    <button type="button" id="bulk-print-labels-btn" class="btn btn-success btn-sm py-25 mr-50 text-white font-weight-bold" style="border: 1px solid rgba(255,255,255,0.2);"><i data-feather="printer" style="width:14px;height:14px;" class="mr-25"></i> Cetak Label Massal</button>
                @endif
                <button id="bulk-delete-btn" data-url="{{ url($prefix . '/bulk-delete') }}">🗑 Hapus Semua</button>
                <button onclick="clearBulkSelection()" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.4);color:#fff;padding:5px 12px;border-radius:6px;cursor:pointer;">✕ Batal</button>
            </div>
            {!! $config['responsive'] ? '<div class="responsive-table">' : '' !!}
                <table style="width: 100%" id="datatable_{{str_replace('.', '_', $prefix)}}"
                class="table invoice-data-table white border-radius-4 pt-1 striped scaffolding-datatable{{$config
                ['init'] ? '' : '-false'}}" {!! $html5Attr !!}>
                <thead>
                    <tr>
                        <th style="width:40px;"><input type="checkbox" id="select-all-rows" title="Pilih Semua"></th>
                        @foreach ($columns as $column => $attributes)
                            @php
                                $dataAttr = collect($attributes)
                                    ->transform(function ($value, $key) {
                                        if ((!is_bool($value) && !$value) || $value instanceof \Closure) {
                                            return '';
                                        }
                                        $key = str_replace('_', '-', Str::snake($key));
                                        if (is_array($value) || is_bool($value)) {
                                            $value = json_encode($value);
                                        }
                                        return "data-$key='$value'";
                                    })
                                    ->implode(' ');
                            @endphp
                            <th {!! $dataAttr !!}>{{ $attributes['title'] }}</th>
                        @endforeach
                    </tr>
                    @if ($config['columnSearch'])
                        <tr>
                            <th></th>
                            @foreach ($columns as $column => $attributes)
                                <th style="padding: 0 5px">
                                    @if ($attributes['searchable'])
                                        @if ($attributes['searchType'] == 'select')
                                            @php
                                                $options = [];
                                                if (is_array($attributes['searchOptions'])) {
                                                    $options = $attributes['searchOptions'];
                                                } elseif ($attributes['searchOptions'] instanceof \Closure) {
                                                    $options = call_user_func($attributes['searchOptions']);
                                                }
                                                $methodOption = 'get' . \Str::studly($column) . 'Options';
                                                if (!$options && method_exists($model, $methodOption)) {
                                                    $options = $model->$methodOption();
                                                }
                                            @endphp
                                            {!! Form::select("search_$column", $options, null, ['class' => 'select2x browser-defaultx']) !!}
                                        @else
                                            {!! Form::text("search_$column", null, ['placeholder' => 'search', 'class' => $attributes['searchType']]) !!}
                                        @endif
                                    @endif
                                </th>
                            @endforeach
                        </tr>
                    @endif
                </thead>
            </table>
            {!! $config['responsive'] ? '</div>' : '' !!}
            @push('script')
            {!! $config['viewScript'] ? implode("\n", $config['viewScript']) : '' !!}
            @endpush
        </div>
        <div class="card-footer">

        </div>
    </div>
@endsection
@push('script_vendor')
<script src="{{asset('template/app-assets/vendors/js/extensions/sweetalert2.all.min.js')}}"></script>
<script src="{{asset('template/app-assets/vendors/js/tables/datatable/datatables.buttons.min.js')}}"></script>
<script src="{{asset('template/app-assets/vendors/js/tables/datatable/buttons.html5.min.js')}}"></script>
<script src="{{asset('template/app-assets/vendors/js/tables/datatable/buttons.print.min.js')}}"></script>
<script src="{{asset('template/app-assets/vendors/js/tables/datatable/jszip.min.js')}}"></script>
<script src="{{asset('template/app-assets/vendors/js/tables/datatable/pdfmake.min.js')}}"></script>
<script src="{{asset('template/app-assets/vendors/js/tables/datatable/vfs_fonts.js')}}"></script>
<script src="{{ asset('template/src/js/scripts/scaffolding.js')}}"></script>
@endpush

@if($prefix === 'admin.orders')
@push('script')
<script>
    $(document).ready(function() {
        // Bulk Booking Biteship Courier
        $('#bulk-book-shipment-btn').on('click', function(e) {
            e.preventDefault();
            
            // Get selected IDs via checked row checkboxes
            var ids = $('input.row-checkbox:checked').map(function () {
                return $(this).data('id');
            }).get();

            if (ids.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Peringatan',
                    text: 'Silakan pilih minimal satu pesanan terlebih dahulu.',
                    customClass: { confirmButton: 'btn btn-primary' },
                    buttonsStyling: false
                });
                return;
            }

            Swal.fire({
                title: 'Booking Kurir Masal (' + ids.length + ' Order)',
                text: "Sistem akan memesan kurir Biteship secara massal untuk pesanan terpilih yang status pembayarannya sudah Lunas.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Booking Kurir!',
                cancelButtonText: 'Batal',
                customClass: {
                    confirmButton: 'btn btn-primary',
                    cancelButton: 'btn btn-outline-danger ml-1'
                },
                buttonsStyling: false
            }).then(function (result) {
                if (result.value) {
                    Swal.fire({
                        title: 'Memproses Booking...',
                        text: 'Menghubungi Biteship API...',
                        allowOutsideClick: false,
                        onBeforeOpen: function () {
                            Swal.showLoading();
                        }
                    });

                    $.ajax({
                        url: "{{ route('admin.orders.bulk-book-shipment') }}",
                        method: 'POST',
                        data: {
                            _token: "{{ csrf_token() }}",
                            ids: ids
                        },
                        success: function(res) {
                            Swal.close();
                            if (res.success) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Selesai',
                                    text: res.message,
                                    customClass: { confirmButton: 'btn btn-success' },
                                    buttonsStyling: false
                                }).then(function() {
                                    location.reload();
                                });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Gagal',
                                    text: res.message,
                                    customClass: { confirmButton: 'btn btn-primary' },
                                    buttonsStyling: false
                                });
                            }
                        },
                        error: function() {
                            Swal.close();
                            Swal.fire({
                                icon: 'error',
                                title: 'Kesalahan Sistem',
                                text: 'Gagal memproses booking kurir massal ke server.',
                                customClass: { confirmButton: 'btn btn-primary' },
                                buttonsStyling: false
                            });
                        }
                    });
                }
            });
        });

        // Bulk Print Shipping Labels
        $('#bulk-print-labels-btn').on('click', function(e) {
            e.preventDefault();
            
            // Get selected IDs via checked row checkboxes
            var ids = $('input.row-checkbox:checked').map(function () {
                return $(this).data('id');
            }).get();

            if (ids.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Peringatan',
                    text: 'Silakan pilih minimal satu pesanan terlebih dahulu.',
                    customClass: { confirmButton: 'btn btn-primary' },
                    buttonsStyling: false
                });
                return;
            }

            // Redirect to the bulk print route in a new tab
            var printUrl = "{{ route('admin.orders.bulk-print-labels') }}?ids=" + ids.join(',');
            window.open(printUrl, '_blank');
        });
    });
</script>
@endpush
@endif

