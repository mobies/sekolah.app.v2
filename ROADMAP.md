# 🗺️ ROADMAP: SekolahApp V6 (Hybrid Multi-Tenant BYOC)

## ✅ PHASE 0 - 6: MVP Managed SaaS (COMPLETED)
- [x] Initialized Git, Next.js, Cloudflare Workers, Turso Drizzle.
- [x] Core Logic (Auth, Registration, Absensi, E-Learning).
- [x] FinTech Module (Wallet Durable Objects, Market, Billing).
- [x] Dashboards (Owner, Admin, Teacher, Student, Parent, Finance, Partner).
- [x] External Bridges (IoT HMAC, CBT Sync).

---

## 🚀 PHASE 7: Tenant Resource Abstraction (The Adapter Layer) 🔌
*Fokus: Melepaskan hardcode ke resource owner agar bisa dinamis membaca kredensial cloud milik tenant.*
- [ ] Refactor `src/lib/db.ts` menjadi `TenantDBAdapter` (Support: Turso, Postgres AWS/GCP, Supabase).
- [ ] Refactor `E-Learning API` menjadi `TenantStorageAdapter` (Support: Cloudflare R2 owner, AWS S3 tenant, MinIO lokal).
- [ ] Refactor `Attendance Queue` menjadi `TenantQueueAdapter` (Support: CF Queues, AWS SQS, Redis PubSub).
- [ ] Update `schools` schema di Global DB untuk menyimpan `cloud_provider_type` dan terenkripsi `tenant_cloud_credentials`.

## 🚀 PHASE 8: BYOC Engine & Deployment Orchestrator ☁️
*Fokus: Mengizinkan tenant besar mendaftarkan dan memvalidasi infrastruktur cloud mereka sendiri.*
- [ ] Buat UI di Owner Dashboard untuk "Upgrade to Enterprise BYOC".
- [ ] Buat API `/api/byoc/validate` untuk memverifikasi koneksi S3/Database milik tenant.
- [ ] Buat worker script untuk melakukan *Zero-Downtime Migration* (Shared Turso -> Tenant DB).
- [ ] Buat **Capability Matrix System** (Dynamic UI berdasarkan kapabilitas cloud tenant).

## 🚀 PHASE 9: Resource Metering & Hybrid Billing Engine 💰
*Fokus: Menghitung pemakaian agar owner tidak rugi melayani tenant SaaS.*
- [ ] Buat middleware `ResourceMetering` untuk mencatat jumlah API Call per tenant.
- [ ] Tracking penggunaan Storage R2 (Upload E-Learning) per tenant.
- [ ] Buat UI Tagihan Server di sisi Admin Sekolah (Platform Invoice).
- [ ] Integrasi Payment Gateway agar Admin Sekolah bisa membayar tagihan platform bulanan.

## 🚀 PHASE 10: Governance, Compliance & AI Safety 🤖
*Fokus: Mematuhi UU PDP, PSE, dan standar keamanan Enterprise.*
- [ ] Implementasi Enkripsi Field-Level untuk data sensitif siswa.
- [ ] Buat *Audit Engine* (Append-only logs) untuk setiap mutasi nilai (CBT) dan keuangan.
- [ ] Implementasi *Consent Engine* (Persetujuan Orang Tua).
- [ ] Integrasi *Academic Integrity AI* pada CBT Bridge.
