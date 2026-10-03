// STATE & TOAST
const modal = document.getElementById('auth-modal');
const toast = document.getElementById('toast');
const cards = [...document.querySelectorAll('.movie-card')];
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

// AUTH MODAL LOGIN / REGISTER
function authMode(mode) {
  const registering = mode === 'register';
  document.getElementById('tab-login').setAttribute('aria-selected', String(!registering));
  document.getElementById('tab-register').setAttribute('aria-selected', String(registering));
  document.getElementById('name-field').hidden = !registering;
  document.getElementById('auth-name').required = registering;
  document.getElementById('auth-password').autocomplete = registering ? 'new-password' : 'current-password';
  document.getElementById('auth-title').textContent = registering ? 'Buat akun TIX ID' : 'Selamat datang!';
  document.getElementById('auth-submit').textContent = registering ? 'Daftar sekarang' : 'Login';
}

function openAuth() {
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  document.getElementById('auth-contact').focus();
}

function closeAuth() {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-open-auth]').forEach(button => button.addEventListener('click', openAuth));
document.querySelector('.close').addEventListener('click', closeAuth);
modal.addEventListener('click', event => { if (event.target === modal) closeAuth(); });

document.getElementById('tab-login').addEventListener('click', () => authMode('login'));
document.getElementById('tab-register').addEventListener('click', () => authMode('register'));

document.getElementById('auth-form').addEventListener('submit', event => {
  event.preventDefault();
  notify(document.getElementById('tab-register').getAttribute('aria-selected') === 'true' 
    ? 'Form pendaftaran siap. Hubungkan ke layanan akun untuk aktivasi.' 
    : 'Form login siap. Hubungkan ke layanan akun untuk melanjutkan.');
  closeAuth();
});

// COPY PROMO CODE
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const code = button.dataset.copy;
  try {
    await navigator.clipboard.writeText(code);
    notify(`Kode ${code} berhasil disalin.`);
  } catch {
    notify(`Gunakan kode promo: ${code}`);
  }
}));

// FILTER GENRE
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const genre = button.dataset.filter;
  let count = 0;
  cards.forEach(card => {
    const visible = genre === 'all' || card.dataset.genre === genre;
    card.hidden = !visible;
    if (visible) count++;
  });
  document.getElementById('empty-state').style.display = count ? 'none' : 'block';
}));

// REMINDER BUTTON (Hanya untuk tombol .remind di bagian Segera Tayang)
document.querySelectorAll('.remind[data-reminder]').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const active = button.classList.toggle('is-set');
    button.textContent = active ? '✓ Pengingat aktif' : '♧  Ingatkan saya';
    notify(active ? `Pengingat ${button.dataset.reminder} diaktifkan.` : 'Pengingat dinonaktifkan.');
  });
});

// BUY BUTTON (Navigasi ke Pemesanan Tiket)
document.querySelectorAll('.buy').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation(); // Mencegah klik memicu event lain
    const filmKey = button.getAttribute('data-film') || 'resident-evil';
    window.location.href = `../Pemesanan-Tiket/index.html?film=${filmKey}`;
  });
});

// CITY SELECT & SEARCH
document.getElementById('city-select').addEventListener('change', event => {
  document.getElementById('current-city').textContent = event.target.value;
  notify(`Kota diubah ke ${event.target.value}.`);
});

document.getElementById('search-form').addEventListener('submit', event => {
  event.preventDefault();
  const query = document.getElementById('movie-search').value.trim().toLowerCase();
  let count = 0;
  cards.forEach(card => {
    const visible = !query || card.dataset.title.includes(query);
    card.hidden = !visible;
    if (visible) count++;
  });
  document.getElementById('empty-state').style.display = count ? 'none' : 'block';
  document.getElementById('segera-tayang').scrollIntoView({ behavior: 'smooth' });
});

// NAVBAR MOBILE MENU
const menu = document.querySelector('.menu');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  document.getElementById('main-nav').classList.toggle('open', !expanded);
});

document.querySelectorAll('#main-nav a').forEach(link => link.addEventListener('click', () => {
  document.getElementById('main-nav').classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

document.getElementById('location-button').addEventListener('click', () => {
  document.getElementById('city-select').focus();
  document.getElementById('cari-film').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (detailModal.classList.contains('is-open')) closeMovieDetail();
    if (modal.classList.contains('is-open')) closeAuth();
  }
});

// FILTER GENRE FIX
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const genre = button.dataset.filter;
    let count = 0;

    const movieCards = document.querySelectorAll('.movie-card');

    movieCards.forEach(card => {
      const matches = genre === 'all' || card.dataset.genre === genre;
      
      if (matches) {
        card.style.display = '';
        card.removeAttribute('hidden');
        count++;
      } else {
        card.style.display = 'none';
        card.setAttribute('hidden', 'true');
      }
    });

    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
      emptyState.style.display = count ? 'none' : 'block';
    }
  });
});