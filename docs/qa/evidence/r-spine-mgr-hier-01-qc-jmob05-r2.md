# Evidence — R-SPINE-MGR-HIER-01-QC-JMOB05-R2

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-MGR-HIER-01-QC-JMOB05-R2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **lane** | L3 gate — **J-MOB-05 Option A R2** (device manager Duyệt leave) |
| **priority** | P1 |
| **api_base** | `http://10.0.2.2:28001` (emulator) · host `http://127.0.0.1:28001` |
| **device** | `emulator-5554` · `vn.xevn.hrm.mobile` 1.0.0 |
| **APK SHA256** | `AB93DA36B9B44776764268F994873FFB2E77A1E1F2B9C1701610C5A65433F5AB` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `r-spine-mgr-hier-01-qa-device-jmob05-r2.md` PASS_TO_PM · U78 md+json · PERSONA-LOCK BE |
| **spec_ref** | FR-UC-H03 · J-MOB-05 · BR-MOB-MGR-REPORTS-01 · Option A |
| **U65** | zero-seed · not `ceo@xe.vn` L1 · no Option C · QC observe-only |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY · leave L2 ladder · AT-01 reopen |

---

## Verdict summary

**GO WITH CONDITIONS** — Narrow L3 on **J-MOB-05 Option A R2** after qa-device PASS. Independent audit confirms R1 root (`personaLocksEmployee` → Thông báo-only) **CLOSED** via PERSONA-LOCK: `uat.nv0001` mounts **ManagerApprovals** via home tile **«Duyệt»**; Duyệt leave `ac9db485` (UAT-0003 → HLD-0001) → FE «Đã duyệt đơn nghỉ phép» → F5 UI **Nghỉ phép (2→1)** → API mgr pending clears submitter id (`apiCleared=true`, `knownPending=false`, `fromSub=[]`). U78 pair **xevn-test-log/v1** aligned with `_finish.json`. U65 honored (reused prior FE unpaid leave, no seed). **Does not** promote full mobile UAT or Phase 1.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `r-spine-mgr-hier-01-persona-lock.md` | READY_FOR_QA · BE unlock direct reports | **ACCEPT** — closes R1 JWT gap |
| `r-spine-mgr-hier-01-qa-device-jmob05.md` | FAIL_TO_PM · Thông báo-only | **ACCEPT prior FAIL** — superseded R2 |
| `r-spine-mgr-hier-01-qa-device-jmob05-r2.md` | PASS_TO_PM · AC1–7 | **ACCEPT** product narrative |
| `…-r2-test-log.md` | 9 chrono steps · U78 | **ACCEPT** |
| `…-r2-test-log.json` | `xevn-test-log/v1` · persona/leave block | **ACCEPT** |
| `screens/…-jmob05-r2/_finish.json` | API before/after · `verdict: PASS` | **ACCEPT** (authoritative approve) |
| `screens/…-jmob05-r2/_preflight.json` | `is_manager=true` · hierarchy · ac9db485 alive | **ACCEPT** |
| AT-01 nav QC GWC | not reopened | **HONORED** |

---

## Mission audit (PM narrow scope)

### 1 — ManagerApprovals mount (`uat.nv0001`, not Thông báo-only)

| Check | Result |
|-------|--------|
| Login roles | `employee,manager` · `home_is_manager=true` (`_preflight.json`) |
| Home tile | **«Duyệt»** / `home-action-tile-approve` (`f11-home.png`, `30-mgr-home.png`) |
| Screen mount | `_finish.json` `mounted: true` · sample includes **Phê duyệt**, **Nghỉ phép (2)**, UAT NV 0003/0020 rows |
| vs R1 | R1 tile **«Việc»** → Thông báo only — **CLOSED** |

**PASS**

### 2 — Duyệt leave `ac9db485` · toast + F5/API clear

| Check | Result |
|-------|--------|
| Confirm dialog | «Duyệt đơn?» + button **Duyệt** (`f40-confirm.png`, finish steps) |
| FE after 2xx | «Đã duyệt đơn nghỉ phép» · counts Tất cả/Nghỉ phép **(2→1)** (`f50-after-confirm.png`) |
| F5 | UAT NV 0003 gone · `uat0003Still: false` (`f60-f5.png`) |
| API | before `total=2` + `fromSub=[ac9db485]` → after `total=1` · `knownPending=false` · `apiCleared=true` |

**PASS**

### 3 — U65 · not ceo L1 · U78 pair

| Check | Result |
|-------|--------|
| Seed | `u65_zero_seed: true` · reused FE submit leave · no Option C |
| Persona | approver `uat.nv0001@xe.vn` · submitter `uat.nv0003@xe.vn` · `ceo_as_l1: false` (JSON) |
| Holding UUID | `10000000-0000-4000-8000-000000000001` ≠ `main` |
| U78 | md+json same log_id · chrono steps 1–9 · verdict pass |

**PASS**

### 4 — Boundaries (cấm)

| Rule | QC |
|------|-----|
| Claim UAT DONE | **not claimed** |
| Invent leave L2 ladder | **not reopened** (LV-02 HOLD elsewhere) |
| Reopen AT-01 | **not touched** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | In-scope for this gate | QC |
|---------|------------------------|-----|
| **J-MOB-05** Manager approvals → Duyệt (Option A) | **Yes** — sole mandatory journey | **PASS** (device R2 + finish API) |
| J-MOB-* other | Out of R2 slice | not evaluated |
| Portal leave ladder / LV-02 | HOLD program | **not reopened** |

