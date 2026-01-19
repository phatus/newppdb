# Panduan Update Server (Live App)

Karena ada penambahan library baru (`html-to-image`), proses update di server tidak cukup hanya dengan `git pull`. Anda wajib melakukan instalasi ulang dependencies.

## Langkah-langkah Perbaikan:

Silakan jalankan perintah berikut secara berurutan di terminal server (aaPanel / SSH):

1.  **Ambil Kode Terbaru**
    ```bash
    git pull
    ```

2.  **Install Library Baru** (Wajib dilakukan karena ada pesan error `Module not found`)
    ```bash
    npm install
    ```

3.  **Update Database Schema** (Wajib dilakukan karena ada perubahan kolom kuota)
    ```bash
    npx prisma db push
    ```

4.  **Build Ulang Aplikasi**
    ```bash
    npm run build
    ```

4.  **Restart Server Node.js**
    Sesuaikan dengan cara Anda menjalankan aplikasi (contoh menggunakan PM2):
    ```bash
    pm2 restart newppdb
    ```
    *(Ganti `newppdb` dengan nama process app Anda)*

## Verifikasi
Setelah restart, coba buka kembali menu **Kartu Ujian** atau **Bukti Pendaftaran** dan klik tombol **Download PDF**.
