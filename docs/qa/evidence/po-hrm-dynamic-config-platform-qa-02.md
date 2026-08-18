# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-QA-02` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution · **browser UF** (supersedes QA-01 L1-only for AC-PLT-CTR-05) |
| **prior** | FE-01 READY_FOR_QA · BE-01 READY · QA-01 L1 PASS (not UF) |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `:5173` · hrm `:28001` · xbos `:28002` |
| **stamp** | `PLTQA2-IEWURI` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-qa-02.FINAL.json` |
| **harness** | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-qa-02.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-qa-02/` |
| **honesty** | `contracts_printable_ready=false` — **DENIED** invent / printable UAT / Phase1 DONE |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Label (mandatory honesty)

| Claim | Status |
|-------|--------|
| **AC-PLT-CTR-05 browser UF** | ✅ **PASS** — FE after 2xx + F5 with `labelVi` |
| **Supersede QA-01 L1-only for this AC** | ✅ — QA-01 SKIP/L1 note **superseded** for AC-PLT-CTR-05 only |
| **Printable UAT** / `contracts_printable_ready` | ❌ **DENIED** (remains **false**) |
| Seed in evidence | **none** (U65) |
| Phase1 / module UAT flip | **none** |

> QA-01 remains valid as **L1 secondary** API surface evidence. This wave **only** promotes AC-PLT-CTR-05 from SKIP → browser **PASS**. Probe alone still ≠ UF.

---

## 1. L0 / health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM / XBOS / portal **200** (Windows UV assert noise after PASS — health OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Harness L0 | portal/hrm/xbos **200** |
| Seed | **none** |

---

## 2. HDSD inventory (U76)

| testid | Used |
|--------|------|
| `settings-tab-contract-legal` | ✅ |
| `settings-merge-tokens` | ✅ |
| `hdsd-merge-token-key` · `hdsd-merge-token-label` · `hdsd-merge-token-source` | ✅ |
| `hdsd-merge-token-save` · `hdsd-merge-token-reload` · `hdsd-merge-token-resolve-preview` | ✅ |
| `settings-merge-tokens-table` · `settings-merge-token-row-{tokenKey}` | ✅ |
| `hdsd-merge-token-retire-{tokenKey}` | ✅ soft-delete smoke |
| `settings-merge-tokens-preview` | ✅ resolve badge |

---

## 3. UF block — AC-PLT-CTR-05

### UF-PLT-CTR-05 — Đăng ký MergeToken Settings → F5 list

- **Persona / URL / click path:** `ceo@xe.vn` · `company_id=main` · login (portal token inject) → `/hr/settings?tab=contract-legal` → tab **Điều khoản HĐ** (`settings-tab-contract-legal`) → card **Token merge hợp đồng** (`settings-merge-tokens`) → nhập `tokenKey` + **Nhãn tiếng Việt** → **Đăng ký / Upsert** → Tải lại / F5
- **Token under test:** `custom.emp.qa_plt_pltqa2_iewuri` · label `Nhãn QA Token Merge PLTQA2-IEWURI`
- **Trước mutate:** panel visible; active list operable (empty OK / prior retired)
- **Action:** fill key + labelVi + sourcePath → click `hdsd-merge-token-save`
- **Network:** **PUT** `/api/hrm/merge-tokens` → **200** `HRM-PLT-TOK-200` «Merge token upserted»
- **FE sau 2xx (SRS):** row `settings-merge-token-row-custom.emp.qa_plt_pltqa2_iewuri` hiện với **labelVi** + `{{tokenKey}}` — **không** raw-key-only
- **F5:** hard reload + tab contract-legal → same row còn với label + braces
- **Verdict:** 🟢 **PASS**
- **spec_ref:** BA AC-PLT-CTR-05 · API-01 F-PLT-TOK-01/02 · FE-01 §3
- **spec_gap:** none

### Optional — Resolve registry

- Click `hdsd-merge-token-resolve-preview` → POST resolve-preview **201** · token `source=registry` · UI badge **Registry MergeToken**
- **Verdict:** 🟢 **PASS** (optional)

### Optional — Contracts surface smoke

- Navigate `/hr/contracts` after upsert — surface loads (rollup list)
- Full ContractPrintSpine PREV “registry wins on live contract values” = **OBS / not claimed UF** this wave (must_keep print-spine not reopened)
- **Verdict:** 🟢 smoke PASS · PREV deep consume **not promoted**

