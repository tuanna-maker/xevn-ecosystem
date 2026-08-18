# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-DOCS-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-01` **GWC** · ATT-SHIFT L1 **SEAL ACCEPT** · stamp **`ATTSHIFTQA-MSK5FXP3`** |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 · SRS · HDSD · DB pointer · journey note) |
| **verdict** | **DOC-DELTA ACCEPT** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` **LOCKED** · ATT-CODE **`ATTCODEQA-MSK4T1A5` SEAL RETAIN** · leave **`ATTLEAVEQA-MSJ7CPJH` SEAL RETAIN** · worksite **`ATTWSQA-MSJC3IN9` SEAL RETAIN** · EMP · SI/CTR · aggregate GĐ1 **SEAL RETAIN** · R-PLT-ATT-CODE-FE-01 **HOLD** · no module ATT UAT · no Phase1 DONE · `C-SLICE-≠-MODULE` · U65 |
| **no_prompt_echo** | **true** — SRS/HDSD client body tiếng Việt sạch (no work_item / pipeline / stamp meta in customer prose) |
| **peer_pattern** | ATT-CODE-CATALOG-DOCS-01 / ATT-WORKSITE-CATALOG-DOCS-01 — ADD-only F.1 + SRS + HDSD slim + DB footer · admin≠consumer · honesty · FE Condition note |
| **fe_note** | **R-PLT-ATT-SHIFT-CNS-02** P2 CONDITION **OPEN** — Nest rebind ShiftChange — **DOCS did NOT invent FE / claim product invent closed on FE** |
| **invent_key_cite** | invent → **`HRM-ATT-SHIFT-KEY`** (alias `HRM-ATT-SHIFT-UNKNOWN`) when active>0 — **≠** CODE / leave / GEO / WS-404 |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md` | GWC SEAL · stamp `ATTSHIFTQA-MSK5FXP3` · invent KEY · admin N+1 · soft-retire · FE CNS-02 CONDITION · honesty false · U88 ba-docs · DENY flip / module ATT UAT / reopen ATT-CODE |
| `po-hrm-dynamic-config-platform-att-shift-catalog-qa-01.md` | L1 PASS cite (parent chain) |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md` | AC-PLT-ATT-SHIFT-01* · VAL-ATT-SHIFT-CNS-* · admin≠consumer · §6.4 journeys · honesty |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md` | Option **B** LOCKED · ADR D1 · F-ATT-CAT-SHIFT · L-ATT-SHIFT-01..14 |
| Peer `po-hrm-dynamic-config-platform-att-code-catalog-docs-01.md` · worksite-docs-01 | **COPY structure** — ADD-only F.1 + SRS + HDSD slim + DB footer |
| Client `SRS_HRM_ENTERPRISE.md` PLT-01 / ATT-01 · `API_DESIGN` · `DB_DESIGN` · HDSD CH05* | Delta target files |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-ATT-CAT-SHIFT-01/02 · F-ATT-CAT-SHIFT-EFF-01 · F-ATT-SHIFT-CNS-01 · §0.1 **`HRM-ATT-SHIFT-KEY`** / WS-VAL/404/409 · **EXPAND** F-ATT-SHIFT-01 · matrix rows · footer **DOC-DELTA CONFIRMED** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-PLT-01 (AC-PLT-ATT-SHIFT-01*) · FR-UC-BP-ATT-01 (Nest SoT · admin≠consumer · Settings REF · FE wire note) · version **0.36** — no new FR |
| [`HDSD_XEVN_CH05d_HRM_DANH_MUC_CA_LAM_VIEC.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05d_HRM_DANH_MUC_CA_LAM_VIEC.md) | **ADD** slim CH05d — quản trị ca vs đổi ca · empty · soft-retire · Settings REF · FE wire note · no full ATT UAT claim |
| [`HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md) | **ADD** peer pointer → CH05d |
| [`HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md) | **EXPAND** peer pointer → CH05d |
| [`HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md) | **EXPAND** peer pointer → CH05d |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer ATT-SHIFT-CATALOG-DOCS-01 · physical `work_shifts` **KEEP** · ba-data HOLD · no DDL |
| [`PILOT_BUSINESS_FLOW_BA_TRACE.md`](../PILOT_BUSINESS_FLOW_BA_TRACE.md) | **ADD** §21e proposed **J-HRM-ATT-SHIFT-CAT-01..04** — **not** claimed UF 🟢 / module ATT UAT |

**Forbidden touched:** none of `apps/**` · no seed · no flip attendance/payroll ready · no reopen ATT-CODE L1 / leave / worksite / EMP / SI / CTR · no invent FE · no wipe prior seals · no aggregate rewrite · no physical DDL.

---

## 3. Coverage checklist (task AC)

