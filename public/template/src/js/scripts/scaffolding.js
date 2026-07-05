var Scaffolding = function () {

    /**
     * Toast notification using SweetAlert2
     */
    var toast = function (icon, title, timer) {
        var Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: timer || 2500,
            timerProgressBar: true,
            didOpen: function (toast) {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        Toast.fire({ icon: icon, title: title });
    };

    /**
     * Handle main datatable initialization
     */
    var handleDatatable = function () {
        var $table = $(".scaffolding-datatable");
        if (!$table.length) return;

        var tableId = $table.attr('id');

        var dt = $table.DataTable({
            ajax: {
                beforeSend: function () {
                    Swal.fire({
                        text: 'Memuat data...',
                        icon: 'info',
                        showConfirmButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        didOpen: function () { Swal.showLoading(); }
                    });
                },
                data: function (d) {
                    var $form = $('#scaffolding-datatable-form');
                    $(':input[name*=search]', $form).each(function () {
                        d[$(this).attr('name')] = this.value;
                    });
                },
            },
            serverSide: true,
            processing: false,
            order: [1, 'asc'],
            dom: '<"d-flex align-items-center justify-content-between mb-2"<"dt-export-area"B><"dt-length-area"l>>rt<"d-flex justify-content-between align-items-center mt-2"ip>',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: '<i class="fa fa-file-excel-o"></i> Excel',
                    className: 'dt-button buttons-excel',
                    exportOptions: { columns: ':not(:first-child):not(:last-child)' }
                },
                {
                    extend: 'csvHtml5',
                    text: '<i class="fa fa-file-text-o"></i> CSV',
                    className: 'dt-button buttons-csv',
                    exportOptions: { columns: ':not(:first-child):not(:last-child)' }
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="fa fa-file-pdf-o"></i> PDF',
                    className: 'dt-button buttons-pdf',
                    exportOptions: { columns: ':not(:first-child):not(:last-child)' }
                },
                {
                    extend: 'print',
                    text: '<i class="fa fa-print"></i> Print',
                    className: 'dt-button buttons-print',
                    exportOptions: { columns: ':not(:first-child):not(:last-child)' }
                },
            ],
            language: {
                search: '',
                searchPlaceholder: 'Cari data...',
                lengthMenu: '_MENU_ per halaman',
                info: 'Menampilkan _START_ - _END_ dari _TOTAL_ data',
                infoEmpty: 'Tidak ada data',
                infoFiltered: '(disaring dari _MAX_ total)',
                zeroRecords: '<div style="padding:30px;text-align:center;color:#94a3b8;">😕 Tidak ada data ditemukan</div>',
                paginate: {
                    first: '«', previous: '‹', next: '›', last: '»'
                }
            },
            select: { style: 'multi', selector: 'td:first-child>input', items: 'row' },
            responsive: { details: { type: 'column', target: 0 } },
            lengthMenu: [10, 30, 50, 100, 200],
            orderCellsTop: true,
            columnDefs: [
                {
                    targets: 0,
                    orderable: false,
                    searchable: false,
                    data: null,
                    defaultContent: '<input type="checkbox" class="row-checkbox">',
                    className: 'text-center',
                    width: '40px'
                },
                { orderable: false, searchable: false, targets: -1, className: 'text-center', width: '120px' }
            ],
            initComplete: function () {
                var api = this.api();
                $('tr:eq(1) th', api.table().header()).each(function (i) {
                    var column = api.columns(i);
                    $('input', this).on('keyup change', function (e) {
                        var input = this;
                        var keycode = Number(e.keyCode ? e.keyCode : e.which);
                        if ($(input).hasClass('datepicker')) keycode = 13;
                        if (keycode === 13 && column.search() !== input.value) {
                            column.search(input.value).draw();
                        }
                    });
                    $('select', this).on('change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(this.value);
                        if (column.search() !== this.value) {
                            column.search(this.value).draw();
                        }
                    });
                });
            },
            drawCallback: function () {
                swal.close();
                syncSelectAll();
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
            },
            rowCallback: function (row, data) {
                // Set the data-id on each row checkbox using the 'id' field from server data
                var id = data.id || data.DT_RowId || '';
                $('input.row-checkbox', row).attr('data-id', id);
            },
        });

        window._scaffoldingDT = dt;

        // Handle select-all
        $(document).on('change', '#select-all-rows', function () {
            var checked = $(this).prop('checked');
            $('input.row-checkbox').prop('checked', checked);
            updateBulkBar();
        });

        $(document).on('change', '.row-checkbox', function () {
            syncSelectAll();
            updateBulkBar();
        });

        // Bulk delete
        $(document).on('click', '#bulk-delete-btn', function () {
            var ids = getSelectedIds();
            if (!ids.length) return;
            var url = $(this).data('url');
            Swal.fire({
                title: 'Hapus ' + ids.length + ' data?',
                text: 'Data yang dihapus tidak dapat dikembalikan!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal'
            }).then(function (result) {
                if (result.isConfirmed) {
                    $.ajax({
                        url: url,
                        method: 'POST',
                        data: { ids: ids, _token: $('meta[name=csrf-token]').attr('content') },
                        success: function (res) {
                            toast('success', res.message || (ids.length + ' data berhasil dihapus!'));
                            clearBulkSelection();
                            dt.ajax.reload(null, false);
                        },
                        error: function () {
                            toast('error', 'Gagal menghapus data. Silakan coba lagi.');
                        }
                    });
                }
            });
        });

        // Handle single delete buttons (AJAX if route returns JSON)
        $(document).on('click', '.btn-scaffolding-delete', function (e) {
            e.preventDefault();
            var url = $(this).attr('href') || $(this).data('url');
            Swal.fire({
                title: 'Hapus data ini?',
                text: 'Data tidak dapat dikembalikan setelah dihapus.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal'
            }).then(function (result) {
                if (result.isConfirmed) {
                    $.ajax({
                        url: url,
                        method: 'DELETE',
                        data: { _token: $('meta[name=csrf-token]').attr('content') },
                        success: function (res) {
                            toast('success', res.message || 'Data berhasil dihapus!');
                            dt.ajax.reload(null, false);
                        },
                        error: function () {
                            toast('error', 'Gagal menghapus data.');
                        }
                    });
                }
            });
        });
    };

    /**
     * Handle search form
     */
    var handleForm = function () {
        var dt = window._scaffoldingDT;
        if (!dt) return;
        var $form = $('#scaffolding-datatable-form');
        $form.off('submit').on('submit', function () {
            $('input, select', this).each(function () {
                var name = $(this).attr('name');
                var column = dt.column(name + ':name');
                column.search(this.value);
            });
            dt.draw();
            return false;
        });
        $form.closest('.card').off('click', '[type=reset]').on('click', '[type=reset]', function () {
            $('input, select', $form).each(function () {
                $(this).val('').trigger('change');
            });
            dt.search('').columns().search('').draw();
            return false;
        });
    };

    // ---- Helpers ----

    function getSelectedIds() {
        return $('input.row-checkbox:checked').map(function () {
            return $(this).data('id');
        }).get();
    }

    function syncSelectAll() {
        var all = $('input.row-checkbox').length;
        var checked = $('input.row-checkbox:checked').length;
        $('#select-all-rows').prop('indeterminate', checked > 0 && checked < all);
        $('#select-all-rows').prop('checked', all > 0 && checked === all);
    }

    function updateBulkBar() {
        var count = $('input.row-checkbox:checked').length;
        if (count > 0) {
            $('#bulk-selected-count').text(count);
            $('#bulk-action-bar').addClass('show');
        } else {
            $('#bulk-action-bar').removeClass('show');
        }
    }

    window.clearBulkSelection = function () {
        $('input.row-checkbox, #select-all-rows').prop('checked', false).prop('indeterminate', false);
        updateBulkBar();
    };

    return {
        init: function () {
            handleDatatable();
            handleForm();
        },
        toast: toast
    };
}();

$(document).ready(function () {
    window.dd = function () {
        window.console.log.apply(window.console, arguments);
    };

    Scaffolding.init();

    // Flash messages as toast
    var successMsg = $('meta[name=flash-success]').attr('content');
    var errorMsg   = $('meta[name=flash-error]').attr('content');
    if (successMsg) Scaffolding.toast('success', successMsg);
    if (errorMsg)   Scaffolding.toast('error', errorMsg);

    $('.datepicker').datepicker({
        showClearBtn: true,
        autoClose: true,
        format: 'dd-mm-yyyy',
        container: 'body',
        onDraw: function () {
            $('.datepicker-container').find('.datepicker-select').addClass('browser-default');
            $(".datepicker-container .select-dropdown.dropdown-trigger").remove();
        }
    });
});