# BA-HRM-BRD-SRS-BATECO-W1-01 — Evidence

**work_item_id:** `BA-HRM-BRD-SRS-BATECO-W1-01`  
**from_role:** ba-docs · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

Remaster BRD + SRS HRM theo `_vibe-team-os/13` §3.4 (7 mục FR, Diễn biến cân bằng, §3.4.6 Kết quả trả về, §3.4.8 skeleton) **trước** TechSpec/code. ADD-only; **cấm wipe** AC-ATT-SHEET / UF-HRM-16 🟢.

## 2. SoT path decision (deliverable 5)

| Bản | Path | Quyết định |
|-----|------|------------|
| **Khách (SoT gửi đối tác)** | `docs/client-delivery/hrm/BRD_HRM_KHACH.md` · `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | **Chọn tách** — skeleton Bateco sạch, không HTTP/jargon |
| **Đội ngũ (annex)** | `docs/hrm/BRD.md` · `docs/hrm/SRS.md` | Giữ nguyên delta kỹ thuật + **AC-ATT-SHEET-01..06**; pointer W1 lên đầu file |

**Lý do không đè `docs/hrm/SRS.md`:** file hiện là SRS kỹ thuật nội bộ (API/ADR); remaster in-place rủi ro mất AC bảng công đã khóa.

## 3. Deliverables checklist

| # | Deliverable | Path / kết quả |
|---|-------------|----------------|
| 1 | BRD khách Yêu cầu-N + Quy tắc | `BRD_HRM_KHACH.md` — map Yêu cầu-06/09/10/13/14/15/17… theo freeze 01..30 |
| 2 | SRS khách Ch.1–6 **trong body** | `SRS_HRM_KHACH.md` — `## 1.` … `## 6.` đều có |
| 3 | E2E spine bảng trước catalog FR | §2.4.1–2.4.4 |
| 4 | 8 FR spine đủ 7 mục + Kết quả trả về | EM-01 · CI-01 · CI-02 · AT-14 · AT-10 · PR-05 · RC-01 · SC-01 |
| 5 | Giữ AC-ATT-SHEET | FR-HRM-AT-14 bảng AC-01..06 + team `SRS.md` không wipe |
| 6 | Freeze inventory trước W2 | `docs/hrm/UC_INVENTORY_BRD_SRS.md` cập nhật W1a |
| 7 | Team pointer | `docs/hrm/BRD.md` / `SRS.md` đầu file + §7.1 status spine |

## 4. Gate §3.4.8 (skeleton)

| Check | Result |
|-------|--------|
| Body có `## 4.` `## 5.` `## 6.` | **PASS** |
| E2E spine trước FR | **PASS** |
| Số «Mã UC» = số «Kết quả trả về» (spine W1) | **8 = 8 PASS** |
| Stub «Người dùng mở:» | **0 PASS** |
| Prompt-echo Sponsor trong body khách | **PASS** (không stamp chat/work_item trong narrative FR) |
| Giảm UC/AC khóa | **PASS** — 120 UC · 30 Yêu cầu · AC-ATT-SHEET giữ |

## 5. Spot-check FR (mẫu)

| FR | Meta | Đầu vào | Luồng ≥4 | BR | sequence | Diễn biến cân bằng | Kết quả trả về |
|----|------|---------|----------|-----|----------|--------------------|----------------|
| FR-HRM-AT-14 | P | P | P | P + AC | P | P (auth≤2; success≥40%; fail sâu≥30%) | P |
| FR-HRM-EM-01 | P | P | P | P | P | P | P |
| FR-HRM-CI-01 | P | P | P | P | P | P | P |

## 6. completion_report

| Đóng | Residual / mở |
|------|----------------|
| Skeleton Bateco khách Ch.1–6 + E2E | W2: FR đồng nhất cho ~20 Yêu cầu còn `planned_W2` |
| 8 FR spine W1 + inventory freeze | Supporting UC (EM-02..05, PR-01..04, RC-03..06…) |
| SoT path tách khách/team | HTML build khách (nếu PM yêu cầu wave riêng) |
| AC-ATT-SHEET không bị rút | SA TechSpec `ref_srs` → FR khách + annex team |

**Không** claim Phase 1 / PROD.

## 7. Handoff

- **next_owner:** `ba-docs` (W2 catalog) **và** `sa` (TechSpec align) — PM chọn song song sau W1 PASS  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/ba-hrm-brd-srs-bateco-w1-01-20260721.md`

### next_dispatch_prompt (copy-ready) — W2 catalog

```text
work_item_id: BA-HRM-SRS-BATECO-W2-CATALOG-01
from_role: pm
to_role: ba-docs
lane: governance
entry_criteria: W1 PASS — docs/client-delivery/hrm/SRS_HRM_KHACH.md Ch.1–6; UC_INVENTORY_BRD_SRS.md freeze; cấm wipe AC-ATT-SHEET
exit_criteria: ADD FR 7 mục + Kết quả trả về cho primary còn planned_W2 (ưu tiên Cao: SCOPE, UC-HRM-02..08, AT-01..03, UC-HRM-09, PR còn lại, RC còn lại, MD, SC còn lại…); số Mã UC = số Kết quả trả về; inventory status cập nhật; không giảm 120 UC / 30 Yêu cầu
evidence_path: docs/qa/evidence/ba-hrm-srs-bateco-w2-catalog-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: wipe · seed · apps/** · prompt-echo
```

### next_dispatch_prompt (copy-ready) — SA TechSpec

```text
work_item_id: SA-HRM-TECHSPEC-ALIGN-W3-01
from_role: pm
to_role: sa
lane: governance
entry_criteria: SRS_HRM_KHACH.md FR spine W1; TECHSPEC.md hiện có; inventory freeze
exit_criteria: Mỗi UC spine có ref_srs → FR khách; OpenAPI/DTO khớp Kết quả trả về; không mâu thuẫn AC-ATT-SHEET; ghi gap nếu thiếu contract
evidence_path: docs/qa/evidence/sa-hrm-techspec-align-w3-01-YYYYMMDD.md
ack_status: PASS_TO_PM | READY_FOR_DEV
```

### pm_dispatch_hint

Ưu tiên **W2 ba-docs** nếu cần đủ catalog trước gửi khách; **SA W3** có thể chạy song song trên spine W1 (AT-14 / EM / CI đã đủ Kết quả trả về).
