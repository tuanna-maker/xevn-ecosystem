# PO-HRM-MVP-GD1-CONTINUOUS — Một Giai đoạn · cuốn chiếu UC đến xong

| Mục | Nội dung |
|-----|----------|
| **work_item program** | `PO-HRM-MVP-GD1-CONTINUOUS` |
| **Sponsor lock** | 2026-08-09T02:02:22+07:00 — *không phân giai đoạn nữa; chỉ 1 GD; làm liên tục đến xong phạm vi đã chốt* |
| **U-lock** | **U89** SINGLE-GD-CONTINUOUS |
| **SoT phạm vi** | ``UC_INVENTORY.md`` + ``SPONSOR_SRS_CHOT_LOCK.md`` SRS v0.8 + ``SPONSOR_CHOT_*`` |
| **Thứ tự** | Trụ WBS: **REC → CORE → PLT → ATT → PAY**; trong trụ: Ưu tiên → ADD → EXPAND |
| **OUT / GĐ2 khách** | **Không** vào hàng này (REC-03 OUT · CORE-04 OUT · ATT-03e OUT · ATT-03 GĐ2 · QR S15/S16 · kéo-thả lương GĐ2) |
| **Cấm** | Tách «wave giai đoạn» / idle hỏi sponsor chọn phase · claim module UAT khi honesty false · seed nghiệm thu |
| **Exit program** | Mọi UC IN-MVP trong hàng có fidelity GWC hoặc WAIVER sponsor có owner+expiry · rồi mới xét flip ``product_go`` |
| **Honesty** | 16 flag giữ ``false`` đến khi từng flag có wave riêng + QC (không bundle) |

## Hàng UC (n=
50
) — trạng thái seat

