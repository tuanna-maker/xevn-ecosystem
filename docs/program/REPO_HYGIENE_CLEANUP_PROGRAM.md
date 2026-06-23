# Chương trình dọn dẹp source — REPO-HYGIENE

**work_item_id:** `REPO-HYGIENE-01`  
**Ngày:** 2026-06-20  
**Yêu cầu sponsor:** Gom/nhóm file, giảm rác (APK build, SQL trùng, MD/evidence, script tmp), repo sạch dễ đọc.

## Hiện trạng (audit 2026-06-20)

| Khu vực | Số file (disk) | Git tracked | Vấn đề |
|---------|----------------|-------------|--------|
| `scripts/tmp-*` | **352** | 64 | One-off deploy/probe VPS, mobile QA — lẫn lộn root `scripts/` |
| `scripts/` (tổng) | 548 | — | Chỉ 4 thư mục con (`dev`, `lib`, `load`, `ops`); phần lớn phẳng ở root |
| `docs/qa/evidence/` | **3617** | 753 | **1701 `.xml`** (adb UI dump), **735 `.png`**, 996 `.md`, 146 `.json` |
| `docs/**/*.md` | 1283 | — | Governance OK; không xóa hàng loạt |
| `docs/ops/evidence/` | 75 | — | Có `tmp-plink-*.txt` rác |
| SQL | 27 | — | SoT chính: `migrations/hrm/`, `migrations/xbos/`; thêm `apps/api/xbos-api/migrations/` (5 file) |
| APK binary | 0 tracked | — | Không commit APK; bổ sung `.gitignore` phòng hở |

## Nguyên tắc (không phá gate)

1. **Không xóa** artifact được `EVIDENCE_INDEX.md` / QC GO / bus `work_item_id` tham chiếu trực tiếp — **archive** thay vì xóa nếu nghi ngờ.
2. **Summary-first:** Mỗi wave QA giữ **1 file `.md` + 1 `.json` probe**; XML/PNG adb chỉ local hoặc archive nén, **không** track git.
3. **Script:** Script được `package.json` gọi → đổi tên bỏ prefix `tmp-`, chuyển `scripts/qa/` hoặc `scripts/ops/`. One-off dated → xóa sau khi grep không còn ref.
4. **SQL SoT:** `migrations/{hrm,xbos}/` + `scripts/migrate-*.mjs`. File trong `apps/api/xbos-api/migrations/` — TM xác nhận merge hoặc symlink README trỏ SoT.
5. **Không gom MD nghiệp vụ** (SRS/BRD/program) — chỉ gom **evidence** và **tmp tooling**.

## Cấu trúc đích

```text
migrations/
  hrm/          # DDL HRM — duy nhất
  xbos/         # DDL XBOS — duy nhất
scripts/
  qa/           # probe, browser-e2e, pilot smoke (promote từ tmp)
  ops/          # deploy VPS, pscp wrappers (promote từ tmp)
  dev/          # seed, repair SQL one-off
  lib/          # shared helpers (giữ)
docs/
  qa/evidence/
    archive/YYYY-MM/   # md+json+critical png only
    *.md               # evidence “living” gần nhất (~≤150 file tracked)
  ops/evidence/        # deploy md+json; xóa tmp-plink-*
```

## Waves

### W1 — `.gitignore` + xóa rác an toàn (P0)

- [x] `.gitignore`: `docs/qa/evidence/**/*.xml`, `docs/qa/evidence/**/ui-dump/`, `*.apk`, `*.aab`, `android/app/build/`, `scripts/tmp-*` (sau promote)
- [x] Xóa untracked: toàn bộ `docs/qa/evidence/**/*.xml`, `docs/ops/evidence/tmp-plink-*.txt`
- [x] Xóa untracked `scripts/tmp-*` **không** có trong `git ls-files`
- [x] Evidence PNG: giữ file được `*.md` evidence cite (`![` hoặc path); còn lại untracked → xóa hoặc `archive/2026-06/_png/` (không track)

**Exit:** `git status` sạch untracked xml/png/tmp; disk evidence ≤800 file.

### W2 — Script tmp → cấu trúc (P0)

- [x] Inventory 64 tracked `scripts/tmp-*`: map → promote / delete
- [x] Promote: `tmp-cc-legal-*` → `scripts/qa/xbos-cc-legal-*`; cập nhật `package.json`
- [x] Promote VPS: `scripts/ops/vps/` gom deploy shell còn dùng (`dev-server-factory`, deploy guide cite)
- [x] Xóa tracked tmp one-off đã hết ref (grep repo + bus)
- [x] `scripts/README.md` — bảng thư mục + quy tắc đặt tên

**Exit:** `scripts/tmp-*` = 0 tracked; `pnpm run qc:dev-stack` exit 0.

### W3 — Evidence archive + index (P1)

- [x] Gom evidence cũ (trước 2026-05-01) → `docs/qa/evidence/archive/2026-05/` (chỉ `.md` + `.json` + png cited)
- [x] Cập nhật `EVIDENCE_INDEX.md` — pointer archive, không liệt kê 3600 file
- [x] `docs/qa/evidence/README.md` — quy tắc đặt tên, cấm commit xml

**Exit:** tracked evidence ≤200 files; index vẫn trace được work_item.

### W4 — SQL consolidation (P1 — TM sign-off)

- [x] So sánh `apps/api/xbos-api/migrations/*.sql` vs `migrations/xbos/`
- [x] Nếu trùng: xóa bản lẻ, README trong `apps/api/xbos-api/migrations/` trỏ `../../../../migrations/xbos/` (TM: không trùng — giữ reference track)
- [x] `scripts/dev/repair-xbos-legacy-catalog-constraints.sql` → manual-only header
- [x] `apps/api/xbos-api/scripts/seed-org-foundation-dbeaver.sql` → giữ 1 bản; ghi `docs/ops/SEED_SQL_SOT.md`

**Exit:** TM note trong evidence; `pnpm migrate:xbos:status` OK.

### W5 — QC gate

- [x] `pnpm run qc:dev-stack`, `pnpm run verify:sprint:transition` (sprint FAIL pre-existing S4_RETRO)
- [x] Grep không còn broken path tới file đã xóa
- [x] QC GO hygiene wave — **GWC** C-HYGIENE-01

## Rủi ro

| Rủi ro | Giảm thiểu |
|--------|------------|
| Xóa evidence QC cite | Chỉ xóa untracked xml; md/json giữ; archive trước khi xóa tracked |
| package.json broken | W2 chạy sau promote + test script |
| SQL drift prod | W4 không merge nếu TM chưa diff VPS |

## Evidence path

`docs/qa/evidence/repo-hygiene-cleanup-20260620.md`
