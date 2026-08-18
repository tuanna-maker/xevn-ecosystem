# Evidence — `PO-UAT-ATT-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-ATT-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **attendance UAT pack slice** (AC-01/02/03 + J-HRM-06b + SHEETS-CHROME + J-HRM-06c smoke) |
| **priority** | Seal UAT reconfirm · WAIVE_L2 / LV-02 retained · soft NAV-CTA not blocking · module UAT denied |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` |
| **Verdict** | **GO WITH CONDITIONS** — attendance UAT pack slice ACCEPT (`C-SLICE-≠-MODULE`) |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-UAT-ATT-01` `PASS_TO_PM` |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **qa_ref** | [`po-uat-att-01.md`](po-uat-att-01.md) |
| **machine** | [`_tmp-po-uat-att-01.json`](_tmp-po-uat-att-01.json) · stamp **`UATAT-ICUN40`** |
| **screens** | `docs/qa/evidence/screens/po-uat-att-01/` (**21** PNG cited in machine) |
| **prior GWC** | [`po-hrm-att-leave-funnel-qc-01.md`](po-hrm-att-leave-funnel-qc-01.md) · [`po-hrm-att-leave-funnel-qc-02.md`](po-hrm-att-leave-funnel-qc-02.md) |
| **spec_ref** | [`PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md`](../../program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md) §7 · `PROGRAM_JOURNEY_MAP.md` J-HRM-06b / J-HRM-06c |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · no Option C |
| **OS honesty** | `C-SLICE-≠-MODULE` — pack PASS ≠ attendance module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **attendance_uat_ready** | **false** | **DENIED** — soft OBS + slice ≠ full module · **PM must not set true** |
| **WAIVE_L2 / LV-02** | **WAIVED_P1** | **Retained** — not 🟢; **not reopened** |
| **Option C as SoT** | **cấm** | Records leave markers + FE cancel path only |
| **Module attendance UAT** | **DENIED** | Pack slice ≠ module seal |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser FE path only |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT UAT pack reconfirm for **attendance leave→sheet pack slice**: **AC-ATT-LV-SHEET-01/02/03** · **J-HRM-06b** storm≤2 · **SHEETS-CHROME** · **J-HRM-06c smoke** (sign/Chốt visible, **no** mutate). Prior funnel GWC (qc-01/qc-02) retained. Soft **`R-ATT-SHEET-NAV-CTA`** **not blocking** this stamp (`att-sheets-add` visible). Soft OBS remain → **not** clean GO / **not** `attendance_uat_ready=true`.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **AC-ATT-LV-SHEET-01** | Create→Duyệt → mat=`["2027-02-08","2027-02-09"]` · leave rows **2** · F5 **2** · stamp `UATAT-ICUN40` | 🟢 **PASS** reconfirm |
| **AC-ATT-LV-SHEET-02** | HDSD Hủy → POST cancel **201** `HRM-LEAVE-205` · markers **2→0** · F5 **0** · cancelled chip · cancel CTA gone | 🟢 **PASS** (prior CLOSED retained) |
| **AC-ATT-LV-SHEET-03** | Sept `2026-09-23` Duyệt → **409** `HRM-ATT-SHEET-LOCKED` · FE toast expected | 🟢 **PASS** reconfirm |
| **J-HRM-06b** | GET records+sheets /10s = **0** ≤2 | 🟢 **PASS** |
| **SHEETS-CHROME** | list · add CTA · rows=4 · open · storm=2≤4 · emptyFail=false | 🟢 **PASS** |
| **J-HRM-06c** | Sign/Chốt chrome visible · **smoke only** (no submit/sign/close) | 🟢 **PASS smoke** · full mutate = prior map ✅ retained |
| **WAIVE_L2 / LV-02** | WAIVED_P1 · not exercised 🟢 | 🟢 **RETAINED** |
| **R-ATT-SHEET-NAV-CTA** | soft clear this run · add CTA visible via menu | 🟡 soft **not blocking** |
| Module / honesty | Explicit **false** | 🟢 honesty retained |
| Seed / Option C | DENIED | 🟢 U65 |

