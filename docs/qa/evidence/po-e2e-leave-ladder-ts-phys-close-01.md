# PO-E2E-LEAVE-LADDER-TS-PHYS-CLOSE-01 — TECH_SPEC residual PHYS CLOSED (hygiene)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-LEAVE-LADDER-TS-PHYS-CLOSE-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **closes** | `C-LEAVE-TS-PHYS-STALE-01` (QC GWC hygiene) |
| **cấm** | `apps/**` · invent `T_L1` · wipe §4.4.1 · claim Dev READY / 🟢 LV-02 |

---

## 0. Read ack

| Source | Outcome |
|--------|---------|
| `docs/qa/evidence/po-e2e-leave-ladder-qc-docs-01.md` | GWC; PHYS CLOSED credible; condition **C-LEAVE-TS-PHYS-STALE-01** → sa APPEND CLOSED on TS §7–§8 |
| `docs/qa/evidence/po-e2e-leave-ladder-db-api-01.md` | DB_DESIGN **v1.2** + API_CONTRACT **v1.2**; R-LEAVE-LADDER-PHYS CLOSED (physical SoT) |
| `docs/qa/evidence/po-e2e-leave-ladder-techspec-01.md` | TECH_SPEC **v1.3** §4.4.1 locked; residual PHYS was OPEN → ba-data |
| `TECH_SPEC_NEW.md` §4.4.1 | Contract table intact (Config / WF / spawn / skipWhen / fail-closed) — **not wiped** |

---

## 1. Delta applied (APPEND / hygiene only)

| Artifact | Change |
|----------|--------|
| `TECH_SPEC_NEW.md` | Version **1.3 → 1.3.1** (hygiene) |
| Header | ADD `ref_db` → DB **v1.2**; `ref_api` → API **v1.2**; note Hygiene v1.3.1 |
| §4.4.1 residual line | OPEN ba-data → **CLOSED** + evidence refs; Dev HOLD retained |
| §5 ERD pointer | → DB v1.2 · PHYS CLOSED |
| §7 SoT tiếp theo | Narrative: delta ladder **đã đóng**; Dev HOLD |
| §8 table | **R-LEAVE-LADDER-PHYS** → **CLOSED** + QC/DB/API pointers |
| §9 nhật ký | Row **1.3.1** APPEND |
| Footer | v1.3.1 · PHYS CLOSED (docs) · Dev HOLD |

**Không** sửa bảng hợp đồng §4.4.1 (Config / WF / spawn / skip / require / BR-02 / L2 scope / terminal / fail-closed).  
**Không** invent production `T_L1` / `N=3`.  
**Không** `apps/**`.

---

## 2. Evidence refs (CLOSED pointer)

| SoT / evidence | Role in close |
|----------------|---------------|
| `DB_DESIGN_NEW.md` **v1.2** | Physical settings / snapshots / skipWhen / VAL-LL-* |
| `API_CONTRACT_NEW.md` **v1.2** | F.1 create/approve/settings/spawn · `HRM-LEAVE-CFG-LADDER` |
| `docs/qa/evidence/po-e2e-leave-ladder-qc-docs-01.md` | QC docs GWC — PHYS CLOSED credible |
| `docs/qa/evidence/po-e2e-leave-ladder-db-api-01.md` | ba-data close claim |

---

## 3. Explicit non-claims / HOLD

| Item | Status |
|------|--------|
| **C-LEAVE-DEV-UNLOCK-01** | **HOLD** — Dev-BE/FE không claim ladder DONE trừ sponsor pilot path **hoặc** config-from-FE unlock |
| **Q-LEAVE-LADDER-01** | OPEN (ASSUMPTION) |
| LV-02 / `R-PO-LEAVE-DAY-LADDER` | vẫn 🟡 |
| Phase 1 / UAT-PASS / runtime 2-step WF | **NOT** claimed |
| §4.4.1 wipe | **NOT** done |

---

## 4. Handoff

### completion_report

- **Closed:** TECH_SPEC_NEW **v1.3.1** hygiene — **R-LEAVE-LADDER-PHYS = CLOSED** pointing DB/API v1.2 + QC docs; **C-LEAVE-TS-PHYS-STALE-01** satisfied; §4.4.1 preserved; no apps; no magic N; Dev HOLD restated.
- **Open:** `C-LEAVE-DEV-UNLOCK-01`; `Q-LEAVE-LADDER-01`; HDSD HOLD; LV-02 🟡; runtime not started.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PO-E2E-LEAVE-LADDER-PM-UNLOCK-01
role: pm
priority: P0
lane: governance

ENTRY: SA hygiene done — TECH_SPEC_NEW v1.3.1; R-LEAVE-LADDER-PHYS CLOSED; C-LEAVE-TS-PHYS-STALE-01 CLOSED. Evidence: docs/qa/evidence/po-e2e-leave-ladder-ts-phys-close-01.md · po-e2e-leave-ladder-qc-docs-01.md. Physical pack: SRS v1.3 · TS v1.3.1 §4.4.1 · DB v1.2 · API v1.2.

Mission (cùng phiên):
1) Bus + TEAM_WORKING_NOW: PHYS hygiene CLOSED; docs pack APPROVED bounded (QC GWC); NOT Phase1/UAT DONE; LV-02 giữ 🟡.
2) Enforce C-LEAVE-DEV-UNLOCK-01: HOLD dev-be/dev-fe ladder DONE trừ (a) sponsor confirm Option A + pilot T_L1, HOẶC (b) explicit unlock config-from-FE (PUT leave_l1_max_days từ UI → create/spawn). CẤM 🟢 LV-02 trên ASSUMPTION alone.
3) Khi unlock đủ: Task dev-be WF hrm_leave_approval 2 bước + skipWhen + bridge context + settings GET/PUT; rồi dev-fe settings UI; rồi qa LV-01/LV-02 U65 zero-seed.

EXIT: bus DISPATCHED rõ unlock path; không claim LV-02 🟢
Cấm: seed · PM sửa apps/** · ASSUMPTION = production BR
```

### evidence_path

`docs/qa/evidence/po-e2e-leave-ladder-ts-phys-close-01.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

Intake → apply **C-LEAVE-DEV-UNLOCK-01** before any `dev-be`; **không** promote LV-02; PHYS stale hygiene done.
