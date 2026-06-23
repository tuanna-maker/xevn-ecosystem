# Cursor — deploy VPS không cần Allow mỗi lần

**VPS UAT:** `14.225.217.232` · portal `:8088`

## Vì sao trước đây phải bấm Allow?

Agent **có** chạy lệnh — nhưng Cursor **Auto-review / Smart Mode** coi các lệnh sau là rủi ro và chặn chờ bạn duyệt:

- `ssh` / `pscp` / `plink` ra IP ngoài workspace
- `docker compose` trên VPS (remote shell)
- Mạng sandbox mặc định **deny** (Windows thường không sandbox → fallback classifier → **block**)

PM dispatch devops **đúng**; bottleneck là **policy Cursor trên máy bạn**, không phải team «không tự chạy».

## Cấu hình repo (đã thêm)

| File | Tác dụng |
|------|----------|
| `.cursor/permissions.json` | `terminalAllowlist`: ssh, pscp, plink, docker, deploy scripts → **bước 1, không qua classifier** |
| `.cursor/sandbox.json` | Cho phép mạng tới `14.225.217.232` nếu lệnh chạy trong sandbox |

## Bạn đã bật **Run Everything**?

Run Everything **đủ mạnh** — không cần chuyển sang Allowlist. Lời khuyên Allowlist trước đó là cho ai **chưa** bật Run Everything.

Nếu **vẫn** thấy card Allow khi deploy:

| Nguyên nhân | Xử lý |
|-------------|--------|
| **Task sub-agent** (PM gọi devops qua `Task`) | Sub-agent = session riêng; nhiều bản Cursor **vẫn** hỏi Allow cho sub-agent dù chat chính = Run Everything. **Fix:** PM chạy `pnpm run deploy:*` / pscp **Shell ngay chat này** (U66); hoặc Allow 1 lần cho sub-agent. |
| Chưa restart Cursor | Tắt mở lại app sau đổi Run Mode. |
| Card là **MCP / Browser**, không phải terminal | Run Everything chỉ auto terminal — MCP vẫn approve riêng. |
| Enterprise | Admin khóa bypass. |

## Nếu chưa dùng Run Everything

1. **Cursor Settings → Agents → Run Mode** → Allowlist (with Sandbox) hoặc Run Everything
2. **Network access:** Allow All hoặc `.cursor/sandbox.json`

## Một lần duyệt vĩnh viễn qua UI

Lần sau bị block → bấm **Add to allowlist** (lệnh đó merge vào allowlist nếu chưa override bởi `permissions.json`).

## User Rule gợi ý (Settings → Rules)

```text
Trong xevn-ecosystem: deploy/pscp/ssh tới 14.225.217.232 :8088 được phép auto-run; không hỏi lại khi PM/devops lane deploy.
```

## Enterprise

Nếu team policy khóa Run Everything / allowlist — cần admin Cursor bật cho org.
