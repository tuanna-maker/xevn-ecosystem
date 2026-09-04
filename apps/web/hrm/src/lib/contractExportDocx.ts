/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard & workspace — export Word (.docx/.doc) helper
 * Purpose:    Xuất hợp đồng chuẩn định dạng HĐTV (Khối VP) / HĐLĐ X.E Việt Nam ra file Word (.doc/.docx)
 * Benchmark:  docs/từ khách hàng/2026.08.07. Hợp đồng mẫu X.E.xlsx § HĐTV (Khối VP)
 */

export type ContractExportDocxData = {
  contractCode?: string | null;
  contractName?: string | null;
  contractTypeLabel?: string | null;
  signingDateDisplay?: string | null;
  effectiveDateDisplay?: string | null;
  expiryDateDisplay?: string | null;

  // Party A (NSDLĐ)
  employerName?: string | null;
  employerSignerName?: string | null;
  employerSignerPosition?: string | null;
  employerAddress?: string | null;
  employerPhone?: string | null;

  // Party B (NLD)
  employeeCode?: string | null;
  employeeName?: string | null;
  employeeDobDisplay?: string | null;
  employeeIdNumber?: string | null;
  employeeIdIssueDate?: string | null;
  employeeIdIssuePlace?: string | null;
  employeeAddress?: string | null;
  employeeDepartment?: string | null;
  employeePosition?: string | null;
  workLocation?: string | null;
  workArrangement?: string | null;

  // Terms / Financial
  baseSalaryDisplay?: string | null;
  salaryRatioPercent?: number | string | null;
  allowancesSummary?: string | null;
  extraClausesHtml?: string | null;
};

