# Evidence — TEAM Claude domain training (fallback sau CLI fail)

| Meta | Value |
|------|--------|
| **work_item_id** | `TEAM-CLAUDE-DOMAIN-TRAIN-20260804` |
| **date** | 2026-08-04 |
| **note** | Claude Code CLI (`claude -p`) **exit 1** — `API Error: Connection closed mid-response`. Output dưới do **PM+PO** điền đúng packet (cùng SoT) để không mất training; Sponsor có thể re-paste `TEAM_CLAUDE_PASTE_INTO_TERMINAL.txt` khi CLI ổn. |
| **cli_error** | `docs` terminal 279963 · elapsed ~207s |

---

## context_ack

- **Holding vs member:** `ceo@xe.vn` = Group CEO / main; `du-lich.ceo@xe.vn` = CEO CT — clone tập đoàn bị chặn.
- **Dual-plane:** Org UUID vs HRM slug; lệch → list OK / get 404 hoặc `409 SCOPE_CONTEXT_MISMATCH`.
- **Catalog SoT:** XBOS khung tập đoàn; HRM pull/extension — không tự SoT khung nhóm.
- **U65:** Cấm seed; nghiệm thu = FE click path; design 245 ≠ UAT DONE.

---

## quiz_domain (DOMAIN §11)

1. `du-lich.ceo` clone holding → **`403` + `XBOS-AUTH-003`**.
2. Publish/pull = phân phối SoT; clone DM-09 = `POST …/catalog/:key/clone` → `CFG-206` / conflict `CFG-409`; LOG bundle = `clone-bundle` → `CFG-205`/`CFG-009`; apply = `POST …/apply-to-members` → **`CFG-204`** (DM-HRM-07).
3. Leave L2 AS-IS 1 bước = **SPEC_GAP** — cấm invent PASS (`HRM-AT-12`).
4. Ports: hrm-api **`:28001`** · xbos-api **`:28002`** · portal `:5173`/`:5175`.
5. Dual-plane triệu chứng: list 200, get-by-id 404 hoặc 409 scope khi UUID/slug/header lệch.

---

## research_slice — Catalog clone (W3)

| | |
|--|--|
| **spec says** | Sao chép bộ danh mục / bundle LOG có validate + AU |
| **code does** | DM-09 + LOG-09 API+FE wire; browser HP/FD/AU PASS; LOG dest GET sau clone còn residual scope (BE in flight) |
| **gap class** | IMPL residual `R-LOG09-R2-DEST-GET-SCOPE` (P0/P1) · Leave L2 = SPEC_GAP |
| **proposed work_item** | `PO-UC-TC-W3-BE-LOG09-SCOPE` (đã DISPATCHED) → QA retest dest reload |

---

## specificity_self_score

**SPECIFIC** (path + mã lỗi + persona + ports).  
CLI Claude **FAIL** — evidence này = fallback SoT-aligned, không thay phiên Claude live khi Sponsor re-run paste.

---

---

## DOC-DELTA — CLI late success (terminal 279964)

| Meta | Value |
|------|--------|
| **cli** | `claude -p` exit **0** · ~671s · sau lần fail 279963 |
| **CLI self-report** | Đủ 4 mục; `specificity_self_score: **MIXED**` (thiếu commit hash / line resolver) |
| **File on disk** | Nội dung § trên vẫn là **PM fallback SPECIFIC** (CLI có thể không ghi đè path Unicode) |
| **ACK** | `team-claude-domain-train-ack.md` — quiz SPECIFIC OK |

*TEAM-CLAUDE-DOMAIN-TRAIN-20260804*
