# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-QA-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-03` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · holding `company_id=main` · member OU target `du-lich` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-03` READY_FOR_QA (Wave B) |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` (W7.5) |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-03.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-qa-03.mjs` |
| **debug** | `scripts/qa/_tmp-debug-ctr-settings.mjs` · screen `debug-settings.png` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-03/` |
| **stamp** | Prior FAIL `CTR3-J0BWZL` · **Retest PASS `CTR3-J0T6L2`** |
| **honesty** | `contracts_printable_ready=false` · **DENIED** invent printable UAT / seed / flip ready |
| **ack_status** | **PASS_TO_PM** (retest after FE-04 — see § RETEST below; prior FAIL retained for audit) |

---

## 0. L0 / BE / hard refresh

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| `qc:fe-be-health` | **ALL PASS** (API + proxy) |
| BE-03 probe | `GET …/contract-library/publishes?company_id=main` **200** `HRM-CTR-PUB-200` (total≥4) · clauses/templates **200** |
| FE hard refresh | Playwright fresh context · inject portal auth |
| Seed | **DENIED** |
| Vite module | **`GET /hr/src/integrations/hrmApi.ts` → HTTP 500** (SWC Syntax Error) |

---

## 1. Exit criteria matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | Holding Settings → Phát hành → POST 2xx → versions row (F5) | 🔴 **BLOCKED** | Settings `#root` empty — panel/testids never mount |
| 2 | Member → Kéo gói → pull 2xx · skipped/conflicts when returned | 🔴 **BLOCKED** | Same Vite crash — member partition not reached |
| 3 | Member → Áp dụng → origin badges 4 overlay fields | 🔴 **BLOCKED** | Not reached |
| 4 | `company_id` query only on pub/pull/apply | ⬜ **N/T** | No mutate POSTs captured (network empty for library) |
| 5 | Smoke UF-HRM-02 + print-spine · honesty false | 🔴 **BLOCKED** / honesty **LOCKED false** | Spine/UF blocked by same `hrmApi.ts` import; stamp **not flipped** |
| 6 | Evidence QA-03 | 🟢 | this file + FINAL JSON + screens |
| 7 | ack | **FAIL_TO_PM** | residual P0 FE |

**Overall:** **FAIL_TO_PM** — browser U65 blocked by FE compile defect · **DENIED** `contracts_printable_ready` / printable module DONE · no GWC wipe · no seed.

---

## 2. Root cause (spec says / code does)

| | |
|--|--|
| **Symptom** | Browser `/hr/settings?tab=contract-legal` → blank white · `#root` length 0 · console `Failed to load resource: 500` on `hrmApi.ts` |
| **Vite/SWC** | `Expected ';', '}' or <eof>` at `apps/web/hrm/src/integrations/hrmApi.ts:3069` |
| **Cause** | FE-03 CODE-MEMORY line: `solid_convention_ack: display-ready origin*/publish meta from BE` — substring **`*/`** terminates the block comment early → Syntax Error |
| **Impact** | Entire HRM FE module graph that imports `hrmApi` fails to transform → Settings Publish/Pull/Apply UI unreachable · UF-HRM-02 / print-spine smoke also blocked |
| **BE-03** | API READY (publishes list 200) — **not** the blocker |

### Defect

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **D-CTR-FE-HRMAPI-COMMENT-SWC** | **P0** | **dev-fe** | **OPEN** | Reword CODE-MEMORY line 3069 — **never** write `*/` inside `/** … */` (e.g. `origin* / publish` or `origin-star publish`). Re-verify Vite serves `hrmApi.ts` **200**, then retest QA-03. |
| R-CTR-LIBRARY-PUBLISH-APPLY (browser) | P0 | qa (after FE) | **BLOCKED** | Holding publish + member pull/apply + 4-field origin + skip/conflict UI |
| Printable module UAT | — | — | **DENIED** | `contracts_printable_ready=false` LOCKED |

---

## 3. Process / honesty

