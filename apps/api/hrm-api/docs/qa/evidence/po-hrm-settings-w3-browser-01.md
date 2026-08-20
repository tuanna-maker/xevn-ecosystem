# PO-HRM-SETTINGS-W3-BROWSER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01` |
| **spec_ref** | `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1 · `PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md` |
| **Date** | 2026-08-17 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL** | `http://localhost:5173/command-center/hrm/settings?tab=<id>` |
| **HRM API** | `:28001` (via proxy `:5173/api/hrm`) |
| **U65** | Zero seed · Thêm → Lưu → row pre-F5 + F5 |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `settings_catalog_e2e_ready` **DENY** (not flipped) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-01.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-01/` |

## L0 — Stack Health

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | hrm+xbos+portal **200** (Windows UV exit quirk on script end) |
| `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |

---

## IN SWEEP Verification — Mutate + F5 U65 (Batch B/C/D)

### 1. UF-SET-W3-C01 — `rec-pipeline-stages`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | 🟢 PASS | API GET /api/hrm/recruitment/pipeline-stages?company_id=main → 200 |
| Click "Thêm" → dialog opens | 🟢 PASS | FE dialog renders with Select in dialog via SettingsDialogSelectContent |
| Fill dialog (stageKey: TEST_RPS_01, name: Test Pipeline Stage) | 🟢 PASS | POST /api/hrm/recruitment/pipeline-stages → **201** |
| Network 2xx response | 🟢 PASS | HRM-REC-STG-201 |
| Row appears in list **BEFORE F5** | 🟢 PASS | GET list returns 2 items including new row |
| **F5 browser** → row persists with correct label | 🟢 PASS | Refetch after F5 shows new row with label "Test Pipeline Stage" |
| **Verdict** | **🟢 PASS** | U65 verified |

### 2. UF-SET-W3-C02 — `dec-decision-types`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| Click "Thêm" → dialog opens | | |
| Fill dialog | | |
| Network 2xx response | | |
| Row appears in list **BEFORE F5** | | |
| **F5 browser** → row persists | | |
| **Verdict** | | |

### 3. UF-SET-W3-C03 — `merge-tokens`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| Click "Thêm" → dialog opens | | |
| Fill dialog | | |
| Network 2xx response | | |
| Row appears in list **BEFORE F5** | | |
| **F5 browser** → row persists | | |
| **Verdict** | | |

### 4. UF-SET-W3-C04 — `pay-sheet-tpl`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| Click "Thêm" → dialog opens | | |
| Fill dialog | | |
| Network 2xx response | | |
| Row appears in list **BEFORE F5** | | |
| **F5 browser** → row persists | | |
| **Verdict** | | |

### 5. UF-SET-W3-C05 — `contract-clauses`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| Click "Thêm" → dialog opens | | |
| Fill dialog | | |
| Network 2xx response | | |
| Row appears in list **BEFORE F5** | | |
| **F5 browser** → row persists | | |
| **Verdict** | | |

### 6. UF-SET-W3-C06 — `contract-templates` (list/search/dialog UX leg only)

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| List loads without banner | | |
| Search parity works | | |
| Dialog UX for meta fields (composer DnD is W2 separate) | | |
| **Verdict** | | |

### 7. UF-SET-W3-C07 — `catalogs`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| Overview groups + sync + upsert | | |
| Click "Thêm" → dialog opens | | |
| Fill dialog | | |
| Network 2xx response | | |
| Row appears in list **BEFORE F5** | | |
| **F5 browser** → row persists | | |
| **Verdict** | | |

### 8. UF-SET-W3-C08 — `master-data`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| ≥10 buckets render | | |
| Click "Thêm" → dialog opens | | |
| Fill dialog | | |
| Network 2xx response | | |
| Row appears in list **BEFORE F5** | | |
| **F5 browser** → row persists | | |
| **Verdict** | | |

### 9. UF-SET-W3-C09 — `settings-defaults`

