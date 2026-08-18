# Evidence — `PO-UC-TC-W4-QC-B3-HRM-NT-R4`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QC-B3-HRM-NT-R4` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — W4-B3 HRM-NT-01 mark-read R4 after FE company UUID fix |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` · route `/hr/notifications?portal=1&companyId=trsport` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-b3-hrm-nt-r4.md`](po-uc-tc-w4-qa-b3-hrm-nt-r4.md) PASS_TO_PM · FE [`po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md`](po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md) · prior FAIL [`po-uc-tc-w4-qa-b3-hrm-nt-r3.md`](po-uc-tc-w4-qa-b3-hrm-nt-r3.md) |
| **spec_ref** | UC-HRM-12 · `HRM-NT-01.md` §9–§10 · AC-NT01-MARK-01 / LIST-01 / CEO-01 / U65-01 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · no invent NT-02 FCM / Leave L2 |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · `uat_done` remains **false** on HRM-NT-01 |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded **W4-B3 HRM-NT-01 mark-read R4** only: browser personal mark **PATCH 200 `HRM-NOTIF-202`** with query `company_id` **UUID** (not slug `trsport`); broadcast NULL mark CTA **hidden**; GET inbox **200** `HRM-NOTIF-200` + list visible (scope-proxy path); `ceo@` **EXPECTED_NO_INBOX** PASS; L0 + fe-be-health PASS; U65 no seed. Residuals **`R-W4-B3-NT01-MARK-COMPANY-UUID`** + **`R-W4-B3-NT01-MARK-BROADCAST-CTA` CLOSED** (supersede R3 FAIL). **Network JSON is SoT** over PNG label noise. **NOT** Phase 1 / UAT DONE. **NT-02 mobile FCM** remains separate — does **not** NO-GO this NT-01 seat.

