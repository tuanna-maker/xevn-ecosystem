# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-DOCS-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QC-01` **GWC** · EMP-POSITION L1 Option A **SEAL ACCEPT** · stamp **`EMPPOSQA2-MSK3CDH1`** |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 · SRS · HDSD · DB pointer) |
| **verdict** | **DOC-DELTA ACCEPT** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · EMP-STATUS **`EMPSTQA-MSK20G7H` SEAL RETAIN** · EMP-CUSTOM **`EMPCFQA-MSK14LUH` SEAL RETAIN** · MergeToken EMP EXT **`EMPTOKEXTQA-MSJ57PE1` SEAL RETAIN** · DOC/ET · ATT/SI/CTR **SEAL RETAIN** · Nest `emp_position` **ABSENT/DENIED** · no module EMP UAT · no Phase1 DONE · `C-SLICE-≠-MODULE` · U65 |
| **no_prompt_echo** | **true** — SRS/HDSD client VI clean (no work_item / pipeline / stamp meta in customer prose) |
| **peer_pattern** | EMP-STATUS-CATALOG-DOCS-01 / EMP-CUSTOM-FIELD-DOCS-01 — ADD-only F.1 + SRS + HDSD slim + DB footer · admin≠consumer · honesty · FE HOLD |
| **fe_note** | FE WH picker deepen **HOLD** — **DOCS did NOT invent FE Task** |
| **invent_key_cite** | invent → **400** `HRM-EMP-POSITION-KEY` · no persist · ≡ `HRM-WH-PICK-REQUIRED` class |
| **be_closed_cite** | **R-PLT-EMP-POS-BE-01 CLOSED** — EmployeesModule imports SettingsCatalogsModule · LIVE invent 400 (not prior 200) |
| **dept_out_cite** | **R-EMP-POS-DEPT-01** OUT follow-on note — same Option A · **not** this docs seat |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `po-hrm-dynamic-config-platform-emp-position-catalog-qc-01.md` | GWC SEAL · stamp `EMPPOSQA2-MSK3CDH1` · invent KEY · no persist · Nest deny · R-PLT-EMP-POS-BE-01 CLOSED · seals RETAIN · dept OUT · FE HOLD · U88 ba-docs · DENY flip / module EMP UAT |
| `po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md` | L1 PASS · invent PATCH/CREATE **400** KEY · STAFF retained · Nest 404 |
| `po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md` | SettingsCatalogs DI wire · closes R-PLT-EMP-POS-BE-01 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md` | AC-PLT-EMP-01* · admin≠consumer · Settings/XBOS SoT · VAL-EMP-POS-CNS-* · §9 DOC-DELTA · honesty · dept OUT |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md` | Option **A** LOCKED · F-EMP-CAT-POS / F-EMP-POS-CNS · L-EMP-POS-* · Nest DENY |
| Peer EMP-STATUS / EMP-CUSTOM DOCS-01 | **COPY structure** — ADD-only F.1 + SRS + HDSD slim + DB footer |
| Client `SRS_HRM_ENTERPRISE.md` PLT-01 · `API_DESIGN_HRM_ENTERPRISE.md` §0.1 + F-EMP-* · `DB_DESIGN` OUT emp_position · HDSD CH06* | Delta target files |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-EMP-CAT-POS-01/02/03 · F-EMP-CAT-POS-EFF-01 · F-EMP-POS-CNS-01..04 · §0.1 **`HRM-EMP-POSITION-KEY`** + **`HRM-WH-PICK-EMPTY-CATALOG`** · admin≠consumer note · matrix rows · footer **DOC-DELTA CONFIRMED** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-PLT-01 (AC-PLT-EMP-01 / 01b / 01c / 01d / 01e) · luồng chính chức danh Settings/XBOS · version **0.33** — no new FR |
| [`HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md) | **ADD** slim CH06f — quản trị / đồng bộ chức danh vs chọn trên hồ sơ · empty · soft-retire · no full EMP UAT claim |
| [`HDSD_XEVN_CH06_HRM_NHAN_SU.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md) | **ADD** peer pointer → CH06f |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer EMP-POSITION-CATALOG-DOCS-01 · ba-data **HOLD** (no Nest `emp_position`) · dept OUT note |

**Forbidden touched:** none of `apps/**` · no seed · no flip personnel/e2e/printable · no reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · no invent FE · no wipe prior seals · no Nest `emp_position` invent.

---

## 3. Coverage checklist (task AC)

