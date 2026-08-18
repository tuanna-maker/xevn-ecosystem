# Evidence — PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | **RECTMQA-MSKVOKQ9** |
| **residual** | `R-REC-02-TARGET-MONTH-DATE` (OBS from **REC02QA-MSKV6ETH**) |
| **depends_on** | `PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01` READY_FOR_QA |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **residual_close** | **`R-REC-02-TARGET-MONTH-DATE` = CLOSED** (closable: true) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **env** | hrm-api `:28001` rebuild+restart `dist/main` · portal `:5173` · commit `dc930c5` (short) |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-02-target-month-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-02-target-month-qa-01.json` |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **be** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-be-01.md` — `normalizeTargetMonthOrThrow` · `HRM-YCTD-VAL-400` |
| **prior OBS** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qa-01.md` stamp **REC02QA-MSKV6ETH** — `target_month:"8"` / `YYYY-MM` → **500** `HRM-SYS-001` |
| **api** | REC-02 API-01 §6 DTO first-of-month · error family `HRM-YCTD-*` |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b (latent; FE omits field — L1 probe OK) |

**cấm respected:** no `pnpm seed:*` · no honesty flip · no module REC UAT claim · no reopen sealed REC-01/02 behavior beyond must_keep smoke.

---

## L0

| Check | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| portal `:5173` | **200** |
| Dist freshness | SRC ≤ DIST · `dist_has_normalize=true` (`normalizeTargetMonthOrThrow` in `yctd-requisition-gates.js`) |
| Restart | Kill stale `node dist/main` → rebuild `pnpm --filter hrm-api run build` → start fresh `dist/main` |
| Verdict | 🟢 **PASS** |

---

## L1 — target_month residual (probe)

| Case | Request | Network | Stored / code | Verdict |
|------|---------|---------|---------------|---------|
| **YYYY-MM** | POST `target_month="2026-09"` (out_of_plan draft) | **201** `HRM-REC-201` | `target_month=2026-09-01` · status `draft` · **not** 500 | 🟢 |
| **YYYY-MM-01** | POST `target_month="2026-09-01"` | **201** `HRM-REC-201` | `2026-09-01` | 🟢 |
| **garbage `"8"`** | POST `target_month="8"` | **400** `HRM-YCTD-VAL-400` | msg «phải là YYYY-MM hoặc YYYY-MM-01» · **not** `HRM-SYS-001` | 🟢 |
| **garbage `not-a-date`** | POST | **400** `HRM-YCTD-VAL-400` | no INSERT | 🟢 |
| **omit** (FE path RETAIN) | POST without field | **201** `HRM-REC-201` | `status=draft` · `target_month=null` | 🟢 |

**Note:** FE create still omits `target_month` — browser UF not required for this residual; L1 closes OBS.

---

## must_keep smoke (no regression)

| Token | Result | Detail |
|-------|--------|--------|
| **SPAWN-DUP** | 🟢 **409** `HRM-YCTD-SPAWN-DUP` | occupied cell `0402ba25-…` |
| **CELL-QTY** | 🟢 **409** `HRM-YCTD-CELL-QTY` | headcount=999 vs cap 8 · qty gate before spawn UQ (freeCells=0 under U65) |
| **MODE-UNCLASSIFIED** | 🟢 **409** `HRM-YCTD-MODE-UNCLASSIFIED` | legacy NULL mode → pipeline-flags |
| **HRM-HC-CELL-LOCKED** no-wipe | 🟢 **409** + grid intact | PUT locked plan → need/lifecycle/cell_id unchanged (`sameCell=true` · `gridIntact=true`) |

---

## Residual close

| ID | Prior | After this QA | State |
|----|-------|---------------|-------|
| **R-REC-02-TARGET-MONTH-DATE** | P2 OBS OPEN (REC02QA-MSKV6ETH) | L1 coerce + VAL-400 proven live | **CLOSED** |

**DENY:** flip `recruitment_uat_ready` · claim module REC UAT · reopen REC-02 cluster L1 seals beyond this residual.

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **R-REC-02-TARGET-MONTH-DATE** | **CLOSED** (closable) |
| **next_owner** | **qc** (narrow GWC seal condition close — recommended; PM may seal trivially from stamp if continuous seat elsewhere) |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-qa-01.md` |
| **completion_report** | L0 rebuild+restart PASS. L1: `2026-09`→`2026-09-01` 201; `2026-09-01` 201; `"8"`/`not-a-date`→400 `HRM-YCTD-VAL-400` (not 500 SYS); omit→draft null RETAIN. must_keep SPAWN-DUP / CELL-QTY / MODE-UNCLASSIFIED / CELL-LOCKED no-wipe PASS. Residual **CLOSED**. Honesty false · C-SLICE · zero-seed. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
depends_on: TARGET-MONTH-QA-01 PASS_TO_PM stamp RECTMQA-MSKVOKQ9
residual: R-REC-02-TARGET-MONTH-DATE (QA says CLOSED)
entry_criteria: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-qa-01.md · raw _tmp-po-hrm-mvp-gd1-rec-02-target-month-qa-01.json · BE-01 docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-be-01.md
MISSION — narrow GWC seal Condition close from REC-02 QC-01:
1) Audit L1: YYYY-MM→first-day 201 · YYYY-MM-01 201 · garbage 400 HRM-YCTD-VAL-400 ≠ SYS-500 · omit draft RETAIN
2) Audit must_keep: SPAWN-DUP 409 · CELL-QTY 409 · MODE-UNCLASSIFIED 409 · HRM-HC-CELL-LOCKED no-wipe
3) Close Condition R-REC-02-TARGET-MONTH-DATE on QC-01 GWC record (or stamp residual CLOSED)
4) DENY: honesty flip · module REC UAT · reopen sealed REC-01/02 UF
exit: GO WITH CONDITIONS (condition closed) or note seal · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-target-month-qc-01.md · PASS_TO_PM
PARALLEL retain: UC-BP-REC-08 SA Option if already DISPATCHED
```
