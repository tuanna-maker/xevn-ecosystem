# QC Gate — PO-E2E-LEAVE-LADDER-QC-DOCS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-LEAVE-LADDER-QC-DOCS-01` |
| **role** | qc (governance · docs gate) |
| **date** | 2026-08-03 |
| **scope** | Leave ladder Option A — chain SRS → TechSpec → DB → API (physical pack) before Dev unlock |
| **prior evidence** | `po-e2e-leave-ladder-sa-01` · `po-e2e-leave-ladder-ba-docs-01` · `po-e2e-leave-ladder-techspec-01` · `po-e2e-leave-ladder-db-api-01` |
| **ack_status** | `PASS_TO_PM` |
| **verdict** | **GO WITH CONDITIONS** |
| **cấm** | `apps/**` · seed · invent GO without reading pack · 🟢 LV-02 on ASSUMPTION alone |

---

## 0. Gate type & pack integrity

| Item | Result |
|------|--------|
| Gate class | **Docs / physical SoT** — not browser UAT, not Phase 1 product GO |
| `verify:qc:evidence-pack` portal/J-* | **N/A** (docs-wave; same policy as `doc-ent-hrm-mmap-qc-01`) — do not NO-GO process |
| Member evidence chain | **PASS** — 4 prior WI MD present + readable |
| QC opened SoT on disk | **PASS** — independent read/grep of `SRS_NEW` · `TECH_SPEC_NEW` · `DB_DESIGN_NEW` · `API_CONTRACT_NEW` under `docs/brand-new-documents-20270801/` |

---

## 1. Version chain (independent disk)

| Artifact | Claimed | Disk verify | Result |
|----------|---------|-------------|--------|
| `SRS_NEW.md` | v1.3 · FR-UC-H03 · BR-LEAVE-LADDER-01/02 · Q-LEAVE-LADDER-01 | Header **Phiên bản 1.3**; nhật ký 1.3 ADD ladder; BR + AC-H03-02..05 + AC-MMAP-LV-LADDER; §6.1 ASSUMPTION | **PASS** |
| `TECH_SPEC_NEW.md` | v1.3 · §4.4.1 | `ref_srs` SRS v1.3; **§4.4.1** Config / WF / spawn / skipWhen / fail-closed; nhật ký **1.3** | **PASS** |
| `DB_DESIGN_NEW.md` | v1.2 | Title **v1.2**; `ref_techspec` §4.4.1; §3.9 `hrm_company_settings`; nhật ký **1.2** CLOSED PHYS | **PASS** |
| `API_CONTRACT_NEW.md` | v1.2 | Title **v1.2**; `ref_db` v1.2; F.1 leave + settings + spawn; nhật ký **1.2** | **PASS** |

**Trace credibility:** SA Option A → ba-docs SRS → sa TechSpec → ba-data DB/API — versions and keys align (`leave_l1_max_days`, `requires_l2`, `skipWhen`, `HRM-LEAVE-CFG-LADDER`).

---

## 2. Checklist (mission checks)

