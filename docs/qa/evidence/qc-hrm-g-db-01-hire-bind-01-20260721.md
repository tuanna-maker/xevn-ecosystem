# QC Gate — QC-HRM-G-DB-01-HIRE-BIND-01 (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-G-DB-01-HIRE-BIND-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-21` |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **portal_url** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — G-DB-01 / **J-HRM-INT-01** hire→`employee_id` CLOSED on Dev8088 |
| **scope_claim** | Hire stage bind hồ sơ NV only (negative FE gate + happy PATCH `employee_id` + F5) |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser FE chain only; no seed in BE / FE / DevOps / QA / QC |

---

## Scope (bounded — NARROW)

| In scope | Explicitly out (cấm expand) |
|----------|------------------------------|
| Audit G-DB-01 soft hire link enforce (`HRM-REC-HIRE-400/409` + stamp `employee_id`) | **G-AT10-02** overlap/balance |
| Audit FE hire dialog bind + VI copy | Attendance **sheet reopen** / AC-ATT-SHEET |
| QA browser U65 J-HRM-INT-01 negative + happy + F5 | Hard FK **G-DB-02** · dual catalog **G-DB-04** |
| must_keep smoke G-RC-01 + leave create | Phase 1 DONE · PROD-READY · UF matrix 🟢 promote |
| Soft picker-cap P3 OK | Full REC-WF / CampaignCandidatesTab stub |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md` | Dev-BE | Soft hire link; `HRM-REC-HIRE-400/409`; jest **34 PASS**; no hard FK |
| `docs/qa/evidence/fe-hrm-g-db-01-hire-bind-01-20260721.md` | Dev-FE | `HireEmployeeLinkDialog` + `employee_id` on stage PATCH; vitest **4 PASS**; VI map |
| `docs/qa/evidence/d-do-sync-8088-g-db-01-conv-01-20260721.md` | DevOps BE | hire-link dist live; hrm-be×3 healthy; `/api/hrm/` **200** |
| `docs/qa/evidence/d-do-sync-8088-fe-hire-bind-01-20260721.md` | DevOps FE | 10 FE files MD5 match; hire markers via `:8088/hr/src/…` **200** |
| `docs/qa/evidence/qa-hrm-g-db-01-hire-bind-01-20260721.md` | QA primary | Browser U65 — negative dialog + happy PATCH **200** + F5; must_keep smoke |
| SRS §3.33 FR-HRM-INT-01 · TechSpec §17.3 G-DB-01 | Spec | Diễn biến #3/#5/#7 · hire ⇒ `employee_id` |

**No re-run** of full QA suite — audit-only + L0 spot per QC gate rule.

---

## Evidence pack gate (Layer B)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-g-db-01-hire-bind-01-20260721.md` | **FAIL** exit **1** (2/8) — missing `command_table` + `portal_url` regex (`PORTAL_DEV_URL` / 517x) | **PROCESS** — format-only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-g-db-01-hire-bind-01-20260721.md` | **PASS** exit **0** (8/8) | This gate file |
| BE jest (cited) hire-link + catalog + WF + G-RC-01 | **34 PASS** | PRODUCT — BE regression |
| FE vitest (cited) `recruitmentHireLink.test.ts` | **4 PASS** | PRODUCT — FE unit |
| QC L0 spot `http://14.225.217.232:8088/` | **200** | ENV |
| QC L0 spot `http://14.225.217.232:8088/hr/` | **200** | ENV |
| QC L0 spot `http://14.225.217.232:3001/api/hrm/` | **200** | ENV |

**Portal URL:** `http://14.225.217.232:8088` · `PORTAL_DEV_URL=http://14.225.217.232:8088` (not localhost-only).