export function buildContractDocxHtml(data: ContractExportDocxData): string {
  const code = (data.contractCode || '……/2026/HĐTV-X.E').trim();
  const title = (data.contractName || 'HỢP ĐỒNG THỬ VIỆC').toUpperCase();
  const employerName = data.employerName || 'CÔNG TY TNHH X.E VIỆT NAM';
  const signerName = data.employerSignerName || 'Nguyễn Trọng Khánh';
  const signerPos = data.employerSignerPosition || 'Giám Đốc';
  const employerAddr = data.employerAddress || 'Số 4 đường Văn Chỉ, thôn Tam Đa, xã Tam Hưng, thành phố Hà Nội';
  const employerPhone = data.employerPhone || '024.3681.5722';

  const empName = data.employeeName || '…………………………………………';
  const empCode = data.employeeCode || '…………';
  const empDob = data.employeeDobDisplay || '……/……/……';
  const empIdNo = data.employeeIdNumber || '……………………';
  const empIdDate = data.employeeIdIssueDate || '……/……/……';
  const empIdPlace = data.employeeIdIssuePlace || '…………………………………………';
  const empAddr = data.employeeAddress || '…………………………………………';
  const empDept = data.employeeDepartment || '…………………………………………';
  const empPos = data.employeePosition || '…………………………………………';
  const workLoc = data.workLocation || 'Theo sự phân công của Công ty';

  const effDate = data.effectiveDateDisplay || '……/……/……';
  const expDate = data.expiryDateDisplay || '……/……/……';
  const salary = data.baseSalaryDisplay ? `${data.baseSalaryDisplay} VNĐ/tháng` : 'Theo thỏa thuận / chính sách Công ty';
  const ratio = data.salaryRatioPercent ? `${data.salaryRatioPercent}%` : '100%';

  return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page WordSection1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 56.7pt 56.7pt 56.7pt 72.0pt;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
        body { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.4; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
        td { vertical-align: top; padding: 2pt 4pt; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-italic { font-style: italic; }
        .header-table td { text-align: center; font-size: 12pt; }
        .title { font-size: 16pt; font-weight: bold; margin-top: 18pt; margin-bottom: 14pt; text-align: center; }
        .section-title { font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; }
        .indent-p { text-indent: 18pt; margin-top: 4pt; margin-bottom: 4pt; text-align: justify; }
        .sig-table { margin-top: 24pt; width: 100%; }
        .sig-cell { text-align: center; width: 50%; }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        <!-- Header -->
        <table class="header-table" style="border: none;">
          <tr>
            <td style="width: 45%; text-align: center;">
              <strong>${employerName.toUpperCase()}</strong><br/>
              Số: ${code}
            </td>
            <td style="width: 55%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
              ----------o0o----------
            </td>
          </tr>
        </table>

        <div class="title">${title}</div>

        <p class="indent-p">Chúng tôi, một bên là <strong>Ông/Bà: ${signerName}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Quốc tịch: Việt Nam</p>
        <table style="border: none; margin-left: 18pt;">
          <tr>
            <td style="width: 120pt;">Chức vụ:</td>
            <td><strong>${signerPos}</strong></td>
          </tr>
          <tr>
            <td>Đại diện cho:</td>
            <td><strong>${employerName}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Điện thoại: ${employerPhone}</td>
          </tr>
          <tr>
            <td>Địa chỉ:</td>
            <td>${employerAddr}</td>
          </tr>
        </table>
        <p class="font-italic" style="margin-left: 18pt;">(Dưới đây gọi là Người sử dụng lao động)</p>

        <p class="indent-p">Một bên là <strong>Ông/Bà: ${empName}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Mã NV: <strong>${empCode}</strong></p>
        <table style="border: none; margin-left: 18pt;">
          <tr>
            <td style="width: 120pt;">Sinh Ngày:</td>
            <td>${empDob} &nbsp;&nbsp;&nbsp;&nbsp; Quốc tịch: Việt Nam</td>
          </tr>
          <tr>
            <td>Địa chỉ thường trú:</td>
            <td>${empAddr}</td>
          </tr>
          <tr>
            <td>CCCD/Passport:</td>
            <td>${empIdNo} &nbsp;&nbsp; Ngày cấp: ${empIdDate} &nbsp;&nbsp; Nơi cấp: ${empIdPlace}</td>
          </tr>
        </table>
        <p class="font-italic" style="margin-left: 18pt;">(Dưới đây gọi là Người lao động)</p>

        <p class="indent-p">Thỏa thuận ký kết Hợp đồng thử việc và cam kết làm đúng những điều khoản sau đây:</p>

        <div class="section-title">Điều 1. Thời hạn và công việc hợp đồng:</div>
        <p class="indent-p">- Loại Hợp đồng: ${data.contractTypeLabel || 'Hợp đồng thử việc'}.</p>
        <p class="indent-p">- Từ ngày <strong>${effDate}</strong> đến ngày <strong>${expDate}</strong>.</p>
        <p class="indent-p">- Địa điểm làm việc: ${workLoc}.</p>
        <p class="indent-p">- Chức danh chuyên môn: <strong>${empPos}</strong> &nbsp;&nbsp;|&nbsp;&nbsp; Phòng: <strong>${empDept}</strong>.</p>
        <p class="indent-p">- Công việc phải làm: Theo bản mô tả công việc và phân công của Quản lý trực tiếp.</p>

        <div class="section-title">Điều 2. Chế độ làm việc:</div>
        <p class="indent-p">- Thời gian làm việc: 08h/ngày, 06 ngày/tuần (hoặc theo ca phân công nghiệp vụ);</p>
        <p class="indent-p">- Được cấp phát dụng cụ làm việc: Theo nhu cầu công việc và theo chính sách của Công ty.</p>

        <div class="section-title">Điều 3. Nghĩa vụ và quyền lợi của người lao động:</div>
        <p class="font-bold" style="margin-left: 18pt;">1 - Quyền lợi:</p>
        <p class="indent-p">- Phương tiện đi lại làm việc: Tự túc;</p>
        <p class="indent-p">- Mức lương chính hoặc tiền công: <strong>${salary}</strong> (Tỉ lệ hưởng: <strong>${ratio}</strong>);</p>
        <p class="indent-p">- Hình thức trả lương: Theo tháng, thanh toán bằng Chuyển khoản hoặc Tiền mặt;</p>
        <p class="indent-p">- Kỳ hạn trả lương: Được trả lương vào ngày 10 và ngày 25 của tháng kế tiếp hàng tháng;</p>
        <p class="indent-p">- Tiền thưởng & Nâng lương: Theo quy định và chính sách về tiền lương của Công ty;</p>
        <p class="indent-p">- Bảo hiểm Xã hội, Bảo hiểm Y tế: Được thực hiện theo quy định của Luật Bảo hiểm Xã hội hiện hành;</p>
        <p class="indent-p">- Bảo mật thông tin: Người lao động có trách nhiệm bảo mật tất cả thông tin sản xuất, kinh doanh, tổ chức của Công ty cả trong và sau thời gian làm việc.</p>

        <p class="font-bold" style="margin-left: 18pt;">2 - Nghĩa vụ:</p>
        <p class="indent-p">- Hoàn thành các công việc đã cam kết trong Hợp đồng và bản mô tả công việc;</p>
        <p class="indent-p">- Chấp hành nghiêm túc lệnh điều hành, nội quy lao động, an toàn lao động và các quy trình nội bộ của Công ty.</p>

        <div class="section-title">Điều 4. Nghĩa vụ và quyền hạn của người sử dụng lao động:</div>
        <p class="font-bold" style="margin-left: 18pt;">1 - Nghĩa vụ:</p>
        <p class="indent-p">- Bảo đảm việc làm và thực hiện đầy đủ các cam kết trong Hợp đồng này;</p>
        <p class="indent-p">- Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho Người lao động.</p>
        <p class="font-bold" style="margin-left: 18pt;">2 - Quyền hạn:</p>
        <p class="indent-p">- Điều hành, phân công, kiểm tra việc thực hiện công việc của Người lao động;</p>
        <p class="indent-p">- Thấu hiểu, đánh giá kết quả thử việc, khen thưởng hoặc xử lý kỷ luật theo quy định pháp luật và Nội quy lao động.</p>

        <div class="section-title">Điều 5. Điều khoản thi hành:</div>
        <p class="indent-p">- Những vấn đề về lao động không ghi trong Hợp đồng này thì áp dụng theo quy định của Bộ luật Lao động;</p>
        <p class="indent-p">- Hợp đồng này được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản và có hiệu lực kể từ ngày ký.</p>

        ${data.extraClausesHtml ? `<div>${data.extraClausesHtml}</div>` : ''}

        <!-- Signatures -->
        <table class="sig-table" style="border: none;">
          <tr>
            <td class="sig-cell">
              <strong>NGƯỜI LAO ĐỘNG</strong><br/>
              <span class="font-italic">(Ký, ghi rõ họ tên)</span>
              <br/><br/><br/><br/>
              <strong>${empName.toUpperCase()}</strong>
            </td>
            <td class="sig-cell">
              <strong>NGƯỜI SỬ DỤNG LAO ĐỘNG</strong><br/>
              <span class="font-italic">(Ký, đóng dấu, ghi rõ họ tên)</span>
              <br/><br/><br/><br/>
              <strong>${signerName.toUpperCase()}</strong>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;
}

export function downloadContractAsDocx(data: ContractExportDocxData, filename?: string) {
  const htmlContent = buildContractDocxHtml(data);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const name = filename || `Hop_dong_${(data.employeeCode || 'NV').replace(/\s+/g, '_')}_${(data.contractCode || 'XE').replace(/[\/\\]/g, '-')}.doc`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
