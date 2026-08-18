# PO-HRM-UI-BRAND-W3-EMP-B-QA — Export + lifecycle + contracts/BH remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-EMP-B-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | W3-EMP-B · E09, E12–E17, E19, E25–E27 |
| **FE entry** | `docs/qa/evidence/po-hrm-ui-brand-w3-emp-b.md` (`READY_FOR_QA`) |
| **Prior** | EMP-A QA PASS · `docs/qa/evidence/po-hrm-ui-brand-w3-emp-a-qa.md` |
| **RE-DISPATCH** | prior `c5ad6f2f` stalled n=2 · evidence MISS → this seat |
| **Harness** | `scripts/qa/_tmp-po-hrm-ui-brand-w3-emp-b-qa.mjs` |
| **Browser JSON** | `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-emp-b-qa-browser.json` |
| **Commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope / cấm claim

| In scope | Out of scope (cấm invent) |
|----------|---------------------------|
| Theme-contrast `--strict` | Employees module CLOSED |
| E09 export sticky + sharp title | OCR invent (CORE-04 OUT) |
| E13–E15 SoftDel / Đã xóa / Khôi phục titles ≥20px | QR invent (PROP-03e SKIP) |
| E12 salary ops-dense chrome (no pastel / purple AI KPI) | Nest/seed · product GO |
| E16–E17, E19, E25 profile tabs | Remaster program DONE |
| E27 manager picker · list→`/employees/:id` | DialogTitle floor regress (`dialog.tsx`) |
| E26 PermissionGate chrome (via salary path) | W3-EMP-C nested P2 |

---

## 2. L0 + theme gate

| Check | Result |
|-------|--------|
| `qc:dev-stack` probe | hrm **200** · xbos **200** · portal **200** (`:5173`) |
| `pnpm run verify:xevn:theme-contrast -- --strict` | **exit 0** · STRICT PASS · pale hits=**0** · scanned 598 |
| Seed | **none** (U65) |
| Archive/restore mutates | **0** (Hủy only) |

**Note:** `qc:dev-stack` printed healthy then Windows `UV_HANDLE_CLOSING` crash (exit 3221226505) after assertions — probe in harness reconfirmed L0 200/200/200. Not claimed as product defect.

---

## 3. Browser checks (U65 FE path)

**URL entry:** `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main`  
**Click path:** login inject → Xuất → SoftDel ⋯→Xóa→Hủy → Đã xóa→Khôi phục→Hủy → Thêm NV manager picker→Hủy → ⋯→Xem → Lương / Hợp đồng / BH / Đào tạo / Lịch sử CV

| ID | Check | Verdict | Evidence |
|----|-------|---------|----------|
| **E09** | Xuất dialog title **20px/700/#111827** · sticky footer CTA · pale labels=0 | **PASS** | `01-export-dialog.png` · JSON titleOk |
| **E13** | SoftDel AlertDialog «Xác nhận xóa nhân viên» **20px/700** · `text-[20px] font-bold` · Hủy (no archive POST) | **PASS** | `02-softdel-alertdialog.png` |
| **E14** | Đã xóa list title **20px/700** · purple/pale=0 · archive rows sharp | **PASS** | `03-deleted-employees.png` |
| **E15** | Khôi phục AlertDialog title **20px/700** · Hủy (no restore mutate) | **PASS** | `04-restore-alertdialog.png` |
| **E27** | Form «Quản lý trực tiếp» label sharp · picker interacted | **PASS** | `05-manager-picker-form.png` |
| **navigate** | list → `/hr/employees/{id}` · GET by id **200** `company_id=main` · no 404/409 | **PASS** | detailGets JSON |
| **E12** | Lương tab · purple/indigo class=0 · pale=0 · empty honesty «Chưa có dữ liệu lương» (no pastel KPI invent) | **PASS** | `06-profile-salary.png` |
| **E26** | CEO has `view_salary` — PermissionFallback not shown; no purple deny invent | **PASS** | JSON note |
| **E16** | Hợp đồng KPI DNA icons · purple/pale=0 · empty honesty | **PASS** | `07-profile-contract.png` |
| **E17** | Bảo hiểm chrome · purple/pale=0 | **PASS** | `08-profile-insurance.png` |
| **E19** | Đào tạo chrome · purple/pale=0 | **PASS** | `09-profile-training.png` |
| **E25** | Lịch sử CV (deep-link `tab=workHistory`) · purple/pale=0 | **PASS** | `10-profile-work-history.png` |
| OCR / QR | OUT / SKIP | **PASS** (honesty) | no invent |

