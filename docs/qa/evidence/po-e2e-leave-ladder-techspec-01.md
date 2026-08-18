# PO-E2E-LEAVE-LADDER-TECHSPEC-01 — TechSpec ADD BR-LEAVE-LADDER (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-LEAVE-LADDER-TECHSPEC-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **cấm** | `apps/**` · wipe TechSpec · invent production `N` · claim Dev READY |

---

## 0. Read ack

| Source | Outcome |
|--------|---------|
| `docs/qa/evidence/po-e2e-leave-ladder-ba-docs-01.md` | SRS_NEW **v1.3** ADD BR-LEAVE-LADDER-01/02; pilot `T_L1=3` = ASSUMPTION §6.1 only |
| `docs/qa/evidence/po-e2e-leave-ladder-sa-01.md` | Option A — configurable `T_L1` + L2 in WF graph; recommend; no magic N |
| `SRS_NEW.md` FR-UC-H03 v1.3 | Diễn biến 1–9; AC-H03-01..05; `leave_l1_max_days`; fail-closed thiếu `T_L1` |
| `TECH_SPEC_NEW.md` pre | v1.2; §4.4 leave mỏng (1–3 submit / 4–5 approve); chưa ladder |

---

## 1. Delta applied (ADD-only)

| Artifact | Change |
|----------|--------|
| `TECH_SPEC_NEW.md` | Version **1.2 → 1.3**; `ref_srs` → SRS **v1.3** |
| §1 matrix | FR-UC-H03 row + AC-H03 / BR-LEAVE-LADDER / AC-MMAP-LV-LADDER; B03 skip note; B04 `requires_l2` |
| §4.1 TS-WF | ADD skip-step declarative note → bind §4.4.1 |
| §4.4 TS-LEAVE | Map Diễn biến SRS 1–9; **ADD §4.4.1** ladder contract |
| §4.10 | Mobile leave bám §4.4.1 |
| §4.12 | **ADD** AC-MMAP-LV-LADDER row; stub header → v1.3 |
| §5 | CompanySettings `leave_l1_max_days`; ERD text Leave→WF + skip/require L2 |
| §7–§8 | Residual **R-LEAVE-LADDER-PHYS** · **Q-LEAVE-LADDER-01** |
| §9 nhật ký | v1.3 ADD; footer v1.3 — không claim Dev READY |

### §4.4.1 contract summary (locked logic)

| Item | Spec |
|------|------|
| Config | `company_settings` / equivalent · key **`leave_l1_max_days`** (= `T_L1`) · integer ≥ 0 · per company |
| WF graph | `hrm_leave_approval`: L1 `direct_manager` (+ `hrbp` fallback) → L2 `position_template` / `role_code` (GĐ CT, **cùng company**) |
| Spawn context | `total_days`, `leave_type`, `t_l1`, `requires_l2` |
| Skip L2 | `(total_days ≤ t_l1) AND (!requires_l2)` — engine-side; L2 skipped ≠ missing |
| Fail-closed | Missing `T_L1` → no silent L1-only APPROVED for two-level ops |
| ASSUMPTION | Pilot/UAT `T_L1=3` **only** as note (`Q-LEAVE-LADDER-01`) — **not** production BR / not hardcoded |

**Không** wipe §4.1–§4.11 ngoài ADD. **Không** invent DDL/DTO chi tiết (→ ba-data). **Không** `apps/**`.

---

## 2. Options confirmation

| Option | Status in this WI |
|--------|-------------------|
| **A** Configurable `T_L1` + L2 in graph | **ADOPTED** in TechSpec (matches SA-01 + SRS v1.3) |
| B Fixed production N | Rejected for TS body |
| C Always L2 | Rejected |

---

## 3. Open / residual

| Item | Status | Owner kế |
|------|--------|----------|
| R-LEAVE-LADDER-PHYS — DB column/key + API F.1 spawn/settings/`requires_l2` | OPEN | **ba-data** |
| Q-LEAVE-LADDER-01 sponsor confirm pilot value | OPEN (ASSUMPTION) | pm → sponsor |
| HDSD ngày→cấp | HOLD | ba-docs / ba-process |
| Dev WF 2 bước + bridge + settings | HOLD until physical + config path | pm → **not** this WI |
| LV-02 / R-PO-LEAVE-DAY-LADDER | vẫn 🟡 | qa sau Dev |
| Dev READY / READY_FOR_QA | **NOT claimed** | — |

---

## 4. Handoff

### completion_report

- **Closed:** TECH_SPEC_NEW **v1.3** ADD-only — `ref_srs` FR-UC-H03 / BR-LEAVE-LADDER-01/02; §4.4.1 `leave_l1_max_days` · WF L1→L2 · spawn context · skip L2; AC-MMAP-LV-LADDER; ASSUMPTION pilot `T_L1=3` UAT-only; residual R-LEAVE-LADDER-PHYS; no wipe; no `apps/**`; no production magic N; no Dev READY.
- **Open:** ba-data physical DB/API; sponsor pilot value; Dev after unlock; LV-02 QA.

### next_owner

`pm` → dispatch **ba-data** (API/DB) nếu chưa parallel xong; **không** dispatch `dev-be` claim ladder DONE trước physical.

### next_dispatch_prompt

```text
work_item_id: PO-E2E-LEAVE-LADDER-DB-API-01
role: ba-data
priority: P0
lane: governance

ENTRY: TECH_SPEC_NEW v1.3 §4.4.1 + SRS_NEW v1.3 FR-UC-H03 BR-LEAVE-LADDER-01/02 đã khóa logic Option A. Evidence: docs/qa/evidence/po-e2e-leave-ladder-techspec-01.md · po-e2e-leave-ladder-ba-docs-01.md · po-e2e-leave-ladder-sa-01.md.

Mission: ADD-only DB_DESIGN_NEW + API_CONTRACT_NEW (F.1) —
1) company settings key/column leave_l1_max_days (T_L1) scoped company_id; GET/PUT scope_parity
2) leave_types metadata requires_l2 (catalog XBOS → HRM pull)
3) WF spawn/instance context fields: total_days, leave_type, t_l1, requires_l2; map Diễn biến H03 #3–7
4) skipWhen L2 semantics documented on API (engine); error HRM-LEAVE-CFG-LADDER fail-closed
5) CẤM hardcode N=3 production; ASSUMPTION pilot chỉ note UAT nếu cần

EXIT: evidence docs/qa/evidence/po-e2e-leave-ladder-db-api-01.md; ack PASS_TO_PM
Cấm: apps/** · invent N · wipe DB/API spine · claim Dev READY
```

### evidence_path

`docs/qa/evidence/po-e2e-leave-ladder-techspec-01.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`PO-E2E-LEAVE-LADDER-DB-API-01` (ba-data) — **không** `dev-be` trước DB/API physical. LV-02 giữ 🟡.
