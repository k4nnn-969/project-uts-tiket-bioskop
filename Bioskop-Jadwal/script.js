$(document).ready(function() {
    $('.filter').click(function() {
        $('.filter').removeClass('active-tab');
        $(this).addClass('active-tab');
    });

    $('.cinema-card').click(function() {
        $('.cinema-card').removeClass('active-card');
        $(this).addClass('active-card');
        
        let cinemaName = $(this).data('cinema');
        
        $('#selectedCinemaTitle').fadeOut(150, function() {
            $(this).text(cinemaName).fadeIn(150);
        });
    });
});