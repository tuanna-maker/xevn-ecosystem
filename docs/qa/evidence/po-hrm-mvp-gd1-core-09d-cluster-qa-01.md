# Evidence — PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · UC-BP-CORE-09d) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `CORE09DQA-MSLD9JI9` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (J-01/J-02/J-04 PASS · **J-03 FAIL** P0 PATCH `company_id`) |
| **uc_ids** | `UC-BP-CORE-09d` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false`** · personnel/CORE/CTR UAT **false** · **C-SLICE-≠-MODULE** · U65 zero-seed · **≠** closed-8 TPL DONE · **≠** CORE-09c printable DONE |
| **depends_on** | FE-01 READY · `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-01.md` · API-01 CONFIRMED RETAIN |
| **env** | portal `:5173` **200** · hrm-api `:28001` **200** · xbos `:28002` **200** · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-core-09d-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09d-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09d-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **FAIL** · `FAIL_TO_PM` · **C-SLICE** · printable **false** · closed-8 **≠ DONE** |
| **L0** | hrm/xbos/portal **200** (`:5173`) |
| **L1 seal** | GET contract-templates **200** · Nest `/core/contract-templates` **404** Cannot GET · active clauses **36** · open catalog active **37** (>8) |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 FAIL** · **J-04 PASS** |
| **Nest `/core` browser** | **0 hits** |
| **Physical Network** | Create/list/picker/PREV on `/contracts-insurance/contract-templates*` + `/contracts/*/preview` |
| **DENY** | seed unused · honesty false retained · Nest `/core` dual · printable flip · closed-8 DONE |

**Blocker (J-03):** Settings edit existing IT/DRIVER starter → FE `updateContractTemplate` PATCH body includes `company_id` → **400 `HRM-VAL-001`** (`property company_id should not exist`) → `putContractTemplateClauses` **never called** → OBS bind cannot close.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| HRM / XBOS / portal | **200** / **200** / **200** `:5173` |
| `GET …/contract-templates?company_id=main` | **200** `HRM-CTR-TPL-200` · active **37** (open catalog >8) |
| `GET …/core/contract-templates` | **404** Cannot GET — DENY dual |
| `GET …/contract-clauses?status=active` | **200** · **36** active |
| `GET …?matrix=xevn` | **200** · family filter (count **8** starters in matrix family — not closed code IN 8 reject) |

---

## Browser U65 — journeys

Persona: auth inject · Settings `?tab=contract-legal` · Contracts spine · **zero-seed**.

**hdsd_align:** Cài đặt → Điều khoản HĐ / Mẫu HĐ → Tạo mẫu #9+ → Lưu → F5 · Hợp đồng picker → Xem trước · bind IT/DRIVER · matrix=xevn · mã sai định dạng.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-CORE-09D-01** | Settings templates → Tạo `TPL_CORE09D-LD9JI9` → Lưu → F5 (+ L1 activate fallback for picker) | **POST** `/contracts-insurance/contract-templates` **201** `HRM-CTR-TPL-201` + **PUT** `…/clauses` **200** `HRM-CTR-TPL-200` · F5 row còn · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09D-02** | Hợp đồng → Tạo `HD-CORE09D-LD9JI9` → picker `#9+` `TPL_CORE09D-LD9JI9` → Xem trước | Picker option **listed** · PREV **201** `HRM-CTR-PREV-200` ephemeral · `template_code=TPL_CORE09D-LD9JI9` · no VER INSERT · Nest `/core` **0** | **PASS** |
| **J-HRM-CORE-09D-03** | FE mint `CL_IT_*` / `CL_DR_*` (packs IT_OFFICE/DRIVER) → open `XEVN_FT_12M_OFFICE` / `XEVN_FT_12M_DRIVER` → canvas bind → Lưu | Palette **shows** pack-scoped clauses · canvas DnD count≥1 · **PATCH** starter **400** `HRM-VAL-001` company_id · **no PUT …/clauses** · F5 `clauses[]`/`layout` empty · packs IT/DRIVER OK | **FAIL** |
| **J-HRM-CORE-09D-04** | Bad format code toast · matrix=xevn GET · Nest 0 · honesty seals | Toast format-only **true** · GET `?matrix=xevn` **200** · open catalog >8 · Nest `/core` **0** · printable **false** · closed-8 **≠ DONE** | **PASS** |

Mutated samples (FE U65):
- Template create: `TPL_CORE09D-LD9JI9` · id `f7771c73-3adb-4689-9df2-a4bac4b77864`
- Contract: `HD-CORE09D-LD9JI9`
- Clauses minted: `CL_IT_LD9JI9` · `CL_DR_LD9JI9` (POST clauses **201** + activate **201**)
- Starters opened: `XEVN_FT_12M_OFFICE` · `XEVN_FT_12M_DRIVER`

Screens: `01`…`14` under `docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09d-cluster-qa-01/`.

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-FE-CORE-09D-PATCH-COMPANY-ID** | **P0** | **dev-fe** | `updateContractTemplate` / Settings save-edit sends `company_id` in PATCH **body** → BE `HRM-VAL-001`. Query `?company_id=` is OK; body must omit. Blocks PUT …/clauses after edit → J-03 OBS cannot close. Spec: API-01 PATCH DTO. |
| **R-QA-CORE-09B-CLAUSE-FP-EMPTY** | **P1 OPEN** | FE after P0 | Still open until J-03 PUT bind + F5 `clauses[]` distinct PASS |
| **R-QA-CORE-09D-ACTIVATE-BTN** | P2 | FE | Create with status active/activate click flaky — L1 activate used so picker could run (not seed) |
| **R-QA-CORE-09D-DND-STORM** | P2 | FE | `@hello-pangea/dnd` / drag-handle console storms during canvas bind (~1020) — does not alone block after P0 fixed |

**What worked (must not regress):** POST create **201** + PUT clauses **200** on create path · F5 row · open catalog #9+ picker · PREV ephemeral physical · matrix=xevn family GET · CODE-INVALID format toast · Nest `/core` **0** · C-SLICE honesty false.

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
| **ack_status** | **FAIL_TO_PM** |
| **next_owner** | **dev-fe** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-01.md` |
| **completion_report** | U65 QA FAIL — J-01 create POST 201+PUT clauses 200 F5 PASS; J-02 picker #9+ + PREV ephemeral PASS; J-04 matrix=xevn + format toast + Nest/core 0 + honesty PASS; **J-03 FAIL** — FE PATCH edit template 400 HRM-VAL-001 `company_id` in body blocks PUT …/clauses OBS bind (palette had IT/DRIVER clauses). Honesty false · C-SLICE · printable false · no seed · no closed-8 DONE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02
lane: execution · dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-09d
depends_on: QA-01 FAIL_TO_PM · docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-qa-01.md · stamp CORE09DQA-MSLD9JI9
entry_criteria: Fix R-FE-CORE-09D-PATCH-COMPANY-ID — updateContractTemplate PATCH must NOT send company_id in JSON body (query company_id only); Settings edit save must reach PUT …/clauses 200
exit_criteria: vitest + READY_FOR_QA · browser path edit XEVN_FT_12M_OFFICE / DRIVER → PUT clauses 200 · F5 clauses[] or layout distinct · must_keep J-01/02/04 · printable=false · Nest /core DENY · no seed
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-02.md
cấm: invent endpoints · seed · flip contracts_printable_ready · claim closed-8 DONE · reopen sealed CORE-09c/09b/09a rewrite
spec_ref: API-01 F-CORE-CTR-TPL-02 · AC-CORE-09D-OBS-01 · BA O5
```
