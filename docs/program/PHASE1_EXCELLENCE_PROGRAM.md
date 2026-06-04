# Phase 1 Excellence Program — PM charter (international delivery standard)

**Owner:** PM (30y-style program director)  
**Date:** 2026-05-26  
**Trigger:** Sponsor yêu cầu **hoàn thiện toàn diện** — không chỉ G1 matrix + GWC; gồm rủi ro nghiệp vụ, kiến trúc, UI/UX so chuẩn quốc tế.

**Baseline:** P1-S5-QC-02 **GO WITH CONDITIONS** · G1 **245/245** · G2 **103/104 e2e** + 1 waived · L0–L2.5 PASS (group CEO slice).

---

## 1. Đích “hoàn thiện hết” (sponsor-grade)

| Tier | Định nghĩa | Khác GWC hiện tại |
|------|------------|-------------------|
| **T1 — Matrix** | G1 245/245, G2 **104/104 e2e** hoặc waiver có expiry + Phase 2 plan | G2 còn 1 waived MASTER-01 |
| **T2 — Runtime** | `phase1:gate --strict` **0**; L0–L4; persona **3+** (group CEO, member CEO, HRBP) | Chủ yếu `ceo@xe.vn` |
| **T3 — Business** | Mọi UC Phase 1: AC testable; journey map **không ⏳**; gap BA = 0 P0/P1 | Matrix ≠ BA sign-off từng màn |
| **T4 — Architecture** | TM + SA S5 **GO**; risk register P0/P1 = 0; ADR drift = 0 trên pilot | TM/SA GWC |
| **T5 — UI/UX** | Heuristic review vs **Workday / SAP SuccessFactors / Oracle HCM** (benchmark doc); P0 UX = 0 trên P-CC + HRM embed | Chưa có benchmark file |
| **T6 — Production path** | `SERVICE_READINESS` + `verify:production-env` + QC prod **GO** | Production 🔴 |

**Program DONE (sponsor):** T1–T6 **MET** + QC **GO** (không GWC) + PSR signed.

**Ngoài scope:** 128 UC Logistic Phase 2; feature Phase 2 trong BRD.

---

## 2. Benchmark quốc tế (UI/UX & nghiệp vụ — tham chiếu)

| Domain | Reference products | Áp dụng XeVN Phase 1 |
|--------|-------------------|----------------------|
| Org / legal entity | Workday Org Studio, SAP EC | CC-03/04, member units, legal profile |
| RACI / governance | SAP GRC, ServiceNow SPM | UC-RACI-01..06 |
| Employee 360 | Workday Worker Profile, SF Employee Central | HRM embed tabs, J-HRM journeys |
| Time & payroll | Workday Time Tracking, ADP | P-CC-07/08, mobile attendance |
| Workflow inbox | ServiceNow, Jira SM | CC inbox, alerts, WF canvas |

BA deliverable: `docs/program/PHASE1_UX_BENCHMARK_ASSESSMENT.md` (P0/P1/P2 findings per screen).

---

## 3. Risk register (PM — điều phối đóng)

| ID | Layer | Risk | Sev | Owner wave |
|----|-------|------|-----|------------|
| EX-R01 | Business | `UC-ECO-MASTER-01` waived — master API chưa đủ | P1 | P1-EX-BE-01 |
| EX-R02 | Runtime | Persona member CEO / HRBP chưa UAT | P1 | P1-EX-QA-01 |
| EX-R03 | Architecture | Scope helpers không đồng nhất (đã fix RACI; audit còn lại) | P1 | P1-EX-SA-01 |
| EX-R04 | UX | HRM profile tabs trống (degrees, training…) — UX kém vs SF | P1 | P1-EX-FE-01 + BA |
| EX-R05 | UX | Command Center density / empty states / i18n | P2 | P1-EX-FE-02 |
| EX-R06 | Ops | Production 0%; strict gate chưa verify | P1 | P1-EX-DO-01 |
| EX-R07 | Governance | PSR / journey map lệch evidence | P2 | P1-EX-PM-01 |
| EX-R08 | Security | Prod secrets, RLS policy TBD | P1 | P1-EX-TM-01 |

---

## 4. Wave điều phối (song song — không đợi user)

| Wave | work_item_id | Role | Exit |
|------|--------------|------|------|
| **W-EX-A** | P1-EX-BA-01 | ba-process + ba-data | UX benchmark doc + business gap list P0/P1 |
| **W-EX-B** | P1-EX-SA-01 | sa | Architecture risk + ADR compliance audit |
| **W-EX-C** | P1-EX-TM-01 | technical-manager | Security/NFR gate (extend S5) |
| **W-EX-D** | P1-EX-QA-01 | qa | Persona UAT + `--strict` gate + journey sync |
| **W-EX-E** | P1-EX-FE-01 | dev-fe | P0 UX fixes from BA + empty tab messaging/API |
| **W-EX-F** | P1-EX-BE-01 | dev-be | MASTER-01 path / remaining Nest APIs per BA |
| **W-EX-G** | P1-EX-DO-01 | devops | Strict gate path + production-env verify |
| **W-EX-H** | P1-EX-QC-01 | qc | Excellence Go/No-Go vs T1–T6 |

**PM:** `P1-EX-PM-01` — cập nhật PSR, bus, Excel PMP, đóng C-QC02-*.

---

## 5. Trung thực với sponsor

- **Đã đạt:** UAT baseline group CEO; 245 UC tracked; automation xanh trên bundle đã chạy.
- **Chưa đạt “hoàn thiện hết”:** T2–T6; 1 UC G2 waived; UI/UX benchmark chưa làm; Production chưa mở.
- **Ước lượng:** W-EX-A..H ≈ **2–4 tuần** calendar với 3 Dev + QA full-time (PM điều phối liên tục, zero-residual rule).

Bus: `docs/program/AGENT_MESSAGE_BUS.md` · Evidence: `docs/qa/evidence/p1-ex-*-20260526.md`

---

## Status pulse (2026-05-27)

| Tier | Status | Note |
|------|--------|------|
| T1 | PARTIAL | G1 245/245; G2 103+1 waived |
| T2 | **MET (GWC)** | L2.5 **7/7**; 3 personas incl. portal HRBP (`p1-ex-qa-03-r1`) |
| T3 | **MET** | Journey 7/7 + `p1-ex-ba-02` §4 P0=0 |
| T4 | **MET** | TM-04 + SA-04: P1-02/03/04 closed; **P1=0**; ADR §4 drift **0** (`p1-ex-tm-04`, `p1-ex-sa-04`) |
| T5 | **MET** | `p1-ex-ba-02` §4 P0 blocking **0**; 1 CONDITION inbox strict UAT |
| T6 | **PARTIAL** | VPS `verify:production-env` **0** (`p1-ex-do-01`); TLS/nginx path (`p1-ex-do-prodqc-01`); QC prod GO pending |

**Waves closed:** Excellence FE/BE/BA/QA/DO + **QC-03 GWC** (3/6 tier MET)  
**Open for QC-05 (≥5/6):** T6 QC prod GO + `SERVICE_READINESS` PROD · TM-04 concurrence · optional **P1-EX-QC-05**
