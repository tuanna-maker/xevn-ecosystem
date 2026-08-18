# Evidence — PO-HRM-BP-SYNTH-SRS-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | PO-HRM-BP-SYNTH-SRS-01 |
| from_role | ba-process |
| to_role | pm |
| lane | governance |
| ack_status | **PASS_TO_PM** |
| Ngày | 2026-08-04 |
| no_prompt_echo | true (SRS khách không chứa meta họp / mindmap path / work_item / Người nói) |

## Nguồn

- `docs/client-delivery/hrm-enterprise-blueprint/SYNTHESIS_MASTER_HRM_ENTERPRISE.md` v1.0 (D1–D8 · A3–A4 · P1–P6)
- Pointer: `MEETING_20260804_CUSTOMER_WANTS.md` (đã trỏ SYNTHESIS; PAY meeting COMPLETE)
- Mindmap: `_mindmap_20260804/mindmap_01..04.png` (qua SYNTHESIS — không paste mô tả PNG vào SRS khách)
- Supersede residual seat v0.6: `docs/qa/evidence/po-hrm-bp-meet-srs-01.md` («họp lương buổi sau» / «không invent PAY vì chưa họp»)

## completion_report

### Đã đóng

1. **SRS_HRM_ENTERPRISE.md v0.7** ADD/UPGRADE (không wipe 16 FR đủ 7 mục):
   - Khóa phạm vi D1–D8 bằng ngôn ngữ nghiệp vụ: campaign GĐ2; REC MVP 4 khối; định biên fields; C&B → HĐ/BH; work-mgmt OUT; tạm dừng code/demo đến xác nhận giấy; bảng công chốt → PAY.
   - ATT: danh mục loại phép phép năm · thâm niên · bù OT · chuyển kỳ · ứng phép (`BR-BP-LV-TYPE-01`); nghỉ ốm BH + hỗ trợ CTY (`BR-BP-LV-04`); AC trên ATT-04…07 + ATT-09.
   - PAY: khẳng định họp bốn trụ **đã xong**; SoT giờ = bảng công chốt; C&B từ HĐ/BH; KT/KL đã thi hành; **Q-PAY-FORMULA** chỉ cờ cách lắp engine — **cấm** hiểu là «chưa họp lương».
   - Version bump 0.7 + nhật ký §6.2; no_prompt_echo.
2. **UC_INVENTORY 0.3.3**: E2E + ATT tên loại phép; gate bỏ «họp lương còn mở»; SRS sync v0.7.
3. **FR_BACKLOG_REMAINING §4**: supersede residual PAY unfinished; pointer evidence synth-srs-01.
4. MEETING pointer: đã khớp SYNTHESIS (không cần sửa thêm nội dung khóa).

### Residual / không làm trong seat này

- Không regenerate PDF/HTML khách / WBS Excel → **ba-docs** (next).
- Không merge TECHSPEC / API_DESIGN / DB_DESIGN (parallel sa / ba-data seats).
- Q-* tham số vẫn mở (Q-PAY-FORMULA engine, Q-LEAVE-UNIT, …) — **không** claim khách đã ký.
- REC-00 / ATT-04…07 Lịch vẫn chưa đủ 7 mục kỹ thuật — đúng gate.

### Cấm đã tuân

- Không wipe thân FR 7 mục · không `apps/**` · không prompt-echo · không claim TechSpec confirmed · không ghi «họp lương chưa xong / buổi sau».

### Supersede note (v0.6 evidence)

| Residual cũ (`po-hrm-bp-meet-srs-01`) | Trạng thái sau synth |
|--------------------------------------|----------------------|
| «Q-PAY-FORMULA / họp lương buổi sau còn mở» | **SUPERSEDED** — họp lương COMPLETE; Q-PAY-FORMULA = cờ engine only |
| «không invent PAY» vì unfinished meeting | Giữ **cấm invent** ngoài khung FR; lý do = giữ khung đã họp, không phải «chưa họp» |

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SYNTH-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P0

Mission: Đồng bộ gói khách với SRS_HRM_ENTERPRISE.md v0.7 + UC_INVENTORY 0.3.3 + SYNTHESIS_MASTER v1.0.
- Rebuild PDF khách (SRS_HRM_ENTERPRISE) sau delta v0.7 nếu sponsor cần gói gửi.
- Refresh WBS Excel (WBS_*_MOI): campaign = GĐ2; leave types năm/thâm niên/bù OT/chuyển kỳ/ứng; nghỉ ốm BH+CTY; PAY module tách; **cấm** cột/ghi chú «họp lương chưa xong».
- no_prompt_echo; không claim khách đã ký; D7 pause code/demo giữ nguyên.
entry: evidence docs/qa/evidence/po-hrm-bp-synth-srs-01.md · SYNTHESIS_MASTER_HRM_ENTERPRISE.md
exit: PASS_TO_PM · evidence ba-docs; PDF/WBS paths cập nhật
cấm: wipe FR 7 mục · invent PAY ngoài khung · apps/** · seed
```

## evidence_path

`docs/qa/evidence/po-hrm-bp-synth-srs-01.md`

## Files touched

| Path | Change |
|------|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | v0.7 ADD/UPGRADE |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | 0.3.3 |
| `docs/client-delivery/hrm-enterprise-blueprint/FR_BACKLOG_REMAINING.md` | §4 pointer CORRECTION |
| `docs/program/AGENT_MESSAGE_BUS.md` | handoff |
| `docs/qa/evidence/po-hrm-bp-synth-srs-01.md` | evidence (this file) |
