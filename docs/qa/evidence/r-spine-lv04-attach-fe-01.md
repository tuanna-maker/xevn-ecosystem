# R-SPINE-LV04-ATTACH-FE-01 — Web leave create attachment (ốm ≥3 ngày)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-LV04-ATTACH-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P1 |
| **prior** | `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md` — LV-04 BLOCKED (no `input[type=file]`) |
| **spec_ref** | FR-UC-H03 · BR-LEAVE-ATT-01 · API_CONTRACT_NEW §4 leave create `attachment_url` |
| **change_mode** | ADD / UPGRADE |
| **U65** | honored — no seed |
| **must_keep** | LeaveOverviewRecentPanel mount GWC (`Attendance.tsx` import untouched) |

---

## Mission closed

Web **Tạo yêu cầu nghỉ** (LeaveTab) now shows **Đính kèm giấy bác sĩ** when leave type is ốm / `LVT_02` / `sick` / `medical` (label «Ốm»), uploads via existing `uploadHrmFile` (`feature=leave-attachment`), and binds relative `attachment_url` on POST create. Client blocks Gửi when ốm ≥3 ngày without valid URL (aligned with BE VAL-ATT after catalog fix).

---

## spec_read_ack

- **srs:** `docs/brand-new-documents-20270801/SRS_NEW.md` § FR-UC-H03 · chứng từ nghỉ ốm ≥3 ngày · BR-LEAVE-ATT-01 · Diễn biến #1–2
- **tech_spec / api:** `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` §4 leave create — sick ≥3 cần `attachment_url` under `/api/hrm/files/`
- **qa prior:** `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md` LV-04 BLOCKED
- **uc_ids:** FR-UC-H03 · LV-04 · J-HRM-06
- **change_mode:** ADD
- **must_keep:** LeaveOverviewRecentPanel; catalog leave_type picker; U65 no seed

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/leaveAttachment.ts` | NEW — sick detect, show/require, MIME, relative URL |
| `apps/web/hrm/src/lib/leaveAttachment.test.ts` | NEW — BR-LEAVE-ATT-01 unit |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Attach UI + upload + submit gate + CODE-MEMORY |
| `apps/web/hrm/src/hooks/useLeaveRequests.ts` | FormData + `buildLeaveCreatePayload.attachment_url` |
| `apps/web/hrm/src/hooks/useLeaveRequests.test.ts` | Payload attach cases |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `HrmLeaveRequest.attachment_url?` |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | `leaveAttachmentInput` / `leaveAttachmentHint` |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts` | Assert new ids |
| `apps/web/hrm/src/i18n/locales/vi.json` · `en.json` | VI/EN attach labels |

**Untouched:** `LeaveOverviewRecentPanel.tsx`, Attendance overview mount, approve/list paths (except create payload).

---

## Product rules (FE)

| Condition | UI |
|-----------|-----|
| Leave type ốm (`LVT_02` / `sick` / `medical` / label contains «ốm») | Show `input[type=file]` + label **Đính kèm giấy bác sĩ** |
| ốm + `total_days` ≥ 3 | Required `*` + client block Gửi if no upload |
| ốm + days &lt; 3 | Optional attach |
| Other leave types | Hide attach; clear stale URL on type change |

Upload: `POST /api/hrm/files/upload?feature=leave-attachment` → normalize to relative `/api/hrm/files/{scope}/…` → POST leave-requests `attachment_url`.

Harness hooks:

- `data-testid="hdsd-leave-attachment-input"`
- `data-testid="hdsd-leave-attachment-hint"`
- Label / aria: **Đính kèm giấy bác sĩ**

---

## Verify (dev)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/leaveAttachment.test.ts src/hooks/useLeaveRequests.test.ts src/lib/hdsdMutateTestIds.test.ts
```

**Result:** 3 files · **16/16 PASS** (2026-08-03).

---

## QA retest (U65 browser — WEB-QA-W1-R1 · LV-04)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`  
**URL:** `/hr/attendance?portal=1&tenantId=xevn&companyId=main` → tab **Nghỉ phép** → **Tạo yêu cầu nghỉ**

| Case | Steps | Expect |
|------|-------|--------|
| **LV-04** | Ốm / `LVT_02` · dates ≥3 ngày · pick PDF/ảnh → upload 2xx → **Gửi yêu cầu** | Network: files upload 2xx; POST leave-requests **201** with non-null `attachment_url` under `/api/hrm/files/`; FE list row + F5 |
| **LV-03** (with BE VAL-ATT) | Same without attach | FE toast block **or** BE `HRM-LEAVE-VAL-ATT` 4xx — **no silent 201** |
| **Mount must_keep** | Overview leave panel | `#root` mount · LeaveOverviewRecentPanel OK · no Vite resolve fail |

**Cấm:** seed inbox · claim UAT DONE.

---

## Residual

| ID | Note |
|----|------|
| `PO-E2E-SPINE-02-BE-LV03-VAL-ATT-01` | BE must reject catalog `LVT_02` ≥3d without attach (parallel) — FE alone cannot close LV-03 |
| `R-SPINE-WEB-APPROVE-UX-01` | Approve honesty — out of scope this WI |

---

## completion_report

**Closed:** Leave create dialog attach control for ốm; upload via `leave-attachment`; `attachment_url` on create payload; client BR-LEAVE-ATT-01 gate; vitest 16/16; CODE-MEMORY; LeaveOverviewRecentPanel untouched.

**Open:** Browser LV-04 / LV-03 retest (QA); BE catalog VAL-ATT if not landed.

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/r-spine-lv04-attach-fe-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-02-WEB-QA-W1-R1
role: qa
priority: P1
mission: Retest LV-04 (ốm≥3 + attach) and LV-03 (ốm≥3 no attach) on web leave create after R-SPINE-LV04-ATTACH-FE-01 + BE VAL-ATT catalog fix. U65 browser-only. Preserve LeaveOverviewRecentPanel mount GWC.
entry: docs/qa/evidence/r-spine-lv04-attach-fe-01.md READY_FOR_QA · prior FAIL docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md
exit: evidence docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md · LV-04 PASS (POST 201 + attachment_url) · LV-03 FAIL_DEEP = VAL-ATT or FE block (no silent 201) · mount 🟢
persona: ceo@xe.vn / Xevn@2026 · company_id=main
click: /hr/attendance → Nghỉ phép → Tạo yêu cầu nghỉ → LVT_02 Ốm → dates ≥3d → input[data-testid=hdsd-leave-attachment-input] / label Đính kèm giấy bác sĩ
cấm: seed · invent L2 ladder · claim UAT DONE
```
