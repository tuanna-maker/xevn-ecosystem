# Evidence — PO-TRAIN-VALIDATE-BA-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-TRAIN-VALIDATE-BA-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **docs_read** | `PO_PM_SENIOR_TRAINING_PACK_20260804.md` §0, §2, §12 Q-BA · `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §1, §3, §4.2, §4.7, §7, §11 |
| **apps_touched** | **none** (governance only) |
| **uat_done** | **false** (doc validation — not product UAT) |

---

## Q-BA (câu trả lời cụ thể)

### 1. UC-HRM-27: SoT file? `/reports` thuộc UC? Verdict W3?

| Hạng mục | Trả lời cụ thể |
|----------|----------------|
| **SoT file** | `docs/hrm/SRS.md` — mục **UC-HRM-27** (Embed: quyết định nhân sự). Training §2.2 bước 1 + §2.4; Domain §4.7. Cross-check: `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` STT **104**; by-uc `docs/qa/professional/by-uc/UC-HRM-27.md`. |
| **`/reports` thuộc UC-HRM-27?** | **Không.** SoT = **quyết định only**; `/reports` = UC/menu **OUT** (SRS: «Sub-module Báo cáo (`/reports`) thuộc UC/menu khác»). Training §2.4; Domain §4.7. |
| **Verdict W3** | **`BACKLOG-HOLD`** (không Dev rewrite greenfield / false GAP). Evidence neo: `docs/qa/evidence/po-uc-tc-w3-ba-hrm27.md`. Training §1.3 + §2.4; Domain §4.7 + §7. `code_readiness` honest = **PARTIAL** (không claim GAP khi FE+BE decisions live). |

### 2. 3 bước checklist trước khi chốt SPEC_GAP

Trích **§2.2 Checklist hành động** (`PO_PM_SENIOR_TRAINING_PACK_20260804.md`) — **bắt buộc theo thứ tự**; chốt verdict (`SPEC_GAP` nằm trong **bước 7**). Ba bước **cốt lõi ngay trước** khi được chốt SPEC_GAP (đủ «spec says / code does»):

| # checklist | Việc (trích training) | Output bắt buộc |
|-------------|----------------------|-----------------|
| **Bước 1** | Mở SRS SoT đúng module | Path + § + UC-ID |
| **Bước 5** | Grep AS-IS **read-only** (route/API) | «code does» 3–8 dòng |
| **Bước 6** | Viết bảng **spec says / code does** | Mỗi lệch 1 row → **rồi mới** bước 7 chốt `SPEC_GAP` (hoặc SHIP-NOW / BACKLOG-HOLD / READY_FOR_DEV) |

> Ghi chú nghiệm thu: §12 Q-BA hỏi «3 bước» nhưng bảng §2.2 có **10** bước; ba bước trên = cổng so sánh bắt buộc trước SPEC_GAP (Inject §2.5 cũng bắt SRS → AS-IS → bảng → verdict). Bước 2–4 (bang tong hop / TechSpec / by-uc) vẫn bắt buộc trong checklist đầy đủ — không bỏ khi triage thật.

### 3. Leave L2: được invent PASS không — vì sao?

| | |
|--|--|
| **Được invent PASS?** | **Không.** |
| **Vì sao (training)** | §2.4: «Invent L2 leave PASS» = **sai**; Leave ladder = **SPEC_GAP riêng** — không gộp / không bịa PASS. |
| **Vì sao (domain)** | §3.1: enterprise kỳ vọng L1→L2; AS-IS Leave nhiều nơi **1 bước** → **SPEC_GAP ladder — cấm invent PASS L2**. §4.2: L2 ladder · AS-IS 1 bước → SPEC_GAP · exemplar `UC-FR-H03_LEAVE`. |

---

## Domain quiz (2 câu)

### 4. `du-lich.ceo` gọi clone holding — kỳ vọng?

| Kỳ vọng | Nguồn |
|---------|--------|
| **Bị chặn** thao tác clone catalog tập đoàn | Domain §1.1 (CEO CT thành viên chỉ CT mình); §1.5 ladder: member → **403/409** nếu gọi rollup/clone tập đoàn |
| Mã lỗi AU chuẩn case W3 | Domain §2.2: member JWT → **`XBOS-AUTH-003`**; §3.3 persona: `du-lich.ceo@xe.vn` = AU scope hẹp, **403 clone tập đoàn** |
| Persona test | Holding clone = `ceo@xe.vn`; AU negative = `du-lich.ceo@xe.vn` |

