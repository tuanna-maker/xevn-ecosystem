/**
 * Mermaid sequence — validation, if/else, success/fail, error codes (373 UC).
 */
import { inferVerb } from './srs-uc-infer.mjs';

export function errorPrefix(uc) {
  if (uc.code?.startsWith('LG-')) return 'LG';
  if (uc.code?.includes('HRM') || uc.code?.startsWith('HRM-')) return 'HRM';
  return 'XBOS';
}

function participants(uc) {
  const ch = (uc.channel || '').toLowerCase();
  const isMobile = ch.includes('mobile');
  const isApi = ch.includes('api') && !isMobile;
  const isXbos =
    uc.layer?.includes('XBOS') ||
    /^UC-XBOS|^XBOS-|^UC-ECO|^UC-CC|^UC-RACI|^UC-XBOS-CAT/.test(uc.code || '');
  const isLog = uc.layer?.includes('Logistic') || /^LG-/.test(uc.code || '');

  let user = 'Người dùng';
  let client = 'Cổng Web';
  let api = 'API';

  if (isMobile) {
    user = isLog ? 'Lái xe / NV' : 'Nhân viên';
    client = 'Ứng dụng di động';
    api = isLog ? 'Dịch vụ Logistic' : 'Dịch vụ HRM';
  } else if (isXbos) {
    user = 'Quản trị / Lãnh đạo';
    client = 'Cổng XBOS';
    api = 'Dịch vụ XBOS';
  } else if (isLog) {
    user = 'Điều phối / NV Logistic';
    client = 'Cổng Logistic';
    api = 'Dịch vụ Logistic';
  } else {
    user = 'HR / Quản lý';
    client = isApi ? 'Ứng dụng tích hợp' : 'Cổng HRM';
    api = 'Dịch vụ HRM';
  }

  const needsXbos =
    !isXbos &&
    (inferVerb(uc.name) === 'sync' ||
      inferVerb(uc.name) === 'approve' ||
      /danh mục|catalog|workflow|đồng bộ/i.test(uc.name || ''));

  return { user, client, api, store: 'CSDL', xbos: 'Dịch vụ XBOS', isMobile, isXbos, needsXbos };
}

function wrap(body) {
  const vi = vietnameseDiagramBody(body.trim());
  return '```mermaid\nsequenceDiagram\n' + vi + '\n```';
}

/** Nhãn trong sơ đồ — giữ loop/opt/alt/end; chỉ Việt hóa mô tả */
function vietnameseDiagramBody(body) {
  return body
    .replace(/participant C as Client/g, 'participant C as Ứng dụng khách')
    .replace(/participant G as API Gateway/g, 'participant G as Cổng dịch vụ')
    .replace(/participant A as API\b/g, 'participant A as Dịch vụ')
    .replace(/participant S as Service/g, 'participant S as Dịch vụ nghiệp vụ')
    .replace(/App Mobile/g, 'Ứng dụng di động')
    .replace(/Logistic API/g, 'Dịch vụ Logistic')
    .replace(/HRM API/g, 'Dịch vụ HRM')
    .replace(/XBOS API/g, 'Dịch vụ XBOS')
    .replace(/Cổng Web HRM/g, 'Cổng HRM')
    .replace(/Cổng Web Logistic/g, 'Cổng Logistic')
    .replace(/Cổng Web XBOS/g, 'Cổng XBOS')
    .replace(/Client tích hợp/g, 'Ứng dụng tích hợp')
    .replace(/Validate form — required, format, range, enum/g, 'Kiểm tra biểu mẫu — bắt buộc, định dạng, miền giá trị')
    .replace(/opt Client validation FAIL/g, 'opt Kiểm tra phía ứng dụng thất bại')
    .replace(/không gọi API\)/g, 'không gọi dịch vụ)')
    .replace(/401 Unauthorized/g, '401 — chưa xác thực')
    .replace(/403 ECO-ERR-FORBIDDEN/g, '403 — bị cấm')
    .replace(/400 SCOPE_TENANT_REQUIRED/g, '400 — thiếu phạm vi công ty')
    .replace(/Thiếu tenant/g, 'Thiếu phạm vi công ty')
    .replace(/phạm vi tenant/g, 'phạm vi công ty')
    .replace(/filter tenant/g, 'lọc theo công ty')
    .replace(/tenant\/company/g, 'công ty')
    .replace(/tenant/g, 'công ty')
    .replace(/Catalog \/ workflow/g, 'Danh mục / quy trình')
    .replace(/Workflow reject/g, 'Từ chối quy trình')
    .replace(/Workflow approve/g, 'Phê duyệt quy trình')
    .replace(/GET catalog/g, 'Lấy danh mục')
    .replace(/snapshot local/g, 'bản chụp cục bộ')
    .replace(/xếp hàng offline/g, 'xếp hàng ngoại tuyến')
    .replace(/Auth JWT \+ RBAC/g, 'Xác thực JWT và phân quyền')
    .replace(/DTO \/ tham số/g, 'Tham số')
    .replace(/\(policy\)/g, '(chính sách)')
    .replace(/comment required/g, 'bắt buộc ghi lý do')
    .replace(/quyết định reject/g, 'quyết định từ chối')
    .replace(/quyết định approve/g, 'quyết định phê duyệt')
    .replace(/\+ audit/g, '+ ghi nhật ký')
    .replace(/\{ success: true/g, '{ thành công: true');
}

