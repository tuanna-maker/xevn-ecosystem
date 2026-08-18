# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-01` |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-only |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **parents** | FE-01 `READY_FOR_QA` · BE-01 `READY_FOR_QA` |
| **spec** | CORR-01 **AC-CTR-XEVN-11** · DYNAMIC LOCK |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-01.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-contract-legal-print-xevn-tpl-qa-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-xevn-tpl-qa-01/` (00–08) |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable UAT / seed / API-only PASS |
| **ack_status** | **FAIL_TO_PM** |

---

## 0. L0 / health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM / XBOS / portal **200** (pre-run) |
| `pnpm run qc:fe-be-health` | **ALL PASS** (pre-run) |
| Seed | **none** (U65) |
| Fresh `nest build` (QA attempt after FAIL) | **FAIL** — see residual **R-CTR-XEVN-TPL-BE-BUILD** |
| Runtime restore | QA restarted `pnpm --filter hrm-api start:prod` from **existing** dist after kill `:28001` |

---

## 1. Verdict matrix

| ID | Verdict | Evidence |
|----|---------|----------|
| **AC-CTR-XEVN-11-CREATE** | 🔴 **FAIL** | Settings → Tạo mẫu #9 `XEVN_CUSTOM_XEVN9-IEEQO3` → POST `/contract-templates` **400** `HRM-VAL-001` — *property default_term_type / default_duration_* / title_print_vi / matrix_family should not exist* · row **not** on list · F5 **false** |
| **AC-CTR-XEVN-11-PICKER** | 🔴 **FAIL** | Cascade — custom #9 never created · picker cannot show code (spine visible; active templates GET still **8**) |
| **AC-CTR-XEVN-11-PREVIEW-BIND** | 🔴 **FAIL** | Cascade — no `template_code` on create body · edit spine path not reached for #9 |
| **AC-CTR-XEVN-11** (rollup) | 🔴 **FAIL** | Core create/picker/preview not met |
| **PROCESS-HYGIENE** | 🟢 **PASS** | dndStorm=0 · Uncaught=0 · mojibake=false on path |
| **UF-HRM-02** (must_keep) | 🟢 **PASS** | Create HĐ POST **201** `HRM-CON-201` · F5 list `HD-EFKGF` |
| **print-spine** (must_keep) | 🟢 **PASS** | `ctr-print-spine` visible on create form |
| **Q-CTR** (must_keep) | 🟢 **PASS** | Not reopened |
| **CFG-ORG-SUFFIX-F5** (optional) | 🔴 **FAIL** | GET/PUT `/company-settings` **404** `Cannot GET/PUT …/company-settings` |
| **STARTER-8-LIST** (optional) | ⬜ **SKIP** | List chrome `Mẫu đã lưu (10)` · GET templates total=10 · active=8 — **no** assert exactly-8-only · starter row testids not matched in harness (soft) |
| **Honesty** | 🟢 | `contracts_printable_ready=false` retained · no printable UAT claim |

---

## 2. AC-CTR-XEVN-11 evidence block (browser)

### Create #9 → 2xx → F5
- Persona / URL: `ceo@xe.vn` → `/hr/settings?tab=contract-legal` → tab templates
- Action: fill `ctr-tpl-code` / name / title_print / pack GENERAL / status Hiệu lực → `ctr-tpl-save`
- Network: POST `/api/hrm/contracts-insurance/contract-templates` → **400** `HRM-VAL-001`
- Message (truncated): `property default_term_type should not exist; property default_duration_days should not exist; … title_print_vi … matrix_family`
- FE sau: toast error · `ctr-tpl-row-XEVN_CUSTOM_XEVN9-IEEQO3` **absent** · F5 still absent
- Verdict: 🔴 — **not** `CODE-INVALID` «not in 8» (good for DYNAMIC LOCK enum story); blocked by **DTO whitelist / stale runtime** vs FE EXPAND payload
- spec_ref: CORR-01 AC-CTR-XEVN-11 · DYNAMIC LOCK · BE-01 EXPAND DTO

### Create HĐ picker + preview bind
- Path: `/hr/contracts` → Thêm → spine pack GENERAL → open `ctr-print-template`
- Result: custom code **not** in options (create failed)
- Registry create still **201** (UF-HRM-02 must_keep)
- Preview bind: **not exercised** for #9
- Verdict: 🔴 cascade

### Process
- No `@hello-pangea/dnd` storm · no Uncaught ReferenceError/TypeError · no mojibake on Settings/Contracts path
- Console: expected 404/400 resource failures (CFG + VAL-001) — not process FAIL-immediate classes

---

## 3. Root cause (QA triage)

| Layer | Finding |
|-------|---------|
| **App / BE runtime** | Live Nest `dist` **does not accept** FE EXPAND template fields; CFG-01 routes **missing** (404 Nest default). |
| **Source vs dist** | Source DTO/controller **do** declare `default_term_type` / `company-settings` (BE-01 evidence) — **runtime dist not rebuilt / not serving BE-01**. |
| **Build gate** | `pnpm --filter hrm-api run build` **FAIL**: `contract-legal-print.service.ts:852` TS2367 (`matrixFamily === ''`) · `merge-tokens.service.ts:698` TS2554 (extra arg) — blocks fresh dist emit. |
| **FE** | Sends correct open-catalog EXPAND payload per FE-01 — create path blocked by BE runtime. |
| **Not** | Closed-enum reject of 9th (`CODE-INVALID` not-in-8) — **not** observed. |

---

## 4. Residuals (PM dispatch)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-CTR-XEVN-TPL-BE-BUILD** | **P0** | **dev-be** | Fix TS2367 + TS2554 so `nest build` exit 0; emit dist with BE-01 DTO + CFG routes |
| **R-CTR-XEVN-TPL-BE-RUNTIME** | **P0** | **dev-be** (+ devops restart) | After build: restart `:28001`; POST templates accepts EXPAND fields **2xx**; GET/PUT `company-settings` **not** 404 |
| **R-CTR-XEVN-TPL-QA-RETEST** | P0 | **qa** | After BE live: re-run harness AC-11 create→F5→picker→preview bind |

**Out of scope / sealed:** Q-CTR-01/02 CLOSED · print-spine must_keep · UF-HRM-02 · `contracts_printable_ready=false`

---

## 5. Honesty

```text
contracts_printable_ready = false
```

No printable UAT · no seed · no API-only PASS · no hardcode assert exactly-8-only.

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | U65 browser AC-CTR-XEVN-11 **FAIL** — live BE dist rejects EXPAND create (HRM-VAL-001) + CFG 404; process/UF/spine must_keep OK; honesty false |
| **next_owner** | **pm** → **dev-be** (build+runtime) → **qa** retest |
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qa-01.md` |
| **pm_dispatch_hint** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02` — fix nest build TS + ship dist with template EXPAND DTO + company-settings; then QA-01 retest |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-QA-01 FAIL_TO_PM
entry: QA residual R-CTR-XEVN-TPL-BE-BUILD + R-CTR-XEVN-TPL-BE-RUNTIME
spec: DYNAMIC LOCK · CORR-01 AC-CTR-XEVN-11 · BE-01 EXPAND DTO/CFG already in source

## fix
1. nest build FAIL: contract-legal-print.service.ts:852 TS2367 (matrixFamily === ''); merge-tokens.service.ts:698 TS2554
2. Emit dist so CreateContractTemplateDto accepts default_term_type / duration / title_print_vi / matrix_family
3. company-settings GET/PUT live (not Nest 404)
4. Restart :28001 start:prod; smoke POST template #9 + CFG

## exit
READY_FOR_QA · evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-be-02.md
honesty: contracts_printable_ready=false
must_keep: print-spine · Q-CTR CLOSED · UF-HRM-02 · U65 no seed
cấm: claim printable UAT · closed enum 8 · reopen Q-CTR
```
