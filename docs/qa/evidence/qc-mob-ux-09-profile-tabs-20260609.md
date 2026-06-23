# MOB-UX-09-PROFILE-TABS-QC — Profile segmented tabs (J-MOB-17) device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-09-PROFILE-TABS-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-09-PROFILE-TABS** / **J-MOB-17** profile segmented tabs **device promotable** @ nip.io emulator |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — MOB-UX-09 / J-MOB-17 slice)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-17** Tab **Thêm** → **Hồ sơ** → segmented **Thông tin / Công việc / Tài liệu** | Phase 1 DONE / `verify:product:completion` program exit |
| Grouped sections per tab (avatar, contact, job, documents) | PROD cutover / store release |
| Display sanitization — no raw ISO dates / seed codes (`engineer`, `active`) | Web portal J-HRM-* browser |
| **J-AVT-02** avatar picker regression on Thông tin tab | Root tab IA relabel (Phiếu lương) — separate backlog |
| **J-MOB-30** team directory regression smoke | Manager persona task card depth |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io | Physical device matrix beyond emulator-5554 |
| ZenHR Z-P06 SET E profile pattern | Documents row → PayslipDetail deep link (optional polish) |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev-mobile | [`mob-ux-09-profile-tabs-20260609.md`](mob-ux-09-profile-tabs-20260609.md) | READY_FOR_QA — vitest **258/258**; `ProfileScreen` segmented tabs |
| QA-device | [`mob-ux-09-profile-tabs-qa-20260609.md`](mob-ux-09-profile-tabs-qa-20260609.md) | PASS_TO_PM — L2.5 device @ nip.io |
| Machine JSON | [`mob-ux-09-profile-tabs-qa-20260609.json`](mob-ux-09-profile-tabs-qa-20260609.json) | `verdict: PASS`; all `profile_tabs` booleans true |
| UI dumps | [`mob-ux-09-profile-tabs-screens/`](mob-ux-09-profile-tabs-screens/) (9 XML) | QC spot-audit |
| Spec | [`MOBILE_HRM_ESS_UX_BENCHMARK.md`](../../program/MOBILE_HRM_ESS_UX_BENCHMARK.md) §7 SET E · Z-P06 · J-MOB-17 | Delta aligned |

**APK lineage:** `hrm-mobile-qa-device.apk` · **68,862,131 B** · SHA-256 `667E4E9B009B91E499FA8A0565D1AE3D88EA031BDE6D09DAA0AEEF766D761D8B`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-ux-09-profile-tabs-qa-20260609.md
# exit 1 — 7/8 checks (2026-06-09 QC audit)
# FAIL: work_item_id (table uses `| work_item_id |` not `**work_item_id** |` colon form)
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile-device slice class as [`qc-mob-ux-08-team-20260609.md`](qc-mob-ux-08-team-20260609.md) and [`qc-mob-ux-10a-20260609.md`](qc-mob-ux-10a-20260609.md):

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` | **Format** — table row present; verifier expects `**work_item_id** \|` or `work_item_id:` colon form |

Material pack present: J-MOB-17 primary matrix, J-* regression table, machine JSON booleans, 9 XML dumps, `## Residual` section, valid handoff block — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + qa-device APK SHA `667E4E9B…` | ENV | **PASS** |
| `adb pm clear` + install + SHA verify | ENV / L2.5 | **PASS** |
| nip.io pilot session UUID `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` (≠ `main`) | ENV / scope | **PASS** |
| Deep-link login `uat.nv0001@xe.vn` | ENV / L2.5 | **PASS** |
| **J-MOB-17-NAV** Thêm → Hồ sơ | PRODUCT / L2.5 | **PASS** — JSON `profile_nav: true` |
| **J-MOB-17-TABS** segmented Thông tin / Công việc / Tài liệu | PRODUCT / L2.5 | **PASS** — `profile-screen-main.xml`, `profile-tab-*.xml`; JSON `hasTabBar=true` `tabsVisible=true` |
| **J-MOB-17-INFO** avatar + Liên hệ + Cập nhật hồ sơ | PRODUCT / L2.5 | **PASS** — `profile-tab-info.xml`; JSON `infoTab.pass=true` |
| **J-MOB-17-WORK** job sections; no raw codes | PRODUCT / L2.5 | **PASS** — `profile-tab-work.xml`; JSON `workTab.pass=true` `noRaw=true` |
| **J-MOB-17-DOCS** payslip/contract or empty; no ISO | PRODUCT / L2.5 | **PASS** — `profile-tab-documents.xml`; JSON `docTab.pass=true` `noIso=true` |
| **J-AVT-02** avatar picker opens native gallery | PRODUCT / L2.5 | **PASS** — `avt-reg-picker.xml`; JSON `j_avt_02.pass=true` |
| **J-MOB-30** team directory regression | PRODUCT / L2.5 | **PASS** — `team-reg-directory.xml`; JSON `j_mob_30.pass=true` |
| `fatal_logcat` | Stability | **PASS** — `false` |
| Vitest **258/258** (dev handoff) | Regression | **PASS** |

