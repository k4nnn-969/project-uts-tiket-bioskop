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
      openButton.textContent = 'Login / Daftar';
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
          <p class="subtitle">Masuk atau buat akun untuk pengalaman nonton yang lebih personal.</p>
          <div class="tabs" role="tablist" aria-label="Login atau daftar">
            <button class="tab" type="button" role="tab" id="tab-login" aria-selected="true">Login</button>
            <button class="tab" type="button" role="tab" id="tab-register" aria-selected="false">Daftar</button>
          </div>
          <form class="auth-form" id="auth-form">
            <label class="auth-field">Email atau nomor ponsel<input id="auth-contact" type="text" autocomplete="username" placeholder="nama@email.com" required></label>
            <label class="auth-field" id="name-field" hidden>Nama lengkap<input id="auth-name" type="text" autocomplete="name" placeholder="Nama kamu"></label>
            <label class="auth-field">Kata sandi<input id="auth-password" type="password" autocomplete="current-password" placeholder="Minimal 6 karakter" minlength="6" required></label>
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

  const apiUrl = new URL('../fitur-login/api.php', document.baseURI);
  const modal = document.getElementById('auth-modal');
  const form = document.getElementById('auth-form');
  const toast = document.getElementById('toast');
  const submitButton = document.getElementById('auth-submit');
  const loginButton = document.getElementById('tab-login');
  const registerButton = document.getElementById('tab-register');
  const nameField = document.getElementById('name-field');
  const accountName = document.getElementById('auth-user');
  const logoutButton = document.getElementById('auth-logout');
  let toastTimer;

  function showMessage(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
  }

  async function sendRequest(action, data = {}) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Permintaan tidak dapat diproses.');
    }

    return result;
  }

  function updateAccount(user) {
    const isLoggedIn = Boolean(user);
    accountName.hidden = !isLoggedIn;
    logoutButton.hidden = !isLoggedIn;
    document.querySelectorAll('[data-open-auth]').forEach((button) => {
      button.hidden = isLoggedIn;
    });
    accountName.textContent = isLoggedIn ? `Hai, ${user.full_name}` : '';
  }

  function setMode(mode) {
    const isRegistering = mode === 'register';
    loginButton.setAttribute('aria-selected', String(!isRegistering));
    registerButton.setAttribute('aria-selected', String(isRegistering));
    nameField.hidden = !isRegistering;
    document.getElementById('auth-name').required = isRegistering;
    document.getElementById('auth-password').autocomplete = isRegistering
      ? 'new-password'
      : 'current-password';
    document.getElementById('auth-title').textContent = isRegistering
      ? 'Buat akun TIX ID'
      : 'Selamat datang!';
    submitButton.textContent = isRegistering ? 'Daftar sekarang' : 'Login';
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

  loginButton.addEventListener('click', () => setMode('login'));
  registerButton.addEventListener('click', () => setMode('register'));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const isRegistering = registerButton.getAttribute('aria-selected') === 'true';
    submitButton.disabled = true;

    try {
      const result = await sendRequest(isRegistering ? 'register' : 'login', {
        contact: document.getElementById('auth-contact').value,
        full_name: document.getElementById('auth-name').value,
        password: document.getElementById('auth-password').value,
      });

      updateAccount(result.user);
      showMessage(`${result.message} Selamat datang, ${result.user.full_name}.`);
      form.reset();
      setMode('login');
      closeModal();
    } catch (error) {
      showMessage(error.message || 'Tidak dapat terhubung ke layanan login.');
    } finally {
      submitButton.disabled = false;
    }
  });

  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;

    try {
      const result = await sendRequest('logout');
      updateAccount(null);
      showMessage(result.message);
    } catch (error) {
      showMessage(error.message || 'Tidak dapat keluar dari akun.');
    } finally {
      logoutButton.disabled = false;
    }
  });

  sendRequest('status')
    .then((result) => updateAccount(result.user))
    .catch(() => {});
})();
