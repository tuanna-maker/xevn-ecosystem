# Evidence — R-SPINE-AT-NAV-01-QC

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-AT-NAV-01-QC` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | L3 gate — AT-01 **nav-only** (CreateUpdateRequest discoverability) |
| **priority** | P2 |
| **api_base** | `http://10.0.2.2:28001` (emulator → host `http://127.0.0.1:28001`) |
| **device** | `emulator-5554` · package `vn.xevn.hrm.mobile` |
| **APK SHA256** | `ab93da36b9b44776764268f994873ffb2e77a1e1f2b9c1701610c5a65433f5ab` |
| **lastUpdateTime** | `2026-08-03 22:18:23` (QA recorded) |
| **persona** | `uat.nv0001@xe.vn` · company holding UUID `10000000-0000-4000-8000-000000000001` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `r-spine-at-nav-01-qa.md` PASS_TO_PM · test-log md+json · Dev READY `r-spine-at-nav-01.md` |
| **spec_ref** | AT-01 HDSD nav · prior BLOCKED `po-e2e-spine-02-03-mob-qa-w1.md` § AT-01 · CreateUpdateRequest |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | SPINE-03 submit/approve UAT · product UAT DONE · Phase 1 DONE · PROD-READY |

---

## Verdict summary

**GO WITH CONDITIONS** — L3 QC on **nav-only** AT-01 after qa-device **PASS** on fresh qa-device APK **ab93da36…33f5ab** (`lastUpdateTime=2026-08-03 22:18:23`). Independent visual spot-check confirms: FAB sheet lists **Tạo đơn nghỉ** (must_keep) + **Tạo đơn công**; Path 1/2/3 land on **Đơn công** form (Loại điều chỉnh / Lý do / **Gửi đơn**). U65 + hdsd_align + world-standard test-log **md + json** (`xevn-test-log/v1`) credible (U78).

**Conditions (allowed by PM dispatch):** **R-SPINE-AT-NAV-FAB-OVERLAP** P2 — hub «Đi muộn» under FAB z-order until scroll (seq7 fail mitigated by seq8). **NOT** full SPINE-03 submit/approve. **NOT** Phase 1 / product UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/r-spine-at-nav-01.md` | READY_FOR_QA; three HDSD entries + leave FAB must_keep | **ACCEPT** |
| `docs/qa/evidence/r-spine-at-nav-01-qa.md` | PASS_TO_PM; Path 1/2/3 🟢; U65; no submit claim | **ACCEPT** |
| `…-qa-test-log.md` | 9 chrono steps · case A/B pass · C submit skipped | **ACCEPT** (U78) |
| `…-qa-test-log.json` | `schema: xevn-test-log/v1` · U65_zero_seed true · hdsd_align true · FAB-OVERLAP incident | **ACCEPT** (U78 / OS 31) |
| Screens `docs/qa/evidence/screens/r-spine-at-nav-01-qa/` | FAB sheet · forms · hub · Settings | **ACCEPT** (spot visual) |
| APK on disk | SHA256 **AB93DA36…33F5AB** matches QA | **ACCEPT** (QC hash) |

---

## Independent spot-check (QC)

### EC1 — FAB Path 1 + must_keep leave

| Check | Result |
|-------|--------|
| Sheet | «Thao tác nhanh» · **Tạo đơn nghỉ** + **Tạo đơn công** both present |
| Screen | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/r2-fab-sheet.png` |
| Form after tap | **Đơn công** · HLD-0001 · Nguyễn Văn An · Gửi đơn |
| Screen | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/r2-p1-form.png` · `docs/qa/evidence/screens/r-spine-at-nav-01-qa/p1-create-form.png` |

**PASS** — leave FAB must_keep preserved.

### EC2 — Hub «Đi muộn» Path 2

| Check | Result |
|-------|--------|
| Hub visible | «Đi muộn» on home stats (`docs/qa/evidence/screens/r-spine-at-nav-01-qa/r2-p2-form.png` / seek frames) |
| After scroll clear FAB | Form **Đơn công** (`docs/qa/evidence/screens/r-spine-at-nav-01-qa/p2b-after.png`) |
| Overlap incident | seq7 FAIL → mitigated seq8 — residual **R-SPINE-AT-NAV-FAB-OVERLAP** P2 |

**PASS** (discoverability with scroll mitigation) — overlap = CONDITION, not NO-GO.

### EC3 — Settings «Đơn công» Path 3

| Check | Result |
|-------|--------|
| Settings | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/p3-settings.png` — Cài đặt · Phạm vi holding UUID · Hồ sơ tab |
| Form | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/p3-create-form.png` — same CreateUpdateRequest (**Đơn công** / Gửi đơn) |

**PASS** — landing form credible for Settings quick-nav path (Hồ sơ context).

### EC4 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-R-SPINE-AT-NAV-01-QA` |
| steps | **9** chronological · pass=7 · fail=1 (mitigated) · skipped=1 |
| cases | A must_keep leave **pass** · B FAB/hub/Settings **pass** · C submit **skipped** |
| hdsd_align | **true** |
| U65_zero_seed | **true** |
| apk_sha256 | `ab93da36b9b44776764268f994873ffb2e77a1e1f2b9c1701610c5a65433f5ab` |

