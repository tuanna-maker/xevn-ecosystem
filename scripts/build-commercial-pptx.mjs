#!/usr/bin/env node
/**
 * Tạo deck thương mại PPTX theo dàn ý BRD Tổng hợp — XeVN OS
 * Output: docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pptxgen from 'pptxgenjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/client-delivery/03_Thuong_mai_XeVN_OS.pptx');
const ASSETS = path.join(ROOT, 'docs/ecosystem/assets');
const LOGO = path.join(ROOT, 'docs/client-delivery/assets/logo-unicom.png');

const BLUE = '3D7DE8';
const CYAN = '0AB4D8';
const DARK = '0E1B2E';
const TEXT = '1A2740';
const SUB = '5A7090';
const LIGHT = 'EEF4FF';

function imgIfExists(p) {
  return fs.existsSync(p) ? p : null;
}

function addHeader(slide, title, pres) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.12,
    fill: { color: BLUE },
    line: { color: BLUE },
  });
  slide.addText(title, {
    x: 0.5,
    y: 0.35,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: DARK,
    fontFace: 'Arial',
  });
}

function addFooter(slide, num, pres) {
  slide.addText(`XeVN OS · Thương mại · ${num}`, {
    x: 0.5,
    y: 5.15,
    w: 9,
    h: 0.3,
    fontSize: 9,
    color: SUB,
  });
}

function bulletSlide(pres, title, bullets, note) {
  const slide = pres.addSlide();
  addHeader(slide, title, pres);
  slide.addText(
    bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
    { x: 0.6, y: 1.15, w: 8.8, h: 3.8, fontSize: 16, color: TEXT, valign: 'top' },
  );
  if (note) {
    slide.addText(note, {
      x: 0.6,
      y: 4.85,
      w: 8.8,
      h: 0.35,
      fontSize: 11,
      italic: true,
      color: SUB,
    });
  }
  addFooter(slide, pres.slides.length, pres);
  return slide;
}

function twoColSlide(pres, title, leftTitle, leftRows, rightTitle, rightRows) {
  const slide = pres.addSlide();
  addHeader(slide, title, pres);
  const mkTable = (hdr, rows) => [
    [
      { text: hdr, options: { bold: true, fill: { color: BLUE }, color: 'FFFFFF' } },
      { text: '', options: { fill: { color: BLUE } } },
    ],
    ...rows.map((r) => r.map((c) => ({ text: String(c), options: { color: TEXT } }))),
  ];
  slide.addTable(mkTable(leftTitle, leftRows), {
    x: 0.5,
    y: 1.2,
    w: 4.35,
    fontSize: 11,
    border: { pt: 0.5, color: 'CBD5E0' },
    colW: [1.4, 2.95],
  });
  slide.addTable(mkTable(rightTitle, rightRows), {
    x: 5.15,
    y: 1.2,
    w: 4.35,
    fontSize: 11,
    border: { pt: 0.5, color: 'CBD5E0' },
    colW: [1.4, 2.95],
  });
  addFooter(slide, pres.slides.length, pres);
}

function sectionSlide(pres, partTitle, subtitle) {
  const slide = pres.addSlide();
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
    fill: { color: DARK },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.12,
    fill: { color: CYAN },
  });
  slide.addText(partTitle, {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 0.7,
    fontSize: 36,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  slide.addText(subtitle, {
    x: 0.8,
    y: 2.85,
    w: 8.4,
    h: 0.8,
    fontSize: 18,
    color: CYAN,
    align: 'center',
  });
}

function valuePillarsSlide(pres, title, pillars) {
  const slide = pres.addSlide();
  addHeader(slide, title, pres);
  let x = 0.45;
  const w = 2.2;
  for (const [head, body] of pillars) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x,
      y: 1.15,
      w,
      h: 3.75,
      fill: { color: LIGHT },
      line: { color: BLUE, pt: 1 },
    });
    slide.addText(head, {
      x,
      y: 1.35,
      w,
      h: 0.55,
      fontSize: 14,
      bold: true,
      color: BLUE,
      align: 'center',
    });
    slide.addText(body, {
      x: x + 0.1,
      y: 2.0,
      w: w - 0.2,
      h: 2.7,
      fontSize: 12,
      color: TEXT,
      valign: 'top',
    });
    x += 2.35;
  }
  addFooter(slide, pres.slides.length, pres);
}

function featureTableSlide(pres, title, rows, note) {
  const slide = pres.addSlide();
  addHeader(slide, title, pres);
  const tableRows = [
    [
      { text: 'Phân hệ', options: { bold: true, fill: { color: BLUE }, color: 'FFFFFF' } },
      { text: 'Quy mô', options: { bold: true, fill: { color: BLUE }, color: 'FFFFFF' } },
      { text: 'Tính năng nổi bật', options: { bold: true, fill: { color: BLUE }, color: 'FFFFFF' } },
    ],
    ...rows.map(([a, b, c]) => [
      { text: a, options: { bold: true, color: BLUE } },
      { text: b, options: { color: TEXT } },
      { text: c, options: { color: TEXT } },
    ]),
  ];
  slide.addTable(tableRows, {
    x: 0.45,
    y: 1.1,
    w: 9.1,
    fontSize: 11,
    colW: [1.35, 1.1, 6.65],
    border: { pt: 0.5, color: 'CBD5E0' },
  });
  if (note) {
    slide.addText(note, {
      x: 0.45,
      y: 4.9,
      w: 9.1,
      fontSize: 10,
      italic: true,
      color: SUB,
    });
  }
  addFooter(slide, pres.slides.length, pres);
}

function imageSlide(pres, title, imgPath, caption) {
  const slide = pres.addSlide();
  addHeader(slide, title, pres);
  if (imgPath) {
    slide.addImage({ path: imgPath, x: 0.55, y: 1.05, w: 8.9, h: 3.85 });
  } else {
    slide.addText('(Chèn hình từ BRD: docs/ecosystem/assets/)', {
      x: 1,
      y: 2.5,
      w: 8,
      fontSize: 14,
      color: SUB,
      align: 'center',
    });
  }
  if (caption) {
    slide.addText(caption, {
      x: 0.55,
      y: 4.95,
      w: 8.9,
      h: 0.4,
      fontSize: 11,
      color: SUB,
      align: 'center',
    });
  }
  addFooter(slide, pres.slides.length, pres);
}

async function main() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'UNICOM / XeVN';
  pres.title = 'XeVN OS — Giới thiệu thương mại';
  pres.subject = 'Hệ sinh thái phần mềm đa công ty — vận tải & logistics';

  // 1 — Bìa
  const cover = pres.addSlide();
  cover.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
    fill: { color: DARK },
  });
  cover.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: CYAN },
  });
  const logo = imgIfExists(LOGO);
  if (logo) cover.addImage({ path: logo, x: 3.2, y: 0.55, w: 3.6, h: 0.9 });
  cover.addText('XeVN OS', {
    x: 0.5,
    y: 1.85,
    w: 9,
    h: 0.9,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  cover.addText('Hệ sinh thái phần mềm đa công ty\nVận tải · Logistics · Nhân sự · Điều hành tập đoàn', {
    x: 0.8,
    y: 2.85,
    w: 8.4,
    h: 1,
    fontSize: 20,
    color: CYAN,
    align: 'center',
  });
  cover.addText('Tài liệu thương mại · Căn cứ BRD Tổng hợp · Tháng 5/2026', {
    x: 0.5,
    y: 4.6,
    w: 9,
    fontSize: 12,
    color: 'A8B8D0',
    align: 'center',
  });

  // 2 — Mục lục
  bulletSlide(pres, 'Nội dung trình bày', [
    'Bối cảnh & giải pháp XeVN OS',
    'Giá trị mang lại cho doanh nghiệp',
    'Ưu điểm & bản đồ tính năng (373 chức năng)',
    'Chi tiết tính năng: Cổng · XBOS · HRM · Logistic · Mobile',
    'Kiến trúc & quy tắc vận hành đa công ty',
    'Lộ trình triển khai & cam kết nghiệm thu',
  ]);

  // 3 — Thách thức
  bulletSlide(
    pres,
    'Bối cảnh — Tập đoàn vận tải đa công ty',
    [
      'Nhiều công ty con: dữ liệu và quy trình dễ phân mảnh, khó điều hành thống nhất',
      'Danh mục nhân sự, logistic, tổ chức cần một nguồn chuẩn tập đoàn — không nhân bản thủ công',
      'Phê duyệt đơn nghỉ, mở rộng danh mục, báo giá… cần một hộp thư & quy trình tập trung',
      'Nhân viên hiện trường cần ứng dụng di động gắn chấm công, đơn từ, chuyến xe',
    ],
    'Nguồn: BRD §1 Tóm tắt điều hành',
  );

  // 4 — Giải pháp
  const s4 = pres.addSlide();
  addHeader(s4, 'Giải pháp: XeVN Ecosystem OS', pres);
  s4.addText(
    'Một nền tảng phần mềm thống nhất: cổng điều hành + lõi XBOS + nghiệp vụ HRM & Logistic — triển khai theo giai đoạn, đo được bằng 373 tình huống sử dụng đã chuẩn hóa.',
    { x: 0.6, y: 1.1, w: 8.8, h: 0.9, fontSize: 15, color: TEXT },
  );
  const stats = [
    ['373', 'Tình huống sử dụng'],
    ['183', 'Danh mục cấu hình XBOS'],
    ['4', 'Phân hệ tích hợp'],
    ['2', 'Giai đoạn triển khai'],
  ];
  let x = 0.55;
  for (const [n, l] of stats) {
    s4.addShape(pres.shapes.RECTANGLE, {
      x,
      y: 2.35,
      w: 2.1,
      h: 1.35,
      fill: { color: LIGHT },
      line: { color: CYAN, pt: 1 },
    });
    s4.addText(n, {
      x,
      y: 2.55,
      w: 2.1,
      h: 0.55,
      fontSize: 32,
      bold: true,
      color: BLUE,
      align: 'center',
    });
    s4.addText(l, {
      x,
      y: 3.15,
      w: 2.1,
      h: 0.45,
      fontSize: 11,
      color: SUB,
      align: 'center',
    });
    x += 2.25;
  }
  addFooter(s4, pres.slides.length, pres);

  // 5 — Bốn phân hệ
  twoColSlide(
    pres,
    'Bốn thành phần hệ sinh thái',
    'Thành phần',
    [
      ['Cổng Web', 'Một điểm vào: bảng điều hành, trung tâm điều hành, nhúng nhân sự'],
      ['XBOS', 'Tổ chức, danh mục chuẩn, quy trình, RACI, dữ liệu gốc'],
      ['Nhân sự (HRM)', 'Hồ sơ NV, chấm công, lương, tuyển dụng, app NV'],
      ['Logistic', 'KD → điều phối → chuyến → app lái xe'],
    ],
    'Phân tách trách nhiệm',
    [
      ['Cổng Web', 'Điều hành — không thay nghiệp vụ chuyên sâu'],
      ['XBOS', 'Chuẩn & quy trình — không thay đơn/chuyến chi tiết'],
      ['HRM', 'Vòng đời nhân sự'],
      ['Logistic', 'Chuỗi kinh doanh → vận hành'],
    ],
  );

  // —— Giá trị · Ưu điểm · Tính năng ——
  sectionSlide(
    pres,
    'Giá trị & tính năng',
    'XeVN OS giải quyết gì và mang lại lợi ích gì cho doanh nghiệp',
  );

  valuePillarsSlide(pres, 'Giá trị mang lại cho doanh nghiệp', [
    [
      'Điều hành\nthống nhất',
      'Một cổng điều hành: nhìn tập đoàn và từng công ty con; KPI, hộp thư duyệt, thiết lập tổ chức tập trung.',
    ],
    [
      'Chuẩn hóa\n& tuân thủ',
      'Danh mục và quy trình do tập đoàn ban hành; mở rộng có phê duyệt; nhật ký rõ ràng — giảm lệch chuẩn giữa các đơn vị.',
    ],
    [
      'Hiệu quả\nvận hành',
      'HR, điều phối, lái xe làm việc trên cùng nền dữ liệu; giảm nhập liệu trùng, giảm tra cứu rời rạc.',
    ],
    [
      'Mở rộng\ncó kiểm soát',
      'Triển khai theo 2 giai đoạn; 373 tình huống sử dụng có mã — phạm vi hợp đồng và nghiệm thu minh bạch.',
    ],
  ]);

  twoColSlide(
    pres,
    'Ưu điểm so với mô hình rời rạc',
    'Trước đây (thường gặp)',
    [
      ['Dữ liệu', 'Mỗi công ty một bộ danh mục, khó so sánh'],
      ['Phê duyệt', 'Nhiều kênh: email, chat, file — khó truy vết'],
      ['Nhân sự', 'Excel / phần mềm lẻ, chậm đồng bộ'],
      ['Logistic', 'Hệ thống tách, không nối chuỗi KD→chuyến'],
      ['IT', 'Tích hợp tốn kém, không có lõi chung'],
    ],
    'Với XeVN OS',
    [
      ['Dữ liệu', 'XBOS — một nguồn chuẩn, phát hành theo công ty'],
      ['Phê duyệt', 'Một hộp thư & quy trình cấu hình được'],
      ['Nhân sự', 'HRM + app di động, đồng bộ danh mục tự động'],
      ['Logistic', 'Chuỗi giá trị thống nhất + app lái xe'],
      ['IT', 'Kiến trúc 4 tầng, API rõ, mở rộng theo giai đoạn'],
    ],
  );

  featureTableSlide(
    pres,
    'Bản đồ tính năng theo phân hệ (BRD)',
    [
      [
        'Cổng Web',
        'Trung tâm điều hành',
        'Bảng điều hành, thiết lập công ty/pháp nhân, RACI, hộp thư duyệt, nhúng HRM',
      ],
      ['XBOS', '104 chức năng nền', 'Danh mục chuẩn, phát hành, quy trình, tổ chức, chỉ số điều hành'],
      ['HRM', '119 chức năng', 'Hồ sơ NV, chấm công, đơn từ, lương, tuyển dụng, 15 tính năng mobile'],
      ['Logistic', '150 chức năng', 'KD, điều phối, vận đơn/chuyến, 28 tính năng app lái xe (GĐ2)'],
    ],
    'Tổng: 373 tình huống sử dụng · 183 danh mục cấu hình trên XBOS',
  );

  bulletSlide(pres, 'Tính năng — Cổng Web & Trung tâm điều hành', [
    'Một điểm đăng nhập cho lãnh đạo và quản trị — chọn đúng công ty được phân quyền',
    'Trung tâm điều hành: cây pháp nhân, phòng ban, cổ đông, tài liệu pháp lý',
    'Hộp thư duyệt tập trung: đơn nghỉ, mở rộng danh mục, báo giá…',
    'Nhúng module nhân sự toàn màn hình — trải nghiệm thống nhất',
    'Bảng điều hành & chỉ số: hỗ trợ ra quyết định tập đoàn',
  ]);

  bulletSlide(pres, 'Tính năng — XBOS (lõi nền tảng)', [
    'Quản trị danh mục đa phân hệ: 6 nhóm trường hồ sơ NV, loại xe, tuyến, khách hàng…',
    'Phát hành phiên bản danh mục theo công ty — HRM/Logistic đồng bộ tự động',
    'Quy trình phê duyệt: định nghĩa một lần — dùng cho nhiều nghiệp vụ',
    'Quản trị mở rộng danh mục: công ty con đề xuất → tập đoàn duyệt',
    'Tổ chức & phân quyền: pháp nhân, RACI, ma trận quyền — nguồn chuẩn toàn hệ',
  ], 'XBOS là lớp cấu hình — không thay thế màn hình nhập đơn/chuyến hàng ngày');

  bulletSlide(pres, 'Tính năng — Nhân sự (HRM)', [
    'Vòng đời nhân viên: hồ sơ, hợp đồng, biến động, import/export có kiểm tra danh mục',
    'Chấm công & đơn từ: tạo đơn nghỉ, chỉnh sửa công — chạy quy trình duyệt trên XBOS',
    'Lương & tuyển dụng: phiếu lương, kỳ lương, tin tuyển dụng, hồ sơ ứng viên',
    'Cấu hình HRM: đồng bộ danh mục từ XBOS, xem tổng quan, bổ sung lô mở rộng',
    'Thông báo & hộp thư: nhân viên và quản lý nhận kết quả duyệt kịp thời',
  ]);

  bulletSlide(pres, 'Tính năng — Logistic (Giai đoạn 2)', [
    'Kinh doanh đầu chuỗi: khách hàng, báo giá, hợp đồng, tạo đơn/đặt chỗ',
    'Điều phối: gán xe, lái xe, lịch chuyến — dùng danh mục chuẩn từ XBOS',
    'Vận hành chuyến: theo dõi tiến độ, chứng từ giao nhận, sự cố hiện trường',
    'Ứng dụng lái xe: nhận chuyến, 5 bước trả hàng, định vị, hoàn tất chuyến',
    'Chốt doanh thu & lương % tài xế — liên thông dữ liệu chuyến',
  ], 'Giai đoạn 1: khai đủ 111 danh mục logistic trên XBOS');

  bulletSlide(pres, 'Tính năng — Ứng dụng di động', [
    'Nhân viên (15 chức năng): đăng nhập, chấm công, đơn nghỉ, phiếu lương, thông báo đẩy',
    'Lái xe (28 chức năng — GĐ2): nhận chuyến, cập nhật tiến độ, ảnh chứng từ, báo sự cố',
    'Làm việc đúng công ty — không lẫn dữ liệu giữa các đơn vị',
    'Hỗ trợ xếp hàng thao tác khi mất mạng (chấm công, ghi nhận — đồng bộ sau)',
    'Gắn trực tiếp quy trình duyệt — kết quả trả về tức thì trên điện thoại',
  ]);

  twoColSlide(
    pres,
    'Giá trị theo từng nhóm người dùng',
    'Vai trò',
    [
      ['Ban điều hành', 'Tầm nhìn tập đoàn, KPI, phê duyệt chiến lược'],
      ['HR / Nhân sự', 'Chuẩn hồ sơ, chấm công, lương, ít sai sóc danh mục'],
      ['Điều phối / KD', 'Đơn — chuyến — xe — lái xe trên một nền'],
      ['Lái xe / NV hiện trường', 'App gọn, rõ việc, chứng từ số'],
      ['IT / Quản trị', 'Một nền tảng, phạm vi rõ, dễ bảo trì'],
    ],
    'Kết quả đo được',
    [
      ['BĐH', 'Giảm thời gian hợp nhất báo cáo'],
      ['HR', 'Rút ngày công đóng bảng lương'],
      ['Điều phối', 'Giảm gọi điện tra cứu trạng thái chuyến'],
      ['Lái xe', 'Giảm giấy tờ, cập nhật real-time'],
      ['IT', 'Giảm tích hợp điểm-điểm ad hoc'],
    ],
  );

  // —— Kiến trúc & triển khai ——
  sectionSlide(pres, 'Kiến trúc & triển khai', 'Nền tảng kỹ thuật và lộ trình đưa vào vận hành');

  imageSlide(
    pres,
    'Kiến trúc bốn tầng',
    imgIfExists(path.join(ASSETS, 'kien-truc-bon-tang-xevn.png')),
    'Trình bày → Nghiệp vụ (HRM, Logistic) → Nền tảng (XBOS) → Dữ liệu tập trung theo công ty',
  );
  imageSlide(
    pres,
    'Vai trò & luồng tích hợp',
    imgIfExists(path.join(ASSETS, 'kien-truc-vai-tro-luong-xevn.png')),
    'XBOS cung cấp danh mục chuẩn cho HRM và Logistic; Cổng Web là điểm điều hành thống nhất',
  );

  // 8 — Dữ liệu
  bulletSlide(pres, 'Phân tầng dữ liệu — Ai sở hữu gì?', [
    'Tập đoàn (XBOS): pháp nhân, cây tổ chức, RACI, danh mục nghiệp vụ, quy trình phê duyệt',
    'HRM / Logistic: giao dịch vận hành — nhân viên, đơn nghỉ, vận đơn, chuyến, phiếu lương',
    'Mỗi công ty con chỉ thấy dữ liệu được phân quyền — không đọc bản dữ liệu công ty khác',
    'Mở rộng danh mục tại công ty con: qua quy trình phê duyệt tập đoàn trên XBOS',
  ]);

  bulletSlide(pres, 'Quy tắc nghiệp vụ toàn hệ (điểm then chốt)', [
    'Đăng nhập: chỉ dữ liệu thuộc công ty được gán',
    'Giao diện nhúng: phủ toàn màn hình cổng — trải nghiệm thống nhất',
    'Không xóa trực tiếp trường danh mục chuẩn — yêu cầu phê duyệt tập đoàn',
    'Một định nghĩa quy trình — dùng cho đơn nghỉ, mở rộng danh mục, logistic…',
  ]);

  imageSlide(
    pres,
    'Logistic — Chuỗi giá trị (150 chức năng)',
    imgIfExists(path.join(ASSETS, 'chuoi-gia-tri-logistic-xevn.png')),
    'Kinh doanh → điều phối → vận đơn/chuyến → ứng dụng lái xe (Giai đoạn 2)',
  );

  // 13 — Lộ trình
  const s13 = pres.addSlide();
  addHeader(s13, 'Lộ trình triển khai — Hai giai đoạn', pres);
  const road = imgIfExists(path.join(ASSETS, 'lo-trinh-hai-giai-doan-xevn.png'));
  if (road) s13.addImage({ path: road, x: 0.5, y: 1.05, w: 4.5, h: 3.9 });
  s13.addTable(
    [
      [
        { text: '', options: { fill: { color: BLUE }, color: 'FFFFFF', bold: true } },
        { text: 'Giai đoạn 1', options: { fill: { color: BLUE }, color: 'FFFFFF', bold: true } },
        { text: 'Giai đoạn 2', options: { fill: { color: CYAN }, color: 'FFFFFF', bold: true } },
      ],
      ['Mục tiêu', 'XBOS + HRM vận hành; khai danh mục LG', 'Logistic + app lái xe'],
      ['Phạm vi', '245 chức năng · 183 danh mục', '128 chức năng logistic'],
      ['Ngoài phạm vi GD1', 'Đơn/chuyến/app lái xe', '—'],
    ],
    { x: 5.1, y: 1.35, w: 4.4, fontSize: 12, colW: [1.1, 1.65, 1.65] },
  );
  addFooter(s13, pres.slides.length, pres);

  // 14 — Luồng giá trị (sales story)
  bulletSlide(pres, 'Luồng giá trị điển hình (tóm tắt BRD)', [
    'LUỒNG 6–7: Tập đoàn khai danh mục HRM trên XBOS → phát hành → HRM công ty con đồng bộ',
    'LUỒNG 8: Công ty con thiếu mã → gửi lô mở rộng → tập đoàn duyệt trên Cổng',
    'LUỒNG 9: Một quy trình phê duyệt — dùng cho đơn nghỉ, danh mục, logistic',
    'LUỒNG 5 (GD2): Báo giá → đơn/đặt chỗ → điều phối chuyến → lái xe hoàn tất trên app',
  ], 'Chi tiết: BRD HTML / tài liệu kỹ thuật SRS');

  twoColSlide(
    pres,
    'Cam kết nghiệm thu (BRD §13)',
    'Tiêu chí',
    [
      ['1', 'Đủ 373 chức năng mô tả & phân loại'],
      ['2', '183 danh mục XBOS (GĐ1)'],
      ['3', 'Chuỗi Logistic chạy thật (GĐ2)'],
      ['4', 'Phân tách đúng công ty con'],
      ['5', 'Phê duyệt tập trung qua XBOS'],
    ],
    'Bằng chứng',
    [
      ['1', 'Phụ lục A + SRS'],
      ['2', 'Biên bản phát hành danh mục'],
      ['3', 'Nghiệm thu thử nghiệm pilot'],
      ['4', 'Kiểm thử 2 tài khoản'],
      ['5', 'Demo quy trình + hộp thư'],
    ],
  );

  // 17 — Bước tiếp
  const sEnd = pres.addSlide();
  addHeader(sEnd, 'Đề xuất bước tiếp theo', pres);
  sEnd.addText(
    [
      { text: '1. ', options: { bold: true, color: BLUE } },
      { text: 'Workshop phạm vi 90 phút — xác nhận ưu tiên Giai đoạn 1 & công ty pilot\n', options: { breakLine: true } },
      { text: '2. ', options: { bold: true, color: BLUE } },
      { text: 'Demo Cổng Web + HRM Mobile (tài khoản pilot)\n', options: { breakLine: true } },
      { text: '3. ', options: { bold: true, color: BLUE } },
      { text: 'Ký kết phạm vi: BRD + SRS + kế hoạch triển khai & nghiệm thu\n', options: { breakLine: true } },
      { text: '4. ', options: { bold: true, color: BLUE } },
      { text: 'Khởi động Giai đoạn 1 — XBOS, danh mục, HRM', options: { breakLine: true } },
    ],
    { x: 0.7, y: 1.35, w: 8.5, h: 2.5, fontSize: 18, color: TEXT },
  );
  sEnd.addText('Liên hệ: UNICOM · XeVN Ecosystem OS', {
    x: 0.7,
    y: 4.2,
    w: 8.5,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: CYAN,
  });
  sEnd.addText('Tài liệu đính kèm: BRD HTML · SRS · Mô tả hệ sinh thái', {
    x: 0.7,
    y: 4.75,
    w: 8.5,
    fontSize: 12,
    color: SUB,
  });
  addFooter(sEnd, pres.slides.length, pres);

  // 18 — Cảm ơn
  const thanks = pres.addSlide();
  thanks.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: '100%',
    h: '100%',
    fill: { color: DARK },
  });
  thanks.addText('Cảm ơn Quý vị', {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 0.8,
    fontSize: 40,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  thanks.addText('XeVN OS — Đồng hành chuyển đổi số tập đoàn vận tải', {
    x: 0.5,
    y: 3.1,
    w: 9,
    fontSize: 18,
    color: CYAN,
    align: 'center',
  });

  await pres.writeFile({ fileName: OUT });
  console.log(`Wrote ${OUT} (${pres.slides.length} slides)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
