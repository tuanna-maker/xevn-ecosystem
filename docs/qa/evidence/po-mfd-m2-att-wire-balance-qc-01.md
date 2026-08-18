# Evidence — `PO-MFD-M2-ATT-WIRE-BALANCE-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-WIRE-BALANCE-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — narrow M2 attendance fidelity wire (leave-balance + GĐ2 holds + rules Chung overlap note) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m2-att-wire-balance-01-qa.md`](po-mfd-m2-att-wire-balance-01-qa.md) PASS_TO_PM · FE [`po-mfd-m2-att-wire-balance-01.md`](po-mfd-m2-att-wire-balance-01.md) READY_FOR_QA |
| **spec_ref** | `docs/hrm/SRS.md` leave balance · TechSpec GET `/attendance/leave-balance` · fidelity matrix schedule GĐ2-HOLD · CFG overlap `PO-MFD-M1-ATT-P0-CFG-QA-01` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no fake-green on GĐ2 holds |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · full Attendance STUB cluster · ScanFace · NT inbox · **full** `PO-MFD-M1-ATT-P0-CFG-QC-01` GO · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P1 slice: M2 attendance **wire-balance** fidelity. Browser + runtime prove (1) leave-balance **GET 200** + panel days (no Demo / no forever spin), (2) Ca → Lịch phân ca / Ca làm thêm **honest GĐ2 hold** (not LIVE shift grid), (3) Clock-In → Face ID **hold** with **0** check-in POST / no success toast, (4) Rules Chung **Lưu** → **PATCH 200** on commit `dc930c5` — **cross-ref only** to M1 CFG QA; **do not** double-claim full CFG P0 GO here (M1 CFG QC artifact not yet closed). U65 zero-seed confirmed. **NOT** Phase 1 / UAT DONE.

