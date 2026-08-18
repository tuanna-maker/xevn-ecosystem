# QA-HDSD-MUTATE-RET-03-SHR — Shareholder POST 201 + F5 persist

| Field | Value |
|-------|--------|
| **Date** | 2026-07-30 (ICT) · evidence stamp `20260731` |
| **Role** | qa |
| **work_item_id** | `QA-HDSD-MUTATE-RET-03-SHR` |
| **Program** | `P-HDSD-QA-SRS-01` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **Env** | portal `http://127.0.0.1:5173` · xbos-api `:28002` · hrm-api `:28001` |
| **Policy** | U65 zero-seed · browser mutate only · cấm seed |
| **Dev handoff** | `docs/qa/evidence/d-hdsd-mutate-shr-f5-01-20260730.md` |
| **Harness** | `node scripts/qa/qa-hdsd-mutate-ret-03-shr-browser.mjs` |
| **Runtime JSON** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-shr-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/hdsd-mutate-ret-03-shr-20260730/` |

---

## 1. Entry / L0

| Gate | Result |
|------|--------|
| D-OPS-RESUME-L0-01 | **PASS** (entry criteria) |
| `node scripts/qc-dev-stack.mjs` | **exit 0** — hrm/xbos/portal HTTP 200 |
| `node scripts/qc-fe-be-api-health.mjs` | **exit 0** — ALL PASS (direct + proxy employees/catalog) |

---

## 2. TC-HDSD-03-02-01 · UF-XBOS-05 — Thêm cổ đông holding

**Verdict: 🟢 PASS**

| Step | Evidence |
|------|----------|
| Login | `ceo@xe.vn` → `/command-center` |
| Navigate | CC → Settings `company_member_units` → row **TẬP ĐOÀN** → **Chỉnh sửa** |
| Mutate | `#hdsd-shareholder-add-row` → type `QA HDSDPUII5` → `[data-testid^=hdsd-shareholder-save-]` click |
| **Network POST** | **`POST /api/xbos/org-foundation/legal-entities/5abd9a32-bd8c-41e9-bc4a-eb61dc3a98bb/shareholders` → 201** |
| **FE sau 2xx** | Row visible via `innerText` — stamp `QA HDSDPUII5` present |
| **F5** | Full reload → reopen holding edit → stamp **still visible** (`innerText`) |
| Post-save refetch | GET shareholders **200** immediately after POST 201 |

**Delta vs RET-02:** RET-02 had POST 201 but F5 ✗; D-HDSD-MUTATE-SHR-F5-01 fix closes list sync + refetch — **promoted 🟢**.

**Screenshots:** `03-02-holding-edit.png` · `03-02-after-save.png` · `03-02-fe-after-mutate.png` · `03-02-after-f5.png`

**spec_ref:** UF-XBOS-05 · SRS mutate AC: POST 2xx → UI row → F5 persist

---

## 3. Regression (same harness)

| TC | UF | Verdict | Detail |
|----|-----|---------|--------|
| TC-HDSD-04-02-01 | UF-XBOS-10 | 🟢 | `?settings=workflow_designer` · workflow text · GET definitions **200** · no error banner |
| TC-HDSD-10-04-01 | UF-HRM-MENU-05 | 🟢 | `/hr/internal_services` → `/hr/internal-services` · no console 404 · no error banner |

---

## 4. Console / residual (not blocking UF-XBOS-05)

| Item | Severity | Note |
|------|----------|------|
| GET `legal-entities/xbos-group-holding-root/documents` **404** | 🟡 GWC | Pre-existing slug vs UUID path — unrelated to shareholder mutate |
| HRM mutate TC 05–08 | ⚪ out of scope | Full RET-03 HRM wave deferred per PM slice (stack stability from RET-02) |

---

## 5. Handoff

- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-shr-20260731.md`

### completion_report

**Closed:** TC-HDSD-03-02-01 UF-XBOS-05 — browser-only shareholder **POST 201** + **FE after mutate** + **F5 persist** with stamp `QA HDSDPUII5`. D-HDSD-MUTATE-SHR-F5-01 verified. Regression UF-XBOS-10 + internal_services **🟢**. L0 **PASS**.

**Residual:** legal-entity documents 404 on slug path (GWC, not shareholder); full HDSD mutate RET-03 HRM TCs (05–08) still open on separate WI.

### next_owner

`pm`

### next_dispatch_prompt

```
work_item_id: PM-HDSD-MUTATE-SHR-PROMOTE-01
from_role: qa | to_role: pm
entry_criteria: docs/qa/evidence/qa-hdsd-mutate-ret-03-shr-20260731.md PASS_TO_PM — UF-XBOS-05 TC-HDSD-03-02-01 🟢 POST 201 + F5
exit_criteria: Promote UF-XBOS-05 / TC-HDSD-03-02-01 to 🟢 in HDSD matrix + USER_FLOW_OPERABILITY_MATRIX; close R-QA-SHR-AUTO-01; optional qc spot shareholder slice; dispatch QA-HDSD-MUTATE-RET-03 full HRM wave when D-OPS stack stable
residual: legal-entity documents 404 slug · HRM mutate 05–08 out of scope this WI
ack_status: PASS_TO_USER summary
```
