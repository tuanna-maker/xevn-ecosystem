# QC Gate Decision — PCOMP-PROGRAM-GATE-01-L3 (2026-06-09)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-PROGRAM-GATE-01-L3` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`) |
| **executed_at** | `2026-06-09` |
| **program** | `P1-PRODUCT-COMPLETE` · program gate L3 (L0→L2.5 chain) |
| **plan_ref** | `docs/program/PHASE1_PRODUCT_COMPLETION_PMP_PLAN.md` §7 |
| **decision** | **GO WITH CONDITIONS (reduced)** — localhost U32 **program gate L0–L2.5** slice |
| **phase1_done_claim** | **NO — EXPLICIT DENIAL** |
| **prod_ready_claim** | **NO** |
| **sponsor_uat_exit** | **NO** (PCOMP-W6-SP-01 open) |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC consolidates **PCOMP-PROGRAM-GATE-01-L3** after QA chain **PCOMP-PROGRAM-GATE-01** → **L1** → **L2** all **PASS_TO_PM** (2026-06-09).

**CLOSED this gate (promotable localhost U32 program slice):**

- **L0 stack** — `qc:dev-stack` exit **0** (QA L1 + QC spot 2026-06-09: HRM + XBOS + portal **200**)
- **L1 API integration** — `test:system:uat` verdict **PASS** 37/0/0; `verify:capabilities` pass=23 fail=0
- **L2 pilot matrix** — `test:pilot:flows` **13/13** P-CC-01..09; `qc:fe-be-health` **8/8**
- **L2.5 J-* spot (API parity)** — J-HRM-01..08 + J-CC via P-CC rollup **PASS**; no list→detail scope 404
- **W1–W3 automation** — `verify:product:completion` exit **0** (QC reproduced; L0 now **PASS** not SKIP)
- **UC matrix** — `phase1:gate` non-strict exit **0** (245 rows · e2e_pass=244 · waived=1)
- **Evidence pack** — L2 QA file `verify:qc:evidence-pack` **8/8**

**REMAINING (blocks Phase 1 DONE / sponsor UAT / PROD):**

- **PHASE1_PRODUCT_COMPLETION_TODO** — **5** `[ ]` + **4** `[~]` open (incl. **PCOMP-W6-SP-01** sponsor sign-off)
- **`pm:scan:backlog`** exit **2** — 2× `dispatchRequired` (directory deploy + pagesize QA)
- **L2.5 browser click** — API surrogate only this wave; full browser L2.5 deferred per L2 residual
- **W5 GWC carry** — M-CC-11/12, G-INT browser depth, W4 mobile (per `pcomp-w5-qc-01-20260607.md`)
- **W7 mobile backlog** — leave-doc, leave-bal, directory, profile-full TODO rows not synced to QA PASS evidence
- **nip.io pilot** — this wave localhost `:5173`; pilot HTTPS regression separate

**NOT Phase 1 DONE · NOT PROD-READY · NOT sponsor UAT-PASS · NOT unconditional program exit.**

---

## Evidence chain audited

| Layer | Artifact | Role | ack_status | QC L3 |
|-------|----------|------|------------|-------|
| Base | `docs/qa/evidence/pcomp-program-gate-01-20260609.md` | qa | PASS_TO_PM | **W1–W3 script PASS**; capability was env FAIL (stack down) — **superseded by L1** |
| L0+L1 | `docs/qa/evidence/pcomp-program-gate-01-l1-20260609.md` | qa | PASS_TO_PM | **L0+L1+capability PASS** — concurred |
| L2+L2.5 | `docs/qa/evidence/pcomp-program-gate-01-l2-20260609.md` | qa | PASS_TO_PM | **fe-be 8/8 · P-CC 13/13 · J-HRM spot PASS** — concurred |
| W5 QC | `docs/qa/evidence/pcomp-w5-qc-01-20260607.md` | qc | PASS_TO_PM | **GWC** — program residuals register still authoritative |
| W8 mobile | `docs/qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md` | qc | PASS_TO_PM | **GWC reduced** — mobile umbrella; not portal L3 scope |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `pcomp-program-gate-01-l2-20260609.md` | **0** | **8/8** | **PASS** — PM dispatch L3 valid |
| `pcomp-program-gate-01-l1-20260609.md` | — | — | Substantive L1 chain; not re-verified (L2 supersedes for QC dispatch) |
| `pcomp-program-gate-01-20260609.md` | — | — | Base audit; env residuals superseded |

