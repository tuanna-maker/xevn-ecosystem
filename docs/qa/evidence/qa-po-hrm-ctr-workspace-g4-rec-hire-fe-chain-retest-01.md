# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4HIRE-RT-MSO7MLR1`** |
| **prior_defect** | `DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** · `contracts_printable_ready=false` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/recruitment` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `UI-HRM-CTR-HIRE-CTA.md` · `CandidateDetailView` · `rec-accept-offer-open-detail` |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01.json` |
| **commit** | `dc930c5` (FE fix files **uncommitted** — see §Residual) |

## Gates

| Gate | Result |
|------|--------|
| L0 stack | `pnpm run qc:dev-stack` — hrm + xbos + portal **200** (Node exit flake on Windows; probes **200**) |
| L0 FE↔BE | `pnpm run qc:fe-be-health` — **exit 0** |

## U65 prereq (no seed)

| Probe | Result |
|-------|--------|
| `GET …/recruitment/candidates` | **5** UV · **0** `employee_id` |
| Accept target | `9120c6c1-1bf3-42d9-8c1f-7150f7cfc624` · «UV Kênh QA RECCHQA-MSNK95YR» · API `status=offer` · YCTD `cc266a29-…` |
| CFG `offer` stage | Present in EFF (prior QA upsert — catalog O2, not hire seed) |

## FE chain attempted (browser)

1. Login inject `ceo@xe.vn` → CC embed `/command-center/hrm/recruitment?tab=candidates&candidateId=9120c6c1-…`
2. **Deep-link did not land on tab Ứng viên** — embed stayed on **Dashboard Tuyển dụng** (screenshot).
3. Harness click `data-testid="recruitment-nav-candidates"` → tab switch attempted.
4. **Could not open candidate detail** — timeout clicking list row action (no stable table action / wrong list mode).
5. **`rec-accept-offer-open-detail` never visible** → no «Chấp nhận offer» mutate.
6. **No** `POST …/applications/…/accept-offer` in Network.
7. **No** «Tạo HĐ» / workspace Step1 prefill.

Earlier retest runs (same stamp family): with UI on Dashboard only, `ui_ready=true` from stage-transition/list heuristics but **CTA still absent** — same product symptom as pre-fix QA `CTRG4HIRE-MSO6H8XK`.

## Matrix WS-G4-13..14

| Row | Verdict | Detail |
|-----|---------|--------|
| **WS-G4-13** | **FAIL** | Hire chain blocked: `rec-accept-offer-open-detail` not visible; no accept-offer POST; no workspace prefill |
| **WS-G4-14** | **BLOCKED** | Phụ thuộc accept-offer → `employee_id` |

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-HIRE-01** | **FAIL** | Không tới «Tạo HĐ» — accept-offer CTA/detail chain chưa PASS |
| **J-HRM-REC-07-03** | **BLOCKED** | Downstream hire-readiness |

## UF blocks (browser)

### UF-WS-G4-13 — Tuyển dụng → Chấp nhận offer → «Tạo HĐ» → workspace prefill

- **Persona / URL:** `ceo@xe.vn` → `…/hrm/recruitment?tab=candidates&candidateId=9120c6c1-…`
- **Trước mutate:** 0/5 UV có `employee_id`; target API `status=offer`
- **Action attempted:** Mở Ứng viên → chi tiết UV → «Chấp nhận offer» → «Tạo HĐ»
- **Network:** **Không** có `POST …/accept-offer` (CTA không render / detail không mở ổn định)
- **FE sau mutate:** — (mutate không chạy)
- **F5:** —
- **Verdict:** 🔴 **FAIL** — `dev-fe` P0 carry

### UF-WS-G4-14 — Hire-readiness sau hire

- **Verdict:** 🟡 **BLOCKED** — phụ thuộc WS-G4-13

## Network excerpt

- `GET /api/hrm/recruitment/pipeline-stages/effective` → **200**
- `GET /api/hrm/recruitment/candidates-pool` → **200**
- `GET /api/hrm/recruitment/dashboard` → **200**
- **No** `POST …/accept-offer` · **No** `POST …/contracts`

## Screenshots

- `docs/qa/evidence/screens/po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01/01-after-candidates-tab.png` — CC embed; Dashboard tab active (not Ứng viên detail)

## Defects / residual

| ID | Sev | Owner | Mô tả |
|----|-----|-------|--------|
| **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE** | **P0** | **dev-fe** | **OPEN** — retest FAIL: API `status=offer` nhưng không hoàn tất FE chain; CTA không xác nhận visible sau nav |
| **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES** | P1 | dev-fe | `?tab=candidates&candidateId=` trên CC embed không mở tab Ứng viên + detail (QA harness + screenshot) |
| **FE-FIX-UNCOMMITTED** | INFO | dev-fe | `candidateUvYctdUi.ts` / `recCandidateAcceptOffer.ts` **uncommitted** tại `dc930c5` — runtime có thể ≠ READY_FOR_QA artifact |

**Code review note (QA):** `mergeYctdDisplayOntoPoolCandidates` projects `stage` từ spine nhưng **không** project `status`; `resolveCandidatePipelineStage` ưu tiên `status` khi YCTD-bound → pool row có thể vẫn gate `applied` nếu pool `status=new` (vitest chỉ cover merged `stage=offer`).

## Promoted / not promoted

**Promoted:** —

**Not promoted:** WS-G4-13 · WS-G4-14 · J-HRM-CTR-HIRE-01 · J-HRM-REC-07-03

---

## completion_report

**Closed:** L0 PASS; U65 browser retest **executed** với portal `:5173` + corrected harness (`recruitment-nav-candidates`); documented deep-link/embed gap và **FAIL** hire chain — không có accept-offer POST, không workspace prefill; WS-G4-13/14 + J-HRM-CTR-HIRE-01 **FAIL/BLOCKED**; `contracts_printable_ready=false`; không seed.

**Residual:** `dev-fe` — (1) commit/serve FE fix; (2) verify `status` projection hoặc pipeline stage resolver trên pool merge; (3) fix embed deep-link `tab=candidates&candidateId=`; (4) QA re-run sau detail mở ổn định.

## next_owner

`pm` → `dev-fe` P0 re-dispatch

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02
role: dev-fe
read_first:
- docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01.md
- apps/web/hrm/src/lib/candidateUvYctdUi.ts (mergeYctd — project status + stage)
- apps/web/hrm/src/pages/Recruitment.tsx (tab=candidates deep-link embed)
entry_criteria: QA RETEST FAIL_TO_PM DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE; uncommitted fix at dc930c5
exit_criteria: ceo@ U65 — CC embed ?tab=candidates&candidateId= → detail Offer → rec-accept-offer-open-detail → POST accept-offer 2xx + employee_id → Tạo HĐ → workspace Step1 prefill; commit fix; vitest PASS
evidence_path: docs/qa/evidence/po-hrm-ctr-workspace-g4-accept-offer-cta-fe-02.md
ack_status: READY_FOR_QA
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01.md`  
**ack_status:** **FAIL_TO_PM**
