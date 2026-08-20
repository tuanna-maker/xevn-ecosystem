QA browser thật cho 1 work_item_id (U65 — nghiệm thu từ FE, không seed giả).

Trước khi chạy:
1. Đọc evidence_path của work_item liên quan + spec_ref (SRS/UC/AC).
2. Xác nhận stack đang chạy: `netstat -ano | grep LISTENING | grep -E ":8080|:5173|:28001|:28002"` — KHÔNG tự kill process không rõ chủ; nếu thiếu port cần thiết, khởi động riêng qua Browser preview tool, không đè lên process có sẵn.
3. Login persona đúng role cần test (tìm persona/password trong `docs/qa/evidence/*.md` gần nhất cùng module — KHÔNG tự tạo persona mới, KHÔNG seed DB).

Trong lúc chạy (theo `_vibe-team-os/30-HDSD-ALIGNED-QA-AND-SRS-BRANCH-TRACE.md`):
- Test case bám đúng thao tác HDSD thật, không chỉ happy-path/API.
- Case sai trước (fail path) → case đúng (success) → assert logic nghiệp vụ, không chỉ HTTP 200.
- Ghi log từng bước theo thời gian (`_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`) — không evidence không log bước.
- F5 reload để xác nhận persist thật (không chỉ optimistic UI).

Sau khi chạy:
- Ghi evidence `docs/qa/evidence/qa-<work_item_id>.md`: matrix PASS/FAIL từng hàng, ack_status (READY_FOR_QC / PASS_TO_PM / PASS_WITH_HOLD / FAIL_TO_PM / BLOCKED).
- KHÔNG PASS chỉ vì unit test xanh — phải có bằng chứng browser/API sống.
- Nếu vật lý/onsite chưa làm được → `DEFERRED` + lý do, không fake.