**PASS**

### EC5 — APK integrity

| Check | Result |
|-------|--------|
| Disk SHA256 | `AB93DA36B9B44776764268F994873FFB2E77A1E1F2B9C1701610C5A65433F5AB` |
| vs QA narrative | **match** (case-insensitive) |

**PASS**

---

## L2.5 J-* / journey audit (U19)

| Journey / slice | Scope vs this QC | QC |
|-----------------|------------------|-----|
| **AT-01 nav** FAB → CreateUpdateRequest | In-scope | **PASS** |
| **AT-01 nav** hub Đi muộn → CreateUpdateRequest | In-scope (scroll clear FAB) | **PASS** |
| **AT-01 nav** Settings Đơn công → CreateUpdateRequest | In-scope | **PASS** |
| must_keep leave FAB «Tạo đơn nghỉ» | In-scope regression | **PASS** |
| SPINE-03 submit + manager approve | **Out of scope** this WI | **deferred** — not claimed |
| **J-MOB-05** Manager Duyệt | Parallel / later (MGR hierarchy) | **not reopened / not claimed** |
| J-MOB-01..04 shell | Prior CLOSED | **not reopened** |

Mandatory in-scope for this gate = **AT-01 three HDSD nav entries + leave must_keep**. Submit/approve = next wave after manager hierarchy browser.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Path 1/2/3 nav **PASS** · must_keep leave FAB **PASS** · prior AT-01 missing-entry **CLOSED** on APK ab93da36… |
| **PRODUCT (CONDITION)** | **R-SPINE-AT-NAV-FAB-OVERLAP** P2 — stats under FAB until scroll |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **1/8** missing bold `api_base`/`portal_url` — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | none blocking (login 201 recorded; emulator + host :28001 used in QA) |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote nav close.

---

## Residual

| Id | Status | Sev | Owner | Blocks AT-01 nav GO? |
|----|--------|-----|-------|----------------------|
| Prior AT-01 missing HDSD entries | **CLOSED** | — | — | No |
| **R-SPINE-AT-NAV-FAB-OVERLAP** | **OPEN — CONDITION** | P2 | dev-mobile | **No** — PM Condition OK; discoverability PASS after scroll |
| AT-01 / SPINE-03 submit+approve | OPEN OOS | — | qa-device after MGR hier | No — nav-only exit |
| **R-SPINE-MGR-HIER-01** | OPEN parallel | P0 | qa browser | No — separate WI |
| Display raw `adjust_check_in` / `STAFF` on form | OPEN OOS polish | P3 | optional FE/BE label | No — not nav AC |
| C-AT-NAV-QA-PACK-FMT | OPEN process | P3 | qa-device | No — harness note |

---

## Conditions (explicit)

