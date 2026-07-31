# Evidence — BA-HDSD-REC-INVENTORY-01

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HDSD-REC-INVENTORY-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **program** | `P-REC-E2E-13STEP-01` · U76 |
| **ack_status** | **PASS_TO_PM** |
| **Ngày** | 2026-08-01 |
| **inventory** | `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` |
| **SoT restored** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` |

## completion_report

**Closed**

- Rút inventory đầy đủ từ HDSD Ch07 (11 tab + submenu Tin/UV/PV + nút/Kanban/dialog/plan) và XBOS Ch04 liên quan tuyển dụng (Inbox · Canvas QT HRM · Áp dụng danh mục Nguồn ứng viên).
- Map từng hàng → `maps_to_fe_tab_id` + `maps_to_13step` S0–S11.
- Ghi **orphan HDSD** (Offer form riêng; apply-WF-members) và **orphan FE** (Import dialog; label_drift Dashboard/Đề xuất/Kế hoạch…).
- Label inventory giữ tiếng Việt HDSD; ghi drift FE trong cột notes.
- U65: không seed; không claim product DONE.

**Open / residual**

- Cây `docs/client-delivery/hdsd/**` (CH02–CH12 + HTML/PDF artifacts) **thiếu trên disk / chưa git** — chỉ restore CH07 trong WI này; PM nên dispatch ba-docs restore full HDSD tree nếu cần build `hdsd:build`.
- S10 (onboarding 30/60/90) **không** nằm HDSD Ch07 — ngoài orphan HDSD; theo 13-step = product_gap.

## Counts (inventory §1)

| Nhóm | Số hàng (ước lượng) |
|------|---------------------|
| Tab + submenu HRM | 24 |
| Dashboard / Kanban / nút / stage | ~20 |
| YCTD · JD · Tin · UV · Đề xuất · Chiến dịch · PV · Đánh giá · Kế hoạch · Báo cáo | ~35 |
| XBOS Inbox / Canvas / catalog apply (+ Settings pull) | ~12 |
| **Tổng hàng cover QA** | **~90** |

## next_owner

`qa` → `QA-REC-HDSD-COVERAGE-01`

## next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-REC-HDSD-COVERAGE-01
from_role: pm
to_role: qa
program: P-REC-E2E-13STEP-01
priority: P0
hdsd_align: true
hdsd_sot: docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md (+ docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md)
entry_criteria: BA-HDSD-REC-INVENTORY-01 PASS; L0 stack; browser U65 zero-seed; URL :8088 hoặc local
exit_criteria:
  - Mọi hàng inventory §1 có verdict 🟢/🟡/🔴/⬜ + click path + Network/F5 khi mutate
  - Cover đủ submenu Tin×4 · UV×5 · PV×3 (không chỉ happy-path)
  - Label click bám HDSD (hoặc ghi label_drift nếu UI lệch)
  - Orphan HDSD → 🟡 product_gap; orphan FE Import = cover FE-extra
  - Có thể chạy cùng wave với QA-REC-E2E-13STEP-01 nhưng bảng U76 inventory bắt buộc trong evidence
cấm: pnpm seed:* · API mutate ngoài UI · PASS chỉ probe
evidence_path: docs/qa/evidence/qa-rec-hdsd-coverage-01-20260801.md
persona: ceo@xe.vn / Xevn@2026 · optional du-lich.ceo@xe.vn
ack_status_target: PASS_TO_PM
```

## pm_dispatch_hint

Sau QA coverage → `QC-REC-E2E-13STEP-01` / QC U76 spot; optional `BA-HDSD-TREE-RESTORE-01` nếu cần full `hdsd:build`.
