# QC Gate — XEVN-THM-QC-MOB-W2-01 (2026-07-22)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QC-MOB-W2-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-22` (ICT ~22:20–22:30) |
| **program** | `P1-XEVN-THEME-REMASTER` |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO WITH CONDITIONS** |
| **scope** | P0 mobile theme slice MOB-W2 ONLY — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** full remaster DONE |
| **entry** | `XEVN-THM-MOB-W2-QA` PASS_TO_PM · `docs/qa/evidence/xevn-thm-mob-w2-qa-20260722.md` (+ Dev `xevn-thm-mob-w2-20260722.md`) |
| **runtime_SoT** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` (**Accepted**) §4.1–4.4 |
| **inventory** | `docs/program/XEVN_THEME_SCREEN_INVENTORY.md` §3 MOB-W2 |
| **U65** | zero-seed — static + vitest only; **no** `pnpm seed:*`; QC did **not** edit `apps/**` |
| **PORTAL_DEV_URL** | N/A — mobile static theme gate (no portal browser mutate) |
| **api_base** | Deferred — device visual after release APK (`qa-device`) |

---

## Scope (bounded — MOB-W2 P0 theme)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Sample audit 5 P0 exit criteria (UndoSnackbar, P0 screens, logo, PrimaryButton ≥44, GWC) | Phase1 / PROD DONE claim |
| Independent source + vitest re-run + logo SHA | Seed · API mutate · QC code edits |
| Accept device visual as **condition OK** until APK | Full `pnpm test:hrm-mobile` expand · J-MOB device L2.5 promote |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/xevn-thm-mob-w2-20260722.md` | Dev-Mobile | `READY_FOR_QA` — inventory remaster + UndoSnackbar → `colors.text` |
| `docs/qa/evidence/xevn-thm-mob-w2-qa-20260722.md` | QA | `PASS_TO_PM` **PASS** — E1–E5 + vitest 15/15 |
| ADR Sharp Ops §4.1–4.4 | SA SoT | text `#111827` · secondary `#4B5563` · muted placeholders only · touch ≥44 |

---

## Micro-checklist (≤5 exit_criteria)

| # | Exit criteria | QC method | Observed | Result |
|---|---------------|-----------|----------|--------|
| **1** | UndoSnackbar = `colors.text` (≠ `#1F2937`) | Read `UndoSnackbar.tsx` L81 | `backgroundColor: colors.text`; CODE-MEMORY ban Gray-800; vitest ban assert | **PASS** |
| **2** | P0 screens sharp tokens per ADR | Spot StyleSheets + tokens | `colors.text`=`#111827`; Login/Scope/Home/Leave/Approvals/Payslip use `text`/`textSecondary`/`textMuted` placeholders; no pale hex assigns on those surfaces | **PASS** |
| **3** | Splash/login XevnLogo = master (no UNICOM) | SHA256 + source | Login `<XevnLogo>`; Splash `assets/xevn-logo.png`; SHA = master `E1763A9D…836A3D`; 0 UNICOM in `src/` | **PASS** |
| **4** | Touch ≥44 on PrimaryButton | Read `PrimaryButton.tsx` + tokens | `md.minHeight: layout.primaryButtonHeight` (**48** ≥44) | **PASS** |
| **5** | GO / GWC — device visual deferred OK | Adjudication | All product P0 PASS; device matrix = **condition C1** | **GWC** |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC finding |
|--------|-------|------------|
| UndoSnackbar fill `colors.text` | **PRODUCT** | **PASS** |
| P0 readable text tokens ADR §4.1 | **PRODUCT** | **PASS** |
| Logo SHA = master; no UNICOM | **PRODUCT** | **PASS** |
| PrimaryButton minHeight 48 | **PRODUCT** | **PASS** |
| Device visual / J-MOB on emulator | **PRODUCT-P1 residual** | **Condition OK** — deferred until release APK (PM exit_criteria) |
| Portal `:5175` / stack | **ENV N/A** | Static mobile theme; no portal UF this gate |
| Seed | **PROCESS U65** | **PASS** — none |
| Phase1 / PROD / full remaster DONE | **OUT OF SLICE** | **NOT claimed** |

---

## Command / probe table

| Command / probe | Result | Classification |
|-----------------|--------|----------------|
| `pnpm exec vitest run src/theme/__tests__/mobW2Remaster.test.ts src/theme/__tests__/tokens.test.ts src/theme/__tests__/Theme.test.ts` (cwd `apps/mobile/hrm-mobile`) | **PASS** · Tests **15/15** · exit **0** · 2026-07-22 ~22:20 | PRODUCT |
| SHA256 `apps/mobile/hrm-mobile/assets/xevn-logo.png` vs `assets/brand/xevn-logo-master.png` | Both `E1763A9D613B1BFF7421DC96504137240131C75C04D7D62BABD7E5E862836A3D` · **PASS** | PRODUCT |
| Source spot: `UndoSnackbar.tsx` L81 `backgroundColor: colors.text` | **PASS** | PRODUCT |
| Source spot: `PrimaryButton` md → `layout.primaryButtonHeight` = **48** | **PASS** | PRODUCT |
| Source spot: Login `XevnLogo` · Splash `require(...xevn-logo.png)` | **PASS** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xevn-thm-mob-w2-qa-20260722.md` | **FAIL 2/8** — missing `command_table` / `portal_url` (static theme; no portal CRUD) | **PROCESS-P3** — not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/xevn-thm-qc-mob-w2-01-20260722.md` | **PASS 8/8** · exit **0** (this QC pack) | PROCESS |

---

## L2.5 / journey coverage

| J-ID / surface | Status | Note |
|----------------|--------|------|
| **MOB-W2 theme token gate** (static inventory P0) | **PASS** | QC independent source + vitest |
| **J-MOB-*** device visual (login/home/leave/approvals sample) | **DEFERRED** | **Condition C1** — after release APK → `qa-device` |
| Portal **J-HRM-*** / CC journeys | **N/A** | Out of mobile theme slice |

**L2.5 note:** This gate is **token remaster sample**, not device L2.5 promote. PM exit_criteria explicitly allows device visual deferred.

---

## Read-only theme AC matrix (P0 screens)

| screen_id / module | Read (token) | Update (mutate) | Delete | QC |
|--------------------|--------------|-----------------|--------|-----|
| MOB-LOGIN | `colors.text` + `XevnLogo` | N/A theme | N/A | **PASS** |
| MOB-SCOPE | `text` / `textSecondary` | N/A | N/A | **PASS** |
| MOB-HOME | `text` / `textSecondary` | N/A | N/A | **PASS** |
| MOB-LEAVE-* | tokens + chip ≥44 | N/A | N/A | **PASS** |
| MOB-APPR | `text` + placeholder `textMuted` | N/A | N/A | **PASS** |
| MOB-PAY-LIST | `text` / `textSecondary` | N/A | N/A | **PASS** |
| Shared UndoSnackbar | fill `colors.text` · touch 44 | N/A | N/A | **PASS** |
| Shared PrimaryButton | minHeight **48** | N/A | N/A | **PASS** |

---

## Residual / Conditions (GWC)

| # | Residual | Severity | Owner | Blocks MOB-W2 P0 theme? |
|---|----------|----------|-------|-------------------------|
| **C1** | Device visual matrix (J-MOB sample on emulator/device) | **P1** | **qa-device** after release APK | **No** — exit_criteria condition OK |
| **C2** | Fresh release APK for theme smoke | P1 | devops / dev-mobile | No for static gate |
| **C3** | Full `pnpm test:hrm-mobile` beyond theme gate | P2 | qa optional | No |
| **C4** | DNA leave-type accent hex (chip icons) | P2 cosmetic | defer | No — text still tokens |
| **C5** | QA MD may fail Layer-B portal/CRUD checks | PROCESS-P3 | qa template | No — QC pack 8/8 |

**Explicit:** This GWC **closes P0 MOB-W2 theme remaster sample only**. It does **not** close Phase 1 product completion, PROD-READY, or full monorepo remaster.

---

## Gate verdict

### **GO WITH CONDITIONS** — P0 mobile theme MOB-W2 slice

- Independent QC sample of exit_criteria **1–4** = **PASS**.
- Condition **C1** (device visual deferred until release APK) **accepted** per PM `exit_criteria`.
- **NOT Phase 1 DONE · NOT PROD-READY · NOT full remaster GO.**

---

## completion_report

- **Closed:** QC sample audit on MOB-W2 theme P0 (UndoSnackbar `colors.text`, ADR sharp tokens on P0 screens, master logo SHA, PrimaryButton ≥44, vitest 15/15 re-run).
- **Residual:** C1 device visual → qa-device after APK; C2 APK build; C3–C5 non-blocking.
- **Did not:** seed; claim Phase1/PROD; edit `apps/**`.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: XEVN-THM-PM-INTAKE-MOB-W2-GWC-01
from_role: qc
to_role: pm
entry_criteria: XEVN-THM-QC-MOB-W2-01 GO WITH CONDITIONS — docs/qa/evidence/xevn-thm-qc-mob-w2-01-20260722.md
exit_criteria:
1) Bus INTAKE + update TEAM_WORKING_NOW / theme program status — MOB-W2 P0 theme GWC (slice closed; NOT Phase1/PROD)
2) If release APK path ready → Task qa-device visual sample login/home/leave/approvals (close C1)
3) Else continue open FE theme waves (XEVN-THM-FE-W1 / inventory) — do NOT claim full remaster DONE
cấm: seed; Phase1 DONE claim; reopen MOB-W2 token P0 without regression evidence
evidence_path: docs/program/AGENT_MESSAGE_BUS.md (append) + docs/program/TEAM_WORKING_NOW.md
ack_status: DISPATCHED next wave
```

## ack_status

**PASS_TO_PM** — gate_verdict **GO WITH CONDITIONS**
