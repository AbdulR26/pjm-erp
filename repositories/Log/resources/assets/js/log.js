const Log = function() {
    var $modalDetail = $('#modal-detail').on('hidden.bs.modal', function(){
        $('#modal-detail-data', $modalDetail).html('');
    });

    const handleScripts = function() {
        $(document).ready(function(){
            $(document).off('click', '.btn-detail').on('click', '.btn-detail', function(){
                const $btn = $(this)/*.button('loading')*/;
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: $btn.data('url'),
                    success: function(res) {
                        $('#modal-detail-data', $modalDetail).replaceWith(res.html || '');
                        $modalDetail.modal('show');
                    },
                    complete: function(){
                        // $btn.button('reset');
                    }
                });

            });
        })
    };

    return {
        init: function () {
            handleScripts();
        }
    }
}();

$(document).ready(function(){
    Log.init();
});