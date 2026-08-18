# Evidence — PO-HRM-BP-SRS-CHOT-QC-SPOT-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | `PO-HRM-BP-SRS-CHOT-QC-SPOT-01` |
| from_role | qc |
| to_role | pm |
| lane | governance (docs / SRS giấy) |
| ngày | 2026-08-05 |
| ack_status | **PASS_TO_PM** |
| verdict | **GO WITH CONDITIONS** |
| entry evidence | `docs/qa/evidence/po-hrm-bp-srs-chot-01.md` |

## Classification

| Layer | Class | Note |
|-------|-------|------|
| Scope gate | **GOVERNANCE / DOCS** | Spot-check SRS v0.8 chốt — **không** L0–L2.5 product / J-* runtime |
| ENV | N/A | Không chạy stack; không claim product LIVE |
| PRODUCT fidelity | **OPEN (out of scope claim)** | `ready_for_techspec: false` · Attendance / Employees **not CLOSED** · `uat_done: false` |
| Process | PASS (docs) | Entry BA evidence readable; lock + inventory + matrix + PDF opened; pack browser fields N/A |

**Cấm đã giữ:** không claim Attendance CLOSED · không invent Q-* mới · demo ≠ product GO.

## Commands (docs audit)

| Command | Exit / result |
|---------|----------------|
| `node ./scripts/verify-qc-evidence-pack.mjs --evidence docs/qa/evidence/po-hrm-bp-srs-chot-qc-spot-01.md` | pack fields below; browser checks N/A for docs lane |
| `node` + pypdf page/banned extract on `SRS_HRM_ENTERPRISE_KHACH.pdf` | exit **0** — **85** pages · banned pipeline **0** |
| Python FR structure audit on `SRS_HRM_ENTERPRISE.md` | exit **0** — 28 EXPAND/ADD thin=**0** · 16 priority OK · 03e heading **false** |

**Portal URL:** N/A — docs governance only (không browser product tại `http://127.0.0.1:5175` / `:8088`).

**L2.5 / journey:** N/A — docs paper gate; không J-* runtime.

## Spot-check matrix (PM entry)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | EXPAND sheet 03 = FR 7 mục | **PASS** | Script: 28 EXPAND/ADD (`REC-00,04–07` · `CORE-02b,03,05–07,09,10` · `ATT-01,03b,03d,04,04b,05,05b,06,07,12` · `PAY-03,05–09`) — mỗi block đủ 7 mục (`thin count = 0`) |
| 2 | ATT-03d + ATT-05b ADD MVP | **PASS** | `### FR-UC-BP-ATT-03d` · `### FR-UC-BP-ATT-05b` full 7 mục; inventory **EXPAND/ADD MVP**; PDF `ATT-03d`×11 |
| 3 | ATT-03e NOT added | **PASS** | **0** heading `FR-UC-BP-ATT-03e`; inventory stamp **OUT** only — không thân FR |
| 4 | Face mobile-only | **PASS** | SRS § phạm vi + ATT-03 stamp «Face chỉ mobile» / «ứng dụng di động»; PDF: `Face`×9 · `ứng dụng di động`×3 |
| 5 | CORE-04 OUT · ATT-03 GĐ2 · REC-03 OUT | **PASS** | Header + §3.A bảng + stamp trên FR khung; inventory 0.3.4; lock 1 trang khớp |
| 6 | PAY form GĐ1 + kéo-thả GĐ2 | **PASS** | PAY-02 Decision R-PAY-DD-01 · § phạm vi · lock; PDF `kéo-thả`×14 |
| 7 | FY CRUD — no fixed month | **PASS** | ATT-04 + R-FY-01: CRUD tenant · cấm hardcode/fix tháng FY |
| 8 | No wipe 16 priority FR | **PASS** | Cả 16 heading còn: REC-01/01b/02/02b/08 · CORE-01/02/08 · ATT-02/08/09/10/11 · PAY-01/02/04 |
| 9 | no_prompt_echo (khách) | **PASS (bounded)** | PDF: **0** `work_item_id` / `PASS_TO_PM` / `apps/api` / `pnpm` / `@CODE-MEMORY` / `PO-HRM-BP`. MD header có DOC-DELTA nội bộ — chấp nhận trên bản MD; KHACH PDF sạch pipeline |
| 10 | demo ≠ product GO · `ready_for_techspec` false | **PASS** | Lock § Demo + Residual; matrix **1.1.4b** `program_verdict: NOT_READY` · `ready_for_techspec: false` · `uat_done: false` |

## Honesty deltas (PM packet vs artifact)

