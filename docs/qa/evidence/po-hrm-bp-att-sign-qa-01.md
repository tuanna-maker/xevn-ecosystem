# Evidence — PO-HRM-BP-ATT-SIGN-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | execution · UC-BP-ATT-11 · TR-CM-16 |
| **be_ref** | `po-hrm-bp-att-sign-be-01.md` · seal **b36208fa** (no BE re-code) |
| **uf_ref** | `po-hrm-bp-att-sign-uf-ba-01.md` · UF-HRM-ATT-SIGN · J-HRM-06c |
| **ack_status** | **PASS_WITH_OBS** |
| **verdict** | L1 BE scope parity **PASS** · L0 **PASS** · UF browser **BLOCKED-OBS** (U65 — no `submitted` sheet) |
| **u65_zero_seed** | true — no `pnpm seed:*` |
| **attendance_closed** | **false** (must_keep) |
| **hdsd_align** | Portal `:5173` → HRM embed → Chấm công → menu **Bảng chấm công** (`att-sheets-precision`) |
| **runtime_commit** | `dc930c5` (QA machine) · BE handoff cites `b36208fa` |

---

## L1 — jest TR-CM-16 (SP-ATT-SIGN-01..04)

```bash
cd apps/api/hrm-api
pnpm exec jest src/attendance/attendance-sheet-scope-parity.spec.ts
```

| Result | Detail |
|--------|--------|
| **Exit 0** | 2026-08-05 · **5/5** tests PASS · ~46s |

**BE scope parity (runtime):** aligned with `po-hrm-bp-att-sign-be-01.md` — no BE changes in this QA wave.

---

## L0 — stack / FE↔BE

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **PASS** — hrm-api :28001 · xbos-api :28002 · portal :5173 |
| `pnpm run qc:fe-be-health` | **PASS** — login · employees · catalog-sync · proxy routes |

Seed: **none**

---

## L2 / U65 browser — UF-HRM-ATT-SIGN (partial)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Repro:** `node scripts/qa/_tmp-po-hrm-bp-att-sign-qa-01.mjs`

| Step | AC | Evidence | Verdict |
|------|-----|----------|---------|
| S0–S1 | Login + mở **Bảng chấm công** | API inject + menu **Bảng chấm công** · `GET …/attendance-sheets?company_id=main` **200** (proxy) | 🟢 load |
| S1 list | `att-sheets-precision` visible | `sheetsListVisible=true` | 🟢 |
| S2 | Mở row → chi tiết weekly | `att-weekly-precision` visible · click row đầu | 🟢 |
| S3 | Panel **Ký chốt** (`submitted`) | `att-sign-panel` **false** · `GET …/signatures` **0×** | 🟡 **OBS** |
| Prereq | Sheet `status=submitted` | Direct API list: **0** rows · UI table **2** rows · **0** `submitted` | 🟡 **BLOCKED-U65** |
| Draft UX | Nháp / chưa gửi ký | `att-sign-panel-hold-draft` **true** (copy «gửi chờ ký trước…») | 🟢 honesty |

**Console:** `pageErrors=[]`

### OBS (not FAIL for BE QA gate)

| ID | Note |
|----|------|
| **OBS-UF-NO-SUBMITTED** | U65: không có bảng `submitted` — không thể AC-ATT-SIGN-UF-01..07 mutate (NV/QL/HCNS/close/F5). Cần luồng FE **tổng hợp / gửi chờ ký** (FR-UC-BP-ATT-10 funnel) trước ký. |
| **OBS-LIST-DENSITY** | API list trả **0** item trong probe token path; UI vẫn **2** dòng — QA không seed; retest UF sau khi list/API đồng bộ qua FE tạo sheet. |
| **OBS-MANIFEST** | `traceability.scope_parity_ack` chưa flip — chờ PM/QC sau UF 🟢 (per BE handoff). |

### Cấm claim

- Attendance **CLOSED** · product GO · full UF 🟢 · seed sign steps

---

## Screenshots / machine JSON

| Artifact | Path |
|----------|------|
| List | `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-01/01-att-sheets-list.png` |
| After row click | `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-01/02-after-sheet-click.png` |
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-01-browser.json` |

---

## Residual

| ID | Owner | Priority |
|----|-------|----------|
| **OBS-UF-NO-SUBMITTED** | dev-fe | P0 — submit funnel → `submitted` + panel `att-sign-panel` + signatures GET |
| **UF-HRM-ATT-SIGN retest** | qa | P0 — sau FE + U65 chain (NV→QL→HCNS→close→F5) |
| **OBS-LIST-DENSITY** | dev-fe / dev-be | P1 — list empty API vs UI rows (scope `main`) |

---

## completion_report

**Closed:** Evidence file created/filled. `attendance-sheet-scope-parity.spec.ts` **exit 0** (5/5). L0 `qc:dev-stack` + `qc:fe-be-health` **ALL PASS**. U65 browser: Bảng chấm công load **200**, weekly detail opens, draft-hold sign UX visible; **no** `submitted` sheet → **no** full Ký chốt panel / signatures GET — UF mutate **not promoted**.

**Open:** UF-HRM-ATT-SIGN / J-HRM-06c happy path; AC-ATT-SIGN-UF-02..07; Manifest `scope_parity_ack`; Attendance not CLOSED.

---

## next_owner

**pm** → dispatch **dev-fe** (then **qa** retest)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-ATT-SIGN-FE-02
from_role: pm
to_role: dev-fe
lane: execution
priority: P0

INTAKE: QA PASS_WITH_OBS PO-HRM-BP-ATT-SIGN-QA-01 — BE jest SP-ATT-SIGN 5/5 + L0 PASS; U65 blocked UF vì không có sheet submitted / không att-sign-panel (chỉ att-sign-panel-hold-draft).
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qa-01.md · po-hrm-bp-att-sign-uf-ba-01.md · AttendanceSheetSignPanel.tsx · Attendance.tsx renderWeeklyAttendance
spec_ref: FR-UC-BP-ATT-11 · FR-UC-BP-ATT-10 funnel · F-ATT-WF-SIGN · UF-HRM-ATT-SIGN
entry_criteria: hrm-api b36208fa routes live; panel component exists; U65 no seed
exit_criteria: FE chain tạo/gửi sheet → status=submitted; att-sign-panel + GET signatures 200; wire POST sign + close UI; jest/RTL smoke if present; READY_FOR_QA
must_keep: no Attendance CLOSED claim · no seed · vi-VN labels · can_close gate
forbidden_paths: apps/api/hrm-api/** (BE sealed)
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-fe-02.md
pm_dispatch_hint: PO-HRM-BP-ATT-SIGN-QA-02 retest UF browser sau FE
```

---

*End evidence PO-HRM-BP-ATT-SIGN-QA-01.*
