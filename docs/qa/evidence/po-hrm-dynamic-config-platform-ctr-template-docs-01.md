# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-DOCS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-DOCS-01` |
| **from_role** | `ba-docs` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — client DOC-DELTA (SRS bump + HDSD CH) ADD-only · **not** module CTR UAT |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01` CONFIRMED Option B RETAIN Nest `hrm_contract_templates` |
| **change_mode** | **ADD** (EXPAND FR-UC-BP-CORE-09d · new HDSD Chương 6i · peer pointer CH06) — no wipe CORE-09/09a/09b/09c · no reopen CH06h clause · no HTML rebuild · no apps/** |
| **portal_url** | N/A — documentation seat (no browser UF) |
| **journey_l25** | **N/A deferred** — J-HRM-CTR-07 / TPL UF **not** promoted by docs · `C-SLICE-≠-MODULE` · printable HOLD |
| **crud_or_matrix** | Client-doc DOC-DELTA maps SA Option B open catalog + BA AC-PLT-CTR-TPL-01..07+H into customer SRS/HDSD wording |
| **no_prompt_echo** | **true** — no work_item / stamp / pipeline meta / chat metaphor in client text |
| **ack_status** | `PASS_TO_PM` · **ACCEPT** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-docs-01.md` |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-SA-01.md) Option **B** LOCKED RETAIN |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01.md) AC pack CONFIRMED · invent KEY noted · ba-data/FE HOLD · BE KEY optional |

---

## HARD EXIT GATE — files written on disk (byte sizes)

| # | File | Type | Bytes | ≥ 2KB |
|---|------|------|------:|:-----:|
| 1 | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-docs-01.md` | Evidence (this file) | **8074** (Shell `(Get-Item).Length`) | ✅ |
| 2 | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06i_HRM_DANH_MUC_MAU_HD.md` | Client DOC-DELTA — HDSD Chương 6i (new) | **11665** | ✅ |
| 3 | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | Client DOC-DELTA — SRS bump → **v0.39** (ADD-only) | **362919** (delta **+5647** from pre-patch 357272) | ✅ |

Absolute path root (NFD canonical): repo `xevn-ecosystem`.

Supporting ADD (peer pointer only, not counted as second gate file): `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` — DOC-DELTA lines → CH06h + CH06i.

---

## What was written (business content — no meta echo)

### SRS bump — `SRS_HRM_ENTERPRISE.md` v0.39 (ADD-only)

- **EXPAND FR-UC-BP-CORE-09d «Mục đích»** — quản trị Cài đặt mở mẫu N+1 ≠ soạn HĐ chọn từ danh sách; đóng băng mã mẫu khi lưu phiên bản in; kéo-thả bố cục / DOCX ngoài phạm vi; không claim bản in nghiệm thu.
- **EXPAND BR metadata** — ADD BR-PLT-02 · 03 · 04 · 05 (consumer invent class · freeze · soft-retire · starter ≠ ceiling).
- **EXPAND «Quy tắc nghiệp vụ»** — starter soft-warn không chặn; lớp từ chối gắn mã không hợp lệ (≠ không tìm thấy theo định danh ≠ catalog trống); freeze issued; soft-retire; DnD/DOCX OUT cite AC-PLT-CTR-03.
- **EXPAND «Trường hợp đặc biệt»** — soft-warn · invent · get-by-id miss class · freeze · retire · DnD/DOCX OUT.
- **EXPAND «Diễn biến»** — rows 9–11 invent / freeze / retire.
- **EXPAND tiêu chí chấp nhận** — RETAIN AC-CTR-XEVN-* · AC-PLT-CTR-01..06 · ADD **AC-PLT-CTR-TPL-01..07+H**.
- **Version-log ADD row 0.39** + closing marker bump v0.38 → v0.39; header **0.39**.
- Prior FR CORE-09 · 09a (CH06h seal) · 09b · 09c · ATT quỹ phép **RETAINED** (no wipe / no reopen).

### HDSD — new `HDSD_XEVN_CH06i_HRM_DANH_MUC_MAU_HD.md` (Chương 6i)