**Conditions:** QA pack process gap (7/8) does not demote product close · J-HRM-06 full list→detail journey not re-certified this seat (spot leave surface only; map prior ✅) · Face model asset HTML/console noise CONDITION · ~~FE wire doc `cfgNotPersisted`~~ **CLOSED** via `PO-MFD-M2-ATT-CFG-DOC-01` · **NOT** Phase 1 / UAT DONE.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-mfd-m2-att-wire-balance-01.md` (FE) | READY_FOR_QA; leave panel WIRE; shift/OT hold; Face `featureHold`; settings ~~`cfgNotPersisted`~~ **SUPERSEDED** DOC-01 | **ACCEPT** wire 1–3 · settings claim aligned `PO-MFD-M2-ATT-CFG-DOC-01` |
| `docs/qa/evidence/po-mfd-m2-att-wire-balance-01-qa.md` | PASS_TO_PM; matrix 1–4 🟢; uat_done false; U65 | **ACCEPT** |
| `docs/qa/evidence/_tmp-po-mfd-m2-att-wire-balance-01-qa-browser.json` | verdict PASS; leaveBalance GET 200; holds pass; checkInPostCount=0; rules PATCH 200; failReasons=[] | **ACCEPT** Network SoT |
| Screens (5 full paths) | leave panel · schedule hold · OT hold · Face hold · rules success toast | **ACCEPT** visual spot — see command table PNG rows |
| `docs/qa/evidence/po-mfd-m1-att-p0-cfg-qa-01.md` | CFG P0 Chung PATCH 200 + F5 + work-sites (separate seat) | **CROSS-REF** · do **not** claim `PO-MFD-M1-ATT-P0-CFG-QC-01` GO from this file |
| `PO-MFD-M1-ATT-P0-CFG-QC-01` evidence | **GWC** `po-mfd-m1-att-p0-cfg-qc-01.md` (post-audit) | **CROSS-REF** — CFG P0 GWC closed separately; wire seat still not full UAT |

---

## Gate AC audit (narrow M2)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | Nghỉ phép → leave-balance GET 200 + panel (no Demo/spin fake) | GET `/api/hrm/attendance/leave-balance?...&leave_type=annual&year=2026` → **200**; panel `Còn lại: 0 ngày` · Hưởng/Đã dùng/Chờ duyệt; `hasDemo=false` · `foreverSpin=false` · `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/leave-balance-create-dialog.png` | 🟢 **PASS** |
| 2 | Ca → Lịch phân ca / Ca làm thêm → honest GĐ2 hold (not shift grid LIVE) | `holdVisible=true` · `shiftsTableVisible=false` both tabs; PNG schedule «chưa có API lịch ca» · OT «Không hiển thị màn giả danh sách ca» | 🟢 **PASS** — no fake-green LIVE grid |
| 3 | Clock-In → Face ID → hold; no check-in POST/success toast | `holdBanner=true` · `checkInSuccessToast=false` · `checkInPostCount=0`; PNG GĐ2 banner + model error toasts (not success) | 🟢 **PASS** |
| 4 | Rules Chung Lưu PATCH 200 — overlap M1 CFG | PATCH `/api/hrm/attendance/rules?company_id=main` → **200**; success toast «Đã lưu quy định chấm công» | 🟢 **PASS (overlap note)** · **not** full CFG GO |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P1 | QC |
|---------|------------------|-----|
| **J-HRM-06** attendance leave surface (Nghỉ phép → Tạo yêu cầu → leave-balance wire) | **In-scope** spot this gate | **PASS** (GET 200 + panel) |
| **J-HRM-06** full list→detail / cross-nav | Related; not full re-cert this seat | **prior ✅** on `PROGRAM_JOURNEY_MAP.md` · **not** claimed full journey re-close |
| **J-HRM-06b** attendance sheets | Out of this P1 | **untouched** |
| Full Attendance STUB · ScanFace · NT inbox | Out of this P1 (dispatch OOS) | **untouched** |

Mandatory in-scope for this gate: wire AC 1–3 + Chung PATCH honesty note **PASS**. No untested mandatory J-* claimed PASS beyond this slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | leave-balance GET **200** + panel days · schedule/OT GĐ2 holds · Face hold (0 POST) · Chung PATCH **200** + success toast on `dc930c5` |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **7/8** (missing `crud_or_matrix`) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA entry briefly ECONNREFUSED hrm-api → restarted; L0 re-probe **200**; QC `qc:dev-stack` health lines **200** (Windows UV close noise after PASS — known non-blocker) |
| **OUT-OF-SCOPE / CONDITION** | Full STUB cluster · ScanFace · NT inbox · Face model asset path · Phase1/UAT DONE · (CFG DOC drift **CLOSED** DOC-01; M1 CFG = separate GWC) |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote wire-balance close. Face model console spam does **not** bypass hold (Network SoT: 0 check-in POST).

---

## Residual

| Id | Status | Sev | Owner | Blocks this P1 GO? |
|----|--------|-----|-------|--------------------|
| Wire AC 1–3 (balance + holds + Face) | **CLOSED** this seat | — | — | No |
| Chung Lưu PATCH 200 (overlap) | **CLOSED** as wire note | — | — | No — **not** full CFG claim |
| **PO-MFD-M1-ATT-P0-CFG-QC-01** | **GWC** (`po-mfd-m1-att-p0-cfg-qc-01.md`) | P0 program | — | No for wire slice · CFG P0 GWC closed separately · **not** UAT DONE |
| **R-M2-ATT-HRM-DOWN** | OPEN ops | P2 | devops | No — stack 200 at QA/QC spot |
| **R-M2-ATT-FACE-MODELS** | OPEN | P2 | dev-fe | No — hold still honest; asset URLs serve HTML |
| **R-M2-ATT-CFG-DOC** | **CLOSED** | P3 | ba-process | No — closed `PO-MFD-M2-ATT-CFG-DOC-01` (`po-mfd-m2-att-cfg-doc-01.md`) |
| **C-M2-WIRE-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add CRUD/matrix PASS rows on next QA MD |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0** open for this **wire-balance** slice. Full CFG remains separate gate.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Do not** claim **`PO-MFD-M1-ATT-P0-CFG-QC-01` GO** from this evidence — Chung PATCH is overlap corroboration only; dispatch/complete M1 CFG QC separately.
3. **Do not** promote full Attendance STUB cluster / ScanFace / NT inbox from this seat.
4. **Do not** invent Face check-in LIVE / success path — GĐ2 hold must stay honest until dedicated Face wave.
5. **Do not** treat schedule/OT hold text as LIVE shift grid PASS.
6. U65: **no seed** in acceptance path; leave balance «0 ngày» is honest empty, not seed cheat.
7. Face model console errors remain **CONDITION** (ops/asset) — not product NO-GO while hold + 0 POST hold.
8. ~~Align FE/matrix docs that still mention `cfgNotPersisted`~~ — **CLOSED** `PO-MFD-M2-ATT-CFG-DOC-01` (2026-08-04).

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-wire-balance-01-qa.md
→ FAIL 1/8 — missing crud_or_matrix
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P1 wire close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-wire-balance-qc-01.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-wire-balance-qc-01.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-wire-balance-01-qa.md` | **FAIL** exit **1** · **7/8** missing crud_or_matrix (process) |
| `pnpm run qc:dev-stack` | Health **PASS** · hrm/xbos/portal **HTTP 200** (Windows UV close noise after PASS — ENV noise) |
| Disk check 5 PNG (full paths in spot rows below) | **PASS** · all five PNG present on disk |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m2-att-wire-balance-01-qa-browser.json` | **PASS** · leaveBalance.pass · shift*.pass · faceHold.checkInPostCount=0 · rulesPatches[0].status=200 · verdict PASS |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/leave-balance-create-dialog.png` | **PASS** · Số dư phép · Còn lại: 0 ngày · no Demo |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/shifts-schedule-hold.png` + `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/shifts-overtime-hold.png` | **PASS** · GĐ2 hold copy · no LIVE grid |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/clock-in-face-hold.png` | **PASS** · GĐ2 hold banner · model error toast · no success check-in |
| Spot visual `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/settings-rules-save.png` | **PASS** · Thành công · Đã lưu quy định chấm công |
| `node scripts/qa/_tmp-po-mfd-m2-att-wire-balance-01-qa.mjs` (QA prior) | **PASS** (seat evidence; QC observe) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-wire-balance-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m2-att-wire-balance-qc-01.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | hrm/xbos/portal 200 |
| **LOGIN** | `ceo@xe.vn` company_id=main | **PASS** | browser JSON login http 201 |
| **READ** leave-balance | GET 200 + panel days | **PASS** | browser leaveBalance · `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/leave-balance-create-dialog.png` |
| **READ** schedule hold | GĐ2 hold · no shifts-table | **PASS** | `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/shifts-schedule-hold.png` |
| **READ** OT hold | GĐ2 hold · no fake list | **PASS** | `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/shifts-overtime-hold.png` |
| **READ** Face hold | hold · 0 POST check-in | **PASS** | `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/clock-in-face-hold.png` · checkInPostCount=0 |
| **UPDATE** rules Chung | PATCH 200 (CFG overlap) | **PASS** (note) | `docs/qa/evidence/screens/po-mfd-m2-att-wire-balance-01-qa/settings-rules-save.png` · rulesPatches 200 |
| **J-HRM-06** L2.5 spot | leave surface balance wire | **PASS** | this seat |
| Full J-HRM-06 re-cert | list→detail | **prior** | map ✅ · not re-closed |
| Full M1 CFG P0 | AT-14 work-sites/F5/stubs | **CROSS-REF QA only** | `po-mfd-m1-att-p0-cfg-qa-01.md` · QC pending |
| STUB / ScanFace / NT | OOS | **untouched** | dispatch OOS |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not fake-green schedule/OT as LIVE
- Did not invent Face check-in success
- Did not double-claim full `PO-MFD-M1-ATT-P0-CFG-QC-01` GO
- Did not GO without opening QA MD + runtime JSON + PNG spot-check
- Did not NO-GO solely on QA pack format gap or Face model console noise

