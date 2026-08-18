# Evidence — `PO-UAT-ATT-J06C-FULL-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-ATT-J06C-FULL-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **J-HRM-06c FULL mutate seat ONLY** (sign×3 → Chốt → FE Đã chốt → F5) |
| **priority** | Close parent smoke gap · WAIVE_L2 / LV-02 retain · deny module promote |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` |
| **Verdict** | **GO WITH CONDITIONS** — J-HRM-06c **FULL** mutate seat ACCEPT (`C-SLICE-≠-MODULE`) |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-UAT-ATT-J06C-FULL-01` `PASS_TO_PM` · `READY_FOR_QC` |
| **prior GWC** | [`po-uat-att-qc-01.md`](po-uat-att-qc-01.md) — J-06c was **smoke only** |
| **qa_ref** | [`po-uat-att-j06c-full-01.md`](po-uat-att-j06c-full-01.md) |
| **machine** | [`_tmp-po-uat-att-j06c-full-01.json`](_tmp-po-uat-att-j06c-full-01.json) · stamp **`J06CF-IDKL2E`** · AC-03 delta **`J06AC3-DQXDU`** |
| **screens** | `docs/qa/evidence/screens/po-uat-att-j06c-full-01/` (11 PNG; spot **24** / **25** / **26**) |
| **spec_ref** | `PROGRAM_JOURNEY_MAP.md` **J-HRM-06c** · SPEC §7 AC-ATT-LV-SHEET-01..03 |
| **U65** | observe-only · zero-seed · no `apps/**` · no Option C · no WAIVE reopen |
| **OS honesty** | `C-SLICE-≠-MODULE` — seat PASS ≠ attendance module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **attendance_uat_ready** | **false** | **DENIED** — WAIVE_L2 still open · soft OBS · slice ≠ full module · **PM must not set true** |
| **WAIVE_L2 / LV-02** | **WAIVED_P1** | **Retained** — not 🟢; **not reopened** |
| **Option C as SoT** | **cấm** | Leave markers + FE cancel path only |
| **Module attendance UAT** | **DENIED** | Full-mutate seat ≠ module seal |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser FE path only |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT **J-HRM-06c FULL** mutate seat (closes parent `PO-UAT-ATT-QC-01` smoke-only gap): open `submitted` sheet `3934591a…` → POST signatures **201×3** → POST close **201** → FE badge **Đã chốt** + toast «Đã chốt bảng chấm công.» → F5 list/sheet **`status=closed`**. AC-01/02/03 regression **PASS**. WAIVE_L2 / LV-02 **WAIVED_P1 RETAIN**. Soft OBS (OVERLAP leftovers · soft NAV-CTA) **non-blocking**. **No P0/P1 product**. Soft OBS + WAIVE open + `C-SLICE-≠-MODULE` → **deny** clean module GO and **deny** `attendance_uat_ready=true`.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **J-HRM-06c FULL** | sign×3 201 · close 201 · FE Đã chốt · F5 closed · stamp `J06CF-IDKL2E` | 🟢 **PASS full** (not smoke) |
| **AC-ATT-LV-SHEET-01** | mat=`["2027-04-06","2027-04-07"]` · leave=2 · F5=2 | 🟢 **PASS** |
| **AC-ATT-LV-SHEET-02** | cancel 201 `HRM-LEAVE-205` · markers 2→0 · F5=0 | 🟢 **PASS** |
| **AC-ATT-LV-SHEET-03** | July `2026-07-20` approve → **409** `HRM-ATT-SHEET-LOCKED` (delta `J06AC3-DQXDU`) | 🟢 **PASS** |
| **WAIVE_L2 / LV-02** | WAIVED_P1 · not exercised 🟢 | 🟢 **RETAINED** |
| Soft OVERLAP / NAV-CTA | process / soft | 🟡 soft **not blocking** |
| Module / honesty | Explicit **false** | 🟢 honesty retained |
| Seed / Option C | DENIED | 🟢 U65 |

**Cấm:** `attendance_uat_ready=true` · reopen WAIVE_L2 · Option C as SoT · invent Phase 1 DONE · invent full-module UAT from this seat.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| Why | **WAIVE_L2 / LV-02 still WAIVED_P1 (open)** · soft OBS remain · `C-SLICE-≠-MODULE` · this seat = **J-06c full mutate ONLY** — **not** QC GO full attendance module with zero P0/P1 across module |
| Recommended flag state | keep **`attendance_uat_ready=false`** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Parent ATT UAT pack QC | `po-uat-att-qc-01.md` | GWC · J-06c **smoke** | Gap: full mutate |
| QA J-06c FULL | `po-uat-att-j06c-full-01.md` | PASS_TO_PM · READY_FOR_QC | **ACCEPT** |
| Machine JSON | `_tmp-po-uat-att-j06c-full-01.json` | verdict PASS · stamp `J06CF-IDKL2E` | **ACCEPT** |
| AC-03 delta | `_tmp-po-uat-att-j06c-full-01-ac03.json` | 409 LOCKED July day | **ACCEPT** |
| QA pack verify | `verify:qc:evidence-pack` on QA MD | **8/8 PASS** | 🟢 entry OK |

