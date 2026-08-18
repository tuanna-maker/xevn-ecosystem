# PO-E2E-LEAVE-LADDER-DB-API-01 — Physical DB + API F.1 (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-LEAVE-LADDER-DB-API-01` (alias `PO-E2E-LEAVE-LADDER-API-DB-01`) |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **cấm** | `apps/**` · invent production `N=3` · seed · wipe spine · claim Dev READY |

---

## 0. Read ack

| Source | Outcome |
|--------|---------|
| `docs/qa/evidence/po-e2e-leave-ladder-techspec-01.md` | TECH_SPEC_NEW **v1.3** §4.4.1 locked — Option A; residual **R-LEAVE-LADDER-PHYS** → ba-data |
| `docs/qa/evidence/po-e2e-leave-ladder-ba-docs-01.md` | SRS_NEW **v1.3** BR-LEAVE-LADDER-01/02; pilot `T_L1=3` = ASSUMPTION only |
| `docs/qa/evidence/po-e2e-leave-ladder-sa-01.md` | Option A recommend; settings key `leave_l1_max_days`; spawn context; skipWhen |
| `TECH_SPEC_NEW.md` §4.4.1 | Config · WF 2 bước · spawn `total_days`/`t_l1`/`leave_type`/`requires_l2` · fail-closed `HRM-LEAVE-CFG-LADDER` |
| `SRS_NEW.md` FR-UC-H03 | Diễn biến 1–9 · AC-H03-02..05 · AC-MMAP-LV-LADDER |
| `DB_DESIGN_NEW.md` / `API_CONTRACT_NEW.md` pre | v1.1 spine leave/WF/catalog — thiếu T_L1 / requires_l2 / skip |

---

## 1. Delta applied (ADD-only)

### 1.1 `DB_DESIGN_NEW.md` → **v1.2**

| ADD | Detail |
|-----|--------|
| Alias §1.3 | TechSpec CompanySettings → **`hrm_company_settings`** |
| §3.4 `graph` contract | `hrm_leave_approval`: L1 `manager_approval` + L2 `director_approval` + `skipWhen` |
| §3.5 `context` keys | `total_days`, `t_l1`, `leave_type`, `requires_l2` (+ leaveRequestId) |
| §3.6 task status | ADD `skipped` cho L2 bỏ qua |
| §3.7 items | ADD `metadata JSONB` · `leave_types.metadata.requires_l2` |
| **§3.9 NEW** | **`hrm_company_settings`** — unique `(tenant_id, company_id, setting_key)`; P0 key **`leave_l1_max_days`** → `{ "days": int≥0 }` |
| §4.2 leave | ADD snapshots `t_l1_snapshot`, `requires_l2_snapshot`, `l2_required` |
| §6 FR map | H03/M03 + settings + WF + catalog metadata |
| §8.1 | Validation matrix VAL-LL-01..07 |
| Risks | D-LEAVE-LADDER-01/02; D-LEAVE-LADDER-03 **CLOSED** (TS v1.3 aligned) |

**Không** DEFAULT DDL = 3. **Không** seed. Soft-delete / scope_parity giữ.

### 1.2 `API_CONTRACT_NEW.md` → **v1.2**

| Function | F.1 highlights |
|----------|----------------|
| `POST …/workflow-engine/instances` | Spawn leave context bắt buộc; `XBOS-WF-LADDER-422` |
| `POST …/tasks/:id/complete` | Skip L2 vs require L2; không HRM `approved` sớm |
| `POST …/tasks/:id/reject` | Reject bất kỳ cấp → hoàn pending (BR-LEAVE-LADDER-01.c) |
| `POST …/leave-requests` | Resolve T_L1 · `requires_l2` · snapshots · spawn · **`HRM-LEAVE-CFG-LADDER`** fail-closed · expose `l2_required` |
| `GET …/leave-requests` | Display-ready ladder fields · scope_parity |
| `GET …/leave-requests/:id` **NEW F.1** | `ladder_phase` · `HRM-LEAVE-202` |
| `POST …/approve` | L1-only terminal vs `pending_l2`; **`HRM-LEAVE-LADDER-409`** |
| `POST …/reject` | Map Diễn biến #5/#7 |
| `GET/PUT …/company-settings` **NEW** | `leave_l1_max_days` · scope_parity · `HRM-SET-CFG-200/201` · `HRM-LEAVE-CFG-422` |
| §10 codes | ADD ladder family codes |
| §0.4 H03 | Diễn biến 1–9 khớp SRS v1.3 |

Mỗi function có **Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS** (+ DTO/lỗi).

---

## 2. Traceability (SRS → TS → DB → API → Test)

