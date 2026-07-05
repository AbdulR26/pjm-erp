var Scaffolding = function() {
    var handleDatatable = function() {
        $.fn.dataTable.Buttons.defaults.dom.button.className = 'btn';
        $(".scaffolding-datatable").DataTable({
            ajax: {
                beforeSend: () => {
                    swal({
                        text: 'Please wait a moment',
                        icon: 'info',
                        button: false,
                        closeOnClickOutside: false,
                        closeOnEsc: false
                    });
                },
                data: function (d) {
                    var $scaffoldingForm = $('#scaffolding-datatable-form');
                    $(':input[name*=search]', $scaffoldingForm).each(function () {
                        var name = $(this).attr('name');
                        d[name] = this.value;
                    });
                },
            },
            serverSide: true,
            processing: false,
            order: [1, 'asc'],
            // dom: '<"top display-flex  mb-2"<"action-filters"f><"actions action-btns display-flex align-items-center">><"clear">rt<"bottom"p>',
            // dom: '<"top display-flex">r<"resposinve-table"t><"bottom"p>',
            dom: '<"top display-flex">lrt<"bottom"p>',
            language: {
                search: "",
                searchPlaceholder: "Search Invoice"
            },
            select: {
                style: "multi",
                selector: "td:first-child>",
                items: "row"
            },
            responsive: {
                details: {
                    type: "column",
                    target: 0
                }
            },
            lengthMenu: [10, 30, 50, 100, 200],
            orderCellsTop: true,
            initComplete: function () {
                var api = this.api();
                $('tr:eq(1) th', api.table().header()).each(function (i) {
                    var column = api.columns(i);
                    $('input', this).on('keyup change', function (e) {
                        var input = this;
                        var keycode = Number(e.keyCode ? e.keyCode : e.which);
                        if($(input).hasClass('datepicker')) keycode = 13;
                        if (keycode === 13 && column.search() !== input.value) {
                            column.search(input.value).draw();
                        }
                    });
                    $('select', this).on('change', function () {
                        var select = this;
                        var val = $.fn.dataTable.util.escapeRegex(select.value);
                        if (column.search() !== select.value) {
                            column.search(select.value).draw();
                        }
                    });
                });
            },
            drawCallback: function() {
                swal.close();
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
            },
        });
    };

    var handleForm = function() {
        var datatable = $(".scaffolding-datatable").DataTable();
        var $form = $('#scaffolding-datatable-form');
        $form.off('submit').on('submit', function(){
            $('input, select', this).each(function(){
                var name = $(this).attr('name');
                var column = datatable.column(name + ':name');
                column.search(this.value);
            });
            datatable.draw();
            return false;
        });
        $form.closest('.card').off('click', '[type=reset]').on('click', '[type=reset]', function(){
            $('input, select', $form).each(function(){
                $(this).val('').trigger('change');
            });
            datatable.search('').columns().search('').draw();
            return false;
        });
    };
    return {
        init: function() {
            handleDatatable();
            handleForm();
        }
    }
}();

$(document).ready(function () {
    window.dd = function(){
        window.console.log.apply(window.console, arguments);
    };
    Scaffolding.init();

    $('.datepicker').datepicker({
        showClearBtn: true,
        autoClose: true,
        format: 'dd-mm-yyyy',
        container: 'body',
        onDraw: function onDraw() {
            // materialize select dropdown not proper working on mobile and tablets so we make it browser default select
            $('.datepicker-container').find('.datepicker-select').addClass('browser-default');
            $(".datepicker-container .select-dropdown.dropdown-trigger").remove();
        }
    });

});