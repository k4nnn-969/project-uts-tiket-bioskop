$(document).ready(function() {
    const cinemaData = {
        "Senayan City XXI": {
            address: "Jl. Asia Afrika Lot 19, Senayan, Jakarta Pusat",
            facilities: ["IMAX", "The Premiere", "Dolby Atmos", "Cafe"]
        },
        "Kelapa Gading IMAX": {
            address: "Sentra Kelapa Gading, Jl. Boulevard Raya, Jakarta Utara",
            facilities: ["IMAX", "Regular 2D", "Snack Bar", "Dolby Atmos"]
        },
        "Pondok Indah 1 XXI": {
            address: "Pondok Indah Mall 1, Jl. Metro Pondok Indah, Jakarta Selatan",
            facilities: ["The Premiere", "Regular 2D", "Cafe"]
        }
    };

    $('.filter').click(function() {
        $('.filter').removeClass('active-tab');$(this).addClass('active-tab');
    });

    $('.cinema-card').click(function() {
        $('.cinema-card').removeClass('active-card');$(this).addClass('active-card');
        
        let cinemaName = $(this).data('cinema');
        let data = cinemaData[cinemaName];
        
        $('.panel-heading').fadeOut(150, function() {
            $('#selectedCinemaTitle').text(cinemaName);
            $('#cinemaAddress').text(data.address);

            let facilityHTML = '';
            data.facilities.forEach(f => {
                facilityHTML += `<span class="f-tag">${f}</span>`;
            });
            $('#cinemaFacilities').html(facilityHTML);
            
            $(this).fadeIn(150);
        });
    });
});