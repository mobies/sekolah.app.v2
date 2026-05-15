# 🛠️ Local Testing Preparation Steps: SekolahApp V2

Aplikasi ini menggunakan arsitektur **Edge-First** yang memanfaatkan fitur spesifik Cloudflare (Durable Objects, Queues, R2, dll). Oleh karena itu, pengujian lokal memerlukan simulator Cloudflare (Wrangler).

---

## 1. Persiapan Environment 🔑

Buat file `.env.local` di root direktori project dan tambahkan variabel berikut untuk simulasi database dan keamanan:

```env
# Database Global (Simulasi SQLite Lokal)
GLOBAL_DB_URL="file:local-global.db"
GLOBAL_DB_TOKEN=""

# Keamanan (JWT & IoT)
JWT_SECRET="your_super_secret_key_for_local_testing"
IOT_SHARED_SECRET="development_iot_secret_key"
CBT_SHARED_SECRET="development_cbt_secret_key"

# Cloudflare Account Info (Hanya untuk presigned URL R2)
CF_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"
R2_BUCKET_NAME="school-assets-bucket"
```

---

## 2. Menjalankan Server Cloudflare Lokal 🚀

Gunakan script khusus yang sudah dikonfigurasi untuk menjalankan Next.js di dalam sandbox Cloudflare:

```bash
npm run dev:cf
```

- **Proses:** Script ini akan menjalankan `next-on-pages` untuk mem-build aplikasi ke format worker, lalu menjalankan `wrangler pages dev` untuk mensimulasikan environment Cloudflare di port `3000`.

---

## 3. Skenario Pengujian Fitur 🧪

### A. Pendaftaran & Manajemen Tenant
1. **Registrasi Sekolah:** Akses [http://localhost:3000/register](http://localhost:3000/register). Isi form untuk mendaftarkan sekolah baru ke Global DB.
2. **Dashboard Owner:** Akses [http://localhost:3000/owner/dashboard](http://localhost:3000/owner/dashboard) untuk melihat daftar pendaftaran dan mensimulasikan persetujuan infrastruktur.

### B. Multi-Tenant Routing (Subdomain)
Aplikasi menggunakan middleware untuk mendeteksi sekolah berdasarkan subdomain. Di lokal, gunakan format URL berikut:
- **URL Login Sekolah:** `http://[subdomain].localhost:3000/login`
- *Contoh:* Jika Anda mendaftarkan subdomain `sman1jkt`, akses [http://sman1jkt.localhost:3000/login](http://sman1jkt.localhost:3000/login).

### C. Integrasi IoT & CBT (Server-to-Server)
Jalankan script simulasi di terminal terpisah saat server `dev:cf` sedang berjalan:

1. **Simulasi Tap RFID (IoT):**
   ```bash
   node scripts/simulate-iot.js
   ```
2. **Simulasi Sinkronisasi Ujian (CBT):**
   ```bash
   node scripts/simulate-cbt.js
   ```

### D. Fitur E-Learning & Wallet
- Login sebagai murid di subdomain sekolah Anda.
- **Wallet:** Cek saldo di dashboard murid. Saldo dikelola oleh **Durable Objects**.
- **E-Learning:** Cek daftar materi di menu E-Learning. Download link akan dibuat secara aman menggunakan **Presigned URL R2**.

---

## 4. Troubleshooting 📋
- **Module Not Found:** Pastikan Anda sudah menjalankan `npm install --legacy-peer-deps`.
- **Durable Object Error:** Pastikan `wrangler.toml` memiliki binding `WALLET_DO` yang benar.
- **SQLite Error:** Jika database tidak terbuat otomatis, pastikan folder project memiliki izin tulis (write permission).
