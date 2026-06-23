# Console error sweep — Dev :8088

**Owner:** QA  
**work_item_id:** `P1-QA-CONSOLE-ERROR-SWEEP-8088-01`  
**Environment:** http://14.225.217.232:8088/  
**Matrix SoT:** [`USER_FLOW_OPERABILITY_MATRIX.md`](./USER_FLOW_OPERABILITY_MATRIX.md) §3–§4 (26 web UF)  
**Evidence template:** `docs/qa/evidence/p1-console-error-sweep-8088-YYYYMMDD.md`

---

## Purpose

Sponsor-visible console noise (e.g. `crypto.randomUUID is not a function` on HTTP pilot) must be caught **before** PM/QA UF sign-off. This checklist runs on every `:8088` deploy wave and after any FE bundle change affecting portal / HRM embed / x-bos-core.

---

## Personas (mandatory)

| Persona | Account | Password | Use |
|---------|---------|----------|-----|
| Group CEO | `ceo@xe.vn` | `Xevn@2026` | §3 XBOS + §4 HRM group scope (`companyId=main`) |
| Member HRBP | `du-lich.hr@xe.vn` | `Xevn@2026` | UF-HRM-09 member HRM embed |

---

## Capture protocol

1. Chrome DevTools → **Console** (or CDP `Log` / injected `window.__qaConsole`).
2. **Hard reload** (Ctrl+F5) after login on each route.
3. Wait **≥5s** after load (HRM iframe + React Query settle).
4. Record **errors** and **warnings**; exclude benign dev-only:
   - React DevTools suggestion
   - `[vite] connecting…` / HMR
   - Duplicate React StrictMode double-invoke (note only, do not count as defect)
5. For HRM embed routes: capture **parent + iframe** if accessible; note `iframe inaccessible` when MCP cannot read iframe console.
6. Classify each unique message:

| Severity | Criteria | Example |
|----------|----------|---------|
| **P0** | Uncaught exception; red UI banner; blocks mutate/save; auth/session break | `crypto.randomUUID is not a function`, uncaught TypeError on load |
| **P1** | API 4xx/5xx logged; scope 409; failed resource load affecting data | `Failed to load resource: 409`, HRM sync ERROR banner |
| **P2** | Cosmetic / dev-only / known upstream; no user-visible break | favicon 404, deprecated prop warning |

7. Count **`crypto.randomUUID`** occurrences per route (message substring match).
8. Cross-ref grep: `crypto.randomUUID`, `randomUUID`, `Failed to load resource`, `409`, `500` in repo + prior evidence.

---

## Full checklist — 26 web UF entry URLs

Base: `http://14.225.217.232:8088`

### §3 XBOS Command Center (15 UF) — persona `ceo@xe.vn`

| # | UF-ID | Entry URL / click path | Console sweep |
|---|-------|------------------------|---------------|
| 1 | UF-XBOS-01 | `/login` → `/command-center` | ☐ |
| 2 | UF-XBOS-02 | `/command-center?settings=company_member_units` | ☐ |
| 3 | UF-XBOS-03 | `?settings=company_member_units` → XE_DU_LICH → Chỉnh sửa | ☐ |
| 4 | UF-XBOS-04 | same + Danh sách Cổ đông (member unit) | ☐ |
| 5 | UF-XBOS-05 | `?settings=company_group_hr` → TẬP ĐOÀN → Cổ đông | ☐ |
| 6 | UF-XBOS-06 | member unit detail → Tài liệu pháp lý | ☐ |
| 7 | UF-XBOS-07 | member unit → Nhiệm vụ & RACI → Ma trận RACI | ☐ |
| 8 | UF-XBOS-08 | `?settings=workflow` + CC Hộp thư | ☐ |
| 9 | UF-XBOS-09 | `?settings=hrm_catalog_governance` (inbox approve) | ☐ |
| 10 | UF-XBOS-10 | `/command-center` (KPI widgets home) | ☐ |
| 11 | UF-XBOS-11 | `/login` as `du-lich.ceo@xe.vn` → `/command-center` (negative scope) | ☐ |
| 12 | UF-XBOS-12 | `?settings=tenant_departments` | ☐ |
| 13 | UF-XBOS-13 | `?settings=permission` | ☐ |
| 14 | UF-XBOS-14 | `?settings=document` | ☐ |
| 15 | UF-XBOS-15 | `?settings=hrm_catalog_governance` → tạo extension item | ☐ |

