# QC Gate — QC-BM-CFG-APPLY-MEMBERS-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-BM-CFG-APPLY-MEMBERS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — G-BM-REC-01 / XBOS-DM-HRM-07 catalog apply-to-members CLOSED on Dev8088 (U65 FE) |
| **scope_claim** | Holding → ĐVTV catalog fan-out UI + API for allow-list keys (`job_titles` exercised) only |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser FE chain only; no seed in BE / FE / DevOps / QA / QC |

---

## Scope (bounded — NARROW)

| In scope | Explicitly out (cấm expand) |
|----------|------------------------------|
| Audit BE `POST …/apply-to-members` → `XBOS-CFG-204` | **G-BM-REC-02** WF bind/clone to members |
| Audit FE Settings panel «Áp dụng danh mục HRM» | Full BM-06 E2E with member pull + HRM consumer |
| QA R2 U65 browser: CC boot → apply `job_titles` → 4 ĐVTV → FE after 2xx → F5 | Member-persona catalog visual confirm (`QA-BM-MEMBER-CATALOG-FE-01`) |
| Group CEO member GET 409 **noted only** (not sole FAIL) | Phase 1 DONE · PROD-READY · UF matrix bulk promote |
| Vite CC resolve regression closed (R1 blank `#root`) | Seed / API-only PASS as UF |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/bm-be-cfg-apply-members-01-20260722.md` | Dev-BE | Option B fan-out API; allow-list; OpenAPI; jest **26 PASS** (2 suites) |
| `docs/qa/evidence/bm-fe-cfg-apply-members-01-20260722.md` | Dev-FE | Settings panel + `ApplyCatalogToMembersPanel`; 409 note; vitest cited |
| `docs/qa/evidence/d-do-sync-8088-bm-fe-apply-01-20260722.md` | DevOps | FE sync :8088; L0 proxies **200**; MD5 match |
| `docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-20260722.md` | QA R1 | **FAIL** — blank `#root` / Vite resolve (superseded) |
| `docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-r2-20260722.md` | QA primary | U65 R2 **PASS_TO_PM** — POST **201** `XBOS-CFG-204` · `appliedCount=4` · F5 source v7 |
| SA / ownership | Spec | G-BM-REC-01 · XBOS-DM-HRM-07 · OpenAPI `configSyncApplyCatalogToMembers` |

**No re-run** of full QA browser suite — audit-only + L0 spot per QC gate rule.

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-r2-20260722.md` | **FAIL** exit **1** (2/8) — missing `command_table` + `portal_url` regex (`PORTAL_DEV_URL` / 517x) | **PROCESS** — format-only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-bm-cfg-apply-members-01-20260722.md` | **PASS** exit **0** (8/8) | This gate file |
| BE jest (cited) `pnpm --filter xbos-api exec jest --testPathPatterns=config-sync --no-coverage` | **26 PASS** / 2 suites | PRODUCT — BE regression |
| QC L0 spot `http://14.225.217.232:8088/` | **200** | ENV |
| QC L0 spot `http://14.225.217.232:8088/command-center` | **200** | ENV |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` (not localhost-only).

**QC adjudication:** PROCESS gap on QA R2 pack is **format-only** (precedent hire-bind / leave-create / C-CONV-AS). Browser substance — click path, Network POST **201** `XBOS-CFG-204`, FE `appliedCount=4`, F5 holding source, U65, no seed — is complete. **Not** product NO-GO. Group CEO **409** on member GET is **by design** (ADR scope) — **cấm** sole-FAIL honored.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| CC `#root` childCount 1; Vite modules 200 JS (R1 blank superseded) | PRODUCT / ENV sync | **PASS** |
| Open panel «Áp dụng danh mục HRM» · `job_titles` | PRODUCT | **PASS** |
| POST `/api/xbos/config-sync/catalog/job_titles/apply-to-members` → **201** `XBOS-CFG-204` · `appliedCount=4` | PRODUCT | **PASS** — G-BM-REC-01 |
| FE after 2xx: status + 4 tenant rows (xe-tmdv / visun / xe-du-lich / xe-vietnam) | PRODUCT | **PASS** |
| F5 + reopen: holding source version **7** · 4 mục · same checksum | PRODUCT | **PASS** |
| Seed / API-only PASS | PROCESS U65 | **PASS** — none |
| Group CEO member GET 409 warning on panel | PRODUCT (scope ladder) | **Noted only** — not sole FAIL |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| G-BM-REC-02 WF bind · member-persona FE confirm · Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (G-BM-REC-01 / XBOS-DM-HRM-07)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **CC loads** | Not blank `#root`; no Vite Failed to resolve | QA R2 Vite probe 200 JS | **PASS** |
| **Open apply panel** | Cài đặt → Áp dụng danh mục HRM | Click path + heading | **PASS** |
| **Mutate apply** | ≥1 ĐVTV → POST 2xx + `XBOS-CFG-204` + `appliedCount` ≥ 1 | **201** · appliedCount=**4** | **PASS** |
| **FE after 2xx** | Status shows appliedCount + targets | FE status + 4 rows | **PASS** |
| **F5** | Holding source still listed | v7 · 4 mục · checksum | **PASS** |
| **U65** | Browser-only; no seed | Explicit in QA R2 | **PASS** |
| **409 Group CEO** | Note only — not sole FAIL | Panel scope note; QA ⚪ N/A | **PASS** (policy) |

