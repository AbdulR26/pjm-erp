var Asset = (function () {
    var BaseUrl = APP_URL;

    var makeSelect2 = function ($el, modelName, label, conditions, relations) {
        if (typeof $.fn.select2 == "undefined") return false;
        label = label ? label : "name";
        if ($el.hasClass("select2-hidden-accessible")) $el.select2("destroy");
        var options = {
            width: "100%"
        };
        var url = $el.data("url");
        if (modelName)
            options = $.extend(true, options, {
                ajax: {
                    url: url ? url : BaseUrl + "/generate-json/select2",
                    dataType: "json",
                    delay: 250,
                    data: function (params) {
                        return {
                            relations: $el.data("relations"),
                            s: params.term,
                            page: params.page,
                            modelName: modelName,
                            label: label,
                            separator: $el.data("label-separator"),
                            conditions: $el.data("conditions"),
                            params: $el.data("params"),
                            scopes: $el.data("scopes"),
                        };
                    },
                    type: "POST",
                    cache: true,
                },
                minimumInputLength: 1,
                allowClear: true,
                placeholder: "Select...",
                language: {
                    errorLoading: function () {
                        return "Searching…";
                    },
                    searching: function () {
                        return "<span><i class='fa fa-spinner fa-spin'></i> Searching...</span>";
                    },
                },
                templateResult: function (data) {
                    var imgUrl = BaseUrl.replace(/\/\w{2}$/i, "/");
                    if (data.create === true)
                        return (
                            data.text +
                            ' <b style="color: lightgreen;">(create new)</b>'
                        );
                    else if (data.template_image)
                        return (
                            '<span><img src="' +
                            imgUrl +
                            "/uploaded/" +
                            data.template_image +
                            '" width="200" height="auto" style="margin-right: 0px">' +
                            data.text +
                            "</span>"
                        );
                    return data.text;
                },
                templateSelection: function (data) {
                    return data.create === true ?
                        data.text +
                        ' <b class="text-success">(create new)</b>' :
                        data.text;
                },
                escapeMarkup: function (markup) {
                    return markup;
                },
                createTag: function (params) {
                    var term = $.trim(params.term);
                    return term ?
                        {
                            id: term,
                            text: term,
                            create: true,
                        } :
                        null;
                },
            });
        if ($el.closest(".modal").length)
            options["dropdownParent"] = $(
                ".modal-content",
                $el.closest(".modal")
            );
        $el.select2(options);
    };

    var handleDatatable = function (options, selector) {
        if (typeof $.fn.DataTable == "undefined") return false;
        if (!selector) selector = ".init-datatable";
        options = $.extend({
                dom: '<"no-padding"fBl>' + "<rt>" + "<ip>",
                searching: true,
                autoWidth: false,
                scrollX: true,
                ajax: true,
                search: {
                    caseInsensitive: true,
                },
                language: {
                    search: "",
                    searchPlaceholder: "Search",
                },
            },
            options
        );
        return $(selector).DataTable(options);
    };

    var handleSelect2 = function () {
        if (typeof $.fn.select2 == "undefined") return false;
        $(".init-select2").each(function () {
            var model = $(this).data("model"),
                label = $(this).data("label"),
                conditions = $(this).data("conditions"),
                relations = $(this).data("relations");
            makeSelect2($(this), model, label, conditions, relations);
        });
    };

    var handleInputMask = function (remove) {
        if (typeof Inputmask == "undefined") return false;
        if (remove === true) $(".rupiah").inputmask("remove");
        else
            $(".rupiah").inputmask("remove").inputmask({
                alias: "rupiah",
            });
        if (remove === true) $(".currency").inputmask("remove");
        else
            $(".currency").inputmask("remove").inputmask({
                alias: "currency",
            });
        if (remove === true) $(".numeric").inputmask("remove");
        else
            $(".numeric").inputmask("remove").inputmask({
                alias: "numeric",
                //placeholder: "0",
                digits: 0,
                removeMaskOnSubmit: true,
                autoUnmask: true,
                showMaskOnHover: false,
                showMaskOnFocus: false,
            });
        if (remove === true) $(".decimal").inputmask("remove");
        else
            $(".decimal")
            .inputmask("remove")
            .inputmask({
                alias: "decimal",
                //placeholder: "0",
                // digits: 2,
                digitsOptional: true,
                radixPoint: ",",
                removeMaskOnSubmit: true,
                autoUnmask: true,
                showMaskOnHover: false,
                showMaskOnFocus: false,
                onBeforeMask: function (value, opts) {
                    return value.replace(".", ",");
                },
                onUnMask: function (maskedValue, unmaskedValue) {
                    //do something with the value
                    return unmaskedValue.replace(",", ".");
                },
            });
        if (remove === true) $(".percent").inputmask("remove");
        else
            $(".percent").inputmask("remove").inputmask({
                alias: "decimal",
                min: 0,
                max: 100,
                mask: "9{0,3}[.]9{0,2}",
                showMaskOnHover: false,
                showMaskOnFocus: false,
                greedy: false,
                //suffix: '%'
            });
        if (remove === true) $(".geometry").inputmask("remove");
        else
            $(".geometry").inputmask({
                mask: "9{1,2} x 9[9] x 9[9]",
                greedy: false,
                //removeMaskOnSubmit: true,
                showMaskOnHover: true,
                showMaskOnFocus: true,
            });
    };

    var handleDatepicker = function () {
        if (typeof $.fn.datepicker !== "undefined") {
            $(".datepicker").datepicker({
                autoClose: true,
                format: "dd-mm-yyyy",
                container: "body",
                onDraw: function onDraw() {
                    // materialize select dropdown not proper working on mobile and tablets so we make it browser default select
                    $(".datepicker-container")
                        .find(".datepicker-select")
                        .addClass("browser-default");
                    $(
                        ".datepicker-container .select-dropdown.dropdown-trigger"
                    ).remove();
                },
            });
        }
        if (typeof $.fn.timepicker !== "undefined") {
            $(".timepicker").timepicker({
                container: "body",
                twelveHour: false,
            });
        }
    };

    var handleDTPicker = function () {
        if (typeof $.fn.datetimepicker == "undefined") return false;
        $(".year-picker")
            .datetimepicker({
                format: "YYYY",
                // showClear: true,
                // showTodayButton: true,
                // useCurrent: false,
                keepOpen: true,
                viewMode: "years",
            })
            .on("dp.show", function (e) {
                $(e.target).data("DateTimePicker").viewMode("years");
                $(".bootstrap-datetimepicker-widget").css({
                    zIndex: 9999
                });
            });
        $(".time-picker")
            .datetimepicker({
                format: "HH:mm",
                showClear: true,
                showTodayButton: true,
                useCurrent: false,
                keepOpen: true,
            })
            .on("dp.show", function () {
                $(".bootstrap-datetimepicker-widget").css({
                    zIndex: 9999
                });
            });
        $(".date-picker")
            .datetimepicker({
                format: "DD-MM-YYYY",
                showClear: true,
                showTodayButton: true,
                useCurrent: false,
                keepOpen: true,
            })
            .on("dp.show", function () {
                $(".bootstrap-datetimepicker-widget").css({
                    zIndex: 9999
                });
            });
        $(".datetime-picker")
            .datetimepicker({
                format: "DD-MM-YYYY HH:mm",
                showClear: true,
                showTodayButton: true,
                keepOpen: true,
            })
            .on("dp.show", function () {
                $(".bootstrap-datetimepicker-widget").css({
                    zIndex: 9999
                });
            });
    };

    return {
        init: function () {
            if (typeof Inputmask != "undefined") {
                Inputmask.extendAliases({
                    rupiah: {
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
                            return value.replace(".", "");
                        },
                        onBeforePaste: function (value) {
                            return value.replace(".", "");
                        },
                        onBeforeMask: function (value) {
                            return value.replace(".", "");
                        },
                    },
                    currency: {
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
                            var number = parseFloat(value.replace(/,/g, ""));
                            return $.isNumeric(number) ?
                                number.toString() :
                                value;
                        },
                        onBeforePaste: function (value) {
                            var number = parseFloat(value.replace(/,/g, ""));
                            return $.isNumeric(number) ?
                                number.toString() :
                                value;
                        },
                        onBeforeMask: function (value) {
                            var number = parseFloat(value.replace(/,/g, ""));
                            return $.isNumeric(number) ?
                                number.toString() :
                                value;
                        },
                    },
                });
            }
            handleInputMask();
            handleDTPicker();
            handleDatepicker();
            $(".panel-collapse")
                .on("show.bs.collapse", function () {
                    // dd('show');
                })
                .on("shown.bs.collapse", function () {
                    // dd('shown');
                    var $panel = $(this).closest(".panel");
                    $(".btn-collapse i", $panel)
                        .removeClass("fa-plus-square-o")
                        .toggleClass("fa-minus-square-o", true);
                })
                .on("hide.bs.collapse", function () {
                    // dd('hide');
                })
                .on("hidden.bs.collapse", function () {
                    var $panel = $(this).closest(".panel");
                    $(".btn-collapse i", $panel)
                        .removeClass("fa-minus-square-o")
                        .toggleClass("fa-plus-square-o", true);
                });
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
        getBaseUrl: function () {
            return BaseUrl;
        },
    };
})();

