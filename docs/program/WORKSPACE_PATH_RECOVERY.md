# Workspace path recovery — OneDrive «Tài liệu» trùng tên

## Triệu chứng
Shell/`pnpm` báo: không có `package.json`, không có `.git`, `apps/web` mất — trong khi Cursor vẫn đọc được code đầy đủ.

## Nguyên nhân (đã xác nhận 2026-07-27)
Trên `C:\Users\ADMIN\OneDrive\` tồn tại **nhiều thư mục** nhìn giống «Tài liệu»:

| Thư mục OneDrive | Repo `…\Vibe Coding\projects\xevn-ecosystem` |
|------------------|-----------------------------------------------|
| `Tài liệu` (NFD / dấu tổ hợp) | **BẢN ĐẦY ĐỦ** — có `package.json`, `.git`, `apps/web` |
| `Tài liệu` (NFC / dấu dựng sẵn) | **BẢN MỎNG / stub** — chỉ vài folder, không git |
| `Tà€i liĂª̀£u` (tên hỏng encoding) | Stub rác — tránh dùng |

Cursor thường mở đúng bản NFD; PowerShell/agent đôi khi `cd` nhầm sang bản NFC → tưởng «workspace mỏng».

**Không phải** do xóa nhầm toàn bộ monorepo trong cleanup. Cleanup có thể góp phần làm stub NFC trông «sạch», nhưng bản đầy đủ vẫn còn ở path NFD.

## Cách khắc phục (bắt buộc)

### 1. Dùng junction ASCII (khuyến nghị)
Đã / sẽ tạo:

```text
C:\xevn-ecosystem  →  (junction)  bản đầy đủ dưới OneDrive\Tài liệu\...
```

Mọi agent / terminal / Claude:

```powershell
cd C:\xevn-ecosystem
pnpm -v
Test-Path .\package.json   # phải True
Test-Path .\.git           # phải True
Test-Path .\apps\web\hrm   # phải True
```

### 2. Mở lại Cursor workspace từ junction / shortcut
File → Open Folder → `C:\xevn-ecosystem`  
(không mở path dài có «Tài liệu» nếu có thể chọn nhầm).

**Shortcuts / launcher đã tạo (2026-07-27):**

| Shortcut / launcher | Target |
|---------------------|--------|
| Desktop (OneDrive): `xevn-ecosystem.lnk` + `open-xevn-ecosystem.bat` | `C:\xevn-ecosystem` |
| `%USERPROFILE%\Desktop\xevn-ecosystem.lnk` | cùng |
| Trong repo: `C:\xevn-ecosystem\xevn-ecosystem.lnk` + `open-xevn-ecosystem.bat` | cùng |
| `…\projects\xevn-ecosystem FULL.lnk` | cùng junction |
| Script tái tạo | `node scripts/workspace-path-fix.mjs` |

> Ghi chú: tạo file trực tiếp dưới `C:\` (root) có thể bị Access Denied — dùng Desktop / trong repo thay thế.

**Stub:**
- Encoding-hỏng: đã rename → `xevn-ecosystem__STUB_DO_NOT_USE` + `README_DO_NOT_USE.md`
- NFC `Tài liệu\…\xevn-ecosystem`: rename `EBUSY` khi Cursor đang mở → đã gắn `ZZZ_STUB_DO_NOT_USE.md`. **Bạn:** File → Open Folder → `C:\xevn-ecosystem`, đóng workspace stub, rồi chạy lại `node scripts/workspace-path-fix.mjs` để rename stub.

### 3. Claude / peer PM
Trong `PEER_PM_CLAUDE_BOOTSTRAP.md` dùng root:

```text
C:\xevn-ecosystem
```

### 4. Dọn stub (cẩn thận)
Chỉ xóa/đổi tên thư mục stub **sau khi** đã xác nhận đang đứng ở bản full:

- Stub NFC: `OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem` (không có `.git`)
- Có thể đổi tên thành `xevn-ecosystem__STUB_DO_NOT_USE` để không nhầm lại
- **Không** xóa thư mục NFD full

### 5. Smoke kiểm tra
```powershell
cd C:\xevn-ecosystem
git status -sb
pnpm run qc:dev-stack
```

## Liên kết
- Peer: `docs/program/PEER_PM_COLLAB.md`
- Incident class: path Unicode / OneDrive duplicate folder
