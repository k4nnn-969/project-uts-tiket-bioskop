(() => {
  const apiUrl = '../fitur-login/api.php';
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