| Check | Result |
|-------|--------|
| Seed | **DENIED** |
| Wipe print-spine GWC / UF-HRM-02 / PDF BE-02 / Wave A work_location / FE-01 DnD | **not touched** by QA |
| `contracts_printable_ready` | **false** · **DENIED** flip / invent printable UAT |
| api_only_pass as UF 🟢 | **DENIED** (BE probe only = L1 auxiliary) |

---

## 4. UF / AC blocks (attempted)

### AC-SETTINGS-CHROME / AC-HONESTY-STAMP
- Path: `/hr/settings` → tab `contract-legal`
- FE: blank · `ctr-library-publish-*` absent · honesty stamp not rendered
- Network: `GET …/hrmApi.ts` **500**
- Verdict: 🔴

### AC-HOLDING-PUBLISH … AC-ORIGIN-FOUR-FIELDS
- Not executed (harness timeout waiting `ctr-library-publish-label`)
- Verdict: 🔴 BLOCKED

### Debug reproduce
```text
node scripts/qa/_tmp-debug-ctr-settings.mjs
→ title OK · hasPanel=false · hasTab=false · rootLen=0
→ http:500 /hr/src/integrations/hrmApi.ts
→ SWC: origin*/publish closes comment at line 3069
```

---

## 5. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `contracts_printable_ready` | **false** |
| Promote printable UAT / module GO | **DENIED** |
| Seed used | **DENIED** |
| Narrow slice claim DONE | **DENIED** (browser FAIL) |

---

## RETEST — after FE-04 (D-CTR-FE-HRMAPI-COMMENT-SWC FIX)