### Machine JSON spot (stamp `J06CF-IDKL2E`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `J06CF-IDKL2E` | 🟢 |
| `l0` hrm/xbos/portal | 200/200/200 | 🟢 |
| `attendance_uat_ready` | **false** | 🟢 honesty |
| `WAIVE_L2` / `LV_02` | true / WAIVED_P1 RETAIN | 🟢 retained |
| `Option_C` | cấm as SoT | 🟢 |
| `j06c.sheetId` | `3934591a-50ec-452b-940f-7f29ede50272` | 🟢 |
| `j06c.statusBefore` → `statusAfter` | `submitted` → `closed` | 🟢 |
| `j06c.signaturesPost2xx` | **3** | 🟢 |
| `j06c.closePost2xx` | **1** | 🟢 |
| `j06c.feClosedChip` | true | 🟢 |
| `j06c.f5Status` | `closed` | 🟢 |
| Network POST `/signatures` | **201** ×3 | 🟢 |
| Network POST `/close` | **201** ×1 | 🟢 |
| AC-01 leave | 2 · F5=2 · Apr 2027 | 🟢 |
| AC-02 cancel | 201 `HRM-LEAVE-205` · 2→0 · F5=0 | 🟢 |
| AC-03 lockApprove | **409** `HRM-ATT-SHEET-LOCKED` day=`2026-07-20` | 🟢 |
| `pageErrors` | `[]` | 🟢 |
| `residual` | `[]` | 🟢 no P0/P1 product |
| Console 409 | Expected OVERLAP attempt + LOCKED path | 🟢 PRODUCT OK / OBS process |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `24-after-signs.png` | 3× **Đã xác nhận** · «Đủ điều kiện chốt bảng» · **Chốt bảng công** enabled · toast «Đã ghi nhận xác nhận ký.» | 🟢 |
| `25-after-close.png` | Badge **Đã chốt** · toast «Đã chốt bảng chấm công.» · «Bảng đã chốt — chỉ xem lịch sử ký» | 🟢 |
| `26-after-f5.png` | Sheets list · July `QA-SHEET-MFD-M2` **Đã chốt** persist after reload | 🟢 |

### L0 QC spot (same session)

```text
pnpm run qc:dev-stack
→ hrm :28001 200 · xbos :28002 200 · portal :5173 200
(node win UV_HANDLE_CLOSING assert on process exit — ENV OBS; health signals PASS)
```

---

## Gate AC / journey audit

| AC / Journey | Spec say | Stamp `J06CF-IDKL2E` | QC |
|--------------|----------|----------------------|-----|
| **J-HRM-06c FULL** | NV→QL→HCNS sign → Chốt → F5 closed | signatures 201×3 · close 201 · FE Đã chốt · F5 closed | 🟢 **PASS full** |
| **AC-ATT-LV-SHEET-01** | Create→Duyệt→markers · F5 | PASS mat=2 · F5=2 | 🟢 |
| **AC-ATT-LV-SHEET-02** | Cancel → markers gone | PASS cancel 201 · 2→0 | 🟢 |
| **AC-ATT-LV-SHEET-03** | Closed overlap → 409 LOCKED | PASS July day (delta after Sept OVERLAP) | 🟢 |
| **LV-02** | WAIVED_P1 | Not claimed 🟢 | 🟢 retained |

### L2.5 journey matrix (U19)

