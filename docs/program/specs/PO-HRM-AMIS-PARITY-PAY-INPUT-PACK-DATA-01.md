# PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01 — Physical AMIS Step4 input packs

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` · `PO-HRM-AMIS-PARITY-PAY-DATA-01` §4 tier-2 sketch · **retain** `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01` |
| **change_mode** | **ADD** |
| **lane** | governance · ba-data |
| **date** | 2026-08-07 |
| **honesty** | `payroll_e2e_ready=false` · **cấm** invent LIVE · **cấm** `apps/**` · U65 |
| **spec_ref** | BR-AMIS-PAY-SRC-01 · **BR-AMIS-PAY-SRC-03** · FR-UC-BP-PAY-01/06 · Q-PAY-F-3 · ATT-11 |

---

## 0. Verdict (machine-readable)

| Decision | Value |
|----------|--------|
| **Pack A — chuyển công / closed reference** | **CONFIRMED ADD** `pay_period_timesheet_bind` — period ↔ **header** only |
| **Pack B/C — thu nhập khác + tạm ứng** | **CONFIRMED ADD** `pay_period_input_lines` — grain `(period_id, employee_id, component_code, source_kind)` |
| **Hours var bag** | **Retain** `att_timesheet_line` per ATT-LINE-01 — **alias ≠ bind** |
| **Advance workflow AS-IS** | **KEEP** `advance_requests` + `advance_request_employees` — bridge → input lines at `paid`/`linked` |
| **RD→PAY** | Read `hrm_reward_discipline` at process **or** materialize `rd_transfer` input line — both via SRC-03 |
| **Unlock** | **sa** F-PAY-INPUT-PACK F.1 → then **dev-be** ensureSchema + PROCESS SRC-03 |
| **R-PAY-INPUT-PACK** | Physical design **LOCKED** this seat |

---

## 1. AMIS Step4 → three physical packs

```text
AMIS Step4 "Dữ liệu tính lương"
├── Pack A: Bảng công đã chốt / chuyển tính lương  → pay_period_timesheet_bind (header ref)
│            Hour/OT/leave vars (orthogonal)         → att_timesheet_line (ATT-LINE-01 — cite only)
├── Pack B: Thu nhập khác (lễ, công tác, thưởng NS) → pay_period_input_lines (other_income|rd_transfer|manual)
└── Pack C: Tạm ứng theo kỳ + NV                  → pay_period_input_lines (advance) + advance_* bridge
```

**Alias lock (critical):**

| Logical | Physical | Role | ≠ |
|---------|----------|------|---|
| Timesheet **header** bind / chuyển công | `pay_period_timesheet_bind.timesheet_header_id` → `attendance_sheets.id` | Period declares which **closed sheet** is payroll input | **Not** `att_timesheet_line` |
| Timesheet **line** hours bag | `att_timesheet_line` (ATT-LINE-01) | Per-employee hour columns for formula vars | **Not** bind table; **not** alias |

---

## 2. CONFIRMED ADD — `pay_period_timesheet_bind`

> Enterprise logical §5.2 · Nest AS-IS = **ABSENT** (service EXISTS probe on `attendance_sheets.status=closed` only — cite HIRE-DB-01).

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | Plane B slug |
| `payroll_period_id` | uuid | NO | Soft FK → `payroll_periods.id` |
| `timesheet_header_id` | uuid | NO | Soft FK → `attendance_sheets.id` (**alias** logical `att_timesheet_header`) |
| `transfer_kind` | text | NO | Default `closed_transfer` — open string (`manual_bind` \| `closed_transfer`) — **no CHK IN N** |
| `bound_at` | timestamptz | NO | When chuyển/bind recorded |
| `bound_by` | text/uuid | YES | Actor |
| `note` | text | YES | VI reason / AMIS chuyển label |
| `archived_at` | timestamptz | YES | Soft-unbind |

| Constraint | Rule |
|------------|------|
| **UQ** | `(payroll_period_id, timesheet_header_id)` WHERE `archived_at IS NULL` |
| **IX** | `(company_id, payroll_period_id)` · `(timesheet_header_id)` |
| **BR-BIND-01** | App assert header `status='closed'` before bind/process — else **`HRM-PAY-ATT-412`** |
| **BR-BIND-02** | Header `[start_date,end_date]` must overlap period window (same resolver as ATT-412 today) |
| **BR-BIND-03** | **Cấm** bind punch / leave_request / OT request ids |
| **scope_parity U19** | List/get bind uses **same** company expand as period list/get |

**Process read path (GĐ1):**

1. Load active bind row(s) for `payroll_period_id`.
2. Assert each `timesheet_header_id` closed.
3. For hour vars: follow ATT-LINE-01 SELECT on `att_timesheet_line` for employees — **bind does not store hours**.

**Rejected:**

| Option | Verdict |
|--------|---------|
| Store hours on bind row | **REJECT** — dual SoT vs `att_timesheet_line` |
| Use `att_timesheet_line.id` as bind FK | **REJECT** — wrong grain (line ≠ period transfer) |
| Keep probe-only forever | **REJECT** for AMIS chuyển công UX + AC-AMIS-ATT-XFER-01 |

---

## 3. CONFIRMED ADD — `pay_period_input_lines` (SRC tier 2 · BR-AMIS-PAY-SRC-03)

**Purpose:** Period-variable **amounts** per employee+component — wins over template/catalog when row exists (SRC-03). Orthogonal to hour vars (SRC-01 / ATT-LINE).

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | uuid | NO | PK |
| `company_id` | text | NO | |
| `period_id` | uuid | NO | Soft FK → `payroll_periods.id` |
| `employee_id` | uuid | NO | Soft FK → `employees.id` |
| `component_code` | text | NO | Open catalog code (`salary_components.code`) |
| `amount` | numeric(18,2) | NO | Plain VND quantity — FE vi-VN grouping on wire parse |
| `quantity` | numeric(12,4) | YES | Optional non-money qty (days/units) when component nature needs |
| `source_kind` | text | NO | Open string — see §3.1 |
| `source_ref` | text | YES | Trace id e.g. `advance_request_employee:{uuid}` · `reward_discipline:{uuid}` |
| `effective_date` | date | YES | Optional intra-period dating |
| `note` | text | YES | |
| `created_by` / `updated_by` | text | YES | |
| `created_at` / `updated_at` | timestamptz | NO | |
| `archived_at` | timestamptz | YES | Soft-delete |

| Constraint | Rule |
|------------|------|
| **UQ active** | `(period_id, employee_id, component_code, source_kind)` WHERE `archived_at IS NULL` |
| **IX** | `(company_id, period_id)` · `(employee_id, period_id)` · `(component_code)` |
| **CHK** | `amount` finite; component must exist in company catalog (app assert) |
| **Immutability** | After period `status` ∈ (`processing`,`closed`) — PATCH/DELETE → **`HRM-PAY-PERIOD-409-IMMUTABLE`** unless admin reopen policy |

### 3.1 `source_kind` vocabulary (open catalog — no DB CHK IN)

| source_kind | AMIS pack | Writer | Maps |
|-------------|-----------|--------|------|
| `other_income` | Thu nhập khác (lễ, công tác, tay) | PAY C&B UI / import | AC-PAY-SRC-03 |
| `advance` | Tạm ứng khấu trừ kỳ | Bridge from `advance_request_employees` or direct entry | AC-PAY-SRC-03 advance |
| `rd_transfer` | KT/KL thi hành vào kỳ | CORE RD link or PAY materialize | F-PAY-RD-APPLY-01 |
| `manual` | Điều chỉnh kỳ có lý do | C&B | Audit |

### 3.2 BR-AMIS-PAY-SRC-03 (locked)

| Condition | Action | Outcome | Fail if |
|-----------|--------|---------|---------|
| Active input line for `(period, employee, component_code)` and component `nature`/`component_type` marks **period-variable** | Resolver uses `amount` (± `quantity` rule per component) **before** template override (tier 3) and catalog default (tier 4) | Payslip line `source_tier=period_input` · `source_ref` populated | Pack ignored → silent 0 |
| No input line | Fall through to SRC-04 → SRC-05 | Normal precedence | N/A |
| Input line present but `amount=0` with note "intentional zero" | Allowed **only** when component policy allows explicit zero row | Line 0 with audit | 0 without row when policy requires pack |

**Hour vars:** SRC-03 does **not** apply to `payable_hours` / ATT keys — those stay SRC-01 + ATT-LINE-01.

---

## 4. Tạm ứng — per period+employee bridge

### 4.1 AS-IS (KEEP — wrong grain for SRC)

```text
advance_requests (batch header: name, salary_period TEXT, total_amount, status, approval_steps)
advance_request_employees (request_id, employee_id?, employee_code, advance_amount, note)
```

| Gap | Fix |
|-----|-----|
| Batch ≠ `(period_id, employee_id)` SRC grain | **Bridge** on status `approved`/`paid` → upsert `pay_period_input_lines` `source_kind=advance` |
| `salary_period` free TEXT | Map to `payroll_periods.id` via period picker — **cấm** TEXT as SoT |
| CASCADE hard delete on request | Input line **soft-archive** on cancel — retain audit |

### 4.2 Bridge rule (CONFIRMED)

| ID | Rule |
|----|------|
| **BR-PAY-ADV-BRIDGE-01** | When advance line `paid` (or policy `approved_for_payroll`), upsert input line: `amount = advance_amount`, `source_ref = advance_request_employee:{id}` |
| **BR-PAY-ADV-BRIDGE-02** | Duplicate bridge same ref → idempotent upsert |
| **BR-PAY-ADV-BRIDGE-03** | Cancel/reject advance → archive input line (not hard delete) |
| **BR-PAY-ADV-BRIDGE-04** | PROCESS reads **input line** for SRC-03 — **not** live join to `advance_requests` mid-evaluate |

**UQ note:** One employee may have multiple advances same period → allow multiple rows only if `source_ref` differs; else UQ on `(period, employee, component_code, source_kind)` forces one advance total per component — **component_code** for advance typically `tam_ung` / catalog advance code (tenant-defined).

---

## 5. Thu nhập khác + RD

| Path | Storage | When |
|------|---------|------|
| **Manual other income** | `pay_period_input_lines` `other_income` | C&B enters lễ/tết/công tác |
| **RD enforced** | Prefer process read `hrm_reward_discipline` WHERE `payroll_period_id` + amount; optional materialize `rd_transfer` line for audit | F-PAY-RD-APPLY-01 |
| **Both present** | Input line **wins** if exists (SRC-03); else RD read | No double count |

Optional EXPAND later: `pay_period_input_pack` header (selected pack types per period) — **DEFER GĐ1**; period flags on `payroll_periods.input_pack_flags_json` optional P2.

---

## 6. Lifecycle

### 6.1 `pay_period_timesheet_bind`

| State | Rule |
|-------|------|
| Active | One or more binds per period (multi-OU later); default one company sheet |
| Unbind | Set `archived_at` — only before period process |
| Period processed | Bind immutable — new kỳ required to change sheet |

### 6.2 `pay_period_input_lines`

| Period status | Input lines |
|---------------|-------------|
| `draft` / `open` | CRUD allowed |
| `processing` / `closed` | Immutable — 409 |
| Reopen period (policy) | Admin lane only — audit |

Invalid transitions: bind open sheet → ATT-412. Process with required period-variable component and no line when policy requires pack → FORMULA-412 or SRC VI (not silent 0).

---

## 7. Validation matrix

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-INP-BIND-01 | Bind header not closed | **412** ATT |
| VAL-INP-BIND-02 | Bind header company ≠ period company (no rollup) | **409** scope |
| VAL-INP-BIND-03 | Duplicate active bind same pair | **409** |
| VAL-INP-BIND-04 | List bind id under group CEO `main` but get 404 | **scope_parity FAIL** |
| VAL-INP-LINE-01 | Missing required fields | **400** |
| VAL-INP-LINE-02 | Unknown `component_code` | **404/422** |
| VAL-INP-LINE-03 | Mutate after period immutable | **409** |
| VAL-INP-LINE-04 | Duplicate active UQ tuple | **409** |
| VAL-INP-SRC-03 | Input line exists · process runs | Line amount = pack; `source_tier=period_input` |
| VAL-INP-SRC-03b | Input ignored | **FAIL** QA — silent 0 |
| VAL-INP-ADV-01 | Bridge from paid advance | Input line with `source_ref` |
| VAL-INP-FE-01 | FE posts net total as pack SoT | Reject OS28 |

---

## 8. Traceability

| Requirement | BR | Physical | API (next SA) | Test |
|-------------|-----|----------|---------------|------|
| AMIS Step4 chuyển công | SRC-01 bind · ATT-11 | `pay_period_timesheet_bind` | F-PAY-PERIOD-BIND-01 | AC-AMIS-ATT-XFER-01 |
| AMIS thu nhập khác | **SRC-03** | `pay_period_input_lines` | F-PAY-PERIOD-INPUT-01 | AC-PAY-SRC-03 |
| Tạm ứng kỳ | SRC-03 | input lines + advance bridge | F-PAY-ADV-BRIDGE-01 | AC-PAY-SRC-03 advance |
| Hour vars | SRC-01 | **ATT-LINE-01** `att_timesheet_line` | F-PAY-ATT-CLOSED-01 | QA-ATT-LINE (retain) |
| RD→PAY | P3 | `rd_transfer` or read RD | F-PAY-RD-APPLY-01 | KT/KL line |
| Payslip audit | depth-01 | `source_tier` / `source_ref` on lines | PROCESS EXPAND | RUN-06/07 |

**J-*:** J-HRM-06c (close+bind) · J-HRM-07 (process with packs) — not promoted this seat.

---

## 9. Unlock path

| Step | Owner | Gate |
|------|-------|------|
| **1 (this seat)** | ba-data | CONFIRMED ADD DDL contract |
| **2** | **sa** | F-PAY-INPUT-PACK F.1 — bind CRUD + input line CRUD + PROCESS SRC-03 read |
| **3** | dev-be | ensureSchema + wire bind + input lines + advance bridge + SRC resolver |
| **4** | qa | U65 AC-PAY-SRC-03 · AC-AMIS-ATT-XFER-01 |

**Serial:** SA F.1 **after** this CONFIRMED. **Parallel OK:** formula BE · ATT-LINE BE (independent tables).

**Retain:** `PO-HRM-PAYROLL-FORMULA-RUN-GAP-DATA-ATT-LINE-01` — do not merge line DDL into bind.

---

## 10. Honesty

| Flag | Value |
|------|-------|
| `payroll_e2e_ready` | **false** |
| LIVE input packs | **false** |
| `apps/**` | untouched |
| Seed U65 | forbidden |

---

## DOC-DELTA pointer

- Client `DB_DESIGN_HRM_ENTERPRISE.md` §5.2 `pay_period_timesheet_bind` — **CONFIRMED physical** for Nest ADD (was logical-only / service probe).
- §5.7 `pay_payslip_line.source_ref` — use `period_input:{id}` pattern.
- Enterprise API §F-PAY-PERIOD-01 — bind table name locked.
- **No wipe** ATT-LINE-01 · pay-data-01 template sections.
