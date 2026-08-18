# PO-UC-TC-W4-FE-CI01-IFRAME-01 — Contracts CC iframe create CTA + code display

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-FE-CI01-IFRAME-01` |
| **uc_id** | `HRM-CI-01` |
| **date** | 2026-08-04 |
| **from_role** | `dev-fe` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | `FIX` |
| **u65_zero_seed** | **true** |
| **seed_used** | **false** |
| **uat_done** | **false** (not claimed) |
| **must_keep** | `/hr` create path · Leave L2 · DEPT VAL |

---

## Root cause (R-W4E4-CI01-IFRAME-DIALOG)

| Finding | Detail |
|---------|--------|
| **Product** | `hdsd-contracts-create-btn` **does** open create Dialog on CC embed. Dialog Content mounts on **parent** document via `getDialogPortalContainer()` (`?portal=1` iframe) — TECHSPEC §4.1. |
| **QA R3 false FAIL** | Harness asserted `hrm.getByTestId('hdsd-contracts-form-dialog')` **inside iframe only** → 0 nodes. Same click session screenshot `03a-iframe-after-create-click.png` already shows **«Thêm hợp đồng mới»** open over CC. |
| **Direct `/hr`** | `window.parent === window` → portal container null → dialog in same document → frame/page locators both see it. |

---

## FE changes

### P0 — iframe CTA wire / dismiss harden (`Contracts.tsx`)

1. Create button: `type="button"` + `preventDefault` / `stopPropagation` on click → `handleOpenCreate`.
2. `handleDialogOpenChange` + 400ms open-guard; `onPointerDownOutside` / `onInteractOutside` preventDefault during guard (CC iframe → parent portal dismiss race).
3. Iframe latch: `data-testid="hdsd-contracts-form-dialog-open"` (+ `data-hrm-dialog-portal="parent"`) while `dialogOpen` — frame-scoped signal that dialog is open.
4. Dialog Content keeps parent portal; `data-testid=hdsd-contracts-form-dialog` remains on portaled Content (**query via `page` / parent document**).

### P1 — `contract_code` display/search (`useContracts.mapApiContract`)

- Prefer Nest `row.contract_code` when non-blank; else legacy `{employee_code}-HD` / id fallback.
- `HrmContractRecord.contract_code` added on FE API type.
- Closes **R-W4E4-CI01-CODE-DISPLAY** (F5 search by POST `HD-*`).

### Untouched

Leave L2 · DEPT VAL · `/hr` create mutate path · no seed.

---

## Tests

```text
pnpm exec vitest run src/hooks/useContracts.test.ts
→ 10/10 PASS (incl. API contract_code prefer + blank fallback)
```

cwd: `apps/web/hrm`

---

## QA retest (iframe only — U65)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · company `main`  
**Surface:** `http://127.0.0.1:5173/command-center/hrm/contracts` (menu **Hợp đồng**)  
**Cấm:** seed · API-create to fake UF · claim UAT DONE

### Click path

1. Login UI → Command Center → menu **Hợp đồng** (iframe `/hr/contracts?portal=1…`).
2. Click `hdsd-contracts-create-btn` **inside iframe**.
3. Assert dialog open:
   - **Preferred:** `page.getByTestId('hdsd-contracts-form-dialog')` (parent document — real form).
   - **Latch (iframe):** `hrm.getByTestId('hdsd-contracts-form-dialog-open')` visible.
   - **Do not** FAIL solely because dialog node is absent from iframe `document` when parent has `hdsd-contracts-form-dialog`.
4. Fill → **Lưu** (`hdsd-contracts-form-submit`) → Network **POST** `…/contracts-insurance/contracts` **201** `HRM-CON-201`.
5. FE sau 2xx: toast + list count; note returned `contract_code`.
6. **F5** → search by that API `contract_code` → row present.

### Pass criteria

| TC | Pass when |
|----|-----------|
| OPEN iframe | Dialog visible after Thêm (parent locator or latch + parent form) |
| MAIN save | POST 201 from iframe surface (no navigate away to direct `/hr`) |
| FE F5 | Search by API `contract_code` finds row |

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W4-FE-CI01-IFRAME-01
uc_id: HRM-CI-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-dev-fe-ci01-iframe-01.md
next_owner: qa
seed_used: false
uat_done: false
```

### next_dispatch_prompt (copy-ready)

```
work_item_id: PO-UC-TC-W4-QA-E4-CI01-R4
from_role: pm
to_role: qa
ack_status_target: PASS_TO_PM
u65_zero_seed: true
hdsd_align: true

Retest HRM-CI-01 on CC iframe ONLY (no fallback navigate to direct /hr):
1) Login ceo@xe.vn → menu Hợp đồng → command-center/hrm/contracts
2) Click hdsd-contracts-create-btn in iframe
3) Assert dialog: page.getByTestId('hdsd-contracts-form-dialog') OR iframe latch hdsd-contracts-form-dialog-open + parent form — Dialog parent-portals (TECHSPEC §4.1); do not FAIL on iframe-document-only miss
4) Lưu → POST 201 HRM-CON-201; FE toast/count
5) F5 → search by API contract_code (mapApiContract now honors Nest code)
6) Evidence: docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4.md
cấm: seed · claim UAT DONE · Leave L2 / DEPT VAL regression
read_first: docs/qa/evidence/po-uc-tc-w4-dev-fe-ci01-iframe-01.md · docs/qa/professional/by-uc/HRM-CI-01.md
```