1. **R-SPINE-AT-NAV-FAB-OVERLAP** — Home `attendance-stat-late` can sit under `check-in-fab`; tap may open sheet until user scrolls late above FAB. P2 polish for `dev-mobile`. Not NO-GO for nav discoverability.
2. **SPINE-03 submit/approve** remains **out of scope** — do not promote full AT-01 UAT from this GWC.
3. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from nav-only GWC.
4. Do **not** reopen closed J-MOB shell gates from this AT-NAV wave.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-at-nav-01-qa.md
→ FAIL exit 1 · 1/8 (missing portal_url / api_base bold)
```

**PROCESS GWC** — product AT-01 nav independently verified via screens + U78 log + APK SHA; does not demote nav close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-at-nav-01-qc.md
→ target EXIT 0 (8/8)
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-at-nav-01-qa.md` | **FAIL** exit **1** · **1/8** (process — portal_url/api_base) |
| PowerShell `Get-FileHash -Algorithm SHA256` on `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | **PASS** · `AB93DA36…33F5AB` matches QA |
| Disk check PNG under `docs/qa/evidence/screens/r-spine-at-nav-01-qa/` | **PASS** · full paths resolve (see Case matrix) |
| Read `r-spine-at-nav-01-qa-test-log.json` | **PASS** · schema `xevn-test-log/v1` · U65_zero_seed · hdsd_align · case A/B pass · C skipped |
| QC visual spot-check FAB leave+đơn công + CreateUpdateRequest forms | **PASS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-at-nav-01-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-at-nav-01-qc.md --check-assets` | **PASS** exit **0** (PNG full paths resolve) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **A** fail_deep / must_keep | FAB still lists «Tạo đơn nghỉ» | **PASS** | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/r2-fab-sheet.png` |
| **B** success_hdsd | FAB «Tạo đơn công» → CreateUpdateRequest | **PASS** | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/r2-p1-form.png` |
| **B** success_hdsd | Hub «Đi muộn» → CreateUpdateRequest | **PASS** (after scroll) | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/p2b-after.png` |
| **B** success_hdsd | Settings «Đơn công» → CreateUpdateRequest | **PASS** | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/p3-create-form.png` |
| **C** logic_br submit/approve | SPINE-03 chain | **skipped** OOS | nav-only exit |
| **AT-01 nav** L2.5 | Three HDSD entries | **PASS** | QA click paths + screens |
| FAB overlap polish | Tap under FAB | **CONDITION** P2 | `R-SPINE-AT-NAV-FAB-OVERLAP` |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent SPINE-03 / product UAT DONE / Phase 1 DONE from nav-only
- Did not treat FAB-OVERLAP P2 as product NO-GO (PM Condition OK)
- Did not treat QA pack process 1/8 as product NO-GO
- Did not claim manager approve / J-MOB-05 from this gate

---

## completion_report

**Closed:** L3 QC gate `R-SPINE-AT-NAV-01-QC` for AT-01 **nav-only** on APK **ab93da36…33f5ab** (emulator-5554 · `uat.nv0001@xe.vn`). Spot-check FAB leave+đơn công, hub Đi muộn (scroll), Settings → CreateUpdateRequest credible; U65/U78 OK; prior missing-entry **CLOSED**.

**Residual / conditions:** **R-SPINE-AT-NAV-FAB-OVERLAP** P2 CONDITION; SPINE-03 submit/approve deferred; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/r-spine-at-nav-01-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: R-SPINE-MGR-HIER-01-QA-BROWSER (P0) then SPINE-03 submit/approve — OR residual R-SPINE-AT-NAV-FAB-OVERLAP (P2)
role: pm
priority: P0 (MGR hier / SPINE-03) · P2 (FAB polish)
entry_criteria:
  - docs/qa/evidence/r-spine-at-nav-01-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - AT-01 nav discoverability CLOSED (FAB + hub Đi muộn + Settings → CreateUpdateRequest)
  - must_keep leave FAB «Tạo đơn nghỉ» preserved
action:
  1) Bus INTAKE R-SPINE-AT-NAV-01-QC PASS_TO_PM — promote AT-01 nav CLOSED; do NOT claim UAT/Phase1 DONE
  2) Prefer Task qa-device/qa: R-SPINE-MGR-HIER-01-QA-BROWSER (manager hierarchy) then SPINE-03 submit/approve UAT after hierarchy ready
  3) When capacity: Task dev-mobile R-SPINE-AT-NAV-FAB-OVERLAP (raise stats or FAB inset so Đi muộn tap never opens sheet)
  4) Optional: qa-device pack fmt — bold api_base on next device MD (P3 process)
cấm: seed · claim full SPINE-03 / UAT / Phase1 DONE from nav-only GWC
```

---

## pm_dispatch_hint

`R-SPINE-MGR-HIER-01-QA-BROWSER` → SPINE-03 submit/approve — OR `dev-mobile` `R-SPINE-AT-NAV-FAB-OVERLAP` P2; AT-01 nav GWC closed; no UAT DONE claim.