**QC adjudication:** PROCESS gap on QA pack is **format-only** (precedent leave-create / C-CONV-AS / G-RC-01). Browser substance — click path, Network PATCH **200** with `employee_id`, FE negative gate (no orphan hired), F5, U65 — is complete. **Not** product NO-GO.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Negative: stage **Đã tuyển** không hồ sơ → dialog VI `HRM-REC-HIRE-400` copy; **Xác nhận** disabled; **no PATCH**; stage stays New; **Đã tuyển** still 0 | PRODUCT | **PASS** — FR-HRM-INT-01 #5 |
| Happy: select `PORTAL-GCEO` → PATCH body `employee_id` → **200** `HRM-REC-CP-200`; tabs **Đã tuyển 1** | PRODUCT | **PASS** — FR-HRM-INT-01 #3/#7 |
| F5: pipeline **Đã tuyển 1**; GET pool still `hired` + same `employee_id` | PRODUCT | **PASS** |
| BE enforce soft link + company mismatch 409 (jest) | PRODUCT | **PASS** — G-DB-01 |
| FE dialog + VI map live on `:8088` (DevOps markers) | PRODUCT / ENV sync | **PASS** |
| must_keep G-RC-01 **Số lượng *** + leave **Tạo yêu cầu nghỉ** UI present | PRODUCT smoke | **PASS** |
| Seed / API-only PASS | PROCESS U65 | **PASS** — none |
| QA pack Layer B 2/8 | PROCESS | **OPEN P3** — non-blocking |
| Hire picker capped **100/1108** | soft UX P3 | **OK** (PM residual soft) |
| Embed soft-nav thrash | soft P3 | **DEFER OK** — mutate on standalone `/hr/recruitment` |
| VPS git HEAD pscp drift `2a7a02b` | ENV ops | **DEFER** — not product AC fail |
| G-AT10-02 / sheet / Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## AC adjudication (G-DB-01 / FR-HRM-INT-01)

| AC | Pass criteria | Evidence | QC |
|----|---------------|----------|-----|
| **Negative** | Thiếu hồ sơ → từ chối rõ; không orphan hired | FE dialog VI + disabled confirm; no PATCH; tab Đã tuyển 0 | **PASS** |
| **Happy** | Chọn NV cùng đơn vị → 2xx + stamp `employee_id` | PATCH **200** body+response `employee_id=678b9cb2-…` | **PASS** |
| **Persist** | F5 còn hired + link | Reload dashboard + GET pool | **PASS** |
| **U65** | Browser-only; no seed | Explicit in all lane evidence | **PASS** |
| **must_keep** | G-RC-01 / leave create UI intact | QA smoke table | **PASS** |

---

## L2.5 — J-HRM-INT-01 (hire bind slice)

| J-ID | Journey | Evidence | Verdict | Promotable |
|------|---------|----------|---------|------------|
| **J-HRM-INT-01** | Chốt tuyển → gắn `employee_id` (negative + happy + F5) | `qa-hrm-g-db-01-hire-bind-01-20260721.md` | **PASS** | Bounded G-DB-01 only — **not** full UF matrix promote |
| **J-HRM-05** | Tuyển dụng requisition (must_keep Số lượng smoke) | QA smoke field present | **PASS** (smoke only) | Prior G-RC-01 GWC — no reopen |
| **G-AT10-02** / sheet reopen | Leave overlap · attendance sheet | — | **NOT TESTED** | Out of scope (cấm) |
| **J-REC-WF-*** | REC-WF DRAFT journeys | — | **NOT TESTED** | Out of scope |

**Mandatory J-* for this QC slice:** **J-HRM-INT-01** hire bind only. Sheet / G-AT10-02 **deferred by PM NARROW** — not reopened.

**Note:** `PROGRAM_JOURNEY_MAP.md` lists **J-HRM-05** as map row; **J-HRM-INT-01** is SoT in SRS/TechSpec/trace (`HRM_DATA_LINKAGE_SRS_TRACE.md`) and QA evidence — accepted as L2.5 id for this gate.

---

## Residual / Conditions

### Residual — P0 / P1 only

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| — | — | — | **None** | No open P0/P1 product blockers for G-DB-01 hire bind on `:8088` |

