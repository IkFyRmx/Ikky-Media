# Ikky Media

Portal berita statis berbasis HTML, CSS, JavaScript dengan Supabase sebagai database, autentikasi admin, dan penyimpanan gambar.

## 1. Jalankan di VS Code

1. Ekstrak folder `ikky-media`.
2. Buka folder tersebut di VS Code.
3. Pasang ekstensi **Live Server**.
4. Klik kanan `index.html` > **Open with Live Server**.

Website akan terbuka, tetapi artikel dan dashboard memerlukan konfigurasi Supabase.

## 2. Buat proyek Supabase gratis

1. Buka https://supabase.com/ lalu buat akun dan proyek baru.
2. Simpan password database proyek di tempat aman.
3. Buka **Project Settings > API** (atau **API Keys**).
4. Salin **Project URL** dan **anon/public key**. Jangan pernah menaruh `service_role` key di website.
5. Buka file `config.js`, isi:
   - `SUPABASE_URL`: Project URL.
   - `SUPABASE_ANON_KEY`: anon/public key.
   - `ADMIN_EMAIL`: email admin yang akan dipakai login.
6. Buka **SQL Editor** di Supabase, tempel seluruh isi `schema.sql`, lalu klik Run.
7. Di `schema.sql`, ganti `email-admin-kamu@example.com` dengan email admin yang sama seperti di `config.js`, kemudian jalankan SQL.
   - Jika sudah terlanjur menjalankan SQL sebelum mengganti email, jalankan ulang seluruh SQL setelah mengganti email.
8. Buka **Authentication > Users > Add user**, buat user dengan email dan password admin.
9. Pastikan **Confirm email** sudah diselesaikan/akun terkonfirmasi. Untuk proyek percobaan, kamu dapat membuat user dari dashboard Supabase dan menonaktifkan kebutuhan konfirmasi email sesuai pengaturan Auth proyek.

## 3. Tes dashboard

1. Jalankan website melalui Live Server.
2. Klik tombol **Admin** di kanan atas.
3. Login memakai email dan password yang dibuat di Supabase.
4. Isi judul, kategori, penulis, ringkasan, foto, isi artikel, dan status.
5. Pilih **Publikasikan** agar artikel muncul di halaman depan. Pilih **Simpan sebagai draft** untuk menyimpan tanpa menampilkan ke publik.
6. Tab **Kelola artikel** dapat digunakan untuk edit dan hapus.

## 4. Hosting gratis dengan GitHub Pages

1. Buat akun/login di https://github.com/
2. Buat repository baru, misalnya `ikky-media`.
3. Upload seluruh isi folder ini ke repository (pastikan `index.html` berada di root repository).
4. Masuk **Settings > Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main` dan folder `/ (root)`, lalu Save.
7. Tunggu proses selesai. GitHub akan memberi alamat seperti `https://username.github.io/ikky-media/`.

Setiap perubahan yang di-push ke branch terpilih akan diperbarui di website.

## Catatan keamanan dan batasan

- `anon/public key` memang digunakan di frontend; keamanan data dijaga oleh Row Level Security (RLS) di `schema.sql`.
- Jangan pernah memasukkan `service_role` key ke `config.js` atau file frontend.
- Ganti email admin di **dua tempat**: `config.js` dan `schema.sql`. Harus sama persis.
- Jangan aktifkan pendaftaran publik untuk admin. Buat akun admin dari dashboard Supabase.
- File gambar maksimal 5 MB; format JPG, PNG, atau WebP.
- Website ini belum memiliki fitur multi-penulis, komentar, pencarian, SEO otomatis, atau moderasi kiriman publik.
- Untuk penggunaan publik/organisasi, gunakan email redaksi yang dikelola sendiri, kebijakan privasi, dan proses verifikasi isi artikel sebelum publikasi.
- GitHub Pages dan Supabase memiliki batas penggunaan paket gratis yang dapat berubah; cek dashboard penyedia untuk kuota terkini.

## Struktur file

- `index.html` — halaman utama, pembaca artikel, dan modal dashboard.
- `style.css` — tampilan responsif.
- `app.js` — logika artikel, login, upload, edit, dan hapus.
- `config.js` — konfigurasi Supabase dan email admin.
- `schema.sql` — tabel, aturan keamanan RLS, dan bucket gambar.