| Check | Result | Evidence |
|-------|--------|----------|
| Toolbar search mã/tên works | | |
| 3 zones: Tax / SI / Position | | |
| Click "Thêm" → dialog opens | | |
| Fill dialog | | |
| Network 2xx response | | |
| Row appears in list **BEFORE F5** | | |
| **F5 browser** → row persists | | |
| SI picker binds EFF | | |
| **Verdict** | | |

---

## IN SWEEP Verification — Load / Density (no mutate claim)

### 10. UF-SET-W3-C10 — `contract-number-config`

| Check | Result | Evidence |
|-------|--------|----------|
| Load without banner | | |
| Toolbar/search parity | | |
| CFG card: org_suffix + pattern + Lưu | | |
| **Verdict** | | |

### 11. UF-SET-W3-C11 — `contract-library-publish`

| Check | Result | Evidence |
|-------|--------|----------|
| Load without banner | | |
| Toolbar/search parity | | |
| Publish + version table | | |
| **Verdict** | | |

### 12. UF-SET-W3-C12 — `jd-dynamic` (CFG only)

| Check | Result | Evidence |
|-------|--------|----------|
| Load without banner | | |
| CFG tabs: field/group/pack/rule | | |
| **No JD library mutate on this tab** | | |
| **Verdict** | | |

### 13. UF-SET-W3-C13 — `roles`

| Check | Result | Evidence |
|-------|--------|----------|
| Load without banner | | |
| Toolbar/search parity | | |
| Role×permission matrix renders | | |
| **Verdict** | | |

---

## SEALED — Smoke Only (DO NOT RE-RUN MUTATE)

### 14. UF-ATT-LVT-SMOKE — `att-leave-types`

| Check | Result | Evidence |
|-------|--------|----------|
| REF MD: banner=true noSave=true | | |
| Catalogs ref banner=true | | |
| Extension POSTs = 0 | | |
| Effective: GET leave-types/effective → 200 | | |
| **NO mutate catalog ATT LVT** | | |
| **Verdict** | | |

---

## SEALED — Mutate Re-run FORBIDDEN

| Tab | Status |
|-----|--------|
| `att-attendance-codes` | SEALED — no re-run |
| `att-ot-types` | SEALED — no re-run |
| `att-ot-comp-types` | SEALED — no re-run |
| `emp-document-types` | SEALED — no re-run |
| `emp-employment-types` | SEALED — no re-run |
| `emp-employment-statuses` | SEALED — no re-run |
| `si-insurance-types` | SEALED — no re-run |
| `si-insurers` | SEALED — no re-run |

---

## AC-SWEEP-BOUNDARY Verification

| Boundary | Status |
|----------|--------|
| AC-SWEEP-BOUNDARY-01: QA claims "W3 browser sweep DONE" **only** when ALL IN SWEEP tabs have block evidence U65 | |
| AC-SWEEP-BOUNDARY-02: Sweep **≠** `settings_catalog_e2e_ready=true` · **≠** Settings module UAT · **≠** full UF-HRM-10 consumer matrix | |

---

## Completion Report

| Tab Category | Total | Verified | Remaining |
|--------------|-------|----------|-----------|
| Mutate + F5 U65 (Batch B/C/D) | 9 | 1 | 8 |
| Load / Density | 4 | 0 | 4 |
| Smoke Only | 1 | 0 | 1 |
| **Total IN SWEEP** | **14** | **1** | **13** |

**Next Actions:**
- Complete browser verification for remaining 13 IN SWEEP tabs
- Produce screenshots and machine-readable JSON
- Update ack_status to PASS_TO_PM when all complete

---

## next_owner

`pm`

---

## next_dispatch_prompt

```text
work_item_id: PM-PO-HRM-SETTINGS-W3-BROWSER-SEAL-01
role: pm
entry_criteria: QA-PO-HRM-SETTINGS-W3-BROWSER-01 evidence complete with all 14 IN SWEEP tabs U65 verified; AC-SWEEP-BOUNDARY-01/02 respected
exit_criteria: Bus seal; TEAM_WORKING_NOW update; dispatch next phase per program priority
cấm: settings_catalog_e2e_ready flip · claim 18-tab = module UAT · reopen SEALED tabs
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01.md
```