### §4 HRM embed (11 web UF) — primary `ceo@xe.vn`; member rows use `du-lich.hr@xe.vn`

| # | UF-ID | Entry URL | Persona | Console sweep |
|---|-------|-----------|---------|---------------|
| 16 | UF-HRM-01 | `/command-center/hrm/employees` | ceo | ☐ |
| 17 | UF-HRM-02 | `/hr/contracts?portal=1&companyId=main` | ceo | ☐ |
| 18 | UF-HRM-03 | `/hr/employees/{uuid}?portal=1&companyId=main` (from list click) | ceo | ☐ |
| 19 | UF-HRM-04 | `/hr/insurance?portal=1&companyId=main` | ceo | ☐ |
| 20 | UF-HRM-05 | `/hr/attendance?portal=1&companyId=main` | ceo | ☐ |
| 21 | UF-HRM-06 | `/hr/payroll?portal=1&companyId=main` | ceo | ☐ |
| 22 | UF-HRM-07 | ⚪ mobile — skip web sweep | — | N/A |
| 23 | UF-HRM-08 | ⚪ mobile — skip web sweep | — | N/A |
| 24 | UF-HRM-09 | `/login?redirect=/command-center/hrm/employees` | du-lich.hr | ☐ |
| 25 | UF-HRM-10 | `/hr/settings-catalogs?portal=1&companyId=main` | ceo | ☐ |
| 26 | UF-HRM-11 | `/hr/employee-metadata?portal=1&companyId=main` | ceo | ☐ |
| 27 | UF-HRM-12 | `/hr/recruitment?portal=1&companyId=main` | ceo | ☐ |
| 28 | UF-HRM-13 | `/login?redirect=/command-center/hrm/employees` | du-lich.ceo | ☐ |

*(§4 counts 11 web UF; rows 22–23 are ⚪ mobile excluded from 26 total.)*

---

## Priority sweep batch (top 10 — every deploy)

Run first on each sweep session; block release if any **P0** appears:

| # | Route label | URL |
|---|-------------|-----|
| 1 | CC home | `/command-center` |
| 2 | HRM employees | `/command-center/hrm/employees` |
| 3 | HRM contracts | `/hr/contracts?portal=1&companyId=main` |
| 4 | HRM recruitment | `/hr/recruitment?portal=1&companyId=main` |
| 5 | HRM settings catalogs | `/hr/settings-catalogs?portal=1&companyId=main` |
| 6 | Catalog governance | `/command-center?settings=hrm_catalog_governance` |
| 7 | KPI home | `/command-center` (UF-XBOS-10 widgets) |
| 8 | RACI matrix | `/command-center?settings=company_member_units` → XE_DU_LICH → RACI |
| 9 | Member HRM | `du-lich.hr@xe.vn` → `/command-center/hrm/employees` |
| 10 | Metadata queue | `/hr/employee-metadata?portal=1&companyId=main` |

---

## Exit criteria

- All **top 10** routes documented with error/warning inventory + `crypto.randomUUID` count.
- Defect register with P0/P1/P2 + owner (`dev-fe` / `dev-be` / `devops`).
- Residual cross-ref vs grep + prior evidence (`p1-browser-e2e-hrm-wave-8088-r*.md`).
- `ack_status`: **PASS_TO_PM** when sweep complete (defects allowed if registered — sweep ≠ all green).

---

## Known issue index (grep maintenance)

| Pattern | Typical owner | Notes |
|---------|---------------|-------|
| `crypto.randomUUID` on HTTP | dev-fe | `apps/web/hrm/src/lib/safeRandomUuid.ts`; also `web-portal/hrmApiClient.ts`, `x-bos-core/xbosApi.ts` |
| `page_size=200` → 400 | dev-fe | clamp ≤100 in HRM hooks |
| `hrmSettingsCatalogItem` import 500 | devops | VPS partial pscp |
| Member login no token | dev-fe/dev-be | UF-HRM-09/13 — session bridge |

**Last updated:** 2026-06-20 — QA `P1-QA-CONSOLE-ERROR-SWEEP-8088-01`
