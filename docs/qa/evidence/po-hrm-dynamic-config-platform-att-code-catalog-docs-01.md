# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DOCS-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-QC-01` **GWC** · ATT-CODE L1 **SEAL ACCEPT** · stamp **`ATTCODEQA-MSK4T1A5`** |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 · SRS · HDSD · DB pointer) |
| **verdict** | **DOC-DELTA ACCEPT** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` **LOCKED** · leave **`ATTLEAVEQA-MSJ7CPJH` SEAL RETAIN** · worksite **`ATTWSQA-MSJC3IN9` SEAL RETAIN** · EMP **`EMPDEPTQA-MSK3VVXX`** · **`EMPPOSQA2-MSK3CDH1`** · **`EMPSTQA-MSK20G7H`** · **`EMPCFQA-MSK14LUH`** · **`EMPTOKEXTQA-MSJ57PE1` SEAL RETAIN** · SI/CTR · aggregate GĐ1 **SEAL RETAIN** · no module ATT UAT · no Phase1 DONE · `C-SLICE-≠-MODULE` · U65 |
| **no_prompt_echo** | **true** — SRS/HDSD/API client body tiếng Việt sạch (no work_item / pipeline / stamp meta in customer prose) |
| **peer_pattern** | EMP-STATUS-CATALOG-DOCS-01 / EMP-DEPT-CATALOG-DOCS-01 / ATT-WORKSITE-CATALOG-DOCS-01 — ADD-only F.1 + SRS + HDSD slim + DB footer · admin≠consumer · honesty · FE HOLD |
| **fe_note** | **R-PLT-ATT-CODE-FE-01** P2 HOLD — **DOCS did NOT invent FE Task** (Nest EFF Select rebind deferred) |
| **invent_key_cite** | invent → **`HRM-ATT-CODE-KEY`** (alias `HRM-ATT-CODE-UNKNOWN`) when EFF>0 — **≠** leave / EMP KEY |
| **dto_open_cite** | closed `@IsIn(['pending','present','absent','leave'])` ceiling **DROP** — open slug persist + display `status_label`/`symbol` |
| **counting_cite** | **L-ATT-CODE-07** aggregate / LIST-TOTALS counting **SEALED GĐ1** — typed flags physical only · **≠** leave / worksite / shifts fold |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `po-hrm-dynamic-config-platform-att-code-catalog-qc-01.md` | GWC SEAL · stamp `ATTCODEQA-MSK4T1A5` · invent KEY · DTO open · admin N+1 · soft-retire · display · seals RETAIN · R-PLT-ATT-CODE-FE-01 HOLD · U88 ba-docs · DENY flip / module ATT UAT |
| `po-hrm-dynamic-config-platform-att-code-catalog-qa-01.md` | L1 PASS · invent POST+PATCH **400** `HRM-ATT-CODE-KEY` · open slug **201** · admin **201** · soft-retire EFF hide · honesty false |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md` | AC-PLT-ATT-CODE-01* · VAL-ATT-CODE-CNS-* · admin≠consumer · L-ATT-CODE-07 · honesty · §9 DOC-DELTA |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md` | Option **B** LOCKED · F-ATT-CAT-CODE/EFF · F-ATT-CODE-CNS · L-ATT-CODE-01..14 |
| Peer `po-hrm-dynamic-config-platform-emp-status-catalog-docs-01.md` · `…-emp-dept-catalog-docs-01.md` | **COPY structure** — ADD-only F.1 + SRS + HDSD slim + DB footer · admin≠consumer · honesty · R-*-FE HOLD |
| Client `SRS_HRM_ENTERPRISE.md` PLT-01 · `API_DESIGN_HRM_ENTERPRISE.md` §0.1 + F-ATT-* · `DB_DESIGN` §4.4d · HDSD CH05* | Delta target files |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-ATT-CAT-CODE-01..04 · F-ATT-CAT-CODE-EFF-01 · F-ATT-CODE-CNS-01/02 · §0.1 **`HRM-ATT-CODE-KEY`** · **EXPAND** F-ATT-PUNCH-01 · admin≠consumer note · matrix rows · footer **DOC-DELTA CONFIRMED** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-PLT-01 (AC-PLT-ATT-CODE-01*) · FR-UC-BP-ATT-10 counting note · version **0.35** — no new FR |
| [`HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md) | **ADD** slim CH05c — quản trị ký hiệu vs chọn trên bảng ghi công · empty EFF · soft-retire · no full ATT UAT claim |
| [`HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md) | **ADD** peer pointer → CH05c |
| [`HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md) | **EXPAND** peer pointer → CH05c |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer ATT-CODE-CATALOG-DOCS-01 · physical §4.4d **KEEP** DATA-01 · counting GĐ1 sealed · no DDL this seat |

