# PM Lesson — Primary-flow E2E orchestration (XBOS → member → HRM)

**Context:** Sponsor 2026-08-01 yêu cầu không chỉ map UC HRM, mà cấu hình quy trình trên XBOS, apply ĐVTV, rồi chạy full tuyển dụng trên HRM từ FE để đối chiếu SRS/TechSpec/FE/BE — làm mẫu cho PM khác.

**Action:**
1. Định nghĩa N bước nghiệp vụ ngoài đời (ví dụ 13 bước tuyển dụng IT).
2. Map từng bước → màn XBOS + màn HRM + UC/J-*/UF + “product today vs gap”.
3. **Rút inventory HDSD** (menu × màn × nút × function) — U76; QA cover hết hoặc 🟡 product_gap.
4. Viết kịch bản browser U65+U76 (`docs/qa/P1_BROWSER_E2E_RECRUITMENT_13STEP_XBOS_HRM.md`).
5. Dispatch QA chạy đủ bước **đúng label HDSD** → QC audit; residual → BA/Dev — cấm seed/API-only PASS.

**Outcome:** SoT kịch bản + work_item `QA-REC-E2E-13STEP-01` / `QC-REC-E2E-13STEP-01`; lesson tái sử dụng cho mọi luồng chính (nghỉ phép, HĐ, chấm công…).

**Evidence:** `docs/qa/P1_BROWSER_E2E_RECRUITMENT_13STEP_XBOS_HRM.md`

**Reuse-tag:** `pm-primary-flow-e2e` · `u65-zero-seed` · `xbos-then-hrm`
