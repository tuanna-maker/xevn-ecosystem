# BA-UX-VI-FORMAT-AC-01 — Evidence (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-UX-VI-FORMAT-AC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **SoT AC** | [`docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md`](../../program/UX_VI_DATE_NUMBER_FORMAT_AC.md) |
| **Pointers** | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §2b · `.cursor/rules/uiux-quality-accessibility.mdc` |

---

## 1. completion_report

### Closed

1. **AC delta ngắn** (không rewrite SRS): date `dd/MM/yyyy` (+ `HH:mm` khi datetime); money/qty MUST = thousand group vi-VN khi typing; submit = numeric.
2. **Phân loại field MUST vs EXEMPT** với BR-UX-DATE-01/02, BR-UX-NUM-01..03 và AC-UX-DATE/NUM measurable.
3. **Pointer** USER_FLOW + UIUX rule always-on.
4. **QA acceptance checklist** copy-ready (§3) cho sau FE waves (`D-UX-VI-FORMAT-SHARED-01` → HRM/Portal/Mobile).

### Residual (không block BA)

| ID | Item | Owner |
|----|------|-------|
| R1 | Inventory file-level `type=number` | `D-UX-VI-FORMAT-INVENTORY-01` (explore) |
| R2 | Shared util + wire | `D-UX-VI-FORMAT-SHARED-01` + follow-on FE |
| R3 | Headcount &lt;1000 optional group — confirm nếu sponsor muốn always | PM only if sponsor objects |

### Explicit non-claims

- Không sửa `apps/**` / seed / Phase1 DONE.

---

## 2. Spec says / code does (baseline note)

| Topic | Spec says (this delta) | Code does (spot 2026-07-20) |
|-------|------------------------|----------------------------|
| Date display | `dd/MM/yyyy` | Nhiều màn đã `format(..., 'dd/MM/yyyy')` + `formatDisplayDate`; chưa 100% project-wide |
| Money typing | Group while typing | Nhiều MUST field còn `type="number"` raw (vd. `EmployeeFormDialog` salary placeholder `20000000`) |
| Money display | vi-VN | Một phần đã `Intl.NumberFormat('vi-VN')` (Insurance, JobPostings, BonusPolicy…) |
| % cổ đông | EXEMPT | Align prior BA ratio vs contributed — `ratio_percent` không group |

---

## 3. QA acceptance checklist (sau FE waves)

**Entry:** FE shared util READY_FOR_QA + wire ít nhất sample MUST trên XBOS + HRM.  
**Mode:** U65 browser-only; persona `ceo@xe.vn`; **cấm seed**.

### 3.1 Date

| # | Step | PASS when |
|---|------|-----------|
| D1 | HRM Contracts — mở list/detail | Effective/expiry = `dd/MM/yyyy` |
| D2 | Recruitment — deadline trên form + list | `dd/MM/yyyy`; sau Lưu + F5 giữ format |
| D3 | Attendance — date filter / record date | Display `dd/MM/yyyy` |
| D4 | Inbox / audit stamp user-facing (nếu in-scope wave) | `dd/MM/yyyy HH:mm` |
| D5 | Negative | Không ISO-Z / Invalid Date trên UI |

### 3.2 Number MUST

| # | Step | PASS when |
|---|------|-----------|
| N1 | Employee form — lương (hoặc tương đương MUST) | Gõ `20000000` → UI `20.000.000` (vi-VN) trước submit |
| N2 | Network POST/PUT | Body numeric `20000000` (không `"20.000.000"`) |
| N3 | F5 | Display vẫn grouped |
| N4 | XBOS — vốn điều lệ hoặc `contributedValue` | Cùng N1–N3 |
| N5 | Insurance / payroll money sample (nếu đã wire wave) | Cùng N1–N3 |

### 3.3 Number EXEMPT

| # | Step | PASS when |
|---|------|-----------|
| E1 | Pagination `page_size` / page control | Không thousand-group |
| E2 | Shareholder `ratio_percent` (nếu test UF-XBOS-04/05) | Nhập `25` / `25.5` — **không** `25.000` nhầm group |
| E3 | Candidate rating / KPI score 0–100 | Không group |
| E4 | OTP (nếu màn có) | Không group |

### 3.4 Evidence QA phải ghi

```markdown
### UF / field — UX-VI-FORMAT
- Persona / URL / click path: …
- Before: …
- Typing display: …
- Network: … → 2xx; body field type/value: …
- FE after 2xx + F5: …
- MUST/EXEMPT class: …
- Verdict: 🟢 / 🔴
- spec_ref: docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md · AC-UX-*
```

**Exit QA:** Checklist D1–D5 + N1–N4 + E1–E2 PASS trên sample đã wire; residual field chưa wire = **not promoted** (không PASS toàn project khi inventory còn mở).

---

## 4. next_owner / next_dispatch_prompt

**next_owner:** pm → sau FE waves: **qa**

**next_dispatch_prompt (copy-ready):**

```text
work_item_id: QA-UX-VI-FORMAT-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-VI-FORMAT-SHARED-01 (+ HRM/Portal wire waves) READY_FOR_QA; L0 stack up; U65 zero-seed
exit_criteria: Browser evidence theo docs/qa/evidence/ba-ux-vi-format-ac-01-20260720.md §3 — PASS D1–D5, N1–N4, E1–E2 trên sample đã wire; ghi not promoted cho field chưa wire; cấm PASS chỉ unit test
evidence_path: docs/qa/evidence/qa-ux-vi-format-01-YYYYMMDD.md
spec_ref: docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md
cấm: seed · Phase1 DONE · claim full-project PASS khi inventory còn mở
```

---

## 5. Handoff contract

- **completion_report:** §1
- **next_owner:** pm (dispatch FE nếu chưa xong shared; rồi qa)
- **next_dispatch_prompt:** §4
- **evidence_path:** `docs/qa/evidence/ba-ux-vi-format-ac-01-20260720.md`
- **ack_status:** **PASS_TO_PM**
