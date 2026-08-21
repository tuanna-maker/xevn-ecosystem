export const MASTER_REC_SOURCES = [
  { code: 'INTERNAL_REF', name_vi: 'Giới thiệu nội bộ', channel_type: 'Internal', ghi_chu: 'Nhân viên giới thiệu — có thưởng' },
  { code: 'FACEBOOK', name_vi: 'Facebook / Mạng XH', channel_type: 'Social', ghi_chu: 'Fanpage + Group lái xe' },
  { code: 'VIECLAM24H', name_vi: 'ViecLam24h', channel_type: 'Job Board', ghi_chu: 'vietnamworks.vn, 24h.vn' },
  { code: 'TOPCV', name_vi: 'TopCV', channel_type: 'Job Board', ghi_chu: 'topcv.vn' },
  { code: 'CAREERBUILDER', name_vi: 'CareerBuilder / Job3', channel_type: 'Job Board', ghi_chu: '' },
  { code: 'ZALO', name_vi: 'Zalo / Nhóm ngành lái xe', channel_type: 'Social', ghi_chu: 'Nhóm Zalo lái xe toàn quốc' },
  { code: 'HEADHUNT', name_vi: 'Headhunter / Agency', channel_type: 'Agency', ghi_chu: 'Đối với vị trí quản lý' },
  { code: 'CAREER_FAIR', name_vi: 'Hội chợ việc làm', channel_type: 'Offline', ghi_chu: 'Trường GTVT, CĐ nghề...' },
  { code: 'COMPANY_WEBSITE', name_vi: 'Website công ty', channel_type: 'Own', ghi_chu: 'xe.vn / tuyendung.xe.vn' },
  { code: 'WALK_IN', name_vi: 'Đến trực tiếp', channel_type: 'Offline', ghi_chu: 'Lái xe đến nộp hồ sơ bến xe' },
  { code: 'OTHER', name_vi: 'Khác', channel_type: 'Other', ghi_chu: '' },
] as const;

export const MASTER_REC_STAGES = [
  { code: 'SOURCING', name_vi: 'Tìm kiếm / Thu thập hồ sơ', order: 1, is_terminal: false, ghi_chu: 'Đầu phễu' },
  { code: 'SCREENING', name_vi: 'Lọc hồ sơ', order: 2, is_terminal: false, ghi_chu: 'HR review CV' },
  { code: 'PHONE_SCREEN', name_vi: 'Phỏng vấn sơ bộ (ĐT)', order: 3, is_terminal: false, ghi_chu: 'HR gọi điện 10-15 phút' },
  { code: 'INTERVIEW_1', name_vi: 'Phỏng vấn vòng 1', order: 4, is_terminal: false, ghi_chu: 'Quản lý trực tiếp' },
  { code: 'SKILL_TEST', name_vi: 'Kiểm tra tay nghề / lái thử', order: 5, is_terminal: false, ghi_chu: 'Đặc thù cho lái xe' },
  { code: 'INTERVIEW_2', name_vi: 'Phỏng vấn vòng 2 (BGĐ)', order: 6, is_terminal: false, ghi_chu: 'Bắt buộc vị trí quản lý' },
  { code: 'OFFER', name_vi: 'Đề xuất offer', order: 7, is_terminal: false, ghi_chu: 'Gửi thư đề xuất lương' },
  { code: 'OFFER_ACCEPTED', name_vi: 'Ứng viên chấp nhận offer', order: 8, is_terminal: false, ghi_chu: '' },
  { code: 'HIRED', name_vi: 'Đã tuyển — chờ onboard', order: 9, is_terminal: true, ghi_chu: 'Trạng thái kết thúc PASSED' },
  { code: 'REJECTED', name_vi: 'Từ chối / Không phù hợp', order: 10, is_terminal: true, ghi_chu: 'Trạng thái kết thúc FAILED' },
  { code: 'WITHDRAWN', name_vi: 'Ứng viên rút hồ sơ', order: 11, is_terminal: true, ghi_chu: 'UV tự rút' },
] as const;

