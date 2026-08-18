# Evidence — W1-B-03-TC-CAT-QC-R1

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-03-TC-CAT-QC-R1` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | L3 gate — FR-UC-B04 CAT after QA-R1 (R-CAT-XBOS-STATUS-LABEL CLOSED) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173` · apply `?settings=hrm_catalog_apply_members` · HRM `/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `w1b-03-tc-cat-qa-r1.md` PASS_TO_PM · test-log md+json · BE `w1b-03-be-cat-status-label.md` READY_FOR_QA (supersedes prior QA FAIL) |
| **spec_ref** | FR-UC-B04 · TECH_SPEC_NEW TS-CAT · API_CONTRACT_NEW §2.1–2.4 · slice `DOC-ENT-P0-XBOS-CAT` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY |

---

## Verdict summary

**GO WITH CONDITIONS** — CAT browser wave after QA-R1. Independent QC audit confirms **AC1** live XBOS GET items include `status_label=Đang dùng` / `status_tone=success` (`XBOS-CFG-201` v7), apply **201** `XBOS-CFG-204`, HRM pull **201** `HRM-SYNC-200` + GET **200** `HRM-SYNC-201` display-ready, picker label `Tổng Giám đốc`, F5 persist, U65 zero-seed, U76 A/B/C, U78 world-standard test-log md+json. **R-CAT-XBOS-STATUS-LABEL CLOSED**. Prior `w1b-03-tc-cat-qa.md` FAIL **superseded**. Do **not** reopen AUTH/EMP CLOSED waves.

**Conditions (allowed per entry):** **R-CAT-PICKER-LABEL** P2 (settings-catalogs may FE-map status) · **R-CAT-ALLOWLIST** P1 SA defer · **OBS-SYNC-RESP-CAPTURE** P3. **NOT** Phase 1 / product UAT DONE from this CAT gate alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/w1b-03-tc-cat.md` | READY_FOR_QA; display-ready XBOS→HRM UPGRADE | **ACCEPT** (parent BE) |
| `docs/qa/evidence/w1b-03-tc-cat-qa.md` | FAIL_TO_PM; AC1 missing `status_label` live | **SUPERSEDED** by R1 |
| `docs/qa/evidence/w1b-03-be-cat-status-label.md` | READY_FOR_QA; dist rebuild + live snip `Đang dùng` | **ACCEPT** |
| `docs/qa/evidence/w1b-03-tc-cat-qa-r1.md` | PASS_TO_PM; AC1–5 🟢; R-CAT-XBOS-STATUS-LABEL CLOSED | **ACCEPT** |
| `…-qa-r1-test-log.md` | 11 chronological steps · verdict pass | **ACCEPT** (U78) |
| `…-qa-r1-test-log.json` | `schema: xevn-test-log/v1` · 11 steps · 3 cases · AC1–5 pass | **ACCEPT** (U78 / OS 31) |
| `…/_tmp-w1b-03-tc-cat-qa-r1-runtime.json` | clicks=19 · ac AC1–5 pass · idle_guard | **ACCEPT** |
| Screens `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/` | **9** PNG on disk | **ACCEPT** (spot visual) |

---

## Independent spot-check (QC)

### EC1 — AC1 XBOS source + status_label (closed residual)

| Check | Result |
|-------|--------|
| Runtime AC1_GET_SOURCE | **200** `XBOS-CFG-201` v7 items=4 · sample `status_label=Đang dùng` `status_tone=success` code=`CEO` |
| BE snip checksum | `sha256:af60ffad5a89c85a3beb631de09069d5cdcbe3fda24dff3d115b56d44054a7c9` matches screen source strip |
| Screen | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/03-source-loaded.png` — panel «Áp dụng danh mục HRM» · Chức danh · version **7** · **4 mục** · same checksum |
| Apply | POST apply-to-members **201** `XBOS-CFG-204` appliedCount=1 |
| Prior FAIL | superseded — R1 proves runtime serves `withCatalogItemDisplay` |

**PASS** — **R-CAT-XBOS-STATUS-LABEL CLOSED**

### EC2 — Case A fail_deep

| Check | Result |
|-------|--------|
| Test-log seq2 | Wrong pwd → **401** `XBOS-AUTH-401` · stillLogin |
| Screen | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/A-wrong-password.png` present |

**PASS**

### EC3 — AC2–4 pull / GET / picker (J-XBOS-CTRL-01 / J-XBOS-02 / UF-HRM-10)

