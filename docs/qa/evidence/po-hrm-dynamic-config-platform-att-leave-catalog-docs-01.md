# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-DOCS-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-QC-01` **GWC** · ATT leave catalog **SEAL ACCEPT** · stamp **`ATTLEAVEQA-MSJ7CPJH`** |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 · SRS · HDSD · DB pointer) |
| **verdict** | **DOC-DELTA ACCEPT** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `attendance_uat_ready=false` **LOCKED** · WAIVE/sign/**J-HRM-06c** **SEAL RETAIN** · no module ATT UAT · no Phase1 DONE · `C-SLICE-≠-MODULE` · U65 |
| **no_prompt_echo** | **true** — SRS/HDSD client VI clean (no work_item / pipeline / stamp meta in body) |
| **peer_pattern** | PAY-CATALOG-DOCS-01 / MERGE-TOKEN-EMP-DOCS-01 — ADD-only · footer stamp · no wipe |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-BA-01.md` | AC-PLT-ATT-LEAVE-01* · admin≠consumer · `HRM-LEAVE-TYPE-UNKNOWN` · §9 DOC-DELTA · honesty |
| `po-hrm-dynamic-config-platform-att-leave-catalog-qc-01.md` | GWC SEAL · stamp `ATTLEAVEQA-MSJ7CPJH` · U88 ba-docs residual · DENY flip ready / reopen WAIVE·sign·J-06c |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` §3 | F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 F.1 base |
| Peer PAY-CATALOG-DOCS-01 | ADD-only F.1 + SRS + HDSD slim + DB footer |
| Client `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-04/05b/07/09 | Dual SoT deepen |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01 · **EXPAND** F-ATT-LEAVE-02 (`HRM-LEAVE-TYPE-UNKNOWN`) · §7.3 matrix · header/footer **DOC-DELTA CONFIRMED** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-ATT-04 · 05b · 07 · 09 (admin≠consumer · empty Nest · Settings ≠ sole SoT · invent trước hold) · version **0.26** — no new FR · changelog +0.25 backfill PAY |
| [`HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md) | **ADD** slim CH05 — quản trị danh mục vs chọn loại trên Nghỉ phép · empty · retire · no full ATT UAT claim |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer ATT-LEAVE-CATALOG-DOCS-01 · ba-data **HOLD** (no second table) |

**Forbidden touched:** none of `apps/**` · no seed · no flip `attendance_uat_ready` · no reopen WAIVE/sign/J-HRM-06c · no reopen ATT-QC/EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · no wipe GĐ1 seals.

---

## 3. Coverage checklist (task AC)

| Requirement | Result |
|-------------|--------|
| Admin F-ATT-CAT-LVT-02 open N+1 ≠ consumer invent | **PASS** — API Mục đích/Nghiệp vụ + SRS ATT-04 + HDSD §1–2 |
| Consumer pickers F-ATT-CAT-EFF-01 Nest SoT when EFF>0 | **PASS** — API + SRS 05b/09 dual SoT + HDSD §3.1 |
| Invent → `HRM-LEAVE-TYPE-UNKNOWN` | **PASS** — API F-ATT-LEAVE-02 + §0.1 note · SRS 09 special case (VI clean) |
| HDSD / SRS client delta only · no prompt-echo · no wipe | **PASS** — SRS/HDSD VI clean; prior F-ATT-LEAVE / sheet seals kept |
| DENY `attendance_uat_ready` flip · WAIVE/sign/J-06c reopen · module ATT UAT | **PASS** — stamped honesty all client footers |
| Peer seals retain (`ATTLEAVEQA-MSJ7CPJH` · ATT-QC-01/02 · EMP/DEC/PAY/EXT/CTR/LIST-TOTALS · WAIVE/sign/J-06c) | **PASS** — no reopen language; KEEP seals |

---

## 4. F.1 spot (admin≠consumer)

| F-id | Role | Open N+1 | Invent KEY |
|------|------|----------|------------|
| F-ATT-CAT-LVT-02 | **ADMIN** | **Allowed** | **Forbidden to apply invent-ban** |
| F-ATT-CAT-LVT-01 | **ADMIN list** | N/A (read) | N/A |
| F-ATT-CAT-EFF-01 | **PICKER SoT** | N/A (read) | N/A |
| F-ATT-LEAVE-02 | **CONSUMER** | N/A | **`HRM-LEAVE-TYPE-UNKNOWN`** when EFF >0 |

---

## 5. must_keep / DENY verify

| Rule | Result |
|------|--------|
| ATT-LEAVE-CATALOG-QC-01 GWC · stamp `ATTLEAVEQA-MSJ7CPJH` | **PASS** — SEAL RETAIN · not reopened |
| ATT-QC-01/02 · WAIVE/sign/J-HRM-06c · EMP/DEC/PAY/EXT/CTR/LIST-TOTALS | **PASS** — KEEP seals |
| F-ATT-LEAVE-* sheet/sign · `work_shifts` | **PASS** — no wipe · WS OUT this pack |
| **DENY** `attendance_uat_ready=true` | **PASS** — remains **false** |
| **DENY** reopen WAIVE/sign/J-HRM-06c | **PASS** |
| **DENY** module ATT UAT / Phase1 DONE | **PASS** · `C-SLICE-≠-MODULE` |
| ba-data second leave catalog table | **PASS** — HOLD · no EXPAND |
| U65 seed | **PASS** — no seed |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-ATT-LEAVE-CAT-DOCS** | Client DOC-DELTA admin≠consumer / Nest SoT / UNKNOWN KEY | **CLOSED** (this seat) |
| OBS-01c empty EFF browser | Live EFF≠0 empty branch | **idle-ok P2** — CONDITION from QC; wipe seals forbidden |
| HDSD CH05 full ATT pillar | Sheet close / punch / OT / WAIVE | **HOLD** — slim catalog only; expand later under HDSD program |
| Proposed J-HRM-ATT-LEAVE-CAT-* journey rows | BA §6.5 optional | **pm** / ba-docs later if sponsor wants journey map ADD |
| U88 continuous | Next governance / execution vertical | **pm** — not idle program on DOCS seal alone |
| attendance_uat flip / WAIVE reopen | — | **DENIED** |

---

## 7. completion_report

**Closed:** ADD-only client DOC-DELTA for Nest `att_leave_type` / leave-types effective platform catalog after ATT-LEAVE-CATALOG-QC-01 GWC seal `ATTLEAVEQA-MSJ7CPJH`: ADD API F-ATT-CAT-LVT-01/02 + F-ATT-CAT-EFF-01 (admin mở N+1 ≠ consumer invent), EXPAND F-ATT-LEAVE-02 invent → `HRM-LEAVE-TYPE-UNKNOWN`; SRS FR-UC-BP-ATT-04/05b/07/09 v0.26 (admin≠consumer · empty Nest · Settings ≠ sole SoT · invent trước hold); ADD slim HDSD CH05 Chấm công & Nghỉ phép (catalog scope only); DB footer pointer with ba-data HOLD; honesty `attendance_uat_ready=false` · WAIVE/sign/J-HRM-06c SEAL RETAIN · no module ATT UAT / Phase1; peer + ATT-QC seals RETAIN; no apps/**; no wipe prior GĐ1 seals.

**Still open:** OBS 01c empty EFF idle-ok; full HDSD ATT pillar beyond catalog; U88 next program vertical (PM); optional journey J-HRM-ATT-LEAVE-CAT-* ADD.

---

## 8. next_owner / next_dispatch_prompt

**next_owner:** **pm** → U88 continuous (governance/execution next vertical) · **DENY** flip `attendance_uat_ready` · **DENY** reopen WAIVE/sign/J-HRM-06c

```text
work_item_id: (PM pick from PO-HRM-CONTINUOUS-W8 board — U88 after ATT-LEAVE-CATALOG-DOCS-01)
from_role: pm
to_role: sa | ba-process | ba-data (per continuous board — not ATT UAT invent)
lane: governance
priority: P2
prior: ATT-LEAVE-CATALOG-QC-01 GWC SEAL · ATT-LEAVE-CATALOG-DOCS-01 DOC-DELTA ACCEPT
evidence_ref: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-docs-01.md
stamp_peer: ATTLEAVEQA-MSJ7CPJH · ATT-QC-01/02 · WAIVE/sign/J-HRM-06c · EMP/DEC/PAY/EXT/CTR/LIST-TOTALS SEAL retain

entry_criteria:
- DOCS-01 PASS_TO_PM · DOC-DELTA ACCEPT
- honesty attendance_uat_ready=false LOCKED
- cấm reopen sealed GWC · cấm invent module ATT UAT · cấm reopen WAIVE/sign/J-HRM-06c

scope:
- Open next vertical/AC pack on continuous board (peer ATT→REC→EMP→QSĐ… or residual program)
- Optional later: OBS-01c empty EFF browser only if sponsor wants forced empty UF (P2 idle-ok)

exit_criteria:
- Bus DISPATCHED next seat · honesty flags unchanged false
- C-SLICE-≠-MODULE retained
```

---

## 9. handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §7 |
| **next_owner** | **pm** (U88 continuous — next vertical; DENY attendance_uat flip / WAIVE reopen) |
| **next_dispatch_prompt** | See §8 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-catalog-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **DOC-DELTA** | **ACCEPT** |

---

## 10. Client paths (quick index)

- API: `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` — F-ATT-CAT-LVT/EFF · F-ATT-LEAVE-02 · footer DOC-DELTA
- SRS: `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` — FR-UC-BP-ATT-04/05b/07/09 v0.26
- HDSD: `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md`
- DB pointer: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` — footer ATT-LEAVE-CATALOG-DOCS-01
