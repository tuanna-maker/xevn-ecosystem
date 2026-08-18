# Evidence — PO-UC-TC-W4-QA-E5-MOB-QC

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E5-MOB-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — mobile P0 emulator smoke (UC-HRM-MOB-01/02/04/06) |
| **priority** | P1 |
| **api_base** | host L0 `http://127.0.0.1:28001` · APK UI `http://14.225.217.232:3001` |
| **device** | `emulator-5554` · AVD `xevn_api34` · API 34 · **physical: none** |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` · SHA256 `AB93DA36B9B44776764268F994873FFB2E77A1E1F2B9C1701610C5A65433F5AB` |
| **persona** | `uat.nv0003@xe.vn` / `xevn-uat-2026` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-rollup.md` · qa-device `PASS_TO_PM` |
| **spec_ref** | UC-HRM-MOB-01/02/04/06 · J-MOB-01 · J-MOB-02 · leave create L1 adjacent |
| **U65** | zero-seed · QC observe-only · no `pnpm seed:*` · no DB fake · no invent Leave L2 |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY · invent Leave L2 PASS · reopen CREATE-CATALOG / AT-12 L1 |

---

## Verdict summary

**GO WITH CONDITIONS** — Bounded L3 on **mobile P0 emulator smoke** for UC-HRM-MOB-01/02/04/06 after qa-device rollup `PASS_TO_PM`. Independent audit confirms: device honesty (**emulator-5554 OK · physical none**); login HP+FD (`HRM-AUTH-401`); single-membership home; check-in toast **`HRM-ATT-201`**; ATT update-request toast **`HRM-ATT-REQ-201`**; leave list + 4-step wizard **PARTIAL** (open, no submit; balance 0 / BR-LEAVE-BAL-02); Leave L2 kept **SPEC_GAP**. U65 honored. **Does not** promote UAT DONE / Phase 1 DONE. CREATE-CATALOG and AT-12 L1 approve remain **CLOSED elsewhere** — not reopened.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-uc-tc-w4-qa-e5-mob-rollup.md` | PASS_TO_PM · P0 smoke · leave submit PARTIAL · L2 SPEC_GAP · not UAT DONE | **ACCEPT** |
| `po-uc-tc-w4-qa-e5-mob-device-log.json` (+ `-r2` `-r3` `-r3c` `-leave`) | serial `emulator-5554` · multi-pass supersession | **ACCEPT** (rollup = final SoT; early FAIL nav superseded by r3/r3c) |
| Screens under `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/` | 49 PNG + XML dumps | **ACCEPT** (spot visual below) |
| by-uc `UC-HRM-MOB-01/04` execution PASS · `02/06` PARTIAL · **`uat_done: false`** | aligned with rollup | **ACCEPT** |
| AT-12 L1 / CREATE-CATALOG QC GWC | CLOSED elsewhere | **HONORED — not reopened** |

---

## Mission audit

### 1 — Device evidence honesty (emulator OK; physical none)

| Check | Result |
|-------|--------|
| Serial / AVD | `emulator-5554` · `xevn_api34` in rollup + `device-log.json` start |
| Physical | Rollup: **none attached — used emulator (honest)** |
| APK install | claimed `adb install -r` Success · package `vn.xevn.hrm.mobile` 1.0.0 |
| Screens | PNG on disk under `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/` (not API-only claim) |

**PASS** — honesty OK. Emulator-only is a **condition**, not a product NO-GO for this P0 smoke slice.

### 2 — P0 smoke product claims (visual + log)

| UC / TC | Claim | QC spot | Result |
|---------|-------|---------|--------|
| MOB-01 LOGIN-FD | `HRM-AUTH-401` | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/01-fd-after.png` — Lỗi modal + code | **PASS** |
| MOB-01 LOGIN-HP | Home UAT NV 0003 · Tập đoàn X.E | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/01-home.png` / r2-home background | **PASS** |
| MOB-02 SINGLE | mems=1 · UUID ≠ `main` | device-log uuid `10000000-…0001` | **PASS** (multi-CT **N/A**) |
| MOB-04 CHECKIN | Thành công / **HRM-ATT-201** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r2-home.png` dialog | **PASS** |
| MOB-04 GPS optional | no location permission path | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r2-04-checkin.png` + log message | **PASS** (optional) |
| MOB-06 ATT create | Thành công / **HRM-ATT-REQ-201** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3c-att-fd.png` · form `adjust_check_in` | **PASS** |
| MOB-06 LV nav | Nghỉ phép của tôi | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3-06-leave.png` (log detail) | **PASS** |
| MOB-06 LV create | wizard open · **no submit** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3-06-wizard-final.png` · balance 0 · BR-LEAVE-BAL-02 | **PARTIAL** (honest) |
| MOB-06 L2 SG | SPEC_GAP | rollup + logs · no invent PASS | **SPEC_GAP HOLD** |

