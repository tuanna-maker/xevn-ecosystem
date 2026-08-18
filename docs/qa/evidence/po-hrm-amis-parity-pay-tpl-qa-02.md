# Evidence — `PO-HRM-AMIS-PARITY-PAY-TPL-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-TPL-QA-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **browser UF** (U65) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-TPL-FE-01` READY_FOR_QA · QC-01 L1 GWC |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **stamp** | `PAYTPLQA2-IH3JZR` |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-tpl-qa-02.mjs` |
| **machine JSON** | [`_tmp-po-hrm-amis-parity-pay-tpl-qa-02.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-tpl-qa-02.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-tpl-qa-02/` |
| **verdict** | **PASS** — AC1–AC7 browser UF |
| **ack_status** | **`PASS_TO_PM`** |
| **honesty** | **`payroll_e2e_ready=false`** — **DENIED** invent / module UAT / AMIS DONE |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Badge + const · **DENIED** flip |
| **Pack as mẫu** | **DENIED** | Enroll tab banner + GET `/salary-templates` |
| **DnD formula / FE net** | **DENIED** | GĐ1 form · PUT body no net/gross/AST |
| **Seed** | **DENIED** (U65) | Browser-only mutate |
| **Module UAT / Phase1** | **NOT claimed** | Settings mẫu UF only |

---

## 1. L0 / health

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM / XBOS / portal **200** (Windows UV assert noise after PASS — health rows OK) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Harness L0 | portal/hrm/xbos **200** |
| Seed | **none** |

---

## 2. HDSD inventory (U76)

| testid | Used |
|--------|------|
| `settings-tab-pay-sheet-tpl` | ✅ |
| `pay-sheet-tpl-settings-panel` | ✅ |
| `pay-sheet-tpl-honesty-badge` | ✅ `payroll_e2e_ready=false` |
| `pay-sheet-tpl-pack-alias-note` | ✅ Settings note pack≠mẫu |
| `hdsd-pay-sheet-tpl-code` · `hdsd-pay-sheet-tpl-name` | ✅ |
| `hdsd-pay-sheet-tpl-save-header` · `hdsd-pay-sheet-tpl-new` | ✅ |
| `hdsd-pay-sheet-tpl-line-*` (component/label/sort/ovc) | ✅ |
| `hdsd-pay-sheet-tpl-save-lines` | ✅ |
| `pay-sheet-tpl-list-table` · `pay-sheet-tpl-row-{code}` | ✅ |
| `hdsd-pay-sheet-tpl-edit-{code}` · `hdsd-pay-sheet-tpl-archive-{code}` | ✅ |
| `pay-salary-template-precision` · `pay-salary-template-pack-alias-note` | ✅ pack enroll |
| `payroll-tab-calculate` | ✅ → menuitem «Mẫu bảng lương» (i18n pack alias) |

---

## 3. UF blocks (U65)

### UF-PAY-TPL-01 — Settings tab load (AC1)

- **Persona / URL / click path:** `ceo@xe.vn` · login token inject → `/hr/settings` → `settings-tab-pay-sheet-tpl`
- **FE:** panel `pay-sheet-tpl-settings-panel` + list table · honesty badge `payroll_e2e_ready=false` · pack alias note
- **Verdict:** 🟢 **PASS**

### UF-PAY-TPL-02 — Create mẫu (AC2)

- **Action:** fill code `qa_mau_paytplqa2_ih3jzr` + name → `hdsd-pay-sheet-tpl-save-header`
- **Network:** **POST** `/api/hrm/payroll/pay-sheet-templates` → **201** `HRM-PAY-TPL-201` id `…`
- **FE sau 2xx:** row `pay-sheet-tpl-row-qa_mau_paytplqa2_ih3jzr` appears with name
- **Verdict:** 🟢 **PASS**

### UF-PAY-TPL-03 — Edit lines label/sort/OV-C (AC3)

- **Action:** pick component → sort=`10` → label `Nhãn cột QA PAYTPLQA2-IH3JZR` → OV-C picker (empty formula catalog → «Không override») → `hdsd-pay-sheet-tpl-save-lines`
- **Network:** **PUT** `…/lines` → **200** `HRM-PAY-TPL-200` · body has `formulaOverrideDefinitionId` (null OK) · **no** net/gross/AST keys
- **FE sau 2xx:** display preview shows label + «— (không override)»
- **Note:** Active published formula catalog empty for persona — OV-C **control + field** proven; FK pick optional when catalog empty
- **Verdict:** 🟢 **PASS**

### UF-PAY-TPL-04 — F5 persist (AC4)

- **Action:** hard reload → re-open tab → edit row
- **FE:** list row còn · label + sort=10 restored
- **Verdict:** 🟢 **PASS**

### UF-PAY-TPL-05 — Archive soft-hide (AC5)

- **Action:** `hdsd-pay-sheet-tpl-archive-{code}` → confirm
- **Network:** **POST** `…/archive` → **201**
- **FE:** row hidden from active list
- **Verdict:** 🟢 **PASS**

### UF-PAY-TPL-06 — Pack enroll ≠ mẫu (AC6)

- **Click path:** `/hr/payroll` → `payroll-tab-calculate` → menuitem «Mẫu bảng lương» (i18n `payroll.template` = pack surface)
- **FE:** `pay-salary-template-precision` + banner `pay-salary-template-pack-alias-note` cites `/salary-templates` ≠ Settings `/pay-sheet-templates`
- **Network:** **GET** `/api/hrm/payroll/salary-templates?company_id=main` **200**
- **Verdict:** 🟢 **PASS**

### UF-PAY-TPL-07 — Honesty / no DnD / no FE net (AC7)

- Badge + harness honesty false · process `dndStorm=0` `uncaught=0` · PUT no FE net invent
- **Verdict:** 🟢 **PASS**

---

## 4. Verdict matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| **1** Tab loads | 🟢 PASS | panel + honesty + list |
| **2** Create → POST 2xx → row | 🟢 PASS | 201 `HRM-PAY-TPL-201` |
| **3** Lines label/sort/OV-C | 🟢 PASS | PUT 200 · OV-C field · no FE net |
| **4** F5 data còn | 🟢 PASS | row + label/sort |
| **5** Archive soft-hide | 🟢 PASS | 201 · hidden |
| **6** Pack enroll ≠ mẫu | 🟢 PASS | banner + `/salary-templates` |
| **7** No DnD / no FE net / ready=false | 🟢 PASS | process clean |
| **Overall** | 🟢 **PASS** | stamp `PAYTPLQA2-IH3JZR` |

### L2.5 / journey (U19)

| Journey | Status |
|---------|--------|
| Settings mẫu CRUD UF (this WI) | 🟢 **PASS** |
| **J-HRM-07** process / phiếu lương e2e | ⬜ **NOT claimed** — honesty false |
| Period bind UX on Tạo kỳ | ⬜ deferred (FE residual optional) |

---

## 5. Residual / not promoted

| ID | Note | Owner |
|----|------|-------|
| Period bind UX on Tạo kỳ | API ready · UI deferred (FE-01) | optional `dev-fe` |
| OV-C FK with live published formula | Catalog empty this persona — control+null PASS | OBS |
| `payroll_e2e_ready` | **LOCKED false** | `pm` |
| Module / AMIS UAT | **DENIED** | — |
| R-PAY-SRC-PROCESS | Formula/process wave separate | staged |

### Explicit non-claims

- Did **not** set `payroll_e2e_ready=true`.
- Did **not** treat enroll pack as kỳ mẫu SoT.
- Did **not** exercise DnD formula canvas or FE net invent.
- Did **not** claim J-HRM-07 / payroll module UAT.

---

## 6. Command table

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| `node scripts/qa/_tmp-po-hrm-amis-parity-pay-tpl-qa-02.mjs` | exit **0** · overall **PASS** · stamp `PAYTPLQA2-IH3JZR` |

**U65:** no `pnpm seed:*` · no API-only UF claim · browser mutate only.

---

## completion_report

### Closed

1. Browser U65 Settings → **Mẫu bảng lương**: create → lines (label/sort/OV-C) → F5 → archive soft-hide.  
2. Pack enroll `SalaryTemplatesTab` remains pack-only (banner + GET `/salary-templates`).  
3. Honesty `payroll_e2e_ready=false` retained; no DnD storm; no FE net.  
4. Closes FE-01 browser residual for Settings mẫu CRUD UF (supersedes L1-only for this surface).

### Residual

Period bind UX optional · process SRC / module UAT DENIED · ready flag locked false.

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qc** (browser slice gate) via **pm** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | `PO-HRM-AMIS-PARITY-PAY-TPL-QC-02` browser UF gate — **cấm** flip `payroll_e2e_ready` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P0
prior: PO-HRM-AMIS-PARITY-PAY-TPL-QA-02 PASS_TO_PM (browser UF)
U65: observe-only · zero-seed

## Mission
QC browser slice gate on Settings → Mẫu bảng lương UF (create/lines/F5/archive) + pack≠mẫu enroll tab.
Audit QA-02 evidence + FINAL JSON stamp PAYTPLQA2-IH3JZR + screens.
Cấm invent payroll_e2e_ready=true · cấm claim module UAT / AMIS DONE / Phase1 DONE.
C-SLICE-≠-MODULE retained.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-02.md
2. docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-tpl-qa-02.FINAL.json
3. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
4. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-01.md (L1 prior GWC)

## exit
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-02.md
verdict: GO / GWC / NO-GO
honesty: payroll_e2e_ready=false
```