| # | Criterion | Result | Proof |
|---|-----------|--------|-------|
| 1 | API F.1 Mục đích / Nghiệp vụ / bước SRS on **create** | **PASS** | `API` §4.2 POST leave-requests — 3 fields + DTO + `HRM-LEAVE-CFG-LADDER` |
| 2 | API F.1 on **approve** (+ reject) | **PASS** | §4.4 approve Diễn biến #5–7 · `HRM-LEAVE-LADDER-409`; §4.5 reject BR-LEAVE-LADDER-01.c |
| 3 | API F.1 on **settings** GET/PUT | **PASS** | §4.6/4.7 `leave_l1_max_days` · Diễn biến #3 · AC-MMAP-LV-LADDER · no default magic N |
| 4 | API F.1 on **spawn** + complete skip | **PASS** | §1.1 instances spawn context; §1.3 complete skipWhen L2; `XBOS-WF-LADDER-422` |
| 5 | `skipWhen` L2 documented | **PASS** | TS §4.4.1; DB §3.4 graph; API complete path `(total_days ≤ t_l1) ∧ (!requires_l2)` |
| 6 | `HRM-LEAVE-CFG-LADDER` fail-closed | **PASS** | TS §4.4; DB VAL-LL-02; API create + §10 codes |
| 7 | Key `leave_l1_max_days` + `requires_l2` | **PASS** | SRS BR-01/02; TS; DB `hrm_company_settings` + `metadata.requires_l2` + snapshots; API create/settings |
| 8 | No hardcode **N=3** as production BR | **PASS** | BR text configurable only; `T_L1=3` only under **ASSUMPTION** / Q-LEAVE-LADDER-01; API «không enforce N=3»; DB no DEFAULT DDL=3 |
| 9 | `R-LEAVE-LADDER-PHYS` CLOSED claim credible | **PASS (bounded)** | Physical columns/keys/F.1 exist on DB v1.2 + API v1.2 matching TS §4.4.1 — **credible CLOSED for physical SoT**. Stale OPEN wording remains in TS §7–§8 (hygiene — see conditions) |
| 10 | Dev unlock policy | **CONDITION** | Docs spine **approved bounded**; Dev **not** free GO — see §4 |

---

## 3. Classification

| Class | Items |
|-------|--------|
| **ENV** | N/A — docs-only; stack not required |
| **PROCESS** | TS §7/§8 still lists `R-LEAVE-LADDER-PHYS` as open → ba-data (stale after DB/API v1.2) — hygiene APPEND CLOSED |
| **PRODUCT / SPEC residual** | `Q-LEAVE-LADDER-01` OPEN (ASSUMPTION pilot value); HDSD `BR-LEAVE-LADDER-HDSD-01` HOLD; `R-PO-LEAVE-DAY-LADDER` / LV-02 🟡 until Dev+QA U65 |
| **PROGRAM** | **NOT** Phase 1 DONE · **NOT** UAT-PASS · **NOT** runtime implement · AS-IS WF still 1-step (API honest Dev HOLD) |

---

## 4. Residuals / Conditions (bounded GWC)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **C-LEAVE-DEV-UNLOCK-01** | P0 policy | pm | Dev-BE/FE **HOLD** unless (a) sponsor confirms Option A + pilot `T_L1` path **or** (b) explicit **config-from-FE** unlock (settings GET/PUT UI → PUT `leave_l1_max_days` → create/spawn). **Cấm** 🟢 LV-02 / claim ladder DONE on ASSUMPTION alone |
| **Q-LEAVE-LADDER-01** | P0 product | pm → sponsor | Pilot/UAT numeric value OPEN; production = per-company settings |
| **C-LEAVE-TS-PHYS-STALE-01** | P2 hygiene | sa | TECH_SPEC §7–§8 / residual table still points PHYS → ba-data OPEN; **APPEND** CLOSED pointer to DB/API v1.2 + this QC — không wipe §4.4.1 |
| **BR-LEAVE-LADDER-HDSD-01** | P2 HOLD | ba-docs | Bảng «Số ngày → người duyệt» sau khi chốt giá trị vận hành |
| **R-PO-LEAVE-DAY-LADDER / LV-02** | P0 QA later | qa after Dev | Giữ 🟡; U65 browser; zero-seed |

**Reopen → NO-GO (docs) if:** wipe BR-LEAVE-LADDER / §4.4.1 / settings F.1; invent production `N=3` into BR body; claim Dev READY_FOR_QA without config path.

---

## 5. Explicit non-claims

- **NOT** Phase 1 / product UAT / PROD-READY  
- **NOT** runtime WF 2-step implemented  
- **NOT** 🟢 LV-02 / close `R-PO-LEAVE-DAY-LADDER`  
- **NOT** unrestricted Dev unlock — only under **C-LEAVE-DEV-UNLOCK-01**  
- **NOT** seed / bootstrap as UAT evidence (U65)