| Journey | Prior map | This seat 2026-08-07 | QC |
|---------|-----------|----------------------|-----|
| **J-HRM-06c** | ✅ PASS (prior pay-att-close) · parent UAT pack = **smoke** | **FULL mutate PASS** (sign×3 + close + FE + F5) | 🟢 **reconfirm FULL** — closes smoke gap |
| Module attendance UAT / UF full ATT | — | Out of scope | **DENIED** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| J-06c full sign→close→F5 PASS | **PRODUCT OK** | Stamp `J06CF-IDKL2E` browser |
| AC-01/02/03 PASS | **PRODUCT OK** | Regression retained |
| Console/FE 409 on AC-03 LOCKED | **PRODUCT OK** | Expected — not defect |
| First AC-03 Sept OVERLAP | **OBS process** | Delta July day PASS — no seed |
| Soft `R-ATT-SHEET-NAV-CTA` | **OBS soft** | Parent soft; not reopened; not blocking |
| `qc:dev-stack` node win assert after 200s | **ENV OBS** | Health PASS; ignore exit assert |
| WAIVE_L2 / LV-02 open | **GOVERNANCE** | Retained WAIVED_P1 — blocks module promote |
| Module UAT / `attendance_uat_ready` | **GOVERNANCE** | **DENIED** |
| No P0/P1 product residual | **PRODUCT OK** | Machine `residual: []` |

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-j06c-full-01.md
→ PASS 8/8

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-j06c-full-qc-01.md
→ (this file)
```

---

## Conditions (GWC — residual board)

1. **Honesty** — `attendance_uat_ready=false`; LV-02 **WAIVED_P1**; WAIVE_L2 intact; **NOT** Phase 1 DONE; **NOT** attendance module UAT-ready; Option C **cấm**.
2. **Seat scope** — ACCEPT **J-HRM-06c FULL** mutate only; closes parent smoke gap — **do not** invent full-module GO.
3. **Soft OBS** — Sept OVERLAP leftovers (process) · soft `R-ATT-SHEET-NAV-CTA` — **non-blocking**.
4. **Prior seals** — ATT UAT pack GWC + funnel qc-01/qc-02 — **must_keep**; AC-01/02 CLOSED retained.

**No P0/P1 open → GWC allowed.** Soft OBS + open WAIVE alone do **not** demote this seat to NO-GO.

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| J-06c smoke gap (parent qc-01) | — | — | **CLOSED** this seat | full mutate proven |
| Soft OVERLAP leftovers | OBS process | — | OPEN soft | July day delta worked |
| `R-ATT-SHEET-NAV-CTA` | P2 soft | qa/dev-fe | soft · defer OK | not blocking |
| LV-02 / WAIVE_L2 | — | — | **WAIVED_P1** | not reopened |
| Module UAT | — | — | stays **false** | DENIED promote |

**P0/P1 residuals for this WI:** none.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-j06c-full-01.md` | **PASS 8/8** | 🟢 entry |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-j06c-full-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |
| QA machine overall | **PASS** · stamp `J06CF-IDKL2E` | PRODUCT OK |
| QA claimed `qc:dev-stack` + `qc:fe-be-health` | L0 200 · ALL PASS | L0 OK |
| QC spot `qc:dev-stack` | hrm/xbos/portal 200 · node win assert ENV OBS | L0 OK |
| Spot screens 24 / 25 / 26 | readable · visual ACCEPT full mutate | ASSET OK |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| **J-HRM-06c FULL** sign×3 → close → FE Đã chốt → F5 | Full attendance module UAT |
| AC-01/02/03 regression PASS | `attendance_uat_ready=true` |
| Parent smoke gap **CLOSED** | LV-02 🟢 / reopen WAIVE_L2 |
| Soft OBS not blocking | Phase 1 DONE · production GO · Option C · other HRM modules |
| Honesty **false** | Module-wide UF / persona matrix seal |

**NOT Phase 1 DONE.** **NOT** `attendance_uat_ready`.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-att-j06c-full-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for **J-HRM-06c FULL mutate seat ONLY**. Stamp `J06CF-IDKL2E`: open submitted sheet → POST signatures **201×3** → POST close **201** → FE **Đã chốt** + toast → F5 `closed` (screens 24/25/26 ACCEPT). AC-01/02/03 PASS (AC-03 July LOCKED delta). Parent ATT UAT pack smoke gap **CLOSED**. WAIVE_L2 / LV-02 **WAIVED_P1 RETAIN** (not reopened). Soft OBS non-blocking. **No P0/P1**. **May PM set `attendance_uat_ready=true`? NO** (WAIVE open · soft OBS · `C-SLICE-≠-MODULE` · no full-module GO wording). U65 / seed / Option C DENIED. **NOT** Phase 1 DONE.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-ATT-J06C-FULL-PM-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-ATT-J06C-FULL-QC-01 GO WITH CONDITIONS
program: PO-UAT-MODULES-PARALLEL-01

task:
  - Bus INTAKE: J-HRM-06c FULL mutate seat GWC — signatures 201×3 + close 201 + FE Đã chốt + F5 closed ACCEPT; parent smoke gap CLOSED
  - Keep attendance_uat_ready=false (QC DENIED promote — WAIVE_L2 open + soft OBS + slice≠module)
  - Retain WAIVE_L2 / LV-02 WAIVED_P1 — do NOT reopen
  - Soft OVERLAP / R-ATT-SHEET-NAV-CTA — non-blocking; defer OK
  - Do NOT invent Phase1 DONE / Option C / full attendance module UAT from this seat
  - Continue PO-UAT-MODULES-PARALLEL-01 next open lane — idle-ok this J-06c full seat

exit: bus updated · honesty flag unchanged · no invent module UAT
evidence: docs/qa/evidence/po-uat-att-j06c-full-qc-01.md
forbidden: attendance_uat_ready=true · reopen WAIVE_L2 · seed · Option C · Phase1 DONE
```
