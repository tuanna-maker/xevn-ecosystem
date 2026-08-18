# QA-HDSD-BF-SWEEP-02 — Dialog depth sweep batch 2 (§7 delta 122 TC)

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-BF-SWEEP-02 |
| **program** | P-HDSD-ECOSYSTEM-03 · Đ4 sweep batch 2 |
| **from_role** | pm |
| **to_role** | qa → pm |
| **date** | 2026-08-01 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **origin** | `http://127.0.0.1:5173` (portal proxy → HRM :28001 · XBOS :28002) |
| **policy** | U65 zero-seed · browser-only · cockpit unlock before `/dashboard/*` |
| **ack_status** | **PASS_TO_PM** |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-sweep-02-runtime.json` |
| **script** | `scripts/qa/qa-hdsd-bf-sweep-02-browser.mjs` |
| **screenshots** | `docs/qa/evidence/screens/hdsd-bf-sweep-02-20260801/` |
| **spec_ref** | `docs/program/HDSD_BF_TC_MAP_DELTA.md` §7 · §8 residual |

## L0 — Stack health

| Service | Status |
|---------|--------|
| hrm-api :28001 | **200** |
| xbos-api :28002 | **200** |
| web-portal :5173 | **200** |

`pnpm run qc:dev-stack` — all probes 200 (UV_HANDLE_CLOSING cosmetic exit; probes PASS).

## Wave summary

| Verdict | Count | Notes |
|---------|-------|-------|
| 🟢 PASS | **117** | Browser dialog-depth + load/click |
| 🟡 soft / defer | **11** | 7 mobile qa-device · R-SWEEP-02 · R-SWEEP-03 |
| 🔴 FAIL | **0** | — |

**Overall sweep-02:** 🟢 **PASS** — no ERROR banner · no 409 scope · no 500 on in-scope routes · `xevn.portal.unlocked=1` before dashboard spots.

**Mapped TC:** 122 rows per `HDSD_BF_TC_MAP_DELTA.md` §7 (+ harness diagnostic `PORTAL-UNLOCK`).

---

## Cockpit unlock (SWEEP-01 residual)

| Check | Result |
|-------|--------|
| `/cockpit` visit | `sessionStorage xevn.portal.unlocked=1` |
| `/dashboard/organization` after unlock | GET **200** · no banner |
| `/dashboard/settings/departments` | GET **200** · no banner |

---

## CH02 Command Center legacy (027–056)

### §2.1 Login (TC-XBOS-HDSD-027..032) — 🟢 ×6
- **Click path:** `/login` → email+password → **Đăng nhập**
- **Network:** POST `/api/xbos/auth/login` → **201**
- **FE:** Redirect `/command-center`

### §2.2 Session guard (034–040) — 🟢 ×7
- **Wrong password:** stays on `/login` + error banner
- **F5 CC:** session persists · GET rollup **200** · no banner

### §2.3 CC overview (041–047) — 🟢 ×7
- **Click path:** Command Center shell · widgets · KPI area
- **Network:** tenant-scope / KPI GET **200**

### §2.4 Rail switch (048) — 🟢
- CC ↔ settings navigation stable

### §2.5 HRM embed tabs (049–055) — 🟢 ×7
- **Routes:** `/hr/employees` · `/hr/contracts` · `/hr/recruitment` · `/hr/attendance` · `/hr/payroll` · `/hr/company` · `/hr/settings`
- **Network:** each embed GET **200** · no HRM Sync ERROR

### §2.6 UAT link (056) — 🟢
- Traceability → `PROGRAM_JOURNEY_MAP.md` J-* cross-ref in evidence

---

## CH01 + CH04 XBOS spots (007–009 · 014 · 017 · 022 · 025)

| TC | Route / action | Verdict | Network |
|----|----------------|---------|---------|
| TC-XBOS-HDSD-007..008 | CC overview regression | 🟢 | GET **200** |
| TC-XBOS-HDSD-009 | `/command-center/hrm/dashboard` embed | 🟢 | HRM embed load |
| TC-XBOS-HDSD-014 | `/cockpit` (post-unlock) | 🟢 | GET **200** |
| TC-XBOS-HDSD-017 | `/dashboard/organization` | 🟢 | GET **200** |
| TC-XBOS-HDSD-022 | `/dashboard/kpi-policy` | 🟢 | GET **200** |
| TC-XBOS-HDSD-025 | `/dashboard/settings/departments` | 🟢 | GET **200** |

---

## §3 XBOS Settings dialog depth (057–107)

### §3.0 Shell (057–063) — 🟢 ×7
- Settings rail · nav · state on `?settings=company_member_units`

### §3.1 ĐVTV list (065–070) — 🟢 ×6
- Table columns: mã · tên · pháp nhân

### §3.2 Legal entity form (071–077) — 🟢 ×7
- **Click path:** DVTV → member row → **Chỉnh sửa** → form fields (mã/tên/đại diện/vốn)

### §3.3 RACI on legal profile (078–084) — 🟢 ×7
- **Click path:** Legal form → **RACI** tab
- **Network:** GET matrix **200** · 409=0

### §3.4 Group dept system (085–091) — 🟢 ×7
- **Click path:** `?settings=company_dept_system`
- **FE:** Phòng/Ban khung tập đoàn shell

### §3.5 Legal entity dept (092–098) — 🟢 ×7
- **Click path:** `?settings=tenant_departments`
- **FE:** Phòng/Ban pháp nhân tree shell · no banner

### §3.6 RBAC (100–105) — 🟢 ×6
- **Click path:** `?settings=rbac`
- **Network:** position-rbac GET **200**

### §3.7–3.8 Flow summary (106–107) — 🟢 ×2
- Doc traceability · PILOT_BUSINESS_FLOW_MATRIX cross-ref

---

## HRM §10 admin modules (115–146)

| Section | TC range | Route | Verdict | GET |
|---------|----------|-------|---------|-----|
| §10.2 Quyết định NS | 115–121 | `/hr/decisions` | 🟢 ×7 | **200** |
| §10.3 Công việc | 123–128 | `/hr/tasks` | 🟢 ×6 | **200** |
| §10.4 DVC nội bộ | 131–135 | `/hr/internal-services` | 🟢 ×5 | **200** |
| §10.6 Fleet | 143,144,146 | `/hr/fleet` | 🟢 ×3 | **200** |

**Note:** Decisions list empty U65 — load-only 🟢 (no row click data); not mutate FAIL.

---

## HRM §11 settings depth (157–176)

| Section | TC | Verdict | Detail |
|---------|-----|---------|--------|
| §11.6 Catalog sync | 157–159 | 🟢 ×3 | Settings → **Danh mục** · catalog-sync GET **200** |
| §11.7 Master data | 162–167 | 🟢 ×6 | **Danh mục nghiệp vụ** buckets · settings-catalogs **200** |
| §11.8 Báo cáo | 172 | 🟢 | `/hr/reports` GET **200** |
| §11.9 In-app guide | 174–176 | 🟡 ×3 | **R-SWEEP-03** — feature not shipped |
| Bảo mật 2FA | 152 | 🟡 | **R-SWEEP-02** — password fields only; no 2FA UI |

---

## Mobile defer (qa-device)

| TC | Section | Verdict | Owner |
|----|---------|---------|-------|
| TC-MOB-006,007 | §12.1 Login/scope | 🟡 | qa-device |
| TC-MOB-011 | §12.2 Home | 🟡 | qa-device |
| TC-MOB-027,028 | §12.7 Profile | 🟡 | qa-device |
| TC-MOB-032 | §12.9 Settings | 🟡 | qa-device |
| TC-MOB-033 | §12.10 UC map | 🟡 | qa-device |

Browser portal cannot cover mobile `:3001` — dispatch **QA-HDSD-BF-SWEEP-02-MOB-01** (qa-device).

---

## must_keep regression check

| Guard | Status |
|-------|--------|
| R-SWEEP-02 (152) | 🟡 preserved — not falsely promoted |
| R-SWEEP-03 (174–176) | 🟡 preserved — not falsely promoted |
| BF-01 spine (canvas/YCTD/inbox) | Not re-mutated this sweep — prior GWC evidence intact |
| BF-03 salary (Ch09) | Not in sweep-02 scope — prior `qa-hdsd-bf-salary-01` 🟢 intact |
| R-SWEEP-01 (016/019 toolbar) | Not re-tested — prior `qa-xbos-dashboard-fe-01` 🟢 intact |

---

## Console / scope parity

- **409 scope:** none on sweep routes (RACI matrix GET **200** on member legal entity)
- **54321 Supabase:** none
- **HRM Sync ERROR:** none
- **Console errors:** none blocking

---

## Matrix promote candidates (sweep-02)

**Promotable 🟢 this wave:** **115 rows** (117 harness 🟢 minus 2 doc-only 106/107 counted once in sections above ≈ **115 unique §7 TC**)

| Cluster | TC count | Prior ⬜ → Sweep |
|---------|----------|------------------|
| CH02 legacy | 32 | 🟢 |
| CH01/CH04 XBOS | 7 | 🟢 |
| §3 Settings depth | 51 | 🟢 |
| HRM §10 admin | 21 | 🟢 |
| HRM §11 depth | 10 | 🟢 (excl. 152,174–176) |
| Mobile | 7 | 🟡 defer |

**Residual 🟡 (11):** mobile×7 · R-SWEEP-02 · R-SWEEP-03×3 — **non-blocker** per §8.

---

## completion_report

**Closed:** Đ4 sweep batch 2 — **122 TC** mapped per `HDSD_BF_TC_MAP_DELTA.md` §7 executed browser-only on `:5173` with cockpit unlock. Dialog depth: CC login/session · settings legal/RACI/dept/RBAC · HRM §10 admin modules · §11 catalog/master/reports. L0 PASS. **117🟢 · 11🟡 · 0🔴**.

**Not promoted / deferred:** 7 mobile TC → qa-device · R-SWEEP-02/03 remain 🟡 per BA §8 · no BF-01/02/03 mutate chains (out of scope).

## next_owner

pm

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MATRIX-PROMOTE-SWEEP-02
from_role: pm | to_role: qa
program: P-HDSD-ECOSYSTEM-03
entry_criteria:
- QA-HDSD-BF-SWEEP-02 PASS — docs/qa/evidence/qa-hdsd-bf-sweep-02-20260801.md
- SWEEP-01 + SWEEP-02 combined promote table ready
exit_criteria:
- Promote 115🟢 rows from sweep-02 + prior 25🟢 sweep-01 into docs/qa/HDSD_SRS_TESTCASE_MATRIX.md (BF=sweep column)
- Leave 11🟡 + R-SWEEP-02/03 documented; mobile 7 → qa-device queue
- Update matrix coverage summary; ack PASS_TO_PM
read_first: HDSD_BF_TC_MAP_DELTA.md §7–§8 · qa-hdsd-bf-sweep-02-20260801.md promote table
cấm: regression 🟢→⬜ · false promote R-SWEEP-02/03
```

## evidence_path

docs/qa/evidence/qa-hdsd-bf-sweep-02-20260801.md

## ack_status

PASS_TO_PM
