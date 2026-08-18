# CD-FB-07-WF-DYNAMIC-QA-R2 — Leave dynamic resolver retest

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-07-WF-DYNAMIC-QA-R2` |
| **Date** | 2026-07-19 |
| **Env** | Local L0 `:5173` portal + `:28001` hrm-api + `:28002` xbos-api |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` |
| **spec_ref** | ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5/§9 · delta F4 AC-CD-F4-01..07 · BE fix `cd-fb-07-wf-dynamic-be-fix-01-20260719.md` |
| **U65** | Zero-seed · no `pnpm seed:*` · no inbox seed · product `instances/start` + reject only |
| **Prior FAIL** | `cd-fb-07-wf-dynamic-qa-20260719.md` — `company_id` TEXT vs `::uuid` + membership gate → escalate `group_ceo` |

---

## Verdict: **PASS_TO_PM**

| AC | Result | Evidence |
|----|--------|----------|
| **AC-CD-F4-01** leave → inbox manager đúng người | **PASS** | Live `instances/start` → task assignee **`uat.nv0001@xe.vn`**, `hat_key=direct_manager`, `resolvedVia=direct_manager`, `escalated=false` — **not** `ceo@xe.vn`/`admin@xe.vn` / `group_ceo` |
| **AC-CD-F4-02** direct_manager | **PASS** (live) | Resolver matrix omit / `holding` / holding UUID — all **200** `manager_user_id=uat.nv0001@xe.vn` |
| **AC-CD-F4-03** position_template | **PASS** (unit) / **N/A live** | jest resolver-registry; no active canvas definition with `position_template` in list without seed |
| **AC-CD-F4-04** parallel all | **PASS** (unit) / **N/A live** | jest parallel_group policy `all`; no live parallel leave definition without seed |
| **AC-CD-F4-05** reject path | **PASS** (API product) | `POST …/tasks/:id/reject` → **201** `XBOS-WF-205`; instance `status=rejected`; task `rejected` |
| **AC-CD-F4-06** canvas persist | **PARTIAL** | CC loaded; leave WF tasks visible as «Phê duyệt đơn nghỉ phép HRM»; full canvas edit/reload not closed this session |
| **AC-CD-F4-07** ≥3 resolver types | **PASS** (unit demo) | jest covers `direct_manager` + `position_template` + `parallel_group` |

**Exit criteria #1–2 (PM dispatch):** **met** via product path + FE observation notes (FE mutate blocked by employee picker pagination, not soft-nav drift).

---

## L0 stack

```text
✓ hrm-api  :28001 HTTP 200
✓ xbos-api :28002 HTTP 200
✓ web-portal :5173 HTTP 200
```

---

## Jest (supporting)

```text
xbos-api resolver-registry.spec.ts     6/6 PASS
hrm-api  leave-workflow.bridge.spec.ts 6/6 PASS
```

---

## Live resolver matrix (HLD-0006 = `8ac84520-0d6b-4737-8341-2f9a929b5f81`)

| `company_id` | HTTP | `manager_user_id` |
|--------------|------|-------------------|
| _(omit)_ | **200** `HRM-WF-RESOLVE-200` | `uat.nv0001@xe.vn` |
| `holding` | **200** `HRM-WF-RESOLVE-200` | `uat.nv0001@xe.vn` |
| `10000000-0000-4000-8000-000000000001` | **200** `HRM-WF-RESOLVE-200` | `uat.nv0001@xe.vn` |

Prior FAIL: slug + UUID → **500** `text = uuid`. **Closed.**

---

## Live spawn (product WF start — not inbox seed)

```text
POST /api/xbos/workflow-engine/instances/start
workflowCode=hrm_leave_approval
businessType=hrm_leave
businessId=qa-r2-1784453320446
submitter.employeeId=8ac84520-0d6b-4737-8341-2f9a929b5f81
submitter.companyId=10000000-0000-4000-8000-000000000001
→ 201 XBOS-WF-201
instance=53fe5df6-6188-4d50-a69b-8134cc38e51c
```

