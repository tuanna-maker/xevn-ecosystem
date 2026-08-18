# Evidence — PO-UC-TC-W2-SYNTH-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W2-SYNTH-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true |
| **uat_done** | **false** |
| **phase1_product_done** | **false** |

---

## 1. Mission checklist

| # | Item | Result |
|---|------|--------|
| 1 | Verify 245 inventory UC → `by-uc/*.md` | **245/245** · missing **0** · extra **0** |
| 2 | Sum `cases_designed` from manifests | **3334** = 374+267+302+192+1236+963 |
| 3 | Sample-scan duplicate TC-IDs | Unique **3281** · **0** cross-file collisions · neo = owning UC file |
| 4 | Rollup code_readiness | IMPL **150** · PARTIAL **82** · GAP **5** · UNKNOWN **8** |
| 5 | P0 residuals W3 | §3 below |
| 6 | SRS_new N/A-DELTA vs mapped | 123 / 122 (see MASTER §5) |
| 7 | Rewrite MASTER | `docs/qa/professional/by-uc/MASTER_COVERAGE_REPORT.md` **W2 FINAL** |
| 8 | Bus PASS_TO_PM | APPEND `docs/program/AGENT_MESSAGE_BUS.md` |

**Cấm đã giữ:** không browser · không seed · không claim UAT/Phase1 DONE · không invent Leave L2 PASS · không sửa `apps/**`.

---

## 2. File coverage

- Inventory SoT: `docs/qa/professional/by-uc/_INVENTORY_PHASE1.md` (245 rows)
- Script check: every UC id → `docs/qa/professional/by-uc/<UC-ID>.md` exists
- **Missing list:** *(empty)*

---

## 3. P0 residual → W3 (U86)

### GAP ids (code_readiness)

| Pri | uc_id | Squad | spec_ref |
|----:|-------|-------|----------|
| 1 | `XBOS-DM-09` | S3 | BANG_TONG_HOP STT 85 · TECHSPEC_HE §8.1 · by-uc `XBOS-DM-09.md` · api clone TBD |
| 2 | `XBOS-DM-LOG-09` | S4 | TECHSPEC_M03 §2 · PHASE1 matrix STT 106 · SRS_VN N/A-DELTA |
| 3 | `UC-HRM-27` | S6 | TECHSPEC_HE §9.3 · embed Quyết định/báo cáo backlog · STT 351 |
| — | `XBOS-DM-LOG-18` | S4 | Notify LOG spoke — P1/P2 after clone |
| — | `UC-HRM-MOB-14` | S6 | TECHSPEC_MOBILE §8 · offline P2 |

### SPEC_GAP (không Dev invent)

- **SG-LEAVE-L2** — `HRM-AT-12` (+ mobile MOB-06/08 SG inventory): exemplar `UC-FR-H03_LEAVE` · AS-IS 1 bước — **không** PASS L2

### Top PARTIAL clusters

- S6: 31 PARTIAL (OP/PF/RC interview/mobile/embed)
- S4: 12 PARTIAL + 8 UNKNOWN (TechSpec mỏng)
- S5: 12 PARTIAL (DM-HRM + AT-12 + invite)
- S3: 12 PARTIAL catalog depth
- S2: 13 PARTIAL CC/RACI/DASH

---

## 4. completion_report

**Closed**

- W2 synth cho program PO-FULL-ECO-UC-TC: đủ 6 manifest READY_FOR_SYNTH.
- Coverage file 245/245; cases_designed **3334**; readiness rollup 150/82/5/8.
- TC-ID: 0 collision cross-file; MASTER report FINAL + honest `uat_done: false`.
- Residual W3 queue P0 GAP + Leave L2 SPEC_GAP documented for PM U86.

**Residual / open**

- Execution W3 Dev/QA chưa chạy (đúng scope governance synth).
- S4 UNKNOWN (8) cần SA/BA depth hoặc accept.
- Leave L2 = SPEC_GAP process — không đóng bằng code bịa ngưỡng.
- Δ 53 giữa cases_designed và unique TC-ID extract — chấp nhận SoT = manifest Σ; optional hygiene sau.

---

## 5. next_owner

**pm**

---

## 6. next_dispatch_prompt (copy-ready — first W3 wave)

```text
work_item_id: PO-UC-TC-W3-BE-DM09
from_role: pm
to_role: dev-be
lane: execution
priority: P0
u65_zero_seed: true
ack_status_target: READY_FOR_QA

## CONTEXT
W2 Synth CLOSED (PO-UC-TC-W2-SYNTH-01). MASTER: 245 UC · 3334 cases · uat_done false.
U86: auto-fix top GAP — start with catalog clone.

## READ_FIRST
1. docs/qa/professional/by-uc/MASTER_COVERAGE_REPORT.md §6–7
2. docs/qa/professional/by-uc/XBOS-DM-09.md (full TC tree + code_note GAP)
3. docs/qa/evidence/po-uc-tc-w2-synth-01.md §3
4. docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md §8.1
5. PHASE1 matrix STT 85 / BANG_TONG_HOP STT 85

## MISSION
1) Implement or neo clone-catalog API+service for XBOS-DM-09 (ADD/FIX — không REPLACE unrelated catalog).
2) spec_read_ack: srs_old STT85 + tech_spec §8.1 + api_design path; code_memory_required.
3) Unit/regression on xbos-api catalog path; update by-uc XBOS-DM-09 § code_readiness → LIKELY_PARTIAL or LIKELY_IMPL (honest).
4) READY_FOR_QA — cấm seed · cấm claim UAT.

## PARALLEL (same session if quota)
- PO-UC-TC-W3-BE-LOG09 → dev-be: XBOS-DM-LOG-09 twin after/with DM-09 pattern (TECHSPEC_M03 §2)
- PO-UC-TC-W3-BA-HRM27 → ba-process: confirm UC-HRM-27 backlog ship vs defer before dev-fe

## CẤM
seed · invent Leave L2 PASS · browser UAT claim · apps outside allowed_paths

## EXIT
evidence_path: docs/qa/evidence/po-uc-tc-w3-be-dm09.md
next: qa retest U65 TC pack XBOS-DM-09 only (no full 3334)
```

**Suggested Task #2 (same PM turn if parallel OK):**

```text
work_item_id: PO-UC-TC-W3-QA-DM09
… after READY_FOR_QA from BE …
to_role: qa
entry: browser-only U65 · login → menu catalog → clone flow per by-uc XBOS-DM-09 HP/FD
exit: FE after 2xx + F5 · matrix note design→execution · cấm seed
```

---

## 7. Handoff fields

| Field | Value |
|-------|--------|
| completion_report | §4 |
| next_owner | pm |
| next_dispatch_prompt | §6 |
| evidence_path | `docs/qa/evidence/po-uc-tc-w2-synth-01.md` |
| ack_status | **PASS_TO_PM** |
| master_path | `docs/qa/professional/by-uc/MASTER_COVERAGE_REPORT.md` |

---

*PO-UC-TC-W2-SYNTH-01 · ba-process*
