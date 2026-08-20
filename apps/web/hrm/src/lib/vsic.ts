/**
 * VSIC Level 1 (Hệ thống ngành kinh tế Việt Nam)
 * UC-HRM-CO-01 / FR-HRM-CO-IND-01
 */
export const VSIC_LEVEL_1_INDUSTRIES = [
  { key: 'vsic_a', label: 'Nông nghiệp, lâm nghiệp và thuỷ sản' },
  { key: 'vsic_b', label: 'Khai khoáng' },
  { key: 'vsic_c', label: 'Công nghiệp chế biến, chế tạo' },
  { key: 'vsic_d', label: 'Sản xuất và phân phối điện, khí đốt, nước nóng, hơi nước và điều hoà không khí' },
  { key: 'vsic_e', label: 'Cung cấp nước; hoạt động quản lý và xử lý rác thải, nước thải' },
  { key: 'vsic_f', label: 'Xây dựng' },
  { key: 'vsic_g', label: 'Bán buôn và bán lẻ; sửa chữa ô tô, mô tô, xe máy và xe có động cơ khác' },
  { key: 'vsic_h', label: 'Vận tải kho bãi' },
  { key: 'vsic_i', label: 'Dịch vụ lưu trú và ăn uống' },
  { key: 'vsic_j', label: 'Thông tin và truyền thông' },
  { key: 'vsic_k', label: 'Hoạt động tài chính, ngân hàng và bảo hiểm' },
  { key: 'vsic_l', label: 'Hoạt động kinh doanh bất động sản' },
  { key: 'vsic_m', label: 'Hoạt động chuyên môn, khoa học và công nghệ' },
  { key: 'vsic_n', label: 'Hoạt động hành chính và dịch vụ hỗ trợ' },
  { key: 'vsic_o', label: 'Hoạt động của Đảng Cộng sản, tổ chức chính trị - xã hội, quản lý nhà nước, an ninh quốc phòng, bảo đảm xã hội bắt buộc' },
  { key: 'vsic_p', label: 'Giáo dục và đào tạo' },
  { key: 'vsic_q', label: 'Y tế và hoạt động trợ giúp xã hội' },
  { key: 'vsic_r', label: 'Nghệ thuật, vui chơi và giải trí' },
  { key: 'vsic_s', label: 'Hoạt động dịch vụ khác' },
  { key: 'vsic_t', label: 'Hoạt động làm thuê các công việc trong các hộ gia đình, sản xuất sản phẩm vật chất và dịch vụ tự tiêu dùng của hộ gia đình' },
  { key: 'vsic_u', label: 'Hoạt động của các tổ chức và cơ quan quốc tế' },
] as const;

export type VsicIndustryKey = typeof VSIC_LEVEL_1_INDUSTRIES[number]['key'];