**Conditions:** QA entry pack format gap (journey_l25); console 401 OBS during persona switch; no dedicated `J-HRM-NT-*` row in journey map (in-seat L2.5 path PASS this gate); `uat_done` false.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-uc-tc-w4-qa-b3-hrm-nt-r4.md` | PASS_TO_PM · AC-NT01-MARK-01 / LIST-01 PASS · UUID PATCH · broadcast CTA hidden · ceo EXPECTED_NO_INBOX · uat_done false | **ACCEPT** product narrative |
| `po-uc-tc-w4-fe-nt01-mark-company-uuid-01.md` | READY_FOR_QA · Option A FE UUID resolve + hide broadcast CTA · vitest 5/5 · no BE | **ACCEPT** root cause + must_keep |
| `_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r4-browser.json` | PATCH UUID + GET 200 + broadcastCtaHidden · uc PASS · 5 PNG paths | **ACCEPT** Network SoT |
| Prior FAIL `po-uc-tc-w4-qa-b3-hrm-nt-r3.md` | PATCH slug → 400 `HRM-VAL-001` | **SUPERSEDED** by R4 |
| by-uc `HRM-NT-01.md` §9–§10 | execution **PASS (R4)** · **uat_done false** · BA CEO Option A | **ACCEPT** honesty stamp |

---

## Browser / JSON honesty audit

| Check | QA claim | Runtime JSON / disk | QC |
|-------|----------|---------------------|-----|
| GET inbox list | 200 `HRM-NOTIF-200` + list visible | `getInboxCalls[]` status 200 · `company_id=trsport` + `employee_id=b06422c0-…` · `listVisible: true` | **PASS** |
| Personal mark PATCH | 200 `HRM-NOTIF-202` + UUID query | PATCH url `…/958f0121-…/read?company_id=10000000-0000-4000-8000-000000000002` · `code: HRM-NOTIF-202` · `patchUsesUuid: true` · `patchUsesSlug: false` | **PASS** |
| Broadcast CTA | hidden | `broadcastCtaHidden: true` · `broadcastCtaObs: PASS_NO_CTA_ON_BROADCAST` · `markButtonCountTestId: 13` (= personal unread) | **PASS** |
| FE after 2xx + F5 | marked row unread CTA gone | `markedRowGoneUnread: true` · `feReadAfterF5: true` · toast PNG 03 | **PASS** |
| ceo@ EXPECTED_NO_INBOX | honest empty / requires-employee | `NT01-CEO-SPOT.expectedNoInbox: true` · bodySnippet requires-employee · PNG 05 | **PASS** |
| U65 | no seed | `u65: zero-seed` · fanoutNote prior FE | **PASS** |
| Console | — | one `401 Unauthorized` resource | **OBS / PROCESS** — not product demote (mutate path 200/202) |
| PNG assets | 5 screens | 01–05 exist · sizes 26–262 KB; spot 02 list+CTA · 03 toast mark · 05 CEO | **PASS** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seat | QC |
|---------|-------------------|-----|
| **In-seat L2.5** `/hr/notifications` → personal mark → FE 2xx → F5 | **In-scope** P0 browser | **PASS** — Network PATCH `HRM-NOTIF-202` UUID + F5 GET 200 |
| **J-HRM-01..08** / MENU-SWEEP | Host embed context only | **not re-closed** this seat |
| Dedicated `J-HRM-NT-*` | **Absent** from `PROGRAM_JOURNEY_MAP.md` | **CONDITION / P3 process** — in-seat path audited; do not invent map PASS |
| Leave L2 | Out of scope | **SPEC_GAP** · not invented |
| **HRM-NT-02** mobile FCM | Explicit OOS | **deferred** · not NT-01 NO-GO |

Mandatory for this gate: **NT-01 mark-read browser path PASS**. No mandatory J-* marked ⏳ while claiming full Phase1 journey closure.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | GET inbox 200 + list; personal mark PATCH 200 `HRM-NOTIF-202` UUID; broadcast CTA hidden; FE+F5; ceo EXPECTED_NO_INBOX; **R-W4-B3-NT01-MARK-COMPANY-UUID CLOSED**; **R-W4-B3-NT01-MARK-BROADCAST-CTA CLOSED** |
| **PROCESS** | QA pack **1/8** (missing journey_l25); console 401 OBS; no dedicated J-HRM-NT journey row |
| **ENV** | None (L0 200; Windows UV noise waived per QA) |
| **CONDITION / OBS** | NT-02 FCM OOS · uat_done **false** · journey-map ADD optional P3 |

ENV does not drive verdict. QA pack format gap does **not** demote NT-01 product close.

---

## Residual

| Id | Status | Sev | Blocks this seat GO? |
|----|--------|-----|----------------------|
| **R-W4-B3-NT01-MARK-COMPANY-UUID** | **CLOSED** | — | No |
| **R-W4-B3-NT01-MARK-BROADCAST-CTA** | **CLOSED** | — | No |
| **R-W4-B3-NT01-INBOX-SCOPE-PROXY** | CLOSED (R3) | — | No |
| HRM-NT-02 mobile FCM | OPEN OOS | — | No — separate seat |
| Leave L2 | SPEC_GAP HOLD | — | No — not invented PASS |
| Phase1 / UAT DONE | — | — | No — **not claimed** |
| **C-B3-QA-PACK-FMT-01** | OPEN process | P3 | qa — add J-* / journey_l25 on next NT QA MD |
| **C-B3-JMAP-NT-01** | OPEN process | P3 | ba/pm — optional ADD journey row for notifications mark-read |

**No open product P0/P1** for W4-B3 HRM-NT-01 mark-read R4 slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** (`uat_done` **false** on HRM-NT-01).
2. Do **not** reopen **R-W4-B3-NT01-MARK-COMPANY-UUID** without new PATCH slug → `HRM-VAL-001` / non-202.
3. Do **not** reopen **R-W4-B3-NT01-MARK-BROADCAST-CTA** without mark CTA reappearing on broadcast NULL rows.
4. Do **not** NO-GO NT-01 for **HRM-NT-02** mobile FCM — separate residual / seat.
5. Do **not** invent Leave L2 PASS or claim Phase1 UAT DONE from this GWC.
6. Prior R3 FAIL (slug PATCH 400) is **superseded** by R4.
7. QA pack journey_l25 gap is **process P3** — not product demote.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r4.md
→ FAIL exit 1 · 1/8 — missing journey_l25
```

