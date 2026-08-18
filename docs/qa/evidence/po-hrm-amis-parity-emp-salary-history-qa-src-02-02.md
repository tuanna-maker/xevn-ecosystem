# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-02` |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **focus** | **FE-CB-COMPONENT** U65 create/revise |
| **U65** | zero-seed · HDSD latch · Network POST 2xx + body `component_code` · F5 |
| **honesty** | **`payroll_e2e_ready=false`** · **no product-path mirror** · no AMIS DONE |
| **stamp** | `SRCSRC0202-ISYBOK` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-02.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-src-02-02/` |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-02.mjs` |

## Click path (U65)

1. Login `ceo@xe.vn` → portal `:5173`
2. `/hr/employees/:id?tab=contract` → `[data-testid=hdsd-emp-contracts-tab-dai-ngo]`
3. Fill `[hdsd-emp-comp-base]` + allowance amounts 0/1 · reason · create|revise
4. Assert Network POST compensation-packages(/revise) **2xx** · `lines[].component_code`
5. F5 → active package lines persist with `component_code`
6. **Cấm** product-path mirror / seed as PASS substitute

## HDSD inventory (U76)

| testid | visible |
|--------|---------|
| `hdsd-emp-contracts-tab-dai-ngo` | yes |
| `hdsd-emp-compensation-panel` | yes |
| `hdsd-emp-comp-base` | yes |
| `hdsd-emp-comp-allowance-amount-0` | yes |
| `hdsd-emp-comp-allowance-amount-1` | yes |
| `hdsd-emp-comp-create` | no |
| `hdsd-emp-comp-revise` | yes |
| `hdsd-emp-comp-create-unlinked` | yes |
| `hdsd-emp-comp-change-reason` | yes |
| `hdsd-emp-comp-active-lines` | no |

## Honesty locks

| Flag | Value |
|------|-------|
| `payroll_e2e_ready` | **false** |
| Seed | **DENIED** |
| Product-path mirror | **DENIED** (FAIL if FE POST empty) |
| AMIS DONE / module UAT | **DENIED** |

## AC matrix

| AC | Verdict | Notes |
|----|---------|-------|
| **L0** | 🟢 PASS | {"hrm":200,"xbos":200,"portal":200} |
| **AUTH** | 🟢 PASS | ceo@xe.vn token ok |
| **SETUP-SC** | 🟢 PASS | base=4a8b7dc4-cc62-4463-92ca-0c860d05016f an=23bd4a1b-4795-4fe6-8388-0d39be0ced55 xang=08f7eb61-9b28-4da0-bc7e-5bf811a65828 · catalog only |
| **HDSD-LATCH** | 🟢 PASS | {"hdsd-emp-contracts-tab-dai-ngo":true,"hdsd-emp-compensation-panel":true,"hdsd-emp-comp-base":true,"hdsd-emp-comp-allowance-amount-0":true,"hdsd-emp-comp-allowance-amount-1":true,"hdsd-emp-comp-create":false,"hdsd-emp-comp-revise":true,"hdsd-emp-comp-create-unlinked":true,"hdsd-emp-comp-change-reason":true,"hdsd-emp-comp-active-lines":false} |
| **FE-CB-COMPONENT** | 🟢 PASS | post2xx=true base=cc an=cc allHaveCc=true posts=1 mode=revise |
| **F5-PERSIST** | 🟢 PASS | pkg=72971f1b-2000-460f-8148-110a7cb8db7e hasBase=true hasAn=true uiLines=true |
| **UF-CONSOLE** | 🟢 PASS | uncaught=0 pageErr=0 |
| **NO-MIRROR** | 🟢 PASS | product_path_mirror=false · seed_used=false |

## Key steps

