# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-4 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-06a` |
| **depends_on** | API-01 **CONFIRMED** · BA-01 AC · BE-01 READY (parallel) |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD/UPGRADE · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · **C-SLICE** · DENY module REC UAT claim |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md` | Diễn biến FE §3.6 #3–#8 · AC-REC-IV-03..07 · R01–R07 · O1 path · O5 toast distinct · R-A no POST |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md` | F-REC-IV-02 status + `no_show` · F-REC-IV-03 PATCH `:id` · errors PAST/CANCEL/INVALID · Lane A `/recruitment/interviews*` |
| **AS-IS UI** | `ScheduleInterviewDialog` · `CandidatesTab` · `candidateActiveInterview` · prior create/409/badge **RETAIN** |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a Diễn biến #4–#7 · AC-REC-IV-03..06
- tech_spec / api: PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md F-REC-IV-02/03
- ba: PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md §3.6 · VAL-REC-IV-*
- db_design: cite API-01 §7 spine recruitment_interviews (no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O10
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| `ManageActiveInterviewDialog` — confirm / cancel / complete / **no_show** / R-A reschedule | **ADD** |
| Network mutate | `PATCH …/interviews/:id/status` · `PATCH …/interviews/:id` only — **no** POST create on R-A · **no** catalog / Lane B SoT |
| Toast taxonomy | `409 ACTIVE` ≠ `STAGE-DISALLOW` ≠ `PAST-DATETIME` ≠ `CANCEL-REASON` ≠ `INVALID-TRANSITION` |
| Bind `active_interview` | RETAIN badge · ADD `active_interview_id` picker + 409 details handoff |
| CandidatesTab | Badge / calendar → manage when ACTIVE; schedule when 0 ACTIVE |
| ScheduleInterviewDialog | RETAIN create + soft-gate; 409 → `onActiveConflict` manage |
| Prior create/409/badge GWC | **RETAIN** (must_keep) |
| vitest | **27 PASS** (4 files) |

### Files touched

- `apps/web/hrm/src/integrations/hrmApi.ts` — status DTO expand + `rescheduleRecruitmentInterview`
- `apps/web/hrm/src/lib/apiError.ts` — distinct IV error VI copy
- `apps/web/hrm/src/components/recruitment/ManageActiveInterviewDialog.tsx` — **NEW**
- `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx` — 409 handoff + expected codes
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` — manage wire
- `apps/web/hrm/src/components/recruitment/candidateActiveInterview.ts` — id helpers
- tests: `*.source.test.ts` · `candidateActiveInterview.test.ts` · `apiError.recruitment-interview.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/components/recruitment/ScheduleInterviewDialog.source.test.ts \
  src/components/recruitment/candidateActiveInterview.test.ts \
  src/components/recruitment/CandidatesTab.source.test.ts \
  src/lib/apiError.recruitment-interview.test.ts
# → 4 files · 27 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-REC-IV-01** | RETAIN — UV 0 ACTIVE → Xếp lịch → Lưu → badge + F5 · Network **POST** `/recruitment/interviews` 2xx | Prior GWC |
| **J-HRM-REC-IV-02** | ACTIVE → thử tạo → **409** ACTIVE toast ≠ soft-gate | RETAIN |
| **J-HRM-REC-IV-03** | Badge/Quản lý → **Hủy** → badge «—» → xếp mới → 1 ACTIVE · F5 | PATCH status cancelled |
| **J-HRM-REC-IV-04** | Manage → Hoàn tất **hoặc** Không đến (`no_show`) → xếp vòng 2 | TERMINAL then POST |
| **J-HRM-REC-IV-05** | Manage → Đổi lịch → Lưu · Network **PATCH** `:id` (không POST) · badge giờ mới · F5 same id | R-A |
| **J-HRM-REC-IV-06** | Click badge → manage đúng ACTIVE id (projection **or** 409 details) · không mở create SoT | |
| **J-HRM-REC-IV-07** | Stage disallow → toast STAGE-DISALLOW ≠ 409 | soft-gate |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · URL portal HRM embed Tuyển dụng → Ứng viên  
**Cấm:** `pnpm seed:*` · API fake inbox · Lane B catalog schedule as PASS · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-IV-ID-PROJ** | LIVE BE `toActiveInterviewProjection` chưa embed `active_interview_id` (SQL đã SELECT) — FE bind sẵn; manage từ badge cần id từ projection **hoặc** 409 handoff (`onActiveConflict`). QA: nếu badge mở manage thiếu id → dùng path thử xếp lịch → 409 → manage, **hoặc** BE narrow ADD id vào nested projection. | BE narrow / QA note |
| Honesty | `recruitment_uat_ready=false` · C-SLICE | QC |
| InterviewsTab Lane B | **OUT** as FR-06a SoT (must_keep DENY) | — |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
prior IV create/409/badge GWC RETAIN ≠ module UAT
U65 zero-seed
REC-03 OUT · Lane B ≠ SoT · Nest /rec dual DENY
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md` |
| **next_owner** | **qa** |
| **completion_report** | FE residual UC-BP-REC-06a: ManageActiveInterviewDialog cancel/confirm/complete/no_show + R-A PATCH; Lane A path only; distinct toasts; active_interview bind + 409 handoff; RETAIN create/409/badge; vitest 27 PASS; honesty false. |
