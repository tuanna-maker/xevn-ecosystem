# QA evidence — P1-XBOS-W5-HRM-CAT-QA-01 retest (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W5-HRM-CAT-QA-01` |
| **prior_defect** | `D-W5-HRM-CAT-SYNC-01` (scope_parity — closed by dev-be) |
| **from_role** | `qa` |
| **to_role** | `qc` |
| **ack_status** | **READY_FOR_QC** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · hrm-api `:28001` · xbos-api `:28002` |
| **matrix** | P-CC-09 · journey **J-XBOS-08** |
| **fix_ref** | `docs/qa/evidence/p1-xbos-w5-hrm-cat-be-fix-20260606.md` |

## Executive summary

| Area | Verdict | Notes |
|------|---------|-------|
| **L0** `qc:dev-stack` | **PASS** | exit **0** |
| **L1** `qc:fe-be-health` | **PASS** | exit **0** · 8/8 FE↔BE |
| **Jest regression** | **PASS** | `settings-catalogs.controller.spec.ts` + `hrm-list-scope.spec.ts` **49/49** |
| **J-XBOS-08** API sync read-back | **PASS** | POST immediate **201** → GET `effectiveItems` shows field |
| **J-XBOS-08** browser config modal | **PASS** | **Cấu hình chi tiết** lists `QA W5 HRM Cat BE Fix 20260606` |
| **J-XBOS-08** HRM embed shell | **PASS** | `/command-center/hrm/employees` loads · no Sync ERROR · no 409 banner |

**D-W5-HRM-CAT-SYNC-01: CLOSED** — write partition now aligns with GET (`main` JWT → `holding` persist/read).

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO · JWT `tenantId=xevn`, `companyId=main` · catalog partition **`holding`**.

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `pnpm --filter hrm-api test -- settings-catalogs.controller.spec.ts hrm-list-scope.spec.ts` | **0** | 49/49 |
| 4 | Node API probe — POST extension-items + GET read-back + portal proxy | **0** | See § API |
| 5 | MCP browser — settings modal + HRM embed route | — | See § Browser |

---

## J-XBOS-08 — Configure field → sync immediate → GET shows field

### API probe (direct hrm-api `:28001`)

**Field:** `qa_w5_hrm_cat_be_fix_20260606` · label `QA W5 HRM Cat BE Fix 20260606`

| Step | Call | HTTP | Result |
|------|------|-----:|--------|
| 5 | `POST /api/hrm/settings-catalogs/hrm_employee_personal_fields/extension-items` · `x-catalog-write-mode: immediate` | **201** | `HRM-SET-202` · `upserted: 1` |
| 6 | `GET /api/hrm/settings-catalogs` | **200** | `HRM-SET-200` · field in `hrmExtensionItems` **true** · `effectiveItems` **true** (11 ext / 11 eff) |
| 6b | `GET` via portal proxy `/api/hrm/settings-catalogs` | **200** | field in `effectiveItems` **true** |

**Verdict:** scope_parity **FIXED** — same read path sees immediate write.

### Browser click path

| Step | Action | URL / target | Result |
|------|--------|--------------|--------|
| 1 | Session (logged in) | `ceo@xe.vn` | **PASS** |
| 2 | Settings → Danh mục hồ sơ nhân sự | `/command-center?settings=company_group_hr` (nav via sidebar) | **PASS** — scope Tập đoàn XeVN |
| 3 | **Cấu hình chi tiết** | modal `#group-hr-fields-config-title` | **PASS** — dialog opens · live HRM catalog |
| 4 | Verify synced field visible | modal field list | **PASS** — `QA W5 HRM Cat BE Fix 20260606` present (read-back from step 5–6) |
| 7 | HRM embed employees | `/command-center/hrm/employees` | **PASS** — route shell **200** · no **HRM API Sync ERROR** · no **409** banner · iframe field-level N/A (MCP) |

### Console / network

- No **409** `companyId mismatches token scope` on settings-catalogs **GET**.
- No HRM API Sync ERROR on tested routes.
- Prior audit silent read-back gap **not reproduced** after fix.

---

## Defect status

| ID | Prior | Retest | Owner |
|----|-------|--------|-------|
| **D-W5-HRM-CAT-SYNC-01** | P0 scope_parity FAIL | **CLOSED** | `dev-be` ✅ |
| **D-W5-HRM-CAT-LIST-01** | P2 summary **3 trường** vs modal live count | **OPEN (GWC)** | `dev-fe` — not blocking J-XBOS-08 |
| **D-W5-CAT-GOV-SEED-01** | P1 dev seed 409 | **OPEN** | `dev-be` — out of W5 sync scope |

---

## Residual / not promoted

- **J-XBOS-08** — **promote to PASS** on journey map after QC ack.
- **D-W5-HRM-CAT-LIST-01** — UX card count stale until FE refresh; not scope_parity.
- Phase 1 / PROD — unchanged.

---

## Handoff

- **completion_report:** Retest J-XBOS-08 after D-W5-HRM-CAT-SYNC-01 fix — L0/L1 + jest **PASS**; POST immediate sync **201** with GET/portal read-back **PASS**; browser config modal shows synced field; HRM embed shell **PASS**. **D-W5-HRM-CAT-SYNC-01 CLOSED.**
- **next_owner:** `qc`
- **next_dispatch_prompt:** `work_item_id: P1-XBOS-W5-HRM-CAT-QC-01` · from_role: pm · to_role: qc · entry_criteria: QA READY_FOR_QC `docs/qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md` — J-XBOS-08 PASS localhost; D-W5-HRM-CAT-SYNC-01 closed; L0–L2 spot PASS · exit_criteria: QC audit W5 HRM catalog wave; confirm J-XBOS-08 promoted; GO/GWC for W5 per XBOS_CC_WAVE_EXECUTION_PLAN · evidence_path: docs/qa/evidence/qc-p1-xbos-w5-hrm-cat-20260606.md
- **evidence_path:** `docs/qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md`
- **ack_status:** **READY_FOR_QC**
- **pm_dispatch_hint:** J-XBOS-08 scope_parity read-back verified — promote journey map row