**Cấm:** `attendance_uat_ready=true` · reopen WAIVE_L2 · Option C as SoT · invent Phase 1 DONE · invent full-module UAT.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| Why | Soft OBS remain · `C-SLICE-≠-MODULE` · LV-02 still **WAIVED_P1** · this seat **J-HRM-06c = smoke** (not full sign/Chốt mutate chain) · sponsor honesty DENIED unless explicit **GO full module** with **zero** P0/P1 |
| Recommended flag state | keep **`attendance_uat_ready=false`** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Funnel QC-01 GWC | `po-hrm-att-leave-funnel-qc-01.md` | PASS_TO_PM | DATE-EXPAND CLOSED · AC-02 was CONDITION |
| Funnel QC-02 delta | `po-hrm-att-leave-funnel-qc-02.md` | PASS_TO_PM | **AC-02 / R-ATT-LV-SHEET-02 CLOSED** · NAV-CTA soft OPEN |
| QA UAT pack | `po-uat-att-01.md` | PASS_TO_PM | **ACCEPT** U65 browser · stamp `UATAT-ICUN40` |
| Machine JSON | `_tmp-po-uat-att-01.json` | verdict PASS | **ACCEPT** |
| QA pack verify | `verify:qc:evidence-pack` on QA MD | **8/8 PASS** | 🟢 entry OK |

### Machine JSON spot (stamp `UATAT-ICUN40`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `UATAT-ICUN40` | 🟢 |
| `l0` hrm/xbos/portal | 200/200/200 | 🟢 |
| `attendance_uat_ready` | **false** | 🟢 honesty |
| `WAIVE_L2` / `LV_02` | true / WAIVED_P1 | 🟢 retained |
| `Option_C` | cấm as SoT | 🟢 |
| LEAVE-CREATE | 201 `HRM-LEAVE-201` id=`d79763cd-…` | 🟢 |
| LEAVE-APPROVE | 201 `HRM-LEAVE-203` · mat 2 days Feb 2027 | 🟢 |
| AC-01 | leave=2 · F5=2 · dates `2027-02-08..09` | 🟢 |
| LEAVE-CANCEL | 201 `HRM-LEAVE-205` · via **browser-network** | 🟢 |
| AC-02 | before=2 after=0 F5=0 · cancelled chip · cancelBtnGone | 🟢 |
| J-HRM-06b `stormWindow.count` | **0** ≤2 | 🟢 |
| SHEETS-CHROME | list/add/open · rows=4 · openStorm=2 · emptyFail=false | 🟢 |
| J-HRM-06c | panel+closeBtn visible · smoke no mutate | 🟢 |
| AC-03 lockApprove | **409** `HRM-ATT-SHEET-LOCKED` day=`2026-09-23` | 🟢 |
| `pageErrors` | `[]` | 🟢 |
| `residual` / `obs` arrays | `[]` | 🟢 no P0/P1 product |
| Console 409 on lock path | Expected AC-03 | 🟢 PRODUCT OK |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `04b-ac01-after-f5.png` | Post-approve F5 path · attendance shell live · UAT NV 0100 approved visible on overview recent — AC-01 persist context |
| `07-fe-after-cancel.png` | Leave mgmt · request list · FE after cancel path — AC-02 FE |
| `13-after-lock-approve.png` | Toast **«Không thể cập nhật đơn»** after closed-sheet approve — **expected AC-03** FE feedback for **409 LOCKED** (not product P0) |
| `20-sheets-list.png` / `22-j06c-open.png` | Sheets list + open sheet · **Ký chốt bảng công** panel (NV Xác nhận active · Chốt disabled) — J-06c **smoke** chrome |
| Screens | **21** PNG cited in machine; spot files **readable** on disk |

