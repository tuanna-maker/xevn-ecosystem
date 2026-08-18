# Evidence — QA-PO-HRM-CTR-CREATE-REDESIGN-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-CTR-CREATE-REDESIGN-01` |
| **fe handoff** | `docs/qa/evidence/po-hrm-ctr-create-redesign-fe-01.md` |
| **be handoff** | `docs/qa/evidence/po-hrm-ctr-create-redesign-be-01.md` |
| **date** | 2026-08-10 |
| **stamp** | **`CTRCREATEQA1-MSMNOPAF`** |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (C-SLICE partial) · `contracts_printable_ready=false` |
| **persona** | `ceo@xe.vn` / `companyId=main` · portal `http://127.0.0.1:5173/hr/contracts` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-create-redesign-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-create-redesign-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **exit 0** |
| L1 vitest (hrm) | **14 PASS** — `contractCreateWizard.source` · `contractCreatePayload` · `poHrmMvpGd1Core09ClusterFe01` (AC-CTR-UX-01 list honesty lock **updated**) |
| L1 jest (hrm-api) | **3 PASS** — `po-hrm-ctr-create-redesign-be-01.spec.ts` |

## Env note (overlay)

- Added `apps/web/hrm/.env.local` → `VITE_CTR_PRINT_OVERLAY=1` (restart **HRM Vite :8080** to pick up in embedded `/hr`).

## UF-HRM-02 / O8 registry-only

| Check | Result |
|-------|--------|
| «Chỉ lưu sổ» browser (2nd dialog) | **FAIL** — timeout `hdsd-contracts-create-btn` after Step2 DnD console storm |
| API probe POST (script) | **N/A** — probe used invalid `status` / `contract_type` (VAL-001); not product defect |

## O9 / AC-CTR-UX-01

| Check | Result |
|-------|--------|
| `ctr-core09-registry-honesty` / `ctr-print-honesty` / `ctr-core09-honesty` visible | **PASS** — not visible on list + wizard |
| User paragraph `contracts_printable_ready=false` / CORE-09 DONE | **PASS** — body scan negative |

## J-HRM-CTR-CREATE (browser + API)

### J-HRM-CTR-CREATE-01 — Bước 1 AMIS + context

- **Click path:** Login (inject) → `/hr/contracts` → **Thêm hợp đồng** → stepper + `ctr-create-step-1` + `ctr-create-cb-card`
- **Network:** `GET …/contract-create-context` → **200** (browser listener)
- **Verdict:** **PASS** (O1–O3 · O10)

### J-HRM-CTR-CREATE-02 — Bước 2 palette/canvas/preview

- **Click path:** Chọn `XEVN_FT_12M_OFFICE` → **Tiếp** → `ctr-create-step-2` palette + canvas screenshots
- **Network:** POST create on **Tiếp** observed in run; PUT overlay / POST preview **not reliably captured** in JSON after DnD errors
- **Console:** **FAIL class** — repeated `sameNodeDragBind: dragHandleProps missing` on `@hello-pangea/dnd` palette (`isDropDisabled` path)
- **Verdict:** **FAIL** (O6–O7 blocked for drag; preview panel screenshot taken — **PASS_WITH_HOLD** overlay banner off)

### J-HRM-CTR-CREATE-03 — Probation vs FT preview title

- **Verdict:** **HOLD** — catalog missing `XEVN_PROBATION_OFFICE` in active list (probation=false in API scan)

### J-HRM-CTR-CREATE-04 — DRIVER / GPLX

- **Verdict:** **PASS_WITH_HOLD** — `XEVN_FT_12M_DRIVER` in catalog; GPLX block / preview gate **not exercised** in browser this run

### J-HRM-CTR-CREATE-05 — Chỉ lưu sổ + F5

- **Verdict:** **FAIL** — registry-only link not re-tested after wizard crash (code `QCTRRMNOPAF`)

### J-HRM-CTR-CREATE-06 — L2.5 list → sửa khớp

- **Verdict:** **NOT RUN** (blocked by CREATE-05/02)

### J-HRM-CTR-CREATE-07 — Catalog mở ≥9 templates

- **Verdict:** **PASS** — GET templates **200**, count **39**, `XEVN_FT_12M_OFFICE` found

### J-HRM-CTR-CREATE-08 — Honesty scan

- **Verdict:** **PASS** (O9)

## Regression J-HRM-CTR-04..07

| Journey | Verdict | Notes |
|---------|---------|--------|
| **J-HRM-CTR-04** | **PASS** | Open catalog OFFICE + DRIVER `template_code` present (L1 API) |
| **J-HRM-CTR-05** | **FAIL** | UF registry browser incomplete this run |
| **J-HRM-CTR-06** | **NOT RUN** | L2.5 edit wizard |
| **J-HRM-CTR-07** | **PASS** | Mapped to CREATE-07 catalog |

## L1 API (manual verify — valid DTO)

`GET contract-create-context` → **200** `HRM-CTR-CREATE-CTX-200` for employee `3ad58ec2-d480-47e8-b781-91904c561294`.

## Vitest legacy fix

- `poHrmMvpGd1Core09ClusterFe01.source.test.ts` — registry test now expects **no** `ctr-core09-registry-honesty` on `Contracts.tsx` (AC-CTR-UX-01 / FE-01 redesign).

## Screens

- `docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-01/step1-amis.png`
- `docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-01/step2-dnd.png`
- `docs/qa/evidence/screens/po-hrm-ctr-create-redesign-qa-01/step2-preview.png`

## Residual / dispatch

| ID | Severity | Owner | Summary |
|----|----------|-------|---------|
| **FE-CTR-DND-PALETTE-01** | **P1** | dev-fe | `sameNodeDragBind` throws when palette `isDropDisabled` — breaks O6 DnD on Step2 |
| **QA-CTR-REGISTRY-02** | P1 | qa | Retest O8 «Chỉ lưu sổ» + F5 after DnD fix |
| **QA-CTR-L25-06** | P2 | qa | J-HRM-CTR-CREATE-06 after stable create path |

## Honesty footer

> **contracts_printable_ready=false** · **C-SLICE-≠-MODULE** · **cấm** claim printable / CTR module UAT

**ack_status:** **FAIL_TO_PM**