---

## completion_report

**Closed:** QC L3 narrow gate **PO-MFD-M2-ATT-WIRE-BALANCE-QC-01** → **GO WITH CONDITIONS**. Leave-balance WIRE + GĐ2 holds (schedule/OT/Face) honest; Chung PATCH 200 noted as CFG overlap only; U65 zero-seed; no fake-green on holds.

**Open / residual owners:** Face models asset (`dev-fe`); QA pack crud_or_matrix format (`qa`); hrm-api keep-alive (`devops`). **CLOSED after GWC:** M1 CFG QC GWC · R-M2-ATT-CFG-DOC (`PO-MFD-M2-ATT-CFG-DOC-01`).

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-WIRE-BALANCE-CLOSE-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
verdict: GO WITH CONDITIONS — docs/qa/evidence/po-mfd-m2-att-wire-balance-qc-01.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-WIRE-BALANCE-01 / QC-01 as GWC wire-balance slice only; uat_done false; NOT Phase1/UAT DONE.
2) Do NOT stamp full Attendance STUB / ScanFace / NT from this GWC.
3) M1 CFG QC + CFG-DOC-01 **closed** (GWC + doc retire) — do not re-dispatch unless regression.
4) Optional P2: Task dev-fe R-M2-ATT-FACE-MODELS (model URLs serve HTML).
5) Keep devops aware R-M2-ATT-HRM-DOWN (hrm-api :28001 before embed QA).

evidence_path: docs/qa/evidence/po-mfd-m2-att-wire-balance-qc-01.md
```

## ack_status

**PASS_TO_PM**
