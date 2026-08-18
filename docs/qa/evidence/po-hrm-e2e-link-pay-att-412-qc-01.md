# Evidence — `PO-HRM-E2E-LINK-PAY-ATT-412-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-ATT-412-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 gate delta — **browser Khóa → process 201** residual only |
| **priority** | P2 ATT-412-BROWSER close · module UAT denied · prior seals retained |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` (Path A Jan `dffbb1fe…`) |
| **Verdict** | **GO WITH CONDITIONS** — ATT-412 browser residual **CLOSED**; slice ≠ module UAT |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-E2E-LINK-PAY-ATT-412-QA-01` PASS_TO_PM |
| **qa_ref** | [`po-hrm-e2e-link-pay-att-412-qa-01.md`](po-hrm-e2e-link-pay-att-412-qa-01.md) |
| **prior_gwc** | [`po-hrm-e2e-link-pay-att-close-qc-01.md`](po-hrm-e2e-link-pay-att-close-qc-01.md) — CONDITION ATT-412 was **OPEN** |
| **hire_gwc_retain** | [`po-hrm-e2e-link-pay-hire-qc-01-r2.md`](po-hrm-e2e-link-pay-hire-qc-01-r2.md) — **NOT overwritten** as module seal |
| **machine** | [`_tmp-po-hrm-e2e-link-pay-att-412-qa-01-browser.json`](_tmp-po-hrm-e2e-link-pay-att-412-qa-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-412-qa-01/` |
| **spec_ref** | FR-HRM-PR-05 · AC-PAY-HIRE lock/process · J-HRM-06c precondition chain |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — residual close ≠ payroll module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **payroll_e2e_ready** | **true** (narrow) | **RETAIN** from att-close QC-01 — now **also** covers browser Khóa→process; still **≠** module UAT |
| **payroll module UAT** | **DENIED** | Not certified |
| **recruitment_uat_ready** | **false** / untouched | **Cấm promote** |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Prior hire GWC (R2)** | **Retained** | Do not overwrite as module seal |
| **Prior att-close GWC** | **Superseded only on ATT-412 CONDITION** | Enroll AC-04∧05 seals **held** |

---

## Verdict summary

**GO WITH CONDITIONS** — delta ACCEPT: close **`R-PAY-HIRE-ATT-412-BROWSER`**.

| Chain link | Evidence | QC |
|------------|----------|-----|
| Path A Jan draft `dffbb1fe…` + UAT-0100 enrolled | QA-01 preLock · PNG 01 | **ACCEPT** |
| Click **Khóa bảng lương** → confirm | clicks + PNG 02 | **ACCEPT** |
| POST `/process` | **201** `HRM-PAY-202` (not 412) | **ACCEPT** — closes residual |
| FE after 2xx | Badge **Đã khóa** · Khóa btn gone · PNG 03 | **ACCEPT** |
| F5 | **Đã khóa** + UAT-0100 · PNG 04 | **ACCEPT** |
| Follow-on POST `/close` | **201** `HRM-PAY-203` (observed) | **OBS** — documented, not fail |
| Payslip amounts 0 ₫ | Gross/Net 0 on UAT-0100 | **OBS P3** — not ATT-412 blocker |
| Negative 412 (no closed sheet) | NOT RUN this seat | **DEFERRED P3** — prior hire API 412 retained |

**Cấm:** payroll module UAT · recruitment_uat_ready · production GO · Phase 1 DONE · overwrite hire-qc-01-r2 as module seal.

---

## Entry audit (QA-01 completeness)

| Check | Evidence | QC |
|-------|----------|-----|
| Click path FE | Path A → Khóa → dialog → confirm → F5 | 🟢 |
| Network process 201 | Machine `lock.processStatus=201` · code `HRM-PAY-202` | 🟢 |
| ATT-412 absent | No 412 on process | 🟢 |
| FE after 2xx | `lockedBadge=true` · `lockStillEditable=false` | 🟢 |
| F5 persist | `feAfter.f5.lockedBadge=true` · `uatRow=true` · statusSnippet `Đã khóa` | 🟢 |
| U65 zero-seed | claimed · no seed in path | 🟢 |
| Screenshots on disk | 01–04 PNG present | 🟢 |
| Machine JSON vs MD | Aligned (process + close + criteria all PASS) | 🟢 |
| Honesty denials | module / product GO DENIED in MD + JSON | 🟢 |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `l0.hrm/xbos/portal` | 200 | **PASS** |
| `preLock.uatRow` / `empCount` / `lockVisible` | true / 1 / true | **PASS** |
| `lock.processStatus` / `processCode` | **201** / `HRM-PAY-202` | **PASS** |
| `lock.feAfter.lockedBadge` | true | **PASS** |
| `lock.feAfter.f5.lockedBadge` / `uatRow` | true / true | **PASS** |
| `closeObserved` | 201 `HRM-PAY-203` | **OBS** |
| `criteria.*` | all PASS | **PASS** |
| `residuals[0].id` status | `R-PAY-HIRE-ATT-412-BROWSER` **CLOSED** | **ACCEPT** |
| `pageErrors` | `[]` | **PASS** |
| `consoleErrors` | 1× Vite WS handshake timeout | **ENV OBS** (not product) |
| U65 seed | none | **PASS** |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `01-path-a-detail.png` | Draft **Bản nháp** · **UAT-0100** · count=1 · **Khóa bảng lương** visible · amounts 0 ₫ |
| `03-after-process.png` | Badge **Đã khóa** · Khóa btn **absent** · UAT-0100 still present |
| `04-after-f5.png` | Same **Đã khóa** + UAT-0100 after reload — F5 OK |

---

## Gate AC audit

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack | QA-01 + QC `qc:dev-stack` HRM/XBOS/5173 **200** | 🟢 |
| 2 | Path A detail + enrolled row | preLock + PNG 01 | 🟢 |
| 3 | Khóa → confirm → POST process | Machine + MD | 🟢 |
| 4 | Process **2xx** with closed att (not 412) | **201** `HRM-PAY-202` | 🟢 **CONDITION CLOSED** |
| 5 | FE after + F5 | PNG 03/04 + machine f5 | 🟢 |
| 6 | U65 zero-seed | claimed | 🟢 |
| 7 | Module UAT / prod GO | Explicit DENIED | 🟢 denied |
| 8 | Hire R2 not overwritten | Retained pointer | 🟢 |

---

## L2.5 J-* audit (U19)

| Journey / UF | Scope vs this seal | QC |
|--------------|-------------------|-----|
| Prior **J-HRM-06c** att close + enroll AC-04∧05 | Held from att-close QC-01 | **PASS** (prior) |
| **UF-HRM-06** Path A → Khóa → process → F5 | In-scope residual | **PASS** |
| Negative ATT-412 without closed sheet | Deferred | **OBS** |
| Full payroll module / payslip formula | Out of scope | **DENIED** |

Mandatory for this gate: browser Khóa → process 2xx + FE + F5. **Not** invent PASS on payroll module UAT.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT (CLOSED)** | `R-PAY-HIRE-ATT-412-BROWSER` — Khóa → POST process **201** `HRM-PAY-202` · FE Đã khóa · F5 |
| **PRODUCT (OBS)** | Payslip Gross/Net **0 ₫** after process — P3 formula/data; **not** ATT-412 fail |
| **PROCESS** | QA-01 `verify:qc:evidence-pack` **FAIL 1/8** (`ack_status:` line format) — **OBS only**; QC pack consolidates |
| **ENV** | Portal `:5173` L0 **200**; Vite WS timeout in console; Windows UV assert on `qc:dev-stack` exit — **OBS not auto NO-GO** |
| **OUT-OF-SCOPE / DENIED** | Payroll module UAT · recruitment_uat_ready · production GO · Phase 1 DONE · overwrite hire-qc-01-r2 |

ENV / process pack miss do not drive product NO-GO. No product P0 on in-scope residual.

---

## Residual / Conditions

| Id | Status | Sev | Owner | Blocks this residual seal? |
|----|--------|-----|-------|----------------------------|
| **R-PAY-HIRE-ATT-412-BROWSER** | **CLOSED** | — | — | No — **this seat closes** |
| Payslip amounts 0 ₫ | **OBS** | P3 | ba/dev optional | No |
| Optional negative 412 path | **DEFERRED** | P3 | qa optional | No |
| Path B filter+row (from att-close) | **DEFERRED** | P3 | qa optional | No |
| QA-01 pack `ack_status:` format | PROCESS OBS | P3 | qa | No |
| Portal `:5175` vs `:5173` | ENV OBS | P3 | devops | No |

**No product P0/P1 OPEN** on PAY hire ATT residual chain → **GWC delta** (not clean module GO) due to `C-SLICE-≠-MODULE` denials + soft OBS.

---

## Delta vs prior att-close QC-01 GWC

| Topic | Att-close QC-01 | This QC-01 |
|-------|-----------------|------------|
| AC-04/05 enroll + F5 | PROMOTED | **Held** |
| `payroll_e2e_ready` | true (narrow AC-04∧05) | **true (narrow)** + ATT-412 browser proven |
| **R-PAY-HIRE-ATT-412-BROWSER** | **OPEN** | **CLOSED** |
| Module UAT | Denied | **Denied** |
| Hire GWC R2 | Retained | **Retained** |

---

## Relationship to hire GWC (R2)

| Topic | Hire QC R2 | This QC |
|-------|------------|---------|
| ELIG-UI / scope parity seals | GWC held | **Untouched / retained** |
| ATT-412 browser | OPEN P2 (API-only then) | **CLOSED** (browser process 201) |
| Module UAT | Denied | **Denied** — R2 file **not** rewritten as module seal |

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qa-01.md
→ FAIL process 1/8 · ack_status: prefix — PROCESS OBS only

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qc-01.md
→ (sealed this file)

pnpm run qc:dev-stack
→ HRM 200 · XBOS 200 · portal :5173 200 · (Windows UV assert on process exit — ENV OBS)
```

| Check | Result |
|-------|--------|
| QA-01 evidence completeness | ✅ click path · Network 201 · FE after 2xx · F5 · AC table |
| Machine JSON vs MD | ✅ aligned |
| Screenshot visual | ✅ 01 / 03 / 04 |
| CONDITION ATT-412 close | ✅ **CLOSED** |
| Module / prod / Phase1 honesty | ✅ DENIED |
| Prior hire GWC overwrite | ❌ not done — retained |

---

## not promoted (explicit)

| Item | Reason |
|------|--------|
| Payroll **module** UAT-ready | `C-SLICE-≠-MODULE` |
| `recruitment_uat_ready` | Untouched / cấm promote |
| Production GO / product GO | Out of scope |
| Phase 1 DONE | Program gates open |
| Payslip non-zero / formula cert | OBS 0 ₫ only |
| Negative 412 browser without closed sheet | NOT RUN |
| Overwrite `po-hrm-e2e-link-pay-hire-qc-01-r2` | Prior GWC retained |

**Promoted (narrow):**

| Item | Status |
|------|--------|
| Browser Khóa → process **201** `HRM-PAY-202` | 🟢 closes `R-PAY-HIRE-ATT-412-BROWSER` |
| FE **Đã khóa** + F5 | 🟢 |
| Prior AC-04∧05 + Path A enroll chain | 🟢 **held** from att-close QC-01 |

---

## completion_report

- **Closed:** CONDITION **`R-PAY-HIRE-ATT-412-BROWSER` CLOSED** — U65 browser Path A Jan draft `dffbb1fe…` + UAT-0100 → Khóa → POST `/process` **201 `HRM-PAY-202`** (not 412) → FE **Đã khóa** → F5. Observed `/close` **201 `HRM-PAY-203`**.
- **Conditions / residual soft:** Payslip 0 ₫ OBS P3; negative 412 deferred; Path B deferred; QA pack format PROCESS OBS; portal port ENV OBS.
- **NOT claimed / cấm:** payroll module UAT · recruitment_uat_ready · production GO · Phase 1 DONE · overwrite hire-qc-01-r2.
- **Idle:** No product P0/P1 residual on this PAY hire ATT chain → **PM may idle** on this residual lane.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-412-QC-01 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — ATT-412 browser residual CLOSED (slice only)
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qc-01.md
facts:
  - Khóa → POST process 201 HRM-PAY-202 on dffbb1fe…; FE Đã khóa + F5; close 201 HRM-PAY-203 observed
  - R-PAY-HIRE-ATT-412-BROWSER CLOSED (closes CONDITION from att-close QC-01 GWC)
  - payroll_e2e_ready=true NARROW (AC-04∧05 + ATT-412 browser) · NOT module UAT · NOT production GO
  - hire GWC R2 RETAINED (not overwritten)
  - OBS P3 payslip 0₫ — optional BA/dev later; not blocker
cấm: recruitment_uat_ready · full payroll module UAT · production GO · Phase 1 DONE
next_wave:
  - IDLE-OK on PAY hire ATT residual chain (no product P0/P1 open)
  - optional later (not auto-dispatch): Path B smoke; payslip formula 0₫; QA pack ack_status: format hygiene
```

## ack_status

PASS_TO_PM