Per `QC_ZERO_DEFECT_REFORM_PLAN.md` §3: L3 proceeds on **audited L0→L2 chain** + L2 pack **8/8** + QC spot L0.

---

## Layer C — QC independent verification (2026-06-09)

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-program-gate-01-l2-20260609.md` | **exit 0** — **8/8** | **PROCESS OK** |
| `pnpm run qc:dev-stack` | **exit 0** — hrm + xbos + portal **200** | **PRODUCT OK** — concurs L1/L2 |
| `pnpm run verify:product:completion` | **exit 0** — W1×3 + W2 + W3 + **L0 PASS**; pm-scan **SKIP exit 2** | **PRODUCT OK** (required gates); **backlog OPEN** |

---

## Command table (QC spot + chain cite)

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run qc:dev-stack` | **0** | **PASS** | QC spot 2026-06-09 |
| `pnpm run verify:product:completion` | **0** | **PASS** | W1–W3 + L0; pm-scan optional SKIP 2 |
| `pnpm run test:system:uat` | **0** | **PASS** | 37/0 — cite L1 |
| `pnpm run verify:capabilities` | **0** | **PASS** | pass=23 — cite L1 |
| `pnpm run qc:fe-be-health` | **0** | **PASS** | 8/8 — cite L2 |
| `pnpm run test:pilot:flows` | **0** | **PASS** | 13/13 P-CC-* — cite L2 |

**portal_url:** `http://127.0.0.1:5173`

---

## L2.5 J-* journey coverage (U19)

| Journey | Tested (L2 wave) | Method | Verdict |
|---------|------------------|--------|---------|
| **J-HRM-01** | contracts → employee detail | API list→GET | **PASS** |
| **J-HRM-02** | employees list → detail | API parity | **PASS** |
| **J-HRM-03** | contract by id | API GET | **PASS** |
| **J-HRM-04** | insurance → employee link | API | **PASS** |
| **J-HRM-05** | requisition list → detail | API | **PASS** |
| **J-HRM-06** | attendance → employee | API | **PASS** |
| **J-HRM-07** | payslip row detail | API | **PASS** |
| **J-HRM-08** | catalog-governance inbox | P-CC-09 | **PASS** (empty inbox alternate) |
| **J-CC-01..03** | login + member units + KPI rollup | P-CC-01/02/04c | **PASS** |
| **J-MOB-*** (device) | — | prior W8 GWC | **GWC** — separate mobile track |
| **Browser L2.5 click** | — | deferred | **GWC** — API parity sufficient for L3 localhost slice |

**U19:** L2 closes API L2.5 sample for group CEO `main` embed; does **not** substitute nip.io browser cross-nav or member-CEO persona slice.

---

## P-CC-* / pilot matrix (L2)

| ID | Verdict (L2 cite) |
|----|-------------------|
| P-CC-01..09 | **13/13 PASS** — no 409 scope, no 54321, no proxy 500 |

---

## Phase 1 DONE denial (mandatory)

| Blocker | Status | Evidence |
|---------|--------|----------|
| `PHASE1_PRODUCT_COMPLETION_TODO` open `[ ]` | **5 rows** | W7 mobile ×4 + **PCOMP-W6-SP-01** sponsor |
| `PHASE1_PRODUCT_COMPLETION_TODO` `[~]` | **4 rows** | W2-FE-01, W2-BE-01, W7-QA-HUB-04b, U39-W3-QC |
| `pm:scan:backlog` | **exit 2** | D-MOB-W7-5-DIRECTORY-DEPLOY-01, MOB-W7-5-DIRECTORY-PAGESIZE-FIX |
| W5 program GWC residuals | **OPEN** | M-CC-11/12, G-INT browser, W4 mobile |
| Sponsor UAT | **NOT MET** | PCOMP-W6-SP-01 |
| `phase1:gate` strict + capability | **GWC** | Non-strict PASS; strict/browser depth not claimed |