**Tóm tắt vận hành:** expect **fail AU** (403 + `XBOS-AUTH-003`), **không** 2xx clone holding.

### 5. Inbox trống + U65 — BA/QA làm gì?

| Role | Việc đúng | Cấm |
|------|-----------|-----|
| **QA** | Verdict **🟡 BLOCKED** (hoặc ⬜) + ghi «cần tạo nguồn từ FE trước»; hoặc chạy chuỗi FE đầy đủ: Tạo/cấu hình UI → Lưu 2xx → Inbox có task → Duyệt (Domain §3.2) | `pnpm seed:workflow:inbox` / seed bất kỳ để «có task» rồi bấm Duyệt (U65 · Domain §3.1) |
| **BA** | AC/precond TC **không** giả định seed inbox UAT (Training §2.3); nếu ladder/WF thiếu → ghi **SPEC_GAP** / BLOCKED + `trigger_to_reopen`, **không** invent PASS duyệt | Invent PASS khi Inbox trống; bảo Dev/QA seed |

---

## specificity_self_score

**SPECIFIC**

- Mỗi câu có path file, số bước checklist, verdict W3 (`BACKLOG-HOLD`), mã lỗi AU (`XBOS-AUTH-003`), và cấm U65 cụ thể.
- Không trả lời slogan («business first / SOLID»).

---

## doc_verdict

**PASS_DOC**

Training pack v2 + Domain notes v2 đủ để BA trả lời Q-BA và quiz domain với path/verdict/bước số.

### Chỗ còn hơi chung (không đủ để NEEDS_MORE_DETAIL)

| Chỗ | Ghi chú | Gợi ý PM (optional polish — không block PASS_DOC) |
|-----|---------|-----------------------------------------------------|
| §12 Q-BA #2 «3 bước checklist» | Không gắn số bước 1/5/6 vs 1–3 trong quiz | Vá 1 dòng §12: *«Trả lời bằng số bước §2.2 (khuyến nghị 1+5+6 trước SPEC_GAP)»* |
| §12 Q-BA | Không có câu Leave L2 (mission bổ sung từ Domain §3/§4.2) | Optional: thêm Q-BA #3 Leave L2 vào §12 cho khớp mission validate |
| Domain §11 quiz #1 | «kỳ vọng?» không ghi sẵn `XBOS-AUTH-003` trong câu hỏi | Đã có ở §2.2 — đủ; không MISSING_IN_DOC |

**MISSING_IN_DOC:** không (mọi câu mission trả lời được từ 2 file + cross-check SRS/evidence W3).

---

## completion_report

| Closed | Residual |
|--------|----------|
| Đọc FULL training §0/§2/§12 Q-BA + domain §1/§3/§4.2/§4.7/§7/§11 | Optional polish §12 Q-BA #2 gắn số bước (không block) |
| Trả lời đủ Q-BA 1–3 + domain quiz 4–5 trong evidence này | Không sửa apps |
| `specificity_self_score: SPECIFIC` · `doc_verdict: PASS_DOC` | `uat_done: false` (đúng — chỉ nghiệm thu tài liệu) |

---

## Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-train-validate-ba-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-TRAIN-VALIDATE-BA-01-INTAKE
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM

BA-Process đã nghiệm thu training docs:
- evidence: docs/qa/evidence/po-train-validate-ba-01.md
- specificity_self_score: SPECIFIC
- doc_verdict: PASS_DOC (không NEEDS_MORE_DETAIL)

Tóm tắt Q-BA đã khóa:
1) UC-HRM-27 SoT = docs/hrm/SRS.md UC-HRM-27; /reports OUT; W3 = BACKLOG-HOLD
2) Trước SPEC_GAP: §2.2 bước 1 (SRS SoT) + 5 (AS-IS) + 6 (spec says/code does) rồi mới bước 7
3) Leave L2: cấm invent PASS — AS-IS 1 bước = SPEC_GAP ladder
4) du-lich.ceo clone holding → 403 + XBOS-AUTH-003
5) Inbox trống + U65 → QA 🟡 BLOCKED / tạo từ FE; cấm seed inbox

PM làm tiếp (cùng phiên nếu còn queue validate role khác):
- Intake evidence này trên bus
- Nếu đang chạy wave validate đa role: Task role kế (sa / qa / …) với §12 quiz tương ứng
- Optional polish (không P0): vá TRAINING §12 Q-BA #2 một dòng gắn số bước §2.2 1+5+6
- Cấm: sửa apps/**; claim UAT từ doc validation
```