| BR / AC | TechSpec | DB | API | QA expect |
|---------|----------|----|-----|-----------|
| BR-LEAVE-LADDER-01 | §4.4.1 Config + skip | `hrm_company_settings.leave_l1_max_days` · snapshots · context.`t_l1` | GET/PUT settings · POST leave · WF complete | AC-H03-02/03 · LV-01/02 sau Dev |
| BR-LEAVE-LADDER-02 | §4.4.1 requires_l2 | `config_catalog_items.metadata.requires_l2` · pull payload | create resolve flag | AC-H03-04 |
| Fail-closed thiếu T_L1 | §4.4.1 | no default N | `HRM-LEAVE-CFG-LADDER` | Không silent APPROVED |
| Skip L2 | skipWhen | task `skipped` | complete L1 → terminal | AC-H03-02 |
| Require L2 | total_days > t_l1 | `l2_required=true` | approve giữ pending | AC-H03-03 · LV-02 |
| scope_parity | L2 cùng company | company_id TEXT | list↔detail↔settings↔WF | AC-H03-05 · J-* leave |
| ASSUMPTION pilot 3 | Q-LEAVE-LADDER-01 | **không** DDL default | PUT chấp nhận int≥0 | LV-02 🟡 đến sponsor + Dev |

**J-* / UF:** LV-01 (≤ T_L1) · LV-02 (> T_L1) — browser U65; cấm seed inbox.

---

## 3. Error envelope (deterministic)

| Code | When | HTTP |
|------|------|------|
| `HRM-LEAVE-CFG-LADDER` | Missing/invalid `leave_l1_max_days` on create/spawn ladder | 422/409 |
| `HRM-LEAVE-CFG-422` | PUT `days` not int ≥ 0 | 422 |
| `HRM-LEAVE-LADDER-409` | Force local APPROVED while L2 still required | 409 |
| `XBOS-WF-LADDER-422` | Spawn leave missing `t_l1`/`total_days` | 422 |
| Existing | `HRM-LEAVE-422/409` · `HRM-SCOPE-409` · `XBOS-WF-409` (self-approve) | — |

---

## 4. Open / residual

| Item | Status | Owner kế |
|------|--------|----------|
| **R-LEAVE-LADDER-PHYS** | **CLOSED** (physical SoT v1.2) | — |
| Q-LEAVE-LADDER-01 sponsor pilot value | OPEN (ASSUMPTION) | pm → sponsor |
| QC docs gate (spine consistency) | OPEN | **qc** |
| Dev WF 2 bước + bridge + settings UI | **HOLD** until sponsor pilot path + QC/optional | pm → **not** claim READY |
| LV-02 / R-PO-LEAVE-DAY-LADDER | vẫn 🟡 | qa sau Dev |
| HDSD ngày→cấp | HOLD | ba-docs |

---

## 5. Handoff

### completion_report

- **Closed:** ADD-only physical SoT — `DB_DESIGN_NEW` **v1.2** (`hrm_company_settings.leave_l1_max_days`, `metadata.requires_l2`, leave snapshots, WF context/skipWhen, VAL-LL-*) + `API_CONTRACT_NEW` **v1.2** (F.1 create/approve/detail/settings + spawn/complete/reject ladder; `HRM-LEAVE-CFG-LADDER` fail-closed). Aligned TECH_SPEC **v1.3** §4.4.1. Closed R-LEAVE-LADDER-PHYS. No `apps/**`, no production hardcode N, no seed, no Dev READY.
- **Open:** Sponsor pilot `T_L1` (ASSUMPTION); QC docs gate; Dev HOLD; LV-02 🟡.

### next_owner

`pm` — prefer **qc** docs gate trên NEW pack leave ladder; **hold Dev** until sponsor confirms pilot value (or explicit unlock with settings-from-FE only, no seed).

### next_dispatch_prompt

```text
work_item_id: PO-E2E-LEAVE-LADDER-QC-DOCS-01
role: qc
priority: P0
lane: governance

ENTRY: Physical DB/API closed — DB_DESIGN_NEW v1.2 + API_CONTRACT_NEW v1.2 align TECH_SPEC_NEW v1.3 §4.4.1 + SRS_NEW v1.3 BR-LEAVE-LADDER-*. Evidence: docs/qa/evidence/po-e2e-leave-ladder-db-api-01.md · po-e2e-leave-ladder-techspec-01.md · po-e2e-leave-ladder-ba-docs-01.md.

Mission: Docs gate — verify F.1 Mục đích/Nghiệp vụ/bước SRS trên leave create/approve/settings + spawn context + skipWhen; error HRM-LEAVE-CFG-LADDER; no hardcode N=3; residual R-LEAVE-LADDER-PHYS CLOSED. Verdict GO / GWC / NO-GO. CẤM unlock Dev claim LV-02 nếu thiếu sponsor pilot path (Q-LEAVE-LADDER-01) trừ GWC ghi rõ config-from-FE only.

EXIT: evidence docs/qa/evidence/po-e2e-leave-ladder-qc-docs-01.md; ack PASS_TO_PM
Cấm: apps/** · seed · 🟢 LV-02 trên ASSUMPTION chưa confirm
```

**Alternate (nếu QC đã parallel):** PM giữ Dev HOLD; sau sponsor chốt `T_L1` pilot → `dev-be` (WF graph + bridge + settings) rồi QA LV-02 U65.

### evidence_path

`docs/qa/evidence/po-e2e-leave-ladder-db-api-01.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`PO-E2E-LEAVE-LADDER-QC-DOCS-01` (qc) **hoặc** hold Dev until `Q-LEAVE-LADDER-01` sponsor. **Không** `dev-be` claim ladder DONE trước QC + config path.
)