**Note (process, non-blocking):** `device-log-r3c.json` labels ATT-CREATE `PARTIAL` / VAL-FD `FAIL` while detail + PNG show **HRM-ATT-REQ-201** success — **PNG + detail string = product SoT**; rollup PASS for ATT create accepted. Empty FAB capture OBS (`docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3c-fab.png` 0 bytes) — FAB covered by log text + other screens.

### 3 — No invent Leave L2 · U65 no seed

| Rule | QC |
|------|-----|
| Leave L2 PASS invented? | **No** — SPEC_GAP on SG-001/002 · hdsd row ⚪ |
| Leave submit claimed PASS? | **No** — PARTIAL · residual `R-E5-MOB-LEAVE-SUBMIT` |
| Seed / DB fake / API inbox seed? | **No** — `u65_zero_seed: true` · UI login + FE mutate only |
| CREATE-CATALOG / AT-12 L1 reopen? | **No** — out of seat · CLOSED elsewhere |
| UAT DONE / Phase 1 DONE? | **Not claimed** · by-uc `uat_done: false` |

**PASS**

### 4 — Gate scope (mobile P0 smoke only)

Bounded **GO WITH CONDITIONS** for this seat only. **NOT** Phase 1 DONE · **NOT** product UAT DONE · **NOT** full mobile matrix closure.

---

## L2.5 J-* audit (U19)

| Journey | In-scope this gate | QC |
|---------|--------------------|-----|
| **J-MOB-01** Login → home / scope | Yes — P0 | **PASS** (emulator) |
| **J-MOB-02** Check-in (GPS optional OK) | Yes — P0 | **PASS** (emulator; coords optional) |
| Leave create L1 (J-MOB-23/25 adjacent) | Adjacent only | **PARTIAL** — wizard open; submit deferred |
| Leave L2 ladder | Mandatory not claimed | **SPEC_GAP** — not invent PASS |
| J-MOB-05 manager Duyệt | Out of seat | not evaluated (CLOSED elsewhere) |
| Physical-device journeys | Out of seat | **deferred** — no physical attached |

Mandatory for this **emulator P0 smoke** slice: J-MOB-01 + J-MOB-02 **PASS**. Leave submit / physical remain conditions.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Login HP/FD · single-CT home · check-in `HRM-ATT-201` · ATT create `HRM-ATT-REQ-201` · leave nav PASS · leave submit PARTIAL · L2 SPEC_GAP HOLD |
| **PROCESS** | Intermediate log label noise (r3c VAL-FD); empty FAB PNG OBS; mojibake «Số dư phép» on wizard P3 UX |
| **ENV** | Emulator-only (no physical) — **condition**; L0 `:28001` 200 recorded by QA; APK pilot base `:3001` |

ENV / physical-absent does **not** drive product NO-GO for this declared emulator smoke. Process noise does not demote PNG-proven mutates.

---

## Residual

| Id | Status | Sev | Owner | Blocks E5-MOB GWC? |
|----|--------|-----|-------|---------------------|
| **R-E5-MOB-LEAVE-SUBMIT** | OPEN | P2 | qa-device / optional | No — CONDITION (balance>0 persona · U65 FE) |
| **R-E5-MOB-MULTI-CT** | OPEN N/A | P2 | qa-device | No — needs multi-mem persona |
| **R-E5-MOB-ATT-FD-EMPTY** | OPEN | P2 | ba / product | No — defaults prevent empty FD |
| **R-E5-MOB-L2** | SPEC_GAP HOLD | — | program | No — cấm invent |
| **R-E5-MOB-PHYSICAL** | DEFERRED | P2 | qa-device | No — honesty condition |
| **OBS-R3C-FAB-PNG-0B** (`docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3c-fab.png` 0 bytes) | OPEN process | P3 | qa-device | No |
| **OBS-LEAVE-BAL-MOJIBAKE** | OPEN UX | P3 | dev-mobile | No — encoding on balance title |
| CREATE-CATALOG / AT-12 L1 | **CLOSED** elsewhere | — | — | No — not reopened |

