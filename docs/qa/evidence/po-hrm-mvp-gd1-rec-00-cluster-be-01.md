# PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** Wave-5 seat #7) |
| **lane** | execution · **dev-be** |
| **uc_ids** | `UC-BP-REC-00` |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 **CONFIRMED** |
| **change_mode** | **UPGRADE** · preserve_default · code_memory APPEND |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 no seed |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-00** Diễn biến #1–#3 · **BR-BP-JD-01** |
| **tech_spec / API** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md` F-JD-01..04 · F-YCTD-JD dual-assert · PUB-* mint |
| **db_design / DATA** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-DATA-01.md` §4–§5 status + CHK + bridge + backfill |
| **ba** | BA-01 O1–O7 · AC-REC-JD-00-* · VAL-REC-JD-* |
| **sa** | SA-01 Option **A LOCKED** · physical `/recruitment/job-templates*` only |

---

## 2. Closed scope

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | ensureWave2Schema ADD `status` + backfill LEGACY_ACTIVE/RETIRED_HIST/DRAFT + CHK status + bridge CHK + indexes | **DONE** |
| 2 | F-JD-01 list return `status` + filter `?status=` / legacy `active`; bindable/`for=yctd` → `status='active' AND is_active=TRUE` | **DONE** |
| 3 | F-JD-02 create force `draft`/`is_active=false` — DENY auto-active (ignore client) | **DONE** |
| 4 | F-JD-03 get include `status`; preview=yctd STATUS on non-active | **DONE** |
| 5 | ADD `POST …/job-templates/:id/publish` — PUB-REQUIRED / PUB-LAYOUT-EMPTY / PUB-STATE / REACTIVATE-HOLD | **DONE** |
| 6 | DELETE soft-retire → `retired`+`false`; `isYctdJdBindable` dual-assert | **DONE** |
| 7 | RETAIN `HRM-JD-CODE-DUP` 409 · `HRM-JD-YCTD-STATUS` · U19 scope parity | **DONE** |
| 8 | jest create draft · publish PASS/FAIL · bindable · code dup · scope · retire | **DONE** |

**Paths touched (allowed):**

- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.controller.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.service.ts` (SELECT status for bind resolve)
- `apps/api/hrm-api/src/recruitment/yctd-jd-bind.ts`
- `apps/api/hrm-api/src/recruitment/jd-dynamic.service.ts` (`enforceRequired` + `collectMissingRequiredKeys`)
- `apps/api/hrm-api/src/recruitment/dto/create-job-template.dto.ts` · `update-job-template.dto.ts`
- `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-00-cluster-be-01.spec.ts` (**ADD**)
- regression: `po-hrm-jd-yctd-ref-be-01.spec.ts` · `be-hrm-settings-md-jt-01.spec.ts`

**DENY held:** Nest `/rec` dual · second JD table · seed · honesty flip · reopen W1–W4 · boolean-only · `apps/web`

---

## 3. Verify

```text
pnpm exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-00-cluster-be-01|po-hrm-jd-yctd-ref-be-01|be-hrm-settings-md-jt-01|recruitment-catalog.service.spec|d-hdsd-mutate-be-03" --no-coverage
→ Test Suites: 5 passed, 5 total
→ Tests:       41 passed, 41 total
→ exit 0
```

---

## 4. Residual / next

| Residual | Owner |
|----------|--------|
| Dev-FE library chips Nháp/Hiệu lực/Ngừng + Phát hành → POST …/publish + Network path contains `/recruitment/job-templates` | **dev-fe** |
| QA U65 AC-REC-JD-00-* browser (zero-seed) after FE | **qa** |
| Honesty flags stay **false** | all |

---

## completion_report

- **Closed:** Option A UPGRADE Nest `/api/hrm/recruitment/job-templates*` — status lifecycle + publish gate + bindable dual-assert + soft-retire; jest 41 PASS; honesty false.
- **Residual:** FE chips/publish wire · QA browser U65.
- **next_owner:** **qa** (or **dev-fe** if FE not yet READY_FOR_QA — PM parallel OK per API-01 unlock).
