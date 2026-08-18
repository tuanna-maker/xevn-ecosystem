# Evidence — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-09d) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE09DQA2-MSLDM40Y` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (J-01..04 PASS · P0 PATCH `company_id` **CLOSED**) |
| **uc_ids** | `UC-BP-CORE-09d` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **≠** closed-8 TPL DONE · **≠** CORE-09c printable DONE |
| **depends_on** | FE-02 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-02.md` · QA-01 FAIL stamp `CORE09DQA-MSLD9JI9` |
| **env** | portal `:5173` **200** · hrm-api `:28001` **200** · xbos `:28002` **200** · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-09d-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09d-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09d-cluster-qa-02/` (14) |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · printable **false** · closed-8 **≠ DONE** |
| **L0** | hrm/xbos/portal **200** (`:5173`) |
| **L1 seal** | GET contract-templates **200** · Nest `/core/contract-templates` **404** Cannot GET · active clauses **38** · open catalog active **38** (>8) |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | Create/list/picker/PREV/PATCH/PUT on `/contracts-insurance/contract-templates*` + `/contracts/*/preview` |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · printable flip · closed-8 DONE · CORE-09c printable DONE |

**Closed (J-03 P0):** FE-02 `updateContractTemplate` PATCH body **omits** `company_id` (query `?company_id=main` only) → **PATCH 200** `HRM-CTR-TPL-200` → **PUT …/clauses 200** for `XEVN_FT_12M_OFFICE` + `XEVN_FT_12M_DRIVER` · F5 `clauses[]=1` distinct IDs · `R-FE-CORE-09D-PATCH-COMPANY-ID` **CLOSED** · `R-QA-CORE-09B-CLAUSE-FP-EMPTY` **CLOSED**.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| HRM / XBOS / portal | **200** / **200** / **200** `:5173` |
| `GET …/contract-templates?company_id=main` | **200** · active **38** (open catalog >8) |
| `GET …/core/contract-templates` | **404** Cannot GET — DENY dual |
| `GET …/contract-clauses?status=active` | **200** · **38** active |
| `GET …?matrix=xevn` | **200** · family count **8** |

---

## Browser U65 — journeys

Persona: auth inject · Settings `?tab=contract-legal` · Contracts spine · **zero-seed**.

**hdsd_align:** Cài đặt → Điều khoản HĐ / Mẫu HĐ → Tạo mẫu #9+ → Lưu → F5 · Hợp đồng picker → Xem trước · edit bind IT/DRIVER · matrix=xevn · mã sai định dạng.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-09D-01** must_keep | Settings → Tạo `TPL_CORE09D-LDM40Y` → Lưu → F5 (+ activate) | **POST** **201** + **PUT** `…/clauses` **200** · F5 row · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09D-02** must_keep | Hợp đồng → Tạo `HD-CORE09D-LDM40Y` → picker #9+ → Xem trước | Picker **listed** · PREV **201** ephemeral · `template_code=TPL_CORE09D-LDM40Y` · no VER INSERT · Nest **0** | **PASS** |
| **J-HRM-CORE-09D-03** retest P0 | Mint `CL_IT_LDM40Y` / `CL_DR_LDM40Y` → open `XEVN_FT_12M_OFFICE` / `DRIVER` → canvas bind → Lưu → F5 | **PATCH** IT **200** + DRIVER **200** · body **`company_id` absent** · **PUT …/clauses 200** ×2 · F5 `clauses[]=1` distinct (`55674fcc…` ≠ `3cbc360e…`) · packs IT_OFFICE/DRIVER · Nest **0** · **no VAL-001** | **PASS** |
| **J-HRM-CORE-09D-04** must_keep | Bad format toast · matrix=xevn · Nest 0 · honesty | Toast format **true** · GET `?matrix=xevn` **200** · open catalog >8 · Nest **0** · printable **false** · closed-8 **≠ DONE** | **PASS** |

### J-03 PATCH body assert (FE-02)

| Template | PATCH | Body keys include `company_id`? | PUT clauses |
|----------|-------|----------------------------------|-------------|
| `XEVN_FT_12M_OFFICE` `d4e27ca5-…` | **200** `HRM-CTR-TPL-200` | **false** (`name_vi`, `pack_code`, `layout_json`, …) | **200** |
| `XEVN_FT_12M_DRIVER` `7811f8bb-…` | **200** `HRM-CTR-TPL-200` | **false** | **200** |

Query scope `?company_id=main` retained on both methods.

Mutated samples (FE U65):
- Template create: `TPL_CORE09D-LDM40Y` · id `7d35722e-a15d-497e-9eab-fe977327bf89`
- Contract: `HD-CORE09D-LDM40Y`
- Clauses minted: `CL_IT_LDM40Y` · `CL_DR_LDM40Y`
- Starters edited: `XEVN_FT_12M_OFFICE` · `XEVN_FT_12M_DRIVER`

Screens: `01`…`14` under `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09d-cluster-qa-02/`.

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-FE-CORE-09D-PATCH-COMPANY-ID** | P0 | — | **CLOSED** (QA-02) |
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | P1 | — | **CLOSED** — F5 `clauses[]=1` distinct IT vs DRIVER |
| **R-QA-CORE-09D-DND-STORM** | P2 | FE later | `@hello-pangea/dnd` / drag-handle storms count≈1020 — not blocking |
| **R-QA-CORE-09D-ACTIVATE-BTN** | P2 | FE later | Create-path activate still flaky historically; this run activate **201** OK |
| Honesty | — | QC | `contracts_printable_ready=false` · C-SLICE · ≠ closed-8 TPL DONE · ≠ module CTR UAT |

**What must not regress:** PATCH edit body omit `company_id` · PUT clauses after edit · create POST+PUT · picker #9+ PREV ephemeral · matrix=xevn · Nest `/core` 0.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/core/*` TPL SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| `pnpm seed:*` / API fake for UF pass | **not used** |
| Flip `contracts_printable_ready` | **false** retained |
| Claim closed-8 TPL DONE | **DENY** |
| Claim CORE-09c VER/PDF = printable DONE | **DENY** |
| Module CORE / CTR / personnel UAT / Phase1 DONE | **DENY** — **C-SLICE** |

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core TPL dual DENY · closed-8 ≠ DONE · CORE-09c ≠ printable DONE
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-02.md` |
| **completion_report** | U65 QA PASS retest after FE-02 — J-03 PATCH 200 (body omit company_id) + PUT …/clauses 200 ×2 on XEVN_FT_12M_OFFICE/DRIVER; F5 clauses[] distinct; must_keep J-01/02/04 PASS; Nest /core 0; printable false; C-SLICE; no seed; P0 PATCH CLOSED; OBS clause FP CLOSED. Residual P2 DnD storm only. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09d
depends_on: QA-02 PASS_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-02.md · stamp CORE09DQA2-MSLDM40Y
entry_criteria: Audit browser evidence J-01..04 PASS; verify PATCH body omit company_id + PUT clauses; honesty seals
exit_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qc-01.md · GO WITH CONDITIONS (C-SLICE · printable=false · ≠ closed-8 DONE · ≠ CORE-09c printable DONE) or NO-GO
cấm: flip contracts_printable_ready · claim closed-8 DONE · claim CORE-09c printable DONE · claim module CORE/CTR UAT · Nest /core dual · seed
J-*: J-HRM-CORE-09D-01..04
residual_note: R-QA-CORE-09D-DND-STORM P2 only
```
