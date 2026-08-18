# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-DOCS-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-QC-01` **GWC** · ATT work-sites catalog **SEAL ACCEPT** · stamp **`ATTWSQA-MSJC3IN9`** |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **change_mode** | **ADD** client DOC-DELTA (API F.1 · SRS · HDSD · DB pointer) |
| **verdict** | **DOC-DELTA ACCEPT** |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-08 |
| **honesty** | `attendance_uat_ready=false` **LOCKED** · printable/personnel **false** · ATT-LEAVE GWC · WAIVE/sign/**J-HRM-06c** · SI type/insurer · CTR · enrollment **SEAL RETAIN** · no module ATT UAT · no Phase1 DONE · `C-SLICE-≠-MODULE` · U65 |
| **no_prompt_echo** | **true** — SRS/HDSD client VI clean (no work_item / pipeline / stamp meta in body) |
| **peer_pattern** | ATT-LEAVE-CATALOG-DOCS-01 / PAY-CATALOG-DOCS-01 — ADD-only · footer stamp · no wipe |
| **fe_note** | FE-01 READY · QA-02 in-flight for **R-PLT-ATT-WS-FE-CNS-05** — **DOCS did NOT invent FE Task** |

---

## 1. read_first ack

| Artifact | Used |
|----------|------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BA-01.md` | AC-PLT-ATT-WORKSITE-01* · admin≠consumer · GEO-001 · GEO-REQ · soft-retire · SITE-UNKNOWN HOLD · §9 DOC-DELTA · honesty |
| `po-hrm-dynamic-config-platform-att-worksite-catalog-qc-01.md` | GWC SEAL · stamp `ATTWSQA-MSJC3IN9` · U88 ba-docs residual · DENY flip ready / reopen seals · FE-01 do not invent |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-SA-01.md` | Option B · F-ATT-CAT-WS-01/02 · L-ATT-WS-* |
| Peer ATT-LEAVE-CATALOG-DOCS-01 / PAY-CATALOG-DOCS-01 | ADD-only F.1 + SRS + HDSD slim + DB footer |
| Client `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-03d | Dual SoT deepen |

---

## 2. Deliverables (client — no `apps/**`)

| Path | Change |
|------|--------|
| [`API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | **ADD** F-ATT-CAT-WS-01/02 · **EXPAND** F-ATT-PUNCH-01 (`HRM-ATT-GEO-001` / `HRM-ATT-GEO-REQ`) · §0.1 GEO/SITE codes · §7.3 matrix · header/footer **DOC-DELTA CONFIRMED** |
| [`SRS_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md) | **EXPAND** FR-UC-BP-ATT-03d (admin≠consumer · Nest SoT · soft-retire · empty · GEO · CNS-05 note) · version **0.30** — no new FR · changelog |
| [`HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md) | **ADD** slim CH05b — quản trị điểm vs chấm GPS · soft-retire · empty · no full ATT UAT claim |
| [`HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md`](../../client-delivery/hdsd/hrm/HDSD_XEVN_CH05_HRM_CHAM_CONG_PHEP.md) | **ADD** peer pointer → CH05b (leave catalog retain) |
| [`DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | **ADD** footer pointer ATT-WORKSITE-CATALOG-DOCS-01 · ba-data **HOLD** (no second table; DATA-01 EXPAND retain) |

**Forbidden touched:** none of `apps/**` · no seed · no flip `attendance_uat_ready` · no reopen ATT-LEAVE / WAIVE/sign/J-06c / SI / CTR / enrollment · no invent FE · no wipe GĐ1 seals.

---

## 3. Coverage checklist (task AC)

| Requirement | Result |
|-------------|--------|
| Admin F-ATT-CAT-WS-02 open N+1 ≠ consumer invent OOS coords | **PASS** — API Mục đích/Nghiệp vụ + SRS ATT-03d + HDSD §1–2 |
| GPS punch GEO-001 · soft-retire hides from geofence | **PASS** — API F-ATT-PUNCH-01 + WS-02 · SRS special cases · HDSD §3–4 |
| Optional CNS-05 GEO-REQ note (FE wire in-flight) | **PASS** — API §0.1 + PUNCH-01 + HDSD §3.1 note · **no invent FE** |
| SITE-UNKNOWN HOLD · J-MOB-02 OOS | **PASS** — API HOLD note · HDSD §5 · evidence DENY invent FAIL |
| HDSD / SRS / API delta only · no prompt-echo · no wipe | **PASS** — SRS/HDSD VI clean; prior LVT/LEAVE/sheet seals kept |
| DENY `attendance_uat_ready` flip · module ATT UAT | **PASS** — stamped honesty all client footers |
| Peer seals retain (`ATTWSQA-MSJC3IN9` · ATT-LEAVE · WAIVE/sign/J-06c · SI · CTR · enrollment · …) | **PASS** — no reopen language; KEEP seals |

---

## 4. F.1 spot (admin≠consumer)

| F-id | Role | Open N+1 | Invent |
|------|------|----------|--------|
| F-ATT-CAT-WS-02 | **ADMIN** | **Allowed** | **Forbidden to apply invent-ban / GEO-001** |
| F-ATT-CAT-WS-01 | **ADMIN list** | N/A (read) · default active | N/A |
| F-ATT-PUNCH-01 | **CONSUMER** | N/A | OOS coords → **`HRM-ATT-GEO-001`** · missing lat/lon GPS → **`HRM-ATT-GEO-REQ`** |

---

## 5. must_keep / DENY verify

| Rule | Result |
|------|--------|
| ATT-WORKSITE-CATALOG-QC-01 GWC · stamp `ATTWSQA-MSJC3IN9` | **PASS** — SEAL RETAIN · not reopened |
| ATT-LEAVE GWC · WAIVE/sign/J-HRM-06c · SI type/insurer · CTR · enrollment · EMP/DEC/PAY/REC/EXT/LIST-TOTALS | **PASS** — KEEP seals |
| F-ATT-CAT-LVT/EFF · F-ATT-LEAVE-* · sheet/sign · `work_shifts` | **PASS** — no wipe |
| **DENY** `attendance_uat_ready=true` · printable/personnel flip | **PASS** — remains **false** |
| **DENY** module ATT UAT / Phase1 DONE | **PASS** · `C-SLICE-≠-MODULE` |
| **DENY** invent FE Task / SITE-UNKNOWN FAIL / J-MOB-02 FAIL | **PASS** |
| ba-data second work-sites table | **PASS** — HOLD · DATA-01 EXPAND retain |
| U65 seed | **PASS** — no seed |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| **R-ATT-WS-CAT-DOCS** | Client DOC-DELTA admin≠consumer / Nest SoT / GEO keys | **CLOSED** (this seat) |
| **R-PLT-ATT-WS-FE-CNS-05** | FE wire `check_in_method` / GEO-REQ UX | **in-flight** FE-01 · QA-02 — **do not invent FE** |
| SITE-UNKNOWN | Consumer `work_site_id` surface | **HOLD GĐ1.5** |
| J-MOB-02 | Mobile GPS full journey | **OOS** portal wave |
| OBS-01c empty | Live empty branch | **idle-ok P2** — CONDITION from QC |
| HDSD CH05 full ATT pillar | Sheet close / punch / OT / WAIVE | **HOLD** — slim catalog only |
| Proposed J-HRM-ATT-WS-CAT-* | Journey rows BA §6.5 | **pm** / ba-docs later if sponsor wants map ADD |
| U88 continuous | Next governance / execution vertical | **pm** — not idle program on DOCS seal alone |
| attendance_uat flip / seal reopen | — | **DENIED** |

---

## 7. completion_report

**Closed:** ADD-only client DOC-DELTA for Nest `attendance_work_sites` / F-ATT-CAT-WS after ATT-WORKSITE-CATALOG-QC-01 GWC seal `ATTWSQA-MSJC3IN9`: ADD API F-ATT-CAT-WS-01/02 (admin mở N+1 ≠ consumer invent), EXPAND F-ATT-PUNCH-01 invent OOS → `HRM-ATT-GEO-001` · missing lat/lon GPS → `HRM-ATT-GEO-REQ` (CNS-05 note; FE in-flight — no invent FE); SRS FR-UC-BP-ATT-03d v0.30 (admin≠consumer · soft-retire · empty · Nest SoT); ADD slim HDSD CH05b điểm GPS (+ CH05 peer pointer); DB footer pointer with ba-data HOLD; honesty `attendance_uat_ready=false` · printable/personnel false · ATT-LEAVE / WAIVE/sign/J-06c / SI / CTR / enrollment SEAL RETAIN · no module ATT UAT / Phase1; peer seals RETAIN; no apps/**; no wipe prior GĐ1 seals; SITE-UNKNOWN HOLD · J-MOB-02 OOS.

**Still open:** FE-01 / QA-02 CNS-05 in-flight; SITE-UNKNOWN HOLD; J-MOB-02 OOS; OBS 01c idle-ok; full HDSD ATT pillar; U88 next program vertical (PM); optional journey J-HRM-ATT-WS-CAT-* ADD.

---

## 8. next_owner / next_dispatch_prompt

**next_owner:** **pm** → U88 continuous (governance/execution next vertical) · retain FE-01/QA-02 CNS-05 · **DENY** flip `attendance_uat_ready` · **DENY** reopen sealed GWC · **DENY** invent FE

```text
work_item_id: (PM pick from PO-HRM-CONTINUOUS-W8 board — U88 after ATT-WORKSITE-CATALOG-DOCS-01)
from_role: pm
to_role: sa | ba-process | ba-data (per continuous board — not ATT UAT invent)
lane: governance
priority: P2
prior: ATT-WORKSITE-CATALOG-QC-01 GWC SEAL · ATT-WORKSITE-CATALOG-DOCS-01 DOC-DELTA ACCEPT
evidence_ref: docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-docs-01.md
stamp_peer: ATTWSQA-MSJC3IN9 · ATT-LEAVE GWC · WAIVE/sign/J-HRM-06c · SI type/insurer · CTR · enrollment SEAL retain

entry_criteria:
- DOCS-01 PASS_TO_PM · DOC-DELTA ACCEPT
- honesty attendance_uat_ready=false LOCKED · printable/personnel false
- FE-01 / QA-02 CNS-05 in-flight — cấm invent duplicate FE
- cấm reopen sealed GWC · cấm invent module ATT UAT · cấm SITE-UNKNOWN FAIL · cấm J-MOB-02 invent

scope:
- Open next vertical/AC pack on continuous board (peer ATT→REC→EMP→QSĐ… or residual program)
- Optional later: journey J-HRM-ATT-WS-CAT-* ADD only if sponsor wants map rows

exit_criteria:
- Bus DISPATCHED next seat · honesty flags unchanged false
- C-SLICE-≠-MODULE retained
```

---

## 9. handoff contract

| Field | Value |
|-------|--------|
| **completion_report** | See §7 |
| **next_owner** | **pm** (U88 continuous — next vertical; DENY attendance_uat flip / seal reopen / invent FE) |
| **next_dispatch_prompt** | See §8 copy-ready block |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-worksite-catalog-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |
| **DOC-DELTA** | **ACCEPT** |

---

## 10. Client paths (quick index)

- API: `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` — F-ATT-CAT-WS · F-ATT-PUNCH-01 · footer DOC-DELTA
- SRS: `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` — FR-UC-BP-ATT-03d v0.30
- HDSD: `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05b_HRM_DANH_MUC_DIEM_GPS.md` (+ CH05 pointer)
- DB pointer: `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` — footer ATT-WORKSITE-CATALOG-DOCS-01
