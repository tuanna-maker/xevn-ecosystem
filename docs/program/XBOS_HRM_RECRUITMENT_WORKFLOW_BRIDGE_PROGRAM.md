# XBOS → HRM Recruitment Workflow Bridge — Program

| Field | Value |
|-------|--------|
| **program_id** | `P1-XBOS-HRM-REC-WF-BRIDGE` |
| **opened** | 2026-07-19 |
| **sponsor** | B-Minutes biên bản + chat 2026-07-19 — mở wave đúng luồng XBOS process → HRM tuyển dụng |
| **change_mode** | **UPGRADE** (không REPLACE CRUD tuyển dụng đã 🟢) |
| **code_memory** | Bắt buộc `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` bám SRS/TechSpec (`_vibe-team-os/11` · `12`) |
| **U65** | Zero-seed; FE-only UAT |

---

## 1. Problem / outcome

**As-is:** XBOS sync danh mục + WF leave/catalog; tuyển dụng HRM = CRUD + stage cứng — không spawn XBOS instance.  
**To-be:** Cấu hình quy trình tuyển dụng trên XBOS → HRM planning / duyệt hồ sơ / roadmap bước ứng viên theo instance WF; dashboard đọc tiến trình.

**must_keep:** UF-HRM-12 · J-HRM-05 · LeaveWorkflowBridge · CatalogWorkflowBridge · catalog J-XBOS-02/08 · F4 leave resolver path.

---

## 2. Waves

| Wave | Owner | work_item_id | Exit |
|------|-------|--------------|------|
| **W0** | ba-process | `XHRM-REC-WF-BA-01` | Delta UC/BR/AC + journey J-REC-WF-* draft |
| **W0b** | sa | `XHRM-REC-WF-SA-01` | ADR bridge + OpenAPI boundaries; SoT matrix |
| **W1** | ba-data | `XHRM-REC-WF-BD-01` | Data contract stage ↔ WF task types |
| **W2** | dev-be | `XHRM-REC-WF-BE-01` | Bridge spawn + callback; CODE-MEMORY; jest |
| **W3** | dev-fe | `XHRM-REC-WF-FE-01` | Roadmap UI + dashboard bind WF state |
| **W4** | qa | `XHRM-REC-WF-QA-01` | L2.5 J-* FE chain U65 |
| **W5** | qc | `XHRM-REC-WF-QC-01` | GO/GWC; no Phase1/PROD claim alone |

---

## 3. Dispatch rules (mọi Dev)

```yaml
change_mode: UPGRADE
code_memory_required: true
code_memory_mode: APPEND
spec_read_ack: required before code
must_keep:
  - UF-HRM-12 local recruitment mutate
  - LeaveWorkflowBridge
  - CatalogWorkflowBridge
forbidden:
  - Silent REPLACE of recruitment stage enum without ADR
  - Seed inbox to pass approve
```

OS refs: `_vibe-team-os/11-FEATURE-UPGRADE-NO-OVERWRITE.md` · `case-studies/xevn-ecosystem/`

---

## 4. Evidence index (fill as waves close)

| Wave | evidence_path |
|------|---------------|
| BA | `docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md` · **CLOSED** `XHRM-REC-WF-BA-01` 2026-07-19 · journeys J-REC-WF-01..06 on `PROGRAM_JOURNEY_MAP.md` |
| SA | `docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md` |
| BE/FE/QA/QC | `docs/qa/evidence/xhrm-rec-wf-*-YYYYMMDD.md` |

---

## 5. Parallel (không chặn)

Customer F3–F6 (`CD-FB-06..09`) tiếp tục — program này **bổ sung** bridge, không thay F6 JD library.