### Conditions (GWC — not P0/P1 Residual)

| ID | Severity | Owner | Status | Note |
|----|----------|-------|--------|------|
| **C-HIRE-PACK-01** | P3 PROCESS | qa (optional) | OPEN | Polish QA pack: `command_table` + `PORTAL_DEV_URL` → verify 8/8 |
| **C-HIRE-PICKER-CAP** | soft P3 | fe (optional) | **OK** | Picker 100/1108 — PM allowed; not AC fail |
| **C-HIRE-EMBED-SOFTNAV** | soft | devops/fe (optional) | DEFER OK | Standalone `/hr/recruitment` mutate PASS |
| **C-HIRE-VPS-GIT-DRIFT** | ENV ops | devops (later) | DEFER | Promote pscp bind-mount via git when allowed |
| Phase1 / PROD | — | — | **FORBIDDEN** | Standing — **NOT** Phase 1 DONE · **NOT** PROD-READY |

---

## Exit criteria (PM dispatch) — QC map

| Exit | Result |
|------|--------|
| Audit BE+FE+DevOps+QA hire-bind chain | **DONE** — product PASS |
| Audit L2.5 **J-HRM-INT-01** | **DONE** — PASS |
| GO or GWC; soft picker-cap OK as P3 | **GWC** — Residual P0/P1 = **none**; picker-cap P3 OK |
| Evidence this file | **DONE** |
| cấm seed · G-AT10-02 · sheet reopen · Phase1/PROD | **RESPECTED** |

---

## Executive summary

QC audited the narrow G-DB-01 hire→employee bind chain on Dev8088: BE soft enforce + FE dialog bind synced live; QA browser U65 closed negative (no orphan hired) and happy (PATCH **200** `employee_id` + F5). **J-HRM-INT-01 PASS.** must_keep G-RC-01 / leave create smoke intact. No P0/P1 residual.

**GO WITH CONDITIONS** for this bounded slice only. Conditions = process pack polish (P3) + soft picker-cap OK + optional embed/git defer + **explicit NOT Phase1/PROD**. No G-AT10-02 / sheet expand. No seed.

---

## Handoff

- **completion_report:** Closed QC gate `QC-HRM-G-DB-01-HIRE-BIND-01`. Product G-DB-01 / FR-HRM-INT-01 hire bind **PASS** on `:8088` U65. **J-HRM-INT-01** PASS (negative + happy + F5). Residual P0/P1 = **none**. Soft picker-cap P3 OK. Layer B QA pack 2/8 = PROCESS P3 only. **NOT** Phase1/PROD. Cấm G-AT10-02 / sheet reopen respected.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qc-hrm-g-db-01-hire-bind-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-INTAKE-G-DB-01-HIRE-BIND-GWC-01
from_role: qc
to_role: pm
lane: governance
priority: P1

## Entry
QC GO WITH CONDITIONS: docs/qa/evidence/qc-hrm-g-db-01-hire-bind-01-20260721.md
Product CLOSED: G-DB-01 / J-HRM-INT-01 hire→employee_id on Dev8088 U65
Residual P0/P1: none
Conditions P3 only: C-HIRE-PACK-01 (optional QA pack polish) · C-HIRE-PICKER-CAP OK · soft-nav/git defer
NOT Phase1 DONE · NOT PROD-READY

## Job
1. Bus INTAKE GWC; mark G-DB-01 hire-bind CLOSED under GWC (do not claim Phase1/PROD)
2. Optional: Task qa polish pack to 8/8 (C-HIRE-PACK-01) — non-blocking
3. Scan next P0 from PM_OPEN_BACKLOG / TODO — dispatch next wave (cấm reopen G-AT10-02 / sheet unless new residual)
4. Do NOT expand hire hard FK G-DB-02 in this follow-up unless SA/PM open new work_item

entry_criteria: QC evidence PASS_TO_PM
exit_criteria: bus updated + next Task dispatched or idle documented
```
