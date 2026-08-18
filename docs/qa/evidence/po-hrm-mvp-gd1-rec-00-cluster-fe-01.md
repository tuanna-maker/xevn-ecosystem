# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-5 seat #7 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-00` |
| **depends_on** | API-01 **CONFIRMED** · BA-01 O1–O7 · BE-01 parallel |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · DENY flip |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md` | Diễn biến FE §3.5 #1–#5 · AC-REC-JD-00-01..05 · P01–P05 · O1 path · O2 chips · O3 publish · O4 CODE-DUP · O5 YCTD-STATUS |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md` | F-JD-01..04 · POST `…/publish` · status draft\|active\|retired · PUB-* / CODE-DUP · physical `/recruitment/job-templates*` |
| **AS-IS UI** | `JobTemplatesTab` · `useJobTemplates` · `JdTemplateWriterDialog` · YCTD bindable RETAIN |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-00 Diễn biến #1–#3 · BR-BP-JD-01
- tech_spec / api: PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md F-JD-01..04
- ba: PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md §3.5 · VAL-REC-JD-*
- db_design: cite DATA-01 / API-01 job_description_templates status+bridge (no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O7
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Status chips VI **Nháp / Hiệu lực / Ngừng** from DTO `status` (+ `is_active` bridge fallback) | **ADD** `jobTemplateStatus.ts` |
| Create = draft — toast «Đã lưu bản Nháp»; writer «Lưu nháp»; no `status`/`is_active` on POST | **UPGRADE** |
| **Phát hành** → `POST …/job-templates/:id/publish` | **ADD** `publishJobDescriptionTemplate` + row CTA |
| Soft-retire **Ngừng** (DELETE path) — not hard «Xóa» SoT | **UPGRADE** |
| Filter trạng thái ALT-03 | **ADD** |
| Toast map PUB-* · CODE-DUP · YCTD-STATUS · RETIRED-LOCKED · REACTIVATE-HOLD | **ADD** `apiError.ts` |
| Network **only** `/api/hrm/recruitment/job-templates*` — **DENY** `/rec/job-descriptions` | **LOCK** |
| Bindable client prefer `status=active` | **UPGRADE** `isJobTemplateBindableForYctd` |
| YCTD picker / F-YCTD-JD / W1–W4 / 00a–00c | **RETAIN** must_keep |
| vitest | **65 PASS** (6 files) |

### Files touched

- `apps/web/hrm/src/lib/jobTemplateStatus.ts` (+ `.test.ts`) — **NEW**
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.recruitment-jd.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — status DTO · publish · list `?status=` · create omit status
- `apps/web/hrm/src/hooks/useJobTemplates.ts` — `publishTemplate`
- `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx` — chips / publish / Ngừng / filter
- `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx` — Lưu nháp
- `apps/web/hrm/src/lib/jobRequisitionUi.ts` — bindable status prefer
- tests: `JobTemplatesTab.source.test.ts` · writer source · position_code · jobRequisitionUi

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/jobTemplateStatus.test.ts \
  src/lib/apiError.recruitment-jd.test.ts \
  src/components/recruitment/JobTemplatesTab.source.test.ts \
  src/components/recruitment/JdTemplateWriterDialog.source.test.ts \
  src/lib/jobTemplatesPositionCode.test.ts \
  src/lib/jobRequisitionUi.test.ts
# → 6 files · 65 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-REC-JD-00-01** | Login → Tuyển dụng → **Thư viện JD** → GET `/recruitment/job-templates` 2xx → list/empty + chips VI · F5 | AC-01 · no `/rec/` · no seed |
| **J-HRM-REC-JD-00-02** | Thêm → **Lưu nháp** → POST 2xx · chip **Nháp** · F5; **Phát hành** (đủ required) → POST `…/publish` 2xx · chip **Hiệu lực** · F5 | AC-02/03 · P04 |
| **J-HRM-REC-JD-00-P01/P02** | Phát hành thiếu required / layout trống → 4xx PUB-* toast VI · vẫn Nháp | O3 |
| **J-HRM-REC-JD-00-P05** | Trùng mã → **409** CODE-DUP toast «Mã JD trùng» | O4 |
| **J-HRM-REC-JD-00-03** | YCTD → chỉ JD Hiệu lực; thử Nháp/Ngừng → **400** YCTD-STATUS | O5 · cite **J-HRM-JD-YCTD-01** RETAIN |
| **J-HRM-REC-JD-00-04** | Hiệu lực → **Ngừng** → DELETE 2xx · chip Ngừng · YCTD lịch sử còn; picker mới không còn | AC-05 · P03 |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Network assert:** path contains `/recruitment/job-templates` — **FAIL O1** if `/rec/job-descriptions` SoT  
**Cấm:** `pnpm seed:*` · API fake · honesty flip · reopen W1–W4

**Depends:** BE-01 must land `status` column + `POST …/publish` before full U65 🟢; FE wired to contract — QA note dual-assert chips from `is_active` until BE status returns.

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-JD-BE-PUB** | Publish/status chips fully green only after BE-01 migrate+publish LIVE | BE / QA |
| Honesty | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · C-SLICE | QC |
| Peers 00a–00c / YCTD-REF | RETAIN — not redefined | — |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
C-SLICE ≠ module REC UAT
U65 zero-seed
Nest /rec dual DENY · second JD SoT DENY · job_postings ≠ master
W1–W4 must_keep · F-YCTD-JD RETAIN
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-01.md` |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See handoff below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-01
lane: execution · qa
uc_ids: UC-BP-REC-00
depends_on: FE-01 READY_FOR_QA · BE-01 READY (status+publish LIVE)
entry: L0 stack; U65 zero-seed; evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-01.md
MISSION: Browser J-HRM-REC-JD-00-01..04 + P01/P02/P05 — chips VI; Lưu nháp; POST …/publish; Network /recruitment/job-templates only; toast PUB-*/CODE-DUP/YCTD-STATUS; Ngừng soft; DENY seed · /rec SoT · honesty flip
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-01.md · PASS_TO_PM or FAIL with residual
```
