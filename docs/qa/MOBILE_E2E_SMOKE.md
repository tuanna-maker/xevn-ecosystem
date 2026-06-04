# HRM Mobile E2E smoke — MOB-404

## Automated (API-level)

From repo root:

```bash
node scripts/mobile-hrm-smoke.mjs
```

Env: `HRM_API_BASE_URL` (default `http://localhost:3001`), `HRM_MOBILE_PILOT_PASSWORD` (default `xevn-pilot`).

Checks: health, mobile login, leave list filter, payslip filter.

## Manual (device)

1. **Du lịch X.E:** `pnpm run seed:tourism:mobile-pilot` → login `du-lich.ceo@xe.vn` / `xevn-pilot` (hoặc `TENANT_ID=xe-du-lich EMAIL=du-lich.ceo@xe.vn pnpm run seed:hrm:mobile-account`).
2. **Holding pilot:** `ceo@xe.vn` / `xevn-pilot`, tenant `xevn`, company `holding`, company UUID pilot.
2. Check-in with GPS enabled (coords inside work site seed).
3. Create leave → see in **Đơn nghỉ** list.
4. Manager account (`hr.manager@xe.vn`): **Phê duyệt** visible, badge on **Thêm**.
5. Inbox: tap unread → marked read on server.

## VPS post-deploy — MOB-QA-02

After deploy, set `EXPO_PUBLIC_HRM_API_BASE_URL=http://14.225.217.232:3001` and run smoke script against VPS.
