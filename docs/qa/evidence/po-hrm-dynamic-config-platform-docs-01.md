# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DOCS-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DOCS-01` |
| **parent** | `PO_HRM_DYNAMIC_CONFIG_PLATFORM_01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-07 |
| **change_mode** | ADD-only DOC-DELTA · no wipe 09a/b/c/d · no_prompt_echo |
| **honesty (team only)** | `contracts_printable_ready=false` — **không** claim printable UAT / Phase1 DONE |
| **sponsor_confirm** | Option B CONFIRMED · BA matrix PASS · ADR CONFIRMED |
| **must_keep** | UF-HRM-02 · print-spine GWC · Q-CTR-01/02 CLOSED · CORE-09 · 09a · 09b · 09c · 09d body (EXPAND wording only) · REC-00a/b/c |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| ADR | `docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` — Option B · Catalog + FormSchema + MergeToken · L1–L7 |
| BA matrix | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md` — AC-PLT-CTR-01..06 · BR-PLT-01..06 |
| CORR-01 | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01.md` — AC-CTR-XEVN-11 · open catalog |
| Enterprise SRS prior | `SRS_HRM_ENTERPRISE.md` v0.19 FR-UC-BP-CORE-09 · 09a · 09b · 09c · 09d |
| Profile | `.cursor/skills/client-delivery-docs/PROJECT_PROFILE.md` |

---

## 2. SRS paths / sections touched

| Path | Section / delta |
|------|-----------------|
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | Header → **v0.20** · inventory **60** |
| same | §3.A inventory row **12e** UC-BP-PLT-01; 12d title → catalog mở |
| same | **FR-UC-BP-CORE-09** — cross-ref PLT-01 + catalog mở (giữ AC-CTR-TPL) |
| same | **FR-UC-BP-CORE-09b** — bước 2 cross-ref catalog mở (không wipe AC-CTR-PRINT) |
| same | **EXPAND** `### FR-UC-BP-CORE-09d` — catalog mở · starter 8 = ví dụ · BR-CTR-TPL-DYN · AC-CTR-XEVN-01/10 REVISED · **ADD** AC-CTR-XEVN-11 · **ADD** AC-PLT-CTR-01..06 · giữ 09d 7 mục + bảng 8 mã + BR-CTR-TPL-01..07 |
| same | **ADD** `### FR-UC-BP-PLT-01` — danh mục · schema · trường trộn · BR-PLT-01..06 · AC-PLT-SET/CAT/REC/PAY/EMP + pointer CTR |
| same | §6.2 Nhật ký → **v0.20** |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | ADD UC-BP-PLT-01 · EXPAND 09d · ver **0.3.8** · HR-002 map |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **ADD** J-HRM-CTR-07 · CTR-04 wording open catalog · changelog |

**Không đụng:** `apps/**` · seed · wipe 09a/b/c · paste full HĐ body · claim printable UAT · đè Q-CTR.

---

## 3. Quality gates (ba-docs)

| Check | Result |
|-------|--------|
| Uniform FR: sequenceDiagram + Diễn biến 4 cột | **PASS** PLT-01 · 09d |
| 7 mục Bateco / FR | **PASS** |
| no_prompt_echo trong thân FR mới/EXPAND (work_item / U65 / Sponsor / path docs/program) | **PASS** |
| CORE-09 + 09a/b/c preserved | **PASS** |
| 09d ADD-only (không wipe bảng 8 mã / AC-02..09 / BR-TPL-01..07) | **PASS** |
| Client SRS không claim printable live | **PASS** |
| Team honesty `contracts_printable_ready=false` | **PASS** (evidence / journey DRAFT only) |
| CORR AC-11 + AC-PLT-CTR-01..06 on 09d | **PASS** |
| Align TECH | TECH-01 đã có SoT platform — SRS v0.20 sẵn `ref_srs` cho cascade |

---

## 4. completion_report

**Closed:** ADD-only DOC-DELTA Enterprise SRS **v0.20** — **FR-UC-BP-PLT-01** (nguyên tắc platform) + **EXPAND FR-UC-BP-CORE-09d** (catalog mở · AC-CTR-XEVN-11 · AC-PLT-CTR-01..06); inventory **60**; UC inventory 0.3.8; J-HRM-CTR-07 DRAFT; giữ 09 · 09a · 09b · 09c · 09d; client VI; honesty printable=false team-only.

**Residual:** align TechSpec platform (`PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01`) ↔ SRS v0.20 nếu cần F.1 pointer; ba-data physical; Dev/QA AC-PLT-CTR / AC-CTR-XEVN-11 sau code. **Không** claim printable UAT.

---

## 5. next_owner / next_dispatch_prompt

**next_owner:** **pm** → align **sa** TECH (đã PASS) / **ba-data** DATA-01 in-flight

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECH-ALIGN-01 (optional narrow)
from_role: pm
to_role: sa
change_mode: ADD
read_first:
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.20 FR-UC-BP-PLT-01 + FR-UC-BP-CORE-09d
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md
  - docs/qa/evidence/po-hrm-dynamic-config-platform-docs-01.md
task: |
  Confirm TechSpec ref_srs points to SRS v0.20 FR-PLT-01 + 09d open catalog (AC-CTR-XEVN-11 · AC-PLT-CTR).
  ADD-only if F.1 / matrix gap; no wipe; contracts_printable_ready=false.
forbidden: apps/** · claim printable UAT · paste full HĐ
exit: PASS_TO_PM · evidence update tech-01 or short align note
```

Nếu DATA-01 đang DISPATCHED → PM intake ba-data trước; TECH align chỉ khi còn lệch `ref_srs`.

---

## 6. ack_status

**PASS_TO_PM**
