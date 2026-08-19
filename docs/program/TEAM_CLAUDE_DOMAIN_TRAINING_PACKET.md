# TEAM Claude — Domain + Role training packet (XeVN case study)

| Meta | Value |
|------|--------|
| **Packet ID** | `TEAM-CLAUDE-DOMAIN-TRAIN-20260804` |
| **Mục đích** | Train Claude (terminal / peer) nghiên cứu **đúng bối cảnh XeVN** — không chung chung |
| **Sau khi đọc** | Trả lời quiz + viết research note có evidence path |

---

## Bắt buộc đọc (theo thứ tự)

1. `docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` (**v2** full)
2. `docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md` (**v2**) — §0 + § role bạn đóng
3. `docs/journal/2026-08-04_PO_PM_CONVERSATION_JOURNAL.md` — §A + B8 (locks U65/U86)
4. Neo case: `docs/qa/professional/by-uc/XBOS-DM-09.md` + `docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md`

---

## Vai trò khi research (Claude = PO research assistant)

Bạn **không** sửa `apps/**` trừ khi packet khác giao Dev.

Output bắt buộc trong evidence `docs/qa/evidence/team-claude-domain-train-YYYYMMDD.md`:

```markdown
## context_ack
- holding vs member: …
- dual-plane: …
- catalog SoT: …
- U65: …

## quiz_domain (§11 DOMAIN_NOTES)
1. …
2. …
3. …
4. …
5. …

## research_slice (chọn 1: Leave L2 | Catalog clone | UC-HRM-27)
- spec says / code does
- gap class: SPEC_GAP | IMPL_GAP | HOLD | NONE
- proposed work_item_id (không tự code)

## specificity_self_score
SPECIFIC | MIXED | GENERIC
# SPECIFIC = có path file, mã lỗi, persona, bước
```

**FAIL** nếu chỉ viết «cần multi-company approval matrix / SOLID».

---

## Locks

- U65 zero-seed · không claim UAT/Phase1 DONE  
- Leave L2 = SPEC_GAP — không invent PASS  
- DM-09 ≠ LOG-09 ≠ apply-to-members  

---

*Paste terminal: xem `TEAM_CLAUDE_PASTE_INTO_TERMINAL.txt` khối DOMAIN-TRAIN.*
