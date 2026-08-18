# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-QA-05

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-05` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · holding `company_id=main` · member OU `trsport` · neg OU `finance` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` (restarted `start:prod` after BE-03 build) · xbos `:28002` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-05` READY_FOR_QA · BE-03 |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-05.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-qa-05.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-05/` (00–10) |
| **stamp** | `CTR5-IBM3SF` |
| **honesty** | `contracts_printable_ready=false` · **DENIED** invent printable UAT / seed / synced_catalogs |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0 / hard refresh / BE live

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM 200 · XBOS 200 · portal 5173 200 |
| hrm-api restart | Stopped stale PID · `pnpm --filter hrm-api build` · `start:prod` Nest up |
| BE-03 probe | `GET …/contract-library/publishes?company_id=main` **200** (was **404** pre-restart) |
| FE hard refresh | Fresh Playwright contexts per partition (holding / member / neg / must_keep) |
| Seed | **DENIED** |

---

## 1. Exit criteria matrix

| # | AC | Verdict | Evidence |
|---|-----|---------|----------|
| 1 | Holding Phát hành → POST 2xx → version row | 🟢 | POST `…/publishes?company_id=main` → **201** `HRM-CTR-PUB-201` · `publish_version=3` · row `ctr-library-publish-row-3` after F5 · body `{"label_vi":"QA-05 FE phát hành CTR5-IBM3SF"}` |
| 2 | Member Kéo gói → Áp dụng · origin badge Tập đoàn · vN | 🟢 | OU `trsport` · pull **201** `HRM-CTR-PULL-200` upserted=6 · apply **201** `HRM-CTR-APPLY-200` · badges `Tập đoàn · v3` (CL×4 · TPL×2) |
| 3 | company_id query only · body no company_id | 🟢 | 3 mutate POSTs: publishes/pull/apply — `qsHasCompanyId=true` · `bodyHasCompanyId=false` |
| 4 | NOTHING-TO-APPLY / CODE-CONFLICT | 🟢 / OBS | finance apply → **`HRM-CTR-PUB-NOTHING-TO-APPLY`** toast path 🟢 · CODE-CONFLICT **OBS** (needs collide invent — U65 forbid) |
| 5 | must_keep UF-HRM-02 + print-spine chrome | 🟢 | Create **201** `HD-BN37L` · `ctr-print-spine` visible · Settings CL/TPL chrome · honesty stamp visible |
| 6 | Evidence QA-05 | 🟢 | this file + FINAL JSON + screens |

**Overall:** **PASS_TO_PM** — narrow library Publish/Pull/Apply slice · **DENIED** `contracts_printable_ready` / printable module UAT.

---

## 2. UF / AC blocks

### AC-HOLDING-PUBLISH
- Path: `/hr/settings` → tab Điều khoản HĐ → `ctr-library-publish-btn`
- Network: `POST /api/hrm/contracts-insurance/contract-library/publishes?company_id=main` → **201** `HRM-CTR-PUB-201` · v3
- Body: `{ label_vi }` only — **no** `company_id`
- FE sau 2xx + F5: row v3 in publishes table
- Verdict: 🟢

### AC-MEMBER-PULL-APPLY
- Scope: Group CEO + `sessionStorage['hrm:operating-unit-filter']=trsport` (Settings hides OU chip; `listCompanyId` still reads stored slug)
- Path: Settings → `ctr-library-pull-member` → **Kéo gói** → **Áp dụng gói tập đoàn**
- Network pull: `POST …/pull?company_id=trsport` body `{"publish_version":3}` → **201** `HRM-CTR-PULL-200`
- Network apply: `POST …/apply?company_id=trsport` body `{"publish_version":3}` → **201** `HRM-CTR-APPLY-200`
- Origin: `ctr-clause-origin-*` / `ctr-tpl-origin-*` = **Tập đoàn · v3**
- Verdict: 🟢

### AC-COMPANY-ID-QUERY-ONLY
- All library mutates: query `company_id` · body keys ⊆ `{label_vi,publish_version,force}`
- Verdict: 🟢

### AC-NEG-NOTHING-TO-APPLY
- OU `finance` (no prior pull drafts for apply) → apply → code **`HRM-CTR-PUB-NOTHING-TO-APPLY`**
- Verdict: 🟢

### AC-NEG-CODE-CONFLICT
- Not reproducible without inventing member-local colliding codes
- Verdict: **OBS** (exit allowed)

### UF-HRM-02 + print-spine (must_keep)
- `/hr/contracts` → Thêm → employee/type → work_location → Lưu → **201** · pencil → `ctr-print-spine` chrome
- Process: dndStorm=0 · Uncaught=0 · mojibake=false
- Verdict: 🟢

---

## 3. Residuals / notes for PM

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| Settings OU chip hidden | P3 UX OBS | fe / pm | **OPEN soft** | `/settings` hides OU filter (`FILTER_HIDDEN_PATH_PREFIXES`); member Pull/Apply needs stored `hrm:operating-unit-filter` or OU set on another page first. Product works when slug stored; discoverability UX optional follow-up — **not** slice FAIL. |
| CODE-CONFLICT toast | — | — | **OBS** | U65 no seed invent |
| Printable module UAT | — | — | **DENIED** | `contracts_printable_ready=false` |
| Q-CTR-01 close | — | **qc** | next | Parent condition after this PASS |

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `contracts_printable_ready` | **false** |
| Promote printable UAT / module GO | **DENIED** |
| Seed used | **DENIED** |
| Narrow slice | Publish/Pull/Apply + origin badge + must_keep smoke only |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: U65 browser holding publish v3 201 + member trsport pull/apply 201 + origin Tập đoàn · v3 + company_id query-only (3 POSTs) + NOTHING-TO-APPLY on finance + UF-HRM-02/print-spine must_keep + process clean. Soft OBS: Settings OU chip hidden; CODE-CONFLICT OBS. Honesty false. Residual for QC: close Q-CTR-01. |
| **next_owner** | **qc** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-qa-05.md` |
| **next_dispatch_prompt** | see below |

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QC-Q-CTR-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QA-05 PASS_TO_PM
honesty: contracts_printable_ready=false
must_keep: print-spine GWC · UF-HRM-02 · FE-01 DnD · FE-03 work_location · BE-02 PDF · Q-CTR-02 CLOSED

entry_criteria:
- docs/qa/evidence/po-hrm-contract-legal-print-qa-05.md
- machine _tmp-po-hrm-contract-legal-print-qa-05.FINAL.json stamp CTR5-IBM3SF
- screens 00-10 · parent FE-05 + BE-03 + ADR Option A

exit_criteria:
1) Audit QA-05 pack: holding publish + member pull/apply + query-only company_id + origin badge
2) Close Q-CTR-01 CONDITION if evidence sufficient; keep contracts_printable_ready=false
3) Soft OBS Settings OU chip discoverability — do not reopen as P0 unless product defect claimed
4) Evidence: docs/qa/evidence/po-hrm-contract-legal-print-qc-q-ctr-01.md (or append QC-01)

ack_status: PASS_TO_PM | GO | GO WITH CONDITIONS | NO-GO
```
