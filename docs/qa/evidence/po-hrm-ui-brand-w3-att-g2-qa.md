# PO-HRM-UI-BRAND-W3-ATT-G2-QA — Rules tablet/proxy/auto + CFG + users/roles/system honesty

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-G2-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only · U76 hdsd_align |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Base** | `http://127.0.0.1:8080` (portal `:5173` ECONNREFUSED → **hrm_fe fallback**) · `/hr/attendance?companyId=main` |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §8–§10 |
| **Inventory** | W3-ATT-G2 · S76–S85 |
| **FE handoff** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-g2.md` READY_FOR_QA |
| **Prior ATT-G1 QA** | `docs/qa/evidence/po-hrm-ui-brand-w3-att-g1-qa.md` PASS — spot Face/PROP-03e only (no full G1 retest) |
| **ack_status** | **PASS_TO_PM** |
| **attendance_closed** | **false** |
| **face_live** | **false** (GĐ2-HOLD honesty kept) |
| **prop_03e** | **SKIP** (`att-prop-03e-qr-card-skip` visible · EmployeeQRCard LIVE=false) |
| **remaster_program_done** | **false** |
| **commit** | `dc930c5` |
| **Harness endedAt** | `2026-08-05T04:25:39.812Z` (UTC) |

---

## 1. Entry / L0

| Check | Result |
|-------|--------|
| Harness L0 probe | hrm **200** · xbos **200** · portal **ECONNREFUSED** · hrm_fe **200** → BASE `:8080` |
| Seed / API invent | **None** (U65) — mutates=**0** |
| Face LIVE invent | **None** |
| PROP-03e invent | **None** |
| Attendance CLOSED invent | **None** |
| remaster DONE invent | **None** |
| Nest probe as UF | **None** |
| FE re-edit this seat | **None** (QA harness + evidence only) |

---

## 2. Theme contrast (AC #1)

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] STRICT PASS — 0 pale hits (scanned 598)
```

Raw: `docs/qa/evidence/_tmp-att-g2-qa-theme-contrast.txt`

---

## 3. HDSD inventory (U76)

| # | Surface | Menu / path | Present |
|---|---------|-------------|---------|
| S76 | Rules → Máy tính bảng | Thiết lập → Quy định → tab Máy tính bảng · `att-rules-tablet-stub-precision` | 🟢 STUB badge · title **20/700/#111827** · liveInputs=0 · purpleHits=[] |
| S77 | Rules → Chấm công hộ | → tab Chấm công hộ · `att-rules-proxy-stub-precision` | 🟢 GĐ2 badge · title 20/700 · no LIVE form |
| S78 | Rules → Tự động | → tab Tự động chấm công · `att-rules-auto-stub-precision` | 🟢 STUB + ACCEPTED_AS_IS · title 20/700 |
| S79 | Settings → Quy định làm thêm | sidebar · `att-cfg-redirect-overtime-*` | 🟢 CFG badge · link **href=/settings** · primary `#1E40AF` |
| S80 | Settings → Quy định nghỉ | `att-cfg-redirect-leave-rules-*` | 🟢 CFG · href=/settings only |
| S81 | Settings → Đi muộn/Về sớm | `att-cfg-redirect-late-early-*` | 🟢 CFG · href=/settings only |
| S82 | Settings → Quy định làm đơn | `att-cfg-redirect-request-rules-*` | 🟢 CFG · href=/settings only |
| S83 | Settings → Người dùng | `att-settings-users-stub-precision` | 🟢 STUB · no-op · liveInputs=0 |
| S84 | Settings → Vai trò | `att-settings-roles-stub-precision` | 🟢 STUB · no-op |
| S85 | Settings → Hệ thống | `att-settings-system-stub-precision` | 🟢 STUB · no-op |
| Spot | Face HOLD + PROP-03e | Clock → Face / QR | 🟢 hold banner + shell · PROP-03e SKIP · EmployeeQRCard=0 |

---

## 4. Browser click path (U65)

1. Login API `ceo@xe.vn` → inject token → `/hr/attendance?companyId=main` on hrm_fe `:8080`
2. **Spot** Clock-in → Face ID — hold banner + shell; QR → `att-prop-03e-qr-card-skip`; face_live=0
3. **Thiết lập** → Quy định chấm công — rules shell `att-settings-rules-precision`
4. **S76** tab Máy tính bảng — STUB honesty; empty Card; force-click no mutate
5. **S77** tab Chấm công hộ — GĐ2 honesty; no LIVE inputs
6. **S78** tab Tự động chấm công — STUB + ACCEPTED_AS_IS
7. **S79–S82** sidebar CFG items — banner ≥20 + CFG badge + link `href=/settings` only (no navigate invent; no persist form)
8. **S83–S85** Người dùng / Vai trò / Hệ thống — STUB hold + empty Card; force-click mutatesDelta=0