| Requirement | Result |
|-------------|--------|
| Nest `work_shifts` SoT · Settings/`shifts` REF only | **PASS** — API F-ATT-CAT-SHIFT-* · SRS PLT-01/ATT-01 v0.36 · HDSD CH05d §2/§5 · DB pointer |
| Admin CREATE N+1 ≠ consumer invent `HRM-ATT-SHIFT-KEY` | **PASS** — F-ATT-CAT-SHIFT-02 vs F-ATT-SHIFT-CNS-01 · AC-PLT-ATT-SHIFT-01b/01d · HDSD §1–3 |
| Soft-retire `status=inactive` · list active default | **PASS** — API CAT-SHIFT-01/02 · AC-01e · HDSD §4 |
| Optional J-HRM-ATT-SHIFT-CAT-* journey note | **PASS** — BA_TRACE §21e proposed · **not** claimed browser PASS |
| Note FE CNS-02 Condition open (no claim product invent closed on FE) | **PASS** — API note · SRS ATT-01 special case · HDSD §5 · evidence §6 |
| no_prompt_echo · ADD-only · honesty | **PASS** |

---

## 4. F.1 spot (admin ≠ consumer)

| F-id | Role | Open N+1 | Invent KEY / assert |
|------|------|----------|---------------------|
| F-ATT-CAT-SHIFT-02 | **ADMIN** | **Allowed** code/name/times/coeff N+1 | Format-only · **cấm** áp `HRM-ATT-SHIFT-KEY` |
| F-ATT-CAT-SHIFT-01 / EFF-01 | **ADMIN / read** list · picker SoT | N/A | N/A |
| F-ATT-SHIFT-CNS-01 | **CONSUMER** đổi ca | N/A | invent when active>0 → **`HRM-ATT-SHIFT-KEY`**; active=0 → skip + CTA · no seed |

---

## 5. must_keep / DENY verify

