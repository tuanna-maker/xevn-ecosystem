# QA evidence — quy tắc lưu trữ

**Cập nhật:** 2026-06-20 · `REPO-HYGIENE-01-W3`

## Đặt tên file

| Thành phần | Quy ước | Ví dụ |
|------------|---------|-------|
| Prefix | `p1-`, `qc-`, `mob-`, `pcomp-`, `hrm-` theo wave/work_item | `p1-xbos-w2-infra-qa-retest-20260606.md` |
| Ngày | **`YYYYMMDD`** bắt buộc trên evidence mới (cuối tên) | `-20260620.md` |
| Probe JSON | Cùng stem + `-probe.json` hoặc `-20260620-probe.json` | `p1-web-acceptance-close-20260620-probe.json` |
| Revision | `-r1`, `-r2`, `-r3` trước ngày nếu cần | `p1-web-acceptance-close-01-r3-20260620.md` |

Mỗi wave QA/QC: **ưu tiên 1 `.md` tóm tắt + 1 `.json` probe** — không sinh hàng trăm artifact lẻ.

## Cấm commit git

| Loại | Lý do |
|------|-------|
| **`*.xml`** (adb UI dump, uiautomator) | Rác volume; đã `.gitignore` |
| **`ui-dump/`**, `*-screens/*.xml` | Chỉ local / archive disk |
| **`*.apk`**, **`*.aab`**, `android/app/build/` | Binary build |
| PNG hàng loạt | Chỉ track khi **cited** trong `.md` gate (QC sign-off); còn lại local |

## Vị trí thư mục

```text
docs/qa/evidence/
  README.md                 ← file này
  *.md / *.json             ← living evidence (2026-06+ và milestone đang mở)
  archive/
    YYYY-MM/                ← bucket theo tháng archive (W3: 2026-05)
      *.md / *.json         ← wave cũ; index git nhẹ (chỉ milestone trong EVIDENCE_INDEX)
      screens/              ← PNG/XML device (disk/local; không track png/xml)
```

## Archive policy

1. **Trước 2026-05-01** (`YYYYMMDD` trong tên): chuyển vào `archive/2026-05/` (bucket W3 — không còn file pre-May trong repo sau audit 2026-06-20).
2. **Tháng 05/2026** đã gom vào `archive/2026-05/`; milestone QC vẫn **git-tracked** trong archive (xem `docs/program/EVIDENCE_INDEX.md`).
3. **2026-06+** giữ tại root cho đến wave archive kế.
4. **Không xóa** artifact bus/QC cite — `git rm --cached` + giữ trên disk nếu cần giảm index; path cập nhật trên `EVIDENCE_INDEX.md`.
5. Chỉ mục tổng: `docs/program/EVIDENCE_INDEX.md` — **không** liệt kê từng probe.

## Automation

```bash
node scripts/ops/repo-hygiene-w3-archive.mjs   # archive + untrack xml/png (dry-run: sửa script trước khi chạy lại)
git ls-files docs/qa/evidence/ | measure        # mục tiêu ≤200 tracked
```

## Liên kết

- Program: `docs/program/REPO_HYGIENE_CLEANUP_PROGRAM.md` §W3
- Index: `docs/program/EVIDENCE_INDEX.md`
- Hygiene log: `docs/qa/evidence/repo-hygiene-cleanup-20260620.md`
