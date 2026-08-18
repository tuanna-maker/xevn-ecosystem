# Evidence — PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · qa |
| **Date** | 2026-08-09 |
| **depends_on** | BE-01 `READY_FOR_QA` — `docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.md` |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` (identity deepen — Option A) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · portal `:5173` · hrm `:28001` |
| **stamp** | `HCELLQA-MSKU39UX` · plan `7fe953c8-8e86-4746-9e27-a38f17ec772a` · **C0** `0402ba25-e172-46a6-b9b1-e0bd455d9422` · YCTD `90ba99ea-6861-4aad-99e1-93c68e82cd65` |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `recruitment_uat_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed · **DENY** claim module REC UAT · **DENY** flip honesty |

---

## Verdict

**PASS_TO_PM** — Option A live on rebuilt `:28001` dist: override **omit** `cell_id` → **200** reuse **same C0**; YCTD stays on C0; re-spawn **`skipped_duplicate:1`** + **`HRM-HC-SPAWN-QTY-DRIFT`** warn; YCTD headcount **5 unchanged** (not silent overwrite to 8). Foreign `cell_id` → **409 `HRM-HC-CELL-ID-MISMATCH`** identity intact. Sealed P0 **EX-01** RETAIN: **409 `HRM-HC-CELL-LOCKED`** + grid + spawn eligible. ALT-03 mint-once PASS via **new-month NK** (m8 reuse / m9 mint). U65 Định biên after MISMATCH: UI not blank, grid renders.

**C-SLICE:** does **not** flip `recruitment_uat_ready` or claim module REC UAT.

---

## L0 + dist gate

| Check | Result |
|-------|--------|
| `qc:fe-be-health` | **ALL PASS** (hrm/xbos/portal 200) |
| Runner L0 | hrm 200 · portal 200 · xbos 200 |
| Dist freshness | Prior running dist **03:00:49** < BE src **03:24:41** → QA **`nest build` + restart** `node dist/main` on `:28001` |
| Dist markers | `HRM-HC-CELL-ID-MISMATCH` + `mintWhenMissing` present in `dist/recruitment/*` |

---

## AC matrix (mission scope)

| AC-ID | Evidence | Verdict |
|-------|----------|---------|
| **AC-REC-HC-CELL-01** | Approve plan need=5 C0=`0402ba25…` → spawn created=1 → PUT `allow_override=true` **omit** `cell_id` need→8 → **200** `HRM-REC-PLAN-200` · GET `cell_id=C0` · need=8 | 🟢 |
| **AC-REC-HC-CELL-01c** | Re-spawn → **created:0** · **skipped_duplicate:1** on C0 · `drift_warnings[0].code=HRM-HC-SPAWN-QTY-DRIFT` (cell 8 vs yctd 5) · YCTD headcount **5→5** (no silent overwrite) | 🟢 |
| **AC-REC-HC-CELL-EX-02** | PUT override + foreign UUID → **409** `HRM-HC-CELL-ID-MISMATCH` · GET still C0 / need=8 | 🟢 |
| **AC-REC-HC-CELL-EX-01** *(sealed P0 regression)* | PUT no override omit cell → **409** `HRM-HC-CELL-LOCKED` · GET C0/need=5/pos=1 intact · spawn after → **201 created:1** | 🟢 |
| **AC-REC-HC-CELL-ALT-03** | New NK = **month 9** on same DEPT_02/CHRO (DATA-01 NK includes month). PUT **200**; m8 reuses `d4a58465…`; m9 mints `ad83a93c…` distinct UUID. *(First attempt with invent `CHRO_ALT` → 400 `HRM-HC-KEY-UNKNOWN` — false negative; EFF catalog only has CHRO.)* | 🟢 |
| **U65 MISMATCH UI** | Browser Định biên after page-context PUT 409 MISMATCH → reload: `blankish=false` · `gridHints=3` · API grid `positions≥1` same C0 · API message VI present | 🟢 |

**spec_ref:** `PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md` §5 · BR-REC-HC-CELL-STABLE · BR-REC-HC-CELL-ID-MISMATCH · BR-REC-01-LOCK · BR-BP-HC-04 · BR-O3-QTY-DRIFT · DATA-01 §6.1–6.2

