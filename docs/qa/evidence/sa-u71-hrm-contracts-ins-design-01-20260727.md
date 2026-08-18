# SA-U71-HRM-CONTRACTS-INS-DESIGN-01 — Physical DB + API (Contracts + Insurance)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-CONTRACTS-INS-DESIGN-01` |
| **lane** | governance · U71 P1 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **forbidden** | `apps/**` (not touched) |

---

## 1. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN (paired) | `docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md` | **ADD** — `employee_contracts` + `employee_insurance_records` |
| API_DESIGN F.1 | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` | **ADD** — list/get/create/update contracts + list/create insurance + expiring ×2 |
| Pointers | `docs/tech-spec/DB_DESIGN_HRM_CONTRACTS_INS.md` · `API_DESIGN_HRM_CONTRACTS_INS.md` | **ADD** thin |
| Index | `docs/tech-spec/README.md` §2 / §3 | **UPDATED** — COMPLETE F.1; backlog marked DONE |

---

## 2. F.1 coverage checklist

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS |
|----------|----------|-----------|----------|
| `GET …/contracts` | ✅ | ✅ | FR-CI-01 #7/#8 · UC-HRM-25 |
| `GET …/contracts/{id}` | ✅ | ✅ | FR-CI-01 #8/#9 · INT-02 · scope parity |
| `POST …/contracts` | ✅ | ✅ | FR-CI-01 #1–#7 · G-CI-01 · BR-CD-F5-01 |
| `PATCH …/contracts/{id}` | ✅ | ✅ | FR-CI-01 update / F-05 · F5 link |
| `GET …/insurance` | ✅ | ✅ | FR-CI-02 #6/#7/#8 |
| `POST …/insurance` | ✅ | ✅ | FR-CI-02 #1–#6 |
| `GET …/contracts/expiring` | ✅ | ✅ | FR-CI-01 cảnh báo hết hạn |
| `GET …/insurance/expiring` | ✅ | ✅ | FR-CI-02 cảnh báo hết hạn |

---

## 3. Architecture locks (must_keep)

| Lock | Detail |
|------|--------|
| TEXT `company_id` slug | Align `DB_DESIGN_HRM_EMPLOYEES` / CO-HC Plane B — cấm LE UUID |
| Soft `employee_id` | G-DB-02 — no hard `REFERENCES` this wave; list JOIN active employees |
| G-CI-01 | `end_date` NULL for open-ended; `HRM-CON-002` / `HRM-CON-001` |
| BR-CD-F5-01 | Salary deprecated on contract body; F5 packages annex |
| U72 | F-04 `contract_type` · F-05 status · U-03 insurance — **FE maps only** |
| U65 | `ensureSeedData` ≠ UF evidence |

---

## 4. Residual (not closed)

| ID | Note | Owner hint |
|----|------|------------|
| Catalog assert `contract_type` | SRS Diễn biến #6 — soft today | ba + dev-be when product locks |
| Insurance type vs `provider` | W1 slice ghi nhận; rich BHXH catalog batch | ba-data P2 |
| Insurance GET/PATCH by id | Not in W1 runtime | product expand |
| Duplicate `policy_number` | SRS #5 optional forbid | ba + be |
| Compensation F5 full F.1 | Annex — separate U71 if opened | sa |
| Hard FK migration G-DB-02 | Optional wave + backfill | dev-be |

---

## 5. Handoff

### completion_report

**Closed:** Paired physical DB_DESIGN + API_DESIGN for HRM Contracts + Insurance (TechSpec §14.2–14.3 FR-CI-01/02); F.1 triad on list/get/create/update contracts + insurance list/create + expiring; aligned soft employee_id + TEXT company_id with employees design; U72 FE label note; tech-spec README §2 COMPLETE + pointers; no `apps/**`.

**Residual:** Catalog assert / insurance type column / insurance get-update / F5 full pack / hard FK — see §4.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-XBOS-CATALOG-GOV-DESIGN-01 (or next P1 from docs/tech-spec/README.md §3)
role: sa
lane: governance · U71
read_first:
  - docs/tech-spec/README.md §3 backlog
  - docs/xbos/TECHSPEC.md §14.11–14.12 FR-CAT-02/05
  - .cursor/rules/spec-db-api-design-gate.mdc
deliver: DB_DESIGN + API_DESIGN F.1 pair under docs/xbos/
exit: F.1; update tech-spec README §2; PASS_TO_PM
cấm: apps/** · wipe contracts-ins / employees pairs
When Dev opens CI mutate: read_first must include
  docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md
  docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md
  + spec_read_ack F.1 steps FR-CI-01/02
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-contracts-ins-design-01-20260727.md`

### pm_dispatch_hint

Next U71 P1 from README §3 (XBOS catalog gov / WF / RACI); Contracts-INS pair ready for Dev `read_first` when execution opens — U65 browser only.
