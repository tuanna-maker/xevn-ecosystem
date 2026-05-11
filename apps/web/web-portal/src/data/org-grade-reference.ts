/**
 * ORG GRADE — tham chiếu cấp bậc / chức danh (nguồn: khách hàng, sơ đồ 9 tầng).
 * Dùng làm Origin read-only trong Cài đặt → Hệ thống Phòng/Ban.
 */

export type OrgGradeBand = 'yellow' | 'orange' | 'green' | 'grey' | 'white';

export type OrgGradeLevelRow = {
  level: number;
  /** Gợi ý màu dải trên sơ đồ gốc */
  band: OrgGradeBand;
  /** Chức danh / vị trí tại cấp đó */
  titles: string[];
};

/**
 * Cấp 6 trên sơ đồ gốc để trống (separator) — vẫn giữ level để đồng bộ mã 1…9.
 */
export const ORG_GRADE_LEVELS: OrgGradeLevelRow[] = [
  {
    level: 1,
    band: 'white',
    titles: ['CHỦ TỊCH', 'PHÓ CHỦ TỊCH'],
  },
  {
    level: 2,
    band: 'yellow',
    titles: ['TỔNG GIÁM ĐỐC', 'PHÓ TỔNG GIÁM ĐỐC'],
  },
  {
    level: 3,
    band: 'white',
    titles: ['COO', 'CFO', 'CHRO', 'CCO'],
  },
  {
    level: 4,
    band: 'orange',
    titles: ['Giám đốc đơn vị', 'Phó giám đốc'],
  },
  {
    level: 5,
    band: 'white',
    titles: [
      'Trợ lý / Thư ký',
      'Trưởng phòng Vận tải hành khách',
      'Trưởng phòng vận tải Hàng hóa',
      'Phó phòng vận tải',
      'Trưởng phòng Kế toán',
      'Phó phòng Kế toán',
      'Trưởng phòng HCNS',
      'Trưởng phòng Marketing',
      'Trưởng phòng Kinh doanh',
      'Phó phòng Kinh doanh',
      'Trưởng phòng Kiểm soát nội bộ',
      'Trưởng phòng Giám sát & An toàn',
      'Quản đốc',
    ],
  },
  {
    level: 6,
    band: 'grey',
    titles: [],
  },
  {
    level: 7,
    band: 'green',
    titles: [
      'Trucking coordinator / Điều phối xe',
      'Chuyên viên BSC',
      'Chuyên viên kỹ thuật',
    ],
  },
  {
    level: 8,
    band: 'white',
    titles: [
      'Nhân viên quản lý chi phí (Cost controller)',
      'Kế toán giá thành',
      'Kế toán chứng từ',
      'Kế toán tổng hợp',
      'Kế toán công nợ',
      'Kế toán chi phí',
      'Nhân viên Kế toán xưởng',
      'Nhân viên lái xe',
      'Nhân viên chứng từ',
      'Nhân viên hành chính',
      'Nhân viên C&B',
      'Nhân viên đào tạo',
      'Nhân viên pháp chế',
      'Nhân viên tuyển dụng',
      'Nhân viên kho',
      'Nhân viên content',
      'Nhân viên chạy Ad',
      'Nhân viên Media',
      'Nhân viên kinh doanh',
      'Nhân viên sales admin',
      'Nhân viên chăm sóc khách hàng (CS)',
      'Nhân viên an toàn phương tiện',
      'Nhân viên giám sát phương tiện',
    ],
  },
  {
    level: 9,
    band: 'green',
    titles: ['Supporter / Thực tập', 'Bảo vệ', 'Tạp vụ'],
  },
];

export const ORG_GRADE_LEVEL_NUMBERS = ORG_GRADE_LEVELS.map((r) => r.level);