| Field | Value |
|-------|--------|
| **retest_of** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-03` prior **FAIL_TO_PM** stamp `CTR3-J0BWZL` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-04` READY_FOR_QA |
| **date** | 2026-08-07 |
| **stamp** | **`CTR3-J0T6L2`** |
| **persona** | `ceo@xe.vn` · holding `main` · member OU **`trsport`** (not portal alias `du-lich`) |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-03.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-03/` (00–10 refreshed) |
| **honesty** | `contracts_printable_ready=false` · **LOCKED** · **DENIED** invent printable UAT / seed / flip |
| **ack_status** | **PASS_TO_PM** |

### Entry gate (FE-04)

| Check | Result |
|-------|--------|
| `GET /hr/src/integrations/hrmApi.ts` | **200** · len ~682k · no SWC Syntax Error |
| Settings `contract-legal` mount | `ctr-library-publish-panel` visible (FE-04 PASS_MOUNT confirmed) |
| L0 `qc:dev-stack` | HRM/XBOS/portal **200** |
| `qc:fe-be-health` | **ALL PASS** |
| Seed | **DENIED** |

### Exit criteria matrix (retest)

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | Holding Phát hành → POST 2xx → versions + F5 | 🟢 **PASS** | POST **201** `HRM-CTR-PUB-201` `publish_version=6` · row `ctr-library-publish-row-6` after F5 · body `{label_vi}` only · `?company_id=main` |
| 2 | Member Pull → 2xx · skipped/conflicts UI when returned | 🟢 **PASS** | OU **trsport** zone `ctr-library-pull-member` · POST **201** `HRM-CTR-PULL-200` v6 upserted=25 · `skipped_override=[]` `conflicts=[]` → skip/conflict UI not required (empty arrays) |
| 3 | Member Apply → origin badges 4 fields | 🟢 **PASS** | POST **201** `HRM-CTR-APPLY-200` · group badges CL=12 TPL=13 · `data-origin` + `data-origin-version` + `data-origin-company` + `data-lineage-code` **fourFieldOk=true** |
| 4 | `company_id` query only on pub/pull/apply | 🟢 **PASS** | n=3 · all `qsHasCompanyId=true` · `bodyHasCompanyId=false` |
| 5 | Smoke UF-HRM-02 + print-spine · honesty false | 🟢 **PASS** / honesty **LOCKED false** | UF-HRM-02 save **PASS** code `HD-0U66Z` · `ctr-print-spine` visible · stamp `contracts_printable_ready=false` on panel · **DENIED** flip |
| 6 | Evidence QA-03 retest | 🟢 | this § + FINAL JSON stamp `CTR3-J0T6L2` |
| 7 | Handoff contract | 🟢 | below |

**Overall:** **PASS_TO_PM** · D-CTR-FE-HRMAPI-COMMENT-SWC **CLOSED** (Vite 200) · browser U65 PUB/PULL/APPLY + UF-HRM-02 + print-spine chrome PASS · residuals **[]** · **DENIED** `contracts_printable_ready` / printable module DONE · must_keep **not wiped**.

### Harness note (OBS — not product defect)

First retest attempt with default `QA_MEMBER_OU=du-lich` showed `holdingStill=true` / `memberZone=false` — **false FAIL**. `du-lich` is **not** an HRM OU slug (`holding|trsport|logistics|finance|services`); `readStoredOperatingUnitFilter` coerces unknown → `all` → holding partition. Re-run with **`trsport`** (aligned QA-05) → member Pull/Apply PASS. Harness default updated to `trsport`.

### Defect closure

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **D-CTR-FE-HRMAPI-COMMENT-SWC** | P0 | **CLOSED** | FE-04 reword `origin-star and publish`; Vite 200; Settings mounts |
| R-CTR-LIBRARY-PUBLISH-APPLY (browser) | P0 | **CLOSED** | stamp `CTR3-J0T6L2` |
| Printable module UAT | — | **DENIED** | honesty false LOCKED |

### Honesty stamp (retest)

| Claim | Value |
|-------|--------|
| `contracts_printable_ready` | **false** LOCKED |
| Promote printable UAT / module GO | **DENIED** |
| Seed used | **DENIED** |
| Wipe print-spine GWC / UF-HRM-02 / PDF BE-02 / Wave A / FE-01 DnD | **not touched** |

---

## Completion contract (RETEST)

| Field | Value |
|-------|--------|
| **completion_report** | Closed: FE-04 SWC fix verified (hrmApi.ts 200); U65 browser retest stamp **CTR3-J0T6L2** — Holding publish v6 201+F5; member trsport pull/apply 201; origin 4-field badges PASS; company_id query-only n=3; UF-HRM-02 + print-spine PASS; honesty false LOCKED; no seed; must_keep preserved. Residual product: none for this wave. DENIED printable ready / module DONE. |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-03.md` |
| **next_dispatch_prompt** | see below |

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QC-03
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QA-03 PASS_TO_PM (retest CTR3-J0T6L2)
program: PO-HRM-CONTINUOUS-W7-20260807
honesty: contracts_printable_ready=false — DENIED invent printable UAT · no flip · no seed
must_keep: print-spine GWC · UF-HRM-02 · PDF BE-02 · Wave A work_location · FE-01 DnD · PUB/PULL/APPLY

entry_criteria:
- docs/qa/evidence/po-hrm-contract-legal-print-qa-03.md RETEST PASS_TO_PM stamp CTR3-J0T6L2
- docs/qa/evidence/po-hrm-contract-legal-print-fe-04.md READY_FOR_QA (D-CTR-FE-HRMAPI-COMMENT-SWC CLOSED)
- FINAL JSON: docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-03.FINAL.json

exit_criteria:
1) Audit browser AC 1–5 + honesty lock — GO or GWC with residual list
2) Confirm D-CTR-FE-HRMAPI-COMMENT-SWC CLOSED; no wipe must_keep
3) DENY flip contracts_printable_ready / claim printable module DONE
4) Evidence: docs/qa/evidence/po-hrm-contract-legal-print-qc-03.md · ack PASS_TO_PM
5) next_dispatch_prompt for residual or next continuous wave (SA/BA per U88)

cấm: seed · flip ready · claim printable DONE · reopen must_keep GWC without defect
```
