# SYNTHESIS — P-HRM-ERP-DATA-FIDELITY-01 (Cursor G0-ERP)

**Stamp:** 2026-07-28 · CURSOR-PM  
**Sponsor:** Reject plan hẹp Position — yêu cầu mindset Product Owner / ERP chuẩn thế giới  
**Status:** `CURSOR-G0-ERP-COMPLETE` · chờ Claude merge · **cấm Dev** đến bạn chốt **cohort waves**

---

## 1. Trả lời đúng câu hỏi PO

| Câu hỏi sponsor | Verdict Cursor (4 seats) |
|-----------------|--------------------------|
| HRM đủ menu chưa? | **Đủ bề rộng menu** (STRONG Settings + Processes đúng read-only XBOS) |
| Chi tiết dữ liệu chuẩn ERP chưa? | **CHƯA** — depth **PARTIAL/WEAK** nhiều domain |
| Đủ phát huy sức mạnh nghiệp vụ? | **NO** (SA benchmark khóa) |
| Data cần Settings — đã có chưa? | **Một phần**: API ~76 catalogs; UI Settings MasterData **chỉ ~4 bucket** (job_titles, departments, leave_types, decision_types) |
| Consumer đã gọi catalog chưa? | **Lẫn**: Leave / EmployeeForm / JD-requisition **OK**; nhiều form còn **FREE_TEXT / HARDCODE**; BE assert catalog **rất mỏng** (~4 path) |
| CRUD + ràng buộc đủ chưa? | **PARTIAL**: spine CRUD có; constraint/status machine/mocks mỏng (Insurance depth, Performance create-only, Tools WEAK, Payroll mock islands) |
| XBOS control HRM? | **PARTIAL** (spine có; apply-to-members hẹp) |

**Vị trí free-text** = **một signal** trong cụm orphan Settings→consumer — không phải toàn bộ program.

---

## 2. Evidence Cursor (link agents)

| Seat | ID | Evidence |
|------|-----|----------|
| Domain CRUD 14 domains | [BA domain](91a675e4-c72b-4a61-a338-f3cc2452ef36) | `ba-hrm-erp-domain-crud-01-20260728.md` |
| Settings↔consumer 32 families | [BA-data](fd2dbe20-fe76-42a4-b384-75eec9f354d0) | `ba-hrm-erp-settings-consumer-01-20260728.md` |
| World ERP benchmark | [SA](ca06dd4b-be19-4dbb-a45b-f62747063743) | `sa-hrm-erp-world-benchmark-01-20260728.md` |
| Multi-domain QA spot | [QA](fc99275c-4428-4fbf-88f8-9250296b08a6) | `qa-hrm-erp-fidelity-spot-01-20260728.md` |

Merge: `docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md`  
Program: `docs/program/HRM_ERP_DATA_FIDELITY_PROGRAM.md`

---

## 3. Cohort đề xuất (sau Claude + bạn chốt — không one-shot «fix Vị trí»)

| Cohort | Nội dung (ví dụ) |
|--------|------------------|
| **E-MD-BIND** | Mọi FREE_TEXT master trên WH / Decisions / JobPostings / Headcount / Contracts → picker + `*_key` + BE assert |
| **E-SET-UI** | Settings UI cover đủ catalog đang live (không chỉ 4 bucket); alias `decision_types` ↔ `hr_decision_types` |
| **E-PAY-CLEAN** | Pay component / employment_type / channels hết HARDCODE → catalog |
| **E-CONSTRAINT** | Zod/API required FK, status machines (Performance, Insurance depth) |
| **E-XBOS-CTRL** | Mở rộng apply-to-members (departments, leave_types, …) |
| **HOLD** | Processes giữ XBOS read-only; Tools/Talent backlog đến khi sponsor mở |

G1 trước mỗi cohort: SRS delta + TechSpec + DB_DESIGN + API_DESIGN (U71).

---

## 4. Chờ bạn

1. Claude APPEND G0 (orphan full / constraint / benchmark / matrix / PO note)  
2. Cursor final peer SYNTH agree/diverge  
3. Bạn nhắn **«chốt cohort ERP fidelity»** (hoặc chỉnh thứ tự cohort) → mới kick G1→Dev→QA→QC theo **từng cohort**, không fix lẻ Vị trí.

---
## LOCK 2026-07-28T22:51:51+07:00 — Cohort queue ACTIVE
- Source: docs/program/FIDELITY_PROGRAM_DISPATCH.md (Claude dispatch + sponsor chốt)
- Sequence: **E1-A ‖ E1-B** → E2 → E3 → E-XBOS-CTRL-SPEC → WAVE-B
- Cursor: G1 docs kick ngay; Dev sau U71 PASS từng cohort
- Claude: docs/audit/peer — Cursor không tranh file

## 2026-07-28T23:45:08+07:00 — E1 CLOSED · E2 OPEN
- E1-A GWC · E1-B GWC · HOLD_DEPLOY
- E2 G1 DISPATCHED (SRS + DB/API)