function dd() {
    var types = ["log", "info", "error", "warn"];
    var type = "log";
    var args = arguments;
    var countArgs = args.length;
    if (countArgs > 1) {
        var first = args[0];
        if ($.inArray(first, types) != -1) {
            type = first;
            delete args[0];
        }
    }
    args = Array.prototype.slice.call(args);
    console[type].apply(console, args);
}

function fireClickEvent(element) {
    var evt = new window.MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });

    element.dispatchEvent(evt);
}

$.fn.toggleError = function (bool, msg) {
    //if($(this).val() || ($(this).val() != '' && $(this).val() != '0')) bool = false;
    var $formGroup = $(this).closest("div.form-group");
    if ($formGroup.length != 1) {
        $formGroup = $(this).parent();
    }
    if ($formGroup.length == 1) {
        $(":input", $formGroup).toggleClass("is-invalid", bool);
        $(".help-block", $formGroup).remove();
        $formGroup.toggleClass("has-error", Boolean(bool));
        if (msg) {
            msg = $.type(msg) == "array" ? msg.join(", ") : msg;
            $formGroup.append(
                '<div class="help-block error">' + msg + "</div>"
            );
        }
    }
    // Bind event auto remove error
    $(this).on("keyup.required change.required", function () {
        if ($(this).val()) {
            $(this).toggleClass("invalid", false);
            $(":input", $formGroup).toggleClass("invalid", false);
            $(this).toggleError(false).off("keyup.required change.required");
        }
    });
    return $(this);
};

