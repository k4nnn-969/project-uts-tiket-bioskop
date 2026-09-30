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

## Cara kerja

- `fitur-pendukung/auth.js` mengatur tab Login/Daftar, mengirim form, menampilkan status akun, dan menangani logout.
- `api.php` memvalidasi data, memeriksa kata sandi, dan membuat atau menghapus session.
- `database.sql` membuat database dan tabel pengguna.

Endpoint menerima JSON `POST` dengan `action` berikut:

| `action` | Data tambahan | Fungsi |
| --- | --- | --- |
| `register` | `contact`, `full_name`, `password` | Membuat akun baru |
| `login` | `contact`, `password` | Masuk ke akun |
| `status` | Tidak ada | Memeriksa apakah session masih aktif |
| `logout` | Tidak ada | Menghapus session |

`contact` bisa berupa email atau nomor ponsel. Kata sandi disimpan sebagai hash, sedangkan session menggunakan cookie HTTP-only. Form meminta kata sandi minimal 6 karakter. Untuk membuat akun, buka halaman lalu pilih **Daftar**; sesudah berhasil, nama akun muncul di navigasi. Tombol **Keluar** mengakhiri session.