**Phase 1 DONE claim: EXPLICITLY DENIED.**

---

## Classification (ENV vs PRODUCT)

| Finding | ENV vs PRODUCT |
|---------|----------------|
| L0/L1/L2/L2.5 chain PASS | **PRODUCT CLOSED** (localhost U32 group CEO slice) |
| `verify:product:completion` exit **0** | **PRODUCT CLOSED** (W1–W3 required) |
| `pm:scan:backlog` exit **2** | **PROCESS OPEN** — dispatch queue |
| Open TODO W7 rows (stale vs QA PASS) | **PROCESS** — PM sync TODO |
| L2.5 API-only (no browser click) | **PRODUCT GWC** — depth deferred |
| Prior PROGRAM-GATE-01 capability fail=23 | **ENV superseded** — L1 pass=23 after stack up |
| nip.io pilot not re-run | **ENV/scope** — separate wave if PM targets pilot |

---

## Residual

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **PCOMP-W6-SP-01** | milestone | sponsor | UAT sign-off — program exit blocker |
| **D-MOB-W7-5-DIRECTORY-DEPLOY-01** | P1 | qa | pm:scan dispatchRequired |
| **MOB-W7-5-DIRECTORY-PAGESIZE-FIX** | P1 | qa | READY_FOR_QA undispatched |
| **PCOMP-W7-MOB-*** TODO sync | P2 process | pm | Rows open despite partial QA PASS |
| **M-CC-11/12** | P1 product | dev-fe | W5 GWC carry |
| **G-INT-05/06/08 browser** | P1 program | dev-fe + qa | W5 GWC carry |
| **L2.5 browser localhost** | P2 | qa | Optional; API parity closed L3 slice |

---

## Reopen triggers

- `verify:product:completion` exit **≠ 0**
- `qc:dev-stack` exit **≠ 0** on sponsor-visible demo
- P-CC-* or J-HRM API **409** scope regression
- Phase 1 DONE / PROD claim while TODO `[ ]` or sponsor UAT open
- User P0 on in-scope J-* without matrix update

---

## Handoff packet

**completion_report:** QC **PCOMP-PROGRAM-GATE-01-L3** — **GO WITH CONDITIONS (reduced)** localhost U32 program gate. **CLOSED:** L0 `qc:dev-stack` **0**, L1 UAT **37/0**, L2 P-CC **13/13**, L2.5 J-HRM-01..08 API spot **PASS**, `verify:product:completion` **0**, L2 pack **8/8**, QC spot L0 **0**. **REMAINING:** 5+4 open TODO, `pm:scan` exit **2**, sponsor UAT, W5 GWC residuals, L2.5 browser depth, nip.io pilot. **Phase 1 DONE EXPLICITLY DENIED.**

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
PM intake PCOMP-PROGRAM-GATE-01-L3 PASS_TO_PM (GO WITH CONDITIONS reduced — program L0–L2.5 localhost slice).

Closed L3-QC: L0 qc:dev-stack 0; L1 test:system:uat 37/0; L2 P-CC 13/13 + fe-be 8/8; L2.5 J-HRM-01..08 API PASS; verify:product:completion exit 0; L2 pack verify 8/8.

Do NOT claim Phase 1 DONE / PROD / sponsor UAT-PASS.

Priority dispatch (max 2 parallel):
1) qa D-MOB-W7-5-DIRECTORY-DEPLOY-01 — devops PASS_TO_PM handoff; nip.io directory deploy retest.
2) qa MOB-W7-5-DIRECTORY-PAGESIZE-FIX — dev-mobile READY_FOR_QA pagesize fix retest.

Then: sync PHASE1_PRODUCT_COMPLETION_TODO W7 rows (leave-bal/directory QA PASS → [x]); PM refresh PCOMP-W6-PM-01 for sponsor UAT wave when W7 pipeline closed.

Evidence: docs/qa/evidence/pcomp-program-gate-01-l3-20260609.md
```

**evidence_path:** `docs/qa/evidence/pcomp-program-gate-01-l3-20260609.md`

**ack_status:** **PASS_TO_PM**