$.fn.checkRequired = function () {
    var $container = $(this),
        $requires = $(":input.required", $container),
        isValid = true;
    if ($requires.length > 0) {
        $requires.each(function () {
            if (!$(this).hasClass("excepted")) {
                if (!$(this).val() || $(this).val() == "0") {
                    $(this).toggleError(true);
                    isValid = false;
                } else $(this).toggleError(false);
            }
        });
    }
    return isValid;
};

function bsAlert(message, options) {
    if (!message) message = "Oops!Something went wrong...";
    options = $.extend(
        true, {
            $target: $(".notification"),
            type: "danger",
        },
        options
    );
    var $template = $(
        '<div class="alert alert-' +
        options.type +
        ' alert-dismissible" role="alert">' +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
        message +
        "</div>"
    );
    options.$target.html($template);
}

function notice() {
    var $modalAlert = $("#modal-alert");
    if ($modalAlert.length == 0) {
        $modalAlert = $(
            '<div id="modal-alert" class="modal fade">' +
            '<div class="modal-dialog modal-md">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
            '<h4 class="modal-title text-center" style="color:#1ca8dd;">Alert!</h4>' +
            "</div>" +
            '<div class="modal-body text-center"></div>' +
            '<div class="modal-footer">' +
            '<button class="btn btn-primary pull-right" data-dismiss="modal" type="button">Close</button>' +
            "</div></div></div></div>"
        );
        $modalAlert.appendTo("body");
    }
    var title = "App Notification :";
    var message = "Oops! Something went wrong";
    var timeout = null;
    var args = arguments;
    var callback = function () {};
    if (args.length == 1 && typeof args[0] == "function") {
        if (!args[0]($modalAlert)) {
            return false;
        }
    } else if (args.length == 1 && typeof args[0] == "object") {
        if (args[0]["message"]) message = args[0]["message"];
        if (args[0]["title"]) title = args[0]["title"];
        if (args[0]["callback"] && typeof args[0]["callback"] == "function")
            callback = args[0]["callback"];
        if (!args[0]["callback"]($modalAlert)) {
            return false;
        }
        if (args[0]["timeout"] && typeof args[0]["timeout"] == "number")
            timeout = args[0]["timeout"];
    } else if (args.length == 1) {
        if (typeof args[0] == "function") {
            callback = args[0];
            if (!args[0]($modalAlert)) {
                return false;
            }
        } else message = args[0];
    } else if (typeof args[1] != "undefined") {
        title = args[0];
        message = args[1];
    }
    $(".modal-title", $modalAlert).html(title);
    $(".modal-body", $modalAlert).html(message);
    swal({
        title: title,
        message: message,
    }).then(function () {
        callback($modalAlert);
        if (timeout)
            setTimeout(function () {
                swal.close();
            }, timeout);
    });
}