| PM / BA packet | Artifact (QC re-open 2026-08-05) | QC |
|----------------|----------------------------------|-----|
| PDF **84p** (PM) / **83p** (BA + lock) | PDF **85** pages (`pypdf`) | **OBS** — SoT đo máy = **85**; đồng bộ lock/BA page stamp khi ba-docs rebuild kế |
| Matrix **1.1.4** (PM entry) | **1.1.4b** (SRS landed) | **PASS** — delta đúng hướng chốt |
| Stale «cần khách chốt» (prior soft) | MD + PDF count = **0** | **CLOSED** — C-SRS-CHOT-STALE-QPAY không còn |

## Soft residual (không đủ NO-GO paper)

| ID | Severity | Finding | Owner | Status |
|----|----------|---------|-------|--------|
| **C-SRS-CHOT-STALE-QPAY** | P2 soft | «Q-PAY-FORMULA cần khách chốt» | — | **CLOSED** (re-audit 0 hits MD+PDF) |
| **C-SRS-CHOT-PDF-PAGE-STAMP** | P3 OBS | Lock/BA ghi **83** trang; `pypdf` = **85** | `ba-docs` optional | **OPEN soft** — không chặn paper ACCEPT |
| **C-SRS-CHOT-TOC-NOTE** | P3 OBS | Dòng mở §3 còn mô tả UC bổ sung kiểu ngắn cũ; thân §3.A EXPAND đã đủ 7 mục | `ba-docs` optional | OPEN soft |

## Conditions (bounded)

1. **Paper SRS v0.8 chốt = ACCEPT** cho wave governance này (EXPAND/ADD/OUT/GĐ2 stamps + PDF KHACH + lock + inventory 0.3.4 + matrix 1.1.4b).
2. **KHÔNG** mở TechSpec depth / DB_DESIGN / API_DESIGN coding — `ready_for_techspec` **vẫn false** (blocker = product fidelity stub, không phải thiếu EXPAND).
3. **KHÔNG** claim product GO · Attendance CLOSED · Employees CLOSED · `uat_done` · Phase 1 DONE.
4. Soft: optional đồng bộ stamp số trang PDF (83 vs 85) khi ba-docs rebuild kế — **không** chặn paper ACCEPT nội bộ.
5. Demo giấy ≠ nghiệm thu vận hành (R-DEMO-01 giữ).
6. PM có thể xem xét flip **`ready_for_techspec_docs`** (paper-only) — **không** flip `ready_for_techspec` full.

## Must-not (confirmed)

- Attendance **not CLOSED**
- No new Q-* invented by QC
- No apps/** product claim from this gate

## Residual

| ID | Owner | Note |
|----|-------|------|
| Product fidelity / TechSpec HOLD | pm | `ready_for_techspec: false` · matrix NOT_READY |
| C-SRS-CHOT-PDF-PAGE-STAMP | ba-docs optional | page stamp sync |
| C-SRS-CHOT-TOC-NOTE | ba-docs optional | §3 opener polish |

## completion_report

**Closed:** QC spot-check PO-HRM-BP-SRS-CHOT-QC-SPOT-01 — **GO WITH CONDITIONS** trên phạm vi SRS giấy v0.8 (EXPAND 7 mục · ADD 03d/05b · 03e not added · Face mobile · OUT/GĐ2 stamps · PAY form/kéo-thả · FY CRUD · 16 FR ưu tiên giữ · demo≠GO · techspec false). Soft stale Q-PAY **CLOSED** on re-audit.

**Residual:** PDF page stamp 83 vs 85 (P3 OBS); product fidelity / TechSpec HOLD unchanged; Attendance not CLOSED.

## next_owner

`pm` — intake GWC; optional flip `ready_for_techspec_docs` (paper-only); **không** dispatch TechSpec depth / DB_DESIGN / API_DESIGN cho đến fidelity unlock.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SRS-CHOT-PM-INTAKE-01
from_role: pm
to_role: pm
lane: governance
priority: P1

QC GWC closed — evidence docs/qa/evidence/po-hrm-bp-srs-chot-qc-spot-01.md
Actions:
1) Record paper SRS v0.8 ACCEPT (matrix 1.1.4b · inventory 0.3.4 · lock)
2) Optional: flip ready_for_techspec_docs = paper_only (KHÔNG flip ready_for_techspec full)
3) Optional ba-docs: sync PDF page stamp lock/BA (83→85 pypdf) khi rebuild kế
4) Continue product fidelity lanes (ATT/Employees) — cấm Attendance CLOSED invent · cấm TechSpec S3 depth
ack_status: PASS_TO_PM (meta close)
```

## ack_status

**PASS_TO_PM**