- `{"name":"ensure_sc_base","status":"exists","id":"4a8b7dc4-cc62-4463-92ca-0c860d05016f"}`
- `{"name":"ensure_sc_phu_cap_an","status":"exists","id":"23bd4a1b-4795-4fe6-8388-0d39be0ced55"}`
- `{"name":"ensure_sc_phu_cap_xang","status":201,"code":"HRM-SC-201","id":"08f7eb61-9b28-4da0-bc7e-5bf811a65828","note":"catalog prerequisite ≠ C&B package mirror"}`
- `{"name":"pick_emp","id":"80d66820-185d-430d-85a8-3a2645c45916","code":"UAT-0016","company":"holding","mode":"create"}`
- `{"name":"hdsd_inventory","inv":{"hdsd-emp-contracts-tab-dai-ngo":true,"hdsd-emp-compensation-panel":true,"hdsd-emp-comp-base":true,"hdsd-emp-comp-allowance-amount-0":true,"hdsd-emp-comp-allowance-amount-1":true,"hdsd-emp`
- `{"name":"field_snapshot","base":"13.579.000","an":"777.000","xang":"300.000","reason":"U65 FE-CB SRC-02-02 SRCSRC0202-ISYBOK"}`
- `{"name":"action_buttons","reviseVisible":true,"createVisible":false,"createUnlinkedVisible":true,"activeLinesEmpty":true}`
- `{"name":"retry_create_unlinked","prior":"hdsd-emp-comp-revise","priorPosts":[]}`
- `{"name":"fe_cb_save","clicked":"hdsd-emp-comp-revise+create-unlinked","post2xx":true,"posts":[{"method":"POST","status":201,"url":"http://127.0.0.1:5173/api/hrm/contracts-insurance/compensation-packages","code":"HRM-COMP`
- `{"name":"f5_active_pkg","getStatus":200,"pkgId":"72971f1b-2000-460f-8148-110a7cb8db7e","activeLinesVisible":true,"lines":[{"type":"base","component_code":"base","allowance_code":null,"amount":13579000},{"type":"allowance`

## Network POST compensation (sample)

```json
{
  "posts": [
    {
      "method": "POST",
      "status": 201,
      "url": "http://127.0.0.1:5173/api/hrm/contracts-insurance/compensation-packages",
      "code": "HRM-COMP-201"
    }
  ],
  "bodies": [
    {
      "url": "http://127.0.0.1:5173/api/hrm/contracts-insurance/compensation-packages",
      "method": "POST",
      "lines": [
        {
          "line_type": "base",
          "component_code": "base",
          "allowance_code": null,
          "amount": 13579000
        },
        {
          "line_type": "allowance",
          "component_code": "phu_cap_an",
          "allowance_code": "PHU_CAP_AN",
          "amount": 777000
        },
        {
          "line_type": "allowance",
          "component_code": "phu_cap_xang",
          "allowance_code": "PHU_CAP_XANG",
          "amount": 300000
        }
      ],
      "change_reason": "U65 FE-CB SRC-02-02 SRCSRC0202-ISYBOK"
    }
  ]
}
```

## Residuals

- **R-EMP-SH-FE-CB-CLICK** · **CLOSED** — FE Đãi ngộ save POST **201 HRM-COMP-201** with `lines[].component_code` (`base` / `phu_cap_an` / `phu_cap_xang`); F5 active v1 lines persist (stamp `SRCSRC0202-ISYBOK`)
- **OBS-SC-XANG-DEFAULT** · fe/be P3: FE default row `PHU_CAP_XANG` → `phu_cap_xang` was **absent** from `salary_components` → first run **422 HRM-COMP-004**; QA ensured SC catalog (`HRM-SC-201`) as prerequisite (≠ C&B package mirror). Recommend FE gate or catalog seed for DM §33 defaults.
- **OBS-REVISE-CLICK-NO-POST** · fe P3: first click `hdsd-emp-comp-revise` produced `posts=[]` (empty-line active pkg); FE retry `hdsd-emp-comp-create-unlinked` → **201**. Still U65 FE path — not API mirror.

## Honesty / non-claims

- `payroll_e2e_ready=false`
- No `pnpm seed:*` / DB fake / **no** compensation-package product-path mirror
- SETUP-SC = salary_components catalog prerequisite only (`phu_cap_xang` create 201)
- No AMIS parity DONE / module UAT / J-HRM-07 PROCESS claim (out of this wave)

## completion_report

Closed: U65 FE-CB-COMPONENT retest stamp SRCSRC0202-ISYBOK. FE-CB: 🟢 PASS; F5: 🟢 PASS. Honesty: payroll_e2e_ready=false; no seed; no product-path mirror; no AMIS DONE.

## next_owner

qc

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-02
from_role: pm
to_role: qc
lane: governance
GWC FE-CB-COMPONENT residual R-EMP-SH-FE-CB-CLICK closed — evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md
honesty: payroll_e2e_ready=false · no AMIS DONE · no product-path mirror
```

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-02.md`

## ack_status

**PASS_TO_PM**
