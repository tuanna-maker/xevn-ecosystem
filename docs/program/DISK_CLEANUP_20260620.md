# Dọn ổ cứng — 2026-06-20

**Yêu cầu sponsor:** Giảm dung lượng repo (APK, log, artifact sub-agent).

## Đã xóa / thu gọn (~3,6 GB+)

| Khu vực | Trước | Hành động |
|---------|-------|-----------|
| `apps/mobile/hrm-mobile/dist/` | **~2,5 GB** (10k file APK/zip) | Xóa toàn bộ; giữ `.gitkeep` — build lại khi cần mobile |
| `android/.gradle`, `app/build`, `build/` | **~1 GB** | Xóa cache — Gradle tự tạo lại |
| `*.log` (mobile, root, evidence) | ~vài MB | Xóa |
| `tmp/` | 25 MB | Xóa nội dung |
| `scripts/tmp-*` | — | Promote → `scripts/qa/` rồi xóa |
| `.cursor/team/inbox/*.jsonl` | ~0,7 MB | Truncate (hook vẫn ghi mới) |
| `.cursor/team/AGENT_MESSAGE_BUS.md` | **4,3 MB** / 63k dòng | Archive → `.cursor/team/archive/`; active giữ 400 dòng |
| `pnpm store prune` | — | Gỡ package cache không dùng |

## Còn lại (có thể xóa thủ công nếu cần thêm GB)

| Khu vực | ~Dung lượng | Ghi chú |
|---------|-------------|---------|
| `node_modules/` | **~3,3 GB** | `pnpm install` khôi phục |
| `.pnpm-store/` | **~0,9 GB** | `pnpm store prune` định kỳ |
| `docs/` | ~163 MB | SRS/BRD — **không** xóa hàng loạt |

## Quy tắc giữ gọn (lock)

1. **Không** commit APK/AAB/zip — `.gitignore` đã chặn `apps/mobile/**/dist/`
2. Evidence QA: chỉ `.md` + `.json` summary; **không** `.log`, `.xml` adb, screenshot bulk
3. Bus PM: rotate khi >500 dòng → `archive/`
4. Script one-off: `scripts/qa/` hoặc `scripts/ops/`, không `tmp-*`

## Khôi phục mobile APK (khi cần)

```bash
pnpm --filter hrm-mobile run build:apk
# output: apps/mobile/hrm-mobile/dist/ (gitignored)
```
