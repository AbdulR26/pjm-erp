var Asset = function () {
    var BaseUrl = APP_URL;

    var makeSelect2 = function ($el, modelName, label, conditions, relations) {
        if (typeof $.fn.select2 == 'undefined') return false;
        label = label ? label : 'name';
        if ($el.hasClass('select2-hidden-accessible'))$el.select2('destroy');
        var options = {width: '100%'};
        var url = $el.data('url');
        if (modelName)
            options = $.extend(true, options, {
                ajax: {
                    url: url ? url : BaseUrl + '/generate-json/select2',
                    dataType: 'json',
                    delay: 250,
                    data: function (params) {
                        return {
                            relations: $el.data('relations'),
                            s: params.term,
                            page: params.page,
                            modelName: modelName,
                            label: label,
                            separator: $el.data('label-separator'),
                            conditions: $el.data('conditions'),
                            params: $el.data('params'),
                            scopes: $el.data('scopes'),
                        };
                    },
                    type: "POST",
                    cache: true
                },
                minimumInputLength: 1,
                allowClear: true,
                placeholder: 'Select...',
                language: {
                    "errorLoading": function () {
                        return "Searching…";
                    },
                    "searching": function () {
                        return "<span><i class='fa fa-spinner fa-spin'></i> Searching...</span>";
                    }
                },
                templateResult: function (data) {
                    var imgUrl = BaseUrl.replace(/\/\w{2}$/i, '/');
                    if (data.create === true)
                        return data.text + ' <b style="color: lightgreen;">(create new)</b>';
                    else if (data.template_image)
                        return '<span><img src="' + imgUrl + '/uploaded/' + data.template_image + '" width="200" height="auto" style="margin-right: 0px">' + data.text + '</span>';
                    return data.text;
                },
                templateSelection: function (data) {
                    return data.create === true ? data.text + ' <b class="text-success">(create new)</b>' : data.text;
                },
                escapeMarkup: function (markup) {
                    return markup;
                },
                createTag: function (params) {
                    var term = $.trim(params.term);
                    return term ? {
                        id: term,
                        text: term,
                        create: true
                    } : null;
                }
            });
        if ($el.closest('.modal').length)
            options['dropdownParent'] = $('.modal-content', $el.closest('.modal'));

        // initialize selector to select2
        $el.select2(options);
    };


    var handleSelect2 = function(){
        if (typeof $.fn.select2 == 'undefined') return false;
        $(".init-select2").each(function () {
            var model = $(this).data('model'),
                label = $(this).data('label'),
                conditions = $(this).data('conditions'),
                relations = $(this).data('relations');
            makeSelect2($(this), model, label, conditions, relations);
        });
    };

    return {
        init: function () {
            if (typeof (Inputmask) != 'undefined') {
                Inputmask.extendAliases({
                    'rupiah': {
                        groupSeparator: ".",
                        radixPoint: ",",
                        alias: "numeric",
                        autoGroup: !0,
                        digits: 0,
                        digitsOptional: true,
                        greedy: false,
                        autoUnmask: true,
                        showMaskOnHover: false,
                        showMaskOnFocus: false,
                        removeMaskOnSubmit: true,
                        onUnMask: function (value) {
                            return value.replace('.', '');
                        },
                        onBeforePaste: function (value) {
                            return value.replace('.', '');
                        },
                        onBeforeMask: function (value) {
                            return value.replace('.', '');
                        }
                    },
                    'currency': {
                        prefix: "",
                        groupSeparator: ",",
                        alias: "numeric",
                        placeholder: "",
                        autoGroup: !0,
                        digits: 2,
                        greedy: false,
                        digitsOptional: true,
                        clearMaskOnLostFocus: !1,
                        autoUnmask: true,
                        showMaskOnHover: false,
                        showMaskOnFocus: false,
                        removeMaskOnSubmit: true,
                        onUnMask: function (value) {
                            var number = parseFloat(value.replace(/,/g, ''));
                            return $.isNumeric(number) ? number.toString() : value;
                        },
                        onBeforePaste: function (value) {
                            var number = parseFloat(value.replace(/,/g, ''));
                            return $.isNumeric(number) ? number.toString() : value;
                        },
                        onBeforeMask: function (value) {
                            var number = parseFloat(value.replace(/,/g, ''));
                            return $.isNumeric(number) ? number.toString() : value;
                        }
                    }
                });
            }
            handleInputMask();
            handleDTPicker();
            handleDatepicker();
            $('.panel-collapse').on('show.bs.collapse', function () {
                // dd('show');
            }).on('shown.bs.collapse', function () {
                // dd('shown');
                var $panel = $(this).closest('.panel');
                $('.btn-collapse i', $panel).removeClass('fa-plus-square-o').toggleClass('fa-minus-square-o', true);
            }).on('hide.bs.collapse', function () {
                // dd('hide');
            }).on('hidden.bs.collapse', function () {
                var $panel = $(this).closest('.panel');
                $('.btn-collapse i', $panel).removeClass('fa-minus-square-o').toggleClass('fa-plus-square-o', true);
            })
        },
        makeSelect2: function ($el, modelName, label, conditions, relations) {
            makeSelect2($el, modelName, label, conditions, relations);
        },
        initSelect2: handleSelect2,
        initInputMask: function (remove) {
            handleInputMask(remove);
        },
        initDatatable: function (a) {
            return handleDatatable(a);
        },
        initDatepicker: handleDatepicker,
        getBaseUrl: function(){
            return BaseUrl;
        }
    }
}();
