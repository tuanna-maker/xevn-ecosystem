# Evidence — PO-HRM-ATT-LEAVE-LADDER-DOCS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-ATT-LEAVE-LADDER-DOCS-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **change_mode** | ADD / DOC-DELTA |
| **date** | 2026-08-06 |
| **CHOSEN** | **WAIVE_L2_PHASE1** (PM confirm · SA `PO-HRM-ATT-LEAVE-LADDER-N-01`) |
| **ack_status** | **PASS_TO_PM** |
| **no_prompt_echo** | true (prose khách không stamp work_item) |
| **cấm** | invent `N`/`T_L1=3` · seed · `apps/**` · Dev WF-01 · claim `attendance_uat_ready` |

---

## 0. Read ack

| # | Artifact | Outcome |
|---|----------|---------|
| 1 | `PO-HRM-ATT-LEAVE-LADDER-N-01.md` | WAIVE L2 Phase-1; N NOT_LOCKED; Option A PRESERVE backlog |
| 2 | `po-hrm-att-leave-ladder-n-01.md` | Same decision · ba-docs mission copy-ready |
| 3 | `PO-HRM-E2E-LINK-ATT-SPEC-01.md` §4.1 §5 P0-1 | EXPAND draft → DOC-DELTA WAIVE merge |
| 4 | `po-e2e-ba-case-matrix-01.md` GAP-LEAVE-LADDER-01 | Stamp WAIVED_P1 · LV-02 ⬜ |
| 5 | `po-e2e-leave-ladder-sa-01.md` Option A | Pointer preserved — no wipe |
| 6 | Enterprise FR-UC-BP-ATT-09 · HDSD §5.2–5.3 · UC-FR-H03 | Living SoT (SRS_NEW.md **not on disk**) |

---

## 1. Delta applied (ADD-only)

| Artifact | Change |
|----------|--------|
| `SRS_HRM_ENTERPRISE.md` | Version **0.14**; FR-UC-BP-ATT-09 ADD quy tắc + trường hợp: GĐ1 = một cấp QL trực tiếp; giai đoạn sau = thang theo ngày **cấu hình** — **không** số cứng; must_keep hold quỹ / sequence một QL |
| `03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` | §5.2–5.3 ADD honesty: GĐ1 = QL trực tiếp; **không** bảng ngày→cấp |
| `PO-HRM-E2E-LINK-ATT-SPEC-01.md` | §4.1 WAIVE DOC-DELTA; L8/SB-01/SS-01–02 WAIVED_P1; P0-1 DONE; P0-2 HOLD; cascade; BR/LV-02/honesty locks; `attendance_uat_ready=false` |
| `po-e2e-ba-case-matrix-01.md` | GAP-01/02 + LV-02 + BR + residual **WAIVED_P1** |
| `UC-FR-H03_LEAVE.md` | CAP-LV-06 / TC L2 / coverage = **WAIVED_P1** |
| `docs/hrm/SRS.md` UC-HRM-10 | DOC-DELTA Phase-1 one-step approve honesty |
| `SRS_VN.md` §4 | GĐ1 = QL trực tiếp; không khóa số ngày cắt |
| `PO-HRM-UC-MENU-COVERAGE-AUDIT-01.md` row 14 | Ladder WAIVE stamped; HOLD Dev ladder |

**Không** ghi production `N` / `T_L1=3` vào BR body.  
**Không** wipe FR-UC-BP-ATT-09 / Option A prior evidence.  
**Không** đụng `apps/**`.

---

## 2. Stamps (honesty)

| Flag / case | Value |
|-------------|--------|
| `attendance_uat_ready` | **false** |
| LV-02 | **WAIVED_P1** / ⬜ — **cấm** 🟢 |
| BR-LEAVE-LADDER-01 numeric | **WAIVED_P1** |
| Production `N` / `T_L1` | **NOT_LOCKED** |
| Option A (`leave_l1_max_days` + WF L2 skipWhen) | **PRESERVED backlog** · Dev HOLD |
| WF AS-IS | **1** bước `direct_manager` |
| HDSD bảng ngày→cấp | **không** ADD đến reopen |
| `PO-HRM-ATT-LEAVE-LADDER-WF-01` | **BLOCKED** until reopen |

---

## 3. Option A backlog pointer (must_keep)

| Prior pack | Status |
|------------|--------|
| `po-e2e-leave-ladder-sa-01.md` Option A | PRESERVED |
| TechSpec/DB/API physical keys (`leave_l1_max_days`, skipWhen, …) | HOLD implement |
| `C-LEAVE-DEV-UNLOCK-01` | REMAINS |
| `Q-LEAVE-LADDER-01` | OPEN until sponsor number / config-from-FE |

**Reopen:** Sponsor CONFIRM `N=<int>` **or** `config-from-FE unlock` → supersede WAIVE → DOCS reopen → WF-01.

---

## 4. Handoff

### completion_report

- **Closed:** Merged `WAIVE_L2_PHASE1` into living SRS/HDSD/ATT artifacts (ADD-only); LV-02 + BR-LEAVE-LADDER-01 numeric = **WAIVED_P1**; HDSD GĐ1 = QL trực tiếp (no day→level table); Option A pointer preserved; `attendance_uat_ready=false`; no invent N; no apps/**; no Dev WF-01.
- **Open:** Funnel leave→sheet · SIGN UF · other ATT P0; Dev ladder **HOLD**; optional QA LV-01/03 honesty stamp.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: (optional) PO-HRM-ATT-SPINE-02-WEB-QA-01 — honesty slice
from_role: pm
to_role: qa
lane: execution
priority: P1 optional after ATT P0 funnel/sign

ENTRY: docs/qa/evidence/po-hrm-att-leave-ladder-docs-01.md · ATT SPEC §4.1 WAIVE
MISSION: U65 browser — LV-01 (L1 direct_manager) + LV-03 VAL-ATT honesty; stamp LV-02 = WAIVED_P1 / ⬜ (cấm 🟢).
EXIT: evidence + PASS_TO_PM
CẤM: invent N · seed · claim attendance_uat_ready · dispatch PO-HRM-ATT-LEAVE-LADDER-WF-01

--- parallel ATT (PM HOLD Dev ladder) ---
Prefer next: PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01 (sa) và/hoặc PO-HRM-ATT-SIGN-QA-01 khi Dev sign READY.
CẤM: PO-HRM-ATT-LEAVE-LADDER-WF-01 trừ reopen sponsor N hoặc config-from-FE.
```

### evidence_path

`docs/qa/evidence/po-hrm-att-leave-ladder-docs-01.md`

### ack_status

**PASS_TO_PM**
