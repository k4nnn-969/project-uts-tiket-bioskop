$(document).ready(function() {
    'use strict';
    const SYSTEM_DATE = new Date('2026-10-04'); 
    
    function initTheme() {
        const savedTheme = localStorage.getItem('tix_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    /**
     * @param {string} 
     */
    function updateThemeIcon(theme) {
        if(theme === 'dark') {
            $('.sun-icon').hide();$('.moon-icon').show();
        } else {
            $('.sun-icon').show();$('.moon-icon').hide();
        }
    }

    $('#themeToggle').on('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('tix_theme', newTheme);
        updateThemeIcon(newTheme);
    });

    initTheme();

    const DB_MOVIES = [
        { id: "M01", title: "Resident Evil", genre: "Horror, Thriller", rate: "⭐ 9.0", age: "17+", poster: "../image/resident-evil.jpg", fallbackImg: "https://images.unsplash.com/photo-1505699261379-94cf1d8848fa?w=300&q=80", formats: [{ type: "REGULAR 2D", price: 50000, times: ["13:00", "15:30", "20:00"] }, { type: "THE PREMIERE", price: 100000, times: ["14:15", "18:45"] }] },
        { id: "M02", title: "Forgotten Island", genre: "Adventure, Comedy", rate: "⭐ 8.4", age: "SU", poster: "../image/forgotten-island.jpg", fallbackImg: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80", formats: [{ type: "REGULAR 2D", price: 40000, times: ["10:00", "12:15", "14:30", "FULL"] }] },
        { id: "M03", title: "Fall 2: Deadpoint", genre: "Thriller, Survival", rate: "⭐ 8.7", age: "17+", poster: "../image/fall-2.jpg", fallbackImg: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=300&q=80", formats: [{ type: "REGULAR 2D", price: 45000, times: ["16:00", "18:30", "21:00"] }] },
        { id: "M04", title: "Digger", genre: "Drama, Action", rate: "⭐ 8.2", age: "13+", poster: "../image/digger.jpg", fallbackImg: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&q=80", formats: [{ type: "REGULAR 2D", price: 45000, times: ["11:30", "14:00"] }] },
        { id: "M05", title: "Memburu Pemangsa", genre: "Action, Crime", rate: "⭐ 9.4", age: "17+", poster: "../image/memburu-pemangsa.jpg", fallbackImg: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&q=80", formats: [{ type: "REGULAR 2D", price: 45000, times: ["12:20", "14:45", "FULL"] }] },
        { id: "M06", title: "Avengers Endgame: Encore", genre: "Action, Sci-Fi", rate: "⭐ 9.7", age: "13+", poster: "../image/avengers-endgame.jpg", fallbackImg: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&q=80", formats: [{ type: "IMAX 2D", price: 75000, times: ["11:00", "15:00", "19:00"] }] },
        { id: "M07", title: "The Last Frontier", genre: "Sci-Fi, Adventure", rate: "⭐ 9.1", age: "13+", poster: "../image/the-last-frontier.jpg", fallbackImg: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&q=80", formats: [{ type: "REGULAR 2D", price: 45000, times: ["13:15", "15:45", "18:15", "20:45"] }] }
    ];

    const REGIONS = ["JAKARTA", "BOGOR", "DEPOK", "TANGERANG", "BANDUNG", "SURABAYA", "MEDAN"];
    
    // Objek State Global
    let state = { 
        region: "JAKARTA", 
        cinema: null, 
        dateIndex: 0,
        facilityFilter: 'all' 
    };

    const RAW_CINEMAS = [
        { name: "AEON MALL JGC CGV", reg: "JAKARTA", addr: "Cakung, Jakarta Timur", tags: ["CGV", "Satin Class"] },
        { name: "AGORA MALL IMAX", reg: "JAKARTA", addr: "Kuningan, Jakarta Pusat", tags: ["IMAX", "Laser Projection"] },
        { name: "AGORA MALL PREMIERE", reg: "JAKARTA", addr: "Kuningan, Jakarta Pusat", tags: ["The Premiere", "Lounge"] },
        { name: "AGORA MALL XXI", reg: "JAKARTA", addr: "Kuningan, Jakarta Pusat", tags: ["XXI", "Cafe"] },
        { name: "ARION XXI", reg: "JAKARTA", addr: "Rawamangun, Jakarta Timur", tags: ["XXI", "Snack Bar"] },
        { name: "BAYWALK PLUIT PREMIERE", reg: "JAKARTA", addr: "Pluit, Jakarta Utara", tags: ["The Premiere", "Lounge"] },
        { name: "MARGO CITY XXI", reg: "DEPOK", addr: "Pondok Cina, Depok", tags: ["XXI", "The Premiere"] }
    ];

    const DB_CINEMAS = {};
    RAW_CINEMAS.forEach(c => {
        let shuffled = [...DB_MOVIES].sort(() => 0.5 - Math.random());
    
        let dist = (Math.random() * 15 + 1).toFixed(1);
        DB_CINEMAS[c.name] = { ...c, distance: dist, movies: shuffled.slice(0, 4) };
    });

    const storageKey = 'tix_fav_cinemas_v4'; 
    
    function getFavs() { 
        return JSON.parse(localStorage.getItem(storageKey) || '[]'); 
    }
    
    function saveFavs(arr) { 
        localStorage.setItem(storageKey, JSON.stringify(arr)); 
    }

    /**
     * @param {string} 
     */
    function showToast(msg) {
        const $t =$('#toastNotification');
        $('#toastMessage').text(msg);
        $t.addClass('show');
        setTimeout(() => $t.removeClass('show'), 3000);
    }

    /**
     * @param {string}
     */
    function toggleFavorite(cinemaName) {
        let favs = getFavs();
        if(favs.includes(cinemaName)) {
            favs = favs.filter(n => n !== cinemaName);
            showToast(`${cinemaName} dihapus dari daftar favorit.`);
        } else {
            favs.push(cinemaName);
            showToast(`${cinemaName} ditambahkan ke daftar favorit.`);
        }
        saveFavs(favs);
        renderCinemaList($('#searchInput').val()); 
        updateHeroState();
    }

    /**
     * @param {number} 
     * @returns {string} 
     */
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
            
            html += `<button class="${classes.join(' ')}" data-idx="${i}" aria-label="Tanggal ${dateStr}"><strong>${dayLabel}</strong><span>${dateStr}</span></button>`;
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
                const matchFacility = c.tags.some(tag => tag.includes(state.facilityFilter));
                if(!matchFacility) return false;
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
            $('#cinemaList').html(`<div style="padding:40px 20px; text-align:center; color:var(--text-secondary); font-weight:600; font-size:13px;">Maaf, tidak ada bioskop yang sesuai dengan filter Anda.</div>`);
            return;
        }

        const html = filtered.map(name => {
            const isF = favs.includes(name);
            const isA = name === state.cinema;
            const c = DB_CINEMAS[name];
            return `
                <div class="c-item ${isA ? 'active' : ''}" data-name="${name}" role="button" tabindex="0">
                    <button class="c-star ${isF ? 'is-fav' : ''}" data-name="${name}" aria-label="Tandai ${name} sebagai Favorit">
                        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                    <div class="c-info">
                        <h3>${name}</h3>
                        <div class="c-addr-row">
                            <p>${c.addr}</p>
                            <span class="c-dist" aria-label="Jarak Lokasi">📍 ${c.distance} km</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $('#cinemaList').html(html);
        
        if(!state.cinema && filtered.length > 0) {
            loadDashboard(filtered[0]);
        }
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
            let dayIdx = selectedDateObj.getDay();
            let isWeekend = (dayIdx === 0 || dayIdx === 6);

            if(isWeekend) $('#promoBanner').fadeIn(200);

            const html = c.movies.map((m, index) => {
                const formatsHtml = m.formats.map(f => {
                    
                    let basePrice = f.price;
                    if(isWeekend) basePrice += 15000; 
                    let priceFormatted = formatCurrency(basePrice);
                    let priceClass = isWeekend ? 'f-price weekend-price' : 'f-price';

                    const timesHtml = f.times.map(t => {
                        const isFull = t === 'FULL';
                        const urlParams = `?cinema=${encodeURIComponent(state.cinema)}&movie=${encodeURIComponent(m.title)}&time=${encodeURIComponent(t)}&price=${basePrice}`;
                        const action = isFull ? '' : `onclick="window.location.href='../Pemesanan-Tiket/seats.html${urlParams}'"`;
                        
                        return `<button class="t-btn" ${isFull ? 'disabled' : ''} ${action} aria-label="Jam Tayang ${t}">${t}</button>`;
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
                        <img src="${m.poster}" onerror="this.onerror=null; this.src='${m.fallbackImg}'" class="m-poster" alt="Poster Film ${m.title}">
                        <div class="m-info">
                            <h3>${m.title}</h3>
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

    $('#btnToggleFav').click(() => { 
        if(state.cinema) toggleFavorite(state.cinema); 
    });

    $(document).on('click', '.d-btn', function() {
        if($(this).hasClass('active')) return;
        state.dateIndex = parseInt($(this).data('idx'));
        renderDates(); 
        if(state.cinema) renderScheduleLogic();
    });

    $('.promo-close').click(function() {$(this).parent().fadeOut(200);
    });

    $('#btnShare').click(function() {
        if(!state.cinema) return;
        const shareData = {
            title: 'TIX ID - Jadwal Tayang Eksklusif',
            text: `Yuk, nonton film seru di ${state.cinema}! Cek jadwal lengkapnya sekarang di TIX ID.`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch((err) => console.log('Batal membagikan', err));
        } else {
            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            showToast('Tautan jadwal telah disalin ke clipboard!');
        }
    });

    renderRegions();
    renderDates();
    renderCinemaList();
});