| Task id | assignee | hat_key | resolvedVia | escalated |
|---------|----------|---------|-------------|-----------|
| `618e872f-b640-4b21-b43c-047415b81c93` | **`uat.nv0001@xe.vn`** | `direct_manager` | `direct_manager` | **false** |

Inbox query `assigneeUserId=uat.nv0001@xe.vn&businessType=hrm_leave` → match **1** (same task).

### Reject (AC-CD-F4-05)

```text
POST /api/xbos/workflow-engine/tasks/618e872f-…/reject
→ 201 XBOS-WF-205
instance status=rejected · task status=rejected
```

---

## Browser FE (U65 observation)

1. Login session already on `:5173/command-center` (`ceo@xe.vn`).
2. Direct URL `http://localhost:5173/hr/attendance?portal=1&companyId=main` → attendance overview (**not** soft-nav drift to Tuyển dụng this session).
3. Tab **Nghỉ phép** → **Tạo yêu cầu nghỉ** dialog opens (employee / leave type / dates / reason / **Gửi yêu cầu**).
4. Leave KPIs observed: Tổng yêu cầu **85**, Chờ duyệt **27**.
5. **FE mutate not completed:** employee combobox listbox capped (~100 options, no typeahead input); HLD-0006 (`Huỳnh Văn An …` / `uat.nv0006@xe.vn`) not in first page — selecting exact fixture blocked in automation without seed/filter API.

**FE note:** soft-nav residual `D-CD-FB-07-FE-LEAVE-SOFTNAV` **not reproduced** on direct attendance URL this R2; picker pagination remains a UX friction for FE create of specific fixture.

CC inbox surface shows multiple «Phê duyệt đơn nghỉ phép HRM» cards (NHÂN SỰ scope) — consistent with leave WF naming.

---

## Residual

| ID | Sev | Owner | Description |
|----|-----|-------|-------------|
| D-CD-FB-07-FE-LEAVE-PICKER | P2 | dev-fe | Leave create employee combobox: add searchable typeahead / code filter so HLD-#### selectable beyond first page |
| AC-CD-F4-06 | P2 | qa (follow-up) | Canvas edit `resolver_type` + F5 persist — not closed R2 |
| AC-CD-F4-03/04 live | P3 | qa | Live position/parallel only when canvas definition exists (U65 — no seed) |

**Closed vs prior P0:** `D-CD-FB-07-RESOLVER-COMPANY-TEXT` — verified fixed.

---

## What is NOT claimed

- Phase 1 / PROD DONE
- Full Bay.vn parity
- Full FE create→inbox click path for HLD-0006 (API product path used per exit #2)
- AC-CD-F4-06 canvas edit GO

---

## completion_report

Closed: R2 retest after BE fix — **AC-CD-F4-01/02 PASS** live (resolver slug+UUID 200; spawn assignee `uat.nv0001@xe.vn` / `direct_manager` / `escalated=false`); reject product path PASS; jest 12/12; FE leave dialog reachable without soft-nav drift. Residual P2 picker + canvas follow-up — not blocking F4-01/02 exit.

**next_owner:** `pm` → optional **qc** gate F4 slice; optional **dev-fe** picker P2

**ack_status:** **PASS_TO_PM**

**evidence_path:** `docs/qa/evidence/cd-fb-07-wf-dynamic-qa-r2-20260719.md`

### next_dispatch_prompt

```text
work_item_id: CD-FB-07-WF-DYNAMIC-QC-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA R2 PASS docs/qa/evidence/cd-fb-07-wf-dynamic-qa-r2-20260719.md — AC-CD-F4-01/02 live PASS (assignee uat.nv0001@xe.vn direct_manager escalated=false); U65 zero-seed
exit_criteria: GO or GWC for F4 leave dynamic resolver pilot slice; list residual D-CD-FB-07-FE-LEAVE-PICKER + AC-CD-F4-06 as conditions if not waived; evidence docs/qa/evidence/cd-fb-07-wf-dynamic-qc-YYYYMMDD.md
cấm: seed; Phase1/PROD claim; reopen closed TEXT/uuid P0 without new FAIL evidence
```
