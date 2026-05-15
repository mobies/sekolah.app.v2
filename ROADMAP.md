# 🗺️ ROADMAP: SekolahApp V2 (Edge-Powered School Super-App)

## Phase 0: Project Management & Initialization 🏗️
- [x] Initialize Git Repository and Branching Strategy
- [x] Create `ROADMAP.md` and `PROGRESS.md`
- [ ] Setup Sentry for Edge Logging

## Phase 1: Infrastructure Setup 🌐
- [x] Scaffold Next.js Project (App Router + Cloudflare Workers)
- [x] Configure `wrangler.toml` (D1, R2, Queues, Durable Objects)
- [x] Setup Drizzle ORM with dynamic routing logic

## Phase 2: Core Database Schema 💾
- [ ] Define `schools`, `users`, `wallets`, `inventory`, `registrations`, `logistics` schemas
- [ ] Implement multi-tenant migrations logic

## Phase 3: Core Logic Development 🧠
- [x] Registration Flow (NPSN-based)
- [x] Owner Dashboard (Tenant Management)
- [x] Multi-tenant Auth (Subdomain-based)
- [x] FinTech Module (Wallet with Durable Objects)
- [x] Smart Attendance (Queued processing)
- [x] E-Learning (R2 Integration)

## Phase 4: Logistics & IoT 🚍
- [x] Real-time Bus Tracking (WebSockets)
- [x] IoT Integration Bridge (/api/iot/*)

## Phase 5: External Integration 🔗
- [x] CBT Bridge (SSO + Sync)

## Phase 6: UI/UX Polishing 🎨
- [x] SweetAlert2 Integration
- [x] Dark Theme & Performance Optimization
- [x] Extended Role Dashboards (Teacher, Partner, Parent, Staff)