function alert() {
    var types = ["success", "error", "warning", "info"];
    var type = "warning";
    var text = null;
    var message = "Something went wrong";
    var args = arguments;
    var countArgs = args.length;
    if (countArgs > 1) {
        var first = args[0];
        if ($.inArray(first, types) != -1) {
            type = first;
            message = args[1];
        } else {
            message = args[0];
            if (args[1]) text = args[1];
        }
    } else message = args[0];
    swal({
        title: message,
        text: text,
        type: type,
    });
}

function notify() {
    var types = ["success", "error", "warning", "info"];
    var type = "warning";
    var text = null;
    var options = {};
    var call = function (isConfirm) {
        if (isConfirm) {
            alert(
                "success",
                "Deleted!",
                "Your imaginary file has been deleted."
            );
        } else {
            alert("error", "Cancelled", "Your imaginary file is safe :)");
        }
    };
    var message = "Something went wrong";
    var args = arguments;
    var countArgs = args.length;
    if (countArgs > 1) {
        var first = args[0];
        var index = 0;
        if ($.inArray(first, types) != -1) {
            type = first;
            delete args[index];
            index++;
        }
        if (args[index]) message = args[index];
        if (args[index + 1] && typeof args[index + 1] == "string")
            text = args[index + 1];
        $.each(args, function (i, arg) {
            if (typeof arg == "function") call = arg;
            if (typeof args == "object") options = arg;
        });
    } else message = args[0];
    swal(
        $.extend({
                title: message,
                text: text,
                type: type,
                showCancelButton: true,
                confirmButtonText: "Yes",
                closeOnConfirm: false,
            },
            options
        )
    ).then(call);
}

function isDomElem(el) {
    return !!(el instanceof HTMLElement || el[0] instanceof HTMLElement);
}

function clone(options, bindings) {
    if (!bindings) return false;
    if (bindings && bindings.length > 0) {
        $.each(bindings, function (i, bind) {
            clone(options, bind);
        });
    } else {
        options = $.extend({
                $source: null,
                $target: null,
                selector: '[name*="?"]',
                clear: true,
                numbering: function () {
                    $('tr:not(".clone") td.numbering', options.$target).each(
                        function (key, el) {
                            $(this).text(key + 1);
                        }
                    );
                },
                callbackAfterSetValue: function ($el) {
                },
                callbackBeforeAppend: function ($el, bindings, $target) {
                },
                callbackAfterAppend: function ($el, bindings) {
                },
                callbackBeforeAppendSelectOption: function (attr) {
                },
                callbackAfterAppendSelectOption: function ($el) {
                },
                callbackEachBinding: function (binding) {
                    return binding;
                },
            },
            options
        );
        if (!isDomElem(options.$target) || !isDomElem(options.$source)) {
            alert(
                "Function cloning element required parameter source & target"
            );
            return false;
        }
        var $source = options.$source.clone();
        if (options.clear === true) $(":input", $source).val("");
        bindings = options.callbackEachBinding(bindings);
        $.each(bindings, function (key, value) {
            var $el = $(
                options.selector.replace("?", key.toSnakeCase()),
                $source
            );
            if ($el.length == 1) {
                if (
                    $el.is("select") &&
                    ($.type(value) == "object" || $.type(value) == "array")
                ) {
                    $.each(value, function (i, attr) {
                        options.callbackBeforeAppendSelectOption(attr);
                        var $option = $("<option/>", attr);
                        $option.appendTo($el);
                        options.callbackAfterAppendSelectOption($option, attr);
                    });
                } else {
                    if ($el.is("select") && typeof value == "string") {
                        $el.replaceWith(
                            $("<input/>", {
                                type: "text",
                                id: $el.attr("id"),
                                name: $el.attr("name"),
                                class: $el.attr("class"),
                                value: value,
                                readonly: true,
                            })
                        );
                    } else {
                        $el.val(value).data("original", value);
                        options.callbackAfterSetValue($el, bindings);
                        if ($el.attr("step"))
                            $el.on(
                                "keypress keydown copy paste cut",
                                function (e) {
                                    e.preventDefault();
                                    return false;
                                }
                            );
                    }
                }
            } else {
                $el = $("." + key.toSnakeCase(), $source);
                if ($el.length == 1) {
                    $el.text(value).data("original", value);
                    options.callbackAfterSetValue($el, bindings);
                }
            }
        });
        $(".required", $source).removeClass("excepted");
        options.callbackBeforeAppend($source, bindings, options.$target);
        options.$target.append($source.show());
        options.callbackAfterAppend($source, bindings);
        options.numbering();
        Asset.initSelect2();
        return $source;
    }
}