**PROCESS** — product browser evidence independently verified; does not demote close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-r4.md
→ PASS exit 0 · 8/8
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-r4.md` | **FAIL** exit **1** · **1/8** (process · journey_l25) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-r4.md` | **PASS** exit **0** · **8/8** (post-write) |
| Runtime read `_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r4-browser.json` | **PASS** · PATCH UUID `HRM-NOTIF-202` + GET 200 + broadcast CTA hidden |
| PNG spot `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-r4/03-nv-after-mark-read.png` | **PASS** · file exists · toast «Đã đánh dấu đã đọc» |
| PNG spot `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-r4/05-ceo-notifications.png` | **PASS** · requires-employee copy |
| FE vitest paths (dev-fe handoff) | **ACCEPT** · cited 5/5 in FE MD |
| by-uc `HRM-NT-01.md` §9–§10 | **PASS** · execution PASS R4 · uat_done false |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | QA l0 200 + JSON `l0` |
| **LIST READ** | GET inbox | **PASS** | HRM-NOTIF-200 · PNG 02 |
| **MARK UPDATE** | personal PATCH UUID | **PASS** | HRM-NOTIF-202 · `patchUsesUuid` |
| **Broadcast CTA** | personal-only | **PASS** | `PASS_NO_CTA_ON_BROADCAST` |
| **F5** | persist read | **PASS** | `feReadAfterF5` · PNG 04 |
| **CEO AU** | EXPECTED_NO_INBOX | **PASS** | AC-NT01-CEO-01 · PNG 05 |
| **In-seat L2.5** | list→mark→F5 | **PASS** | network + screens |
| **J-HRM-01..08** | host journeys | **context** | not re-closed |
| Leave L2 | ladder | **SPEC_GAP** | not invented |
| HRM-NT-02 FCM | mobile | **deferred** | OOS |

---

## Forbidden compliance (QC)

- No seed · no `apps/**` edit
- Did not invent Phase 1 / UAT DONE
- Did not invent Leave L2 PASS
- Did not NO-GO NT-01 for NT-02 FCM
- Did not NO-GO on QA pack 1/8 alone
- Opened QA MD + FE MD + R3 FAIL + by-uc §9–§10 + runtime JSON + PNG spot before verdict

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QC-B3-HRM-NT-R4
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-r4.md
next_owner: pm
verdict: GO WITH CONDITIONS
slice: W4-B3 HRM-NT-01 mark-read R4 only
residual_closed: R-W4-B3-NT01-MARK-COMPANY-UUID · R-W4-B3-NT01-MARK-BROADCAST-CTA
uat_done: false
phase1_done: false
```

### completion_report

- **Closed (QC):** L3 GWC for W4-B3 HRM-NT-01 mark-read R4 — personal mark PATCH `HRM-NOTIF-202` with UUID `company_id` corroborated by Network JSON + PNG toast; broadcast CTA hidden; GET/list scope-proxy PASS; ceo@ EXPECTED_NO_INBOX PASS; R3 residuals CLOSED; U65 respected; uat_done false.
- **Open (program):** `uat_done` false; HRM-NT-02 FCM OOS; QA pack journey_l25 P3; optional journey-map ADD for NT notifications P3.

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-PM-B3-HRM-NT-R4-INTAKE-01
from_role: pm
to_role: pm
lane: governance
priority: P1
entry_criteria: QC PASS_TO_PM docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-r4.md — GWC W4-B3 HRM-NT-01 mark-read R4; R-W4-B3-NT01-MARK-COMPANY-UUID + MARK-BROADCAST-CTA CLOSED; uat_done false; NT-02 FCM still OOS
exit_criteria: Bus INTAKE closed; TEAM_WORKING_NOW clears QC slot; do NOT reopen NT-01 mark seat unless new PATCH slug/VAL-001 or broadcast CTA regression; do NOT promote Phase1 UAT DONE; continue W4 backlog / NT-02 only as separate seat; optional P3: qa add journey_l25 on next NT MD · ba ADD J-HRM-NT row if sponsor wants map coverage
evidence_path: docs/qa/evidence/po-uc-tc-w4-qc-b3-hrm-nt-r4.md
ack_status: PASS_TO_PM
```
