# Evidence — BA audit gap · Tạo HĐLĐ (CTR create)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-AUDIT-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-10 |
| **lane** | governance · audit (no implement) |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | Không revert · cấm tưởng tượng field/AC · không sửa `apps/**` |
| **SoT cited** | `PO_HRM_CTR_CREATE_REDESIGN_SPONSOR_INTAKE.md` · `PO-HRM-CTR-CREATE-REDESIGN-BA-01.md` · `PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md` · `INC-PM-COMPOSER-DIRECT-CODE-CTR-UX-20260810.md` |
| **AS-IS evidence** | `po-hrm-ctr-create-redesign-qa-01.md` · `qa-02.md` · `qc-02.md` · `po-hrm-ctr-create-audit-fe-01.md` (AUDIT-QA-01 / AUDIT-SA-01 pending PM synth) |
| **printable** | **false** · `contracts_printable_ready=false` · C-SLICE |

## Mục tiêu audit

Đối chiếu **TO-BE đã khóa BA-01** + **intake sponsor** với **AS-IS có evidence QA/QC** và **phản hồi sponsor 2026-08-10** (dispatch wave). Không thêm field/AC ngoài nguồn trên.

---

## Bảng gap G-*

| ID | Nguồn (intake / BA-01 / O# / sponsor) | AS-IS (QA/QC cite — fact) | TO-BE trong spec | Trạng thái |
|----|----------------------------------------|---------------------------|------------------|------------|
| **G-01** | Dispatch § «Phản hồi sponsor» — tab/bước 2 không dùng được · **O1** | QA-02: J-CREATE-01 **PASS** stepper + `ctr-create-step-1` trên `…/hr/contracts?portal=1` (`CTRCREATEQA2-MSMO2M1N`). QA-01: Step2 **FAIL** DnD storm trước fix. **Chưa** có AUDIT-QA-01 trên URL CC sponsor. | **O1** — stepper 2 bước tách Thông tin & mẫu / Điều khoản & xem trước | **CONFIRMED-GAP** (sponsor CC embed vs evidence URL `/hr/contracts`; retest AUDIT-QA-01) |
| **G-02** | Incident addendum — popup «màn con» trong iframe; sponsor `:5173/command-center/hrm/contracts` · BA-01 §3.1 «max-w-5xl hoặc full-bleed embed» (không định nghĩa full viewport CC) | QA-02 portal_url = `…/hr/contracts?portal=1` — **không** ghi `command-center/hrm/contracts`. QC-02 **GWC** không audit full CC viewport. | Wireframe §3.1 dialog rộng; **không** có AC full viewport CC trong BA-01 | **SPEC-SILENT** → **NEED-SPONSOR** (Q1–Q2) |
| **G-03** | Intake AMIS «Thông tin chung» — **Tên HĐ** thiếu AS-IS · **O3** / wireframe §3.2 A (Mã HĐ, không Tên HĐ) | QA-02 J-01 **PASS** «step 1 AMIS grid» — không liệt kê field «Tên HĐ» trong JSON. | **O3** — merge §5 + nhãn tiếng Việt; wireframe A không liệt kê `contract_name` | **CONFIRMED-GAP** (intake AMIS row vs BA-01 wireframe thiếu tên HĐ) |
| **G-04** | Intake AMIS — **Ngày ký**, **Hình thức làm việc**, **Tỉ lệ hưởng lương** thiếu AS-IS | QA evidence **không** assert các field này trên form. | BA-01 §3.2 C chỉ `effective_from` / `effective_to`; **không** ngày ký / hình thức / tỉ lệ % | **SPEC-SILENT** → **NEED-SPONSOR** (Q3–Q5) |
| **G-05** | Sponsor + incident #1 — NV **search** vs UUID dài · **O3** «NV (picker)» | QA evidence **không** mô tả control NV (Select vs search). Dispatch sponsor quote. | **O3** — picker NV; không rõ CatalogSearchPicker | **SPEC-SILENT** → **NEED-SPONSOR** (Q6) |
| **G-06** | Sponsor — thiếu mẫu active / không sang bước 2 · **O2** · **BR-CTR-CREATE-01** | QA-02: catalog **39** templates, `XEVN_FT_12M_OFFICE` found; J-02 **PASS** Tiếp → step 2. QA-01: probation template **HOLD** (`XEVN_PROBATION_OFFICE` missing active). | **O2** combobox catalog mở; **O1** gate `template_code` trước bước 2 (hoặc «Chỉ lưu sổ») | **CONFIRMED-GAP** (probation catalog QA-01; sponsor symptom có thể khác env CC — AUDIT-QA-01) |
| **G-07** | Intake #3 — clause DnD trên tạo · **O6–O7** · incident #3 **Gỡ** | QA-01: **FAIL** `sameNodeDragBind` / palette DnD. QA-02: J-02 **PASS**, PUT overlay **200**, preview **201**, `dnd_storm: false` trên `/hr/contracts`. Sponsor: không kéo thả / cần **Gỡ** (chưa có QA trên CC). | **O6** palette→canvas + PUT 2xx; **O7** mẫu→clause→preview | **CONFIRMED-GAP** (Gỡ không có trong BA-01; DnD PASS slice ≠ sponsor CC — **NEED-SPONSOR** Q7–Q8) |
| **G-08** | Intake — **Các khoản phụ cấp** (+ Thêm) AMIS | QA **không** kiểm section phụ cấp. | BA-01 §3.2 E «phụ cấp snapshot» read-only; **không** sub-grid «+ Thêm» như AMIS | **SPEC-SILENT** → **NEED-SPONSOR** (Q9) |
| **G-09** | Intake AMIS — **Người đại diện** công ty ký · **O3** Bên A read-only | QA-02 không assert block đại diện. BA-01 gap matrix employer_* → **O3** / **O4** | Hiển thị Bên A read-only Bước 1 | **CONFIRMED-GAP** (intake nêu thiếu; chưa có evidence PASS field-level) |
| **G-10** | Intake — **Trích yếu** thiếu; ghi chú có | QA không assert trích yếu. Wireframe §3.2 không liệt kê trích yếu riêng (ghi chú sổ có trong AS-IS prose BA-01 §1.1) | **O3** merge labels Đ.21 — không tách «Trích yếu» AMIS | **SPEC-SILENT** → **NEED-SPONSOR** (Q10) |
| **G-11** | **O9** / **AC-CTR-UX-01** sponsor lock #4 | QA-01/02: honesty testids **PASS** — không visible; J-08 PASS (QA-01). | Bỏ paragraph honesty; bullet thiếu nghiệp vụ | **CONFIRMED-GAP** đóng trên slice QA (TO-BE met **trên URL đã test**) — **giữ regression** AUDIT-QA-01 CC |
| **G-12** | **O8** «Chỉ lưu sổ» | QA-01 **FAIL** O8 (timeout sau DnD). QA-02 J-05 **PASS** POST 201 + F5. | **O8** registry không bắt mẫu | **CONFIRMED-GAP** đóng QA-02 slice; sponsor chưa nghiệm thu CC |
| **G-13** | Dispatch — SRS chưa cập nhật thay đổi thực tế · incident | Process fact — không QA pass/fail | BA-01 `ref_srs` FR-UC-BP-CORE-09* — delta SRS **chưa** publish (BA-02 outline) | **CONFIRMED-GAP** (governance) |
| **G-14** | Dispatch — QC/QA slice **không** thay nghiệm thu sponsor · QC-02 **GWC** | QC-02: J-01/02/05/06 **CLOSED**; J-03/04/07/08 **NOT IN QA-02**; `contracts_printable_ready=false` | **O15** DENY module UAT | **CONFIRMED-GAP** (sponsor lock vs GWC — không mâu thuẫn spec; **không** promote module) |
| **G-15** | **O5** / J-CREATE-03 probation vs FT | QA-01: **HOLD** — `XEVN_PROBATION_OFFICE` không active trong catalog scan | **O5** term presets TV/12/24/KXĐ | **CONFIRMED-GAP** (data/catalog + chưa retest QA-02) |
| **G-16** | **O4** / **O11** DRIVER GPLX · J-CREATE-04 | QA-01: **PASS_WITH_HOLD** — GPLX không exercise browser | Block GPLX Bước 1 + chặn preview | **CONFIRMED-GAP** (chưa U65 field-level) |
| **G-17** | Sponsor + incident — layout/chữ/scroll/ít scroll | QA **không** đo typography/viewport%; QC P2 dup-key console only | BA-01 §3.1 grid 12 · `xevn-safe-inline` — **không** AC cỡ chữ / % scroll | **SPEC-SILENT** → **NEED-SPONSOR** (Q11) |
| **G-18** | Incident — PM patch `portalScope` / draft **unverified** | FE-01: create Dialog `portalScope=iframe` vs parent portal TECHSPEC §4.1 trail (`po-hrm-ctr-create-audit-fe-01.md`) | SA-01 Option A; BA-01 không cite iframe portal | **CONFIRMED-GAP** (process + SA Option; Q1–Q2 sponsor) |

---

## Tóm tắt trạng thái

| Trạng thái | Số lượng G-* | Ghi chú |
|------------|--------------|---------|
| **CONFIRMED-GAP** | 12 | Cần BA-02 + fix sau sponsor trả lời NEED-SPONSOR |
| **SPEC-SILENT** | 8 | Đã map sang câu hỏi sponsor (file NEED-SPONSOR) |
| **NEED-SPONSOR** (tag trên hàng) | 10 | Không implement trước khi chốt |

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Đóng audit BA-01: bảng **G-01..G-18**; NEED-SPONSOR questions file; BA-02 **outline DRAFT**; không `apps/**` |
| **residual** | AUDIT-QA-01 / AUDIT-SA-01 evidence chưa merge; G-18 đã cite FE-01; PM synthesis wave |
| **next_owner** | **pm** → sponsor Q&A → **ba-process** BA-02 CONFIRM |
| **pm_dispatch_hint** | Sau sponsor trả lời NEED-SPONSOR: `PO-HRM-CTR-CREATE-REDESIGN-BA-02` CONFIRM + unblock FE-03; parallel `PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS` |
| **evidence_path** | File này · `docs/program/specs/NEED-SPONSOR-QUESTIONS-CTR-CREATE-AUDIT.md` · `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-CREATE-AUDIT-PM-SYNTH-01
role: pm
read_first:
  - docs/qa/evidence/po-hrm-ctr-create-audit-ba-01.md
  - docs/program/specs/NEED-SPONSOR-QUESTIONS-CTR-CREATE-AUDIT.md
  - docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md
entry_criteria: BA AUDIT-BA-01 PASS_TO_PM; parallel QA/FE/SA audit evidence khi có
exit_criteria: PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS.md; gửi sponsor chỉ NEED-SPONSOR ≤12 câu; BLOCK FE-03/BA-02 fix đến khi sponsor chốt
ack_status: PASS_TO_PM (sponsor Q&A) hoặc DISPATCH ba-process BA-02 sau chốt
```

**ack_status:** **PASS_TO_PM**