### L0 QC spot (same session)

```text
pnpm run qc:dev-stack
→ hrm :28001 200 · xbos :28002 200 · portal :5173 200
(node win UV_HANDLE_CLOSING assert on process exit — ENV OBS; health signals PASS)
```

---

## Gate AC audit (SPEC §7)

| AC / Check | Spec say | UAT stamp `UATAT-ICUN40` | QC |
|------------|----------|--------------------------|-----|
| **AC-ATT-LV-SHEET-01** | Create→Duyệt→leave markers · F5 | PASS mat=2 · rows=2 · F5=2 | 🟢 |
| **AC-ATT-LV-SHEET-02** | Cancel → markers gone | PASS cancel 201 · 2→0 · F5 | 🟢 (prior CLOSED retained) |
| **AC-ATT-LV-SHEET-03** | Closed overlap → 409 LOCKED | PASS 409 + FE toast | 🟢 |
| **J-HRM-06b** | Storm ≤2/10s | count=0 | 🟢 |
| **SHEETS-CHROME** | List/add/open · no empty+auto-reload FAIL | PASS | 🟢 |
| **J-HRM-06c** | Sign spine | **Smoke** visible only | 🟢 smoke · full mutate prior ✅ |
| **LV-02** | WAIVED_P1 | Not claimed 🟢 | 🟢 retained |
| Soft NAV-CTA | Parent soft | add CTA visible · not blocking | 🟡 soft clear |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey | Prior map | UAT 2026-08-07 | QC |
|---------|-----------|----------------|-----|
| **J-HRM-06b** storm / sheet chrome | ✅ PASS | PASS storm=0 · SHEETS-CHROME | 🟢 **reconfirm** |
| **J-HRM-06c** sign/Chốt | ✅ PASS (prior pay-att-close slice) | **Smoke only** (panel visible · no mutate) | 🟢 smoke ACCEPT · full chain **not re-claimed** this pack |
| Module attendance UAT / UF full ATT | — | Out of scope | **DENIED** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| AC-01/02/03 + J-06b + sheets chrome PASS | **PRODUCT OK** | Stamp `UATAT-ICUN40` browser |
| Console/FE toast 409 on AC-03 | **PRODUCT OK** | Expected LOCKED path — not defect |
| Soft `R-ATT-SHEET-NAV-CTA` | **OBS soft** | Cleared this run (add CTA visible) — **not** product NO-GO |
| Prior OVERLAP leave leftovers (Sept/Dec) | **OBS process** | Final stamp used Feb 2027 + Sept 23 lock day |
| `qc:dev-stack` node win assert after 200s | **ENV OBS** | Health PASS; ignore exit assert |
| J-06c full sign mutate not in this stamp | **SCOPE** | Smoke ≠ module seal; prior map PASS retained |
| Module UAT / `attendance_uat_ready` | **GOVERNANCE** | **DENIED** |
| No P0/P1 product residual | **PRODUCT OK** | Machine `residual: []` |

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-01.md
→ PASS 8/8

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-qc-01.md
→ (this file)
```

---

## Conditions (GWC — residual board)

1. **Honesty** — `attendance_uat_ready=false`; LV-02 **WAIVED_P1**; WAIVE_L2 intact; **NOT** Phase 1 DONE; **NOT** attendance module UAT-ready; Option C **cấm**.
2. **Soft `R-ATT-SHEET-NAV-CTA`** — soft clear this stamp (add CTA via `attendance-tab-menu`); may remain harness OBS — **non-blocking**.
3. **J-HRM-06c** — this pack = **smoke chrome only**; full sign→Chốt mutate remains prior journey-map PASS — **do not invent** full-module GO from smoke.
4. **Prior funnel seals** — DATE-EXPAND CLOSED · AC-02 CLOSED — **must_keep**; do not reopen without evidence gap.

**No P0/P1 open → GWC allowed.** Soft NAV-CTA alone does **not** demote to NO-GO.

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| `R-ATT-LEAVE-FUNNEL-DATE-EXPAND` | P0 was | — | **CLOSED** (QC-01) | must_keep |
| `R-ATT-LV-SHEET-02-FE-CANCEL-STUB` | P2 was | — | **CLOSED** (QC-02) | reconfirm UATAT-ICUN40 |
| `R-ATT-SHEET-NAV-CTA` | P2 soft | qa/dev-fe | **SOFT clear this run** · defer OK | not blocking |
| `OBS-OPTION-C-LEAVE-JOIN-GETS` | OBS | — | Soft (not SoT) | retained cấm |
| LV-02 / WAIVE_L2 | — | — | **WAIVED_P1** | not reopened |
| Module UAT | — | — | stays **false** | DENIED promote |

**P0/P1 residuals for this WI:** none.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-01.md` | **PASS 8/8** | 🟢 entry |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-att-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |
| QA machine overall | **PASS** · stamp `UATAT-ICUN40` | PRODUCT OK |
| QA claimed `qc:dev-stack` + `qc:fe-be-health` | L0 200 · ALL PASS | L0 OK |
| QC spot `qc:dev-stack` | hrm/xbos/portal 200 · node win assert ENV OBS | L0 OK |
| Spot screens 04b / 07 / 13 / 22 | readable · visual ACCEPT | ASSET OK |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| AC-01/02/03 · J-HRM-06b · SHEETS-CHROME · J-HRM-06c **smoke** | Full attendance module UAT |
| Prior funnel GWC seals retained | `attendance_uat_ready=true` |
| Soft NAV-CTA not blocking | LV-02 🟢 / reopen WAIVE_L2 |
| Honesty **false** | Phase 1 DONE · production GO · Option C · other HRM modules |
| J-06c chrome visible | Full sign→Chốt mutate re-claim this pack |

