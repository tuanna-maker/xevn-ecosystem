# BE-HRM-G-DB-01-HIRE-LINK-01 — Hire → employee soft link enforce

| Field | Value |
|-------|-------|
| **work_item_id** | `BE-HRM-G-DB-01-HIRE-LINK-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution |
| **priority** | P0 |
| **date** | 2026-07-21 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **prior** | `docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md` (G-DB-01) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **§3.33 FR-HRM-INT-01** — Diễn biến **#5** thiếu hồ sơ → từ chối; **#7** Lưu thành công đủ khóa; **#4** khác đơn vị; Kết quả trả về: mã hồ sơ gắn |
| **tech_spec** | `docs/hrm/TECHSPEC.md` **§17.2** INT spine · **§17.3 G-DB-01** · **§16.3 FR-HRM-INT-01** (PARTIAL → hire AC) · `ref_srs` FR-HRM-INT-01 |
| **sa_map** | `docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md` — G-DB-01 P0 hire INT-01 thiếu enforce employee link |
| **uc_ids** | `UC-HRM-INT-01` |
| **br_ids** | G-DB-01 · G-INT-01 · BR-CD-F6-05 · BR-REC-WF-05 |
| **sponsor_confirm** | SA W3-DB PASS · PM dispatch NARROW U69 |
| **change_mode** | ADD |
| **must_keep** | G-RC-01 headcount · leave CREATE GWC · U65 no seed |
| **forbidden** | hard FK mass migration G-DB-02 · dual catalog rewrite G-DB-04 · Phase1/PROD · seed |

### Spec says / code does

| Spec | Before | After (this wave) |
|------|--------|-------------------|
| Hired **bắt buộc** mã hồ sơ | Catalog PATCH `stage=hired` **không** kiểm `employee_id` | Reject **`HRM-REC-HIRE-400`**; stamp soft `employee_id` on success |
| Cùng đơn vị | Không assert | **`HRM-REC-HIRE-409`** khi employee.company ≠ candidate.company |
| WF terminal hire AC | CALLBACK-SKIP `hire_ac_unmet` (giữ) | + stamp `employee_id` khi AC met via reverse `employees.candidate_id` |
| Hard `REFERENCES employees` | Sparse / soft | **Không** ADD hard FK (G-DB-02 cấm) |

---

## Implementation

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/recruitment/hire-employee-link.ts` | **NEW** — resolve/assert soft hire link; codes `HRM-REC-HIRE-400` / `HRM-REC-HIRE-409`; `@CODE-MEMORY` INT-01 #5/#7 |
| `recruitment-catalog.service.ts` | Enforce on `updateCandidatePoolStage` · `updateCandidatePool` · `createCandidatePool` · `updateCandidateApplicationStage` |
| `dto/update-candidate-pool.dto.ts` | Optional `employee_id` UUID |
| `recruitment.controller.ts` | Pass `employee_id` on stage PATCH bodies |
| `recruitment-workflow.bridge.ts` | Stamp `employee_id` on terminal hired when AC met |
| `recruitment.service.ts` | ADD soft `recruitment_candidates.employee_id` (NULL, no REFERENCES) |

**Stable error codes (user-facing hire):**

| Code | HTTP | When |
|------|------|------|
| `HRM-REC-HIRE-400` | 400 | stage/create hired without resolvable employee link |
| `HRM-REC-HIRE-409` | 409 | employee company ≠ candidate company |

**Resolve order:** explicit `employee_id` body → `candidates.employee_id` → `employees.candidate_id` reverse (soft).

---

## Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=be-hrm-g-db-01-hire-link-01 --testPathPatterns=recruitment-workflow.bridge.spec --testPathPatterns=recruitment-catalog.service.spec --testPathPatterns=be-hrm-g-rc-01 --no-coverage
→ Test Suites: 4 passed · Tests: 34 passed (incl. hire-link reject + happy path; G-RC-01 must_keep)
```

U65: **no seed** in this wave.

---

## completion_report

**Closed:**
- G-DB-01 app-enforce: hire/INT path cannot set `hired` without employee link; stable `HRM-REC-HIRE-400`.
- Happy path stamps soft `employee_id`; company mismatch → `HRM-REC-HIRE-409`.
- CODE-MEMORY + SRS Diễn biến #5/#7 on helper + catalog/WF paths.
- Soft column on spine `recruitment_candidates.employee_id` (no hard FK).
- Jest reject + happy + must_keep G-RC-01 / WF bridge.

**Residual:**
1. FE CandidatesTab / JobCandidatesDialog currently PATCH stage=hired **without** `employee_id` → will get **400** until FE binds hồ sơ (or creates employee with `candidate_id`) — QA/J-HRM-INT-01 + optional `FE-HRM-G-DB-01`.
2. G-DB-02 hard REFERENCES — **out of scope** (cấm).
3. G-DB-04 dual catalog — untouched (catalog pool is live FE hire path; spine soft column only).

**Not claimed:** Phase1 DONE · PROD · UF 🟢 · hard FK.

---

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-G-DB-01-HIRE-LINK-01
from_role: pm
to_role: qa
lane: execution
priority: P0

## Entry
BE READY_FOR_QA: docs/qa/evidence/be-hrm-g-db-01-hire-link-01-20260721.md
spec: SRS §3.33 FR-HRM-INT-01 · TechSpec §17.3 G-DB-01
persona: ceo@xe.vn / Xevn@2026
U65: zero-seed · browser FE only
must_keep: G-RC-01 headcount · leave CREATE · UF 🟢 không regression đè

## Job
1. J-HRM-INT-01 (or UF hire chốt tuyển): login → Tuyển dụng → candidate pipeline
2. Negative: set stage «Đã tuyển / hired» WITHOUT employee link → Network expect **400** `HRM-REC-HIRE-400`; FE không hiện hired orphan
3. Happy: tạo/chọn hồ sơ NV cùng đơn vị (employee_id body OR employees.candidate_id) → hired 2xx; response/list có employee_id; F5 còn
4. Optional: application stage hired same AC
5. Evidence: docs/qa/evidence/qa-hrm-g-db-01-hire-link-01-20260721.md (UF block mẫu U65)
6. ack_status PASS_TO_PM hoặc FAIL_TO_PM + residual FE bind if 400 on happy without FE wire

entry_criteria: BE evidence + L0 stack
exit_criteria: J-HRM-INT-01 reject+happy browser evidence; no seed
```
