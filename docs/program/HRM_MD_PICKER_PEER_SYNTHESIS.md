# SYNTHESIS — P-HRM-MD-PICKER-01 (Cursor G0 · chờ Claude merge)

**Stamp:** 2026-07-28 · CURSOR-PM  
**Status:** `CURSOR-G0-COMPLETE` · `CLAUDE-G0-PENDING` · **cấm Dev apps/** đến khi Claude APPEND + sponsor chốt E1

---

## 1. Đồng thuận Cursor (4/4 seats)

| Seat | Agent | Verdict |
|------|-------|---------|
| Inventory FE | [BA-P inventory](98450fc5-54d4-4f0f-95c2-a88e970c3340) | **10 FAIL / 10 GAP / 9 PASS** |
| Catalog trace | [BA-D trace](96f8d38a-04cc-402d-be40-6fe9b21fcdc1) | Pipe Settings OK; WH **orphan** free-text |
| XBOS control | [SA gap](1fa8ecac-e184-4281-b511-77782ace15ca) | XBOS control **PARTIAL** |
| QA spot | [QA spot](e83a9d33-5fb1-4ca8-b2d9-03d0008283fe) | Settings live `job_titles=5` / `positions=33`; WH Vị trí FAIL |

**SoT knowledge:** `docs/program/HRM_MD_PICKER_KNOWLEDGE_MERGE.md`

---

## 2. Trả lời sponsor (Cursor)

1. **Cấu hình vị trí theo công ty:** Có trong spec + Settings API (gốc XBOS + extension HRM).  
2. **Form Quá trình công tác:** Sai — Vị trí phải Select, đang Input.  
3. **XBOS đủ control HRM?** **PARTIAL** — spine publish/pull/extension có; `apply-to-members` mới cover hẹp (`job_titles` / recruitment_channels / job_grades), thiếu departments / leave_types đầy đủ DANH_MUC.  
4. **Chuẩn SRS/DB/API:** Rule picker đã khóa (BR-HRM-MD-01); **consumer + một phần XBOS breadth** chưa khớp — cần G1 delta rồi E1 Dev.

---

## 3. P0 đề xuất E1 (sau Claude + bạn chốt)

| Priority | WI | Scope |
|----------|-----|--------|
| P0 | `D-FE-HRM-WH-POSITION-PICKER-01` + `D-BE-HRM-WH-POSITION-KEY-01` | Work History Vị trí → catalog key |
| P0 cluster | Decisions / JobPostings / Headcount / Contracts position free-text | Wave E1b |
| G1 | `BA-HRM-MD-SRS-DELTA-01` → TechSpec → DB/API | Expand apply-to-members + persist code |
| G1 XBOS | Expand control keys departments + leave_types | SA/BE XBOS |

---

## 4. Chờ Claude

Claude tự giao: ORPHAN-SCAN · SETTINGS-MENU · XBOS-DM-CONTROL · QA-MATRIX · PM-30YR-NOTE → APPEND merge file.

Khi Claude xong → Cursor viết `HRM_MD_PICKER_PEER_SYNTHESIS.md` final → bạn nhắn **«chốt E1 MD picker»** → kick G1/E1.

---
## SUPERSEDED SCOPE (2026-07-28T17:12:33+07:00)
Sponsor **không đồng ý** plan chỉ quanh Vị trí. Program chuyển → **P-HRM-ERP-DATA-FIDELITY-01** (ERP PO fidelity toàn dữ liệu). Evidence G0 picker **giữ làm input**, không phải backlog E1 duy nhất.
