
/*
 * OPTIONAL INTEGRATION HOOK
 * Load this AFTER fitur-pendukung/script.js.
 * It makes the existing Login/Register modal use the account system in page/script.js
 * without editing the original script.js.
 */
(function () {
  const form = document.getElementById('auth-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const isRegister = document.getElementById('tab-register').getAttribute('aria-selected') === 'true';
    const email = document.getElementById('auth-contact').value.trim().toLowerCase();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();

    let users = JSON.parse(localStorage.getItem('tix_users') || '[]');

    if (isRegister) {
      if (!name) { alert('Nama lengkap wajib diisi.'); return; }
      if (users.some(u => u.email === email)) {
        alert('Email sudah terdaftar. Silakan login.');
        return;
      }
      users.push({name, email, password, city:'Jakarta'});
      localStorage.setItem('tix_users', JSON.stringify(users));
      localStorage.setItem('tix_current_user', email);
      window.location.href = '../page/profile.html';
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Akun tidak ditemukan atau kata sandi salah. Silakan Register terlebih dahulu.');
        return;
      }
      localStorage.setItem('tix_current_user', email);
      window.location.href = '../page/profile.html';
    }
  }, true);
})();