| Check | Result |
|-------|--------|
| FE sync click | runtime `fe_sync_clicked=true` · click_log `click-sync-from-xbos-button` |
| Pull contract | POST `/catalog-sync/pull/job_titles` **201** `HRM-SYNC-200` · pubVer=7=version · top-level items · `status_label=Đang dùng` |
| GET | **200** `HRM-SYNC-201` · top-level items + labels |
| Picker | `Tổng Giám đốc` · miss **404** `HRM-SYNC-002` |
| Screen post-pull | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/06-after-pull.png` — «Đồng bộ từ XBOS» · status column **Đang dùng** on synced rows |

**PASS** — **J-XBOS-CTRL-01** / **J-XBOS-02** / **UF-HRM-10** in-scope L2.5 path PASS for this CAT slice

### EC4 — AC5 F5 + Case C

| Check | Result |
|-------|--------|
| Runtime AC5 | f5Ok · URL `/hr/settings-catalogs?…companyId=main` |
| Screen | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/07-after-f5.png` — catalogs remain · status **Đang dùng** · sync stamp after reload |

**PASS**

### EC5 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-W1B-03-TC-CAT-QA-R1-20260803` |
| steps | **11** chronological · all `pass` |
| cases | CASE-A · CASE-B · CASE-C (U76) |
| hdsd_align | **true** |
| u65_zero_seed | **true** |
| summary | passed=11 failed=0 · clicks=19 · verdict=pass · ack PASS_TO_PM |
| attachments | 9 PNG + runtime — **all exist on disk** (`pngMissing=[]`) |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs CAT QA-R1 | QC |
|---------|-------------------|-----|
| **J-XBOS-CTRL-01** | Holding publish/apply → HRM Settings sync/pull → list + F5 (`job_titles`) | **PASS** (browser R1) |
| **J-XBOS-02** | Catalog publish → HRM sync | **PASS** (same click path + HRM-SYNC-200/201) |
| **UF-HRM-10** | Settings catalogs sync XBOS | **PASS** (FE Đồng bộ + F5) |
| Other J-* / AUTH / EMP / mobile | Out of this WI | **not claimed** |

Mandatory in-scope journeys for this CAT gate: **J-XBOS-CTRL-01** + **J-XBOS-02** + **UF-HRM-10** PASS. No untested mandatory J-* claimed PASS.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | AC1–5 **PASS** · `R-CAT-XBOS-STATUS-LABEL` **CLOSED** · FR-UC-B04 browser path closed for CAT slice |
| **PROCESS** | QA narrative pack `verify:qc:evidence-pack` **7/8** missing `command_table` only — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (L0 hrm/xbos/portal **200** during R1) |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote CAT close.

---

## Residual

| Id | Status | Sev | Owner | Blocks CAT GO? |
|----|--------|-----|-------|----------------|
| **R-CAT-XBOS-STATUS-LABEL** | **CLOSED** | — | — | No — do not reopen without regression |
| **R-CAT-PICKER-LABEL** | **OPEN — CONDITION** | P2 | PM triage / FE display wave | **No** (defer OK per entry) |
| **R-CAT-ALLOWLIST** | **OPEN — CONDITION** | P1 | sa (prior defer) | **No** (unchanged SA defer) |
| **OBS-SYNC-RESP-CAPTURE** | OPEN note | P3 | qa | No — pull contract captured |
| AUTH / EMP CLOSED waves | **CLOSED** | — | — | No — **cấm reopen** this CAT gate |
| **C-CAT-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table on next QA MD |

---

## Conditions (explicit)

