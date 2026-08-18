# QC-HRM-SPEC-REMASTER-SKELETON-GATE-01 — Gate evidence

**work_item_id:** `QC-HRM-SPEC-REMASTER-SKELETON-GATE-01`  
**from_role:** qc · **to_role:** pm  
**lane:** governance (docs-only)  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`  
**verdict:** **GO WITH CONDITIONS**

## 1. Mandate

Audit skeleton SRS khách HRM theo `_vibe-team-os/13` **§3.4.8** sau W1 + W2a + W2b.  
**Cấm:** Phase1/PROD claim · claim 120 UC done · wipe AC-ATT-SHEET / FR đã khóa.  
**Cho phép GWC:** residual `planned_W2` Cao = 4 (YC-22/23/24/28).

## 2. Entry criteria (đã đối chiếu)

| Nguồn | Path | Kết quả |
|-------|------|---------|
| W1 | `docs/qa/evidence/ba-hrm-brd-srs-bateco-w1-01-20260721.md` | PASS — Ch.1–6 + 8 FR spine |
| W2a | `docs/qa/evidence/ba-hrm-srs-bateco-w2-catalog-01-20260721.md` | PASS — +12 FR → 20 |
| W2b | `docs/qa/evidence/ba-hrm-srs-bateco-w2b-catalog-01-20260721.md` | PASS — +12 FR → **32** |
| SoT SRS | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **v3.0-W2b** | Có |
| SoT BRD | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` **v3.0** | Có |
| Inventory freeze | `docs/hrm/UC_INVENTORY_BRD_SRS.md` | Có — 30 Yêu cầu / 120 UC |

## 3. Gate §3.4.8 — machine checks

| Check | Observed | Verdict |
|-------|----------|---------|
| Body `## 1.` … `## 6.` | Ch.1–6 đều có nội dung (NFR §4, Giao diện §5, Ràng buộc §6) | **PASS** |
| E2E spine trước catalog FR | §2.4.1–2.4.6 (W1 + W2a + W2b order) | **PASS** |
| FR heading §3.x | **32** (`### 3.1` … `### 3.32`) | **PASS** |
| Metadata `| Mã UC |` trong FR body | **32** (loại 3 header cột E2E §2.4.4–2.4.6) | **PASS** |
| `**Kết quả trả về khi thành công**` | **32** | **PASS** |
| Mã UC FR = Kết quả trả về | **32 = 32** | **PASS** |
| Stub `Người dùng mở:` | **0** | **PASS** |
| Prompt-echo Sponsor / work_item trong body khách | 0 hit (`work_item`, `Sponsor 2026`, `PASS_TO_PM`, `ba-docs`, `wipe`, jargon HTTP/`tenant_id`) | **PASS** |
| Yêu cầu-N / 120 UC không giảm | Inventory 30 / 120; SRS §6 xác nhận catalog 120 còn hiệu lực | **PASS** |
| AC-ATT-SHEET-01..06 trên FR-HRM-AT-14 | Giữ đủ 01..06 + BR-ATT-SHEET | **PASS** |

## 4. Spot-check FR quality (≥3 — gồm AT-14 + W2b)

| FR | Meta+Mã UC | Đầu vào | Luồng ≥4 | Quy tắc | sequence | Diễn biến cân bằng | Kết quả trả về (§3.4.6) |
|----|------------|---------|----------|---------|----------|--------------------|-------------------------|
| **FR-HRM-AT-14** | P | P | P (5 bước) | P + AC-01..06 | P | P — auth≤2; success ≥40%; fail sâu (kỳ sai/trùng/empty/storm) ≥30% | P — 5 ý đầy đủ |
| **FR-HRM-SCOPE-01** | P | P | P | P | P | P — fail phạm vi/empty/chi tiết ngoài | P |
| **FR-HRM-MD-01** | P | P | P | P | P | P — danh mục hết HL / thiếu bắt buộc / ngoài phạm vi | P |

**Kết luận spot-check:** mẫu W1 khóa + mẫu W2b đạt chuẩn 7 mục + §3.4.6. Không stub menu.

## 5. Inventory / residual (GWC)

| Metric | Giá trị |
|--------|---------|
| body_ready (Yêu cầu) | **21** |
| planned_W2 (Yêu cầu) | **9** |
| planned_W2 **Cao** còn | **4** — YC-**22** (embed 20..27), **23** (MOB), **24** (INT), **28** (residual UC-HRM-11) |
| FR khách đủ 7 mục | **32** (không = 120 UC) |

Residual Cao = 4 được **chấp nhận làm điều kiện GWC** theo dispatch PM (không NO-GO skeleton).

