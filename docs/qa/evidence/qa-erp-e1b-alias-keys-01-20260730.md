# QA-ERP-E1B-ALIAS-KEYS-01 — DEC alias keys (L1 + browser)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-ERP-E1B-ALIAS-KEYS-01` |
| **dev_handoff** | `D-BE-ERP-E1B-ALIAS-KEYS-01` · `docs/qa/evidence/d-be-erp-e1b-alias-keys-01-20260728.md` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-07-30 |
| **lane** | execution E1-B · U65 zero-seed · HOLD_DEPLOY |
| **spec_ref** | `docs/program/deltas/BA_ERP_E1B_SRS_01_20260728.md` · AC-SET-UI-05 · AC-SC-DEC-ALIAS-01/02 |
| **ack_status** | **PASS_TO_PM** |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Host** | `http://127.0.0.1:5173` (proxy → HRM `:28001`, XBOS `:28002`) |
| **Script** | `scripts/qa/qa-erp-e1b-alias-keys-01.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-erp-e1b-alias-keys-01-runtime.json` |
| **Screens** | `docs/qa/evidence/screens/qa-erp-e1b-alias-keys-01/` |

---

## Runtime truth

```text
=== VERDICT PASS hardFails=[] ===
```

| Field | Value |
|-------|--------|
| `verdict` | **PASS** |
| `hardFails` | **[]** |
| `finishedAt` | 2026-07-30T09:15:43Z (runtime JSON) |
| Seed | **false** (U65) |
| HTTPS / :54321 | **not in scope** (residual CLOSED per PM) |

---

## L0

| Check | Result |
|-------|--------|
| HRM `:28001/api/hrm` | HTTP **200** |
| XBOS `:28002/api/xbos` | HTTP **200** |
| Portal `:5173` | HTTP **200** |
| Login `POST /api/xbos/auth/login` | **201** |

---

## L1 — alias merge & pull (AC-SC-DEC-ALIAS-01)

| Probe | Result |
|-------|--------|
| `GET …/settings-catalogs/decision_types/items` | **200** · `catalog_key=hr_decision_types` · count **3** · aliases `hr_decision_types, decision_types` · sample HRD_01..03 |
| `GET …/settings-catalogs/hr_decision_types/items` | **200** · count **3** · same merge |
| `POST …/catalog-sync/pull/decision_types` | **201** `HRM-SYNC-200` · `resolvedFrom=decision_types` · `storageKey=hr_decision_types` |
| Regression `job_titles` / `leave_types` | **200** · counts 38 / 6 |

### Jest (BE regression)

```bash
pnpm --filter hrm-api exec jest --runInBand src/settings-catalogs/d-be-erp-e1b-alias-keys-01.spec.ts
```

**10/10 PASS** · exit 0

---

## L2 browser (U65 — no seed)

| AC | Result | Evidence |
|----|--------|----------|
| **AC-SET-UI-05** Settings Loại quyết định | **PASS** | 3 rows HRD_01..03 · `FR-HRM-SC-DEC-01` visible · screenshot `01-decision-types-alias.png` |
| **AC-SC-DEC-ALIAS-02** Decisions create picker | **PASS** | Dialog **Thêm quyết định** → combobox options HRD_01 Bổ nhiệm, HRD_02, HRD_03 · `02-decisions-picker.png` |

Path: login inject → Settings → **Danh mục nghiệp vụ** → tab Loại quyết định; then `/hr/decisions` → **Thêm quyết định** → open Loại quyết định picker.

---

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| OpenAPI yaml refresh | BE optional | Dev handoff |
| Consumer FREE_TEXT beyond DEC | E1-A | Out of alias-keys scope |
| `work_shifts` ↔ `shifts` SoT | SA governance HOLD | Unchanged |

---

## Handoff contract

- **completion_report:** Closed QA retest for `D-BE-ERP-E1B-ALIAS-KEYS-01`: L0 up; L1 GET alias merge + pull resolve PASS; POS/LEAVE regression OK; jest 10/10; browser AC-SET-UI-05 + AC-SC-DEC-ALIAS-02 PASS. No seed. No deploy.
- **next_owner:** `pm` → optional `qc` if wave needs re-gate on E1-B slice only
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/qa-erp-e1b-alias-keys-01-20260730.md`
- **next_dispatch_prompt:** |
    work_item_id: QC-ERP-E1B-ALIAS-KEYS-01 (or close D-BE-ERP-E1B-ALIAS-KEYS-01 on program board)
    from_role: pm
    to_role: qc
    read_first: docs/qa/evidence/qa-erp-e1b-alias-keys-01-20260730.md
    entry_criteria: QA PASS_TO_PM alias-keys; HOLD_DEPLOY
    exit_criteria: Audit L1+L2 evidence vs BA_ERP_E1B delta AC-SC-DEC-ALIAS-*; GO/GWC or defer if E1-B QC already covered by QC-ERP-E1B-01
    evidence_path: docs/qa/evidence/qc-erp-e1b-alias-keys-01-20260730.md
