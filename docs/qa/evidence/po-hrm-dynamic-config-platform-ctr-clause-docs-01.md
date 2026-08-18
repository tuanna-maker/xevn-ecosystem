# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-DOCS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-DOCS-01` |
| **from_role** | `ba-docs` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — client DOC-DELTA (SRS bump + HDSD CH) ADD-only · **not** module CTR UAT |
| **priority** | P2 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01` CONFIRMED Option B RETAIN · ba-data/BE/FE HOLD (no GAP) |
| **change_mode** | **ADD** (EXPAND FR-UC-BP-CORE-09a · new HDSD Chương 6h) — no wipe CORE-09/09b/09c/09d · no HTML rebuild · no apps/** |
| **portal_url** | N/A — documentation seat (no browser UF) |
| **journey_l25** | **N/A deferred** — J-HRM-CTR-CL-* NOT promoted · `C-SLICE-≠-MODULE` · printable HOLD |
| **crud_or_matrix** | Client-doc DOC-DELTA maps SA Option B body SoT + BA AC-PLT-CTR-CL-01..06 into customer SRS/HDSD wording |
| **no_prompt_echo** | **true** — no work_item / stamp / pipeline meta / chat metaphor in client text |
| **ack_status** | `PASS_TO_PM` · **ACCEPT** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-docs-01.md` |
| **sa_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-SA-01.md) Option **B** LOCKED RETAIN |
| **ba_ref** | [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md) AC pack CONFIRMED · ba-data HOLD · BE/FE HOLD |

---

## HARD EXIT GATE — files written on disk (byte sizes)

| # | File | Type | Bytes | ≥ 2KB |
|---|------|------|------:|:-----:|
| 1 | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-docs-01.md` | Evidence (this file) | **6717** (Shell-verified) | ✅ |
| 2 | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06h_HRM_THU_VIEN_DIEU_KHOAN_HD.md` | Client DOC-DELTA — HDSD Chương 6h (new) | **10215** | ✅ |
| 3 | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | Client DOC-DELTA — SRS bump → **v0.38** (ADD-only) | **357272** (delta **+4012** from pre-patch UTF-8 len 353260) | ✅ |

Absolute path root (NFD canonical): repo `xevn-ecosystem`.

---

## What was written (business content — no meta echo)

### SRS bump — `SRS_HRM_ENTERPRISE.md` v0.38 (ADD-only)

- **EXPAND FR-UC-BP-CORE-09a «Mục đích»** — nguồn nội dung = thư viện điều khoản có phiên bản; nháp sửa tại chỗ; đã phát hành → tăng phiên bản; ảnh chụp bất biến; chỗ điền `{{tên}}`; không claim nghiệm thu bản in.
- **EXPAND «Nội dung tiếng Việt»** — body SoT + `{{tên_trường}}` + cấm DOCX làm nguồn GĐ1.
- **EXPAND «Quy tắc nghiệp vụ»** — BR-CTR-CL-01..04 làm rõ version-bump / hardcode cấm / snapshot; ADD bullets phiên bản & ảnh chụp · chỗ điền · **OUT** kéo-thả bố cục + DOCX.
- **EXPAND «Trường hợp đặc biệt»** — ADD rows: chặn ghi đè khi đã phát hành; snapshot bất biến sau edit; empty/thiếu bắt buộc.
- **EXPAND tiêu chí chấp nhận** — RETAIN AC-CTR-CL-01..03 · ADD AC-PLT-CTR-CL-01..06 (draft F5 · issued bump · freeze · CREATE N+1 · resolve-not-hardcode · soft-retire).
- **Version-log ADD row 0.38** + closing marker bump v0.37 → v0.38; header **0.38**.
- Prior FR CORE-09 · 09b · 09c · 09d · ATT quỹ phép **RETAINED** (no wipe).

### HDSD — new `HDSD_XEVN_CH06h_HRM_THU_VIEN_DIEU_KHOAN_HD.md` (Chương 6h)

- Hai vai trò: quản trị thư viện vs soạn/phát hành HĐ.
- Thêm điều khoản N+1; chỗ điền `{{tên}}`; Lưu → tải lại còn.
- Sửa nháp tại chỗ vs đã phát hành → tăng phiên bản; HĐ cũ giữ ảnh chụp.
- Phát hành → ảnh chụp; thiếu bắt buộc → chặn.
- Ngừng dùng = ẩn mềm; empty state không bịa / không seed.
- §7 Phạm vi: DOCX GĐ2 OUT · kéo-thả bố cục OUT · **không** claim module HĐ / bản in nghiệm thu.

---

## Honesty locks (mandatory — RETAINED, no flip)

| Flag / seal | State | Note |
|-------------|-------|------|
| `contracts_printable_ready` | **false** | not flipped by docs |
| `payroll_e2e_ready` | **false** | not flipped |
| ba-data / BE / FE | **HOLD (no GAP)** | docs only — no invent wire / printable ready |
| ATT leave-balance / CODE / WS / SHIFT seals | **SEAL RETAIN** | not reopened |
| Module CTR UAT / Phase 1 DONE | **DENIED** | `C-SLICE-≠-MODULE` |
| Seed (U65) | **none** | doc-only |
| `no_prompt_echo` | **true** | no work_item / stamp / meta in client text |
| DnD reorder / DOCX GĐ2 | **OUT noted** in SRS + HDSD | cite peer AC-PLT-CTR-03 / GĐ2 |

---

## Command table

| Command | Result | Class |
|---------|--------|-------|
| Python UTF-8 patch script (this seat) | SRS ADD-only anchors applied · HDSD already on disk | WRITE ok |
| Byte-size check `(Get-Item).Length` / `stat().st_size` | HDSD **10215** · SRS **357272** · evidence ≥2KB | GATE ok |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| Optional browser AC slice | P2 | **pm** → **qa** | Only if PM opens `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-01` — U65 zero-seed; not claimed by docs |
| HTML deliverable rebuild | later | ba-docs | Rebuild from markdown sources if client HTML SRS/HDSD regenerated (no hand-edit) |
| `C-SLICE-≠-MODULE` | — | **pm** | Keep `contracts_printable_ready=false`; no module CTR UAT / Phase1 claim |
| Journey rows `J-HRM-CTR-CL-*` | later | ba-docs / qa | Promote after optional QA — **not** this seat |

---

## completion_report

**ACCEPT** — Client DOC-DELTA ADD-only delivered: HDSD Chương 6h (thư viện điều khoản · version bump · snapshot freeze · `{{x}}` · cấm FE hardcode · DnD/DOCX OUT) + SRS `SRS_HRM_ENTERPRISE.md` **v0.38** EXPAND FR-UC-BP-CORE-09a (AC-PLT-CTR-CL-01..06). Mapped from SA Option B RETAIN + BA AC pack. Honesty flags unchanged false; ATT seals retained; ba-data/BE/FE HOLD respected; no seed; no apps/**; no_prompt_echo on client text. Empty seat avoided — both ≥2KB files on disk.

**next_owner:** **pm**

**next_dispatch_prompt:**
```
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-01   # OPTIONAL — only if PM opens browser slice
# OR continue U88 continuous next vertical (governance SA/BA) — docs seat CLOSED
from_role: pm
to_role: qa | sa
lane: execution|governance
note: docs PASS_TO_PM ACCEPT; printable stays false; BE/FE HOLD unless QA finds concrete gap
```

**ack_status:** PASS_TO_PM