export const MASTER_REC_INTERVIEW_TYPES = [
  { code: 'PHONE', name_vi: 'Phỏng vấn qua điện thoại', ghi_chu: 'HR sơ loại nhanh 10-15 phút' },
  { code: 'VIDEO_CALL', name_vi: 'Phỏng vấn online (Video)', ghi_chu: 'Zalo Video / Meet — ứng viên tỉnh xa' },
  { code: 'IN_PERSON_HR', name_vi: 'Gặp mặt trực tiếp (HR)', ghi_chu: 'HR + quản lý trực tiếp' },
  { code: 'IN_PERSON_BOD', name_vi: 'Gặp mặt BGĐ', ghi_chu: 'Vị trí quản lý cấp cao' },
  { code: 'SKILL_DRIVING', name_vi: 'Kiểm tra lái xe thực tế', ghi_chu: 'Lái thử trên đường/bãi' },
  { code: 'WRITTEN_TEST', name_vi: 'Kiểm tra viết / IQ', ghi_chu: 'Vị trí điều phối/kế toán' },
  { code: 'GROUP', name_vi: 'Phỏng vấn nhóm', ghi_chu: 'Tuyển hàng loạt lái xe' },
] as const;

export const MASTER_REC_REJECT_REASONS = [
  { code: 'SALARY_MISMATCH', name_vi: 'Không đồng ý mức lương', ghi_chu: 'Yêu cầu quá cao so với ngân sách' },
  { code: 'SKILL_NOT_FIT', name_vi: 'Không đáp ứng kỹ năng / bằng cấp', ghi_chu: 'Thiếu bằng lái, kinh nghiệm...' },
  { code: 'LOCATION_ISSUE', name_vi: 'Không phù hợp địa điểm làm việc', ghi_chu: 'Ứng viên ở quá xa tuyến' },
  { code: 'DISCIPLINE_HISTORY', name_vi: 'Lịch sử vi phạm / kỷ luật', ghi_chu: 'Tai nạn, TNGT nhiều lần' },
  { code: 'HEALTH_NOT_FIT', name_vi: 'Không đủ sức khỏe', ghi_chu: 'Khám sức khỏe không đạt' },
  { code: 'BACKGROUND_FAIL', name_vi: 'Không qua kiểm tra lý lịch', ghi_chu: '' },
  { code: 'NO_SHOW', name_vi: 'Không đến phỏng vấn', ghi_chu: 'Lịch hẹn nhưng vắng mặt' },
  { code: 'WITHDREW', name_vi: 'Ứng viên tự rút', ghi_chu: 'Nhận offer công ty khác' },
  { code: 'POSITION_FILLED', name_vi: 'Vị trí đã đủ người', ghi_chu: 'Tuyển đủ số lượng' },
  { code: 'OTHER', name_vi: 'Lý do khác', ghi_chu: 'Ghi rõ trong ghi chú' },
] as const;

export const MASTER_REC_HEALTH_REQS = [
  { code: 'VISION_OK', name_vi: 'Thị lực đạt chuẩn', apply_to: 'Tất cả lái xe', min_standard: '≥ 5/10 không kính; 8/10 có kính' },
  { code: 'NO_COLORBLIND', name_vi: 'Không mù màu', apply_to: 'Tất cả lái xe', min_standard: 'Test màu Ishihara' },
  { code: 'BLOOD_PRESSURE', name_vi: 'Huyết áp bình thường', apply_to: 'Tất cả', min_standard: '90/60 – 140/90 mmHg' },
  { code: 'NO_EPILEPSY', name_vi: 'Không bệnh động kinh', apply_to: 'Tất cả lái xe', min_standard: '' },
  { code: 'NO_DRUG', name_vi: 'Không sử dụng ma tuý', apply_to: 'Tất cả lái xe', min_standard: 'Xét nghiệm nước tiểu' },
  { code: 'HEARING_OK', name_vi: 'Thính lực đạt chuẩn', apply_to: 'Lái xe buýt/tuyến', min_standard: 'Nghe rõ tiếng nói bình thường' },
  { code: 'BMI_RANGE', name_vi: 'Chỉ số BMI hợp lý', apply_to: 'Lái xe tải nặng', min_standard: '18.5 – 30' },
  { code: 'PERIODIC_6M', name_vi: 'Khám định kỳ 6 tháng/lần', apply_to: 'Lái xe hành khách', min_standard: 'Theo QCVN 01:2021' },
] as const;