**Console / pageErrors:** `[]`  
**Mutates:** `[]` · SoftDel/restore cancel only · no seed.

### Title floor (ADR §10 — no regress)

| Surface | Title | fontSize | fontWeight | color |
|---------|-------|----------|------------|-------|
| E09 Xuất | Xuất danh sách nhân viên | 20px | 700 | rgb(17,24,39) |
| E13 SoftDel | Xác nhận xóa nhân viên | 20px | 700 | rgb(17,24,39) · class `text-[20px] font-bold` |
| E14 Đã xóa | Danh sách nhân viên đã xóa | 20px | 700 | rgb(17,24,39) |
| E15 Khôi phục | Khôi phục nhân viên? | 20px | 700 | rgb(17,24,39) · class `text-[20px] font-bold` |

### J-* / L2.5

| Journey | Path | Result |
|---------|------|--------|
| list→detail ≈ J-HRM-02 | ⋯→Xem → profile | GET `:id` **200** · URL `/hr/employees/0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` |
| SoftDel lifecycle UI | ⋯→Xóa → AlertDialog → Hủy; Đã xóa → Khôi phục → Hủy | wire UI PASS · 0 mutates |

---

## 4. Screenshots

1. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/01-export-dialog.png`
2. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/02-softdel-alertdialog.png`
3. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/03-deleted-employees.png`
4. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/04-restore-alertdialog.png`
5. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/05-manager-picker-form.png`
6. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/06-profile-salary.png`
7. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/07-profile-contract.png`
8. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/08-profile-insurance.png`
9. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/09-profile-training.png`
10. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-b-qa/10-profile-work-history.png`

---

## 5. Residual (not blockers for EMP-B brand)

| ID | Item | Owner |
|----|------|-------|
| **W3-EMP-C** | Nested P2 E18, E20–E24 per inventory | **PM → later FE** |
| **OBS-salary-empty** | Sample NV has no payslip KPI cards — empty honesty OK; ops-dense KPI cards not visually exercised this persona row | defer if sponsor needs KPI card screenshot with salary data |
| **OBS-qc-dev-stack-uv** | Windows UV handle crash after healthy probe | devops if repeats |
| **R-remaster-DONE** | Forbidden — Employees not CLOSED · remaster program not DONE | — |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W3-EMP-B-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b-qa.md
completion_report: |
  RE-DISPATCH close: W3-EMP-B brand QA PASS. theme-contrast --strict exit 0.
  U65 ceo@xe.vn browser: E09 export sticky+20px title; E13/E15 SoftDel/restore
  AlertDialog text-[20px]/700; E14 archive list; E12 salary no purple/pastel KPI
  (empty honesty); E16–E17/E19/E25 no purple AI; E27 manager picker; list→detail
  GET 200. 0 mutates · 0 pageErrors. OCR OUT · QR SKIP. Employees not CLOSED.
  DialogTitle floor not regressed. Screenshots + browser JSON attached.
next_owner: pm
next_dispatch_prompt: |
  Task pm intake PASS_TO_PM PO-HRM-UI-BRAND-W3-EMP-B-QA
  evidence: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b-qa.md
  next: W3-EMP-C P2 if inventory open OR QC brand wave when PORT/ATT also PASS
  cấm: invent Employees CLOSED · remaster DONE · product GO
pm_dispatch_hint: EMP-B brand seat CLOSED for QA — chain EMP-C or QC brand GWC; not product GO
```

### next_dispatch_prompt (copy-ready)

```text
Task pm intake PASS_TO_PM work_item_id=PO-HRM-UI-BRAND-W3-EMP-B-QA
evidence: docs/qa/evidence/po-hrm-ui-brand-w3-emp-b-qa.md
verdict: PASS · theme-contrast --strict 0 · SoftDel/restore titles 20px · export sticky · profile tabs no purple AI · navigate keep
next_owner options:
  A) Task dev-fe PO-HRM-UI-BRAND-W3-EMP-C (P2 nested E18/E20–E24) if inventory open
  B) Task qc brand wave GWC when PORT/ATT seats also PASS
cấm: Employees CLOSED invent · remaster DONE · product GO · seed
```
