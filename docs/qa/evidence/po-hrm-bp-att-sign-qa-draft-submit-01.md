# Evidence — PO-HRM-BP-ATT-SIGN-QA-DRAFT-SUBMIT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-QA-DRAFT-SUBMIT-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | execution · **C-DRAFT-SUBMIT-FE** closure · UF-HRM-ATT-SIGN / J-HRM-06c submit leg |
| **entry** | QC [`po-hrm-bp-att-sign-qc-01.md`](po-hrm-bp-att-sign-qc-01.md) **C-DRAFT-SUBMIT-FE** · QA-05 no draft · FE [`po-hrm-bp-att-sign-fe-submit-01.md`](po-hrm-bp-att-sign-fe-submit-01.md) |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | L0 **PASS** · FE **Gửi chờ ký** **201** · **`att-sign-panel`** + F5 **`submitted`** 🟢 |
| **u65_zero_seed** | true — no `pnpm seed:*` · draft from **Thêm bảng** UI (run 1) |
| **attendance_closed** | **false** |
| **product_go** | **false** |
| **remaster_program_done** | **false** |
| **hdsd_align** | **Chấm công** → **Bảng chấm công** → kỳ nháp → **Gửi chờ ký** → F5 |
| **runtime_commit** | `dc930c5` |

---

## L0 — stack / FE↔BE

| Check | Result | Notes |
|-------|--------|--------|
| `pnpm run qc:dev-stack` | **PASS (checks)** | hrm :28001 · xbos :28002 · portal :5173 **200** |
| Node exit Windows | **OBS-L0-UV-EXIT** | exit **3221226505** after summary |
| `pnpm run qc:fe-be-health` | **PASS** | exit **0** |

Seed: **none**

---

## U65 browser — draft obtain → submit → F5

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Repro:** `node scripts/qa/_tmp-po-hrm-bp-att-sign-qa-draft-submit-01.mjs`  
**Target sheet:** `ae71f0b0-a3cb-43ab-9f5f-f42004add657` · `QA-BP-ATT-SIGN-DRAFT-SUBMIT-01`

### Draft obtain (U65 — no seed)

| Step | Result |
|------|--------|
| Env before run | QA-05: both prior sheets **submitted/closed** — no draft for submit |
| **Run 1 (same session)** | **Chấm công** → **Bảng chấm công** → **`att-sheets-add`** → dialog **`att-add-sheet-dialog`** → **Lưu** → `POST …/attendance-sheets` **201** (kỳ 01/09/2026–30/09/2026) |
| **Run 2 (verdict run)** | API list: draft row present · **no** create repeat |

### Click path (run 2 — submit leg)

| Step | Result |
|------|--------|
| S0 Login + **Bảng chấm công** | 🟢 `att-sheets-precision` · GET list **200** |
| S1 Open draft row `ae71f0b0-…` | 🟢 **`att-sign-panel-hold-draft`** · **`att-sheet-submit`** visible |
| S2 **Gửi chờ ký** (`att-sheet-submit`) | 🟢 **`POST …/submit?company_id=main` → 201** |
| S3 FE sau 2xx | 🟢 hold-draft **hidden** · **`att-sign-panel`** visible · GET **signatures 200** |
| S4 F5 + reopen row | 🟢 panel persists · API GET sheet **`status=submitted`** |

**Console:** `pageErrors=[]`

### Network highlights (proxy :5173)

| Call | HTTP |
|------|------|
| `GET …/attendance-sheets?company_id=main` | **200** |
| `POST …/ae71f0b0-…/submit?company_id=main` | **201** |
| `GET …/ae71f0b0-…/signatures?company_id=main` | **200** (×2 post-mutation + F5) |

### FE post-mutation (submit — SRS AC)

- **Action:** click **Gửi chờ ký** → POST **201**.
- **FE after 2xx:** panel **`att-sign-panel`** (no **`att-sign-panel-hold-draft`**); signatures ladder loaded.
- **F5:** reopen same kỳ → **`att-sign-panel`** still shown · API **`submitted`**.

---

## Condition closure

| QC condition | QA verdict |
|--------------|------------|
| **C-DRAFT-SUBMIT-FE** | **CLOSED** on browser evidence (this file) |

---

## J-HRM-06c / AC (submit leg only)

| Step | Verdict |
|------|---------|
| FE draft obtain (SRS UF-HRM-16 / add sheet) | 🟢 run 1 **201** |
| Submit → sign panel | 🟢 |
| F5 submitted persist | 🟢 |
| Sign → close → F5 (full journey) | **not re-run** this wave — see [`po-hrm-bp-att-sign-qa-05.md`](po-hrm-bp-att-sign-qa-05.md) |

**not promoted:** Attendance **CLOSED** · **product GO** · **remaster DONE** · QC full UF browser GO · **C-UF-07-NEG**

---

## Residual / OBS

| ID | Owner | Priority | Notes |
|----|-------|----------|--------|
| **OBS-L0-UV-EXIT** | devops | P2 | Windows node abort after `qc:dev-stack` |
| **OBS-UF-07-NEG** | qa | P2 | Negative close still open (QC GWC) |
| **OBS-QA-PROBE-DATA-DATA** | qa | P3 | Probe script initially parsed list as empty (`data.data` vs `items`) — fixed in script; no product defect |

---

## completion_report

**Closed:** **C-DRAFT-SUBMIT-FE** — U65 FE chain: create draft (when env empty) + **`att-sheet-submit`** → **201** + **`att-sign-panel`** + F5 **`submitted`**.

**Open:** Full J-HRM-06c end-to-end on **new** draft through sign+close in one browser session; UF-07 negative; product/QC gates.

---

## next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | `pm` → `qc` |
| **ack_status** | **PASS_TO_PM** |

```text
work_item_id: PO-HRM-BP-ATT-SIGN-QC-01-DRAFT-SUBMIT-REVIEW
role: qc
read_first: docs/qa/evidence/po-hrm-bp-att-sign-qa-draft-submit-01.md · po-hrm-bp-att-sign-qc-01.md
entry_criteria: QA PASS_TO_PM C-DRAFT-SUBMIT-FE closed; U65 evidence paths present
exit_criteria: Re-stamp UF browser GWC — C-DRAFT-SUBMIT-FE closed; C-UF-07-NEG may remain P2; no product GO / Attendance CLOSED claim
cấm: seed · Attendance CLOSED claim
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qc-01.md (append delta) or po-hrm-bp-att-sign-qc-01-draft-submit-02.md
```

Optional FE follow-up only if PM wants **reopen closed sheet** UX (not required for this condition):

```text
work_item_id: PO-HRM-BP-ATT-SIGN-FE-REOPEN-01
role: dev-fe
entry_criteria: SRS allows reopen from UI; pilot has only closed rows for regression
exit_criteria: att-reopen control on closed sheet → draft|submitted per spec · testid · READY_FOR_QA
blocked_if: SRS has no reopen UC — dispatch ba-process first
```

---

## Artifacts

| Type | Path |
|------|------|
| Browser JSON | `docs/qa/evidence/_tmp-po-hrm-bp-att-sign-qa-draft-submit-01-browser.json` |
| Screens | `docs/qa/evidence/screens/po-hrm-bp-att-sign-qa-draft-submit-01/` (`01`–`05`) |
| Probe script | `scripts/qa/_tmp-po-hrm-bp-att-sign-qa-draft-submit-01.mjs` |
| UF map | `docs/qa/evidence/po-hrm-bp-att-sign-uf-ba-01.md` |
