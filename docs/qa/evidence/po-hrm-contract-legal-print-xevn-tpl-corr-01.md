# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |
| **from_role** | ba-process |
| **lane** | governance |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **Date** | 2026-08-07 |
| **Sponsor** | 8 mẫu X.E = ví dụ only · catalog **động** · HR thêm 9+ · **CẤM** fix cứng 8 mã |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `contracts_printable_ready=false` · **no** claim printable ready · **no** `apps/**` |

---

## 1. Deliverables

| Artifact | Action |
|----------|--------|
| `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md` | **ADD** — supersede closed enum SoT |
| `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md` | Cited (PM lock already present) |
| `…-SPEC-01.md` | APPEND `@CHANGE` · AC-01 revised · **AC-11 ADD** · FR #1 open list · forbidden closed enum |
| `…-DATA-01.md` | APPEND `@CHANGE` · remove FORBIDDEN 9th · **REMOVE** CHK `code IN (8)` · VAL-06/07 revise · VAL-11 ADD |
| `…-API-01.md` | APPEND `@CHANGE` · TPL-02 open upsert · CODE-INVALID=format only |
| `…-TECHSPEC-01.md` | APPEND `@CHANGE` · Option A open catalog · Option D FORBIDDEN (CHK IN 8) |

---

## 2. Spec says / prior code-intent (correction)

| Prior (SUPERSEDED) | CORR-01 (authoritative) |
|--------------------|-------------------------|
| Exactly 8 `XEVN_*` closed enum | Starter 8 **examples** · catalog **open** |
| FORBIDDEN invent 9th | **REQUIRED** Settings CRUD 9+ (AC-CTR-XEVN-11) |
| DB `CHK code IN (8)` | **FORBIDDEN to ship** |
| API reject not-in-8 → CODE-INVALID | CODE-INVALID = **format/slug** only |
| AC-01 = đúng 8 · fail >8 | Open list · optional starter · allow >8 |
| AC-10 = no 9–10 codes | AC-10 = **no auto-bootstrap alias** only |

## 3. Kept (must_keep)

- Starter matrix 8 `XEVN_*` from Excel (pack / term / duration / title)
- Packs `GENERAL` \| `IT_OFFICE` \| `DRIVER`
- UF-HRM-02 · AC-CTR-XEVN-08
- Print-spine PREV→VER→PDF · freeze `template_code`
- **Q-CTR-01 CLOSED** · **Q-CTR-02 CLOSED**
- Alias sheet dedupe bootstrap (HĐKXĐ / HĐ KXĐ)
- `contracts_printable_ready=false`

## 4. New AC (U65)

**AC-CTR-XEVN-11:** Settings tạo `template_code` thứ 9 → Network 2xx → list + **F5** còn → dùng trên tạo HĐ / preview → bind đúng cấu hình.

Journey draft: `J-HRM-CTR-07`.

## 5. Out of scope this seat

- `apps/**` / migrate / seed
- Client SRS/API_DESIGN full remaster (residual **sa** / ba-docs DOC-DELTA pointer)
- Claim printable UAT / QC GO

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed: CORR-01 SoT supersedes closed enum across SPEC/DATA/API/TECH; AC-CTR-XEVN-11 + BR-CTR-TPL-DYN-*; CHK IN 8 / FORBIDDEN 9th removed; starter 8 + packs + UF-02 + print-spine + Q-CTR kept; printable=false. Residual: sa optional DOC-DELTA; BE dynamic already re-dispatched; FE Settings CRUD 9+; QA AC-11 U65. |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-corr-01.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01-SA-DOC
from_role: pm
to_role: sa
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01

read_first:
1. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md
2. docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md
3. docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-corr-01.md
4. Annotated DATA/API/TECHSPEC @CHANGE CORR-01

task (ADD-only DOC-DELTA — quick):
- Confirm TECH/API pointers already align with open catalog (no re-close enum).
- If client API_DESIGN_HRM_ENTERPRISE / DB_DESIGN still say «exactly 8 / FORBIDDEN 9th» → ADD DOC-DELTA pointer to CORR-01 (no wipe F-CORE-CTR-*).
- Keep contracts_printable_ready=false · no apps/**.

exit: PASS_TO_PM
Note: BE dynamic already re-dispatched — do not block BE on this SA seat unless drift found.
```
