# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-9 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-07` |
| **depends_on** | API-01 **CONFIRMED** · BA-01 O1–O12 · BE-01 parallel |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD/UPGRADE · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · DENY module REC UAT claim |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md` | Diễn biến FE §3.4 #1–#2 · AC-REC-07-01..08 · O1 path `/recruitment/applications/:id/accept-offer` · O3/O4 no re-key · O6 APP-02 · O8 HTP · O9 mail≠hire |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md` | F-REC-HIRE-01 POST accept-offer · display-ready DTO · mint HIRE-* · APP-02 after · HTP-05 RETAIN |
| **AS-IS UI** | HireEmployeeLinkDialog picker-only · no accept-offer CTA · REC-05/06 RETAIN |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-07 Diễn biến #1–#2 · BR-BP-LC-01 / BR-BP-ONB-01
- tech_spec / api: PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md F-REC-HIRE-01 · F-REC-APP-02 · F-CORE-HTP-05
- ba: PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md §3.1–3.4 · VAL-REC-HIRE-01..24 · O1–O12
- db_design: cite DATA-01 UV→EMP map · soft stamp (no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| `CandidateAcceptOfferDialog` — prefill read-only + POST accept-offer + APP-02 + HTP | **ADD** |
| Network accept | `POST …/applications/:id/accept-offer` only — **no** Nest `/rec` |
| After accept 2xx | `POST …/candidates/:id/transitions` hiredOutcomeKey ∈ EFF | **ADD** |
| HTP surface | `GET …/employees/:id/hire-readiness` + open emp CTA | **ADD** |
| Toast taxonomy | `HRM-REC-HIRE-*` · `HRM-REC-PAY-403` · STAGE-UNKNOWN via `toErrorMessage` | **ADD** |
| Detail CTA **Chấp nhận offer** | when YCTD + offer-ready (or soft-linked idempotent) | **ADD** |
| Peers REC-06/05/06a/04 · HireEmployeeLinkDialog residual | **RETAIN** must_keep |
| Nest `/rec` · mail=hire · pool/Kanban DONE · seed · honesty | **DENY** |
| vitest | **23 PASS** (REC-07 + REC-06 + REC-05 regression) |

### Files touched

- `apps/web/hrm/src/lib/recCandidateAcceptOffer.ts` — **NEW** helpers
- `apps/web/hrm/src/components/recruitment/CandidateAcceptOfferDialog.tsx` — **NEW**
- `apps/web/hrm/src/integrations/hrmApi.ts` — `postRecruitmentApplicationAcceptOffer` + `allowsAcceptOffer?`
- `apps/web/hrm/src/lib/apiError.ts` — HIRE mint + PAY-403 VI
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` — wire dialog
- `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` — CTA
- tests: `recCandidateAcceptOffer.test.ts` · `apiError.recruitment-hire.test.ts` · `CandidatesTab.rec07.source.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/recCandidateAcceptOffer.test.ts \
  src/lib/apiError.recruitment-hire.test.ts \
  src/components/recruitment/CandidatesTab.rec07.source.test.ts \
  src/components/recruitment/CandidatesTab.rec06.source.test.ts \
  src/lib/recCandidateStageTransition.test.ts
# → 5 files · 23 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-REC-07-01** | Login → Tuyển dụng → UV **gắn YCTD** **offer-ready** → **Chấp nhận offer** → xác nhận → F5 | Network **POST** `/recruitment/applications/:id/accept-offer` 2xx · FE prefill + `employee_id` · **không** bắt gõ lại · rồi **POST** `…/transitions` 2xx + Timeline · **≠** Nest `/rec` · **≠** mail=hire |
| **J-HRM-REC-07-02** | Re-accept cùng UV đã hired | **2xx idempotent** cùng `employee_id` · toast rõ · **không** emp thứ hai; true conflict → toast DUP |
| **J-HRM-REC-07-03** | Sau create → Mở hồ sơ · HTP-05 | `GET …/hire-readiness` blocker `HRM-HTP-NO-ACTIVE-CONTRACT` rõ khi chưa HĐ · **không** seed HĐ |
| **J-HRM-REC-07-04** | Ngoài scope / not offer-ready / PAY | 404/409 · OFFER-INVALID · **không** claim picker/Kanban/mail offer = FR-07 DONE · no reopen J-06 |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Tuyển dụng → Ứng viên  
**Prerequisite:** UV gắn ≥1 YCTD · stage offer-ready · BE accept-offer LIVE (BE-01 parallel)  
**Cấm:** `pnpm seed:*` · API fake hire · picker-only as PASS · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-REC-07-BE-LIVE** | QA browser blocked until BE-01 accept-offer + soft stamp LIVE | BE / QA |
| Honesty | `recruitment_uat_ready=false` · C-SLICE | QC |
| REC-03 / mail=hire / pool drag DONE | **OUT** / **DENY** | — |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
C-SLICE ≠ module REC UAT
U65 zero-seed
Nest /rec dual DENY · mail offer ≠ hire · picker/Kanban ≠ FR-07 DONE
APP-02 sole hired-outcome writer RETAIN · HTP-05 consume only
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: FE-01 READY · BE-01 READY (accept-offer LIVE)
entry_criteria: L0 stack; U65 zero-seed; browser-only; honesty false; C-SLICE
MISSION: U65 browser J-HRM-REC-07-01..04 — Chấp nhận offer → Network POST /recruitment/applications/:id/accept-offer 2xx + prefill + F5 soft link → transitions hired-outcome → HTP blocker; re-accept idempotent; DENY Nest /rec · mail=hire · picker/Kanban DONE · seed.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-01.md · PASS_TO_PM
cấm: seed · Nest /rec · claim mail offer = hire · reopen sealed J-06 without regression · honesty flip
```
