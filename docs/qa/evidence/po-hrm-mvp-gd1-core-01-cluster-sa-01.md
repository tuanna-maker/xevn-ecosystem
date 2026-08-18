# Evidence — PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-01 Option/F.1 only** · **no** `apps/**` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-10 · board #12) |
| **depends_on** | QC-01 GWC REC-07 **SEALED** stamp **`REC07QC1-MSL5WXU5`** · `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-CORE-01` |
| **Verdict** | **Option A CONFIRMED** |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | [`PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-01 · AC-CORE-PUB-01/02 · BR-BP-SEC-01 |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` F-CORE-EMP-01 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §3.1 · §3.3 |
| **U65** | zero-seed · **cấm code** until BA (+ DATA) + API CONFIRMED |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` |

---

## Decision (locked)

| Item | Value |
|------|-------|
| **Selected** | **Option A** — ACCEPT_AS_IS_UPGRADE |
| **Physical SoT** | `GET/PATCH /api/hrm/employees*` (+ list) |
| **Paper alias** | `/api/hrm/core/employees/{id}` — **DENY** Nest dual SoT |
| **ADD** | F-CORE-DEP-01 dependents (welfare / quà 1/6) |
| **UPGRADE** | F-CORE-EMP-01 public serializer + C&B reject (`HRM-CORE-CB-403`) |
| **RETAIN** | REC-07 soft-link · HTP-05 · APP-02 · `candidate_id` · U19 |
| **REJECT** | **B** Nest `/core` dual EMP · **C** HOLD / hire=CORE DONE / honesty flip |
| **OUT** | CORE-02 C&B · CORE-01a DEC→WH |

---

## Honesty locks (mandatory)

| Flag / claim | Value | SA |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module REC / CORE UAT** | **DENIED** | Slice ≠ module |
| **Claim REC-07 hire = CORE-01 DONE** | **DENIED** | Handoff ≠ public ring |
| **Nest `/rec` dual** | **DENIED** | RETAIN QC seal |
| **Second EMP SoT** | **DENIED** | LIVE `/employees` only |
| **Reopen J-HRM-REC-07-01..04** | **DENIED** | without regression |
| **Seed** | **DENIED** | U65 |
| **`apps/**` this seat** | **DENIED** | docs-only |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md
spec_ref: SRS FR-UC-BP-CORE-01 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 · BR-BP-SEC-01 · F-CORE-EMP-01 · F-CORE-DEP-01

MISSION — BA AC pack (O1–O12):
1) Lock AC for public get/patch on physical /api/hrm/employees* (paper /core = alias only)
2) Field allow-list + C&B reject HRM-CORE-CB-403 + F5 no leak (AC-CORE-PUB-01/02)
3) Dependents welfare AC (quà 1/6) · ba-data REQUIRED flag
4) FE CB-MAP-01 hide/redirect · hire handoff from REC-07 ≠ CORE DONE
5) DRAFT J-HRM-CORE-01-01..04 · DENY Nest /rec dual · second EMP · reopen sealed J-REC-07 · honesty flip · seed · apps/**

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md · PASS_TO_PM · next ba-data or sa API-01
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Option A LOCKED — public ring on LIVE `/employees*` + dependents ADD; RETAIN REC-07/HTP; REJECT B/C; unlock ba-process; no apps/**; honesty false. |
| **next_owner** | **ba-process** |
| **next_dispatch_prompt** | See block above |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |
