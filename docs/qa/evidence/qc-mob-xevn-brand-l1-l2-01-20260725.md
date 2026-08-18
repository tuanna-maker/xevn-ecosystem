# QC Gate — QC-MOB-XEVN-BRAND-L1-L2-01 (2026-07-25)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-MOB-XEVN-BRAND-L1-L2-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-25` (ICT ~18:12) |
| **program** | `XEVN-BRAND-FULL-FE-REMASTER` — mobile **L1m + L2m** only |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO WITH CONDITIONS** |
| **scope** | Mobile brand **L1 tokens + L2 core primitives** — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full ESS / all-screens remaster |
| **U65** | zero-seed — static + vitest only; **no** `pnpm seed:*`; QC did **not** edit `apps/**` |
| **PORTAL_DEV_URL** | N/A — mobile static theme DNA gate (no portal browser mutate) |
| **api_base** | Deferred — device visual after release APK (`qa-device`); pilot reference `https://14-225-217-232.nip.io` N/A this slice |
| **runtime_SoT** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` (**Accepted**) §4.1–4.2 (primary / brandShell / radius / border) |
| **evidence_path** | `docs/qa/evidence/qc-mob-xevn-brand-l1-l2-01-20260725.md` |

---

## Scope (bounded — L1m + L2m)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| L1: splash `#000000`, Android `colorPrimary` `#1E40AF`, `tokens.ts` `borderWidth` + `radius.card/input/modal` | Phase1 / PROD DONE claim |
| L2 core: ConfirmActionModal, FabPrimaryActionSheet, ElevatedCard, SurfaceCard, FormField token DNA + two ConfirmActionModal migrations | Full ESS hex sweep (L4c) · all inventory cards |
| Independent vitest re-run tokens + mobL2Primitives | Seed · QC code edits · device L2.5 promote as PASS |
| Note L3 shell QA status (informational) | Claiming L3/L4c closed by this gate |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/mob-xevn-brand-tokens-l1-01-20260722.md` | Dev-Mobile | `READY_FOR_QA` — L1 splash/primary/tokens + THEME_USAGE L2 inventory |
| `docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md` | QA | `PASS_TO_PM` **PASS** — micro 5/5 · vitest tokens **11/11** |
| `docs/qa/evidence/mob-xevn-brand-primitives-l2-01-20260722.md` | Dev-Mobile | `READY_FOR_QA` — core L2 wire + ConfirmActionModal migrations · vitest **25/25** |
| `docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md` | QA | `PASS_TO_PM` **PASS** — micro 9/9 · vitest **25/25** independent |
| `docs/qa/evidence/qa-mob-xevn-brand-shell-l3-01-20260722.md` | QA (note) | L3 shell **PASS** already on file (vitest **28/28**) — **out of this QC close**; residual R-L4c + R-DEV |
| ADR Sharp Ops §4.1–4.2 | SA SoT | primary `#1E40AF` · brandShell `#000000` · radius input 8 / card 12 · border `#E5E7EB` |

**QA pack Layer-B note:** `verify:qc:evidence-pack` on raw QA L1/L2 MDs fails portal_url / journey checks (static theme template gap) — **PROCESS-P3**, not product FAIL. This QC pack is the consolidated SoT for GO/GWC.

---

## Micro-checklist (QC independent)

| # | Exit criteria | QC method | Observed | Result |
|---|---------------|-----------|----------|--------|
| **L1-1** | Android splash `#000000` + `colorPrimary` `#1E40AF` | Read `colors.xml` | splash/iconBackground `#000000`; colorPrimary / notification `#1E40AF`; colorPrimaryDark `#1E3A8A` | **PASS** |
| **L1-2** | `tokens.ts` radius + borderWidth locks | Read `tokens.ts` | `radius.input=8` · `card/modal=12` · `borderWidth` hairline/thin/focus · `primary=#1E40AF` · `brandShell=#000000` | **PASS** |
| **L1-3** | Vitest tokens | Re-run | **11/11** exit **0** (2026-07-25) | **PASS** |
| **L2-1** | ConfirmActionModal DNA | Spot StyleSheet | `radius.modal` + `borderWidth.thin` + `colors.border` (L101–105) | **PASS** |
| **L2-2** | ElevatedCard DNA | Spot StyleSheet | `radius.card` + `borderWidth.hairline` (L61–62) | **PASS** |
| **L2-3** | Vitest L2 primitives | Re-run | **8/8** exit **0** (2026-07-25) | **PASS** |
| **U65** | No seed / no Phase1-PROD / no all-screens claim | Audit packs | Absent in Dev+QA+QC | **PASS** |
| **GWC** | Device APK visual deferred | Adjudication | Product L1+L2 PASS; device = **condition C1** | **GWC** |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC finding |
|--------|-------|------------|
| Splash / colorPrimary / tokens radius+borderWidth | **PRODUCT** | **PASS** |
| Core L2 primitive StyleSheets consume tokens | **PRODUCT** | **PASS** |
| vitest tokens 11 + mobL2Primitives 8 | **PRODUCT** | **PASS** |
| Device / APK visual smoke (ConfirmActionModal + Fab sheet + splash cold-start) | **PRODUCT-P1 residual** | **Condition OK** — deferred until release APK → `qa-device` |
| Domain cards literal border (HomeActionCard, …) | **OUT OF SLICE** | L4c `MOB-XEVN-BRAND-SCREENS-ESS-01` — not L1/L2 blocker |
| Portal `:5175` / HRM stack | **ENV N/A** | Static mobile theme; no portal UF this gate |
| Seed | **PROCESS U65** | **PASS** — none |
| Phase1 / PROD / full remaster DONE | **OUT OF SLICE** | **NOT claimed** |
| QA MD Layer-B portal/journey gaps | **PROCESS-P3** | Accepted — QC pack carries gate SoT |

---

## Command / probe table

| Command / probe | Result | Classification |
|-----------------|--------|----------------|
| `pnpm --filter hrm-mobile exec vitest run src/theme/__tests__/tokens.test.ts src/theme/__tests__/mobL2Primitives.test.ts` | **PASS** · Tests **19/19** (11+8) · exit **0** · 2026-07-25 ~18:11 ICT | PRODUCT |
| Source spot: `android/.../values/colors.xml` splash `#000000` · colorPrimary `#1E40AF` | **PASS** | PRODUCT |
| Source spot: `tokens.ts` radius + borderWidth + brandShell/primary | **PASS** | PRODUCT |
| Source spot: `ConfirmActionModal.tsx` L101–105 modal/thin/border | **PASS** | PRODUCT |
| Source spot: `ElevatedCard.tsx` L61–62 card/hairline | **PASS** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-mob-xevn-brand-tokens-l1-01-20260722.md` | **FAIL 2/8** portal_url + journey_l25 (static theme QA template) | **PROCESS-P3** — not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-mob-xevn-brand-primitives-l2-01-20260722.md` | **FAIL 1/8** portal_url | **PROCESS-P3** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-mob-xevn-brand-l1-l2-01-20260725.md` | **PASS 8/8** · exit **0** (this QC pack) | PROCESS |

---

## L2.5 / journey coverage

| J-ID / surface | Status | Note |
|----------------|--------|------|
| **MOB L1m token gate** (splash + primary + radius/borderWidth) | **PASS** | QC independent source + vitest |
| **MOB L2m primitive gate** (modal/card/input DNA) | **PASS** | QC independent source + vitest |
| **J-MOB-*** device visual (splash cold-start / confirm modal / Fab sheet) | **DEFERRED** | **Condition C1** — after release APK → `qa-device` |
| Portal **J-HRM-*** / CC journeys | **N/A** | Out of mobile brand L1/L2 slice |

**L2.5 note:** Wave = **theme DNA static + vitest** (U65). No J-MOB device journey executed or claimed as PASS. PM exit_criteria explicitly allows device APK visual as GWC condition.

---

## Read-only theme AC matrix (L1 + L2 core)

| module / primitive | Read (token DNA) | Update (mutate) | Delete | QC |
|--------------------|------------------|-----------------|--------|-----|
| Android splash / Material primary | `#000000` / `#1E40AF` | N/A theme | N/A | **PASS** |
| `tokens.ts` radius + borderWidth | input 8 · card/modal 12 · thin/hairline/focus | N/A | N/A | **PASS** |
| ConfirmActionModal | `radius.modal` + `borderWidth.thin` + `colors.border` | N/A | N/A | **PASS** |
| FabPrimaryActionSheet | modal + thin + border (QA audited) | N/A | N/A | **PASS** (QA concur) |
| ElevatedCard | `radius.card` + `borderWidth.hairline` | N/A | N/A | **PASS** |
| SurfaceCard / FormField | card/input + thin/focus (QA audited) | N/A | N/A | **PASS** (QA concur) |
| Avatar remove / Leave cancel confirm | ConfirmActionModal path | N/A | N/A | **PASS** (QA concur) |

---

## L3 shell status (informational — not closed by this gate)

| Item | Status |
|------|--------|
| `QA-MOB-XEVN-BRAND-SHELL-L3-01` | **QA PASS** on file `qa-mob-xevn-brand-shell-l3-01-20260722.md` (vitest 28/28) |
| QC close for L3 | **Not this work_item** — optional follow-up `QC-MOB-XEVN-BRAND-SHELL-L3-01` if PM wants formal GWC |
| L4c ESS domain cards | **Deferred** until sponsor priority (`MOB-XEVN-BRAND-SCREENS-ESS-01`) |

---

## Residual / Conditions (GWC)

| # | Residual | Severity | Owner | Blocks L1+L2 slice? |
|---|----------|----------|-------|---------------------|
| **C1** | Device / APK visual smoke (splash cold-start + ConfirmActionModal + Fab sheet) | **P1** | **qa-device** after release APK | **No** — exit_criteria condition OK |
| **C2** | L4c domain cards still literal border / hairline | P2 | `MOB-XEVN-BRAND-SCREENS-ESS-01` after sponsor priority | **No** |
| **C3** | Non-confirm `Alert.alert` system chrome | P3 | document-only | **No** |
| **C4** | Formal QC pack for L3 shell (QA already PASS) | P3 optional | pm → qc if needed | **No** |
| **C5** | QA MD Layer-B portal/journey template gaps | PROCESS-P3 | qa template | **No** — QC pack 8/8 |

**Explicit:** This GWC **closes mobile brand L1m tokens + L2m core primitives only**. It does **not** close Phase 1 product completion, PROD-READY, L4c ESS remaster, or full monorepo remaster.

---

## Gate verdict

### **GO WITH CONDITIONS** — mobile brand L1m + L2m slice

- Independent QC sample of L1 locks + L2 core DNA + vitest **19/19** = **PASS**.
- Condition **C1** (device APK visual deferred) **accepted** per PM `exit_criteria`.
- L3 shell noted as QA PASS (separate) — **not** promoted by this gate.
- **NOT Phase 1 DONE · NOT PROD-READY · NOT full remaster / all-screens GO.**

---

## completion_report

- **Closed:** QC reconciled Dev+QA L1/L2 packs; independent vitest tokens+L2 **19/19**; source spot splash/primary/tokens/ConfirmActionModal/ElevatedCard; U65 zero-seed; published this evidence; bus `qc → pm` PASS_TO_PM.
- **Residual:** C1 device visual → qa-device after APK; C2 L4c defer; C3–C5 non-blocking; L3 QC optional.
- **Did not:** seed; claim Phase1/PROD; claim all-screens remaster; edit `apps/**`.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-MOB-XEVN-BRAND-L1-L2-GWC-INTAKE-01
from_role: qc
to_role: pm
entry_criteria: QC-MOB-XEVN-BRAND-L1-L2-01 GO WITH CONDITIONS — docs/qa/evidence/qc-mob-xevn-brand-l1-l2-01-20260725.md
exit_criteria:
1) Bus INTAKE — mark MOB L1m+L2m brand DNA GWC (slice closed; NOT Phase1/PROD/full remaster)
2) Optional: Task qc QC-MOB-XEVN-BRAND-SHELL-L3-01 to formally GWC L3 (QA already PASS) OR skip if backlog priority elsewhere
3) If release APK ready → Task qa-device visual sample splash + ConfirmActionModal + Fab sheet (close C1)
4) Do NOT dispatch MOB-XEVN-BRAND-SCREENS-ESS-01 (L4c) without sponsor priority
cấm: seed; Phase1/PROD DONE claim; all-screens remaster claim
evidence_path: docs/qa/evidence/qc-mob-xevn-brand-l1-l2-01-20260725.md
ack_status: DISPATCHED next wave
```

## ack_status

**PASS_TO_PM** — gate_verdict **GO WITH CONDITIONS**
