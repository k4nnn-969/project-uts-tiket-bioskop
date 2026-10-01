
const USERS_KEY = 'tix_users';
const CURRENT_USER_KEY = 'tix_current_user';
const ORDERS_KEY = 'tix_orders';

function getUsers(){ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getOrders(){ return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }
function currentEmail(){ return localStorage.getItem(CURRENT_USER_KEY); }
function currentUser(){ return getUsers().find(u => u.email === currentEmail()); }

function requireLogin(){
  if(!currentEmail()){
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}
function initials(name='User'){
  return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
}
function money(n){ return `Rp ${Number(n||0).toLocaleString('id-ID')}`; }
function esc(v=''){ return String(v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function toast(msg){
  let el=document.querySelector('.toast');
  if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}
  el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200);
}

function setupAuth(){
  let mode='login';
  const loginTab=document.getElementById('login-tab'), regTab=document.getElementById('register-tab');
  const title=document.getElementById('auth-title'), nameField=document.getElementById('name-field');
  const name=document.getElementById('name'), email=document.getElementById('email'), password=document.getElementById('password');
  const message=document.getElementById('auth-message'), submit=document.getElementById('submit-btn');
  function setMode(m){
    mode=m; const reg=m==='register';
    loginTab.classList.toggle('active',!reg);regTab.classList.toggle('active',reg);
    nameField.hidden=!reg;name.required=reg;title.textContent=reg?'Buat akun TIX ID':'Selamat datang!';
    submit.textContent=reg?'Register':'Login';message.innerHTML='';
  }
  loginTab.onclick=()=>setMode('login');regTab.onclick=()=>setMode('register');
  document.getElementById('auth-form').onsubmit=e=>{
    e.preventDefault(); message.innerHTML='';
    const mail=email.value.trim().toLowerCase(), pass=password.value;
    const users=getUsers();
    if(mode==='register'){
      if(users.some(u=>u.email===mail)){message.innerHTML='<div class="alert error">Email sudah terdaftar. Silakan login.</div>';return}
      const user={name:name.value.trim(),email:mail,password:pass,city:'Jakarta'};
      users.push(user);saveUsers(users);localStorage.setItem(CURRENT_USER_KEY,mail);
      message.innerHTML='<div class="alert success">Registrasi berhasil. Mengarahkan ke profile...</div>';
      setTimeout(()=>location.href='profile.html',500);
    }else{
      const user=users.find(u=>u.email===mail&&u.password===pass);
      if(!user){message.innerHTML='<div class="alert error">Email atau kata sandi salah. Jika belum punya akun, silakan Register.</div>';return}
      localStorage.setItem(CURRENT_USER_KEY,user.email);
      location.href='profile.html';
    }
  };
}

function setupProfile(){
  if(!requireLogin())return;
  const user=currentUser(); if(!user){localStorage.removeItem(CURRENT_USER_KEY);location.href='auth.html';return}
  const render=()=>{
    document.getElementById('avatar').textContent=initials(user.name);
    document.getElementById('profile-name').textContent=user.name;
    document.getElementById('profile-email').textContent=user.email;
    document.getElementById('profile-city').textContent='Kota: '+(user.city||'Jakarta');
  };
  render();
  document.getElementById('edit-btn').onclick=()=>{
    document.getElementById('edit-card').style.display='block';
    document.getElementById('edit-name').value=user.name;
    document.getElementById('edit-city').value=user.city||'Jakarta';
  };
  document.getElementById('cancel-edit').onclick=()=>document.getElementById('edit-card').style.display='none';
  document.getElementById('profile-form').onsubmit=e=>{
    e.preventDefault();user.name=document.getElementById('edit-name').value.trim();user.city=document.getElementById('edit-city').value;
    const users=getUsers().map(u=>u.email===user.email?user:u);saveUsers(users);render();
    document.getElementById('edit-card').style.display='none';toast('Profile berhasil diperbarui.');
  };
  document.getElementById('logout-btn').onclick=()=>{localStorage.removeItem(CURRENT_USER_KEY);location.href='../fitur-pendukung/index.html'};
}

function myPaidOrders(){
  return getOrders().filter(o=>o.email===currentEmail() && o.status==='PAID').sort((a,b)=>new Date(b.paidAt||b.createdAt)-new Date(a.paidAt||a.createdAt));
}
function emptyBlock(title,text,linkText='Pesan Tiket'){
  return `<div class="card empty"><div class="empty-icon">🎟️</div><h3>${title}</h3><p>${text}</p><div class="actions" style="justify-content:center"><a class="btn primary" href="../Bioskop-Jadwal/cinemas.html">${linkText}</a></div></div>`;
}
function setupHistory(){
  if(!requireLogin())return;
  const list=document.getElementById('history-list'),orders=myPaidOrders();
  if(!orders.length){list.innerHTML=emptyBlock('Belum ada pemesanan','Riwayat pemesanan akan muncul setelah kamu selesai melakukan pembayaran.');return}
  list.innerHTML=orders.map(o=>`<article class="card history-item">
    <div class="history-top"><div><p class="kicker">Pesanan ${esc(o.id)}</p><h2 class="movie-title">${esc(o.movie||'Film')}</h2></div><span class="status">Pembayaran berhasil</span></div>
    <div class="history-meta">
      <div class="meta-box"><span>TANGGAL</span><strong>${esc(o.date||'-')}</strong></div>
      <div class="meta-box"><span>JAM</span><strong>${esc(o.time||'-')}</strong></div>
      <div class="meta-box"><span>KURSI</span><strong>${esc((o.seats||[]).join(', ')||'-')}</strong></div>
    </div>
    <div class="meta-box"><span>TOTAL</span><strong>${money(o.total)}</strong></div>
    <div class="actions"><a class="btn primary" href="eticket.html">Lihat E-Ticket</a></div>
  </article>`).join('');
}

function setupEticket(){
  if(!requireLogin())return;
  const list=document.getElementById('ticket-list'),orders=myPaidOrders();
  if(!orders.length){list.innerHTML=emptyBlock('E-Ticket belum tersedia','E-Ticket baru akan muncul setelah pembayaran pesanan berhasil.');return}
  list.innerHTML=orders.map(o=>`<article class="card ticket-card">
    <div class="ticket-head"><p class="kicker">E-TICKET TIX ID</p><h2>${esc(o.movie||'Film')}</h2></div>
    <div class="ticket-body">
      <div class="ticket-grid">
        <div class="ticket-row"><span>ORDER ID</span><strong>${esc(o.id)}</strong></div>
        <div class="ticket-row"><span>BIOSKOP</span><strong>${esc(o.cinema||'-')}</strong></div>
        <div class="ticket-row"><span>TANGGAL</span><strong>${esc(o.date||'-')}</strong></div>
        <div class="ticket-row"><span>JAM</span><strong>${esc(o.time||'-')}</strong></div>
        <div class="ticket-row"><span>KURSI</span><strong>${esc((o.seats||[]).join(', ')||'-')}</strong></div>
        <div class="ticket-row"><span>TOTAL</span><strong>${money(o.total)}</strong></div>
      </div>
      <div class="qr">QR<br>${esc(o.id)}</div>
      <p style="text-align:center;color:var(--muted);font-size:10px;margin:0">Tunjukkan E-Ticket ini saat masuk studio.</p>
    </div>
  </article>`).join('');
}

document.addEventListener('DOMContentLoaded',()=>{
  const page=document.body.dataset.page;
  if(page==='auth')setupAuth();
  if(page==='profile')setupProfile();
  if(page==='history')setupHistory();
  if(page==='eticket')setupEticket();
});
