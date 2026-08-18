# FE-HRM-G-DB-01-HIRE-BIND-01 — Hire stage binds employee_id + VI 400

| Field | Value |
|-------|-------|
| **work_item_id** | `FE-HRM-G-DB-01-HIRE-BIND-01` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-07-21 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **prior** | `docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **§3.33 FR-HRM-INT-01** — Diễn biến **#3** chọn hồ sơ · **#5** thiếu hồ sơ → từ chối · **#7** Lưu đủ khóa · **#4** khác đơn vị |
| **tech_spec** | `docs/hrm/TECHSPEC.md` **§17.3 G-DB-01** · **§16.3 FR-HRM-INT-01** · `ref_srs` FR-HRM-INT-01 |
| **be_evidence** | `docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md` — codes `HRM-REC-HIRE-400` / `409`; body `employee_id` |
| **uc_ids** | `UC-HRM-INT-01` |
| **br_ids** | G-DB-01 · G-INT-01 |
| **sponsor_confirm** | PM NARROW U69 · BE READY_FOR_QA |
| **change_mode** | ADD |
| **must_keep** | G-RC-01 headcount GWC · leave create · U65 zero-seed |
| **forbidden** | seed · wipe G-RC · Phase1/PROD · change leave flows |

### Spec says / code does

| Spec | Before | After (this wave) |
|------|--------|-------------------|
| Chốt hired **chọn/xác nhận** hồ sơ | PATCH `stage=hired` không gửi `employee_id` → 400 | Dialog / form bắt buộc chọn NV → PATCH kèm `employee_id` |
| Thiếu hồ sơ → từ chối rõ | Toast EN/generic | `HRM-REC-HIRE-400` / `409` map VI trong `apiError` |
| Happy path 2xx | Fail | Có `employee_id` (hoặc reverse `employees.candidate_id` vẫn được BE resolve nếu đã link) |

---

## Implementation

| Path | Change |
|------|--------|
| `lib/recruitmentHireLink.ts` | **NEW** — `isHiredStage` · `needsHireEmployeePicker` · VI copy · CODE-MEMORY |
| `lib/recruitmentHireLink.test.ts` | **NEW** — 4 vitest |
| `components/recruitment/HireEmployeeLinkDialog.tsx` | **NEW** — picker hồ sơ (useEmployees gated) |
| `lib/apiError.ts` | Map `HRM-REC-HIRE-400` / `HRM-REC-HIRE-409` → VI |
| `integrations/hrmApi.ts` | `employee_id` on pool row + create/update; stage PATCH `/candidates-pool/:id/stage` + application stage body |
| `CandidatesTab.tsx` | Intercept hired → HireEmployeeLinkDialog; pass `employee_id` |
| `JobCandidatesDialog.tsx` | Same for application stage; enrich pool `employee_id` |
| `hooks/useKanbanCandidates.ts` | `employeeId` + opts on stage update |
| `pages/Recruitment.tsx` | Kanban drop → hired opens hire dialog |
| `CandidateFormDialog.tsx` | Stage=hired → bắt buộc select hồ sơ + send `employee_id` |

U65: **no seed** in this wave.

---

## Verification

```text
pnpm exec vitest run src/lib/recruitmentHireLink.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 4 passed
```

Manual QA (browser, zero-seed):

1. Negative: stage → «Đã tuyển» không chọn hồ sơ → dialog chặn / hoặc toast VI `HRM-REC-HIRE-400`.
2. Happy: chọn hồ sơ cùng đơn vị → Network PATCH …/stage body có `employee_id` → **2xx**; F5 còn `hired` + link.

---

## completion_report

**Closed:**
- FE binds `employee_id` on pool stage, application stage, kanban hired, and form create/edit hired.
- User-visible VI for `HRM-REC-HIRE-400` / `409`.
- CODE-MEMORY on hire helpers + kanban + form; must_keep leave/G-RC untouched.

**Residual:**
1. BE list applications JSON vẫn chưa nhúng `employee_id` trong `candidates` object — FE enrich từ pool (workaround). Optional BE enrich later.
2. CampaignCandidatesTab stage handler vẫn stub (pre-existing) — ngoài NARROW.
3. Browser UF/J-HRM-INT-01 — **QA**.

**Not claimed:** Phase1 DONE · PROD · UF 🟢.

---

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/fe-hrm-g-db-01-hire-bind-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-G-DB-01-HIRE-BIND-01
from_role: pm
to_role: qa
lane: execution
priority: P0

## Entry
FE READY_FOR_QA: docs/qa/evidence/fe-hrm-g-db-01-hire-bind-01-20260721.md
BE: docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md
spec: SRS §3.33 FR-HRM-INT-01 · TechSpec §17.3 G-DB-01
persona: ceo@xe.vn / Xevn@2026
U65: zero-seed · browser FE only
must_keep: G-RC-01 headcount · leave CREATE · không regression UF 🟢

## Job
1. J-HRM-INT-01 / UF hire: login → Tuyển dụng → Candidates / Job candidates / Kanban
2. Negative: chọn stage «Đã tuyển» không gắn hồ sơ → dialog bắt chọn HOẶC toast VI chứa nội dung HRM-REC-HIRE-400; không orphan hired
3. Happy: chọn hồ sơ NV cùng đơn vị → Network PATCH stage body có employee_id → 2xx; list/F5 còn hired
4. Form tạo/sửa ứng viên stage=hired thiếu hồ sơ → validate FE VI trước submit
5. Evidence: docs/qa/evidence/qa-hrm-g-db-01-hire-bind-01-20260721.md (UF block mẫu U65)
6. ack_status PASS_TO_PM hoặc FAIL_TO_PM + residual

entry_criteria: FE+BE evidence + L0 stack
exit_criteria: reject+happy browser; no seed
```