Mandatory **J-MOB-05** for this slice: **PASS**. QA did not claim only L0/L1 — full click path + F5 + API.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | ManagerApprovals mount **PASS** · Duyệt ac9db485 **PASS** · R1 persona lock **CLOSED** |
| **PROCESS** | QA R2 MD `verify:qc:evidence-pack` **3/8** (command_table, portal_url/api_base, residual heading) — **process-only**; product PASS independent |
| **ENV** | Local `:28001` — preflight 200; not re-probed at QC (QA recorded) |

ENV does not drive NO-GO. Process gaps on QA entry MD do **not** demote J-MOB-05 R2 close.

---

## Residual

| Id | Status | Sev | Owner | Blocks J-MOB-05 R2 GWC? |
|----|--------|-----|-------|-------------------------|
| **R1 personaLocksEmployee / Thông báo-only** | **CLOSED** | — | — | No |
| **UAT NV 0020 leave pending** | OPEN OOS | P3 | — | No — other report; not submitter AC |
| **INC-JMOB05-R2-CONFIRM-MISS** | CLOSED in finish wave | P3 | qa-device harness | No — `_finish.json` + API assert |
| **Leave balance 0/0 annual** | OPEN | P2 | data / prior wave | No — unpaid path used |
| **Leave L2 ladder / LV-02** | **HOLD** | — | program | No — cấm invent on this gate |
| **AT-01 nav** | **CLOSED GWC** | — | — | No — not reopened |
| **C-JMOB05-QA-PACK-FMT-R2** | OPEN process | P3 | qa-device | No — next device MD 8/8 |

---

## Conditions (explicit)

1. **J-MOB-05 Option A R2 slice only** — does not promote full mobile matrix or Phase 1.
2. **NOT product UAT DONE · NOT Phase 1 DONE · NOT PROD-READY** from this GWC.
3. **Leave L2 ladder** remains program HOLD — do not treat this unpaid L1 Duyệt as ladder sign-off.
4. **AT-01** — do not reopen unless regression on nav evidence.
5. **UAT-0020** pending leave — out of scope; no dispatch to “clear all mgr queue” from this gate.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05-r2.md
→ FAIL exit 1 · 3/8 (command_table, portal_url, residual_section)
```

**PROCESS note** — substantive device + U78 + `_finish.json` sufficient for product adjudication.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-mgr-hier-01-qc-jmob05-r2.md
→ target EXIT 0 (8/8)
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-mgr-hier-01-qa-device-jmob05-r2.md` | **FAIL** exit **1** · **3/8** (process) |
| Disk read `…-jmob05-r2-test-log.json` | **PASS** · `schema: xevn-test-log/v1` · `verdict: pass` · leave id ac9db485 |
| Disk read `screens/…/_finish.json` | **PASS** · `apiCleared: true` · `successUi: true` · `verdict: PASS` |
| Disk read `screens/…/_preflight.json` | **PASS** · `is_manager: true` · `hierarchy_ok: true` |
| Visual spot PNG `f20-approvals.png`, `f50-after-confirm.png`, `f60-f5.png` | **PASS** · paths under `docs/qa/evidence/screens/r-spine-mgr-hier-01-qa-device-jmob05-r2/` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-mgr-hier-01-qc-jmob05-r2.md` | **PASS** exit **0** (8/8) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | Intent | Result | Evidence |
|----------------|--------|--------|----------|
| **A** fail_deep | R1 emp lock → Thông báo | **CLOSED** | PERSONA-LOCK + R2 preflight roles |
| **B** success_hdsd | Duyệt tile → confirm → F5 | **PASS** | `_finish.json` · f50/f60 PNG |
| **C** logic_br | L1 direct manager · U65 · holding UUID | **PASS** | persona table · `_preflight.json` |
| **J-MOB-05** L2.5 | ManagerApprovals Duyệt leave | **PASS** | QA R2 click path + API clear |

---

## Forbidden compliance (QC)

- No seed · no DB fake · no ceo L1
- No rewrite `apps/**`
- Did not claim UAT DONE / Phase 1 DONE
- Did not reopen leave L2 ladder or AT-01
- Did not demote R1 FAIL fix without finish-wave API proof

---

## completion_report

**Closed (bounded):** L3 **GO WITH CONDITIONS** for **R-SPINE-MGR-HIER-01 J-MOB-05 Option A R2** — ManagerApprovals mount + Duyệt `ac9db485` with FE success, F5, and API queue clear; R1 persona-lock FAIL **CLOSED**; U65/U76/U78 credible; AT-01 and leave ladder **not reopened**.

**Open (non-blocking):** QA entry pack 3/8 process; UAT-0020 pending OOS; leave balance P2; harness confirm-tap lesson P3.

## next_owner

`pm` — update bus/matrix for J-MOB-05 R2 slice; optional next wave per program backlog (not leave ladder unless sponsor unlock).

## next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-PM-CLOSE-R2
from_role: pm
to_role: pm
lane: governance
priority: P2
entry: qc PASS_TO_PM docs/qa/evidence/r-spine-mgr-hier-01-qc-jmob05-r2.md — GWC J-MOB-05 Option A R2 CLOSED
actions: ghi bus J-MOB-05 R2 promoted bounded; cấm claim UAT DONE; do not dispatch leave L2 ladder or AT-01 reopen
residual: C-JMOB05-QA-PACK-FMT-R2 P3 optional qa-device template fix
evidence_path: docs/program/AGENT_MESSAGE_BUS.md (append)
```

## ack_status

**PASS_TO_PM**
