# Evidence — PO-HRM-BP-SRS-CHOT-01

| Mục | Nội dung |
|-----|----------|
| **work_item_id** | `PO-HRM-BP-SRS-CHOT-01` |
| **from_role** | pm |
| **to_role** | ba-docs |
| **lane** | governance |
| **Ngày** | 2026-08-05 |
| **ack_status** | **PASS_TO_PM** |

---

## spec_read_ack / read_first

| # | Artifact | Kết quả |
|---|----------|---------|
| 1 | `_tmp-remaining-summary.txt` | Sheet 01/02/03 verbatim applied |
| 2 | `po-hrm-bp-uc-gap-w3-matrix-apply-02.md` | Matrix 1.1.4 CLOSED · `NOT_READY_PENDING_SRS_EXPAND` → SRS EXPAND land |
| 3 | `_tmp-sponsor-chot-fill-read.json` | FILL nền; **REMAINING thắng** (PAY Form GĐ1+DD GĐ2 supersede kéo-thả GĐ1) |
| 4 | `SRS_HRM_ENTERPRISE.md` | **v0.8** DOC-DELTA |
| 5 | `UC_INVENTORY.md` | **0.3.4** FR status sync |
| 6 | `UC_MEETING_PRODUCT_GAP_MATRIX.md` v1.1.4 | Stamp giữ — không reopen APPLY-02 |

---

## completion_report

### Đã đóng

1. **SRS v0.8 DOC-DELTA** — chốt FILL + REMAINING (FY CRUD/tenant cấm fix · sign XBOS WF · PROP-03d/05b IN · 03e OUT · Face mobile MVP · PAY form GĐ1 + kéo-thả GĐ2 · CORE-04 OUT · ATT-03 GĐ2 · REC-03/campaign OUT · S15/S16 GĐ2 · S71 OUT).
2. **EXPAND FR đủ 7 mục** — **26** UC sheet-03 EXPAND + **2 ADD** (ATT-03d GPS · ATT-05b panel quỹ) = **28** thân FR nâng cấp; **không** ADD ATT-03e; **không** wipe 16 FR ưu tiên.
3. **UC_INVENTORY 0.3.4** — PAY-03/05–09 → EXPAND; totals **47** UC; gate paper OK · QC spot còn mở · cấm READY_FOR_TECHSPEC full.
4. **SPONSOR_SRS_CHOT_LOCK.md** — 1-pager khóa MVP / OUT / GĐ2 / residual.
5. **PDF rebuild** — `build_pdf_from_srs()` only → `SRS_HRM_ENTERPRISE_KHACH.pdf` **83** trang.

### Counts (return)

| Metric | Value |
|--------|-------|
| **SRS version** | **0.8** |
| **PDF pages** | **83** |
| **Expanded UC count** | **28** (26 EXPAND + 2 ADD) |
| Priority FR kept | 16 (no wipe) |

### Locks tuân thủ

| Lock | Evidence |
|------|----------|
| FY/config CRUD per tenant — cấm fix month | SRS §1.2 + leave FR |
| PROP-03d + 05b IN; 03e OUT | FR-ATT-03d / 05b present; no 03e FR |
| Face Mobile only MVP | Scope + ATT-03 stamp |
| PAY Form GĐ1 + kéo-thả GĐ2 | Scope + PAY-02 narrative |
| CORE-04 OUT · ATT-03 GĐ2 · REC-03 OUT | Scope OUT table + FR stamps |
| Sign XBOS-configurable NV+QL+HR | ATT-11 + §1.2 |
| No apps/** · no Attendance CLOSED · no unfinished-PAY · no READY_FOR_TECHSPEC full | This seat docs-only |

### Residual (không chặn paper SRS)

| id | Nội dung | Owner kế |
|----|----------|----------|
| **QC-SPOT-01** | Spot AC EXPAND + locks | **qc** |
| `ready_for_techspec_docs` | Paper-only sau QC GO/GWC | PM |
| TechSpec S3 | **HOLD** | PM |
| Attendance / Employees CLOSED | **false** | must_keep |
| READY_FOR_TECHSPEC | **false** | must_keep |
| Product demo GO | **cấm** (R-DEMO-01 = script scope) | must_keep |

---

## program_verdict

```text
SRS_EXPAND_LANDED
ready_for_techspec_docs: pending_qc_spot
ready_for_techspec: false
```

Matrix APPLY-02 `NOT_READY_PENDING_SRS_EXPAND` đã được thỏa về thân SRS — PM có thể flip **`READY_FOR_TECHSPEC_DOCS`** (paper-only) **sau** QC-SPOT-01 GO/GWC. TechSpec S3 vẫn HOLD.

---

## Files touched

| Path | Change |
|------|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | v0.8 DOC-DELTA (prior+verify) |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | **0.3.4** FR/totals/gate |
| `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_SRS_CHOT_LOCK.md` | 1-pager · PDF **83** p |
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE_KHACH.pdf` | rebuild `build_pdf_from_srs()` |
| `docs/qa/evidence/po-hrm-bp-srs-chot-01.md` | this evidence |

---

## next_owner

**qc** — `PO-HRM-BP-SRS-CHOT-QC-SPOT-01` · rồi **pm** intake

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SRS-CHOT-QC-SPOT-01
from_role: pm
to_role: qc
lane: governance
priority: P0

entry_criteria:
- matrix UC_MEETING_PRODUCT_GAP_MATRIX.md v1.1.4
- SRS_HRM_ENTERPRISE.md v0.8 + SPONSOR_SRS_CHOT_LOCK.md
- PDF SRS_HRM_ENTERPRISE_KHACH.pdf (83 p)
- evidence po-hrm-bp-srs-chot-01.md PASS

exit_criteria:
- Spot AC: sheet03 EXPAND FR có 7 mục (sample ≥5 UC) · ATT-03d/05b IN · 03e OUT
- Face mobile · CORE-04 OUT · ATT-03 GĐ2 · PAY form GĐ1+DD GĐ2 · FY CRUD · sign XBOS
- no wipe 16 priority FR · no_prompt_echo · no apps/**
- Verdict GO/GWC → PM may set ready_for_techspec_docs=true (paper-only); S3 HOLD; Attendance not CLOSED

cấm: READY_FOR_TECHSPEC full · product demo GO · invent month/sign order · unfinished-PAY wording

evidence_path: docs/qa/evidence/po-hrm-bp-srs-chot-qc-spot-01.md
ack_status: GO | GO_WITH_CONDITIONS | NO-GO → PASS_TO_PM
```

---

## ack_status

**PASS_TO_PM**
