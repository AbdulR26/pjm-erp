/*
NOTE:
------
PLACE HERE YOUR OWN JS CODES AND IF NEEDED.
WE WILL RELEASE FUTURE UPDATES SO IN ORDER TO NOT OVERWRITE YOUR CUSTOM SCRIPT IT'S BETTER LIKE THIS. */

$(document).ready(function () {
    $('.show-list-search').on("click",function () {
        if(!$('.list-search-container-1').is(':visible')){
            $('.list-search-container-1').show();
            $('.list-search-container-2').show();
        }else{
            $('.list-search-container-1').hide();
            $('.list-search-container-2').hide();
        }
    });

    $('.hidden-date').datepicker({
        format: 'dd-mm-yyyy',
        container: 'body',
        onDraw: function onDraw() {
            $('.datepicker-container').find('.datepicker-select').addClass('browser-default');
            $(".datepicker-container .select-dropdown.dropdown-trigger").remove();
        },
    });
});