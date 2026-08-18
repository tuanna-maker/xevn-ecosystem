# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02` |
| **role** | `qa` |
| **parent** | `PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02` |
| **runner_stamp** | **`CTRG4HIRE-RT2-MSO89GMT`** |
| **prior_defect** | `DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · `contracts_printable_ready=false` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-HRM-CTR-HIRE-CTA.md` · `rec-accept-offer-open-detail` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.json` |
| **commit** | `5ccb26e` (FE-02 target `5ccb26e`) |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&candidateId=` |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** (Windows Node exit flake on success path) |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **exit 0** · ALL PASS |

## UF blocks (browser · U65)

### UF-WS-G4-13 — Tuyển dụng → Chấp nhận offer → «Tạo HĐ» → workspace Step1 prefill

- **Persona / URL:** `ceo@xe.vn` → `…/command-center/hrm/recruitment?tab=candidates&candidateId=9120c6c1-…`
- **Trước mutate:** 0/5 UV có `employee_id`; target API `status=offer`
- **Action:** Mở Ứng viên (fallback nav) → chi tiết UV → «Chấp nhận offer» → «Xác nhận chấp nhận offer» → «Tạo HĐ»
- **Network:** `POST …/applications/9120c6c1-…/accept-offer` → **201** · `employee_id=235428a3-f74b-413a-a27d-51ad9963cd75`
- **FE sau 2xx:** dialog success · workspace `ctr-create-step-1` visible · URL `workspace=create&employee_id=…&subject_type=employee`
- **F5:** không re-run (mutate đã tạo NV — U65 chain consumed)
- **Verdict:** 🟢 **PASS**
- **spec_ref:** FR-UC-BP-REC-07 · AC-REC-UV-02 · J-HRM-CTR-HIRE-01

### UF-WS-G4-14 — Hire-readiness sau accept-offer

- **Network:** `GET …/employees/235428a3-…/hire-readiness` → **200** · `active_contract=null`
- **Verdict:** 🟡 **PASS_WITH_HOLD** — HTP probe OK; full HĐ mutate ngoài slice

## Deep-link carry (P2)

Harness `data-active`/`aria-selected` trên `recruitment-nav-candidates` = false sau goto — **detail + CTA vẫn mở** sau fallback click. Carry **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** (nav active indicator / zero-click tab) — không block WS-G4-13 PASS.

## U65 prereq

```json
{
  "candidates_count": 5,
  "with_employee_id": 0,
  "accept_target": {
    "id": "9120c6c1-1bf3-42d9-8c1f-7150f7cfc624",
    "name": "UV Kênh QA RECCHQA-MSNK95YR",
    "status": "offer"
  }
}
```

## Steps attempted

- Goto http://127.0.0.1:5173/command-center/hrm/recruitment?portal=1&tenantId=xevn&companyId=main&tab=candidates&candidateId=9120c6c1-1bf3-42d9-8c1f-7150f7cfc624
- Deep-link tab candidates active: false (uvNavActive=false, dashboardActive=false)
- Fallback click recruitment-nav-candidates
- Recruitment UI ready: true
- Click Chấp nhận offer
- Submit accept-offer
- Click Tạo HĐ from accept dialog

## Matrix WS-G4-13..14

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-13** | PASS | {"verdict":"PASS","url":"http://127.0.0.1:5173/command-center/hrm/contracts?tab=candidates&candidateId=9120c6c1-1bf3-42d9-8c1f-7150f7cfc624&workspace=create&employee_id=235428a3-f74b-413a-a27d-51ad9963cd75&subject_type=employee","hasWorkspace":true,"hasEmp":true,"step1":true,"employee_id":"235428a3-f74b-413a-a27d-51ad9963cd75","hireCtaFrom":"accept-dialog"," |
| **WS-G4-14** | PASS_WITH_HOLD | {"verdict":"PASS_WITH_HOLD","hire_readiness_status":200,"active_contract":null,"note":"HTP probe after accept-offer — full HĐ mutate out of slice"} |

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-HIRE-01** | PASS | {"verdict":"PASS","clickPath":"Tuyển dụng → Chấp nhận offer → Tạo HĐ → workspace create","hireCtaFrom":"accept-dialog","deepLinkTabOk":false} |
| **J-HRM-REC-07-03** | PASS_WITH_HOLD | {"verdict":"PASS_WITH_HOLD"} |

## Network (accept-offer + hire-readiness)

- `POST 201 `http://127.0.0.1:5173/api/hrm/recruitment/applications/9120c6c1-1bf3-42d9-8c1f-7150f7cfc624/accept-offer?company_id=main`
- `POST 201 `accept-offer`
- `GET 200 `http://127.0.0.1:5173/api/hrm/employees/235428a3-f74b-413a-a27d-51ad9963cd75/hire-readiness?company_id=holding`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/contract-templates?company_id=main&status=active`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/contracts?company_id=main&page=1&page_size=100`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/employees/235428a3-f74b-413a-a27d-51ad9963cd75/contract-create-context?company_id=main`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/employees/235428a3-f74b-413a-a27d-51ad9963cd75/contract-create-context?company_id=main`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/employees/235428a3-f74b-413a-a27d-51ad9963cd75/contract-create-context?company_id=main`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/employees/235428a3-f74b-413a-a27d-51ad9963cd75/contract-create-context?company_id=main`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/employees/235428a3-f74b-413a-a27d-51ad9963cd75/contract-create-context?company_id=main`
- `GET 200 `http://127.0.0.1:5173/api/hrm/contracts-insurance/employees/235428a3-f74b-413a-a27d-51ad9963cd75/contract-create-context?company_id=main`

## Screenshots

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02/01-after-deeplink.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02/03-accept-offer-dialog.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02/04-after-accept-offer.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02/05-workspace-after-hire-cta.png`

## Defects

- **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE** (P0) · dev-fe: CLOSED — FE-02 retest PASS

## Promoted / not promoted

**Promoted:** J-HRM-CTR-HIRE-01, J-HRM-REC-07-03

**Not promoted:** —

---

## completion_report

**Closed:** FE-02 (`5ccb26e`) hire chain U65 browser — `rec-accept-offer-open-detail` visible on offer UV · `POST accept-offer` **201** + `employee_id` · «Tạo HĐ» → contracts workspace Step1 prefill · WS-G4-13 **PASS** · J-HRM-CTR-HIRE-01 **PASS** · DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE **CLOSED** · `contracts_printable_ready=false` · zero-seed.

**Residual:** WS-G4-14 **PASS_WITH_HOLD** (HTP only) · deep-link nav active indicator carry P2 · Playwright harness cần scan cross-frame cho Radix dialog portal.

## next_owner

`pm` → `qc` narrow GWC on hire slice

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-QC-01
role: qc
read_first:
- docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md
- docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QA RETEST-02 PASS_TO_PM; stamp CTRG4HIRE-RT2-MSO89GMT; commit 5ccb26e
exit_criteria: GWC narrow WS-G4-13/14 + J-HRM-CTR-HIRE-01; DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE CLOSED; contracts_printable_ready=false; deep-link tab carry PASS_WITH_HOLD if noted
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-rec-hire-01.md
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md`  
**ack_status:** **PASS_TO_PM**
