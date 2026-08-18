# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-4) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-06a` |
| **depends_on** | BE-01 READY_FOR_QA · FE-01 READY_FOR_QA |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser-primary · **no** `pnpm seed:*` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE** · DENY module REC UAT |
| **stamp** | `REC06AQA-MSKYROLW` (+ L1 post-rebuild seal) |
| **ack_status** | **FAIL_TO_PM** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| API-01 | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md` F-REC-IV-01..04 · §4–5 errors · R-A PATCH |
| BA-01 | AC-REC-IV-01..07 · R01–R07 · J-HRM-REC-IV-01..07 · Diễn biến FE #3–#8 |
| BE-01 | `po-hrm-mvp-gd1-rec-06a-cluster-be-01.md` READY_FOR_QA |
| FE-01 | `po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md` READY_FOR_QA · residual **R-FE-IV-ID-PROJ** |

---

## L0 stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** (exit noise OBS UV_HANDLE) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| FE vitest corroboration | **27/27 PASS** (Schedule + CandidatesTab + candidateActiveInterview + apiError IV) |

### Runtime seal (QA found stale LIVE)

| Probe (before rebuild) | Observed |
|------------------------|----------|
| `PATCH /recruitment/interviews/:id` | **404** `Cannot PATCH …` (route absent) |
| `PATCH …/status` `no_show` | **400** `HRM-VAL-001` — enum **without** `no_show` |

→ LIVE `:28001` **stale** vs BE-01 source. QA **rebuild + restart** `hrm-api` dist, then L1 re-probe.

| Probe (after rebuild) | Observed |
|-----------------------|----------|
| POST create | **201** `HRM-REC-203` |
| `PATCH …/:id` R-A | **200** `HRM-REC-204` · **same id** |
| `PATCH …/status` `no_show` | **200** `HRM-REC-204` |
| POST past (CFG block) | **400** `HRM-REC-IV-400-PAST-DATETIME` |
| R-A on TERMINAL | **400** `HRM-REC-IV-400-INVALID-TRANSITION` |
| POST round-2 after `no_show` | **201** `HRM-REC-203` |
| List `active_interview.active_interview_id` | **null / omitted** (SQL selects id; mapper drops) |

---

## Browser U65 — J-HRM-REC-IV-*

**Harness:** `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-06a-cluster-qa-01.mjs`  
**Machine log:** `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-06a-cluster-qa-01.json`  
**Screenshots:** `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-01/01–08`  
**URL:** `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates`  
**Click path:** Login CEO → Tuyển dụng → Ứng viên → Tất cả → row **Tuấn** (`tuanna@unicomhub.com`)

### UF blocks

### UF / J-HRM-REC-IV-01 — Create + badge F5 (RETAIN)

- Persona / URL / click: as above · calendar schedule when 0 ACTIVE (prior GWC + list badge)
- Network: Lane A `/api/hrm/recruitment/interviews*` only (O1) — harness `O1-path-lane-a` **PASS**
- **FE sau 2xx:** badge «Đã có lịch» + `dd/MM/yyyy HH:mm` visible
- F5: badge persists (RETAIN GWC)
- Verdict: 🟢 **PASS RETAIN**

### UF / J-HRM-REC-IV-02 — 409 ACTIVE (RETAIN)

- When ACTIVE: calendar opens **Manage** (FE gate) instead of second create — AC-02 UX gate
- L1 duplicate POST → **409** `HRM-REC-IV-409-ACTIVE` + `details.active_interview_id`
- Soft-gate ≠ 409 RETAIN (FE toast map distinct · AC-07)
- Verdict: 🟢 **PASS RETAIN**

### UF / J-HRM-REC-IV-03 — Cancel → round 2

- Click badge / manage → dialog `manage-active-interview-dialog` opens
- **`manage-interview-id-missing` visible** · action buttons **disabled** (`!interviewId`)
- **No** `PATCH …/status` cancel in Network · badge **not** cleared · no round-2 POST from FE
- Verdict: 🔴 **FAIL** — blocked by missing `active_interview_id` projection

### UF / J-HRM-REC-IV-04 — no_show → round 2

- Same manage dialog · missing id · **Không đến** disabled
- L1 after rebuild proves TERMINAL `no_show` + round-2 create — **not** browser UF
- Verdict: 🔴 **FAIL** (browser)

### UF / J-HRM-REC-IV-05 — R-A Đổi lịch

- Manage open without id · **Đổi lịch** disabled · **0** `PATCH …/:id` from browser
- L1 after rebuild: R-A **200** same id — API OK, FE path blocked
- Verdict: 🔴 **FAIL** (browser)

### UF / J-HRM-REC-IV-06 — Open ACTIVE manage (projection or 409)

- Dialog opens on badge/manage click (**not** schedule SoT) — shell OK
- **FAIL:** no usable ACTIVE id from projection; **409 handoff unreachable** when ACTIVE because calendar routes to Manage (not Schedule submit)
- Verdict: 🔴 **FAIL**

### UF / J-HRM-REC-IV-07 — Soft-gate ≠ 409

- RETAIN prior GWC + FE `apiError` distinct copy (unit 4/4)
- Opportunistic browser stage-deny not exercised (row ACTIVE)
- Verdict: 🟢 **PASS RETAIN** (≠ claim STAGE browser mutate)

---

## Journey / AC matrix

| ID | Verdict | Note |
|----|---------|------|
| J-HRM-REC-IV-01 | 🟢 PASS | RETAIN create/badge |
| J-HRM-REC-IV-02 | 🟢 PASS | RETAIN 409 / FE gate |
| J-HRM-REC-IV-03 | 🔴 FAIL | P0 projection id |
| J-HRM-REC-IV-04 | 🔴 FAIL | P0 projection id |
| J-HRM-REC-IV-05 | 🔴 FAIL | P0 projection id |
| J-HRM-REC-IV-06 | 🔴 FAIL | id missing · 409 handoff blocked |
| J-HRM-REC-IV-07 | 🟢 PASS_RETAIN | soft-gate ≠ 409 |
| AC-REC-IV-R01 cancel optional | 🔴 FAIL | no browser PATCH |
| ERR 409 ACTIVE | 🟢 PASS | L1 + RETAIN |
| ERR PAST-DATETIME | 🟢 PASS | L1 after rebuild |
| ERR INVALID-TRANSITION | 🟢 PASS | L1 R-A on TERMINAL |
| ERR CANCEL-REASON | ⬜ N/A | CFG default optional (O6) |
| ERR STAGE-DISALLOW | 🟢 RETAIN | ≠ 409 · unit/FE map |
| Honesty / C-SLICE | 🟢 | **no** flip `recruitment_uat_ready` |
| Nest `/rec` dual / Lane B SoT / seed | 🟢 DENY held | |

---

## Root cause (P0)

### R-REC-IV-PROJ-ID (elevate prior R-FE-IV-ID-PROJ)

| Layer | Fact |
|-------|------|
| SQL list | `ai.id AS active_interview_id` selected |
| `toActiveInterviewProjection` | **Omits** `active_interview_id` in nested object |
| List response map | Does **not** spread flat `active_interview_id` |
| FE `getActiveInterviewId` | Returns null → Manage buttons disabled |
| FE 409 handoff | Requires Schedule submit while ACTIVE — calendar now opens Manage → handoff **dead** |

**Impact:** Browser residual cancel / complete / `no_show` / R-A **cannot** emit PATCH from FE.

### OBS — stale dist at entry

BE-01 claimed READY but LIVE lacked R-A route + `no_show` enum until QA rebuild/restart. **Must** content-seal restart before QA browser residual.

---

## Residual (dispatch)

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| **R-REC-IV-PROJ-ID** | **P0** | **dev-be** | Embed `active_interview_id` in `toActiveInterviewProjection` (+ flat if needed); list/get parity; jest assert nested id when ACTIVE |
| R-REC-IV-STALE-DIST | P1 process | devops / BE handoff | Restart/rebuild before READY_FOR_QA residual browser |
| R-FE-IV-409-HANDOFF | P2 | dev-fe (optional) | If projection fixed, handoff optional; else keep schedule path when id missing |
| CANCEL-REASON CFG | P3 | QA later | Only when tenant CFG `interview_cancel_reason_required=true` |
| Honesty / module UAT | — | QC | **DENY** flip · C-SLICE |

---

## Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
prior IV create/409/badge GWC RETAIN ≠ module UAT
U65 zero-seed
REC-03 OUT · Lane B ≠ SoT · Nest /rec dual DENY
L1 API residual OK after rebuild ≠ browser UF PASS
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-01.md` |
| **next_owner** | **dev-be** |
| **completion_report** | Browser L2.5 residual UC-BP-REC-06a **FAIL**: Manage dialog opens without `active_interview_id` (projection omit) → cancel/complete/no_show/R-A PATCH never fire from FE; 409 handoff unreachable when ACTIVE. RETAIN J-01/02/07. After QA rebuild, L1 proves R-A/`no_show`/PAST/INVALID codes. Honesty false · U65 · C-SLICE. |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-02
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: QA-01 FAIL R-REC-IV-PROJ-ID
entry_criteria: API-01 F-REC-IV-04 · BA AC-06 · QA evidence po-hrm-mvp-gd1-rec-06a-cluster-qa-01.md
MISSION: Fix list/get candidates display-ready projection — include active_interview_id in toActiveInterviewProjection (and response flat if required) so FE ManageActiveInterviewDialog can PATCH status/R-A without inventing id. Jest assert nested id when ACTIVE. Rebuild+restart hrm-api before READY_FOR_QA. DENY Nest /rec dual · Lane B SoT · seed · honesty flip.
exit_criteria: GET candidates ACTIVE row has active_interview.active_interview_id UUID; jest green; READY_FOR_QA → re-dispatch QA-02 browser J-HRM-REC-IV-03..06
evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-be-02.md
```
