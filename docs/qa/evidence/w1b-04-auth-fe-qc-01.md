# Evidence — W1-B-04-AUTH-FE-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-04-AUTH-FE-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | L3 gate — FR-UC-M01 portal auth FE (RET4) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/login` → `/command-center` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `w1b-04-auth-fe-qa-ret4.md` PASS_TO_PM · test-log md+json · CC-CHIP-01 READY_FOR_QA parent |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice `DOC-ENT-P0-AUTH-M01` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY |

---

## Verdict summary

**GO WITH CONDITIONS** — FR-UC-M01 portal auth FE slice after QA RET4. Independent QC audit confirms Cases **A/B/C** credible (browser + Network + screens + runtime JSON). **R-AUTH-FE-CC-MEMBERSHIP-CHIP CLOSED** (do not reopen without regression). **R-AUTH-FE-SELECT-MEMBERSHIP-UI CLOSED**. Vite overlay remains closed. World-standard test-log **md + json** (`xevn-test-log/v1`) chronological + schema-plausible (U78). U76 case matrix fail_deep + success_hdsd + logic_br present.

**Condition (allowed):** P2 `catalog-governance/inbox` **409** console noise on CC load — **out-of-AUTH AC**; defer OK. **R-M01-LOCKOUT-COL** P2 unchanged OOS.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/w1b-04-auth-fe-cc-chip-01.md` | READY_FOR_QA; TopHeader mount on CC shell; BE `*_label` bind | **ACCEPT** — root cause ExecLayout outlet-only fixed |
| `docs/qa/evidence/w1b-04-auth-fe-qa-ret4.md` | PASS_TO_PM; A/B/C 🟢; chip CLOSED; select 201; F5; Vite closed | **ACCEPT** |
| `…-qa-ret4-test-log.md` | 20 steps chronological · verdict pass | **ACCEPT** (U78) |
| `…-qa-ret4-test-log.json` | `schema: xevn-test-log/v1` · 20 steps · 6 cases · summary pass | **ACCEPT** (U78 / OS 31) |
| `…/_tmp-w1b-04-auth-fe-qa-ret4-runtime.json` | clickCount=16 · network auth · ac[] | **ACCEPT** (cross-check) |
| Screens `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/` | 7 PNG on disk | **ACCEPT** (spot visual) |

---

## Independent spot-check (QC)

### EC1 — Case A fail-deep

| Check | Result |
|-------|--------|
| Network | POST `/api/xbos/auth/login` **401** `XBOS-AUTH-401` @ 2026-08-03T13:56:47.171Z |
| UI | Stay `/login` · «Email hoặc mật khẩu không đúng» |
| Screen | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/A-wrong-password.png` — red fail banner visible (QC visual) |
| Runtime | `CASE-A` 🟢 · stillLogin=true · msgHint=true |

**PASS**

### EC2 — Case B chip BE labels + select-membership

| Check | Result |
|-------|--------|
| ceo login | POST login **201** `XBOS-AUTH-200` → `/command-center` |
| BE labels | `tenant_label=Tập đoàn XeVN` · `company_label=Công ty chính` · `role_label=CEO Tập đoàn` |
| UI chip | runtime `mode=static` · showsRole/Tenant/Company **true** · raw=false · not persona-only |
| Screen B-ceo | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-ceo-after-login.png` — TopHeader scope «Phạm vi làm việc» / Tập đoàn XeVN + role chrome on CC (QC visual) |
| admin multi-mem | login **201** · picker items=5 · BE labels · no raw roleCode |
| select | POST `/api/xbos/auth/select-membership` **201** `XBOS-AUTH-201` · mid=`0b7f492e-6a34-458b-b46c-7f1ac2f9e664` |
| Screen after-select | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-admin-after-select.png` — Membership chip shows **Công ty Cổ phần Thương mại…** + **CEO công ty thành viên** (QC visual) |

**PASS** — **R-AUTH-FE-CC-MEMBERSHIP-CHIP CLOSED** · **R-AUTH-FE-SELECT-MEMBERSHIP-UI CLOSED** — **do not reopen Vite/chip without new regression**.

### EC3 — Case C F5 + Vite closed

| Check | Result |
|-------|--------|
| F5 | still `/command-center` · mode=switcher · mid persists · selected tenant/role in chip |
| Screen C | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/C-after-f5.png` — «Membership đang làm việc» + Công ty Cổ phần Thương mại… (QC visual) |
| me | GET `/api/xbos/auth/me` **200** (×2) |
| Vite | overlay=false · failedSrc=0 · App/CC/TopHeader/ExecLayout transforms **200** |
| Anti-idle | clickCount **16** · auth Network **6** · QA-IDLE-VIEWPORT not triggered |

**PASS**

### EC4 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-W1B-04-AUTH-FE-RET4-20260803` |
| steps | **20** chronological (`at` non-decreasing) · all `pass` |
| cases | FORM · CASE-A · B-AC1 · B-AC2 · B-AC4 · CASE-C (U76 matrix) |
| hdsd_align | **true** |
| u65_zero_seed | **true** |
| summary | passed=20 failed=0 · verdict=pass · ack PASS_TO_PM |
| attachments | 7 PNG paths — **all exist on disk** |

**PASS** — not invent UF from vitest; browser harness + Network timestamps.

---

## L2.5 J-* audit (U19)

| Journey | Scope vs AUTH-M01 | QC |
|---------|-------------------|-----|
| **J-CC-01** Login tập đoàn `/login` → `/command-center` | In-scope (Case B ceo + admin paths) | **PASS** (browser RET4) |
| Other J-HRM-* / mobile | Out of this WI | **not claimed** |

Mandatory in-scope journey for this AUTH FE gate: **J-CC-01 PASS**. No untested mandatory J-* claimed PASS.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | AUTH AC A/B/C **PASS** · chip + select residuals **CLOSED** |
| **PROCESS** | QA narrative pack `verify:qc:evidence-pack` **4/8** missing command_table / portal_url / journey_l25 / residual_section — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | none (L0 HRM/XBOS/portal 200 in QA; Vite closed) |

ENV does not drive verdict. Process pack gaps on QA MD do **not** demote product AUTH close.

---

## Residual

| Id | Status | Sev | Owner | Blocks AUTH GO? |
|----|--------|-----|-------|-----------------|
| **R-AUTH-FE-CC-MEMBERSHIP-CHIP** | **CLOSED** | — | — | No — do not reopen |
| **R-AUTH-FE-SELECT-MEMBERSHIP-UI** | **CLOSED** | — | — | No — do not reopen |
| **OBS-CC-CATALOG-INBOX-409** | **OPEN — CONDITION** | P2 | separate WI if CC inbox UF in scope | **No** (out-of-AUTH) |
| **R-M01-LOCKOUT-COL** | OPEN OOS | P2 | BA/SA | No |
| **C-AUTH-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — harness note for next QA MD |

---

## Conditions (explicit)

1. **OBS-CC-CATALOG-INBOX-409** — console `GET …/catalog-governance/inbox` **409** tenantId vs token scope on ceo@ CC load — **deferred**; not AUTH AC fail; do not reopen chip/Vite for this.
2. **R-M01-LOCKOUT-COL** remains BA/SA P2 — not this gate.
3. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this AUTH FE GWC alone.
4. Do **not** reopen **R-AUTH-FE-CC-MEMBERSHIP-CHIP** / Vite residuals without new browser regression evidence.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-fe-qa-ret4.md
→ FAIL 4/8 — command_table, portal_url, journey_l25, residual_section
```

**PROCESS GWC** — product Cases A/B/C independently verified; does not demote AUTH close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-fe-qc-01.md
→ target EXIT 0 (8/8)
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-fe-qa-ret4.md` | **FAIL** exit **1** · **4/8** (process) |
| `node -e` schema/chrono/allPass on `w1b-04-auth-fe-qa-ret4-test-log.json` | **PASS** exit **0** · schema `xevn-test-log/v1` · steps=20 · chrono=true · allPass=true |
| Disk check 7 PNG under `screens/w1b-04-auth-fe-qa-ret4/` | **PASS** · all present (25–159 KB) |
| Runtime cross-check `_tmp-w1b-04-auth-fe-qa-ret4-runtime.json` | **PASS** · clickCount=16 · select 201 · ac A/B/C 🟢 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-fe-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-04-auth-fe-qc-01.md --check-assets` | **PASS** exit **0** (PNG paths resolve) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| FORM | Login email+password | **PASS** | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/00-login-form.png` |
| **A** fail_deep | Wrong pwd → 401 + VI msg | **PASS** | Network 401 · `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/A-wrong-password.png` |
| **B1** success_hdsd | CC chip BE `*_label` | **PASS** | runtime match · `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-ceo-after-login.png` |
| **B2** success_hdsd | select-membership **201** | **PASS** | `XBOS-AUTH-201` · mid · `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-admin-after-select.png` · `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/B-admin-picker.png` |
| **B** Vite | overlay closed | **PASS** | failedSrc=0 |
| **C** logic_br | F5 labels + mid | **PASS** | `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret4/C-after-f5.png` · me 200 |
| **J-CC-01** L2.5 | login → CC | **PASS** | RET4 Cases B/C |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT DONE
- Did not reopen chip/Vite without defect
- Did not treat catalog-governance 409 as AUTH NO-GO

---

## completion_report

**Closed:** L3 QC gate `W1-B-04-AUTH-FE-QC-01` on FR-UC-M01 portal auth after QA RET4. Spot-check A/B/C + screens + runtime + Network credible. **R-AUTH-FE-CC-MEMBERSHIP-CHIP CLOSED** (TopHeader on CC binds BE labels). Select-membership **201** + F5 persist + Vite closed. U78 test-log md+json schema/chrono OK. **J-CC-01 PASS**.

**Residual / conditions:** OBS-CC-CATALOG-INBOX-409 P2 out-of-AUTH defer; R-M01-LOCKOUT-COL P2 OOS; QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/w1b-04-auth-fe-qc-01.md`

---

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-PM-CLOSE
role: pm
priority: P1
entry_criteria:
  - docs/qa/evidence/w1b-04-auth-fe-qc-01.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-AUTH-FE-CC-MEMBERSHIP-CHIP CLOSED — do not reopen without regression
  - R-AUTH-FE-SELECT-MEMBERSHIP-UI CLOSED
  - J-CC-01 PASS (AUTH FE local :5173)
action:
  1) Bus INTAKE W1-B-04-AUTH-FE-QC-01 PASS_TO_PM + promote AUTH FE chip residuals CLOSED on backlog / TEAM_WORKING_NOW
  2) Continue next open W1-B / PM_OPEN_BACKLOG item (do not idle)
  3) Defer OBS-CC-CATALOG-INBOX-409 P2 to separate CC inbox WI only if that UF enters scope — not AUTH reopen
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this AUTH FE GWC
cấm: seed · reopen chip/Vite without new defect · invent UAT DONE
```

---

## pm_dispatch_hint

`W1-B-04-AUTH-FE-PM-CLOSE` — promote chip+select CLOSED; GWC catalog-inbox 409 P2 defer; next backlog; no UAT DONE claim.
