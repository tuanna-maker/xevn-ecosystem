# PO-HRM-UI-BRAND-W3-EMP-C-QA — Nested profile tabs remaster (E18, E20–E24)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-EMP-C-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser-only |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | W3-EMP-C · E18, E20–E24 |
| **FE entry** | `docs/qa/evidence/po-hrm-ui-brand-w3-emp-c.md` (`READY_FOR_QA`) |
| **Prior** | EMP-B QA PASS · `docs/qa/evidence/po-hrm-ui-brand-w3-emp-b-qa.md` |
| **RE-DISPATCH** | prior `511237ee` stalled n=2 · evidence MISS → this seat |
| **Harness** | `scripts/qa/_tmp-po-hrm-ui-brand-w3-emp-c-qa.mjs` |
| **Browser JSON** | `docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-emp-c-qa-browser.json` |
| **Commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Scope / cấm claim

| In scope | Out of scope (cấm invent) |
|----------|---------------------------|
| Theme-contrast `--strict` | Employees module CLOSED |
| E18 Việc làm honesty + ops-dense (empty honesty OK) | Job Nest CLOSED |
| E20 Tài sản · E21 KPI ops-dense cards | OCR invent (CORE-04 OUT) |
| E22 CV / Bằng / CC / Kỹ năng secondary labels | QR invent (PROP-03e SKIP) |
| E23 Khen thưởng/kỷ luật · E24 Gia đình | Nest/seed · product GO |
| SoftDel + list→detail keep outside tabs | Remaster program DONE |
| DialogTitle floor inherit ≥20 (SoftDel keep) | Fake month trend invent |

---

## 2. L0 + theme gate

| Check | Result |
|-------|--------|
| L0 probe | hrm **200** · xbos **200** · portal **200** (`:5173`) |
| `pnpm run verify:xevn:theme-contrast -- --strict` | **exit 0** · STRICT PASS · pale hits=**0** · scanned 598 |
| Seed | **none** (U65) |
| Mutates | **0** (SoftDel Hủy only) |
| pageErrors / consoleErrors | **[]** / **[]** |

---

## 3. Browser checks (U65 FE path)

**URL entry:** `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main`  
**Click path:** SoftDel ⋯→Xóa→Hủy → ⋯→Xem → `/employees/:id` → Công việc / Tài sản / KPI / CV / Bằng / CC / Kỹ năng / Khen thưởng / Gia đình

| ID | Check | Verdict | Evidence |
|----|-------|---------|----------|
| **SoftDel keep** | AlertDialog «Xác nhận xóa nhân viên» **20px/700/#111827** · Hủy · 0 archive POST | **PASS** | `01-softdel-alertdialog.png` |
| **navigate** | list → `/hr/employees/{id}` · GET by id **200** `company_id=main` · no 404/409 | **PASS** | detailGets JSON |
| **E18** | `data-testid=emp-job-honesty` visible · secondary · purple/pastel/classAi=0 · empty «Chưa có công việc» — `emp-job-trend-honesty` **N/A** until jobs>0 (no fake month invent) | **PASS** | `02-e18-viec-lam.png` |
| **E20** | Tài sản ops-dense cards · gradient/purple/AI class=0 | **PASS** | `03-e20-tai-san.png` |
| **E21** | KPI «Đánh giá KPI» ops-dense DNA cards · no purple/amber AI gradients | **PASS** | `04-e21-kpi.png` |
| **E22** | CV + Bằng + CC + Kỹ năng · pale/purple/yellow-500 invent=0 · secondary labels | **PASS** | `05`–`08` screens |
| **E23** | Khen thưởng/kỷ luật ops-dense KPI · DNA chrome | **PASS** | `09-e23-rewards.png` |
| **E24** | Gia đình · secondary empty/labels · no purple AI | **PASS** | `10-e24-family.png` |
| OCR / QR | OUT / SKIP | **PASS** (honesty) | no invent |

### Title floor (ADR §10 — no regress)

| Surface | Title | fontSize | fontWeight | color |
|---------|-------|----------|------------|-------|
| SoftDel keep | Xác nhận xóa nhân viên | 20px | 700 | rgb(17,24,39) · `text-[20px] font-bold` |