---

## 6. Verdict

### **GO WITH CONDITIONS**

**Accepted (bounded):** Leave ladder Option A **physical docs pack** — SRS_NEW **v1.3** → TECH_SPEC_NEW **v1.3** §4.4.1 → DB_DESIGN_NEW **v1.2** → API_CONTRACT_NEW **v1.2** — F.1 complete on create / approve / settings / spawn; skipWhen + `HRM-LEAVE-CFG-LADDER` + `leave_l1_max_days` + `requires_l2` consistent; no production hardcode N=3; **`R-LEAVE-LADDER-PHYS` CLOSED** as physical SoT (credible).

**Conditions before product ladder claim:**

1. **Dev unlock** only via sponsor pilot confirm **and/or** explicit config-from-FE path (`C-LEAVE-DEV-UNLOCK-01`) — never ASSUMPTION-alone LV-02 🟢.  
2. sa hygiene: mark PHYS CLOSED on TechSpec residual (`C-LEAVE-TS-PHYS-STALE-01`).  
3. HDSD HOLD until operating value; LV-02 stays 🟡 until Dev + QA U65.

---

## completion_report

**Closed:** L3 docs gate `PO-E2E-LEAVE-LADDER-QC-DOCS-01` — independent chain audit SRS→TS→DB→API; F.1 + skipWhen + fail-closed + no magic N; PHYS CLOSED credible; verdict **GO WITH CONDITIONS**; Dev policy HOLD-unless-config-path documented.

**Residual / open:** Q-LEAVE-LADDER-01; C-LEAVE-DEV-UNLOCK-01; C-LEAVE-TS-PHYS-STALE-01; HDSD HOLD; LV-02 🟡; runtime not started.

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-E2E-LEAVE-LADDER-PM-UNLOCK-01
role: pm
priority: P0
lane: governance

ENTRY: QC docs gate GO WITH CONDITIONS — evidence docs/qa/evidence/po-e2e-leave-ladder-qc-docs-01.md. Physical SoT CLOSED (SRS v1.3 · TS v1.3 §4.4.1 · DB v1.2 · API v1.2). R-LEAVE-LADDER-PHYS CLOSED. Q-LEAVE-LADDER-01 ASSUMPTION vẫn OPEN.

Mission (cùng phiên):
1) Update bus + TEAM_WORKING_NOW: leave ladder docs pack APPROVED bounded; NOT Phase1/UAT DONE; LV-02 giữ 🟡.
2) Dev unlock policy (C-LEAVE-DEV-UNLOCK-01): HOLD `dev-be` claim ladder DONE trừ khi có (a) sponsor confirm Option A + pilot T_L1 value, HOẶC (b) explicit unlock «config-from-FE only» — PUT leave_l1_max_days từ UI, zero-seed, U65. CẤM 🟢 LV-02 trên ASSUMPTION alone.
3) Optional parallel P2: Task sa PO-E2E-LEAVE-LADDER-TS-PHYS-CLOSE-01 — APPEND TECH_SPEC residual R-LEAVE-LADDER-PHYS = CLOSED → DB/API v1.2 + QC evidence (C-LEAVE-TS-PHYS-STALE-01). allowed_paths: TECH_SPEC_NEW.md + evidence. Cấm wipe §4.4.1.
4) Khi unlock đủ: Task `dev-be` WF hrm_leave_approval 2 bước + skipWhen + bridge context + settings GET/PUT; rồi `dev-fe` settings UI tối thiểu; rồi `qa` LV-01/LV-02 U65.

EXIT: bus DISPATCHED rõ unlock path; ack không claim LV-02 🟢
Cấm: seed inbox · apps/** bởi PM · ASSUMPTION = production BR
```

### evidence_path

`docs/qa/evidence/po-e2e-leave-ladder-qc-docs-01.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

Intake GWC → apply **C-LEAVE-DEV-UNLOCK-01** before any `dev-be`; optional sa TS residual hygiene; **không** promote LV-02.