function diagramScope01() {
  return wrap(`
  participant C as Client
  participant G as API Gateway
  participant S as Service
  C->>G: Request (không ép một tenant)
  Note over G: UC-ECO-SCOPE-01 — chỉ môi trường kiểm soát
  alt Production: chế độ tắt
    G-->>C: 401 / 403 — từ chối
  else Dev/staging: chế độ bật
    G->>S: Forward theo policy admin
    alt Không đủ quyền system admin
      S-->>G: 403 ECO-ERR-FORBIDDEN
      G-->>C: 403 + message
    else Hợp lệ
      S-->>G: 200 { success: true, data }
      G-->>C: 200 + audit event
    end
  end`);
}

function diagramScope02() {
  return wrap(`
  participant U as Người dùng
  participant C as Client
  participant A as API
  participant D as CSDL
  U->>C: Thao tác nghiệp vụ
  Note over C: Validate tham số client
  opt Client validation FAIL
    C-->>U: Lỗi trường — không gọi API
  end
  C->>A: HTTP + JWT, x-tenant-id, x-company-id
  Note over A: UC-ECO-SCOPE-02
  alt Token thiếu / hết hạn
    A-->>C: 401 Unauthorized
    C-->>U: Đăng nhập lại
  else Thiếu tenant (SCOPE_TENANT_REQUIRED)
    A-->>C: 400 SCOPE_TENANT_REQUIRED
    C-->>U: Thiếu phạm vi
  else Tenant ngoài membership
    A-->>C: 403 ECO-ERR-FORBIDDEN
    C-->>U: Từ chối truy cập
  else Query/body không hợp lệ
    A-->>C: 400 ECO-ERR-VALIDATION
    C-->>U: Lỗi tham số
  else Hợp lệ — thành công
    A->>D: Đọc/ghi + filter tenant
    A-->>C: 200 { success: true, data }
    C-->>U: Hiển thị kết quả
  else Lỗi hệ thống
    A-->>C: 500 ECO-ERR-INTERNAL
    C-->>U: Thông báo lỗi chung
  end`);
}