| # | Pillar | Paper | UC | Tên ngắn | Seat |
|---|--------|-------|----|----------|------|
| 1 | REC | Ưu tiên | `UC-BP-REC-01` | Quản trị định biên vị trí × 12 tháng (phòng ban trình; HCNS tổng hợp) | **WAVE-1** SA Option A · BA AC |
| 2 | REC | Ưu tiên | `UC-BP-REC-01b` | Auto sinh YCTD theo tháng «Cần tuyển» | **WAVE-1** SA Option A · BA AC |
| 3 | REC | Ưu tiên | `UC-BP-REC-02` | Yêu cầu tuyển trong định biên (luồng rút gọn) | **WAVE-2** SA Option A CONFIRMED · next BA AC |
| 4 | REC | Ưu tiên | `UC-BP-REC-02b` | Yêu cầu tuyển ngoài định biên (có BOD) | **WAVE-2** SA Option A CONFIRMED · next BA AC |
| 5 | REC | Ưu tiên | `UC-BP-REC-08` | Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người») | **WAVE-3** SEALED GWC · honesty false · C-SLICE |
| 6 | REC | ADD | `UC-BP-REC-06a` | Xếp / hủy / đổi lịch PV — tối đa một lịch đang hiệu lực / ứng viên × p… | **WAVE-4** SEALED GWC · honesty false · C-SLICE · **R-REC-IV-PROJ-ID CLOSED** (`REC06AQC2-MSKZAM58`) |
| 7 | REC | EXPAND | `UC-BP-REC-00` | Thư viện mô tả công việc (JD master) — MVP | **WAVE-5** SEALED GWC · honesty false · `jd_dynamic_done=false` · C-SLICE · **R-REC-00-FE-COMMENT-ASTERISK CLOSED** (`REC00QA2-MSL0EZS5` / QC `REC00QC1-MSL0JMUT`) |
| 8 | REC | EXPAND | `UC-BP-REC-04` | Quét kho CV nội bộ trước kênh ngoài | **WAVE-6** SEALED GWC · honesty false · C-SLICE · stamp `REC04QC1-MSL1LU4H` · **≠** module REC UAT |
| 9 | REC | EXPAND | `UC-BP-REC-05` | Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline) | **WAVE-7** SEALED GWC · honesty false · C-SLICE · QA `REC05QA2-MSL31GG0` · QC `REC05QC1-MSL35D49` · **≠** module REC UAT · next **UC-BP-REC-06** SA |
| 10 | REC | EXPAND | `UC-BP-REC-06` | Gửi thư tuyển + đánh giá PV trong pipeline ứng viên | **WAVE-8** SEALED GWC · honesty false · C-SLICE · QA `REC06QA-MSL48P4M` · QC `REC06QC1-MSL4CU2G` · **≠** module REC UAT · next **UC-BP-REC-07** SA |
| 11 | REC | EXPAND | `UC-BP-REC-07` | Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại) | **WAVE-9** SEALED GWC · honesty false · C-SLICE · QA `REC07QA2-MSL5SJDU` · QC `REC07QC1-MSL5WXU5` · **≠** module REC UAT · next **UC-BP-CORE-01** SA |
| 12 | CORE | Ưu tiên | `UC-BP-CORE-01` | Hồ sơ vòng công khai (hành chính / phúc lợi) | **WAVE-10** SEALED GWC · honesty false · C-SLICE · QA `CORE01QA-MSL6U0AV` · QC `CORE01QC1-MSL6WMS7` · **≠** module CORE UAT · next **UC-BP-CORE-02** SA |
| 13 | CORE | Ưu tiên | `UC-BP-CORE-02` | Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng) | **WAVE-11** SEALED GWC · honesty false · C-SLICE · QA `CORE02QA-MSL7X7SJ` · QC `CORE02QC1-MSL80DU6` · **≠** module CORE UAT · next **UC-BP-CORE-08** SA |
| 14 | CORE | Ưu tiên | `UC-BP-CORE-08` | Khen thưởng & kỷ luật — thi hành → bảng lương | **WAVE-12** SEALED GWC · honesty false · C-SLICE · QA `CORE08QA-MSL980WO` · QC `CORE08QC1-MSL9BFFE` · **≠** module CORE UAT · next **UC-BP-CORE-09a** SA |
| 15 | CORE | ADD | `UC-BP-CORE-09a` | Thư viện điều khoản HĐ (Cài đặt) — ADD | **WAVE-13** SEALED GWC · honesty false · C-SLICE · QA `CORE09AQA-MSLA1C9L` · QC `CORE09AQC1-MSLA4LX9` · **≠** module CORE/CTR UAT · printable false · next **UC-BP-CORE-09b** SA |
| 16 | CORE | ADD | `UC-BP-CORE-09b` | Chọn gói nghề và xem trước HĐLĐ — ADD | **WAVE-14** SEALED GWC · honesty false · C-SLICE · QA `CORE09BQA-MSLAWKV6` · QC `CORE09BQC1-MSLB05DZ` · **≠** module CORE/CTR UAT · printable false · next **UC-BP-CORE-09c** SA |
| 17 | CORE | ADD | `UC-BP-CORE-09c` | Lưu phiên bản và in / PDF hợp đồng — ADD | **WAVE-15** SEALED GWC · honesty false · C-SLICE · QA `CORE09CQA-MSLBR3YX` · QC `CORE09CQC1-MSLBXMUT` · printable false · **≠** module CORE/CTR UAT · **≠** CORE-09b=printable · **≠** 09d TPL invent DONE · next **UC-BP-CORE-09d** SA |
| 18 | CORE | ADD | `UC-BP-CORE-09d` | Chọn mẫu HĐ theo catalog mở (ví dụ khởi tạo loại × khối · không trần 8… | **WAVE-16** SEALED GWC · honesty false · C-SLICE · QA `CORE09DQA2-MSLDM40Y` · QC `CORE09DQC1-MSLDR8I3` · printable false · **≠** closed-8 DONE · **≠** module CORE/CTR UAT · next **UC-BP-CORE-02b** SA |
| 19 | CORE | EXPAND | `UC-BP-CORE-02b` | Cấu hình nhóm field hồ sơ (metadata) | **WAVE-17** SEALED GWC · honesty false · C-SLICE · QA `CORE02BQA-MSLEDIAQ` · QC `CORE02BQC1-MSLEFQC1` · RETAIN EMP-CF · **≠** personnel UAT · next **UC-BP-CORE-03** SA |
| 20 | CORE | EXPAND | `UC-BP-CORE-03` | Checklist giấy tờ động (bắt buộc / tùy chọn) | **WAVE-18** SEALED GWC · honesty false · C-SLICE · QA `CORE03QA-MSLFGIQ4` · QC `CORE03QC1-MSLFJH0K` · RETAIN DOC/ET/CHK physical · **≠** personnel UAT · **≠** CORE-07/printable DONE · **≠** EMP DOC L1=CORE-03 · next **UC-BP-CORE-05** SA |
| 21 | CORE | EXPAND | `UC-BP-CORE-05` | Cấp phát tài sản & biên bản bàn giao | **WAVE-19 SEALED GWC** · honesty false · C-SLICE · QA `CORE05QA2-MSLGSWSF` · QC `CORE05QC1-MSLGVT40` · RETAIN assets+BB+serial409 · **≠** CORE-05 DONE / personnel UAT · next CORE-06 |
| 22 | CORE | EXPAND | `UC-BP-CORE-06` | Thu hồi tài sản khi kích hoạt nghỉ việc | **WAVE-20 SEALED GWC** · honesty false · C-SLICE · QA `CORE06QA2-MSLI95K8` · QC `CORE06QC1-MSLID363` · soft≠DONE RETAIN · **≠** CORE-06/personnel DONE · next CORE-07 |
| 23 | CORE | EXPAND | `UC-BP-CORE-07` | Kích hoạt hồ sơ Hoạt động khi checklist đủ | **WAVE-21 SEALED GWC** · honesty false · C-SLICE · QA `CORE07QA1-MSLJSPGO` · QC `CORE07QC1-KZJTSHNT` · checklist≠DONE · **≠** CORE-07/personnel DONE · next CORE-09 |
| 24 | CORE | EXPAND | `UC-BP-CORE-09` | Hợp đồng LĐ — mẫu Word keyword fill | **WAVE-22 SEALED GWC** · honesty false · C-SLICE · QA `CORE09QA1-MSLNTR5P` · QC `CORE09QC1-MSLNBA89` · printable false · **≠** registry/09a–d/VER=CORE-09 DONE · **≠** module CORE/CTR UAT · must_keep CORE-07 · next **UC-BP-CORE-10** SA |
| 25 | CORE | EXPAND | `UC-BP-CORE-10` | BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn) | **WAVE-23 SEALED GWC** · honesty false · C-SLICE · QA `CORE10QA1-MSLOTSWO` · QC `CORE10QC1-MSLP0EJB` · catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · printable false · must_keep CORE-09/07 · next **UC-BP-PLT-01** SA |
| 26 | PLT | ADD | `UC-BP-PLT-01` | Nền tảng cấu hình động (danh mục · schema · trường trộn) — ADD | **WAVE-24 SEALED GWC** · honesty false · C-SLICE · QA `PLT01QA1-MSLPQZF6` · QC `PLT01QC1-MSLPUQIU` · ≠ PLT/platform UAT · must_keep CORE-10/09/07 · next **UC-BP-ATT-02** SA |
| 27 | ATT | Ưu tiên | `UC-BP-ATT-02` | Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ) | **WAVE-25 SEALED GWC** · honesty false · C-SLICE · QA `ATT02QA1-MSLQWDN3` · QC `ATT02QC1-MSLQZUK7` · ≠ ATT UAT · CFG≠DONE · must_keep PLT/CORE · next **UC-BP-ATT-08** SA |
| 28 | ATT | Ưu tiên | `UC-BP-ATT-08` | Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ) | **WAVE-26 SEALED GWC** · honesty false · C-SLICE · QA `ATT08QA1-MSLSGUJF` · QC `ATT08QC1-MSLSL36C` · ≠ ATT UAT · client-days≠DONE · must_keep ATT-02/PLT/CORE · next **UC-BP-ATT-09** SA |
| 29 | ATT | Ưu tiên | `UC-BP-ATT-09` | Nộp & duyệt phép — hold quỹ khi submit | **WAVE-27 SEALED GWC** · QC `ATT09QC1-MSLUTL9D` · QA `ATT09QA2-MSLUKI9U` · residual TYPEBLOCK **CLOSED** `ATT09QA3-MSLV65OX` · honesty false · C-SLICE · Nest `/core` 0 · PUT tracked-entitlement · DENY `att_leave_hold` · must_keep ATT08/02/PLT/CORE · ≠ ATT-09/ATT UAT · PAY OUT · next **UC-BP-ATT-10** |
| 30 | ATT | Ưu tiên | `UC-BP-ATT-10` | Tổng hợp bảng công (phễu giờ công tính lương) | **WAVE-28 SEALED GWC** · QC `ATT10QC1-MSLWGUYH` · QA `ATT10QA1-MSLWCDX2` · residual `R-ATT-10-DISP` P2 HOLD · honesty false · C-SLICE · Nest `/core` 0 · ≠ AGG=ATT-10 DONE · ≠ ATT-10/ATT UAT · PAY OUT · HOL/MEAL OUT · must_keep ATT-09/08/02/PLT/CORE · next **UC-BP-ATT-11** SA |
| 31 | ATT | Ưu tiên | `UC-BP-ATT-11` | Ký chốt bảng công trước khi tính lương (workflow XBOS) | **WAVE-29 SEALED GWC** · QC `ATT11QC1-MSLXTH9P` · QA `ATT11QA2-MSLXOKS3` · residual WF/CSUM/EMIT/DISP HOLD · honesty false · C-SLICE · Nest `/core` 0 · ≠ LIVE=ATT-11 DONE · ≠ ATT UAT · PAY OUT · must_keep ATT-10/09/08/02/PLT/CORE · next **UC-BP-ATT-01** SA |
| 32 | ATT | EXPAND | `UC-BP-ATT-01` | Thiết lập quy tắc ca theo bộ phận / nhóm | **WAVE-30 SEALED GWC** · QC `ATT01QC1-MSLZ3KIM` · QA `ATT01QA1-MSLYZKGN` · residual R-ATT-01-ASSIGN open · honesty false · C-SLICE · Nest `/core` 0 · ≠ catalog=ATT-01 DONE · ≠ ATT UAT · PAY OUT · must_keep ATT-11/10/09/08/02/PLT/CORE · next **UC-BP-ATT-03b** SA |
| 33 | ATT | EXPAND | `UC-BP-ATT-03b` | Lịch lễ / Tết (dương + âm cấu hình năm) | **WAVE-31 SEALED GWC** · QC `ATT03BQC1-MSM0891H` · QA `ATT03BQA1-MSM0524Y` · honesty false · C-SLICE · Nest `/core` 0 · ≠ residual/thin=ATT-03b DONE · ≠ ATT UAT · PAY OUT · must_keep ATT-01/11/10/09/08/02/PLT/CORE · R-ATT-01-ASSIGN open · next **UC-BP-ATT-03d** SA |
| 34 | ATT | EXPAND | `UC-BP-ATT-03d` | Danh mục điểm GPS chấm công (vùng hợp lệ) — ADD MVP | **WAVE-32 SEALED GWC** · QC `ATT03DQC1-MSM1CR19` · residual seal `ATT03DQC2-MSM21RSC1` · **`R-ATT-03D-CNS-STATUS-CODE` CLOSED** · QA `ATT03DQA1-MSM1826M` / `ATT03DQA2-MSM21VKS` · honesty false · C-SLICE · Nest `/core` 0 · ≠ ATT-03d/ATT UAT · ≠ PLT WS alone=DONE · PAY OUT · printable false · must_keep ATT-03b/01/11/10/09/08/02/PLT/CORE · R-ATT-01-ASSIGN open · next **UC-BP-ATT-04** SA |
| 35 | ATT | EXPAND | `UC-BP-ATT-04` | Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …) | **WAVE-33 SEALED GWC** · QC `ATT04QC1-MSM22G4W` · QA `ATT04QA1-MSM21P8W` · R-ATT-04-FY · R-ATT-04-ENGINE HOLD · honesty false · C-SLICE · Nest `/core` 0 · ≠ ATT-04/ATT UAT · PAY OUT · printable false · must_keep ATT-03d/03b/01/11/10/09/08/02/PLT/CORE · R-ATT-01-ASSIGN open · next **UC-BP-ATT-04b** SA |
| 36 | ATT | EXPAND | `UC-BP-ATT-04b` | Ứng phép & thời điểm cấp / không lương bù trừ | **WAVE-33 SEALED GWC** · QC `ATT04BQC1-MSM3S8QC1` · QA `ATT04BQA1-MSM3S8FG` · R-ATT-04B-OVER-BAL · R-ATT-04B-CAP-CRUD · R-MAIN-EFFECTIVE-EMPTY HOLD · honesty false · C-SLICE · must_keep ATT04QC1 + ATT09 + ATT03D + peer chain · Nest `/core` 0 · ≠ ATT-04b/FR-04b/ATT UAT · PAY OUT · printable false · R-ATT-04-FY · R-ATT-04-ENGINE · R-ATT-01-ASSIGN open · next **UC-BP-ATT-05** SA |
| 37 | ATT | EXPAND | `UC-BP-ATT-05` | Phép chuyển kỳ (bảo lưu theo FY tenant) | **WAVE-33 SEALED GWC** · QC `ATT05QC1-MSM52GWC1` · QA `ATT05QA1-MSM52CT7` · R-ATT-05-FY · R-ATT-05-ENGINE · R-ATT-05-DEDUCT · R-ATT-05-FY-CAL HOLD · honesty false · C-SLICE · Nest `/core` DENY · ≠ ATT-05/FR-05/ATT UAT · DENY merge carry→annual · PAY OUT · printable false · must_keep ATT04BQC1+ATT04QC1+ATT09+ATT03D+peer · next **UC-BP-ATT-05b** SA |
| 38 | ATT | EXPAND | `UC-BP-ATT-05b` | Panel quỹ phép khi nộp đơn — ADD MVP | **WAVE-33 SEALED GWC** · QC `ATT05BQC1-MSM5SDQC1` · QA `ATT05BQA1-MSM5SD3P` · honesty false · C-SLICE · Nest `/core` 0 · ≠ ATT-05b/FR-05b/ATT-05/ATT UAT · PAY OUT · printable false · must_keep ATT05QC1+ATT04BQC1+ATT04QC1+ATT09+ATT03D · R-ATT-05-* peer footers · next **UC-BP-ATT-06** SA |
| 39 | ATT | EXPAND | `UC-BP-ATT-06` | Phép bù OT khi công ty bật chế độ | **WAVE-34 SEALED GWC** · QC `ATT06QC1-MSM84GWC1` · QA `ATT06QA1-MSM84RYS` · BE-03 · R-ATT-06-AGG peer HOLD · honesty false · C-SLICE · ≠ ATT-06/ATT UAT · must_keep ATT05BQC1+ATT05QC1+ATT09 · next **UC-BP-ATT-07** SA |
| 40 | ATT | EXPAND | `UC-BP-ATT-07` | Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có) | **WAVE-35 SEALED GWC** · QC `ATT07QC1-MSM9GWC1` · QA `ATT07QA1-MSM9IFO1` · BE-01 · FE-01 · R-ATT-07-AGG · R-ATT-07-SHEET-CODE peer HOLD · honesty false · C-SLICE · ≠ ATT-07/ATT UAT · must_keep ATT06QC1+ATT05BQC1+ATT09 · next **UC-BP-ATT-12** SA |
| 41 | ATT | EXPAND | `UC-BP-ATT-12` | Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động | **WAVE-36 SEALED GWC** · honesty false · C-SLICE · QA `ATT12QA1-MSMAIARP` · QC `ATT12QC1-MSMAIGWC1` · **≠** module ATT UAT · must_keep ATT07QC1+ATT06QC1+ATT05BQC1+ATT09+CORE07 · next **UC-BP-PAY-01** SA |
| 42 | PAY | Ưu tiên | `UC-BP-PAY-01` | Ranh giới: lương chỉ đọc bảng công đã chốt | **WAVE-37 SEALED GWC** · QC `PAY01QC1-MSMBGWC1` · FE QA `PAY01FEQA1-MSMBWFOY` · QC-FE `PAY01QCFE1-MSMBXFQC1` · BIND-FE CLOSED · C-SLICE · ≠ PAY UAT |
| 43 | PAY | Ưu tiên | `UC-BP-PAY-02` | Lắp ráp và chạy động cơ công thức lương | **WAVE-38 SEALED GWC** · PAY02QC1 · PAY02QCBR1 · PAY02QCBR1-REF · QA `PAY02QA1-MSMC9D0I` + FEB `PAY02FEBQA1-MSMCDUNG` · J-01..04 browser CLOSED · ≠ PAY UAT · C-SLICE |
| 44 | PAY | Ưu tiên | `UC-BP-PAY-04` | Gộp lương khi đổi điều kiện giữa kỳ (không GTCG kép) | **WAVE-39 SEALED GWC** · PAY04QC1 · PAY04QC2 · QA2 `PAY04QA2-MSMCZ6AO` · **J-04-06 L2.5 CLOSED** · J-01..04/07 HOLD · `payroll_e2e_ready=false` · ≠ PAY-04/PAY UAT |
| 45 | PAY | EXPAND | `UC-BP-PAY-03` | Giảm trừ gia cảnh từ hồ sơ (đủ quyền) | **WAVE-40 SEALED GWC** · QC `PAY03QC1-MSMDDGWC1` · QA `PAY03QA1-MSMDDHP3` · J-03-01/02 HOLD · FE-01 HOLD · `payroll_e2e_ready=false` · ≠ PAY-03/PAY UAT |
| 46 | PAY | EXPAND | `UC-BP-PAY-05` | Trần bảo hiểm trên tổng hợp kỳ (kể cả split) | **WAVE-41 SEALED GWC** · QC `PAY05QC1-MSMDU2GWC1` · QA `PAY05QA1-MSMDU2I5` · J-05-02 HOLD · FE-01 HOLD · `payroll_e2e_ready=false` · ≠ PAY-05/PAY UAT |
| 47 | PAY | EXPAND | `UC-BP-PAY-06` | Tính lương kỳ khi đã Hoạt động + bảng công chốt | **WAVE-42 SEALED GWC** · QC `PAY06QC1-MSMECGWC1` · QA `PAY06QA1-MSMECGBI` · J-06-03/04 HOLD · FE-01 HOLD · `payroll_e2e_ready=false` · ≠ PAY-06/PAY UAT |
| 48 | PAY | EXPAND | `UC-BP-PAY-07` | Lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối | **WAVE-43 SEALED GWC** · QC `PAY07QC1-MSMEY7GWC1` · QA `PAY07QA1-MSMEY7K3` · J-07-03/04/07 HOLD · FE-01 HOLD · `payroll_e2e_ready=false` · ≠ PAY UAT |
| 49 | PAY | EXPAND | `UC-BP-PAY-08` | Phiếu lương — preview, bảo mật, trạng thái TT | **WAVE-44 SEALED GWC** · QC `PAY08QC1-MSMFFXGWC1` · QA `PAY08QA1-MSMFFXAZ` · J-08-02/03/04/07 HOLD · FE-01 HOLD · `payroll_e2e_ready=false` · ≠ PAY UAT |
| 50 | PAY | EXPAND | `UC-BP-PAY-09` | Phân nhóm bảng lương (VP / KD / tài xế / vận hành) | **SEALED GWC** `PAY09QC1-MSMGBGWC1` · FE QA `PAY09FEQA1-MSMLA825` · QC-FE `PAY09QCFE1-MSMLA8QC1` · CST QA `PAY09CSTQA1-MSMLOEWZ` · QC-CST `PAY09QCCST1-MSMLOEWQC1` · J-09-01/02 L2.5 CLOSED · J-09-03/04 HOLD · P2 `FE-PAY09-CATALOG-LIST-STALE` **CLOSED** · `payroll_e2e_ready=false` · ≠ PAY UAT |

