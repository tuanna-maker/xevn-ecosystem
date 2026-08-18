# QA-MOB-G-ORPH-KHOI-01 — Mobile Plane A labels (G-ORPH-MOB-01..03)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-MOB-G-ORPH-KHOI-01` |
| **date** | 2026-07-30 (ICT) |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **ack_status** | **FAIL_TO_PM** (device U65 **BLOCKED** — no fake PASS) |
| **HOLD_DEPLOY** | true · **U65** zero-seed |
| **dev_handoff** | `docs/qa/evidence/d-mob-g-orph-khoi-01-20260730.md` |
| **AC source** | `docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md` §7 |

---

## Environment trace

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `http://127.0.0.1:28001/api/hrm` **200**, XBOS **200**, portal **5173** **200** (script exit crash UV_HANDLE after assert — health OK) |
| `adb devices` | **empty** — no emulator/device |
| Expo `:8081` | not listening |
| APK | **not installed** (HOLD_DEPLOY — no qa-device rebuild in wave) |
| Mobile login API (local `:28001`, pilot `:8088`) | `ceo@xe.vn` / `Xevn@2026` → **401 HRM-AUTH-401** (cannot live-probe `GET /operating-units` body for BE Khối without auth) |

---

## Layers executed

### L0 — Stack

PASS (HRM + XBOS + portal HTTP 200 as above).

### L1 — Unit / static (not U65 UF promote)

| Command | Result |
|---------|--------|
| `pnpm exec vitest run` (4 files scoped in dev evidence) | **32/32 PASS** |
| `node scripts/verify-mobile-user-copy.mjs` | **PASS** (23 feature TSX) |
| Production fallback `PLANE_A_COMPANY_LABELS_FALLBACK` | **5 rows**, zero «Khối … X.E» strings |
| `Khối` in `src/**` outside tests | Only sanitizer `isPilotKhoiFictionLabel` + CODE-MEMORY comments — **no pilot Khối labels in fallback data** |
| `LoginScreen.tsx` | Toast uses `resolveCompanyDisplayVi` (L95 area) |

Vitest explicitly covers: API Khối fiction → Plane A (`companyDisplayVi.test.ts`), OU sanitize (`hrmOperatingUnits.test.ts`), OU subtitle (`scopeScreenCopy.test.ts`), payslip period (`payslipDisplayVi.test.ts`), aggregate **D-MOB-G-ORPH-KHOI-01** anti-Khối loop on five slugs + `main`.

### L2.5 / U65 — Device browser path (mandatory exit)

**BLOCKED** — cannot execute login → Scope → Settings → Home → Payslip on device or Expo web without:

1. Connected `adb` device/emulator, **and**
2. QA-capable APK (`BUILD_TARGET=qa-device` / deep link) or manual login on build containing D-MOB-G-ORPH-KHOI-01 (current wave: **no APK**).

**No seed, no probe-only UF 🟢 claim.**

---

## AC-MOB-LABEL-01..07 verdict matrix

| AC | Requirement | Verdict | Notes |
|----|-------------|---------|-------|
| **01** | Group CEO · Scope membership title | **NOT RUN** | Device BLOCKED |
| **02** | Settings «Phạm vi đang dùng» | **NOT RUN** | Device BLOCKED |
| **03** | Home greeting `companyLabel` | **NOT RUN** | Device BLOCKED |
| **04** | Payslip list subtitle | **NOT RUN** | Device BLOCKED |
| **05** | Login toast (multi membership) | **NOT RUN** | Device BLOCKED; static wiring OK |
| **06** | Offline / API fail fallback §4 only | **PASS (unit)** | Vitest + Plane A map; not F5 on device |
| **07** | F5 / re-open Scope stable | **NOT RUN** | Device BLOCKED |
| **AC-MOB-OU-01** | OU rows Plane A | **PARTIAL (unit)** | `normalizeOperatingUnitRows` tests; live API body **unverified** (401) |
| **AC-MOB-OU-02** | JWT/filter unchanged | **NOT RUN** | Needs device Network tab |

**Register G-ORPH-MOB-01..03:** remain **OPEN** until U65 device PASS.

---

## BE coupling (pm_dispatch_hint)

Live `GET /operating-units` Khối in response body: **UNKNOWN** (auth 401 local + pilot). Mobile client **sanitizes** Khối fiction per dev evidence — UI could still PASS if BE returns Khối. PM should dispatch **`D-HRM-EMP-COL-BE`** only after authenticated OU probe shows raw Khối in API JSON **and** sponsor wants BE SoT fix (not blocking re-test once device available if sanitizer holds).

---

## completion_report

**Closed (this wave):** L0 stack smoke; vitest **32/32**; static user-copy verify; source audit confirms Plane A fallback + resolver tests for Khối rejection; Login toast resolver wired.

**Open / residual:**

- **P0:** U65 device execution **AC-MOB-LABEL-01..05, 07** + **AC-MOB-OU-02** for `ceo@xe.vn` and member CEO (`du-lich.ceo@xe.vn` per matrix).
- **P2:** Authenticated OU API body audit (local or pilot creds).
- **HOLD_DEPLOY:** QA-device APK rebuild still required for on-device proof of D-MOB-G-ORPH-KHOI-01 bundle.

---

## next_owner

`pm` → **`qa-device`** (or `qa` with emulator + qa-device APK) when hardware/APK ready.

---

## next_dispatch_prompt

```text
work_item_id: QA-MOB-G-ORPH-KHOI-01-R1
from_role: pm
to_role: qa-device
lane: execution
entry: QA FAIL_TO_PM QA-MOB-G-ORPH-KHOI-01 — unit 32/32 PASS; device U65 BLOCKED (adb empty, HOLD_DEPLOY no APK); evidence docs/qa/evidence/qa-mob-g-orph-khoi-01-20260730.md
exit: Emulator/device + qa-device APK (EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1) OR manual login on APK containing D-MOB-G-ORPH-KHOI-01; U65 zero-seed — ceo@xe.vn / Xevn@2026 then du-lich.ceo@xe.vn: login toast → Scope (membership title + OU rows, no Khối on company-semantics) → Settings phạm vi → Home greeting → Payslip subtitle; Network JWT unchanged; F5 Scope stable; capture ui dump/screenshots; if live GET /operating-units JSON still has Khối substring dispatch hint dev-be D-HRM-EMP-COL-BE; ack_status PASS_TO_PM; evidence docs/qa/evidence/qa-mob-g-orph-khoi-01-r1-20260730.md
read_first: docs/qa/evidence/qa-mob-g-orph-khoi-01-20260730.md · docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md
cấm: seed · probe-only PASS · claim UF 🟢 without click path
```

---

## evidence_path

`docs/qa/evidence/qa-mob-g-orph-khoi-01-20260730.md`
