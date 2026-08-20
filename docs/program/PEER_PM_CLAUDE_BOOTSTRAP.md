# Forward cho Claude Code — PM thứ 2

## Root bắt buộc (tránh workspace mỏng)

```text
cd C:\xevn-ecosystem
```

- Junction ASCII → bản full (`package.json` + `.git` + `apps/web`)
- Shortcut: `C:\xevn-ecosystem.lnk` · `C:\open-xevn-ecosystem.bat`
- Trong projects: `xevn-ecosystem FULL.lnk`
- **Cấm** mở path OneDrive «Tài liệu\…\xevn-ecosystem» nếu không chắc là bản full
- Chi tiết: `docs/program/WORKSPACE_PATH_RECOVERY.md`

Mở file này trước, rồi mở SoT đầy đủ:

👉 **[`docs/program/PEER_PM_COLLAB.md`](./PEER_PM_COLLAB.md)**

## Lệnh khởi động (paste vào Claude)

Bạn là **CLAUDE-PM**. Working directory **bắt buộc** `C:\xevn-ecosystem`. Đọc `docs/program/PEER_PM_COLLAB.md` §1–§4. Nhận **LANE B**, tự dựng team, chạy song song với Cursor (LANE A). Không đụng FE HRM/XBOS đang sửa ở LANE A. Mỗi WI xong: APPEND §5 SoT + ping `.cursor/team/inbox/peer-pm.jsonl`.

## Lane của bạn (làm hết công suất)

1. `BA-U72-FIELD-DISPLAY-SRS-01` — SRS 5 mục hiển thị trường cho mọi FAIL/UNKNOWN HRM  
2. `BA-U72-FIELD-DISPLAY-XBOS-SRS-01` — tương tự XBOS  
3. `SA-U71-SPEC-GAP-SCAN-01` — backlog thiếu DB_DESIGN / API_DESIGN  
4. `D-MOB-U72-LABEL-SCAN-01` — inventory label-leak mobile  
5. `BA-DUAL-PLANE-AUDIT-02` — dual-plane còn lại ngoài Company NV  

Evidence BA sẵn (đọc bằng **path tuyệt đối** — tránh Glob miss trên workspace OneDrive Unicode/stub):

```text
C:\xevn-ecosystem\docs\qa\evidence\ba-display-hrm-review-01-20260727.md
C:\xevn-ecosystem\docs\qa\evidence\ba-display-xbos-review-01-20260727.md
```

Tương đối (sau `cd C:\xevn-ecosystem`):  
- `docs/qa/evidence/ba-display-hrm-review-01-20260727.md`  
- `docs/qa/evidence/ba-display-xbos-review-01-20260727.md`

> Nếu Glob/Read báo «không thấy» nhưng IDE mở được: **không phải** cloud placeholder (file đã `Archive` local). Nguyên nhân thường = Claude đang mở **workspace stub NFC** hoặc path `Tài liệu\…` sai bản. Fix: `cd C:\xevn-ecosystem` rồi Read absolute path trên.
osystem` rồi Read absolute path trên.