### 5.1 Soft process notes (không hạ skeleton PASS)

| ID | Note | Severity |
|----|------|----------|
| N1 | `BRD_HRM_KHACH.md` §6 vẫn ghi một số Yêu cầu-03/05/12 là «batch sau» trong khi W2b đã có FR — lệch sync BRD khách vs SRS | P2 polish |
| N2 | Inventory §3 bảng skeleton vẫn ghi «20 FR (W1+W2a)» trong khi §2/§6.3 = **32** — cập nhật wording | P2 polish |

## 6. Classification

| Layer | Scope | Product impact |
|-------|-------|----------------|
| Docs / governance | Skeleton Ch.1–6 + 32 FR remaster | **Không** mở code / deploy |
| Residual Cao | Catalog W2c | Chặn «đủ Cao gửi khách full» nếu Sponsor yêu cầu đủ YC-22/23/24/28 |

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** 120 UC body_ready.

## 7. Verdict

### GO WITH CONDITIONS

**GO** cho: skeleton Bateco Ch.1–6; đếm Mã UC = Kết quả trả về = 32; stub = 0; sample FR (AT-14 / SCOPE-01 / MD-01) đạt; inventory freeze không giảm 30/120; AC-ATT-SHEET không bị rút; entry W1+W2a+W2b hợp lệ.

**CONDITIONS (mở — owner rõ):**

| Condition | Owner | Trigger đóng |
|-----------|-------|--------------|
| **C-SKEL-01** planned_W2 Cao = 4 (YC-22/23/24/28) | ba-docs W2c | ADD FR batch Cao; inventory Cao residual → 0 hoặc waiver Sponsor |
| **C-SKEL-02** Không claim Phase1 / PROD / 120 UC done | pm | Standing đến program exit W5 đầy đủ |
| **C-SKEL-03** (optional P2) Sync BRD §6 + inventory §3 wording với 32 FR | ba-docs | Cùng W2c hoặc polish nhỏ |

## 8. completion_report

| Đóng | Residual |
|------|----------|
| QC skeleton §3.4.8 trên `SRS_HRM_KHACH.md` v3.0-W2b | C-SKEL-01 Cao×4; C-SKEL-02 standing; N1/N2 polish |
| Prior audit skeleton FAIL (program) → **supersede** bằng GWC này cho phạm vi 32 FR | W3 SA TechSpec `ref_srs`; HTML khách nếu Sponsor yêu cầu |

## 9. Handoff

- **next_owner:** `pm`  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-01-20260721.md`

### next_dispatch_prompt (copy-ready) — W2c Cao residual

```text
work_item_id: BA-HRM-SRS-BATECO-W2C-CATALOG-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P1
entry_criteria: QC GWC — docs/qa/evidence/qc-hrm-spec-remaster-skeleton-gate-01-20260721.md; planned_W2 Cao=4 (YC-22/23/24/28); SRS_HRM_KHACH.md 32 FR giữ nguyên
exit_criteria: ADD ≥8 FR Cao còn lại (ưu tiên UC-HRM-INT-01..04, UC-HRM-11, embed slice, MOB slice tối thiểu); inventory Cao residual cập nhật; optional sync BRD §6 + inventory §3 wording; không wipe W1/W2a/W2b / AC-ATT-SHEET; không claim 120 UC done
evidence_path: docs/qa/evidence/ba-hrm-srs-bateco-w2c-catalog-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe · apps/** · Phase1/PROD claim
```

### next_dispatch_prompt (copy-ready) — SA TechSpec W3 (song song được)

```text
work_item_id: SA-HRM-TECHSPEC-ALIGN-W3-01
from_role: pm
to_role: sa
lane: governance
entry_criteria: QC skeleton GWC trên 32 FR; SRS_HRM_KHACH.md v3.0-W2b; TECHSPEC.md hiện có; inventory freeze
exit_criteria: Mỗi UC spine + batch W2a/W2b có ref_srs → FR khách; OpenAPI/DTO khớp Kết quả trả về; không mâu thuẫn AC-ATT-SHEET; ghi gap leftover Cao
evidence_path: docs/qa/evidence/sa-hrm-techspec-align-w3-01-YYYYMMDD.md
ack_status: PASS_TO_PM | READY_FOR_DEV
cấm: apps/** code trước Sponsor/confirm TechSpec · wipe SRS khách
```

### pm_dispatch_hint

Ưu tiên **W2c ba-docs** nếu Sponsor cần đủ Cao trước gửi; **SA W3** có thể chạy song song trên 32 FR đã GWC skeleton.
