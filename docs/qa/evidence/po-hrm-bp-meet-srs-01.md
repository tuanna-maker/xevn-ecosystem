# Evidence — PO-HRM-BP-MEET-SRS-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | PO-HRM-BP-MEET-SRS-01 |
| from_role | ba-process |
| to_role | pm |
| lane | governance |
| ack_status | **PASS_TO_PM** |
| Ngày | 2026-08-04 |
| no_prompt_echo | true (SRS khách không chứa meta họp / Người nói / work_item) |

## Nguồn

- `docs/client-delivery/hrm-enterprise-blueprint/MEETING_20260804_CUSTOMER_WANTS.md` (Người nói 2 = khách)
- Digest `_meeting_digest_head/mid/tail.txt` (đối chiếu)
- SoT trước sửa: `SRS_HRM_ENTERPRISE.md` v0.5

## completion_report

### Đã đóng

1. **SRS v0.6** ADD/UPGRADE (không wipe 16 FR đủ 7 mục):
   - Phạm vi MVP tuyển = JD master + YCTD + Ứng viên gắn YCTD + Báo cáo; PV/đánh giá trong pipeline.
   - Chiến dịch / tin đa kênh / hub = **GĐ2 / ngoài MVP** (`FR-UC-BP-REC-03` banner + inventory).
   - Định biên: phòng ban trình+duyệt; HCNS tổng hợp; lưới tháng chỉ «cần tuyển» (không cặp cột kế hoạch/đề xuất trùng).
   - YCTD: cờ trong/ngoài định biên + lý do tuyển mới/thay thế → điều kiện ma trận duyệt; trạng thái pipeline trên YCTD.
   - CORE: hồ sơ dashboard; người phụ thuộc; C&B tách; work-mgmt OUT; BH timeline + tạm dừng; KT/KL tiêu đề + đã thi hành → lương; BB tài sản + offboarding; nghỉ tự nguyện vs buộc thôi việc; quyết định → lịch sử công tác.
   - ATT: phạt/giờ bám ca·lịch; cấp quỹ + hold; bảng công SoT (công chuẩn, chấm, phép, lễ, phạt, ăn ca, OT…).
   - E2E spine MVP + nhánh GĐ2; §6.1 Q-* **còn mở**; không claim khách đã ký; **không** invent FR PAY mới.
2. **UC_INVENTORY 0.3.2**: +UC-BP-REC-00; REC-03 = GĐ2; E2E đồng bộ; tổng **45** UC.
3. **FR_BACKLOG_REMAINING**: pointer §4 họp review.

### Residual / không làm trong seat này

- Không regenerate PDF/HTML khách (ba-docs nếu sponsor yêu cầu gói gửi).
- Không merge DB_DESIGN / TECHSPEC / API_DESIGN (parallel seats) — chỉ khóa logic SRS.
- Q-PAY-FORMULA / họp lương buổi sau còn mở.
- REC-00 / REC-06 / CORE-10… vẫn Lịch (chưa đủ 7 mục kỹ thuật) — đúng gate.

### Cấm đã tuân

- Không wipe thân FR 7 mục · không `apps/**` · không prompt-echo trên SRS · không claim TechSpec confirmed · không invent PAY.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-MEET-SRS-SYNC-01
from_role: pm
to_role: ba-docs (parallel sa / ba-data nếu draft DB/API lệch SRS v0.6)
lane: governance

Mission: Đồng bộ gói khách với SRS_HRM_ENTERPRISE.md v0.6 + UC_INVENTORY 0.3.2.
- ba-docs: refresh WBS Excel hạng mục MVP vs GĐ2 (REC-03 GĐ2; REC-00 JD); không regenerate PDF trừ sponsor yêu cầu; no_prompt_echo.
- sa / ba-data: diff draft TECHSPEC / DB_DESIGN / API_DESIGN vs SRS v0.6 (chiến dịch OUT MVP; YCTD pipeline status; headcount actor; ATT SoT fields; PAY không mở rộng).
entry: evidence docs/qa/evidence/po-hrm-bp-meet-srs-01.md · MEETING_20260804_CUSTOMER_WANTS.md
exit: PASS_TO_PM · evidence sync; Q-* vẫn mở; không claim khách ký.
cấm: wipe FR 7 mục · invent PAY · seed · apps/**
```

## evidence_path

`docs/qa/evidence/po-hrm-bp-meet-srs-01.md`

## Files touched

| Path | Change |
|------|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | v0.6 ADD/UPGRADE |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | 0.3.2 |
| `docs/client-delivery/hrm-enterprise-blueprint/FR_BACKLOG_REMAINING.md` | §4 pointer |
| `docs/program/AGENT_MESSAGE_BUS.md` | handoff |