| Requirement | Result |
|-------------|--------|
| SRS/HDSD/API — Settings/XBOS `job_titles` = position SoT Option A; invent KEY when EFF>0; admin CREATE/sync N+1 ≠ consumer invent; Nest `emp_position` DENIED | **PASS** — API F-EMP-CAT-POS-* / F-EMP-POS-CNS-* · SRS PLT-01 v0.33 · HDSD CH06f §1–3 · DB HOLD |
| Cite invent → 400 `HRM-EMP-POSITION-KEY` · no persist | **PASS** — evidence cite QC/QA + API §0.1 / CNS |
| Cite **R-PLT-EMP-POS-BE-01 CLOSED** (EmployeesModule SettingsCatalogs wire) | **PASS** — BE-01 + QC + this evidence |
| Cite seals RETAIN · dept companion OUT follow-on | **PASS** — §5 · HDSD §4 · DB OUT note · API OUT note |
| Explicit DENY free-text SoT when EFF>0 / Nest dual master / personnel flip / module EMP UAT | **PASS** — API/SRS/HDSD/DB/evidence honesty |
| Evidence path this file | **PASS** |
| HDSD / SRS / API delta only · no prompt-echo · no wipe · no invent FE | **PASS** |

---

## 4. F.1 spot (admin ≠ consumer)

| F-id | Role | Open N+1 | Invent KEY |
|------|------|----------|------------|
| F-EMP-CAT-POS-02 | **ADMIN** | **Allowed** CREATE/sync | **Forbidden to apply KEY** |
| F-EMP-CAT-POS-01 / 03 / EFF-01 | **ADMIN** list / soft-retire / picker SoT | N/A / retire | N/A |
| F-EMP-POS-CNS-01 | **CONSUMER** WH `position_key` | N/A | **`HRM-EMP-POSITION-KEY`** (≡ WH-PICK-REQUIRED) when EFF>0 |
| F-EMP-POS-CNS-02 | **CONSUMER** EMP `job_title_key` | N/A | same KEY |
| F-EMP-POS-CNS-03 | **CONSUMER** CTR/DEC | N/A | same KEY class · RETAIN spine |
| F-EMP-POS-CNS-04 | **CONSUMER** empty EFF | N/A | **`HRM-WH-PICK-EMPTY-CATALOG`** · no seed |

---

## 5. must_keep / DENY verify

| Rule | Result |
|------|--------|
| EMP-POSITION-CATALOG-QC-01 GWC · stamp `EMPPOSQA2-MSK3CDH1` L1 SEAL | **PASS** — cited · not reopened |
| Invent **400** `HRM-EMP-POSITION-KEY` · no persist (QA/QC proven) | **PASS** — cited |
| **R-PLT-EMP-POS-BE-01 CLOSED** | **PASS** — BE DI wire + LIVE 400 |
| Nest `emp_position` ABSENT / DENIED | **PASS** — API/DB/evidence |
| EMP-STATUS `EMPSTQA-MSK20G7H` | **PASS** — SEAL RETAIN · **DENIED** invent EMP-STATUS FE |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **PASS** — SEAL RETAIN |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **PASS** — SEAL RETAIN |
| DOC/ET · ATT / SI / CTR | **PASS** — SEAL RETAIN |
| Dept companion R-EMP-POS-DEPT-01 | **PASS** — OUT follow-on note only |
| FE WH picker deepen | **PASS** — HOLD · **no invent FE** |
| **DENY** `hrm_personnel_uat_ready=true` · e2e · printable | **PASS** — remain **false** |
| **DENY** module EMP UAT / Phase1 DONE / UF 🟢 | **PASS** · `C-SLICE-≠-MODULE` |
| U65 seed | **PASS** — no seed |
| ba-data Nest ADD | **PASS** — HOLD |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-EMP-POS-DOCS** | Client DOC-DELTA Settings/XBOS SoT / invent KEY / admin≠consumer / Nest deny | **CLOSED** (this seat) |
| **R-EMP-POS-DEPT-01** | Dept companion AC pack (same Option A) | **OUT / P2** — **pm** follow-on `…-EMP-DEPT-CATALOG-*` |
| FE WH picker deepen | Empty CTA / picker UX | **HOLD** — **do not invent FE** |
| Journey J-HRM-EMP-POS-CAT-* | Optional map rows | **pm** / ba-docs later if sponsor wants |
| HDSD CH06 full EMP pillar | Beyond slim CH06f | **HOLD** |
| U88 continuous | Next governance vertical | **pm** — not idle program on DOCS seal alone |
| personnel flip / seal reopen / Nest emp_position / EMP-STATUS FE | — | **DENIED** |

---

## 7. completion_report

**Closed:** ADD-only client DOC-DELTA for EMP position catalog Option A after EMP-POSITION-CATALOG-QC-01 GWC L1 SEAL `EMPPOSQA2-MSK3CDH1`. API_DESIGN ADD F-EMP-CAT-POS-01/02/03 + POS-EFF-01 + F-EMP-POS-CNS-01..04 with §0.1 **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`**) + **`HRM-WH-PICK-EMPTY-CATALOG`** and admin≠consumer note; SRS FR-UC-BP-PLT-01 AC-PLT-EMP-01* at **v0.33**; HDSD CH06f (admin/sync vs profile/WH pick, empty, soft-retire) + CH06 pointer; DB_DESIGN footer pointer with ba-data HOLD / Nest `emp_position` DENIED / dept OUT note. Cited: invent → 400 KEY · no persist · **R-PLT-EMP-POS-BE-01 CLOSED** (EmployeesModule SettingsCatalogs wire) · seals RETAIN (`EMPSTQA-MSK20G7H` · `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR). Honesty personnel/e2e/printable=false · `C-SLICE-≠-MODULE` · no module EMP UAT / Phase1 / UF 🟢. FE WH picker HOLD — no invent FE. No `apps/**`, no seed, no seal reopen, no Nest position table.

