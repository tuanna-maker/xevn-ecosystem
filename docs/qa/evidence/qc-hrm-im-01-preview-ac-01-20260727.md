# QC Gate Decision — QC-HRM-IM-01-PREVIEW-AC-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-IM-01-PREVIEW-AC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **slice** | FR-HRM-IM-01 / UC HRM-IM-01 **preview only** — local `:5173` / `:28001` / `:28002` |
| **qa_handoff** | `docs/qa/evidence/qa-hrm-im-01-preview-ac-01-20260727.md` (**PASS** / `PASS_TO_PM`) |
| **runtime** | `docs/qa/evidence/_tmp-qa-hrm-im-01-preview-ac-01-runtime.json` |
| **screenshots** | `docs/qa/evidence/screenshots/qa-hrm-im-01-preview-ac-01/` (4 PNGs) |
| **spec_lock** | `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` · `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` |
| **ba_residual** | `docs/qa/evidence/ba-u71-im-residual-01-20260727.md` (G-IM-01 / SESSION / CATALOG CLOSED) |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · **no** seed in evidence chain |
| **HOLD_DEPLOY** | **YES** — local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **IM-02 commit** | **OUT** — **not** DONE · **not** claimed |

---

## Classification

| Item | Value |
|------|--------|
| **UF / FR** | FR-HRM-IM-01 · UC HRM-IM-01 · Diễn biến preview (#1–#8 slice) |
| **Product class** | Non-persist import **preview** (`SHEET-200`, `dryRun`) — zero employees INSERT |
| **Process class** | Evidence pack + L2.5 host journey + Residual present |
| **ENV** | QC L0 spot at audit: portal `:5173` **200**; HRM/XBOS `/api/health` **404** (path/process — **not** product FAIL). QA runtime proves stack UP at browser run (`2026-07-27T09:09Z`). |

---

## 1. Scope audited

**In scope (local):**
- AC-IM-01-SCOPE-01/02 · SESSION-01/02 · VAL-01..03 (browser U65)
- Network: `POST /api/hrm/spreadsheet/import/preview` → **HTTP 200** + **`SHEET-200`**
- Zero persist: summary total **1109→1109**; unique code not in list; `commitCalls=[]` · `employeesMutate=[]`
- No invent staging / `import_preview_*`
- Spec lock BA residual + API_DESIGN F.1 preview

**Explicitly not approved:**
- HRM-IM-02 commit (`SHEET-201`) / export IM-03
- Phase 1 DONE · PROD-READY · `:8088` / matrix Dev8088
- Invent staging tables or session DDL
- Reopen Dev for product PASS (no P0/P1 product gap)

---

## 2. Evidence pack gate

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-im-01-preview-ac-01-20260727.md
→ PASS: QC evidence pack ready (8/8)
```

| Check | Result |
|-------|--------|
| Pack integrity | **8/8 PASS** (`command_table` · L2.5 journey · Residual · Classification) |
| QA MD readable | Yes |
| Screenshots on disk | `01-employees-list` · `02-import-dialog-open` · `03-preview-table` · `04-after-f5` (all present, ~177–204 KB) |
| Runtime JSON | Present — all AC `PASS`; network `status:200` `code:SHEET-200`; `hasSessionId:false`; `dryRun:true`; totals 1109→1109 |
| L0 QC spot | Portal **200**; API health path **404** at audit → **ENV** (ignore for product; cite QA runtime L0 UP) |

---

## 3. Spec / governance existence

| Artifact | Path | QC |
|----------|------|----|
| Team AC lock | `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` | **Present** — SCOPE/SESSION/VAL AC |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` | **Present** — preview F.1 · non-persist |
| BA residual | `ba-u71-im-residual-01-20260727.md` | G-IM-01 / G-IM-SESSION-01 / G-IM-CATALOG-01 **CLOSED** |
| OpenAPI context | BE-HRM-OA-IMPORT-FLEET-01 (G-IM-OPENAPI-01) | Context PASS — not re-audited here |
| Shared lesson | non-persist IM-01 · no staging invent | Honored |

---

## 4. Product audit (QC corroboration)

### 4.1 AC matrix

| AC | QA | QC corroboration | Verdict |
|----|----|------------------|---------|
| **AC-IM-01-SCOPE-01** | PASS | Runtime: before/after total **1109**; `searchValidCode.hit=false` for `QA-IM01-MS309L65-OK`; `commitCalls=[]` · `employeesMutate=[]` | **PASS** |
| **AC-IM-01-SCOPE-02** | PASS | Preview-alone close; no staging invent; commit OUT | **PASS** |
| **AC-IM-01-SESSION-01** | PASS | `dataKeys` without `sessionId`/`previewToken`; FE rows=4 | **PASS** |
| **AC-IM-01-SESSION-02** | PASS | After F5: `dialogOpen=false` · `stillPreview=false`; UI slice still «1109» | **PASS** |
| **AC-IM-01-VAL-01** | PASS | `errorsLen=4` · `SHEET-422` Required email/code · Invalid date; envelope still `SHEET-200` | **PASS** |
| **AC-IM-01-VAL-02** | PASS | Screenshot `03-preview-table`: row1 `NOT_A_REAL_CATALOG_KEY_XYZ` = **Hợp lệ**; no catalog hard-block | **PASS** |
| **AC-IM-01-VAL-03** | PASS | Screenshot row4 `HLD-0996` = **Hợp lệ**; DB-dup hard-fail OUT (IM-02) | **PASS** |

### 4.2 Network / FE post-2xx

| Signal | Evidence | QC |
|--------|----------|-----|
| HTTP | Runtime `actualHttp:200` · `httpExact200:true` | **PASS** |
| Envelope | `SHEET-200` · message `Import preview` · `dryRun:true` | **PASS** |
| Persist | Totals unchanged; no employee mutate | **PASS** |
| Seed | `seed:false` · U65 | **PASS** |
| Stale HTTP 201 | Closed after hrm-api restart in QA run | **CLOSED** (process) |

### 4.3 Screenshot spot-check

`03-preview-table.png`: dialog «Import nhân viên từ Excel» · file `QA-IM01-MS309L65-preview.csv` · **2 Hợp lệ / 2 Lỗi** · row errors match VAL-01 · fake catalog + dup code rows **Hợp lệ** · background total **1109** · CTA «Import 2 nhân viên» present (QA cancelled — no commit).

---

## 5. L2.5 journey coverage (U19)

| J-* / path | In-scope this gate? | Status |
|------------|---------------------|--------|
| **J-HRM-02** (employees list host) + IM-01 preview click path | Yes | **PASS** — list → Import Excel → upload → preview → Cancel → F5 |
| Dedicated **J-HRM-IM-01** | Not in `PROGRAM_JOURNEY_MAP.md` | **N/A** — optional BA add later (condition, non-blocking) |
| Other HRM/CC/mobile J-* | No | Deferred — out of slice |

**GO WITH CONDITIONS** lists: **J-HRM-02 + IM-01 preview PASS**; no IM-02 journey claimed.

---

## Command table (QC audit trail)

| Step | Action | Result |
|------|--------|--------|
| 1 | Open QA evidence + runtime + screenshots | Present · PASS claims |
| 2 | `verify:qc:evidence-pack` on QA MD | **8/8 PASS** |
| 3 | Corroborate AC vs runtime JSON | All AC PASS |
| 4 | Spot-check PNG preview table | Matches VAL-01..03 · SCOPE totals |
| 5 | Spec lock + BA residual | G-IM soft CLOSED · no staging invent |
| 6 | Decision | **GO WITH CONDITIONS** |

---

## Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **C-IM01-LOCAL-01** | — | **OPEN (condition)** | HOLD_DEPLOY · NOT Phase1/PROD/:8088 |
| **C-IM01-IM02-OUT** | — | **OUT** | Commit/export not tested · not DONE |
| **C-IM01-JMAP-01** | P3 | **OPEN (soft)** | Propose BA add `J-HRM-IM-01` to journey map (optional) |
| HTTP 201 stale process | P3 | **CLOSED** | QA restart → 200; aligns BE HTTP align WI |
| Staging invent | — | **None** | Honored |
| Product P0/P1 | — | **None** | No Dev reopen |

---

## 6. Conditions (bounded)

| ID | Condition | Owner | Expiry / trigger |
|----|-----------|-------|------------------|
| **C-IM01-LOCAL-01** | Slice **local only** · **HOLD_DEPLOY** · **NOT** Phase1 / PROD / `:8088` | PM | Until explicit sponsor promote wave |
| **C-IM01-IM02-OUT** | IM-02 commit / export **OUT** — do not claim DONE from this gate | PM / QA | Separate WI when sponsor opens IM-02 |
| **C-IM01-JMAP-01** | Optional: add `J-HRM-IM-01` to `PROGRAM_JOURNEY_MAP.md` | BA / PM | Non-blocking; host **J-HRM-02** already PASS |

**Residual risk:** Member-CEO / `:8088` / commit path **untested**. L0 API health path at QC audit time ENV-noisy — do not reopen product.

---

## 7. Decision

### **GO WITH CONDITIONS**

- FR-HRM-IM-01 preview AC (**SCOPE / SESSION / VAL**) **PASS** on local U65 browser evidence.
- Network **HTTP 200** + **`SHEET-200`** · zero persist · no commit · no sessionId.
- Evidence pack **8/8**; screenshots + runtime corroborate QA.
- Spec residuals G-IM-01 / SESSION / CATALOG remain **CLOSED** (no staging invent).
- **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD** · **NOT :8088** · **NOT IM-02 DONE**.

No Dev-FE / Dev-BE reopen for this slice unless preview contract regresses (HTTP≠200, persist, or session invent).

---

## 8. Handoff

### completion_report

- **Closed:** QC gate `QC-HRM-IM-01-PREVIEW-AC-01` — **GO WITH CONDITIONS** for IM-01 preview local; all AC-IM-01-SCOPE/SESSION/VAL PASS; pack 8/8; zero persist; no commit; U65 honored.
- **Residual / conditions:** HOLD_DEPLOY local-only; IM-02 OUT; optional J-HRM-IM-01 map row; NOT Phase1/PROD/:8088.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-HRM-IM-01-PREVIEW-CLOSE-01
from_role: qc
to_role: pm
entry: QC-HRM-IM-01-PREVIEW-AC-01 GO WITH CONDITIONS — docs/qa/evidence/qc-hrm-im-01-preview-ac-01-20260727.md
actions:
1) Bus INTAKE — mark FR-HRM-IM-01 preview AC CLOSED (local GWC)
2) HOLD_DEPLOY — do NOT promote :8088 / Phase1 / PROD from this slice
3) Do NOT claim IM-02 DONE; do NOT invent staging; do NOT reopen Dev for PASS product
4) Optional soft (non-blocking): BA add J-HRM-IM-01 to PROGRAM_JOURNEY_MAP (host J-HRM-02 already PASS)
5) Continue program backlog (pm:idle:check) — next open WI unrelated to IM-02 unless sponsor opens commit wave
ack_status: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/qc-hrm-im-01-preview-ac-01-20260727.md`

### ack_status

**PASS_TO_PM**
