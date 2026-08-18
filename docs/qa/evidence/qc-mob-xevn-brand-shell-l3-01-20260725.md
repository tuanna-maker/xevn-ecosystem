# QC Gate — QC-MOB-XEVN-BRAND-SHELL-L3-01 (2026-07-25)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-MOB-XEVN-BRAND-SHELL-L3-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-25` (ICT ~18:17) |
| **program** | `XEVN-BRAND-FULL-FE-REMASTER` — mobile **L3m shell** only |
| **ack_status** | **PASS_TO_PM** |
| **gate_verdict** | **GO WITH CONDITIONS** |
| **scope** | Mobile brand **L3 shell** (login / splash / scope chrome + tab / stub modals / AppScreenLayout error banner) — **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** L4c ESS / all-screens remaster |
| **U65** | zero-seed — static + vitest only; **no** `pnpm seed:*`; QC did **not** edit `apps/**` |
| **PORTAL_DEV_URL** | N/A — mobile static theme DNA gate (no portal browser mutate) |
| **api_base** | Deferred — device visual after release APK (`qa-device`); pilot reference `https://14-225-217-232.nip.io` N/A this slice |
| **runtime_SoT** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` (**Accepted**) §4.1 brandShell / primary / border · §4.2 radius card/modal |
| **prior_qc** | L1+L2 GWC — `docs/qa/evidence/qc-mob-xevn-brand-l1-l2-01-20260725.md` |
| **evidence_path** | `docs/qa/evidence/qc-mob-xevn-brand-shell-l3-01-20260725.md` |

---

## Scope (bounded — L3m shell)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| SplashIntro `brandShell` + `splashGlow` | Phase1 / PROD DONE claim |
| BrandedLoginCard `radius.card` + `borderWidth.hairline` + `colors.border` | L4c ESS domain cards / all inventory |
| LoginScreen input/devBox `borderWidth.thin` + XevnLogo + BrandedLoginCard | Claiming device APK visual PASS without `qa-device` |
| ScopeScreen AppScreenLayout + SurfaceCard + text tokens | Full remaster / typography L-TYPE wave |
| RootNavigator tab thin border + primary tint | Seed |
| AppScreenLayout errorBanner thin + card radius | QC code edits `apps/**` |
| Phase2StubModal + ChatStubModal modal DNA | Promoting L4c without sponsor |
| Independent vitest L3+L2+tokens **28/28** | |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/mob-xevn-brand-shell-l3-01-20260722.md` | Dev-Mobile | `READY_FOR_QA` — shell wire + `mobL3Shell.test.ts` · vitest **28/28** |
| `docs/qa/evidence/qa-mob-xevn-brand-shell-l3-01-20260722.md` | QA | `PASS_TO_PM` **PASS** — micro 9/9 · vitest **28/28** independent |
| `docs/qa/evidence/qc-mob-xevn-brand-l1-l2-01-20260725.md` | QC prior | **GWC** L1m+L2m · C1 device defer · noted L3 QA PASS not closed |
| ADR Sharp Ops §4.1–4.2 | SA SoT | brandShell `#000000` · primary `#1E40AF` · radius card/modal 12 · border `#E5E7EB` |

**QA pack Layer-B note:** `verify:qc:evidence-pack` on raw QA L3 MD fails **portal_url** (static theme template gap) — **PROCESS-P3**, not product FAIL. This QC pack is the consolidated SoT for GO/GWC.

---

## Micro-checklist (QC independent)

| # | Exit criteria | QC method | Observed | Result |
|---|---------------|-----------|----------|--------|
| **L3-1** | SplashIntro → `colors.brandShell` + `colors.splashGlow` | Grep StyleSheet | L121 brandShell; L135 splashGlow; no ad-hoc `#000000` in styles | **PASS** |
| **L3-2** | BrandedLoginCard → card + hairline + border | Grep StyleSheet | L43 `radius.card`; L49–50 hairline + `colors.border` | **PASS** |
| **L3-3** | LoginScreen → thin border + logo + card | Grep | imports L30–31; XevnLogo L172; BrandedLoginCard L179; input/devBox thin L319/L345 | **PASS** |
| **L3-4** | ScopeScreen → AppScreenLayout + SurfaceCard + text | Grep | L147 layout; L154 SurfaceCard; L256–268 text/textSecondary | **PASS** |
| **L3-5** | RootNavigator tab → thin + border + primary | Grep | L346 primary; L362–364 border + thin | **PASS** |
| **L3-6** | AppScreenLayout errorBanner → thin + card | Grep | L263–264 radius.card + borderWidth.thin | **PASS** |
| **L3-7** | Phase2 + Chat stub modals → modal DNA | Grep | Phase2 L62–64; Chat L56–58 modal+thin+border | **PASS** |
| **L3-8** | Vitest L3+L2+tokens | Re-run | **28/28** exit **0** (2026-07-25 ~18:15 ICT) | **PASS** |
| **U65** | No seed / no Phase1-PROD / no L4c claim | Audit packs | Absent in Dev+QA+QC | **PASS** |
| **GWC** | Device APK visual deferred | Adjudication | Product L3 PASS; device = **condition C1** (same class as L1+L2) | **GWC** |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC finding |
|--------|-------|------------|
| Splash / login card / scope / tab / error banner / stub modals token DNA | **PRODUCT** | **PASS** |
| vitest mobL3Shell 9 + L2 8 + tokens 11 = 28 | **PRODUCT** | **PASS** |
| Device / APK visual smoke (splash cold-start + login chrome + scope) | **PRODUCT-P1 residual** | **Condition OK** — deferred until release APK → `qa-device` |
| Domain cards literal border (HomeActionCard, …) | **OUT OF SLICE** | L4c `MOB-XEVN-BRAND-SCREENS-ESS-01` — not L3 blocker |
| Portal `:5175` / HRM stack | **ENV N/A** | Static mobile theme; no portal UF this gate |
| Seed | **PROCESS U65** | **PASS** — none |
| Phase1 / PROD / L4c / full remaster DONE | **OUT OF SLICE** | **NOT claimed** |
| QA MD Layer-B portal_url gap | **PROCESS-P3** | Accepted — QC pack carries gate SoT |

---

## Command / probe table

| Command / probe | Result | Classification |
|-----------------|--------|----------------|
| `pnpm --filter hrm-mobile exec vitest run src/theme/__tests__/mobL3Shell.test.ts src/theme/__tests__/mobL2Primitives.test.ts src/theme/__tests__/tokens.test.ts` | **PASS** · Tests **28/28** (9+8+11) · exit **0** · 2026-07-25 ~18:15 ICT · Duration ~14.3s | PRODUCT |
| Source spot: SplashIntro brandShell/splashGlow | **PASS** | PRODUCT |
| Source spot: BrandedLoginCard card+hairline+border | **PASS** | PRODUCT |
| Source spot: LoginScreen thin + XevnLogo + BrandedLoginCard | **PASS** | PRODUCT |
| Source spot: ScopeScreen layout + SurfaceCard + text | **PASS** | PRODUCT |
| Source spot: RootNavigator tab thin/border/primary | **PASS** | PRODUCT |
| Source spot: AppScreenLayout errorBanner | **PASS** | PRODUCT |
| Source spot: Phase2StubModal + ChatStubModal modal DNA | **PASS** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-mob-xevn-brand-shell-l3-01-20260722.md` | **FAIL 1/8** portal_url (static theme QA template) | **PROCESS-P3** — not product NO-GO |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-mob-xevn-brand-shell-l3-01-20260725.md` | **PASS 8/8** · exit **0** (this QC pack) | PROCESS |

---

## L2.5 / journey coverage

| J-ID / surface | Status | Note |
|----------------|--------|------|
| **MOB L3m shell gate** (splash / login / scope chrome / tab / stub modals) | **PASS** | QC independent source + vitest |
| **J-MOB-*** device visual (splash cold-start / login / scope) | **DEFERRED** | **Condition C1** — after release APK → `qa-device` |
| Portal **J-HRM-*** / CC journeys | **N/A** | Out of mobile brand L3 shell slice |

**L2.5 note:** Wave = **theme DNA static + vitest** (U65). No J-MOB device journey executed or claimed as PASS. PM exit_criteria explicitly allows device APK visual as GWC condition (same C1 class as L1+L2).

---

## Read-only theme AC matrix (L3 shell)

| module / primitive | Read (token DNA) | Update (mutate) | Delete | QC |
|--------------------|------------------|-----------------|--------|-----|
| SplashIntro | `brandShell` + `splashGlow` | N/A theme | N/A | **PASS** |
| BrandedLoginCard | `radius.card` + `borderWidth.hairline` + `colors.border` | N/A | N/A | **PASS** |
| LoginScreen inputs / devBox | `borderWidth.thin` + logo + card | N/A | N/A | **PASS** |
| ScopeScreen chrome | AppScreenLayout + SurfaceCard + text tokens | N/A | N/A | **PASS** |
| RootNavigator tab bar | thin top border + primary tint | N/A | N/A | **PASS** |
| AppScreenLayout errorBanner | thin + `radius.card` | N/A | N/A | **PASS** |
| Phase2StubModal / ChatStubModal | `radius.modal` + thin + border | N/A | N/A | **PASS** |

---

## Prior gates (standing)

| Gate | Verdict | Relation |
|------|---------|----------|
| QC-MOB-XEVN-BRAND-L1-L2-01 | **GWC** 2026-07-25 | Foundation standing — L3 builds on L1/L2 tokens+primitives |
| QA-MOB-XEVN-BRAND-SHELL-L3-01 | **PASS** 2026-07-22 | Closed by **this** QC GWC |

---

## Residual / Conditions (GWC)

| # | Residual | Severity | Owner | Blocks L3 slice? |
|---|----------|----------|-------|------------------|
| **C1** | Device / APK visual smoke (splash cold-start + login chrome + scope) | **P1** | **qa-device** after release APK | **No** — exit_criteria condition OK (same class L1+L2 C1) |
| **C2** | L4c domain cards still literal border / hairline | P2 | `MOB-XEVN-BRAND-SCREENS-ESS-01` after sponsor priority | **No** |
| **C3** | Non-confirm `Alert.alert` system chrome | P3 | document-only | **No** |
| **C4** | QA MD Layer-B portal_url template gap | PROCESS-P3 | qa template | **No** — QC pack 8/8 |

**Explicit:** This GWC **closes mobile brand L3m shell only**. It does **not** close Phase 1 product completion, PROD-READY, L4c ESS remaster, or full monorepo remaster. Prior L1+L2 GWC remains standing.

---

## Gate verdict

### **GO WITH CONDITIONS** — mobile brand L3m shell slice

- Independent QC sample of L3 shell DNA + vitest **28/28** = **PASS**.
- Condition **C1** (device APK visual deferred) **accepted** per PM `exit_criteria` (same C1 class as L1+L2).
- L4c / all-screens **not** promoted.
- **NOT Phase 1 DONE · NOT PROD-READY · NOT full remaster / L4c ESS GO.**

---

## completion_report

- **Closed:** QC reconciled Dev+QA L3 packs; independent vitest L3+L2+tokens **28/28**; source spot splash/login/scope/tab/errorBanner/stub modals; U65 zero-seed; published this evidence; bus `qc → pm` PASS_TO_PM; formal GWC L3 closes prior L1+L2 C4 optional note.
- **Residual:** C1 device visual → qa-device after APK; C2 L4c defer sponsor; C3–C4 non-blocking.
- **Did not:** seed; claim Phase1/PROD; claim L4c / all-screens; claim device PASS; edit `apps/**`.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PM-MOB-XEVN-BRAND-L3-GWC-INTAKE-01
from_role: qc
to_role: pm
entry_criteria: QC-MOB-XEVN-BRAND-SHELL-L3-01 GO WITH CONDITIONS — docs/qa/evidence/qc-mob-xevn-brand-shell-l3-01-20260725.md
exit_criteria:
1) Bus INTAKE — mark MOB L3m shell brand DNA GWC (slice closed; L1+L2+L3 standing; NOT Phase1/PROD/L4c)
2) If release APK ready → Task qa-device visual sample splash + login chrome + scope (close C1 shared with L1+L2)
3) Do NOT dispatch MOB-XEVN-BRAND-SCREENS-ESS-01 (L4c) without sponsor priority
cấm: seed; Phase1/PROD DONE claim; L4c / all-screens remaster claim; device PASS without qa-device
evidence_path: docs/qa/evidence/qc-mob-xevn-brand-shell-l3-01-20260725.md
ack_status: DISPATCHED next wave
```

## ack_status

**PASS_TO_PM** — gate_verdict **GO WITH CONDITIONS**