function buildStandardDiagram(uc) {
  const p = errorPrefix(uc);
  const v = inferVerb(uc.name || '');
  const title = (uc.name || '').slice(0, 42).replace(/"/g, "'");
  const { user, client, api, store, xbos, isMobile, needsXbos } = participants(uc);
  const isRead = v === 'read';
  const isWrite = !isRead && v !== 'delete';
  const isApprove = v === 'approve' || /phê duyệt|duyệt |từ chối/i.test(uc.name || '');
  const isSync = v === 'sync' || /đồng bộ/i.test(uc.name || '');
  const httpOp = isRead ? 'GET' : v === 'delete' ? 'DELETE' : 'POST/PUT/PATCH';

  const parts = [];
  parts.push(`  participant U as ${user}`);
  parts.push(`  participant C as ${client}`);
  parts.push(`  participant A as ${api}`);
  if (needsXbos) parts.push(`  participant X as ${xbos}`);
  parts.push(`  participant D as ${store}`);

  parts.push(`  U->>C: ${isRead ? 'Xem / tra cứu' : 'Thực hiện'} «${title}»`);
  parts.push(`  Note over C: Kiểm tra biểu mẫu — bắt buộc, định dạng, miền giá trị`);
  parts.push(`  opt Kiểm tra phía ứng dụng thất bại`);
  parts.push(`    C-->>U: Hiển thị lỗi trường (không gọi dịch vụ)`);
  parts.push(`  end`);

  if (isMobile && isWrite) {
    parts.push(`  opt Mất mạng (ghi)`);
    parts.push(`    C-->>U: HRM-MOB-ERR-OFFLINE — xếp hàng offline`);
    parts.push(`  end`);
  }

  parts.push(`  C->>A: ${httpOp} + Authorization, x-tenant-id, x-company-id, x-request-id`);
  parts.push(`  Note over A: Xác thực JWT và phân quyền theo công ty`);

  const branches = [];

  branches.push(`  alt Token thiếu / hết hạn
    A-->>C: 401 Unauthorized
    C-->>U: Yêu cầu đăng nhập lại`);

  branches.push(`  else Phạm vi tenant/company sai
    A-->>C: 400 ${p}-ERR-SCOPE-INVALID
    C-->>U: Thông báo sai phạm vi`);

  branches.push(`  else Không đủ quyền (RBAC)
    A-->>C: 403 ${p}-ERR-FORBIDDEN
    C-->>U: Không có quyền thao tác`);

  if (!isRead) {
    branches.push(`  else DTO / tham số không hợp lệ
    A-->>C: 400 ${p}-ERR-VALIDATION (details[])
    C-->>U: Lỗi theo từng trường`);
  }

  if (isWrite || isApprove) {
    branches.push(`  else Trạng thái / xung đột nghiệp vụ
    A-->>C: 409 ${p}-ERR-CONFLICT
    C-->>U: Không thể thực hiện ở trạng thái hiện tại`);
  }

  if (isApprove) {
    branches.push(`  else Từ chối thiếu lý do (policy)
    A-->>C: 400 ${p}-ERR-VALIDATION (comment required)
    C-->>U: Bắt buộc nhập lý do từ chối`);
  }

  if (needsXbos && (isSync || isWrite || isApprove)) {
    branches.push(`  else Gọi XBOS thất bại
    A->>X: Catalog / workflow
    X-->>A: 502 / timeout
    A-->>C: 502 ${p}-ERR-UPSTREAM
    C-->>U: Lỗi tích hợp hệ thống nền`);
  }

  if (isApprove) {
    branches.push(`  else Hợp lệ — quyết định reject
    A->>X: Workflow reject + comment
    X-->>A: OK
    A->>D: Cập nhật REJECTED + audit
    A-->>C: 200 { success: true }
    C-->>U: Thông báo từ chối`);
    branches.push(`  else Hợp lệ — quyết định approve
    A->>X: Workflow approve
    X-->>A: OK
    A->>D: Cập nhật APPROVED + audit
    A-->>C: 200 { success: true }
    C-->>U: Thông báo đã duyệt`);
  } else if (isSync) {
    branches.push(`  else Hợp lệ — đồng bộ thành công
    A->>X: GET catalog/version (tenant)
    X-->>A: 200 payload + checksum
    A->>D: Lưu snapshot local
    A-->>C: 200 { success: true, version }
    C-->>U: Danh mục đã cập nhật`);
  } else if (isRead) {
    branches.push(`  else Hợp lệ — truy vấn
    A->>D: SELECT (filter tenant/company)
    alt Không có bản ghi
      A-->>C: 200 { success: true, data: [] }
      C-->>U: Trạng thái rỗng
    else Có dữ liệu
      A-->>C: 200 { success: true, data }
      C-->>U: Hiển thị kết quả
    end`);
  } else {
    const label =
      v === 'create' ? 'tạo mới' : v === 'update' ? 'cập nhật' : v === 'config' ? 'lưu cấu hình' : 'ghi';
    branches.push(`  else Hợp lệ — ${label} thành công
    A->>D: INSERT/UPDATE + audit
    A-->>C: 200 { success: true, data }
    C-->>U: Thông báo thành công`);
  }

  branches.push(`  else Lỗi hệ thống không mong đợi
    A-->>C: 500 ${p}-ERR-INTERNAL
    C-->>U: Thông báo lỗi chung
  end`);

  parts.push(branches.join('\n'));
  return wrap(parts.join('\n'));
}

function diagramHrmPullCatalog(p, uc) {
  const title = (uc.name || '').slice(0, 42).replace(/"/g, "'");
  return wrap(`
  participant H as HRM API
  participant X as XBOS API
  participant D as CSDL HRM
  H->>X: GET config-sync/catalog/:key (tenant, company)
  Note over H,X: UC-ECO-SCOPE-02 — header phạm vi bắt buộc
  alt Token / scope không hợp lệ
    X-->>H: 401 / 400 ${p}-ERR-SCOPE-INVALID
    H-->>H: Không cập nhật snapshot
  else Không đủ quyền consumer
    X-->>H: 403 ${p}-ERR-FORBIDDEN
  else Catalog key không tồn tại / chưa phát hành
    X-->>H: 404 / 400 ${p}-ERR-VALIDATION
  else XBOS timeout / lỗi
    X-->>H: 502
    H-->>H: 502 ${p}-ERR-UPSTREAM — giữ bản checksum cũ
  else Phiên bản đã có (checksum trùng)
    X-->>H: 200 not_modified
    H-->>H: Bỏ qua ghi DB
  else Hợp lệ — pull thành công
    X-->>H: 200 payload + version + checksum
    H->>D: Lưu snapshot + checksum
    H-->>H: 200 { success: true } cho UI settings
  else Lỗi hệ thống
    H-->>H: 500 ${p}-ERR-INTERNAL
  end`);
}

/** @param {object} uc */
export function sequenceDiagramFor(uc) {
  if (uc.code === 'UC-ECO-SCOPE-01') return diagramScope01();
  if (uc.code === 'UC-ECO-SCOPE-02') return diagramScope02();
  const v = inferVerb(uc.name || '');
  if ((v === 'sync' || /đồng bộ/i.test(uc.name || '')) && /^XBOS-DM-HRM/.test(uc.code || '')) {
    return diagramHrmPullCatalog(errorPrefix(uc), uc);
  }
  return buildStandardDiagram(uc);
}
