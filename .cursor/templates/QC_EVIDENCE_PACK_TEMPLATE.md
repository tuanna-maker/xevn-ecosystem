# QA Evidence Pack — {{WORK_ITEM_ID}}

- work_item_id: `{{WORK_ITEM_ID}}`
- date: `{{YYYY-MM-DD}}`
- from_role: `qa`
- to_role: `qc`
- ack_status: **READY_FOR_QC**
- evidence_path: `docs/qa/evidence/{{FILENAME}}.md`
- portal_url: `http://127.0.0.1:5173` (or resolved via PORTAL_DEV_URL)

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm --filter hrm-api test` | | PASS/FAIL | |
| `pnpm --filter web-portal test` | | | |
| `pnpm --filter web-portal build` | | | |
| `pnpm run qc:dev-stack` | | | |
| `pnpm run verify:capabilities -- --group A1` | | | |
| `pnpm run test:pilot:flows` | | | PORTAL_DEV_URL recorded |

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| J-... | ceo@xe.vn | | | | PASS/FAIL |

## CRUD matrix

| Module / D-row | C | R | U | D | Negative case | Verdict |
|----------------|---|---|---|---|---------------|---------|
| | | | | | | |

## Classification (ENV vs PRODUCT)

- **PRODUCT defects:** (codes, routes) or `none`
- **ENV residuals:** (port, stack down) or `none`

## Residual

- Item / owner / closure command — or **No residual**

## PM dispatch hint

`pm_dispatch_hint: {{WORK_ITEM_ID}} — QC regate after pack verify PASS`
