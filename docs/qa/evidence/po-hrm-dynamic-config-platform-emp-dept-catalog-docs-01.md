# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-DOCS-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-QC-01` **GWC** · EMP-DEPT L1 Option A **SEAL ACCEPT** · stamp **`EMPDEPTQA-MSK3VVXX`** |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 · SRS · HDSD · DB pointer) |
| **verdict** | **DOC-DELTA ACCEPT** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · EMP-POSITION **`EMPPOSQA2-MSK3CDH1` SEAL RETAIN** · EMP-STATUS **`EMPSTQA-MSK20G7H` SEAL RETAIN** · EMP-CUSTOM **`EMPCFQA-MSK14LUH` SEAL RETAIN** · MergeToken EMP EXT **`EMPTOKEXTQA-MSJ57PE1` SEAL RETAIN** · DOC/ET · ATT/SI/CTR **SEAL RETAIN** · Nest `emp_department` / Nest `emp_position` **ABSENT/DENIED** · org-tree Nest sole invent **DENIED** · no module EMP UAT · no Phase1 DONE · `C-SLICE-≠-MODULE` · 01c **NOTE_BLOCKED** · P3 alias **HOLD** · U65 |
| **no_prompt_echo** | **true** — SRS/HDSD client VI clean (no work_item / pipeline / stamp meta in customer prose) |
| **peer_pattern** | EMP-POSITION-CATALOG-DOCS-01 — ADD-only F.1 + SRS + HDSD slim + DB footer · admin≠consumer · honesty · FE HOLD |
| **fe_note** | FE WH/dept picker deepen **HOLD** — **DOCS did NOT invent FE Task** |
| **invent_key_cite** | invent → **400** `HRM-WH-DEPT-KEY` ≡ `HRM-EMP-DEPT-KEY` · no persist · admin N+1 · Nest DENY |
| **closed_cite** | **R-EMP-POS-DEPT-01** AC **CLOSED** this seat (QC GWC + BA CONFIRMED + this DOC-DELTA) |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `po-hrm-dynamic-config-platform-emp-dept-catalog-qc-01.md` | GWC SEAL · stamp `EMPDEPTQA-MSK3VVXX` · invent KEY · no persist · admin N+1 · Nest deny · R-EMP-POS-DEPT-01 CLOSED · seals RETAIN · 01c NOTE_BLOCKED · P3 HOLD · FE HOLD · U88 ba-docs · DENY flip / module EMP UAT |
| `po-hrm-dynamic-config-platform-emp-dept-catalog-qa-01.md` | L1 PASS · invent WH **400** `HRM-WH-DEPT-KEY` · admin **201** · Nest 404/404 · honesty false |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-BA-01.md` | AC-PLT-EMP-DEPT-01* · admin≠consumer · Settings/XBOS SoT · closes R-EMP-POS-DEPT-01 · honesty · §9 DOC-DELTA |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-SA-01.md` | Option **A** LOCKED · F-EMP-CAT-DEPT / F-EMP-DEPT-CNS · L-EMP-DEPT-* · Nest DENY |
| Peer `po-hrm-dynamic-config-platform-emp-position-catalog-docs-01.md` | **COPY structure** — ADD-only F.1 + SRS + HDSD slim + DB footer |
| Client `SRS_HRM_ENTERPRISE.md` PLT-01 · `API_DESIGN_HRM_ENTERPRISE.md` §0.1 + F-EMP-* · `DB_DESIGN` OUT emp_department · HDSD CH06* | Delta target files |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-EMP-CAT-DEPT-01/02/03 · F-EMP-CAT-DEPT-EFF-01 · F-EMP-DEPT-CNS-01..04 · §0.1 **`HRM-EMP-DEPT-KEY`** + **`HRM-WH-DEPT-KEY`** + **`HRM-EMP-DEPT-EMPTY-CATALOG`** · admin≠consumer note · matrix rows · footer **DOC-DELTA CONFIRMED** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-PLT-01 (AC-PLT-EMP-DEPT-01 / 01b / 01c / 01d / 01e) · luồng chính phòng ban Settings/XBOS · CORE-01a bộ phận picker · version **0.34** — no new FR |
| [`HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md) | **ADD** slim CH06g — quản trị / đồng bộ phòng ban vs chọn trên hồ sơ · empty · soft-retire · no full EMP UAT claim |
| [`HDSD_XEVN_CH06_HRM_NHAN_SU.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md) | **ADD** peer pointer → CH06g |
| [`HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH06f_HRM_DANH_MUC_CHUC_DANH.md) | **EXPAND** pointer → CH06g (dept peer) |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer EMP-DEPT-CATALOG-DOCS-01 · ba-data **HOLD** (no Nest `emp_department`) · Nest `emp_position` DENY · R-EMP-POS-DEPT-01 CLOSED |

**Forbidden touched:** none of `apps/**` · no seed · no flip personnel/e2e/printable · no reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · no invent FE · no wipe prior seals · no Nest `emp_department` / `emp_position` invent · no BE alias rename unlock.

---

## 3. Coverage checklist (task AC)

| Requirement | Result |
|-------------|--------|
| SRS/HDSD/API — Settings/XBOS `departments` EFF = SoT Option A; invent KEY when EFF>0; admin CREATE/sync N+1 ≠ consumer invent; Nest `emp_department`/`emp_position` DENIED | **PASS** — API F-EMP-CAT-DEPT-* / F-EMP-DEPT-CNS-* · SRS PLT-01 v0.34 · HDSD CH06g §1–3 · DB HOLD |
| Cite invent → 400 `HRM-WH-DEPT-KEY` ≡ `HRM-EMP-DEPT-KEY` · no persist · admin N+1 | **PASS** — evidence cite QC/QA + API §0.1 / CNS |
| Cite **R-EMP-POS-DEPT-01 CLOSED** · peer seals RETAIN | **PASS** — QC + BA + this evidence §5 |
| Explicit DENY free-text SoT when EFF>0 / Nest dual master / personnel flip / module EMP UAT | **PASS** — API/SRS/HDSD/DB/evidence honesty |
| 01c NOTE_BLOCKED · P3 alias HOLD · FE HOLD — no invent FE/BE rename | **PASS** — §5–§8 |
| Evidence path this file | **PASS** |
| HDSD / SRS / API delta only · no prompt-echo · no wipe · no invent FE | **PASS** |

---

## 4. F.1 spot (admin ≠ consumer)

| F-id | Role | Open N+1 | Invent KEY |
|------|------|----------|------------|
| F-EMP-CAT-DEPT-02 | **ADMIN** | **Allowed** CREATE/sync | **Forbidden to apply KEY** |
| F-EMP-CAT-DEPT-01 / 03 / EFF-01 | **ADMIN** list / soft-retire / picker SoT | N/A / retire | N/A |
| F-EMP-DEPT-CNS-01 | **CONSUMER** WH `department_key` | N/A | **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**) when EFF>0 |
| F-EMP-DEPT-CNS-02 | **CONSUMER** EMP `department_key` | N/A | same KEY |
| F-EMP-DEPT-CNS-03 | **CONSUMER** CTR/DEC/REC/PERF | N/A | same KEY class · RETAIN spine |
| F-EMP-DEPT-CNS-04 | **CONSUMER** empty EFF | N/A | **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ WH EMPTY) · no seed |

---

## 5. must_keep / DENY verify

| Rule | Result |
|------|--------|
| EMP-DEPT-CATALOG-QC-01 GWC · stamp `EMPDEPTQA-MSK3VVXX` L1 SEAL | **PASS** — cited · not reopened |
| Invent **400** `HRM-WH-DEPT-KEY` ≡ `HRM-EMP-DEPT-KEY` · no persist (QA/QC proven) | **PASS** — cited |
| Admin N+1 **201** / EFF active | **PASS** — cited QA/QC |
| **R-EMP-POS-DEPT-01 CLOSED** | **PASS** — QC GWC + BA CONFIRMED + this DOC-DELTA |
| Nest `emp_department` ABSENT / DENIED · org-tree sole invent DENIED | **PASS** — API/DB/evidence |
| Nest `emp_position` ABSENT / DENIED | **PASS** — RETAIN position Option A |
| EMP-POSITION `EMPPOSQA2-MSK3CDH1` | **PASS** — SEAL RETAIN |
| EMP-STATUS `EMPSTQA-MSK20G7H` | **PASS** — SEAL RETAIN · **DENIED** invent EMP-STATUS FE |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **PASS** — SEAL RETAIN |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **PASS** — SEAL RETAIN |
| DOC/ET · ATT / SI / CTR | **PASS** — SEAL RETAIN |
| 01c empty EFF | **PASS** — NOTE_BLOCKED (no wipe U65) · not claimed UF |
| P3 alias `HRM-WH-DEPT-KEY` ≡ EMP-DEPT-KEY | **PASS** — HOLD · **DENIED** BE unlock rename alone |
| FE WH/dept picker deepen | **PASS** — HOLD · **no invent FE** |
| **DENY** `hrm_personnel_uat_ready=true` · e2e · printable | **PASS** — remain **false** |
| **DENY** free-text SoT when EFF>0 / Nest dual master | **PASS** |
| **DENY** module EMP UAT / Phase1 DONE / UF 🟢 | **PASS** · `C-SLICE-≠-MODULE` |
| U65 seed | **PASS** — no seed |
| ba-data Nest ADD | **PASS** — HOLD |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-EMP-DEPT-DOCS** | Client DOC-DELTA Settings/XBOS SoT / invent KEY / admin≠consumer / Nest deny | **CLOSED** (this seat) |
| **R-EMP-POS-DEPT-01** | Dept companion AC (same Option A) | **CLOSED** (AC + QC + DOCS) |
| **R-EMP-DEPT-CNS-01-ALIAS-OBSERVE** | LIVE string `HRM-WH-DEPT-KEY` ≡ class EMP-DEPT-KEY | **P3 HOLD** — **pm** · **no BE unlock** rename alone |
| 01c empty CTA | Not forced without wipe | **HOLD** — FE only if product forces empty |
| FE WH/dept picker deepen | Empty CTA / picker UX | **HOLD** — **do not invent FE** |
| Journey J-HRM-EMP-DEPT-CAT-* | Optional map rows | **pm** / ba-docs later if sponsor wants |
| HDSD CH06 full EMP pillar | Beyond slim CH06g | **HOLD** |
| U88 continuous | Next governance vertical | **pm** — not idle program on DOCS seal alone |
| personnel flip / seal reopen / Nest emp_department / emp_position / EMP-STATUS FE | — | **DENIED** |

---

## 7. completion_report

**Closed:** ADD-only client DOC-DELTA for EMP department catalog Option A after EMP-DEPT-CATALOG-QC-01 GWC L1 SEAL `EMPDEPTQA-MSK3VVXX`. API_DESIGN ADD F-EMP-CAT-DEPT-01/02/03 + DEPT-EFF-01 + F-EMP-DEPT-CNS-01..04 with §0.1 **`HRM-EMP-DEPT-KEY`** (≡ **`HRM-WH-DEPT-KEY`**) + **`HRM-EMP-DEPT-EMPTY-CATALOG`** (≡ WH EMPTY) and admin≠consumer note; SRS FR-UC-BP-PLT-01 AC-PLT-EMP-DEPT-01* at **v0.34** (+ CORE-01a bộ phận picker); HDSD CH06g (admin/sync vs profile/WH pick, empty, soft-retire) + CH06/CH06f pointers; DB_DESIGN footer pointer with ba-data HOLD / Nest `emp_department` DENIED / Nest `emp_position` DENIED / org-tree sole invent DENIED. Cited: invent → 400 KEY alias · no persist · admin N+1 · **R-EMP-POS-DEPT-01 CLOSED** · seals RETAIN (`EMPPOSQA2-MSK3CDH1` · `EMPSTQA-MSK20G7H` · `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` · DOC/ET · ATT/SI/CTR). Honesty personnel/e2e/printable=false · `C-SLICE-≠-MODULE` · 01c NOTE_BLOCKED · P3 alias HOLD · no module EMP UAT / Phase1 / UF 🟢. FE dept/WH picker HOLD — no invent FE. No `apps/**`, no seed, no seal reopen, no Nest dept/position table, no BE alias rename unlock.

**Still open:** P3 alias observe HOLD (no BE unlock); FE picker HOLD (no invent this turn); optional journey rows; full HDSD EMP pillar; U88 next program vertical (PM).

---

## 8. Honesty / non-claims / seals

| Flag / seal | State |
|-------------|-------|
| `hrm_personnel_uat_ready` | **false** — DENIED flip |
| `employees_e2e_linkage_ready` | **false** — DENIED flip |
| `contracts_printable_ready` | **false** — DENIED flip |
| EMP-POSITION L1 `EMPPOSQA2-MSK3CDH1` | **SEAL RETAIN** — DENIED reopen / Nest `emp_position` |
| EMP-STATUS L1 `EMPSTQA-MSK20G7H` | **SEAL RETAIN** — DENIED reopen / invent FE |
| EMP-CUSTOM CNS `EMPCFQA-MSK14LUH` | **SEAL RETAIN** — DENIED reopen / fold |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — DENIED reopen |
| EMP DOC/ET Nest · ATT / SI / CTR | **SEAL RETAIN** — DENIED fold / reopen |
| Nest `emp_department` / org-tree sole invent | **DENIED** |
| Nest `emp_position` | **DENIED** |
| Module EMP UAT / Phase1 DONE / UF 🟢 | **DENIED** — `C-SLICE-≠-MODULE` |
| Free-text SoT when EFF>0 / mega-EAV / dual master | **DENIED** |
| 01c wipe / seed empty | **DENIED** — NOTE_BLOCKED |
| P3 BE unlock alias string alone | **DENIED** — HOLD observe |
| Seed (U65) | **DENIED** |
| Invent FE WH/dept picker | **DENIED** this turn — HOLD note only |

---

## 9. next_owner / next_dispatch_prompt

**next_owner:** **pm** → U88 continuous — next OPEN vertical on `PO-HRM-CONTINUOUS-W8-20260807` board · retain FE HOLD · **DENY** flip personnel · **DENY** reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · **DENY** invent FE · **DENY** Nest `emp_department` / `emp_position` · **DENY** invent EMP-STATUS FE · **DENY** BE unlock alias rename alone

```text
work_item_id: (PM pick — U88 after EMP-DEPT-CATALOG-DOCS-01)
  preferred: next OPEN on PO-HRM-CONTINUOUS-W8-20260807 board
  (sa | ba-process | ba-data HOLD as applicable — not EMP UAT invent · not FE invent · not Nest emp_department)
from_role: pm
to_role: sa | ba-process (next vertical — not invent FE / Nest / personnel flip)
lane: governance
priority: P2
prior: EMP-DEPT-CATALOG-QC-01 GWC L1 SEAL · EMP-DEPT-CATALOG-DOCS-01 DOC-DELTA ACCEPT
evidence_ref: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-docs-01.md
stamp_peer: EMPDEPTQA-MSK3VVXX · EMPPOSQA2-MSK3CDH1 SEAL · EMPSTQA-MSK20G7H SEAL · EMPCFQA-MSK14LUH SEAL · EMPTOKEXTQA-MSJ57PE1 SEAL
cite: R-EMP-POS-DEPT-01 CLOSED · invent HRM-WH-DEPT-KEY ≡ HRM-EMP-DEPT-KEY · Nest emp_department/emp_position DENY · 01c NOTE_BLOCKED · P3 alias HOLD

entry_criteria:
- DOCS-01 PASS_TO_PM · DOC-DELTA ACCEPT (client SRS v0.34 · API F-EMP-CAT-DEPT/EFF + DEPT-CNS · HDSD CH06g · DB HOLD)
- honesty hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · contracts_printable_ready=false LOCKED
- FE WH/dept picker HOLD — cấm invent FE Task
- P3 alias HOLD — cấm BE unlock chỉ rename HRM-WH-DEPT-KEY → HRM-EMP-DEPT-KEY
- cấm reopen EMP-POSITION/STATUS/CUSTOM/EXT/DOC-ET/ATT/SI/CTR · cấm Nest emp_department / emp_position · cấm invent EMP-STATUS FE · cấm module EMP UAT · cấm Phase1 · cấm UF 🟢

scope:
- Open next OPEN residual / vertical on W8 board (governance ADD-only)
- Optional later: journey J-HRM-EMP-DEPT-CAT-* ADD only if sponsor wants map rows
- Optional later: unlock FE for dept/WH picker deepen only if sponsor/PM opens FE wave

exit_criteria:
- Bus DISPATCHED next seat · honesty flags unchanged false
- C-SLICE-≠-MODULE retained
```

---

## 10. handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §7 |
| **next_owner** | **pm** (U88 continuous — next OPEN; DENY personnel flip / seal reopen / invent FE / Nest emp_department / emp_position / BE alias unlock) |
| **next_dispatch_prompt** | See §9 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-dept-catalog-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **DOC-DELTA** | **ACCEPT** |

---

## 11. Client paths (quick index)

- API: `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` — §0.1 `HRM-EMP-DEPT-KEY` / `HRM-WH-DEPT-KEY` / `HRM-EMP-DEPT-EMPTY-CATALOG` · F-EMP-CAT-DEPT-* · F-EMP-DEPT-CNS-* · footer DOC-DELTA
- SRS: `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` — FR-UC-BP-PLT-01 · AC-PLT-EMP-DEPT-01* · v0.34
- DB: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` — footer EMP-DEPT-CATALOG-DOCS-01 · Nest HOLD
- HDSD: `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06g_HRM_DANH_MUC_PHONG_BAN.md` (+ CH06 / CH06f pointers)
