var Lansia = function () {
    var Trans = {
        'materi.required': 'Materi harus diisi',
    };

    var handleForm = function () {
        const $form = $('#form-lansia');

        $form.off('submit').on('submit', function (e) {
            e.preventDefault();
            Swal.fire({
                text: 'Please wait a moment',
                icon: 'info',
            });
            $.ajax({
                url: $form.attr('action'),
                type: 'post',
                dataType: 'json',
                data: $form.serialize(),
                success: (res) => {
                    Swal.fire({
                        title: res.message || 'Data saved.',
                        icon: 'success',
                    }).then(() => {
                        if(res.redirect) {
                            window.location.href = res.redirect;
                        }
                    });
                },
                error: (e) => {
                    const res = e.responseJSON || {};
                    console.log('status code', e.statusCode()    )
                    if(res.errors) {
                        const message = Object.values(res.errors)[0] || [];
                        Swal.fire({
                            title: 'Error!',
                            text: message[0],
                            icon: 'error',
                        });
                        console.log(Object.keys(res.errors));
                        for(let key of Object.keys(res.errors)) {
                            const messages = res.errors[key];
                            console.log(key, messages, $('[name="' + key + '"]', $form));
                            $('[name="' + key + '"]', $form).toggleError(true, messages[0])
                        }
                    } else {
                        Swal.fire({
                            title: res.message || 'Unknown Error!',
                            icon: 'error',
                        });
                    }
                },
                complete: () => {},
            });
            return false;
        });
    };
    var handleSelect = function ()
    {
        $("#tanggal_lahir").on("change", function(e) {
            e.preventDefault();
            var tanggal = $(this).val();
            tanggalCal(tanggal);
            console.log("Tanggal Lahir:", tanggal);
        });

        function tanggalCal(tanggal) {
            $.ajax({
                url: APP_URL + '/balita/get-usia',
                type: 'POST',
                dataType: 'json',
                data: {
                    tanggal_lahir: tanggal
                },
                success: function(r) {
                    $('.usia').val(r.data  + ' Tahun');
                    console.log('AJAX success:', r.data);
                },
                error: function(xhr, status, error) {
                    console.error('AJAX error:', error);
                }
            });
        }

    };
    return {
        init: function () {
            $.ajaxSetup({
                headers: {'X-CSRF-TOKEN': $("meta[name='csrf-token']").attr('content')},
                error : function (data) {
                    const resJson = data.responseJSON || {};
                    if(data.status === 422) {
                        var errors = resJson.errors || [];
                        $('.errorTxt1').remove();
                        $.each(errors, function (key, value) {
                            let $inputField = $(':input[name='+ key +']').closest('.input-field'),
                                $html = '<small class="errorTxt1"><div id="'+ key +'-error" class="invalid-feedback">'+ value +'</div></small>';
                            $inputField.append($html);
                        });
                    } else if(resJson.message) {
                        Swal.fire({icon: 'error', text: resJson.message});
                    }
                },
                complete: function () {

                }
            });
        },
        initForm: function () {
            handleForm();
        },
        initSelect: function(){
            handleSelect();
        }
    };
}();

$(document).ready(function(){
    Lansia.init();
});
