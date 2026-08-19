# BA-UI-SPEC-SRS-FIRST-SYNC-01 — Đồng bộ SRS-first · UI spec · phụ lục Named Field

| Meta | Value |
|------|--------|
| **work_item_id** | `BA-UI-SPEC-SRS-FIRST-SYNC-01` |
| **Ngày** | 2026-08-10 |
| **Owner** | BA-Process |
| **ack_status** | `PASS_TO_PM` |
| **Sponsor lock** | Enterprise UI_UX + Named Field phụ lục = **reference only**; nghiệp vụ = SRS/API/TechSpec |

---

## 1. Phạm vi đã đóng

| # | Deliverable | Path | Kết quả |
|---|-------------|------|---------|
| T1 | Delta **SoT vs reference** (mobile khung) | `docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md` §1.1 | Bảng SoT/tham khảo · link `docs/reference/README.md` · OS 37 · PAT CC pointer |
| T2 | Index reference ngắn | `docs/reference/README.md` | Neo → sponsor README · SUMMARY · OS 37 |
| T3 | Tóm tắt Named Field MOD-CON | `docs/reference/PHU_LUC_NAMED_FIELD_SCHEMA_MOD_CON.SUMMARY.md` | Không prompt-echo · link `API_DESIGN_HRM_CONTRACTS_INS` · template F.1 |
| T4 | Doctrine OS (SRS-first) | `_vibe-team-os/37-UI-SCREEN-SPEC-SRS-FIRST-AND-REFERENCE.md` | Tạo mới — trước chỉ pointer trên README sponsor |
| T5 | JD master list PAT + dialog | `docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md` | PAT-DIALOG-FULL-VIEWPORT-CC-01 · list→`JdTemplateWriterDialog` · AC 5 CC viewport |

**Không đụng:** `apps/**` · seed · SRS khách full remaster.

---

## 2. Quy tắc nghiệp vụ (tóm tắt handoff)

| Rule | Mô tả |
|------|--------|
| R-SRS-01 | Mọi field/luồng mới MOD-CON/JD/CTR phải có bước Diễn biến SRS + API_DESIGN trước UI_SCREEN_SPEC |
| R-REF-01 | File trong `docs/reference/` (trừ SUMMARY) không được cite làm AC PASS |
| R-NF-01 | Named Field = `field_key`/token theo API; cấm generic `field_schema` SoT trên FE |
| R-JD-01 | Thư viện JD: mutate chỉ trong Dialog full viewport; `jd-dynamic` chỉ CFG |
| R-CC-01 | QA embed CC: dialog ≥85% width · parent portal · FAIL nếu iframe-kẹt |

---

## 3. Handoff Dev / QA

| Role | Việc kế | Entry | Exit |
|------|---------|-------|------|
| **dev-fe** | `PO-HRM-SETTINGS-JD-MASTER-TAB-FE-01` | Tab `jd-master-list` + writer dialog PAT | AC §7 `UI-SETTINGS-JD-MASTER-LIST.md` · U65 |
| **dev-fe** | CTR template composer (đã P0) | `UI-SETTINGS-CTR-TEMPLATE-COMPOSER.md` + SUMMARY NF khi preview | Dialog composer + preview token bind |
| **qa** | Settings fidelity retest | `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01` | J-HRM-JD-05 · PAT CC row 5–7 JD spec |
| **sa** | (optional) Named Field inventory | SUMMARY §4 nếu cần F.1 delta preview token | Không block sync này |

---

## 4. Residual

| ID | Mô tả | Owner |
|----|--------|-------|
| R-01 | Bản Desktop đầy đủ `PHU_LUC_NAMED_FIELD_SCHEMA_MOD_CON.md` chưa copy vào repo | Sponsor sync khi cập nhật |
| R-02 | Danh sách `field_key` đầy đủ MOD-CON — chưa inventory trong SUMMARY (by design) | ba-data + wave CTR |
| R-03 | Tab `jd-master-list` vẫn **C-ORPHAN-SCREEN** trong nav — spec only | dev-fe |

---

## 5. Traceability

- Web guide §0: `docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md` (đã align OS 37)
- Settings delta: `docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` row `jd-master-list`
- PAT: `docs/hrm/ui-screens/PAT-DIALOG-FULL-VIEWPORT-CC-01.md` (đã liệt kê `JdTemplateWriterDialog`)

---

## completion_report

Đã delta §1.1 SoT vs reference trên mobile UI spec; tạo index `docs/reference/README.md`, SUMMARY Named Field, OS doc 37, và nâng `UI-SETTINGS-JD-MASTER-LIST` lên PAT full viewport + list→writer Dialog. Không sửa product code.

## next_owner

`pm` (dispatch `PO-HRM-SETTINGS-JD-MASTER-TAB-FE-01` / fidelity wave) · `dev-fe` execution.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-JD-MASTER-TAB-FE-01
role: dev-fe
read_first:
  - docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md
  - docs/hrm/ui-screens/PAT-DIALOG-FULL-VIEWPORT-CC-01.md
  - docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md §7–11
  - docs/program/specs/PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md (jd-master-list P0)
entry_criteria: BA-UI-SPEC-SRS-FIRST-SYNC-01 PASS; spec PAT dialog + list-only locked
exit_criteria: Tab «Thư viện JD» trong settingsNavigation; JdTemplateWriterDialog parent portal 90vw/90vh; AC §7 rows 1–7 PASS; FE-after-2xx+F5; không composer Card orphan; U65
evidence_path: docs/qa/evidence/po-hrm-settings-jd-master-fe-01.md
ack_status target: READY_FOR_QA
```

## evidence_path

`docs/program/specs/BA-UI-SPEC-SRS-FIRST-SYNC-01.md`

## ack_status

**PASS_TO_PM**