**Forbidden touched:** none of `apps/**` · no seed · no flip attendance/payroll ready · no reopen leave/worksite/EMP/SI/CTR · no invent FE · no wipe prior seals · no aggregate rewrite · no physical DATA-01 column invent.

---

## 3. Coverage checklist (task AC)

| Requirement | Result |
|-------------|--------|
| SRS/HDSD/API — Nest **F-ATT-CAT-CODE/EFF** = SoT ký hiệu công; Settings `attendance_codes` = **REF merge-read only** (đơn vị thắng — BR-PLT-06); invent KEY when EFF>0; admin CREATE open N+1 ≠ consumer invent | **PASS** — API F-ATT-CAT-CODE-01..04/EFF · CNS-01/02 · SRS PLT-01 v0.35 · HDSD CH05c §1–3 · DB pointer |
| Cite DTO open + display; **L-ATT-CODE-07** counting sealed; ≠ leave/worksite/shifts fold | **PASS** — API DROP `@IsIn(4)` note · CNS-02 `status_label`/`symbol` · counting sealed note · HDSD §5 · SRS ATT-10 |
| Peer seals RETAIN · Explicit DENY Settings-MD-alone / FE hardcode sole SoT when EFF>0 / `attendance_uat` flip / module ATT UAT | **PASS** — API Forbidden block · evidence §5/§8 · honesty |
| Evidence path this file · no_prompt_echo · ADD-only · no invent FE | **PASS** |

---

## 4. F.1 spot (admin ≠ consumer)

| F-id | Role | Open N+1 | Invent KEY / assert |
|------|------|----------|---------------------|
| F-ATT-CAT-CODE-02 | **ADMIN** | **Allowed** slug N+1 + typed flags | Format-only · **cấm** áp `HRM-ATT-CODE-KEY` · **cấm** khôi phục `@IsIn(4)` |
| F-ATT-CAT-CODE-01 / 03 / 04 | **ADMIN** list / update / soft-retire | N/A / retire | N/A |
| F-ATT-CAT-CODE-EFF-01 | Read effective | — | Nguồn picker consumer khi EFF>0 · Settings REF merge-read only |
| F-ATT-CODE-CNS-01 | **CONSUMER** `status` | N/A | invent / OOS khi EFF>0 → **`HRM-ATT-CODE-KEY`**; EFF=0 → skip + CTA · no seed |
| F-ATT-CODE-CNS-02 | **CONSUMER** display | N/A | `status_label` + `symbol` từ catalog; hardcode map **chỉ** EFF=0 bootstrap |
| F-ATT-PUNCH-01 (EXPAND) | **CONSUMER** punch/create | N/A | day-code assert khi body có `status` + GEO RETAIN |

---

## 5. must_keep / DENY verify