---

## Conditions (explicit)

1. **Mobile P0 emulator smoke slice only** (UC-HRM-MOB-01/02/04/06) — not full mobile UAT.
2. **NOT product UAT DONE · NOT Phase 1 DONE · NOT PROD-READY** from this GWC.
3. **Physical device** not exercised — residual `R-E5-MOB-PHYSICAL`.
4. **Leave submit** remains PARTIAL — do not promote LV create HP to PASS.
5. **Leave L2** remains SPEC_GAP HOLD — do not invent PASS.
6. **CREATE-CATALOG / AT-12 L1 approve** — CLOSED elsewhere; **do not reopen**.
7. Multi-CT confirm N/A on `uat.nv0003` (1 membership).

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-rollup.md
→ PASS exit 0 · 8/8
```

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-qc.md
→ target EXIT 0 (8/8)
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-rollup.md` | **PASS** exit **0** · **8/8** |
| Disk read device logs (`…-device-log.json` · `-r2` · `-r3` · `-r3c` · `-leave`) | **PASS** · serial `emulator-5554` · L2 SPEC_GAP · ATT-REQ-201 in r3c detail |
| Visual spot PNG | **PASS** · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/01-fd-after.png` · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r2-home.png` · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3c-att-fd.png` · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3-06-wizard-final.png` |
| by-uc `UC-HRM-MOB-01` / `04` / `06` meta | **PASS** · `uat_done: false` · L2 SPEC_GAP wording |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-qc.md` | **PASS** exit **0** (8/8) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | Intent | Result | Evidence |
|----------------|--------|--------|----------|
| **A** fail_deep | Login bad password | **PASS** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/01-fd-after.png` · HRM-AUTH-401 |
| **B** success_hdsd | Login → home → check-in → ATT create | **PASS** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r2-home.png` HRM-ATT-201 · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3c-att-fd.png` HRM-ATT-REQ-201 |
| **C** leave / L2 | Wizard L1 · L2 inventory | **PARTIAL** / **SPEC_GAP** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e5-mob/r3-06-wizard-final.png` · no invent L2 |
| **J-MOB-01** L2.5 | Login → home | **PASS** | device UI + logs |
| **J-MOB-02** L2.5 | Check-in GPS optional | **PASS** | toast + GPS message path |

---

## Forbidden compliance (QC)

- No seed · no DB fake · no invent Leave L2 PASS
- No rewrite `apps/**`
- Did not claim UAT DONE / Phase 1 DONE
- Did not reopen CREATE-CATALOG / AT-12 L1 approve
- Did not treat leave submit PARTIAL as PASS

---

## completion_report

**Closed (bounded):** L3 **GO WITH CONDITIONS** for **PO-UC-TC-W4-QA-E5-MOB** emulator P0 smoke — honesty (emulator OK / physical none); MOB-01/02/04 P0 PASS; MOB-06 ATT create PASS + leave wizard PARTIAL + L2 SPEC_GAP HOLD; U65 honored; CREATE-CATALOG / AT-12 not reopened.

**Open (non-blocking CONDITIONS):** leave submit P2 · multi-CT N/A · physical deferred · L2 SPEC_GAP · OBS empty FAB PNG / mojibake P3.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E5-MOB-PM-INTAKE
from_role: pm
to_role: pm
lane: governance
priority: P1
entry_criteria: qc PASS_TO_PM docs/qa/evidence/po-uc-tc-w4-qa-e5-mob-qc.md — GWC mobile P0 emulator smoke
actions: |
  1) Ghi bus INTAKE + promote bounded E5-MOB GWC (emulator); cấm claim UAT DONE / Phase 1 DONE
  2) Keep Leave L2 SPEC_GAP; do not reopen CREATE-CATALOG / AT-12 L1
  3) Optional residual only if program wants: R-E5-MOB-LEAVE-SUBMIT (balance>0 persona, U65 FE) or R-E5-MOB-PHYSICAL
exit_criteria: bus updated; next W4 wave from backlog without inventing L2
cấm: seed · invent Leave L2 PASS · reopen AT-12 / CREATE-CATALOG
evidence_path: docs/program/AGENT_MESSAGE_BUS.md (append)
```

## ack_status

**PASS_TO_PM**