- Hai vai trò: quản trị catalog vs soạn HĐ (consumer ≠ admin CREATE).
- Thêm mẫu N+1 / mã thứ chín trở lên; Lưu → tải lại còn; picker chọn được.
- Tám mã khởi tạo = ví dụ ≠ trần; cảnh báo mềm không chặn.
- Chọn mẫu trên nghiệp vụ; không chữ tự do thay danh mục khi còn mẫu hiệu lực; phân biệt lớp lỗi.
- Lưu phiên bản in → đóng băng mã + khung.
- Ngừng dùng = ẩn mềm; empty state không bịa / không seed.
- §8 Phạm vi: DOCX GĐ2 OUT · kéo-thả bố cục OUT · **không** claim module HĐ / bản in nghiệm thu · peer CH06h điều khoản riêng.

---

## Honesty locks (mandatory — RETAINED, no flip)

| Flag / seal | State | Note |
|-------------|-------|------|
| `contracts_printable_ready` | **false** | not flipped by docs · printable **not** claimed |
| `payroll_e2e_ready` | **false** | not flipped |
| invent KEY `HRM-CTR-TPL-KEY` | **noted class only** | client wording = lớp từ chối gắn mã; **DENY** claim Network KEY sealed until QA / BE residual |
| ba-data / FE | **HOLD** | docs only |
| BE KEY CNS | **optional residual** | `CTR-TEMPLATE-BE-01` — not claimed sealed by this seat |
| ATT leave-balance / CODE / WS / SHIFT seals | **SEAL RETAIN** | not reopened |
| CTR clause CH06h / CORE-09a | **SEAL RETAIN** | not reopened |
| Module CTR UAT / Phase 1 DONE | **DENIED** | `C-SLICE-≠-MODULE` |
| Seed (U65) | **none** | doc-only |
| `no_prompt_echo` | **true** | no work_item / stamp / meta in client text |
| DnD reorder / DOCX GĐ2 | **OUT noted** in SRS + HDSD | cite peer AC-PLT-CTR-03 / GĐ2 |

---

## Command table

| Command | Result | Class |
|---------|--------|-------|
| Write HDSD CH06i | on disk | WRITE ok |
| Python UTF-8 ADD-only patch CORE-09d | SRS → v0.39 · delta ≥5KB | WRITE ok |
| Peer pointer CH06 → CH06i (+ CH06h) | ADD-only | WRITE ok |
| Byte-size check `(Get-Item).Length` | evidence **8074** · HDSD **11665** · SRS **362919** | GATE ok |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| Invent KEY Network wire | P2 | **pm** → **dev-be** (already DISPATCHED BE-01) / **qa** | Do **not** 🟢 TPL-04 until KEY distinct from 404 or waiver |
| Optional browser AC slice | P2 | **pm** → **qa** | Only if PM opens `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01` — U65 zero-seed; not claimed by docs |
| HTML deliverable rebuild | later | ba-docs | Rebuild from markdown sources if client HTML SRS/HDSD regenerated (no hand-edit) |
| `C-SLICE-≠-MODULE` | — | **pm** | Keep `contracts_printable_ready=false`; no module CTR UAT / Phase1 claim |
| Journey rows `J-HRM-CTR-07` / TPL UF | later | ba-docs / qa | Promote after optional QA — **not** this seat |

---

## completion_report

**ACCEPT** — Client DOC-DELTA ADD-only delivered: HDSD Chương 6i (danh mục mẫu mở · N+1 / mã 9+ · starter 8 ≠ ceiling · consumer chọn ≠ admin CREATE · freeze issued · soft-retire · DnD/DOCX OUT · printable not claimed) + SRS `SRS_HRM_ENTERPRISE.md` **v0.39** EXPAND FR-UC-BP-CORE-09d (AC-PLT-CTR-TPL-01..07+H). Mapped from SA Option B RETAIN Nest `hrm_contract_templates` + BA AC pack. Invent KEY class noted in business wording only — **not** claimed Network sealed. Honesty flags unchanged false; CH06h clause + ATT seals retained; ba-data/FE HOLD respected; no seed; no apps/**; no_prompt_echo on client text. Empty seat avoided — both ≥2KB files on disk (byte sizes Shell-verified).

**next_owner:** **pm**

**next_dispatch_prompt:**
```
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01   # OPTIONAL — only if PM opens browser slice after BE KEY
# OR await BE-01 KEY wire then QA; U88 continuous next vertical — docs seat CLOSED
from_role: pm
to_role: qa | sa
lane: execution|governance
note: docs PASS_TO_PM ACCEPT; printable stays false; KEY invent not sealed by docs; BE/FE HOLD unless QA finds concrete gap
cấm: seed · flip printable · reopen clause/ATT · invent FE HOLDs · module CTR UAT · Phase1
```

**ack_status:** PASS_TO_PM
