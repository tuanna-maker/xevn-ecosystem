# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DOCS-01` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` · SPEC XEVN-TPL-01 |
| **from_role** | ba-docs |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD-only · no_prompt_echo |
| **honesty (team only)** | `contracts_printable_ready=false` — **không** claim printable UAT |
| **must_keep** | UF-HRM-02 · print-spine GWC · Q-CTR-01/02 CLOSED · CORE-09 · 09a · 09b · 09c |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| SPEC XEVN-TPL | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md` §2–§7 (8 `template_code` · clause titles §4 · AC-CTR-XEVN · FR-09d draft) |
| Outline | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TEMPLATES-OUTLINE-01.md` (giữ UNICOM; ADD-only) |
| Prior DOCS | `docs/qa/evidence/po-hrm-contract-legal-print-docs-01.md` (CORE-09a/b/c path) |
| Prior SPEC evidence | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-01.md` |
| Enterprise SRS | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-09 · 09a · 09b · 09c (preserve) |

---

## 2. SRS paths / sections touched

| Path | Section / delta |
|------|-----------------|
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | Header → **v0.19** · inventory **59** |
| same | §3.A inventory **58→59**; row **12d** UC-BP-CORE-09d |
| same | **FR-UC-BP-CORE-09** — cross-ref ADD 09d (giữ AC-CTR-TPL · sổ đăng ký) |
| same | **FR-UC-BP-CORE-09b** — bước luồng cross-ref 09d (không wipe AC-CTR-PRINT) |
| same | **ADD** `### FR-UC-BP-CORE-09d` — 8 `template_code` · clause group titles · BR-CTR-TPL-01..07 · AC-CTR-XEVN-01..10 · 7 mục Bateco |
| same | §6.2 Nhật ký → **v0.19** |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | CORE: ADD UC-BP-CORE-09d · ver **0.3.7** · HR-002 map |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **ADD** J-HRM-CTR-04 · 05 · 06 (⬜ DRAFT paper) · changelog row |
| Outline XEVN-TPL | Matrix status: SRS merge DONE |

**Không đụng:** `apps/**` · seed · wipe 09a/b/c · paste full HĐ body · đè Q-CTR · claim printable UAT.

---

## 3. Clause group titles (SPEC §4 — titles only)

| # | Title (logic) | OFFICE | DRIVER |
|---|---------------|--------|--------|
| 0–1 | Quốc hiệu / số HĐ / đơn vị · Bên A/B | ✓ | ✓ + GPLX block |
| 2 | Điều 1 — Thời hạn và công việc | Nhãn theo template | + chức danh lái |
| 3 | Điều 2 — Chế độ làm việc | VP | + GTĐB / phương tiện |
| 4 | Điều 3 — NLĐ quyền/nghĩa vụ | NDA/SI… | + DRIVER_* · license notice |
| 5–7 | Điều 4 NSDLĐ · thi hành · chữ ký | ✓ | ✓ |

**Cấm trong SRS khách:** full body Điều từ Excel / workbook gốc.

---

## 4. Quality gates (ba-docs)

| Check | Result |
|-------|--------|
| Uniform FR: sequenceDiagram + Diễn biến 4 cột | **PASS** 09d |
| 7 mục Bateco / FR | **PASS** |
| no_prompt_echo (Ctrl+F work_item / docs/program / U65 / Sponsor trong thân FR-09d) | **PASS** |
| CORE-09 + 09a/b/c + AC-CTR-TPL/PRINT preserved | **PASS** |
| Client SRS không claim printable live | **PASS** |
| Team honesty `contracts_printable_ready=false` | **PASS** (evidence / journey DRAFT only) |
| Q-CTR / UF-HRM-02 must_keep | **PASS** (không mở lại) |

---

## 5. completion_report

**Closed:** ADD-only merge **FR-UC-BP-CORE-09d** (8 `template_code` X.E) vào Enterprise SRS **v0.19**; inventory **59**; UC inventory 0.3.7; J-HRM-CTR-04..06 DRAFT trên journey map; UNICOM outline giữ; client VI; honesty printable=false team-only.

**Residual:** sa TechSpec — enum `template_code` + `keyword_map` (GPLX · đơn vị · số HĐ pattern) · ba-data physicalize · Settings 8 rows · BE/FE · QA AC-CTR-XEVN-* (sau code). **Không** claim printable UAT.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **sa**

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECH-01
from_role: pm
to_role: sa
change_mode: ADD
parent: PO-HRM-CONTRACT-LEGAL-PRINT-01
read_first:
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09d (v0.19) + 09 · 09a · 09b · 09c
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md §2 matrix · §5 merge fields · §9 Tech/DATA
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md (print-spine AS-IS — ADD-only)
  - docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-docs-01.md
task: |
  TechSpec delta (ref_srs CORE-09d):
  - Enum / check constraint 8 template_code XEVN_* (+ giữ GENERAL legacy nếu có)
  - Map template_code → pack_code (IT_OFFICE|DRIVER) · term_type · default_duration
  - keyword_map: GPLX fields · employer_unit / đơn vị đa pháp nhân · contract_number patterns (§5.3)
  - Snapshot template_code trên ban hành; validate indefinite vs definite effective_to
  - API F.1 map Diễn biến FR-09d (mục đích · nghiệp vụ · bước SRS)
  - Honesty: contracts_printable_ready=false; must_keep UF-HRM-02 · print-spine GWC · Q-CTR CLOSED
forbidden: apps/** · seed · wipe CORE-09a/b/c · claim printable UAT · paste full HĐ body
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-tech-01.md
```

---

## 7. ack_status

**PASS_TO_PM**