| Rule | Result |
|------|--------|
| ATT-SHIFT-CATALOG-QC-01 GWC · stamp `ATTSHIFTQA-MSK5FXP3` L1 SEAL | **PASS** — cited · not reopened |
| Invent KEY · admin N+1 · soft-retire | **PASS** — API/SRS/HDSD cite |
| ATT-CODE `ATTCODEQA-MSK4T1A5` · R-PLT-ATT-CODE-FE-01 HOLD | **PASS** — SEAL RETAIN · **no invent FE ATT-CODE** |
| Leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` | **PASS** — SEAL RETAIN |
| EMP / SI / CTR / aggregate | **PASS** — SEAL RETAIN |
| Nest physical `work_shifts` LIVE | **PASS** — DOCS pointer only · no DDL · ba-data HOLD |
| **DENY** Settings/`shifts` sole SoT · FE hardcode sole when active>0 | **PASS** |
| **DENY** `attendance_uat_ready=true` · `payroll_e2e_ready=true` | **PASS** — remain **false** |
| **DENY** module ATT UAT / Phase1 DONE / UF 🟢 | **PASS** · `C-SLICE-≠-MODULE` |
| **DENY** invent FE / claim CNS-02 closed | **PASS** — Condition OPEN note only |
| U65 seed | **PASS** — no seed |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-ATT-SHIFT-DOCS** | Client DOC-DELTA Nest SoT / invent KEY / admin≠consumer / soft-retire / Settings REF | **CLOSED** (this seat) |
| **R-PLT-ATT-SHIFT-CNS-02** | FE ShiftChange Nest rebind when active>0 | **P2 CONDITION OPEN** — **dev-fe** FE-01 (parallel) — **do not invent FE in DOCS** |
| Journey J-HRM-ATT-SHIFT-CAT-01..04 | Proposed map rows (BA §6.4) — browser after FE | **pm** / qa later |
| HDSD CH05 full ATT pillar | Beyond slim CH05d | **HOLD** |
| U88 continuous | Next governance / execution vertical on W8 board | **pm** — after FE+QA or SA next vertical |
| attendance/payroll flip / ATT-CODE-leave-WS reopen / invent FE ATT-CODE | — | **DENIED** |

---

## 7. completion_report

**Closed:** ADD-only client DOC-DELTA for ATT work_shifts catalog Option B after ATT-SHIFT-CATALOG-QC-01 GWC L1 SEAL `ATTSHIFTQA-MSK5FXP3`. API_DESIGN ADD F-ATT-CAT-SHIFT-01/02 + EFF-01 + F-ATT-SHIFT-CNS-01 with §0.1 **`HRM-ATT-SHIFT-KEY`**, EXPAND F-ATT-SHIFT-01 (Nest SoT · Settings REF · soft-retire), admin≠consumer note, matrix + footer; SRS FR-UC-BP-PLT-01 AC-PLT-ATT-SHIFT-01* + FR-UC-BP-ATT-01 deepen at **v0.36**; HDSD CH05d (admin vs Đổi ca, empty, soft-retire, Settings REF, FE wire note) + CH05/CH05b/CH05c pointers; DB_DESIGN footer pointer keeping `work_shifts` LIVE / ba-data HOLD; BA_TRACE §21e proposed J-HRM-ATT-SHIFT-CAT-01..04 (**not** claimed UF 🟢). Cited: Nest SoT · Settings REF only · admin N+1 ≠ consumer invent · soft-retire inactive · list active default · FE CNS-02 Condition **OPEN**. Seals RETAIN: ATT-CODE `ATTCODEQA-MSK4T1A5` · leave · worksite · EMP/SI/CTR · aggregate · R-PLT-ATT-CODE-FE-01 HOLD. Honesty attendance/payroll=false · `C-SLICE-≠-MODULE` · no module ATT UAT / Phase1 / UF 🟢. No `apps/**`, no seed, no seal reopen, no physical DDL.

**Still open:** R-PLT-ATT-SHIFT-CNS-02 P2 → **dev-fe** (parallel); optional browser J-* after FE; full HDSD ATT pillar; U88 next program vertical (PM).

---

## 8. Honesty / non-claims / seals

| Flag / seal | State |
|-------------|-------|
| `attendance_uat_ready` | **false** — DENIED flip |
| `payroll_e2e_ready` | **false** — DENIED flip |
| ATT-CODE L1 `ATTCODEQA-MSK4T1A5` · R-PLT-ATT-CODE-FE-01 HOLD | **SEAL RETAIN** — DENIED reopen / invent FE |
| ATT leave `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** |
| ATT worksite `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** |
| EMP / SI / CTR / aggregate GĐ1 | **SEAL RETAIN** |
| Module ATT UAT / Phase1 DONE / UF 🟢 | **DENIED** — `C-SLICE-≠-MODULE` |
| Settings/`shifts` sole SoT / FE hardcode sole when active>0 | **DENIED** |
| Claim FE CNS-02 product invent closed | **DENIED** — Condition OPEN |
| Seed (U65) | **DENIED** |

---

## 9. next_owner / next_dispatch_prompt

**next_owner:** **pm** → after FE+QA (R-PLT-ATT-SHIFT-CNS-02) **or** SA next vertical (U88) · **DENY** flip attendance/payroll · **DENY** reopen ATT-CODE/leave/WS/EMP/SI/CTR/aggregate · **DENY** invent FE ATT-CODE HOLD

```text
work_item_id: (PM pick — after ATT-SHIFT-CATALOG-DOCS-01 · prefer FE-01 QA when READY else SA next vertical on PO-HRM-CONTINUOUS-W8)
from_role: pm
to_role: qa | sa | ba-process (per continuous board — not ATT UAT invent · not invent FE ATT-CODE)
lane: governance | execution
priority: P2
prior: ATT-SHIFT-CATALOG-QC-01 GWC L1 SEAL · ATT-SHIFT-CATALOG-DOCS-01 DOC-DELTA ACCEPT
evidence_ref: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-docs-01.md
stamp_peer: ATTSHIFTQA-MSK5FXP3 · ATTCODEQA-MSK4T1A5 SEAL · ATTLEAVEQA-MSJ7CPJH SEAL · ATTWSQA-MSJC3IN9 SEAL

entry_criteria:
- DOCS-01 PASS_TO_PM · DOC-DELTA ACCEPT (client SRS v0.36 · API F-ATT-CAT-SHIFT + CNS · HDSD CH05d · DB pointer · BA_TRACE §21e)
- honesty attendance_uat_ready=false · payroll_e2e_ready=false LOCKED
- R-PLT-ATT-SHIFT-CNS-02 Condition OPEN — FE-01 parallel (do not invent FE in DOCS)
- cấm reopen ATT-CODE L1 / leave / WS / EMP / SI / CTR · cấm invent FE ATT-CODE HOLD · cấm module ATT UAT · cấm Phase1 · cấm UF 🟢

scope:
- Prefer: QA after FE-01 READY_FOR_QA (Nest ShiftChange picker) OR SA next vertical on W8 board
- Optional later: browser J-HRM-ATT-SHIFT-CAT-01..04 when FE wire ready

exit_criteria:
- Bus DISPATCHED next seat · honesty flags unchanged false
- C-SLICE-≠-MODULE retained
```

---

## 10. handoff contract

| Field | Value |
|-------|-------|
| **completion_report** | See §7 |
| **next_owner** | **pm** (after FE+QA or SA next vertical; DENY attendance/payroll flip / seal reopen / invent FE ATT-CODE) |
| **next_dispatch_prompt** | See §9 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **DOC-DELTA** | **ACCEPT** |

---

## 11. Self-check (INVALID-HANDOFF if empty)

| File | Exists · non-empty |
|------|--------------------|
| Evidence this file | ✅ |
| `HDSD_XEVN_CH05d_HRM_DANH_MUC_CA_LAM_VIEC.md` | ✅ |
| `SRS_HRM_ENTERPRISE.md` v0.36 delta | ✅ |
| `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-CAT-SHIFT-* | ✅ |
| `DB_DESIGN` footer pointer | ✅ |