## Wave đang chạy

| Wave | UC | Owner | work_item_id | ack |
|------|----|-------|--------------|-----|
| **W1** | `UC-BP-REC-01` + `UC-BP-REC-01b` | sa → … → QC-02 · CELLID-QC-01 | `PO-HRM-MVP-GD1-REC-01-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · **R-REC-HC-OVERRIDE-CELLID CLOSED** (`HCELLQA-MSKU39UX` / QC-01) |
| **W2** | `UC-BP-REC-02` + `UC-BP-REC-02b` | sa → … → QC | `PO-HRM-MVP-GD1-REC-02-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE |
| **W3** | `UC-BP-REC-08` | sa → … → QC | `PO-HRM-MVP-GD1-REC-08-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE |
| **W4** | `UC-BP-REC-06a` | sa → … → QC-02 | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · **R-REC-IV-PROJ-ID CLOSED** (`REC06AQA2-MSKZ58NH` / QC-02 `REC06AQC2-MSKZAM58`) |
| **W5** | `UC-BP-REC-00` | sa → … → QC-01 | `PO-HRM-MVP-GD1-REC-00-CLUSTER-*` | **SEALED GWC** · honesty false · `jd_dynamic_done=false` · C-SLICE · **R-REC-00-FE-COMMENT-ASTERISK CLOSED** (`REC00QA2-MSL0EZS5` / QC `REC00QC1-MSL0JMUT`) |
| **W6** | `UC-BP-REC-04` | sa → … → QC-01 | `PO-HRM-MVP-GD1-REC-04-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `REC04QA-MSL1HN1M` · QC `REC04QC1-MSL1LU4H` |
| **W7** | `UC-BP-REC-05` | sa → … → QC-01 | `PO-HRM-MVP-GD1-REC-05-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `REC05QA2-MSL31GG0` · QC `REC05QC1-MSL35D49` · P2 OBS catalog reject + CFG deny |
| **W8** | `UC-BP-REC-06` | sa → … → QC-01 | `PO-HRM-MVP-GD1-REC-06-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `REC06QA-MSL48P4M` · QC `REC06QC1-MSL4CU2G` · **≠** module REC UAT |
| **W9** | `UC-BP-REC-07` | sa → … → QC-01 | `PO-HRM-MVP-GD1-REC-07-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `REC07QA2-MSL5SJDU` · QC `REC07QC1-MSL5WXU5` · **≠** module REC UAT · next **UC-BP-CORE-01** SA |
| **W10** | `UC-BP-CORE-01` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE01QA-MSL6U0AV` · QC `CORE01QC1-MSL6WMS7` · **≠** module CORE UAT · next **UC-BP-CORE-02** SA |
| **W11** | `UC-BP-CORE-02` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE02QA-MSL7X7SJ` · QC `CORE02QC1-MSL80DU6` · **≠** module CORE UAT |
| **W12** | `UC-BP-CORE-08` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE08QA-MSL980WO` · QC `CORE08QC1-MSL9BFFE` · **≠** module CORE UAT |
| **W13** | `UC-BP-CORE-09a` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-09A-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE09AQA-MSLA1C9L` · QC `CORE09AQC1-MSLA4LX9` · printable false · **≠** module CORE/CTR UAT · next **UC-BP-CORE-09b** SA |
| **W14** | `UC-BP-CORE-09b` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-09B-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE09BQA-MSLAWKV6` · QC `CORE09BQC1-MSLB05DZ` · printable false · **≠** module CORE/CTR UAT · next **UC-BP-CORE-09c** SA |
| **W15** | `UC-BP-CORE-09c` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-09C-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE09CQA-MSLBR3YX` · QC `CORE09CQC1-MSLBXMUT` · printable false · **≠** module CORE/CTR UAT · **≠** CORE-09b=printable · next **UC-BP-CORE-09d** SA |
| **W16** | `UC-BP-CORE-09d` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-09D-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE09DQA2-MSLDM40Y` · QC `CORE09DQC1-MSLDR8I3` · printable false · **≠** closed-8 · next **UC-BP-CORE-02b** SA |
| **W17** | `UC-BP-CORE-02b` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE02BQA-MSLEDIAQ` · QC `CORE02BQC1-MSLEFQC1` · RETAIN EMP-CF · **≠** personnel UAT · next **UC-BP-CORE-03** SA |
| **W18** | `UC-BP-CORE-03` | sa → … → QC-01 | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-*` | **SEALED GWC** · honesty false · C-SLICE · QA `CORE03QA-MSLFGIQ4` · QC `CORE03QC1-MSLFJH0K` · RETAIN DOC/ET/CHK · **≠** CORE-07/personnel/printable DONE · next **UC-BP-CORE-05** SA |

## Quy tắc cuốn chiếu (U89 + U88)

1. Xong QC GWC một UC/cluster → **cùng phiên** mở SA/BA UC kế trong hàng (không hỏi «làm phase nào»).
2. Spec-before-code: SRS FR (đã khóa giấy) → Option/F.1 hẹp nếu gap → AC → TechSpec/DB/API delta → Dev.
3. Preserve + must_keep; C-SLICE ≠ module UAT.
4. LVRULE / quỹ phép = các UC ATT-04…09 trong hàng — làm khi tới trụ ATT, không cần option HOLD riêng.


| **W1 exec** | BE-01 + FE-01 | DISPATCHED 2026-08-09T02:16:22+07:00 |







