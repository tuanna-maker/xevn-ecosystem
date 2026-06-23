# Pilot test accounts (web portal + mobile HRM)

## Note
- These are **pilot/dev credentials** for testing in this repo.
- For **web portal** flows, use password `Xevn@2026`.
- For **mobile HRM app** (`/api/hrm/auth/mobile/login`), HRBP accounts use password `xevn-pilot` (unless the doc of a specific scenario says otherwise).

## 1) Chủ tịch tập đoàn (Command Center / Group CEO)
- Email: `ceo@xe.vn`
- Password (portal): `Xevn@2026`
- Tenant: `xevn`
- Company scope: `main`

## 2) CEO công ty du lịch (xe-du-lich)
- Email: `du-lich.ceo@xe.vn`
- Password (portal): `Xevn@2026`
- Tenant: `xe-du-lich`
- Company scope: `main`

## 3) Nhân viên của CEO (HRBP) - công ty du lịch (xe-du-lich)
- Email: `du-lich.hr@xe.vn`
- Password (portal): `Xevn@2026`
- Password (mobile HRM): `xevn-pilot`
- Tenant: `xe-du-lich`
- Company scope: `main`

## 4) Công ty du lịch (reference identifiers)
- Company (slug): `xe-du-lich`
- Expected isolation: tenant `xe-du-lich`, company `main` (for employee/HRM routes)

