# PO-HRM-UI-BRAND-W3-EMP-A-QA — Employees list + create/import + profile shell

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-EMP-A-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | W3-EMP-A · E01–E08, E10–E11, E28 |
| **FE entry** | `docs/qa/evidence/po-hrm-ui-brand-w3-emp-a.md` (`READY_FOR_QA`) |
| **Harness** | `scripts/qa/_tmp-po-hrm-ui-brand-w3-emp-a-qa.mjs` |
| **Browser JSON** | `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-emp-a-qa-browser.json` |
| **Commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope / cấm claim

| In scope | Out of scope (cấm invent) |
|----------|---------------------------|
| Theme-contrast `--strict` | Employees module CLOSED |
| E01–E08, E10–E11, E28 brand chrome | OCR invent (CORE-04 OUT) |
| SoftDel ⋯→Xóa→AlertDialog wire keep | QR invent (PROP-03e SKIP) |
| List→detail scope (J-HRM-02 class) | Nest/seed · product GO |
| | W3-EMP-B (E09, E12–E17…) |

---

## 2. L0 + theme gate

| Check | Result |
|-------|--------|
| `qc:dev-stack` / probe | hrm **200** · xbos **200** · portal **200** (`:5173`) |
| `qc:fe-be-health` (exit) | **ALL PASS** |
| `pnpm run verify:xevn:theme-contrast -- --strict` | **exit 0** · STRICT PASS · pale hits=**0** · scanned 598 |
| Seed | **none** (U65) |

**Note:** Mid-run portal briefly `ECONNREFUSED` after prior Vite `ECONNRESET`; QA restarted `web-portal` Vite `:5173` then retest PASS. Not claimed as product defect.

---

## 3. Browser checks (U65 FE path)

**URL entry:** `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main`  
**Click path:** login inject → Nhân sự list → Thêm NV → SoftDel open/Hủy → Import Excel open/Hủy → ⋯→Xem → profile Thông tin chung

| ID | Check | Verdict | Evidence |
|----|-------|---------|----------|
| **E01–E06** | List title `#111827` / subtitle sharp / search / 3 filters / company col «Tập đoàn XeVN» / pagination `1 / 2` sharp / GET employees **200** | **PASS** | `screens/…/01-employees-list.png` |
| **E07** | Thêm NV Dialog `xevn-dialog-surface` · `::before` brand bar `rgb(30,64,175)` 3px · FormLabel sharp · sticky footer | **PASS** | `02-add-employee-dialog.png` |
| **SoftDel** | ⋯→Xóa → AlertDialog «Xác nhận xóa nhân viên» · Hủy (no archive mutate) | **PASS** | `03-softdel-alertdialog.png` |
| **E08** | Import Excel · instructions on light ops · body `#111827` / secondary `#4B5563` · pale=0 · no blue glass | **PASS** | `04-import-excel.png` |
| **E28** | ⋯→Xem → `/hr/employees/{id}` · GET by id **200** `company_id=main` · no 404/409 | **PASS** | detailGets in JSON |
| **E10–E11** | Active tab «Thông tin chung» `bg-primary` `#1E40AF` · not purple · InfoItem labels `#4B5563` (16) · values sharp | **PASS** | `05-profile-general.png` |
| OCR / QR | OUT / SKIP | **PASS** (honesty) | no invent |

**Console / pageErrors:** `[]`  
**Mutates:** SoftDel cancel only · Import cancel only · no seed · no archive commit.

### J-* / L2.5

| Journey | Path | Result |
|---------|------|--------|
| **E28** ≈ J-HRM-02 class | list → ⋯→Xem → profile | GET `:id` **200** · URL `/hr/employees/0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` |

---

## 4. Screenshots

1. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-a-qa/01-employees-list.png`
2. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-a-qa/02-add-employee-dialog.png`
3. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-a-qa/03-softdel-alertdialog.png`
4. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-a-qa/04-import-excel.png`
5. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-a-qa/05-profile-general.png`

---

## 5. Residual (not blockers for EMP-A brand)

| ID | Item | Owner |
|----|------|-------|
| **W3-EMP-B** | E09 export + lifecycle tabs E12–E17, E19, E25–E27 | **PM → dev-fe** |
| **R3-StatsCards** | Demo stats numbers remain display chrome (not LIVE API) | defer product/BE |
| **OBS-portal-vite** | Portal Vite mid-session crash class (`ECONNRESET`) — ops flaky | devops if repeats |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W3-EMP-A-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-emp-a-qa.md
completion_report: |
  W3-EMP-A brand QA PASS: theme-contrast --strict exit 0; U65 ceo@xe.vn browser
  E01–E08 + SoftDel AlertDialog keep + E28 list→detail GET 200 + E10–E11 primary
  tab / secondary InfoItem labels. OCR OUT · QR SKIP. Employees not CLOSED.
  No seed. Portal briefly restarted after Vite drop — retest green.
next_owner: pm
next_dispatch_prompt: |
  Task dev-fe work_item_id=PO-HRM-UI-BRAND-W3-EMP-B
  entry: EMP-A QA PASS docs/qa/evidence/po-hrm-ui-brand-w3-emp-a-qa.md
  inventory: E09 export + E12–E17 lifecycle tabs (+ E19,E25–E27 per program)
  ADR §8–§10 · U65 · preserve SoftDel + list→detail · no OCR/QR invent
  exit: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b.md · READY_FOR_QA
  cấm: Employees CLOSED invent · seed · Nest beauty change
pm_dispatch_hint: After EMP-B (or when PORT/ATT QA also green) → QC brand wave GWC — not product GO
```

### next_dispatch_prompt (copy-ready)

```text
Task dev-fe work_item_id=PO-HRM-UI-BRAND-W3-EMP-B
role: dev-fe · U65 · ADR-20260805 §8–§10
entry: docs/qa/evidence/po-hrm-ui-brand-w3-emp-a-qa.md PASS_TO_PM
inventory: E09 export dialog + profile lifecycle tabs E12–E17 (and E19,E25–E27 per W3 program)
must_keep: SoftDel archive path · navigate(/employees/:id) · stub honesty · no OCR/QR invent
exit: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b.md · READY_FOR_QA
cấm: seed · Employees CLOSED invent · claim remaster program DONE
```
