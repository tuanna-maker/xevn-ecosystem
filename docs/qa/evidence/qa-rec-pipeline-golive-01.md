# QA Evidence — Recruitment Pipeline Golive
**Date:** 2026-08-19
**Tester:** Claude PM (browser javascript_tool — verified)
**ack_status:** PASS_WITH_HOLD

## Kết quả

| TC | Status | Notes |
|---|---|---|
| REC-R1 | OK | bodyLen=1354, page render OK, API error toast expected |
| REC-R2 | OK | Nút "Tạo tin tuyển dụng" (testid: rec-job-create-btn) có ở tab "Tin Tuyển dụng" |
| REC-R7 | PASS-CODE | buildContractHireCtaPath + CandidateAcceptOfferDialog confirmed |

## Ghi chú REC-R2
- Nút tạo nằm ở tab "Tin Tuyển dụng" (recruitment-nav-jobs), KHÔNG phải tab Dashboard mặc định
- Sau khi click tab đúng: button "Tạo tin tuyển dụng" render thành công
- API 401 với mock token → "Phiên đăng nhập không hợp lệ" toast = expected

## Hold items
- REC R3-R6 (pipeline stages, move candidate): cần real auth + candidate data
- REC R7 live test (hire→CTR prefill): deferred onsite
