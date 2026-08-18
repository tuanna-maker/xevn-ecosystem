# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-01` |
| **role** | ba-process |
| **date** | 2026-08-07 |
| **ack_status** | **PASS_TO_PM** |
| **SPEC** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` |
| **Honesty** | `contracts_printable_ready=false` |

---

## completion_report

### Closed
1. **Confirmed 8 canonical `template_code`** (BA LOCK) — HĐTV/12T/24T/KXĐ × OFFICE/DRIVER.
2. **Dedupe** sheets `HĐKXĐ ( Khối LX)` + `HĐ KXĐ (Khối LX)` → alias of `XEVN_INDEF_DRIVER` (canonical sheet = `HĐLĐ KXĐTH (lx- nhiều công ty)`).
3. **SPEC delta ADD-only** vs SPEC-01: duration defaults, pack map (`IT_OFFICE`/`DRIVER`), clause inventory **titles/groups only**, merge fields (GPLX, hạng, đơn vị đa pháp nhân, số HĐ pattern), AC-CTR-XEVN-01..10, FR-UC-BP-CORE-09d draft, must_keep/forbidden.
4. Source structure skim: `docs/program/refs/2026.08.07-hop-dong-mau-X.E-templates-only.xlsx` (10 sheets) — **no** full body paste · **no** PII `Mã NV` copy.

### Residual (not closed)
- ba-docs merge FR-09d into Enterprise SRS
- sa TechSpec `template_code` enum + keyword_map
- ba-data physical columns / Settings 8 rows
- BE/FE/QA U65 matrix — **printable UAT still DENIED**
- Q-CTR-02 PDF engine NFR vẫn OPEN (không đụng wave này)

### Explicit non-claims
- `contracts_printable_ready=true` — **false**
- Không sửa `apps/**`
- Không seed
- Không đè Q-CTR-01/02 CLOSED / UF-HRM-02 🟢

---

## Matrix stamp (final)

| `template_code` | Pack | term | Duration default |
|-----------------|------|------|------------------|
| `XEVN_PROBATION_OFFICE` | `IT_OFFICE` | probation | 60 ngày gợi ý |
| `XEVN_FT_12M_OFFICE` | `IT_OFFICE` | definite | +12 tháng |
| `XEVN_FT_24M_OFFICE` | `IT_OFFICE` | definite | +24 tháng |
| `XEVN_INDEF_OFFICE` | `IT_OFFICE` | indefinite | no end |
| `XEVN_PROBATION_DRIVER` | `DRIVER` | probation | 60 ngày gợi ý |
| `XEVN_FT_12M_DRIVER` | `DRIVER` | definite | +12 tháng |
| `XEVN_FT_24M_DRIVER` | `DRIVER` | definite | +24 tháng |
| `XEVN_INDEF_DRIVER` | `DRIVER` | indefinite | no end |

---

## next_owner

**ba-docs**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-01
ref_spec: docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md
ref_outline: docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TEMPLATES-OUTLINE-01.md
evidence_prior: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-01.md

task:
1. ADD-only merge FR-UC-BP-CORE-09d (chọn template_code X.E 8 mã) vào Enterprise SRS dưới CORE-09 — không wipe 09a/b/c · không paste full HĐ body · no_prompt_echo.
2. Inventory clause groups titles theo SPEC §4; map J-HRM-CTR-04..06 vào journey / BA trace nếu có artifact.
3. Team note only: contracts_printable_ready=false; must_keep UF-HRM-02 + print-spine GWC + Q-CTR CLOSED.
4. Evidence: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-docs-01.md
5. next_dispatch_prompt → sa TechSpec enum template_code + keyword_map GPLX/đơn vị/số HĐ.

exit: ack_status PASS_TO_PM
cấm: apps/** · seed · claim printable UAT · đè Q-CTR
```

---

## handoff_packet

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-01` |
| from_role | ba-process |
| to_role | pm |
| entry_criteria | Sponsor Excel X.E + outline draft + SPEC-01 AS-IS |
| exit_criteria | 8-code matrix LOCK + SPEC delta + AC U65 + evidence |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-01.md` |
| ack_status | PASS_TO_PM |
| needed_by | same-session ba-docs |
| pm_dispatch_hint | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DOCS-01` → ba-docs |