---

## 4. Verdict matrix

| ID | Verdict | Evidence |
|----|---------|----------|
| **AC-PLT-CTR-05** browser UF | 🟢 **PASS** | PUT 200 + FE after 2xx + F5 labelVi |
| **F-PLT-TOK-02** via UI | 🟢 **PASS** | Upsert from Settings |
| **F-PLT-TOK-01** via UI after F5 | 🟢 **PASS** | Row in list with display-ready label |
| **F-PLT-TOK-03** resolve registry | 🟢 **PASS** | source=registry |
| **DYNAMIC-LOCK** open custom key | 🟢 **PASS** | `#9+`-style `custom.emp.qa_plt_*` accepted — no closed-enum reject |
| **Soft-delete retire** | 🟢 **PASS** | Retire 2xx → row hidden from active list (cleanup after UF assert) |
| **Contracts PREV deep registry** | ⬜ **OBS** | Surface smoke only — not printable claim |
| **Honesty** | 🟢 | printable **false** retained |
| **QA-01 L1 AC-PLT-CTR-05 SKIP** | ✅ **SUPERSEDED** | This evidence |

---

## 5. must_keep

| Keep | Status |
|------|--------|
| UF-HRM-02 | **not reopened** |
| print-spine | **not reopened** (PREV deep OBS) |
| soft-delete | retire hide **PASS** |
| U65 zero-seed | no seed scripts; browser-only mutate |
| DYNAMIC-LOCK | open catalog custom key **PASS** |

---

## 6. Honesty

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| Phase1 DONE | **DENIED** |
| Seed for UF | **none** |
| Module UAT flip | **none** |

---

## 7. Residuals / not promoted

| Item | Note | Owner |
|------|------|-------|
| Live ContractPrintSpine PREV with registry-bound values on real HĐ | Optional OBS — not blocking AC-PLT-CTR-05 Settings UF | qa / later wave |
| R-PLT-API-01 EMP extension-item → TOK-02 same-txn | Prior residual BE | `dev-be` |
| Peer XEVN-TPL AC-11 | Outside this slice | peer WI |
| `contracts_printable_ready` | remains false | — |

**not promoted:** printable UAT · Phase1 DONE · full PREV live-value UF · J-HRM-CTR-07 module-ready

---

## 8. completion_report

**Closed:** L0 + fe-be-health PASS; browser **AC-PLT-CTR-05** PASS (Settings register/upsert → Network PUT **200** → FE row with `labelVi` → F5 còn); resolve-preview `source=registry` PASS; DYNAMIC-LOCK open custom key PASS; soft-delete retire hide PASS; U65 no seed; honesty printable=false; **supersedes QA-01 L1-only SKIP** for AC-PLT-CTR-05.

**Residual:** Contracts PREV deep registry-on-live-HĐ OBS (non-blocking); peer TPL / EMP hook unchanged; **DENIED** invent printable.

**next_owner:** **qc** (certify slice) → then **pm**

---

## 9. next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
residual_auto_fix: true
entry_criteria: QA-02 PASS_TO_PM · FE-01 READY · BE-01 READY · evidence po-hrm-dynamic-config-platform-qa-02.md
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-qa-02.md
  - docs/qa/evidence/po-hrm-dynamic-config-platform-qa-01.md (L1 secondary — AC-05 superseded by QA-02)
  - docs/qa/evidence/po-hrm-dynamic-config-platform-fe-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md AC-PLT-CTR-05
task:
  - Certify browser AC-PLT-CTR-05 slice GO/GWC (UF FE after 2xx + F5)
  - Confirm QA-01 L1-only SKIP for AC-PLT-CTR-05 is superseded
  - Honesty lock: contracts_printable_ready=false · no Phase1 DONE · no seed claim
  - must_keep: UF-HRM-02 · print-spine · soft-delete · U65 · DYNAMIC-LOCK
  - Residual OBS: full Contracts PREV live registry consume — do not invent printable UAT
exit: PASS_TO_PM GO|GWC|NO-GO · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-qc-01.md
```

---

## 10. ack_status

**PASS_TO_PM** — browser AC-PLT-CTR-05 UF verified; ready for QC slice certify; printable remains **false**.
