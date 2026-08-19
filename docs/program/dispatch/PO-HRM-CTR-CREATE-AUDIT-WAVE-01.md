# Dispatch — CTR create: audit nghiệp vụ + UI/UX (không revert · cấm tưởng tượng)

| Meta | Value |
|------|--------|
| **Date** | 2026-08-10 |
| **Sponsor lock** | **Không revert** code hiện tại · members **check lại** nghiệp vụ + thực trạng UI · thiếu yêu cầu **hỏi sponsor** · **cấm** bịa AC/field/flow |
| **Parent** | `PO_HRM_CTR_CREATE_REDESIGN_SPONSOR_INTAKE.md` · `PO-HRM-CTR-CREATE-REDESIGN-BA-01.md` · `PO-HRM-CTR-CREATE-REDESIGN-SA-01.md` |
| **Incident** | `docs/program/incidents/INC-PM-COMPOSER-DIRECT-CODE-CTR-UX-20260810.md` |

## Mục tiêu wave

Một báo cáo **AS-IS vs TO-BE đã chốt trong spec** + danh sách **OPEN cần sponsor trả lời** — **chưa** implement wave fix.

## SoT đọc trước (bắt buộc — không đoán)

| # | Artifact |
|---|----------|
| 1 | `docs/program/PO_HRM_CTR_CREATE_REDESIGN_SPONSOR_INTAKE.md` |
| 2 | `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-01.md` (O1–O15, AC-CTR-UX-01, J-HRM-CTR-CREATE-01..08) |
| 3 | `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-01.md` |
| 4 | Evidence QC/QA slice: `docs/qa/evidence/po-hrm-ctr-create-redesign-qc-02.md`, `qa-02.md`, `qa-01.md` |
| 5 | AMIS parity (chỉ cite): `docs/qa/evidence/po-hrm-amis-parity-ba-01.md` |
| 6 | Excel/X.E (chỉ cite field): `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` |

## Phản hồi sponsor đã ghi nhận (fact — không mở rộng)

- UI/UX **chưa đạt**: popup **không full màn** CC; form/chữ/layout/scroll; tab bước 2; NV select (UUID dài) vs search; thiếu mẫu active / không sang bước 2.
- Nghiệp vụ **chưa đạt**: điều khoản kéo-thả / **Gỡ**; SRS chưa cập nhật cho thay đổi thực tế; QA/QC slice không thay nghiệm thu sponsor.
- Process: PM đã sửa FE ngoài lane — draft **giữ nguyên**, coi **unverified**.

## Cấm (sponsor lock)

| Cấm | Vì sao |
|-----|--------|
| Revert / “làm lại từ đầu” trừ sponsor yêu cầu | Sponsor: **không cần revert** |
| Thêm field/flow không có trong intake + BA-01 + lời sponsor chat | **Cấm tưởng tượng** |
| Claim PASS/UAT/module GO | `contracts_printable_ready=false` · C-SLICE |
| Seed / API mutate ngoài FE cho QA | U65 |

---

## Task 1 — `ba-process` · `PO-HRM-CTR-CREATE-AUDIT-BA-01`

**Entry:** File dispatch này.

**Exit:**

1. Bảng **Gap audit** (markdown):

| ID | Nguồn (intake/BA-01/O#/sponsor quote) | AS-IS (chỉ từ QA/Dev cite evidence) | TO-BE trong spec | Trạng thái |
|----|----------------------------------------|----------------------------------------|------------------|------------|
| G-* | … | … | … | **CONFIRMED-GAP** / **SPEC-SILENT** / **NEED-SPONSOR** |

2. **`NEED-SPONSOR-QUESTIONS.md`** (≤12 câu, tiếng Việt, mỗi câu **multiple choice hoặc yes/no** — không câu mở “làm đẹp hơn”). Chỉ hỏi chỗ **SPEC-SILENT** hoặc mâu thuẫn sponsor vs BA-01.

3. **Không** sửa `apps/**`. Delta SRS chỉ **outline** section cần ADD — file `PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` **DRAFT** chờ sponsor trả lời câu hỏi.

**Evidence:** `docs/qa/evidence/po-hrm-ctr-create-audit-ba-01.md`

**ack_status:** `PASS_TO_PM`

---

## Task 2 — `qa` · `PO-HRM-CTR-CREATE-AUDIT-QA-01`

**Entry:** L0 `pnpm run qc:dev-stack` exit 0 (agent chạy).

**Exit:** Browser **U65** trên URL sponsor:

- `http://localhost:5173/command-center/hrm/contracts` (hoặc `:8088` nếu stack pilot — **ghi rõ** URL dùng)
- Persona: `ceo@xe.vn` / `Xevn@2026`

**Ma trận (mỗi dòng FAIL/BLOCKED + screenshot path):**

| Check | Ref BA-01 | PASS/FAIL/BLOCKED | Ghi chú quan sát (fact) |
|-------|-----------|-------------------|-------------------------|
| Dialog full viewport CC | O1 / TECHSPEC §4.1 | | |
| Số/tên HĐ vị trí | O2 / intake AMIS | | |
| NV picker (search vs UUID) | O3 | | |
| Mẫu active + Tiếp/tab bước 2 | O4–O5 | | |
| Bước 2 DnD / Thêm / Gỡ | O6–O7 | | |
| Console pangea/DnD errors | QA-01 lesson | | |

**Cấm:** PASS tổng; seed; chỉ API.

**Evidence:** `docs/qa/evidence/po-hrm-ctr-create-audit-qa-01.md` + folder screenshots.

**ack_status:** `PASS_TO_PM`

---

## Task 3 — `dev-fe` · `PO-HRM-CTR-CREATE-AUDIT-FE-01`

**Entry:** QA audit file tồn tại **hoặc** chạy song song; đọc `apps/web/hrm` wizard **hiện tại** (kể cả untracked).

**Exit:** **`spec says / code does`** (bảng, cite file:line):

- Portal create dialog (`portalScope`, className) vs TECHSPEC §4.1 comment
- Stepper tab vs nút Tiếp vs `goStep2` / `templateCode` gate
- Employee control: Select vs CatalogSearchPicker
- Step2 DnD: DragDropContext scope, draggableId, `sameNodeDragBind`

**Không** commit fix trong wave audit. Nếu có hypothesis fix → cột **“đề xuất — cần BA/sponsor”**, không implement.

**Evidence:** `docs/qa/evidence/po-hrm-ctr-create-audit-fe-01.md`

**ack_status:** `PASS_TO_PM`

---

## Task 4 — `sa` · `PO-HRM-CTR-CREATE-AUDIT-SA-01` (hẹp)

**Entry:** FE audit + QA screenshot popup iframe.

**Exit:** 1 trang **Option** (không chọn thay sponsor):

- A: parent portal full CC + DnD (`hrmDialogPortal` sync) — cite ADR/TECHSPEC
- B: iframe portal + full-iframe modal — trade-off UX sponsor đã reject?

**Cấm** implement. **Evidence:** `docs/program/specs/PO-HRM-CTR-CREATE-AUDIT-SA-01.md`

**ack_status:** `PASS_TO_PM`

---

## PM sau wave audit

1. Gộp 4 evidence → **`PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS.md`** (gap + câu hỏi sponsor).
2. **PM → sponsor:** chỉ gửi **`NEED-SPONSOR-QUESTIONS`** — chờ trả lời rồi mới BA-02 CONFIRM + FE fix wave.
3. **Không** dispatch fix FE đến khi sponsor chốt câu trả lời (trừ hotfix P0 sponsor nói «làm ngay»).