**Script:** `scripts/qa/_tmp-po-hrm-ui-brand-w3-att-g2-qa.mjs`  
**JSON:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-att-g2-qa-browser.PASS.json`  
**Harness exit:** **0** · `failReasons=[]` · checks **14/14** `pass:true` · screens **12**

---

## 5. Exit checks matrix

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | theme-contrast --strict | **PASS** | exit 0 · 0 pale · primary #1E40AF |
| 2 | titles ≥20 / text #111827 / primary #1E40AF; no purple/orange AI | **PASS** | all G2 titles 20/700 `rgb(17,24,39)`; CFG links `rgb(30,64,175)`; purpleHits=[] |
| 3 | stubs disabled/no-op; CFG redirect only | **PASS** | S76–S78/S83–S85 liveInputs=0 · mutatesDelta=0; S79–S82 href=/settings only |
| 4 | Face HOLD · PROP-03e SKIP · no ATT-A..G1 invent reopen | **PASS** | spot Face HOLD + PROP-03e SKIP · honesty gates false claims |
| 5 | WRITE this evidence BEFORE finish | **PASS** | this file written `endedAt=04:25:39Z` |

---

## 6. Network (FE path only)

| Method | URL | Status | Note |
|--------|-----|--------|------|
| GET | `/api/hrm/attendance/rules?company_id=main` | **200** | rules shell load |
| GET | `/api/hrm/attendance/overview?company_id=main&year=2026` | **200** | page bootstrap |
| GET | `/api/hrm/face-data?company_id=main` | **200** | Face HOLD path (not LIVE) |
| GET | `/api/hrm/settings-catalogs` | **200** | settings shell side-load |
| — | mutates POST/PUT/PATCH/DELETE | **0** | U65 |

No seed. No Nest probe as UF. CFG surfaces do not invent Attendance persist. ATT-A..G1 mutate wires not exercised.

---

## 7. Screens (this harness run)

| # | Path |
|---|------|
| 00 | `docs/qa/evidence/screens/po-hrm-ui-brand-w3-att-g2-qa/00-spot-face-prop03e.png` |
| 01 | `…/01-s76-tablet-stub.png` |
| 02 | `…/02-s77-proxy-gd2.png` |
| 03 | `…/03-s78-auto-asis.png` |
| 04 | `…/04-s79-cfg-overtime.png` |
| 05 | `…/05-s80-cfg-leave-rules.png` |
| 06 | `…/06-s81-cfg-late-early.png` |
| 07 | `…/07-s82-cfg-request-rules.png` |
| 08 | `…/08-s83-users-stub.png` |
| 09 | `…/09-s84-roles-stub.png` |
| 10 | `…/010-s85-system-stub.png` |
| 99 | `…/99-final.png` |

---

## 8. Residuals (non-blocking)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| Portal `:5173` | OBS | Harness used hrm_fe `:8080` fallback | devops optional |
| PRODUCT_STUB honesty | OBS | S76–S78/S83–S85 intentional until catalog SoT / GĐ2 API — not FAIL | defer product |

**Did not** invent Face LIVE · Attendance CLOSED · remaster DONE · PROP-03e card · seed · Nest UF · FE re-edit.

---

## 9. Forbidden honesty

- No seed · no API-only PASS as UF
- **Face not LIVE** · **Attendance not CLOSED** · **remaster program not DONE**
- **PROP-03e** remains SKIP
- CFG = redirect link only — no invent Nest CFG persist on Attendance

---

## completion_report

**Closed:** W3-ATT-G2 brand QA — U65 browser `ceo@xe.vn` / `main` on hrm_fe `:8080`. theme-contrast --strict exit 0. S76 tablet STUB; S77 proxy GĐ2; S78 auto STUB+ACCEPTED_AS_IS; S79–S82 CFG redirect href=/settings only (primary link); S83–S85 users/roles/system STUB no-op; Face HOLD + PROP-03e SKIP spot; mutates=0; checks **14/14**. Evidence file written this seat. Attendance **not** CLOSED · Face **not** LIVE · remaster **not** DONE · PROP-03e **not** invent.

**Residual:** portal `:5173` down OBS; PRODUCT_STUB honesty intentional (not FAIL).

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-G2-QC
from_role: pm
to_role: qc
priority: P0
lane: governance
entry_criteria: ATT-G2-QA PASS_TO_PM · evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-g2-qa.md present · checks 14/14 · theme-contrast --strict exit 0
scope: QC brand wave GWC docs-only — audit ATT-G2 QA evidence S76–S85 honesty (tablet/proxy/auto STUB · CFG redirect /settings · users/roles/system STUB) + Face HOLD · PROP-03e SKIP · mutates=0 · ADR §8–§10
AC:
  - GWC (docs-only) if evidence matrix + screens + harness PASS.json complete
  - attendance_closed=false · face_live=false · remaster_program_done=false · prop_03e SKIP kept
  - cấm claim remaster DONE / Attendance CLOSED / Face LIVE
  - do not invent Nest CFG LIVE or reopen ATT-A..G1 without regression
cấm: seed · Nest invent · remaster DONE · Attendance CLOSED
ack_status target: PASS_TO_PM (GWC brand wave — not remaster DONE)
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-att-g2-qc.md
```

## ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-g2-qa.md`