**NOT Phase 1 DONE.** **NOT** `attendance_uat_ready`.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-att-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for **attendance UAT pack slice** only (AC-01/02/03 + J-HRM-06b + SHEETS-CHROME + J-HRM-06c smoke). Stamp `UATAT-ICUN40` reconfirms materialize+F5 · cancel markers clear · closed **409 LOCKED** · storm≤2 · sheets chrome · sign/Chốt chrome visible. Prior funnel GWC + AC-02 CLOSED retained. WAIVE_L2 / LV-02 **WAIVED_P1** retained (not reopened). Soft **`R-ATT-SHEET-NAV-CTA` not blocking**. Toast on lock path = expected AC-03. **No P0/P1**. Soft OBS + `C-SLICE-≠-MODULE` → **deny** clean GO and **deny** `attendance_uat_ready=true`. U65 / seed / Option C DENIED. **NOT** Phase 1 DONE.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-ATT-PM-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-ATT-QC-01 GO WITH CONDITIONS
program: PO-UAT-MODULES-PARALLEL-01

task:
  - Bus INTAKE: ATT attendance UAT pack slice GWC — AC-01/02/03 + J-HRM-06b + SHEETS-CHROME + J-06c smoke ACCEPT
  - Keep attendance_uat_ready=false (QC DENIED promote — soft OBS + slice≠module + LV-02 WAIVED_P1)
  - Retain WAIVE_L2 / LV-02 WAIVED_P1 — do NOT reopen
  - Soft R-ATT-SHEET-NAV-CTA — non-blocking; defer harness polish OK
  - Do NOT invent Phase1 DONE / Option C / full J-06c mutate from this smoke pack
  - Continue PO-UAT-MODULES-PARALLEL-01 next module lane — idle-ok this ATT UAT lane

exit: bus updated · honesty flag unchanged · no invent module UAT
evidence: docs/qa/evidence/po-uat-att-qc-01.md
forbidden: attendance_uat_ready=true · reopen WAIVE_L2 · seed · Option C · Phase1 DONE
```