### J-* / L2.5

| Journey | Path | Result |
|---------|------|--------|
| list→detail ≈ J-HRM-02 | ⋯→Xem → profile | GET `:id` **200** · URL `/hr/employees/0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` |
| SoftDel lifecycle UI | ⋯→Xóa → AlertDialog → Hủy | wire UI PASS · 0 mutates |

---

## 4. Screenshots

1. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/01-softdel-alertdialog.png`
2. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/02-e18-viec-lam.png`
3. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/03-e20-tai-san.png`
4. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/04-e21-kpi.png`
5. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/05-e22-cv.png`
6. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/06-e22-degrees.png`
7. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/07-e22-certificates.png`
8. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/08-e22-skills.png`
9. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/09-e23-rewards.png`
10. `docs/qa/evidence/screens/po-hrm-ui-brand-w3-emp-c-qa/10-e24-family.png`

---

## 5. Residual (not blockers for EMP-C brand)

| ID | Item | Owner |
|----|------|-------|
| **OBS-E18-empty-trend** | Sample NV has 0 jobs — `emp-job-trend-honesty` unmounted when `jobs.length===0`; static code has stub (no Math.random runtime); empty = no fake month invent · re-spot when jobs>0 | defer |
| **OBS-E22-skills-soft** | Skills empty — `bg-xevn-warning` soft chip not visually exercised; `yellow-500=0` on panel scan; source maps soft→`bg-xevn-warning` | defer if sponsor needs soft-chip screenshot |
| **R-job-trend-api** | Nest history API to replace trend honesty stub — not invent CLOSED | defer BE |
| **OBS-profile-shell-tab-icons** | `EmployeeProfile.tsx` group/tab icon colors (rose/amber/cyan) outside EMP-C panel paths — shell, not panel remaster | defer PORT/shell if needed |
| **R-remaster-DONE** | Forbidden — Employees not CLOSED · Job Nest not CLOSED · remaster program not DONE | — |
| **R-qc-brand-wave** | EMP FE A/B/C brand seats green → QC brand GWC when ATT also green | **pm → qc** |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W3-EMP-C-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-emp-c-qa.md
completion_report: |
  W3-EMP-C brand QA PASS. theme-contrast --strict exit 0. U65 ceo@xe.vn browser:
  SoftDel keep 20px/700; list→detail GET 200; E18 emp-job-honesty + empty honesty
  (trend N/A until jobs>0); E20–E21 ops-dense no purple/pastel AI gradients;
  E22 CV/Bằng/CC/Skills yellow-500 invent=0; E23–E24 DNA chrome. 0 mutates ·
  0 pageErrors. OCR OUT · QR SKIP. Employees / Job Nest not CLOSED. DialogTitle
  floor not regressed. EMP FE squad W3 A/B/C brand seats QA-green.
next_owner: pm
next_dispatch_prompt: |
  Task pm intake PASS_TO_PM PO-HRM-UI-BRAND-W3-EMP-C-QA
  evidence: docs/qa/evidence/po-hrm-ui-brand-w3-emp-c-qa.md
  next: EMP FE W3 brand seats A/B/C complete → Task qc brand GWC when ATT also green
  cấm: invent Employees CLOSED · Job Nest CLOSED · remaster DONE · product GO
pm_dispatch_hint: EMP-C brand seat CLOSED for QA — QC brand wave when ATT green; not product GO
```

### next_dispatch_prompt (copy-ready)

```text
Task pm intake PASS_TO_PM work_item_id=PO-HRM-UI-BRAND-W3-EMP-C-QA
evidence: docs/qa/evidence/po-hrm-ui-brand-w3-emp-c-qa.md
verdict: PASS · theme-contrast --strict 0 · E18 honesty · E20–E24 ops-dense/DNA · SoftDel+navigate keep · 0 mutates
next: EMP FE squad W3 complete → Task qc brand GWC when ATT seats also PASS
cấm: Employees CLOSED invent · Job Nest CLOSED · remaster DONE · product GO · seed
```
