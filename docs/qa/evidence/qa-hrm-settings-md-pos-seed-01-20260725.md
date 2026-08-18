# QA-HRM-SETTINGS-MD-POS-SEED-01 — G-ORPH-BE-03 closed (tenant-position seed not production SoT)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MD-POS-SEED-01` |
| **Prior** | `qa-hrm-settings-master-data-01-20260725.md` § G-ORPH-BE-03 **LIVE** |
| **BE handoff** | `be-hrm-settings-md-pos-seed-01-20260725.md` READY_FOR_QA |
| **Env** | Local L0 · U65 · HOLD_DEPLOY · sponsor 1B |
| **cấm observed** | No `HRM_ALLOW_TENANT_POSITION_SEED=1` · no `pnpm seed:*` · no wipe employees · not :8088 / Phase1 / PROD |
| **ack_status** | **PASS_TO_PM** |
| **G-ORPH-BE-03** | **CLOSED** |

---

## 1. Verdict

| Exit criterion | Result |
|----------------|--------|
| 1. POST `seed/tenant-position-catalog*` without allow env → **403** `HRM-CAT-POS-SEED-FORBIDDEN` | **PASS** (live) |
| 2. Runtime SoT = Settings/XBOS `job_titles` / `departments` effectiveItems (picker / employee form) | **PASS** (API live + FE code) |
| 3. Evidence this file | **PASS** |
| 4. Mark G-ORPH-BE-03 CLOSED or residual | **CLOSED** (bootstrap-only residual documented) |
| 5. Bus PASS_TO_PM | **PASS** |

**Overall:** **PASS_TO_PM** — G-ORPH-BE-03 production hardcode SoT **CLOSED**. Seed endpoints remain as gated bootstrap-only; UAT path must use XBOS pull / Settings.

---

## 2. L0 / environment

| Check | Result |
|-------|--------|
| `qc:dev-stack` (earlier in session) | hrm-api down briefly; later recovered |
| `GET http://127.0.0.1:28001/api/hrm` | **200** `HRM-HEALTH-200` |
| xbos-api `:28002` | **200** (login OK) |
| web-portal `:5173` | up (optional) |
| Shell `HRM_ALLOW_TENANT_POSITION_SEED` | **unset** during probes |
| Auth | `ceo@xe.vn` via `POST /api/xbos/auth/login` → Bearer JWT (token redacted) |

---

## 3. Exit 1 — seed gate (live HTTP)

Persona: `ceo@xe.vn` · headers `Authorization: Bearer <redacted>` · `x-tenant-id: xevn` · `x-company-id: main` · body `{}`.

| Call | HTTP | `code` |
|------|------|--------|
| `POST /api/hrm/settings-catalogs/seed/tenant-position-catalog` | **403** | **`HRM-CAT-POS-SEED-FORBIDDEN`** |
| `POST /api/hrm/settings-catalogs/seed/tenant-position-catalog-all` | **403** | **`HRM-CAT-POS-SEED-FORBIDDEN`** |

Message excerpt (single endpoint): *tenant-position-catalog seed is bootstrap-only (G-ORPH-BE-03 retired). Prefer POST …/sync-from-xbos or catalog-sync/pull for job_titles/departments. Set HRM_ALLOW_TENANT_POSITION_SEED=1 only for explicit bootstrap-dev — not UAT evidence.*

**U65:** Probe called the forbidden endpoint to assert 403 only — **did not** set allow env, **did not** write catalog rows via seed, **did not** invent codes.

### Unit regression (same tree)

```text
pnpm --filter hrm-api exec jest src/settings-catalogs/be-hrm-settings-md-pos-seed-01.spec.ts --no-coverage
→ 8/8 PASS
```

Covers: env default false · empty profile field defs · 403 without env · 409 when POS SoT exists + allow · bootstrap path only when allow+empty · `seedEmployeeProfileTemplate` no hardcode embed.

---

## 4. Exit 2 — runtime SoT = XBOS/Settings effectiveItems

### 4.1 Live picker API (SoT path)

`GET /api/hrm/settings-catalogs/{key}/items?company_id=main&active=true` → **200** `HRM-SET-200`:

| catalogKey | total (active) | company partition | origins | sample codes (existing XBOS — not invented) |
|------------|----------------|-------------------|---------|-----------------------------------------------|
| `job_titles` | **4** | `holding` | **xbos** | CEO, CHRO, DRIVER_LEAD, OPS_MANAGER |
| `departments` | **4** | `holding` | **xbos** | DEPT_01..DEPT_04 |
| `department_catalog` | 0 | holding | — | empty honest |
| `org_departments` | 0 | holding | — | empty honest |
| `positions` | 33 | holding | hrm+xbos | historical extension + xbos (not from this seed probe) |

Overview `GET /api/hrm/settings-catalogs?company_id=main` → **200** `HRM-SET-200`; POS keys present with XBOS sync metadata (`job_titles` xbosVersion=19, `departments`/`positions` xbosVersion=13).

### 4.2 FE consumer (code — browser mutate deferred)

| Path | SoT behaviour |
|------|----------------|
| `EmployeeFormDialog.tsx` | `positionOptions` ← `toCatalogPickerOptions(job_titles\|positions\|… effectiveItems)`; `departmentOptions` ← `departmentOptionsFromCatalog` (no name-as-code) |
| `MasterDataSettingsPanel.tsx` | `writeKey: 'job_titles'`; items from `effectiveItems`; **Đồng bộ XBOS** CTA |
| BE employees | `assertJobTitleKeyInCatalog` → `assertCodeInEffectiveCatalog` |
| Profile template seed | `buildEmptyPositionFieldDefs()` → `select:` empty (no registry embed) |

Browser full UF (Settings → employee form → Lưu → F5) = **residual** for `QA-HRM-SETTINGS-MASTER-DATA-02` — not required to close G-ORPH-BE-03 gate (gate = seed not SoT).

---

## 5. G-ORPH-BE-03 status

| Before (`qa-hrm-settings-master-data-01`) | After this WI |
|-------------------------------------------|---------------|
| **LIVE** — registry + `POST seed/tenant-position-catalog*` callable as SoT | **CLOSED** — POST **403** without allow; registry **BOOTSTRAP-ONLY**; runtime SoT = XBOS/Settings `effectiveItems` |

### Remaining (not reopen of G-ORPH-BE-03)

| Residual | Owner | Note |
|----------|-------|------|
| Historical `hrm_employee_basic_fields` `select:…` strings from past seeds | ops / optional | BE: not wiped (cấm wipe) |
| Script `scripts/seed-tenant-position-catalog.mjs` still exists | — | Header documents bootstrap + env gate; U65 cấm for UAT |
| Full Settings MD browser matrix AC-SET-FS | `QA-HRM-SETTINGS-MASTER-DATA-02` | separate WI |
| Other orphans G-ORPH-BE-01/02/04… | separate | out of scope |

---

## 6. Handoff

```text
work_item_id: QA-HRM-SETTINGS-MD-POS-SEED-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hrm-settings-md-pos-seed-01-20260725.md
G-ORPH-BE-03: CLOSED
```

### completion_report

Closed G-ORPH-BE-03: live POST seed/tenant-position-catalog (+ -all) without `HRM_ALLOW_TENANT_POSITION_SEED` returns **403** `HRM-CAT-POS-SEED-FORBIDDEN`; jest gate **8/8**; picker SoT for `job_titles`/`departments` returns XBOS-origin codes; FE/BE consumers bind `effectiveItems`. Did not set allow env or run `pnpm seed:*`. Residual: historical profile select strings; browser UF → MASTER-DATA-02; other G-ORPH rows unchanged.

### next_owner

`pm` (optional: `qa` for `QA-HRM-SETTINGS-MASTER-DATA-02` when L0 stable for browser)

### next_dispatch_prompt

```text
work_item_id: QA-HRM-SETTINGS-MASTER-DATA-02
role: qa
priority: after Settings MD FE/BE P0 READY
entry: G-ORPH-BE-03 CLOSED (qa-hrm-settings-md-pos-seed-01-20260725.md); L0 hrm+portal up; U65 browser-only; ceo@xe.vn
exit: AC-SET-FS-01..05 on Settings master-data + Employees consumers; Network 2xx + FE after save + F5; update matrix; no seed; PASS_TO_PM or FAIL with owners
evidence_path: docs/qa/evidence/qa-hrm-settings-master-data-02-YYYYMMDD.md
cấm: HRM_ALLOW_TENANT_POSITION_SEED · pnpm seed:* · :8088 · invent catalog codes
```