| Rule | Result |
|------|--------|
| ATT-CODE-CATALOG-QC-01 GWC · stamp `ATTCODEQA-MSK4T1A5` L1 SEAL | **PASS** — cited · not reopened |
| Invent **400** `HRM-ATT-CODE-KEY` (POST+PATCH) when EFF>0 | **PASS** — cited API §0.1 + CNS · ≠ leave/EMP |
| DTO open · open slug persist · `status_label`/`symbol` | **PASS** — API DROP IsIn4 · CNS-02 · QA/QC proven cite |
| Admin N+1 · soft-retire EFF hide | **PASS** — F-ATT-CAT-CODE-02/04 cite |
| **L-ATT-CODE-07** counting sealed GĐ1 | **PASS** — API Forbidden · SRS ATT-10 · DB KEEP · **no** aggregate rewrite |
| Leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` | **PASS** — SEAL RETAIN · **≠** day-code fold |
| EMP DEPT/POS/ST/CUSTOM/EXT stamps listed | **PASS** — SEAL RETAIN |
| SI / CTR | **PASS** — SEAL RETAIN |
| Nest physical §4.4d = DATA-01 SoT | **PASS** — DOCS pointer only · no DDL |
| **DENY** Settings-MD-alone / FE hardcode sole SoT when EFF>0 | **PASS** |
| **DENY** `attendance_uat_ready=true` · `payroll_e2e_ready=true` | **PASS** — remain **false** |
| **DENY** module ATT UAT / Phase1 DONE / UF 🟢 | **PASS** · `C-SLICE-≠-MODULE` |
| **DENY** invent FE Task R-PLT-ATT-CODE-FE-01 | **PASS** — HOLD note only |
| U65 seed | **PASS** — no seed |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-ATT-CODE-DOCS** | Client DOC-DELTA Nest SoT / invent KEY / DTO open / admin≠consumer / counting sealed | **CLOSED** (this seat) |
| **R-PLT-ATT-CODE-FE-01** | Nest EFF Select rebind + early_leave/on_leave reconcile | **P2 HOLD** — **do not invent FE** |
| Journey J-HRM-ATT-CODE-CAT-01..05 | Optional map rows (BA §6.4) after Nest LIVE + browser | **pm** / ba-docs later if sponsor wants |
| HDSD CH05 full ATT pillar | Beyond slim CH05c | **HOLD** |
| U88 continuous | Next governance / execution vertical on W8 board | **pm** — not idle program on DOCS seal alone |
| attendance/payroll flip / leave-WS-EMP-SI-CTR reopen / aggregate rewrite | — | **DENIED** |

---

## 7. completion_report

**Closed:** ADD-only client DOC-DELTA for ATT attendance-code (ký hiệu công) catalog Option B after ATT-CODE-CATALOG-QC-01 GWC L1 SEAL `ATTCODEQA-MSK4T1A5`. API_DESIGN ADD F-ATT-CAT-CODE-01..04 + CODE-EFF-01 + F-ATT-CODE-CNS-01/02 with §0.1 **`HRM-ATT-CODE-KEY`**, EXPAND F-ATT-PUNCH-01, admin≠consumer note, DROP closed `@IsIn(4)` ceiling cite, counting GĐ1 sealed; SRS FR-UC-BP-PLT-01 AC-PLT-ATT-CODE-01* at **v0.35** (+ ATT-10 counting note); HDSD CH05c (admin vs bảng ghi công pick, empty EFF, soft-retire) + CH05/CH05b pointers; DB_DESIGN footer pointer keeping DATA-01 §4.4d physical. Cited: invent KEY when EFF>0 · DTO open + display label/symbol · admin N+1 ≠ consumer invent · Settings REF merge-read only · **L-ATT-CODE-07** counting sealed · ≠ leave/worksite/shifts fold · seals RETAIN (leave `ATTLEAVEQA-MSJ7CPJH` · worksite `ATTWSQA-MSJC3IN9` · EMPDEPT/EMPPOS/EMPST/EMPCF/EXT · SI/CTR · aggregate). Honesty attendance/payroll=false · `C-SLICE-≠-MODULE` · no module ATT UAT / Phase1 / UF 🟢. R-PLT-ATT-CODE-FE-01 P2 HOLD — no FE invent. No `apps/**`, no seed, no seal reopen, no aggregate rewrite, no physical DDL.

**Still open:** R-PLT-ATT-CODE-FE-01 P2 HOLD (no invent this turn); optional journey rows J-HRM-ATT-CODE-CAT-*; full HDSD ATT pillar; U88 next program vertical (PM).

---

## 8. Honesty / non-claims / seals

| Flag / seal | State |
|-------------|-------|
| `attendance_uat_ready` | **false** — DENIED flip |
| `payroll_e2e_ready` | **false** — DENIED flip |
| ATT leave L1 `ATTLEAVEQA-MSJ7CPJH` | **SEAL RETAIN** — DENIED reopen / fold |
| ATT worksite L1 `ATTWSQA-MSJC3IN9` | **SEAL RETAIN** — DENIED reopen / fold |
| EMP DEPT/POS/ST/CUSTOM/EXT stamps | **SEAL RETAIN** — DENIED reopen |
| SI / CTR | **SEAL RETAIN** — DENIED reopen |
| Aggregate / LIST-TOTALS counting GĐ1 | **SEAL RETAIN** — DENIED rewrite |
| Module ATT UAT / Phase1 DONE / UF 🟢 | **DENIED** — `C-SLICE-≠-MODULE` |
| Settings-MD sole SoT / FE hardcode sole when EFF>0 / mega-EAV | **DENIED** |
| Restore closed `@IsIn(4)` ceiling | **DENIED** |
| Seed (U65) | **DENIED** |
| R-PLT-ATT-CODE-FE-01 invent FE | **DENIED** this turn — P2 HOLD note only |

---

## 9. next_owner / next_dispatch_prompt

**next_owner:** **pm** → U88 continuous (governance/execution next vertical on `PO-HRM-CONTINUOUS-W8-20260807` board) · retain R-PLT-ATT-CODE-FE-01 P2 HOLD · **DENY** flip attendance/payroll · **DENY** reopen leave/WS/EMP/SI/CTR/aggregate · **DENY** invent FE

```text
work_item_id: (PM pick from PO-HRM-CONTINUOUS-W8 board — U88 after ATT-CODE-CATALOG-DOCS-01)
from_role: pm
to_role: sa | ba-process | ba-data (per continuous board — not ATT UAT invent · not FE invent · not aggregate rewrite)
lane: governance
priority: P2
prior: ATT-CODE-CATALOG-QC-01 GWC L1 SEAL · ATT-CODE-CATALOG-DOCS-01 DOC-DELTA ACCEPT
evidence_ref: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-docs-01.md
stamp_peer: ATTCODEQA-MSK4T1A5 · leave ATTLEAVEQA-MSJ7CPJH SEAL · worksite ATTWSQA-MSJC3IN9 SEAL · EMPDEPT/EMPPOS/EMPST seals

entry_criteria:
- DOCS-01 PASS_TO_PM · DOC-DELTA ACCEPT (client SRS v0.35 · API F-ATT-CAT-CODE/EFF + CNS · HDSD CH05c · DB pointer)
- honesty attendance_uat_ready=false · payroll_e2e_ready=false LOCKED
- R-PLT-ATT-CODE-FE-01 P2 HOLD — cấm invent FE Task
- cấm reopen leave/WS/EMP/SI/CTR · cấm aggregate rewrite · cấm module ATT UAT · cấm Phase1 · cấm UF 🟢

scope:
- Open next vertical/AC pack on continuous board (peer QSĐ/DEC · residual program · next platform catalog)
- Optional later: journey J-HRM-ATT-CODE-CAT-01..05 ADD only if sponsor wants map rows + browser
- Optional later: unlock FE for R-PLT-ATT-CODE-FE-01 only if sponsor/PM opens FE wave

exit_criteria:
- Bus DISPATCHED next seat · honesty flags unchanged false
- C-SLICE-≠-MODULE retained
```

---

## 10. handoff contract

| Field | Value |
|-------|-------|
| **completion_report** | See §7 |
| **next_owner** | **pm** (U88 continuous — next vertical; DENY attendance/payroll flip / seal reopen / invent FE / aggregate rewrite) |
| **next_dispatch_prompt** | See §9 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **DOC-DELTA** | **ACCEPT** |

---

## 11. Client paths (quick index)

- API: `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` — §0.1 `HRM-ATT-CODE-KEY` · F-ATT-CAT-CODE-01..04/EFF · F-ATT-CODE-CNS-01/02 · F-ATT-PUNCH-01 EXPAND · admin≠consumer note
- SRS: `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` — FR-UC-BP-PLT-01 · AC-PLT-ATT-CODE-01* · ATT-10 · v0.35
- DB: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` — §4.4d KEEP DATA-01 · footer DOC-DELTA DOCS-01
- HDSD: `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05c_HRM_DANH_MUC_KY_HIEU_CONG.md` (+ CH05 / CH05b pointers)