**Still open:** R-EMP-POS-DEPT-01 OUT follow-on; FE WH picker HOLD (no invent this turn); optional journey rows; full HDSD EMP pillar; U88 next program vertical (PM).

---

## 8. Honesty / non-claims / seals

| Flag / seal | State |
|-------------|-------|
| `hrm_personnel_uat_ready` | **false** — DENIED flip |
| `employees_e2e_linkage_ready` | **false** — DENIED flip |
| `contracts_printable_ready` | **false** — DENIED flip |
| EMP-STATUS L1 `EMPSTQA-MSK20G7H` | **SEAL RETAIN** — DENIED reopen / invent FE |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **SEAL RETAIN** — DENIED reopen / fold |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — DENIED reopen |
| EMP DOC/ET Nest · ATT / SI / CTR | **SEAL RETAIN** — DENIED fold / reopen |
| Nest `emp_position` | **DENIED** |
| Module EMP UAT / Phase1 DONE / UF 🟢 | **DENIED** — `C-SLICE-≠-MODULE` |
| Free-text SoT when EFF>0 / mega-EAV | **DENIED** |
| Seed (U65) | **DENIED** |
| Invent FE WH picker | **DENIED** this turn — HOLD note only |
| Primary dept AC this seat | **OUT** — follow-on only |

---

## 9. next_owner / next_dispatch_prompt

**next_owner:** **pm** → U88 continuous — next vertical **`…-EMP-DEPT-CATALOG-*` SA/BA** (same Option A) **or** next OPEN on `PO-HRM-CONTINUOUS-W8-20260807` board · retain FE HOLD · **DENY** flip personnel · **DENY** reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · **DENY** invent FE · **DENY** Nest `emp_position` · **DENY** invent EMP-STATUS FE

```text
work_item_id: (PM pick — U88 after EMP-POSITION-CATALOG-DOCS-01)
  preferred: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01
  (or next OPEN on PO-HRM-CONTINUOUS-W8 board)
from_role: pm
to_role: sa | ba-process (dept companion Option A — not EMP UAT invent · not FE invent)
lane: governance
priority: P2
prior: EMP-POSITION-CATALOG-QC-01 GWC L1 SEAL · EMP-POSITION-CATALOG-DOCS-01 DOC-DELTA ACCEPT
evidence_ref: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-docs-01.md
stamp_peer: EMPPOSQA2-MSK3CDH1 · EMPSTQA-MSK20G7H SEAL · EMPCFQA-MSK14LUH SEAL · EMPTOKEXTQA-MSJ57PE1 SEAL
cite: R-PLT-EMP-POS-BE-01 CLOSED · invent HRM-EMP-POSITION-KEY · Nest emp_position DENY

entry_criteria:
- DOCS-01 PASS_TO_PM · DOC-DELTA ACCEPT (client SRS v0.33 · API F-EMP-CAT-POS/EFF + POS-CNS · HDSD CH06f · DB HOLD)
- honesty hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · contracts_printable_ready=false LOCKED
- FE WH picker HOLD — cấm invent FE Task
- R-EMP-POS-DEPT-01 OUT follow-on OK as next vertical (same Option A · Settings/XBOS departments SoT · Nest emp_department DENY)
- cấm reopen EMP-STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · cấm Nest emp_position · cấm invent EMP-STATUS FE · cấm module EMP UAT · cấm Phase1 · cấm UF 🟢

scope:
- Open EMP-DEPT companion SA Option/F.1 + BA AC pack (mirror position Option A) OR next OPEN residual on W8 board
- Optional later: journey J-HRM-EMP-POS-CAT-* ADD only if sponsor wants map rows
- Optional later: unlock FE for WH picker deepen only if sponsor/PM opens FE wave

exit_criteria:
- Bus DISPATCHED next seat · honesty flags unchanged false
- C-SLICE-≠-MODULE retained
```

---

## 10. handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §7 |
| **next_owner** | **pm** (U88 continuous — EMP-DEPT companion or next OPEN; DENY personnel flip / seal reopen / invent FE / Nest emp_position) |
| **next_dispatch_prompt** | See §9 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **DOC-DELTA** | **ACCEPT** |

---

## 11. Client paths (quick index)

- API: `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` — §0.1 `HRM-EMP-POSITION-KEY` / `HRM-WH-PICK-EMPTY-CATALOG` · F-EMP-CAT-POS-* · F-EMP-POS-CNS-* · footer DOC-DELTA
- SRS: `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` — FR-UC-BP-PLT-01 · AC-PLT-EMP-01* · v0.33
- DB: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` — footer EMP-POSITION-CATALOG-DOCS-01 · Nest HOLD
- HDSD: `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md` (+ CH06 pointer)
