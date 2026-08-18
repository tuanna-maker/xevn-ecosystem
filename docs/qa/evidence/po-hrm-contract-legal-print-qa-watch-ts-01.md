# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-QA-WATCH-TS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-WATCH-TS-01` |
| **role** | `qa` |
| **date** | 2026-08-07 |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-BE-WATCH-TS-01` READY_FOR_QA |
| **obs_source** | `PO-HRM-E2E-LINK-EMP-QA-J03-01` — nest `--watch` TS2345 |
| **lane** | execution · compile smoke only |
| **u65** | N/A — **no** browser UF · **no** seed |
| **honesty** | `contracts_printable_ready=false` · **DENIED** printable / module UAT claim |
| **ack_status** | **PASS_TO_PM** |

---

## Scope

| In | Out |
|----|-----|
| `tsc --noEmit -p tsconfig.build.json` exit 0 | Browser UF / U65 click path |
| No `TS2345` on `contract-legal-print.service.ts` | Print-spine / PDF product gate |
| Optional nest boot without TS compile error | QC GO (compile-only unless residual flagged) |
| Close OBS watch-TS from J03 | Promote `contracts_printable_ready` |

---

## Verification

| Check | Command / probe | Result |
|-------|-----------------|--------|
| Typecheck | `pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json` | **exit 0** |
| TS2345 filter | stdout/stderr grep `TS2345` \| `contract-legal-print` | **no matches** |
| Source FIX | `resolvePackForEmployee` — `parseJsonObject(row.custom_fields)` then `assertResourceInHrmScope({ company_id, custom_fields: cf }, …)` ~L1222–1231 | **present** |
| Dist FIX | `dist/contracts-insurance/contract-legal-print.service.js` ~L619–620 `const cf = this.parseJsonObject(row.custom_fields)` → assert | **present** |
| CODE-MEMORY | `@CODE-MEMORY-CHANGE` `PO-HRM-CONTRACT-LEGAL-PRINT-BE-WATCH-TS-01` | **present** |
| Boot smoke | `pnpm --filter hrm-api run start:prod` (`node dist/main`) | Nest reached `listen` — **EADDRINUSE :28001** (instance already up). **No** TS compile / load error |
| Live process | `GET http://127.0.0.1:28001/api/hrm` | **200** |

---

## OBS closure

| Id | Prior | Now |
|----|-------|-----|
| nest `--watch` / `tsc` **TS2345** on `contract-legal-print.service.ts` (`custom_fields` string \| object vs scope assert) | OPEN (J03 ops OBS P2) | **CLOSED** — compile smoke PASS |
| `R-HRM-API-WATCH-TS` (this file) | OPEN ops | **CLOSED** for contract-legal-print watch path |

**Note:** J03 product verdict unchanged (personnel UAT still denied). This seat closes **compile OBS only**.

---

## Honesty / promote gate

| Flag | Value |
|------|--------|
| `contracts_printable_ready` | **false** — **do not promote** |
| Printable / UF-HRM print UAT | **DENIED** this work_item |
| Seed | **none** |
| Browser | **not executed** (by design) |

---

## Residual

| Id | Severity | Note |
|----|----------|------|
| — | — | No product residual from this compile seat. Print-spine / PDF gates remain under prior contract-legal-print program (`contracts_printable_ready=false`). |
| QC | N/A | Compile-only — **no QC required** unless PM reopens product print gate. |

---

## Verdict

**PASS_TO_PM** — OBS watch TS2345 on `contract-legal-print.service.ts` **CLOSED**.

---

## Handoff

- `completion_report`: Compile smoke PASS (`tsc` exit 0, no TS2345). Dist+source FIX verified. Boot reached listen (EADDRINUSE only). Live `:28001` `/api/hrm` 200. OBS CLOSED. Honesty false retained. No browser / no seed / no printable promote.
- `next_owner`: **pm**
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-contract-legal-print-qa-watch-ts-01.md`
- `next_dispatch_prompt`: |
  ```text
  work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-WATCH-TS-01
  from_role: qa
  to_role: pm
  ack_status: PASS_TO_PM
  task: Intake — mark OBS nest watch TS2345 / R-HRM-API-WATCH-TS CLOSED on J03 residual board. No QC for compile-only. Do NOT promote contracts_printable_ready. Continue prior program backlog only if other P0/P1 open.
  evidence: docs/qa/evidence/po-hrm-contract-legal-print-qa-watch-ts-01.md
  parent_be: docs/qa/evidence/po-hrm-contract-legal-print-be-watch-ts-01.md
  ```
