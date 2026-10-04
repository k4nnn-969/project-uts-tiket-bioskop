
INTEGRASI FITUR AKUN TIX ID
===========================

File utama:
- auth.html
- profile.html
- history.html
- eticket.html
- style.css
- script.js

Penyimpanan browser:
- tix_users          -> akun register
- tix_current_user   -> email user yang sedang login
- tix_orders         -> tiket yang sudah PAID

1. LOGIN / REGISTER DARI HALAMAN UTAMA
---------------------------------------
Teman punya script login sendiri di fitur-pendukung/script.js.
Agar tidak perlu mengedit script teman, tambahkan SATU baris script
setelah script teman pada fitur-pendukung/index.html:

<script src="../page/account-home-hook.js"></script>

Letakkan setelah:
<script src="script.js"></script>

Dengan begitu form Login/Register yang sudah ada akan menyimpan akun
ke localStorage dan mengarahkan user ke page/profile.html.

2. PAYMENT -> HISTORY & E-TICKET
--------------------------------
Tambahkan SATU baris setelah payment.js pada Pemesanan/payment.html:

<script src="payment.js"></script>
<script src="../page/payment-success-hook.js"></script>

Hook berjalan pada capture phase sehingga data pesanan disimpan sebelum
script payment lama menjalankan localStorage.clear().

CATATAN:
Agar nama film/bioskop/jam/tanggal tampil sesuai pesanan, halaman pemesanan
dapat menyimpan key berikut sebelum masuk pembayaran:

localStorage.setItem('selectedMovie', 'The Last Frontier');
localStorage.setItem('selectedCinema', 'Senayan City XXI');
localStorage.setItem('selectedDate', '12 Oktober 2026');
localStorage.setItem('selectedTime', '12:30');

Kalau key tersebut belum ada, hook tetap bekerja dan memakai nilai default.

3. ALUR USER
------------
Belum punya akun
  -> Register
  -> otomatis login
  -> Profile

Sudah punya akun
  -> Login
  -> Profile

Belum ada pembayaran berhasil
  -> History: "Belum ada pemesanan"
  -> E-Ticket: "E-Ticket belum tersedia"

Pembayaran berhasil
  -> data masuk tix_orders dengan status PAID
  -> muncul di History
  -> muncul di E-Ticket

4. PENTING
----------
Fitur ini memakai localStorage karena project saat ini adalah frontend
tanpa backend/database. Password juga tersimpan di localStorage sehingga
ini hanya cocok untuk demo/UTS, bukan aplikasi produksi.

Tema halaman dibuat mengikuti style project:
putih + biru #1769e0 + kuning #ffd454 + navy #10233f.
