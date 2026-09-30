# Database dan API Login

Fitur ini menggunakan MySQL untuk menyimpan akun dan PHP 8+ dengan PDO MySQL untuk autentikasi. Kata sandi disimpan menggunakan `password_hash`, bukan sebagai teks biasa. Login dan pendaftaran menerima email atau nomor ponsel.

## Persiapan database

Jalankan MySQL, lalu impor skema dari folder root proyek:

```powershell
mysql -u root -p < fitur-login/database.sql
```

Jika akun MySQL lokal tidak memakai kata sandi, hilangkan `-p`.

## Konfigurasi

API membaca konfigurasi dari environment variable berikut. Nilai default untuk pengembangan lokal adalah host `127.0.0.1`, database `cinema_booking`, user `root`, dan password kosong.

```powershell
$env:DB_HOST = '127.0.0.1'
$env:DB_NAME = 'cinema_booking'
$env:DB_USER = 'root'
$env:DB_PASS = 'password-mysql-anda'
```

Sesuaikan nilainya dengan akun MySQL lokal. Jangan menaruh kredensial produksi di repository.

## Menjalankan aplikasi

Dari folder root proyek, jalankan server PHP:

```powershell
php -S localhost:8000
```

Buka `http://localhost:8000/fitur-pendukung/`. Form login/daftar mengirim request ke `fitur-login/api.php`. Membuka HTML lewat `file://` atau server statis saja tidak dapat menjalankan endpoint PHP.

Endpoint menerima JSON `POST` dengan `action` bernilai `register` atau `login`, `contact` berisi email/nomor ponsel, dan `password`. Pendaftaran juga membutuhkan `full_name`. Setelah autentikasi berhasil, API membuat session PHP.
