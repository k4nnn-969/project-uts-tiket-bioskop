# 🎬 MovieTiket — Platform Pemesanan Tiket Bioskop

**MovieTiket** adalah website pemesanan tiket bioskop yang dikembangkan sebagai project UTS mata kuliah **Front-End Programming**.

Website ini dirancang untuk memberikan pengalaman pemesanan tiket bioskop secara sederhana dan interaktif. Pengguna dapat melihat film yang sedang tayang, mencari film berdasarkan kategori, memilih bioskop dan jadwal, memilih kursi secara langsung, hingga melakukan simulasi pembayaran.

---

## 📌 Deskripsi Project

MovieTiket merupakan aplikasi berbasis website yang mensimulasikan proses pemesanan tiket bioskop secara digital.

Alur utama aplikasi:

> **Home → Pilih Film → Pilih Bioskop → Pilih Jadwal → Pilih Kursi → Order Summary → Pembayaran → E-Ticket**

Project ini menggunakan teknologi **HTML, CSS, dan JavaScript (Vanilla JS)** tanpa menggunakan framework frontend.

---

## 👥 Anggota Kelompok

| No. | Nama | NIM | Bagian yang Dikerjakan |
|:---:|---|---|---|
| 1 | **Ramdan Thalib** | 535250121 | Eksplorasi Film — Home, Movies, Movie Detail |
| 2 | **Valencia Chen** | 535250123 | Bioskop & Jadwal — Cinemas, Cinema Detail, Showtimes |
| 3 | **Haafizh Arkan Tiasno** | 535250128 | Pemesanan Tiket — Seat Selection, Order Summary, Payment |
| 4 | **Ferdiansyah Ramadhan** | 535250140 | Tiket & Akun — E-Ticket, Booking History, Profile |
| 5 | **Fajar Adhy Nugroho** | 535250145 | Fitur Pendukung — Promotions, Coming Soon, Login/Register |

---

## ✨ Fitur Utama

### 🎥 1. Eksplorasi Film

Pengguna dapat:

- Melihat daftar film yang sedang tayang
- Melihat detail film
- Melihat informasi genre
- Mencari film
- Melihat film berdasarkan kategori

### 🔎 2. Search & Filter

Pengguna dapat melakukan pencarian dan penyaringan film berdasarkan:

- Kota
- Genre
- Film yang tersedia

Filter dilakukan secara dinamis menggunakan JavaScript.

### 🏢 3. Bioskop & Jadwal

Pengguna dapat:

- Melihat daftar bioskop
- Melihat detail bioskop
- Melihat jadwal film
- Memilih jadwal tayang yang tersedia

### 💺 4. Interactive Seat Selection

Sistem pemilihan kursi memungkinkan pengguna memilih kursi secara langsung.

Status kursi terdiri dari:

- 🟢 **Available** — kursi tersedia
- 🔵 **Selected** — kursi sedang dipilih
- 🔴 **Occupied** — kursi sudah terisi

Data pemilihan kursi menggunakan **LocalStorage** untuk mempertahankan data pada sisi client.

### 🧾 5. Order Summary

Halaman Order Summary menampilkan:

- Film yang dipilih
- Bioskop
- Jadwal
- Kursi
- Harga tiket
- Service fee
- Total pembayaran

Total harga dihitung secara otomatis berdasarkan pilihan pengguna.

### ⏱️ 6. Payment Timer

Untuk mensimulasikan batas waktu pembayaran, sistem menyediakan **countdown timer selama 7 menit**.

Timer digunakan untuk menjaga sesi pemesanan sebelum pengguna menyelesaikan pembayaran.

### 💳 7. Simulasi Pembayaran

Pengguna dapat memilih beberapa metode pembayaran:

- QRIS
- DANA
- Virtual Account

Metode pembayaran terhubung dengan informasi pada halaman checkout.

### 🎟️ 8. E-Ticket

Setelah proses pemesanan, pengguna dapat melihat tiket elektronik yang berisi informasi pemesanan.

### 📜 9. Booking History

Pengguna dapat melihat riwayat pemesanan tiket yang telah dilakukan.

### 👤 10. Profile

Tersedia halaman profile untuk menampilkan informasi akun pengguna.

### 🎁 11. Fitur Pendukung

Project juga menyediakan beberapa fitur tambahan seperti:

- Promotions
- Coming Soon
- Login
- Register

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Penggunaan |
|---|---|
| **HTML5** | Struktur halaman website |
| **CSS3** | Styling, layout, dan responsive design |
| **JavaScript** | Logic, interaksi, validasi, dan manipulasi DOM |
| **LocalStorage** | Penyimpanan data sementara pada browser |
| **Git** | Version control |
| **GitHub** | Repository dan kolaborasi project |

---

## 📂 Struktur Project

```text
project-uts-tiket-bioskop/
│
├── Bioskop-Jadwal/
│   ├── ...
│   └── ...
│
├── Pemesanan-Tiket/
│   ├── ...
│   └── ...
│
├── fitur-login/
│   ├── ...
│   └── ...
│
├── fitur-pendukung/
│   ├── ...
│   └── ...
│
├── home-movie/
│   ├── ...
│   └── ...
│
├── img/
│   └── ...
│
├── profile-eticket-history/
│   ├── ...
│   └── ...
│
└── README.md