1. **R-CAT-PICKER-LABEL** — settings-catalogs may still FE-map status locally while catalog-sync items are display-ready — **deferred P2**.
2. **R-CAT-ALLOWLIST** — SA prior P1 defer — **unchanged**; not a reopen of AC1–5.
3. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this CAT GWC alone.
4. Do **not** reopen **R-CAT-XBOS-STATUS-LABEL** / AUTH / EMP without new browser regression evidence.
5. Prior `w1b-03-tc-cat-qa.md` FAIL is **superseded** — do not dispatch LABEL-01 again without new FAIL evidence.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-03-tc-cat-qa-r1.md
→ FAIL 1/8 — command_table
```

**PROCESS GWC** — product AC1–5 + J-* independently verified; does not demote CAT close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-03-tc-cat-qc-r1.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-03-tc-cat-qc-r1.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-03-tc-cat-qa-r1.md` | **FAIL** exit **1** · **7/8** missing command_table (process) |
| `node -e` schema/chrono/allPass on `w1b-03-tc-cat-qa-r1-test-log.json` | **PASS** exit **0** · schema `xevn-test-log/v1` · steps=11 · chrono=true · allPass=true · pngListed=8+disk9 · pngMissing=[] |
| Disk check 9 PNG under `screens/w1b-03-tc-cat-qa-r1/` | **PASS** · all present |
| Runtime cross-check `_tmp-w1b-03-tc-cat-qa-r1-runtime.json` | **PASS** · clicks=19 · AC1 status_label=Đang dùng · HRM-SYNC-200/201 · AC1–5 pass |
| Spot visual `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/03-source-loaded.png` + `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/06-after-pull.png` + `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/07-after-f5.png` | **PASS** · v7/4 mục/checksum · FE Đang dùng · F5 persist |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-03-tc-cat-qc-r1.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-03-tc-cat-qc-r1.md --check-assets` | **PASS** exit **0** (PNG paths resolve) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **AC1** Publish/GET | XBOS items `status_label` · CFG-204 | **PASS** | runtime AC1 · `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/03-source-loaded.png` · `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/04-after-apply.png` |
| **A** fail_deep | wrong pwd 401 | **PASS** | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/A-wrong-password.png` |
| **B** success_hdsd | apply → sync → picker | **PASS** | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/02-apply-panel.png` · `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/05-hrm-catalogs.png` · `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/06-after-pull.png` · HRM-SYNC-200/201 |
| **C** logic_br F5 | catalogs persist | **PASS** | `docs/qa/evidence/screens/w1b-03-tc-cat-qa-r1/07-after-f5.png` |
| **J-XBOS-CTRL-01** L2.5 | apply → HRM sync → F5 | **PASS** | QA-R1 click path + Network |
| **J-XBOS-02** L2.5 | publish/apply → HRM sync | **PASS** | same |
| **UF-HRM-10** | settings-catalogs sync | **PASS** | `05`/`06`/`07` |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not reopen AUTH / EMP CLOSED residuals
- Did not invent GO without opening browser evidence / runtime / screens
- Did not NO-GO solely on P2 picker / P1 allowlist defer (entry-allowed CONDITIONS)

---

## completion_report

**Closed:** L3 QC gate `W1-B-03-TC-CAT-QC-R1` on FR-UC-B04 after QA-R1. Spot-check screens + runtime Network + U78 test-log credible. **R-CAT-XBOS-STATUS-LABEL CLOSED**. AC1–5 **PASS**. **J-XBOS-CTRL-01** / **J-XBOS-02** / **UF-HRM-10** PASS. U65 zero-seed honored. Prior QA FAIL superseded.

**Residual / conditions:** **R-CAT-PICKER-LABEL** P2 + **R-CAT-ALLOWLIST** P1 defer (CONDITION); QA pack command_table P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/w1b-03-tc-cat-qc-r1.md`

---

## next_dispatch_prompt

```text
work_item_id: W1-B-03-TC-CAT-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/w1b-03-tc-cat-qc-r1.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-CAT-XBOS-STATUS-LABEL CLOSED — do not reopen without regression
  - FR-UC-B04 AC1–5 PASS (local :5173 / :28001 / :28002)
  - J-XBOS-CTRL-01 · J-XBOS-02 · UF-HRM-10 PASS for CAT slice
  - R-CAT-PICKER-LABEL P2 + R-CAT-ALLOWLIST P1 CONDITION defer OK
action:
  1) Bus INTAKE W1-B-03-TC-CAT-QC-R1 PASS_TO_PM + promote CAT slice CLOSED on backlog / TEAM_WORKING_NOW / slice DOC-ENT-P0-XBOS-CAT
  2) Continue next open W1-B / PM_OPEN_BACKLOG item (do not idle)
  3) Defer R-CAT-PICKER-LABEL to a settings-catalogs display-ready FE wave only when that UF enters scope — not CAT AC1 reopen
  4) Keep R-CAT-ALLOWLIST on SA backlog — do not block CAT close
  5) Do NOT claim product UAT DONE / Phase 1 DONE from this CAT GWC
  6) Do NOT reopen AUTH / EMP CLOSED residuals; do NOT re-dispatch LABEL-01 without new FAIL
cấm: seed · invent UAT DONE · reopen R-CAT-XBOS-STATUS-LABEL without new defect
```

---

## pm_dispatch_hint

`W1-B-03-TC-CAT-PM-CLOSE` — promote CAT FR-UC-B04 CLOSED; GWC P2 picker + P1 allowlist defer; next backlog; no UAT/Phase1 DONE claim; no AUTH/EMP reopen.
