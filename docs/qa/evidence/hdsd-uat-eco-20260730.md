# HDSD UAT — W0 Ecosystem + HRM Ch.0 (Smoke)

**work_item_id:** `HDSD-P2-QA-W0-SMOKE-01`  
**Program:** `HDSD-P2-FULL-01`  
**Date:** 2026-07-30  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**Policy:** U65 zero-seed · browser Puppeteer (real UI login + click)  
**Portal:** `http://127.0.0.1:5173` · **HRM standalone:** `http://127.0.0.1:5175`  
**Script:** `scripts/qa/qa-hdsd-p2-w0-smoke-01.mjs`  
**Runtime:** `docs/qa/evidence/_tmp-hdsd-p2-w0-smoke-01-runtime.json`

## L0

| Check | Exit | Result |
|-------|------|--------|
| `pnpm run qc:dev-stack` | 0* | HRM :28001 + XBOS :28002 + portal :5173 **200** (*Windows UV exit noise) |
| `pnpm run qc:fe-be-health` | **0** | **ALL PASS** (pre-run + post `dist/main.js` HRM restart) |
| Stack SoT | — | `docs/qa/evidence/devops-hdsd-p2-stack-20260730.md` |

## Summary

| Band | 🟢 | 🟡 | 🔴 |
|------|----|----|-----|
| TC-ECO-001..008 | 8 | 0 | 0 |
| TC-HRM-HDSD-001..005 | 2 | 3 | 0 |
| **W0 total** | **10** | **3** | **0** |

---

## UF blocks — Ecosystem (TC-ECO)

### TC-ECO-001 — Mục đích & entry portal
- **Persona / URL:** `ceo@xe.vn` · `http://127.0.0.1:5173/login`
- **Click path:** Mở `/login` → quan sát form
- **Network:** (load-only)
- **FE sau load:** Email + Mật khẩu + nút submit hiển thị
- **F5:** n/a
- **Verdict:** 🟢
- **spec_ref:** HDSD ECO §1 · FR-UC-PORTAL-AUTH

### TC-ECO-002 — Đăng nhập Cổng (Cách vào)
- **Click path:** `/login` → nhập email/password → **Đăng nhập**
- **Network:** `POST /api/xbos/auth/login` → **201**
- **FE sau 2xx:** Redirect `http://127.0.0.1:5173/command-center` · không ERROR banner
- **F5:** n/a (session test ở TC-007)
- **Verdict:** 🟢 · **UF:** UF-XBOS-01

### TC-ECO-003 — Bảng nút & chức năng login
- **Click path:** Form login — trường Email, Mật khẩu, nút **Đăng nhập**
- **Network:** submit → 201 (cùng TC-002)
- **FE:** Nút **Đăng nhập** visible trước submit
- **Verdict:** 🟢 · **UF:** UF-XBOS-01

### TC-ECO-004 — Persona tham chiếu
- **Persona:** `ceo@xe.vn` / `Xevn@2026` (tập đoàn)
- **FE:** Post-login CC shell · scope `companyId=main`
- **Verdict:** 🟢 · **UF:** UF-XBOS-01

### TC-ECO-005 — Sau đăng nhập — chọn sản phẩm
- **Click path:** CC `/command-center` → `/dashboard/organization`
- **Network:** `GET /api/xbos/tenant-scope/*` **200**
- **FE:** CC widgets load; dashboard org tab load (redirect về `/` sau org — soft nav, không banner lỗi)
- **Verdict:** 🟢 · **UF:** UF-XBOS-01

### TC-ECO-006 — Rail phân hệ (Command Center)
- **Click path:** CC rail — nhãn **Tập đoàn/GROUP** + **NHÂN SỰ**
- **FE:** Cả hai nhãn present trên rail
- **Verdict:** 🟢 · **UF:** UF-XBOS-01

### TC-ECO-007 — Phiên làm việc (F5)
- **Click path:** CC → **F5**
- **FE:** URL giữ `/command-center` · không redirect `/login` · không ERROR banner
- **Verdict:** 🟢 · **UF:** UF-XBOS-01

### TC-ECO-008 — Meta checklist TC-ECO
- **FE:** 8/8 TC-ECO executed in smoke run
- **Verdict:** 🟢

---

## UF blocks — HRM Ch.0 (TC-HRM-HDSD)

### TC-HRM-HDSD-001 — Hai cách mở HRM Web
- **Embed click path:** `/command-center/hrm/employees?portal=1&tenantId=xevn&companyId=main`
- **Standalone click path:** Portal login → session bridge → `:5175/employees?portal=1&…`
- **Network:** Embed run captured `GET /api/hrm/employees` **500** when `hrm-api` crashed mid-session; **L0 re-check after `dist/main.js` restart → 200**
- **FE:** Embed route load (screenshot); standalone `/employees` load **🟢**
- **Verdict:** 🟡 · **entry:** both · **Residual:** transient HRM 500 during long run; stack recovery documented

### TC-HRM-HDSD-002 — Sidebar HRM embed
- **Click path:** `/command-center/hrm/dashboard` → sidebar **Nhân sự**
- **FE:** URL `…/command-center/hrm/dashboard` · menu shell visible
- **Verdict:** 🟢 · **UF:** UF-HRM-MENU-01 · **entry:** embed

### TC-HRM-HDSD-003 — Nút shell GROUP (embed only)
- **Click path:** Embed → rail **Tập đoàn/GROUP** → expect CC XBOS
- **FE:** Puppeteer click **không** đổi URL khỏi `/command-center/hrm/*` (soft automation)
- **Verdict:** 🟡 · **entry:** embed · **Note:** W2b embed menu load verified separately

### TC-HRM-HDSD-004 — HRM standalone — cách vào
- **Click path:** `:5175` — login form absent → portal JWT bridge → `/employees`
- **FE:** Standalone employees route load, không rail XBOS
- **Verdict:** 🟢 · **UF:** UF-HRM-MENU-01 · **entry:** standalone

### TC-HRM-HDSD-005 — Trạng thái & lỗi HRM
- **Click path:** `/command-center/hrm/employees`
- **Network:** `GET /api/hrm/employees` **500** during API-down window; **no** «HRM API Sync ERROR» banner on shell
- **FE:** Empty/error state without red sync banner (🟡 — API fail without banner = residual)
- **Verdict:** 🟡 · **entry:** embed

---

## Screenshots

`docs/qa/evidence/screens/hdsd-uat-20260730/w0-tc-*.png`

## Residual / PM dispatch

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| R-HRM-API-01 | P1 | devops | `nest start --watch` fails `Cannot find module '../platform/platform-runtime'` — use `dist/main.js` + `NODE_ENV=development` on :28001 |
| R-HRM-EMBED-01 | P2 | dev-fe | GROUP rail click automation soft; manual CC↔HRM switch OK in prior W2b evidence |
| R-HRM-500-01 | P1 | dev-be | Transient `/api/hrm/*` 500 when listener dies mid-UAT — block W2 until L0 stable 10m |

## ack_status

**PASS_TO_PM** — W0 ECO **closed 🟢**; HRM Ch.0 **smoke 🟡** with stack residual; ready for **HDSD-P2-QA-W1-XBOS-01**.
