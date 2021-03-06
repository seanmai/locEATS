$(document).ready(function(){
    //Resolve conflict when adding AJAX link
    $(".dropdown-toggle").dropdown();

    // Add slideDown animation to Bootstrap dropdown when expanding.
    $('.dropdown').on('show.bs.dropdown', function() {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
    });

    // Add slideUp animation to Bootstrap dropdown when collapsing.
    $('.dropdown').on('hide.bs.dropdown', function() {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
    });

    // Add slideUp animation to Bootstrap dropdown when clicking off of dropdown.
    $(window).on('click', function() {
        $('.dropdown').find('.dropdown-menu').first().stop(true, true).slideUp();
    });
});