---

## L1 detail (happy / exception)

### AC-01 / 01c — reuse + O3

| Step | Result |
|------|--------|
| CREATE | **201** `HRM-REC-PLAN-201` plan `7fe953c8-…` title `QA ĐB CELL HCELLQA-MSKU39UX` |
| APPROVE | **200** · lifecycle `need_hire_approved` · C0 `0402ba25-e172-46a6-b9b1-e0bd455d9422` · need=5 |
| Spawn#1 | **201** `HRM-HC-SPAWN-200` created=1 YCTD `90ba99ea-…` headcount=5 cell=C0 |
| PUT omit + override need=8 | **200** · GET cell **still C0** · need=8 |
| Spawn#2 | created=0 skipped=1 · drift warn `HRM-HC-SPAWN-QTY-DRIFT` · YCTD headcount stays **5** |

### EX-02 — MISMATCH

| | |
|--|--|
| Foreign | `4f39387f-c14f-43e4-9c52-51dab3a51f13` |
| Network | **409** `HRM-HC-CELL-ID-MISMATCH` |
| Message | *«Ô định biên đã có định danh cố định — gửi đúng cell_id hoặc bỏ trống để hệ thống giữ nguyên»* |
| After GET | cell_id=C0 · need=8 unchanged |

### EX-01 — LOCKED no-wipe (must_keep)

| | |
|--|--|
| Network | **409** `HRM-HC-CELL-LOCKED` |
| After GET | positions=1 · same C0 · need=5 · lifecycle `need_hire_approved` |
| Spawn | still eligible created=1 |

### ALT-03 — mint once (new month NK)

| | |
|--|--|
| Plan | `817911c4-005c-496a-9c2f-f3976da85238` |
| Before | m8 C0=`d4a58465-2cb4-453c-9612-d2d5b3571a97` |
| After PUT add m9 need=2 (omit ids) | m8 **reuse** same id · m9 **mint** `ad83a93c-2f26-41c5-84ad-d89c422799f3` |

---

## U65 FE sanity (after 409 MISMATCH)

| Step | Evidence |
|------|----------|
| URL | `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=plans` |
| Action | Browser-context PUT foreign cell_id (same auth) → **409 MISMATCH** |
| FE after | Reload Định biên · not blank · grid shell present (`gridHints=3`) · API grid intact |
| Screens | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01/` |
| cấm seed | respected |

**OBS (non-blocking):** toast/`errHints` may be absent when mutate is page-context fetch (not portal Lưu) — parity with QA-02 UF-409-NO-BLANK pattern; API error message + non-blank grid proven.

---

## Residual / out-of-slice

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| **R-REC-HC-OVERRIDE-CELLID** | P2 → **CLOSABLE** | qc | QA PASS Option A live |
| **R-ATT-CRUD-RD-PARITY-SPEC** | P2 | attendance lane | `p1-phase1-be-crud-rd-parity.spec.ts` attendance failures — **record only**, not fixed |
| FE echo belt AC-01b | OUT this seat | optional FE | Mission narrow = L1 omit + MISMATCH UI sanity |

---

## Artifacts

| Path | Role |
|------|------|
| `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.json` | Runner JSON |
| `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01-l1.json` | L1 trail |
| `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.mjs` | Probe runner |
| BE | `po-hrm-mvp-gd1-rec-hc-override-cellid-be-01.md` |
| BA AC | `docs/program/specs/PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md` |
| Baseline sealed | `po-hrm-mvp-gd1-rec-01-cluster-qa-02.md` (EX-01 must_keep) |

---

## Completion contract

- **completion_report:** Closed L1 AC-01/01c/EX-02/EX-01/ALT-03 + U65 MISMATCH UI sanity on live rebuilt dist. Residual R-REC-HC-OVERRIDE-CELLID closable at QC. Attendance parity P2 recorded only. Honesty false · C-SLICE.
- **ack_status:** **PASS_TO_PM**
- **next_owner:** **qc**
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-rec-hc-override-cellid-qa-01.md`
- **next_dispatch_prompt:** (see bus block / below)