**Product NO-GO avoided:** Primary J-MOB-17 segmented profile tabs and in-scope regression device-verified with JSON + XML corroboration.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — MOB-UX-09 wave

| Journey | Requirement | QA | XML / JSON | QC verdict |
|---------|-------------|-----|------------|------------|
| **J-MOB-17** | Hồ sơ → 3 segmented tabs; grouped content; sanitized labels/dates | PASS | `profile-screen-main.xml`, `profile-tab-info.xml`, `profile-tab-work.xml`, `profile-tab-documents.xml` | **PASS — device CLOSED** |

### Regression (MOB-UX-09 build)

| Journey | QA | QC ruling |
|---------|-----|-----------|
| **J-AVT-02** | PASS | **PASS — reaffirmed** avatar picker on Thông tin tab |
| **J-MOB-30** | PASS | **PASS — reaffirmed** team directory tab smoke |

---

## Defect / condition adjudication

| ID | Severity | Class | State | QC ruling |
|----|----------|-------|-------|-----------|
| **D-MOB-UX09-IA-01** | P2 UX | PRODUCT | OPEN backlog | **CARRY** — root tab IA Phiếu lương relabel; out of MOB-UX-09 slice |
| **R-MOB-UX09-01** | INFO | UX polish | OPEN optional | **ACCEPTED** — documents rows display-only; PayslipDetail deep link deferred |
| **R-MOB-UX09-02** | INFO | Persona | OPEN | **ACCEPTED** — `uat.nv0001` employee slice primary; manager task card future QA |
| **C-W8QC-PACK-02** | Process | Format | OPEN | **CARRY** — `work_item_id` table format vs verifier |

No P0/P1 product blockers for MOB-UX-09 profile tabs promotion.

---

## Journey map sync

`PROGRAM_JOURNEY_MAP.md` row **J-MOB-17** added/updated:

- **J-MOB-17** — Profile Hồ sơ segmented tabs **✅ device CLOSED** MOB-UX-09

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **MOB-UX-09-PROFILE-TABS promotable** nip.io emulator |
| **GO (scoped)** | **J-MOB-17** profile segmented tabs **device CLOSED** |
| | **J-AVT-02** + **J-MOB-30** regression **reaffirmed PASS** |
| **CARRY** | **D-MOB-UX09-IA-01** root tab IA · **R-MOB-UX09-01/02** polish/persona · **C-W8QC-PACK-02** |
| | **NOT Phase 1 DONE** / **NOT PROD** |

---

## Residual (program — outside MOB-UX-09 wave)

| ID | Owner | Trigger |
|----|-------|---------|
| **D-MOB-UX09-IA-01** | dev-mobile | PM scopes root tab Phiếu lương relabel |
| **R-MOB-UX09-01** | dev-mobile | Optional PayslipDetail deep link from Tài liệu rows |
| **R-MOB-UX09-02** | qa-device | Manager persona task card validation |
| **C-W8QC-PACK-02** | qa-device | Next mobile wave — pack `work_item_id` format normalization |

---

## Handoff

**completion_report:** MOB-UX-09-PROFILE-TABS-QC **GO WITH CONDITIONS (reduced)**. Audited QA-device chain + dev handoff. Pack verify **7/8** process-only (`work_item_id` format). JSON/ XML spot-audit confirms J-MOB-17 segmented profile tabs (Thông tin/Công việc/Tài liệu), display sanitization, J-AVT-02 avatar picker, J-MOB-30 regression — all PASS @ nip.io emulator-5554 APK `667E4E9B…`. **J-MOB-17 device CLOSED** — MOB-UX-09 profile tabs slice closed. Journey map J-MOB-17 promoted ✅.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake MOB-UX-09-PROFILE-TABS-QC PASS_TO_PM (GO WITH CONDITIONS reduced).

Closed: J-MOB-17 profile segmented tabs device CLOSED @ nip.io — evidence docs/qa/evidence/qc-mob-ux-09-profile-tabs-20260609.md. MOB-UX-09-PROFILE-TABS slice complete.

Mark MOB-UX-09-PROFILE-TABS [x] in sprint backlog / PHASE1_PRODUCT_COMPLETION_TODO if listed.

Journey map J-MOB-17 row updated ✅ device CLOSED.

Next wave per pm:scan:backlog priority:
1) D-MOB-UX09-IA-01 root tab IA relabel if PM scopes MOB-UX-09 ext.
2) MOB-UX-11d / remaining ZenHR polish (J-MOB-31..35) if open.
3) Program gates: verify:product:completion, QC S5 — NOT Phase 1 DONE / NOT PROD.
```

**evidence_path:** `docs/qa/evidence/qc-mob-ux-09-profile-tabs-20260609.md`

**ack_status:** `PASS_TO_PM`
