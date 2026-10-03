(() => {
  function ensureAuthElements() {
    const nav = document.querySelector('.nav');
    let accountControls = document.querySelector('.auth-controls, .nav-actions');

    if (!accountControls && nav) {
      accountControls = document.createElement('div');
      accountControls.className = 'auth-controls';
      nav.append(accountControls);
    }

    if (accountControls && !document.querySelector('[data-open-auth]')) {
      const openButton = document.createElement('button');
      openButton.className = 'login';
      openButton.type = 'button';
      openButton.dataset.openAuth = '';
      openButton.textContent = 'Login';
      accountControls.append(openButton);
    }

    if (accountControls && !document.getElementById('auth-user')) {
      const accountName = document.createElement('span');
      accountName.className = 'auth-user';
      accountName.id = 'auth-user';
      accountName.setAttribute('aria-live', 'polite');
      accountName.hidden = true;
      accountControls.append(accountName);
    }

    if (accountControls && !document.getElementById('auth-logout')) {
      const logoutButton = document.createElement('button');
      logoutButton.className = 'login';
      logoutButton.id = 'auth-logout';
      logoutButton.type = 'button';
      logoutButton.textContent = 'Keluar';
      logoutButton.hidden = true;
      accountControls.append(logoutButton);
    }

    if (!document.getElementById('auth-modal')) {
      const modal = document.createElement('div');
      modal.className = 'backdrop';
      modal.id = 'auth-modal';
      modal.setAttribute('role', 'presentation');
      modal.innerHTML = `
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <button class="close" type="button" aria-label="Tutup dialog">×</button>
          <a class="brand" href="../fitur-pendukung/index.html" aria-label="TIX ID"><span class="brand-tix">TIX</span><span class="brand-id">ID</span></a>
          <h2 id="auth-title">Selamat datang!</h2>
          <p class="subtitle">Masuk untuk melanjutkan pengalaman nontonmu.</p>
          <form class="auth-form" id="auth-form">
            <label class="auth-field">Email<input id="auth-contact" type="text" autocomplete="email" placeholder="nama@email.com" required></label>
            <label class="auth-field">Kata sandi<input id="auth-password" type="password" autocomplete="current-password" placeholder="Masukkan kata sandi" required></label>
            <button class="auth-submit" type="submit" id="auth-submit">Login</button>
          </form>
          <p class="legal">Dengan melanjutkan, kamu menyetujui Syarat &amp; Ketentuan serta Kebijakan Privasi TIX ID.</p>
        </section>`;
      document.body.append(modal);
    }

    if (!document.getElementById('toast')) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.id = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.append(toast);
    }
  }

  ensureAuthElements();

  const modal = document.getElementById('auth-modal');
  const form = document.getElementById('auth-form');
  const toast = document.getElementById('toast');
  const accountName = document.getElementById('auth-user');
  const logoutButton = document.getElementById('auth-logout');
  const contactInput = document.getElementById('auth-contact');
  const passwordInput = document.getElementById('auth-password');
  const storageKey = 'cinema-booking-user';
  let toastTimer;

  document.querySelector('.tabs')?.remove();
  document.getElementById('name-field')?.remove();
  contactInput.type = 'text';
  contactInput.autocomplete = 'email';
  contactInput.parentElement.firstChild.textContent = 'Email';
  passwordInput.removeAttribute('minlength');
  passwordInput.placeholder = 'Masukkan kata sandi';
  document.querySelector('.subtitle').textContent = 'Masuk untuk melanjutkan pengalaman nontonmu.';

  function showMessage(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  function updateAccount(user) {
    const isLoggedIn = Boolean(user);
    accountName.hidden = !isLoggedIn;
    logoutButton.hidden = !isLoggedIn;
    document.querySelectorAll('[data-open-auth]').forEach((button) => {
      button.hidden = isLoggedIn;
    });
    accountName.textContent = isLoggedIn ? `Hai, ${user.email}` : '';
  }

  function openModal() {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('auth-contact').focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-auth]').forEach((button) => {
    button.addEventListener('click', openModal);
  });
  document.querySelector('.close').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = contactInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password.trim()) {
      showMessage('Email dan kata sandi wajib diisi.');
      return;
    }

    localStorage.setItem(storageKey, email);
    updateAccount({ email });
    showMessage(`Login berhasil. Selamat datang, ${email}.`);
    form.reset();
    closeModal();
  });

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    updateAccount(null);
    showMessage('Kamu berhasil keluar.');
  });

  const savedEmail = localStorage.getItem(storageKey);
  updateAccount(savedEmail ? { email: savedEmail } : null);
})();
