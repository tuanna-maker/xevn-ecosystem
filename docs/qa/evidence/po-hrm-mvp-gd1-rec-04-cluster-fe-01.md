# Evidence — PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — Wave-6 seat **#8**) |
| **lane** | execution · **dev-fe** |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **uc_ids** | `UC-BP-REC-04` |
| **change_mode** | UPGRADE · preserve_default · code_memory APPEND |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |
| **depends_on** | API-01 CONFIRMED · BA-01 O1–O8 · BE-01 parallel (internal-scan LIVE expected for browser) |

---

## spec_read_ack

| Artifact | Path · sections |
|----------|-----------------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-04** Diễn biến #1–#2 · 0-hits/skip · **BR-BP-CV-01** |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-BA-01.md` O1–O8 · AC-REC-CV-04-* · VAL-REC-CV-* · Diễn biến FE §3.4 |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md` F-REC-CV-SCAN-01..03 · §5.4 posted gate · §6 DTO · §7 HRM-REC-CV-SCAN-* |
| **sa** | Option A LOCKED — physical `/recruitment/*` · pool kho · flags JSON O2 |
| **code AS-IS** | `JobRequisitionsTab` pipeline flags · `listCandidatesPool` · UV-YCTD `createCandidatePool` |
| **sponsor_confirm** | API-01 CONFIRMED · BA-01 · SA Option A |
| **uc_ids** | UC-BP-REC-04 |
| **change_mode** | UPGRADE |

**spec says / code does (delta closed this seat):**

| Spec | Before | After |
|------|--------|-------|
| Quét kho UI | ABSENT | Detail → **Mở quét kho** → criteria title+skill/exp → GET pool |
| Complete / 0-hits | ABSENT | **Hoàn tất quét** → POST `…/internal-scan` `action=complete` |
| Skip + reason | ABSENT | **Bỏ qua** + lý do → POST `action=skip` |
| Attach khớp | UV form only | Dialog **Gắn YCTD** → POST `/candidates` + `requisition_id` (RETAIN) |
| Posted gate UX | Ungated checkbox | Client block + toast SCAN-REQUIRED path; BE gate when LIVE |
| F5 flags | posted/cv only | Badge `internal_scan_*` from DTO after refetch |
| Network | — | **only** `/api/hrm/recruitment/*` — DENY Nest `/rec` dual |
| REC-03 | OUT | **DENY** Campaign invent — label «không Campaign» |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/jobRequisitionCvScan.ts` | **ADD** criteria/posted-gate/audit helpers + VI |
| `apps/web/hrm/src/lib/jobRequisitionCvScan.test.ts` | **ADD** vitest (8) |
| `apps/web/hrm/src/lib/jobRequisitionYctdWave2.ts` | UPGRADE `resolvePipelineFlags` / empty + CODE-MEMORY CHANGE |
| `apps/web/hrm/src/integrations/hrmApi.ts` | PipelineFlags `internal_scan_*` · `listCandidatesPool` scan query · **ADD** `postJobRequisitionInternalScan` |
| `apps/web/hrm/src/lib/apiError.ts` | **ADD** HRM-REC-CV-SCAN-* VI |
| `apps/web/hrm/src/components/recruitment/InternalCvScanDialog.tsx` | **ADD** Quét kho dialog |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Wire dialog · badge · posted gate UX · CODE-MEMORY CHANGE |

**must_keep RETAIN:** UV-YCTD soft FK · W2 mode/BOD/flags family · REC-00/01/02/06a/08 · REC-03 OUT · honesty false · C-SLICE

**DENY:** Nest `/rec` dual · second CV SoT · Campaign/REC-03 · seed · honesty flip · redefine 05a create · claim FR-04 DONE = UV create alone

---

## Vitest evidence

```text
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/jobRequisitionCvScan.test.ts \
  src/lib/jobRequisitionYctdWave2.test.ts

Test Files  2 passed (2)
Tests:      24 passed (24)
```

Coverage: O4 criteria · posted gate · flags merge · toast SCAN-* · physical `/recruitment/` path locks · dialog complete|skip|attach source locks · wave2 regression.

---

## U65 browser plan (QA — zero-seed)

| J-* / UF | Persona | Click path | FE after 2xx + F5 |
|----------|---------|------------|-------------------|
| **J-HRM-REC-CV-04-01** | HR/TP `ceo@xe.vn` | Tuyển dụng → YCTD `open_for_hire` → Chi tiết → **Mở quét kho** → chức danh + skill/exp → **Tìm trong kho** | Network **GET** `/api/hrm/recruitment/candidates-pool?…&for=internal_scan…` **2xx**; list hoặc empty hợp lệ; **không** seed |
| **J-HRM-REC-CV-04-02** | HR/TP | N≥1 → **Gắn YCTD** → **Hoàn tất quét** **hoặc** 0 hits → Hoàn tất | Attach POST `/candidates` 2xx (RETAIN); POST `…/internal-scan` complete; badge **Đã quét kho**; **F5** còn `internal_scan_done` |
| **J-HRM-REC-CV-04-03** | HR/TP | **Bỏ qua quét…** + lý do → Xác nhận; thử không lý do; actor thiếu quyền nếu có | skip 2xx + F5 lý do; empty reason → toast SKIP-REASON / 400; 403 FORBIDDEN ≠ 0-hits toast |
| **J-HRM-REC-CV-04-04** | HR/TP | `posted` trước quét → chặn; sau done\|skip → Lưu cờ `posted` | Trước: toast SCAN-REQUIRED / FE block; sau: PATCH flags 2xx; **F5** `posted`; **không** mở Campaign / REC-03 |
| must_keep | W2 / UV / JD | regression | open_for_hire · soft FK JD · UV create path |

**Network assert:** mọi mutate/list scan path **contains** `/recruitment/` — **FAIL O1** nếu Nest `/rec/*` SoT.

**cấm:** `pnpm seed:*` · API fake pool · SQL flip `internal_scan_*` · flip honesty · reopen REC-03

**Depends:** BE-01 `POST …/internal-scan` + pool criteria + posted gate LIVE — nếu BE chưa deploy → browser 404/400 = **BLOCKED** trên mutate; FE unit path locks vẫn PASS.

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-REC-04-QA | Browser J-HRM-REC-CV-04-01..04 U65 + Network `/recruitment/` | **qa** |
| R-REC-04-BE-SYNC | Confirm BE-01 READY before full U65 mutate | qa / pm |
| Honesty | `recruitment_uat_ready` / `jd_dynamic_done` stay **false** · C-SLICE | PM/QC |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-fe-01.md` |
| **completion_report** | FE Quét kho LIVE: criteria O4 · GET pool scan · attach UV-YCTD · POST internal-scan complete\|skip · posted gate UX · F5 scan badges; vitest 24 PASS; Network `/recruitment/` only; DENY Campaign/seed/honesty; C-SLICE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-04-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-04
depends_on: FE-01 READY_FOR_QA · BE-01 READY (internal-scan LIVE) · API-01 CONFIRMED
entry_criteria: L0 stack; browser-only U65; zero-seed
MISSION: J-HRM-REC-CV-04-01..04 — Quét kho title+skill/exp → GET candidates-pool /recruitment/; attach; complete 0-hits; skip+reason; posted before→400/FE block; posted after→F5; DENY Campaign/REC-03/Nest /rec dual/seed/honesty flip.
exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qa-01.md · matrix update · PASS_TO_PM or FAIL with residual
cấm: pnpm seed:* · API fake · claim module UAT · flip recruitment_uat_ready
```
