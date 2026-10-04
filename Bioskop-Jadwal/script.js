$(document).ready(function() {
    'use strict';

    const SYSTEM_DATE = new Date();
    SYSTEM_DATE.setHours(0, 0, 0, 0);

    const getFallback = (title) => `https://placehold.co/300x450/1e293b/ffffff?text=${encodeURIComponent(title)}&font=montserrat`;

    const DB_MOVIES = [
        { 
            id: "M01", title: "Resident Evil", genre: "Horror, Thriller", rate: "⭐ 9.0", age: "17+", 
            poster: "../img/Resident_Evil.webp",
            fallbackImg: getFallback("Resident Evil"), 
            formats: [{ type: "REGULAR 2D", price: 50000, times: [{t:"13:00", s:"Tersedia"}, {t:"15:30", s:"Cepat!"}, {t:"20:00", s:"Tersedia"}] }, { type: "THE PREMIERE", price: 100000, times: [{t:"14:15", s:"Tersedia"}, {t:"18:45", s:"Cepat!"}] }] 
        },
        { 
            id: "M02", title: "Forgotten Island", genre: "Adventure, Comedy", rate: "⭐ 8.4", age: "SU",             poster: "../img/Forgotten_Island.webp",
            fallbackImg: getFallback("Forgotten Island"), 
            formats: [{ type: "REGULAR 2D", price: 40000, times: [{t:"10:00", s:"Tersedia"}, {t:"12:15", s:"Tersedia"}, {t:"14:30", s:"Cepat!"}, {t:"FULL", s:"Habis"}] }] 
        },
        { 
            id: "M03", title: "Fall 2: Deadpoint", genre: "Thriller, Survival", rate: "⭐ 8.7", age: "17+", 
            poster: "../img/Fall_2.webp",
            fallbackImg: getFallback("Fall 2"), 
            formats: [{ type: "REGULAR 2D", price: 45000, times: [{t:"16:00", s:"Tersedia"}, {t:"18:30", s:"Cepat!"}, {t:"21:00", s:"Tersedia"}] }] 
        },
        { 
            id: "M04", title: "Digger", genre: "Drama, Action", rate: "⭐ 8.2", age: "13+", 
            poster: "../img/Digger.webp",
            fallbackImg: getFallback("Digger"), 
            formats: [{ type: "REGULAR 2D", price: 45000, times: [{t:"11:30", s:"Tersedia"}, {t:"14:00", s:"Cepat!"}] }] 
        },
        { 
            id: "M05", title: "Memburu Pemangsa", genre: "Action, Crime", rate: "⭐ 9.4", age: "17+", 
            poster: "https://www.jadwalnonton.com/data/images/movies/2026/Poster-Memburu-Pemangsa-vc_300x450.webp",
            fallbackImg: getFallback("Memburu"), 
            formats: [{ type: "REGULAR 2D", price: 45000, times: [{t:"12:20", s:"Tersedia"}, {t:"14:45", s:"Tersedia"}, {t:"FULL", s:"Habis"}] }] 
        },
        { 
            id: "M06", title: "Avengers Endgame: Encore", genre: "Action, Sci-Fi", rate: "⭐ 9.7", age: "13+", 
            poster: "https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg", 
            fallbackImg: getFallback("Avengers"), 
            formats: [{ type: "IMAX 2D", price: 75000, times: [{t:"11:00", s:"Tersedia"}, {t:"15:00", s:"Cepat!"}, {t:"19:00", s:"Tersedia"}] }] 
        },
        { 
            id: "M07", title: "The Last Frontier", genre: "Sci-Fi, Adventure", rate: "⭐ 9.1", age: "13+", 
            poster: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&h=450&q=80",
            fallbackImg: getFallback("The Last Frontier"), 
            formats: [{ type: "REGULAR 2D", price: 45000, times: [{t:"13:15", s:"Tersedia"}, {t:"15:45", s:"Tersedia"}, {t:"18:15", s:"Cepat!"}, {t:"20:45", s:"Tersedia"}] }] 
        }
    ];
    const BOOKING_FILM_KEYS = {
        "Resident Evil": "resident-evil",
        "Forgotten Island": "forgotten-island",
        "Fall 2: Deadpoint": "fall-2-deadpoint",
        "Digger": "digger",
        "Memburu Pemangsa": "memburu-pemangsa",
        "Avengers Endgame: Encore": "avengers-endgame-encore",
        "The Last Frontier": "last-frontier"
    };

    const REGIONS = ["JAKARTA", "BOGOR", "DEPOK", "TANGERANG", "BANDUNG"];
    let state = { region: "JAKARTA", cinema: null, dateIndex: 0, facilityFilter: 'all' };

    const RAW_CINEMAS = [
        { name: "AEON MALL JGC CGV", reg: "JAKARTA", addr: "Cakung, Jakarta Timur", tags: ["CGV", "Satin Class"] },
        { name: "AGORA MALL IMAX", reg: "JAKARTA", addr: "Kuningan, Jakarta Pusat", tags: ["IMAX", "Laser Projection"] },
        { name: "AGORA MALL PREMIERE", reg: "JAKARTA", addr: "Kuningan, Jakarta Pusat", tags: ["The Premiere", "Lounge"] },
        { name: "AGORA MALL XXI", reg: "JAKARTA", addr: "Kuningan, Jakarta Pusat", tags: ["XXI", "Cafe"] },
        { name: "ARION XXI", reg: "JAKARTA", addr: "Rawamangun, Jakarta Timur", tags: ["XXI", "Snack Bar"] },
        { name: "BAYWALK PLUIT PREMIERE", reg: "JAKARTA", addr: "Pluit, Jakarta Utara", tags: ["The Premiere", "Lounge"] },
        { name: "KELAPA GADING IMAX", reg: "JAKARTA", addr: "Kelapa Gading, Jakarta Utara", tags: ["IMAX", "Dolby Atmos"] },
        { name: "PONDOK INDAH MALL XXI", reg: "JAKARTA", addr: "Pondok Indah, Jakarta Selatan", tags: ["XXI", "The Premiere"] },
        { name: "MARGO CITY XXI", reg: "DEPOK", addr: "Pondok Cina, Depok", tags: ["XXI", "Cafe"] },
        { name: "DEPOK PREMIERE", reg: "DEPOK", addr: "Pondok Cina, Depok", tags: ["The Premiere", "Lounge"] },
        { name: "BOTANI SQUARE XXI", reg: "BOGOR", addr: "Baranangsiang, Bogor", tags: ["XXI", "Cafe"] },
        { name: "BTM BOGOR CGV", reg: "BOGOR", addr: "Paledang, Bogor", tags: ["CGV", "Sweetbox"] },
        { name: "AEON MALL BSD CITY XXI", reg: "TANGERANG", addr: "Pagedangan, Tangerang", tags: ["XXI", "IMAX"] },
        { name: "SUPERMALL KARAWACI XXI", reg: "TANGERANG", addr: "Kelapa Dua, Tangerang", tags: ["XXI", "The Premiere"] },
        { name: "CIWALK XXI", reg: "BANDUNG", addr: "Cihampelas, Bandung", tags: ["XXI", "The Premiere"] }
    ];

    const DB_CINEMAS = {};
    RAW_CINEMAS.forEach(c => {
        let shuffled = [...DB_MOVIES].sort(() => 0.5 - Math.random());
        let dist = (Math.random() * 15 + 1).toFixed(1);
        DB_CINEMAS[c.name] = { ...c, distance: dist, movies: shuffled.slice(0, 6) };
    });

    const storageKey = 'tix_fav_cinemas_v5';
    function getFavs() { return JSON.parse(localStorage.getItem(storageKey) || '[]'); }
    function saveFavs(arr) { localStorage.setItem(storageKey, JSON.stringify(arr)); }

    function showToast(msg) {
        const $t =$('#toastNotification');
        $('#toastMessage').text(msg);
        $t.addClass('show');
        setTimeout(() => $t.removeClass('show'), 3000);
    }

    function toggleFavorite(cinemaName) {
        let favs = getFavs();
        if(favs.includes(cinemaName)) {
            favs = favs.filter(n => n !== cinemaName);
            showToast(`${cinemaName} dihapus dari daftar favorit.`);
        } else {
            favs.push(cinemaName);
            showToast(`${cinemaName} ditambahkan ke favorit.`);
        }
        saveFavs(favs);
        renderCinemaList($('#searchInput').val());
        updateHeroState();
    }

    function formatCurrency(amount) {
        return "Rp " + amount.toLocaleString('id-ID');
    }

    function renderRegions() {
        const html = REGIONS.map(r => `<button class="tab-btn ${r === state.region ? 'active' : ''}" data-reg="${r}">${r}</button>`).join('');
        $('#regionTabs').html(html);
    }

    function renderDates() {
        const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
        let html = '';
        for(let i=0; i<7; i++) {
            let d = new Date(SYSTEM_DATE);
            d.setDate(SYSTEM_DATE.getDate() + i);
            let dayIdx = d.getDay();
            let isWeekend = (dayIdx === 0 || dayIdx === 6);
            let dayLabel = i === 0 ? 'HARI INI' : days[dayIdx];
            let dateStr = `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`;
            let classes = ['d-btn'];
            if(i === state.dateIndex) classes.push('active');
            if(isWeekend) classes.push('weekend-btn');
            html += `<button class="${classes.join(' ')}" data-idx="${i}"><strong>${dayLabel}</strong><span>${dateStr}</span></button>`;
        }
        $('#dateSlider').html(html);
    }

    function renderCinemaList(query = "") {
        const favs = getFavs();
        const filtered = Object.keys(DB_CINEMAS).filter(name => {
            const c = DB_CINEMAS[name];
            if(c.reg !== state.region) return false;
            const q = query.toLowerCase();
            const matchSearch = name.toLowerCase().includes(q) || c.addr.toLowerCase().includes(q);
            if(!matchSearch) return false;
            if(state.facilityFilter !== 'all') {
                return c.tags.some(tag => tag.includes(state.facilityFilter));
            }
            return true;
        });

        filtered.sort((a, b) => {
            let aF = favs.includes(a), bF = favs.includes(b);
            if(aF && !bF) return -1;
            if(!aF && bF) return 1;
            return a.localeCompare(b);
        });

        $('#cinemaCountBadge').text(`${filtered.length} Bioskop`);

        if(filtered.length === 0) {
            $('#cinemaList').html(`<div style="padding:40px 20px; text-align:center; color:var(--text-secondary); font-weight:600; font-size:13px;">Maaf, tidak ada bioskop.</div>`);
            return;
        }

        const html = filtered.map(name => {
            const isF = favs.includes(name);
            const isA = name === state.cinema;
            const c = DB_CINEMAS[name];
            return `
                <div class="c-item ${isA ? 'active' : ''}" data-name="${name}">
                    <button class="c-star ${isF ? 'is-fav' : ''}" data-name="${name}">
                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                    <div class="c-info">
                        <h3>${name}</h3>
                        <div class="c-addr-row">
                            <p>${c.addr}</p>
                            <span class="c-dist">📍 ${c.distance} km</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $('#cinemaList').html(html);
        if(!state.cinema && filtered.length > 0) loadDashboard(filtered[0]);
    }

    function loadDashboard(cinemaName) {
        if(!DB_CINEMAS[cinemaName]) return;
        state.cinema = cinemaName;
        const c = DB_CINEMAS[cinemaName];

        $('#dashTitle').text(cinemaName);
        $('#dashAddress').text(c.addr);
        $('#dashTags').html(c.tags.map(t => `<span class="tag">${t}</span>`).join(''));
        
        $('.c-item').removeClass('active');$(`.c-item[data-name="${cinemaName}"]`).addClass('active');
        
        updateHeroState();
        renderScheduleLogic();
    }

    function renderScheduleLogic() {
        $('#movieList').empty();
        $('#emptyState').hide();
        $('#promoBanner').hide();
        $('#loadingState').fadeIn(150);

        setTimeout(() => {
            $('#loadingState').hide();
            if(state.dateIndex >= 4) {
                $('#emptyState').fadeIn(200);
                return;
            }

            const c = DB_CINEMAS[state.cinema];
            let selectedDateObj = new Date(SYSTEM_DATE);
            selectedDateObj.setDate(SYSTEM_DATE.getDate() + state.dateIndex);
            const dateValue = [selectedDateObj.getFullYear(), String(selectedDateObj.getMonth() + 1).padStart(2, '0'), String(selectedDateObj.getDate()).padStart(2, '0')].join('-');
            let dayIdx = selectedDateObj.getDay();
            let isWeekend = (dayIdx === 0 || dayIdx === 6);

            if(isWeekend) $('#promoBanner').fadeIn(200);

            const html = c.movies.map((m, index) => {
                const formatsHtml = m.formats.map(f => {
                    let basePrice = f.price;
                    if(isWeekend) basePrice += 15000; 
                    let priceFormatted = formatCurrency(basePrice);
                    let priceClass = isWeekend ? 'f-price weekend-price' : 'f-price';

                    const timesHtml = f.times.map(timeObj => {
                        const isFull = timeObj.t === 'FULL';
                        const statusClass = timeObj.s === 'Cepat!' ? 'fast' : (isFull ? 'full' : '');
                        const params = new URLSearchParams({
                            film: BOOKING_FILM_KEYS[m.title] || 'resident-evil',
                            bioskop: state.cinema,
                            tanggal: dateValue,
                            jam: timeObj.t,
                            harga: String(basePrice),
                            kota: state.region
                        });
                        const action = isFull ? '' : `onclick="window.location.href='../Pemesanan-Tiket/index.html?${params.toString()}'"`;
                        
                        return `
                            <div class="t-btn-wrapper">
                                <button class="t-btn" ${isFull ? 'disabled' : ''} ${action}>${timeObj.t}</button>
                                <span class="t-status ${statusClass}">${timeObj.s}</span>
                            </div>
                        `;
                    }).join('');

                    return `
                        <div class="format-group">
                            <div class="f-row">
                                <span class="f-type">${f.type}</span>
                                <span class="${priceClass}">${priceFormatted}</span>
                            </div>
                            <div class="time-grid">${timesHtml}</div>
                        </div>
                    `;
                }).join('');

                
                return `
                    <div class="m-item" style="animation-delay: ${index * 0.1}s">
                        <img src="${m.poster}" onerror="this.onerror=null; this.src='${m.fallbackImg}';" class="m-poster" alt="${m.title}">
                        <div class="m-info">
                            <div class="m-header-row">
                                <h3>${m.title}</h3>
                                <button class="btn-trailer" data-title="${m.title}">
                                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Trailer
                                </button>
                            </div>
                            <div class="m-badges">
                                <span class="badge b-rate">${m.rate}</span>
                                <span class="badge b-age">${m.age}</span>
                            </div>
                            <p class="m-genre">${m.genre}</p>
                            ${formatsHtml}
                        </div>
                    </div>
                `;
            }).join('');

            $('#movieList').html(html);
        }, 500);
    }

    function updateHeroState() {
        const isF = getFavs().includes(state.cinema);
        $('#btnToggleFav').toggleClass('is-fav', isF).find('span').text(isF ? 'Favorit' : 'Jadikan Favorit');
    }
    
    $(document).on('click', '.tab-btn', function() {
        $('.tab-btn').removeClass('active');$(this).addClass('active');
        state.region = $(this).data('reg');$('#currentCityLabel').text(state.region.charAt(0) + state.region.slice(1).toLowerCase());
        $('#searchInput').val('');
        $('#clearSearchBtn').hide();
        state.cinema = null;
        renderCinemaList();
    });

    $('.f-filter-btn').click(function() {
        $('.f-filter-btn').removeClass('active');$(this).addClass('active');
        state.facilityFilter = $(this).data('filter');
        renderCinemaList($('#searchInput').val());
    });

    let searchTimeout;
    $('#searchInput').on('input', function() {
        const val = $(this).val();$('#clearSearchBtn').toggle(val.length > 0);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => renderCinemaList(val), 250);
    });

    $('#clearSearchBtn').click(function() {
        $('#searchInput').val('').trigger('input');
        $(this).hide();
    });

    $(document).on('click', '.c-item', function(e) {
        if($(e.target).closest('.c-star').length) return;
        loadDashboard($(this).data('name'));
    });

    $(document).on('click', '.c-star', function(e) {
        e.stopPropagation();
        toggleFavorite($(this).data('name'));
    });

    $('#btnToggleFav').click(() => { if(state.cinema) toggleFavorite(state.cinema); });

    $(document).on('click', '.d-btn', function() {
        if($(this).hasClass('active')) return;
        state.dateIndex = parseInt($(this).data('idx'));
        renderDates(); 
        if(state.cinema) renderScheduleLogic();
    });

    $('.promo-close').click(function() {$(this).parent().fadeOut(200); });

    $('#btnShare').click(function() {
        if(!state.cinema) return;
        const shareData = { title: 'TIX ID - Jadwal Tayang', text: `Yuk, nonton film seru di ${state.cinema}! Cek jadwal lengkapnya sekarang.`, url: window.location.href };
        if (navigator.share) { navigator.share(shareData).catch(err => console.log(err)); } 
        else { navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); showToast('Tautan jadwal telah disalin!'); }
    });

    $(document).on('click', '.btn-trailer', function() {
        const title = $(this).data('title');$('#trailerTitle').text(`Trailer: ${title}`);
        $('#trailerModal').addClass('active');
    });

    $('#closeTrailer, .modal-overlay').click(function(e) {
        if(e.target === this) {
            $('#trailerModal').removeClass('active');
        }
    });

    renderRegions();
    renderDates();
    renderCinemaList();
});