---

## L2.5 journey coverage

| J-ID / slice | Journey | Evidence | Verdict | Promotable |
|--------------|---------|----------|---------|------------|
| **G-BM-REC-01** / XBOS-DM-HRM-07 apply | CC Settings → Áp dụng danh mục HRM → confirm → POST → FE → F5 | `bm-qa-cfg-apply-members-fe-01-r2-20260722.md` | **PASS** | Bounded catalog fan-out only |
| **J-XBOS-08** (related prior) | Danh mục NS sync → HRM read-back | Prior GWC wave | **PASS** (prior) | Not re-audited this gate — no regression claim |
| **QA-BM-MEMBER-CATALOG-FE-01** | Member-persona visual confirm after apply+pull | — | **NOT TESTED** | Deferred P2 — Group CEO 409 by design |
| **G-BM-REC-02** / J-REC-WF-* | WF bind/clone to members | — | **NOT TESTED** | Out of scope (cấm expand) |

**Mandatory L2.5 for this QC slice:** apply click path (G-BM-REC-01) only. Member-persona confirm and WF bind **deferred by PM NARROW** — not product NO-GO.

**Note:** `PROGRAM_JOURNEY_MAP.md` has no dedicated `J-BM-CFG-*` row yet; QC accepts QA R2 documented L2.5 cross-nav (Settings → panel → mutate → F5) as journey evidence for this bounded BM wave. PM may add map row in governance update (optional).

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blockers for G-BM-REC-01 apply-to-members on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-BM-CFG-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish QA R2 pack: `command_table` + `PORTAL_DEV_URL` → verify 8/8 |
| **C-BM-CFG-MEMBER-FE-01** | P2 optional | qa | DEFER OK | Member-persona catalog confirm after apply+pull — not sole-FAIL under Group CEO |
| **C-BM-REC-02** | P1 program | pm → be | OPEN (out of slice) | G-BM-REC-02 WF bind — separate work_item when Wave1 slots |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit BE+FE+DevOps+QA apply-to-members chain | **DONE** — product PASS |
| Audit L2.5 apply click path (G-BM-REC-01) | **DONE** — PASS |
| GO or GWC; 409 not sole FAIL | **GWC** — Residual P0/P1 = **none** |
| Evidence this file | **DONE** |
| cấm seed · Phase1/PROD · FAIL on Group CEO 409 alone | **RESPECTED** |

---

## Executive summary

QC audited the narrow G-BM-REC-01 / XBOS-DM-HRM-07 holding→ĐVTV catalog apply chain on Dev8088: BE fan-out `XBOS-CFG-204` + FE Settings panel synced live; QA R2 U65 closed CC Vite boot, apply `job_titles` to 4 members (**201** · `appliedCount=4`), FE feedback, and F5 holding source. Group CEO member GET **409** noted only — not sole FAIL. No P0/P1 residual for this slice.

**GO WITH CONDITIONS** for this bounded slice only. Conditions = process pack polish (P3) + optional member-persona confirm (P2) + G-BM-REC-02 deferred + **explicit NOT Phase1/PROD**. No seed.

---

## Handoff

- **completion_report:** Closed QC gate `QC-BM-CFG-APPLY-MEMBERS-01`. Product G-BM-REC-01 / XBOS-DM-HRM-07 apply-to-members **PASS** on `:8088` U65 (POST **XBOS-CFG-204** · appliedCount=4 · F5). L2.5 apply path PASS. Residual P0/P1 = **none**. Layer B QA pack 2/8 = PROCESS P3 only. 409 Group CEO not sole-FAIL. **NOT** Phase1/PROD. G-BM-REC-02 / member-persona FE remain out of slice.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qc-bm-cfg-apply-members-01-20260722.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-INTAKE-BM-CFG-APPLY-MEMBERS-GWC-01
from_role: qc
to_role: pm
lane: governance
priority: P1

## Entry
QC GO WITH CONDITIONS: docs/qa/evidence/qc-bm-cfg-apply-members-01-20260722.md
Product CLOSED: G-BM-REC-01 / XBOS-DM-HRM-07 apply-to-members on Dev8088 U65
Residual P0/P1: none
Conditions: C-BM-CFG-PACK-01 (optional QA pack polish P3) · C-BM-CFG-MEMBER-FE-01 (optional member-persona P2) · C-BM-REC-02 WF bind OPEN out-of-slice
NOT Phase1 DONE · NOT PROD-READY
cấm: seed · sole-FAIL on Group CEO 409

## Job
1. Bus INTAKE GWC; mark G-BM-REC-01 catalog apply CLOSED under GWC (do not claim Phase1/PROD / full BM-06 E2E)
2. Optional non-blocking: Task qa polish R2 pack to 8/8 (C-BM-CFG-PACK-01)
3. Scan next P0 from B-Minutes / PM_OPEN_BACKLOG — prefer G-BM-REC-02 `BM-BE-REC-WF-BIND-01` when Wave1 slots
4. Do NOT reopen apply-to-members product lane unless new residual; do NOT treat Group CEO 409 as FAIL

entry_criteria: QC evidence PASS_TO_PM
exit_criteria: bus updated + next Task dispatched or idle documented
```