String.prototype.toDashCase = function () {
    return this.replace(/([A-Z])/g, function ($1) {
        return "-" + $1.toLowerCase();
    });
};

String.prototype.toCamelCase = function () {
    return this.replace(/(\-[a-z])/g, function ($1) {
        return $1.toUpperCase().replace("-", "");
    });
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.toSnakeCase = function () {
    return this.replace(/([A-Z])/g, function ($1) {
        return "_" + $1.toLowerCase();
    });
};

$.fn.compressSerialize = function (options) {
    var $container = $(this);
    options = $.extend({
            keyName: "items",
            regex: "\\[(\\w+|)\\]\\[\\]",
        },
        options
    );
    var data = [];
    var compressed = [];
    $.each($(":input", $container).serializeArray(), function (i, field) {
        var matches = field.name.match(new RegExp(options.regex), "ig");
        if (matches && typeof matches[1] != "undefined") {
            field.name = matches[1];
            field.index = i;
            compressed.push(field);
        } else data.push(field);
    });
    data.push({
        name: options.keyName,
        value: JSON.stringify(compressed),
    });
    return data;
};

function formatDate(date, format) {
    if (typeof $.fn.datepicker == "undefined") return date;
    format = format ? format : "dd/mm/yy";
    if (typeof date === "object" && date.date) date = date.date;
    var newDate = new Date(date);
    return !isNaN(newDate.getTime()) ?
        $.datepicker.formatDate(format, newDate) :
        date;
}

function formatDateTime(datetime) {
    var date = new Date(datetime);
    var isValid = !isNaN(date.getTime());
    if (isValid) {
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds(),
            hourFormatted = hour % 12 || 12,
            minuteFormatted = minute < 10 ? "0" + minute : minute,
            morning = hour < 12 ? "am" : "pm";
        return (
            day + "/" + month + "/" + year + " " + hour + ":" + minuteFormatted
        );
    } else return datetime;
}
if (typeof $.tablesorter != "undefined") {
    $.tablesorter.addParser({
        id: "rupiah",
        is: function (s) {
            return /rp|\./gi.test(s);
        },
        format: function (s) {
            return s.replace(/rp|\./gi, "");
        },
        type: "numeric",
    });
}
$(document).ready(function ($) {
    if ($(".notification").length) {
        $(".row")
            .find(".m-t-md")
            .attr("style", "margin-top : 60px !important;");
    }

    $(".listTrigger").click(function (e) {
        head = $(this).parent().parent().find(".list-group-item");
        icon = $(this).children();
        if (icon.hasClass("fa-minus-square")) {
            icon.removeClass("fa-minus-square");
            icon.addClass("fa-plus-square");
        } else {
            icon.addClass("fa-minus-square");
            icon.removeClass("fa-plus-square");
        }
        head.each(function () {
            if ($(this).hasClass("hidden")) {
                $(this).removeClass("hidden");
            } else {
                $(this).addClass("hidden");
            }
        });
    });
    Asset.init();
});
