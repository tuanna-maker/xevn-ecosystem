# Evidence — PO-HRM-MVP-GD1-REC-04-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-04-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-6 seat #8) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `REC04QA-MSL1HN1M` |
| **ack_status** | **PASS_TO_PM** |
| **uc_ids** | `UC-BP-REC-04` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-01 READY_FOR_QA · FE-01 READY_FOR_QA · API-01 CONFIRMED |
| **env** | portal `:5173` · hrm-api `:28001` (**rebuild+restart** sealed LIVE) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-04-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-04-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-04-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` |
| **L0** | hrm `:28001` 200 · xbos `:28002` 200 · portal `:5173` 200 · `qc:fe-be-health` ALL PASS |
| **L1 seal** | After rebuild: `POST …/internal-scan` route LIVE · pool `for=internal_scan` 200 · `PATCH posted` → **`HRM-REC-CV-SCAN-REQUIRED`** · empty skip → **`HRM-REC-CV-SCAN-SKIP-REASON`** · Nest `/rec` **404** |
| **L2.5 J-*** | **J-HRM-REC-CV-04-01..04 = PASS** (browser U65) |
| **Network O1** | All scan/mutate paths contain `/recruitment/` · **nest_rec_hits=0** |
| **DENY** | Campaign invent absent · seed unused · honesty false retained · C-SLICE (no module REC UAT claim) |

**Intake note:** At entry, running `dist/main` was **stale** (src had REC-04; dist lacked `internal-scan` · pool rejected scan query props · posted gate absent). QA **rebuild `pnpm --filter hrm-api run build` + restart `start:prod`** then retested — same pattern as REC-00/08 stale-dist seal.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| `qc:dev-stack` | hrm/xbos/portal **200** |
| `qc:fe-be-health` | **ALL PASS** (employees + catalog proxy) |
| Nest `/api/hrm/rec/candidates-pool` | **404** `HRM-DATA-404` Cannot GET — DENY dual SoT |
| `POST …/internal-scan` fake UUID | **404** `HRM-REC-404` Resource not found (**route mapped**, not Cannot POST) |
| `GET …/candidates-pool?for=internal_scan&…` | **200** `HRM-REC-CP-200` |
| `PATCH …/pipeline-flags {posted:true}` pre-scan | **400** `HRM-REC-CV-SCAN-REQUIRED` |
| `POST …/internal-scan {action:skip, skip_reason:''}` | **400** `HRM-REC-CV-SCAN-SKIP-REASON` |

---

## Browser U65 — journeys

Persona inject portal auth · URL `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=requisitions`

| J-* | Click path | Network / FE after 2xx + F5 | Verdict |
|-----|------------|-----------------------------|---------|
| **J-HRM-REC-CV-04-01** | YCTD `open_for_hire` (unique title) → Chi tiết → **Mở quét kho** → chức danh + skill/exp → **Tìm trong kho** | GET `/api/hrm/recruitment/candidates-pool?…&for=internal_scan…` **200** `HRM-REC-CP-200`; results/empty UI; **no seed** | **PASS** |
| **J-HRM-REC-CV-04-02** | 0 hits → **Hoàn tất quét** → F5 → Chi tiết | POST `…/internal-scan` **201** `HRM-REC-200`; flags `internal_scan_done=true`; badge/vết Đã quét | **PASS** |
| **J-HRM-REC-CV-04-03** | YCTD #2 → Bỏ qua không lý do → toast/block; + lý do → Xác nhận → F5 | Empty: FE block; skip POST **201**; F5 `internal_scan_skipped` + reason; L1 SKIP-REASON sealed | **PASS** |
| **J-HRM-REC-CV-04-04** | `posted` trước quét → FE block; sau complete → check posted → **Lưu cờ** → F5 | Before: gate hint / unchecked; after: PATCH flags **200**; `posted=true`; UI «không Campaign»; no Campaign invent | **PASS** |

**hdsd_align:** Tuyển dụng → Yêu cầu tuyển → Chi tiết → Quét kho / cờ pipeline (không Campaign).

**Fixtures (existing open_for_hire — zero-seed):** complete/posted on `QA L1 IN NOMONTH mskv8qfa`; skip on `QA FE IN REC02QA-MSKV6ETH`. Harness opens detail via `yctd-mode-{id}` / full title (avoid shared `QA BOD AC02b05…` prefix collision).

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/rec/*` SoT dual | **DENY** — 0 browser hits · L1 404 |
| Campaign / REC-03 invent | **DENY** — UI label «không Campaign» · no campaign link |
| `pnpm seed:*` / API fake pool | **not used** |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **false** retained |
| Claim module REC UAT / Phase1 DONE | **DENY** — **C-SLICE** only |

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-REC-04-STALE-DIST | Recurring: BE READY_FOR_QA but live `dist` lag → QA must seal rebuild/restart before UF | devops / PM process |
| Honesty | Keep `recruitment_uat_ready=false` · C-SLICE ≠ module UAT | PM/QC |
| Optional | Actor thiếu quyền → 403 FORBIDDEN EX (ceo@ has mutate) — defer persona-negative | qa residual P2 |

**P0 product defects this seat:** none (after harness title-id fix; first run false FAIL on J-03 was row-collision, not product).

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qa-01.md` |
| **completion_report** | U65 browser J-HRM-REC-CV-04-01..04 PASS after BE dist seal; Network `/recruitment/` only; EX codes SCAN-REQUIRED + SKIP-REASON; DENY Campaign/Nest dual/seed/honesty; C-SLICE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-04-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-04
depends_on: QA-01 PASS_TO_PM stamp REC04QA-MSL1HN1M
entry_criteria: read docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qa-01.md + JSON; L0/L1 + J-01..04 PASS
MISSION: GWC C-SLICE — audit browser U65 Quét kho + posted gate + HRM-REC-CV-SCAN-* EX; DENY Campaign/Nest /rec dual/seed/honesty flip; must_keep UV-YCTD/W2; C-SLICE ≠ module REC UAT; update journey map stamp if GO/GWC
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-qc-01.md · GO|GWC|NO-GO · PASS_TO_PM · next_dispatch_prompt (U88 residual + SA/BA peer)
cấm: flip recruitment_uat_ready · claim FR-04 module DONE · reopen REC-03
```
