# BM-QA-J-REC-WF-01-CANVAS-01 — J-REC-WF-01 Workflow canvas (recruitment)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-J-REC-WF-01-CANVAS-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~08:50–08:56 ICT |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | Group CEO / BOD session (`ceo@xe.vn` lane; Command Center unlocked) |
| **U65** | zero-seed · browser-only · no Phase1/PROD claim |
| **spec_ref** | **J-REC-WF-01** · UC-HRM-REC-WF-01 · AC-REC-WF-01 · BM-03 soft (resolver types) |
| **J-*** | **J-REC-WF-01** |
| **must_keep** | Existing recruitment WF spawn path · **do not wipe** J-REC-WF-02/03 🟢 |

---

## Executive summary

**PASS** — Command Center → **Hệ thống quy trình** deep-link opened `hrm_requisition_approval` canvas. BM-03 soft check: resolver select exposes `direct_manager` / `position_template` / `parallel_group`. **Lưu quy trình** → PUT **200** `XBOS-WF-201`. F5 reload: definition still **active**, list row + bridge «đã có», applying scope **Toàn tập đoàn** (spawn path must_keep intact). No seed. Did not mutate member-apply scope used by J-REC-WF-02/03.

---

## Environment

| Item | Detail |
|------|--------|
| Portal | `http://14.225.217.232:8088` |
| Entry | `/command-center?settings=workflow` |
| Seed | **none** |
| Auth | Existing portal JWT (BOD) — no re-login form |

---

## Verdict matrix

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| **J-REC-WF-01 / L2** | CC → Hệ thống quy trình loads | **PASS** | Settings workflow list + bridge cards |
| **J-REC-WF-01 / open** | Open/create active `hrm_recruitment_*` or `hrm_requisition_approval` | **PASS** | Opened existing `hrm_requisition_approval` (id `944c9abf-…`) |
| **BM-03 soft** | Resolver types available: direct_manager / position_template / parallel | **PASS** | UI values: `direct_manager`, `position_template`, `parallel_group` (+ fixed_user, role_code) |
| **Save active** | Lưu → 2xx | **PASS** | PUT 200 `XBOS-WF-201` «Definition saved» |
| **F5 persist** | Reload → definition still active | **PASS** | List 200 `XBOS-WF-200`; `status=active`; FE «đã có» |
| **must_keep** | Do not wipe J-REC-WF-02/03 spawn path | **PASS** | `applyingEntityId` empty / **Toàn tập đoàn** unchanged |

---

## Click path (U65 browser)

```
Session BOD → http://14.225.217.232:8088/command-center?settings=workflow
→ Hệ thống quy trình (list)
→ Mẫu QT tuyển dụng HRM (bridge) → «Phê duyệt yêu cầu tuyển dụng HRM» hrm_requisition_approval · đã có
→ Canvas detail: Khối kích hoạt + Cấu hình bước & resolver
→ Verify Loại resolver options (BM-03 soft)
→ Lưu quy trình
→ FE toast: «Đã lưu quy trình lên workflow-engine (DB).»
→ Hard navigate / F5 same URL
→ Reopen hrm_requisition_approval → resolver options still present · Đơn vị áp dụng = Toàn tập đoàn
```

Note: First attempt via collapsed rail click on tab `f48094` raced into `/hr/recruitment`; **new tab** deep-link `?settings=workflow` was reliable.

---

## Network / API evidence

### Save

```http
PUT /api/xbos/workflow-engine/definitions/944c9abf-a566-4e45-965c-ce441632e746
→ 200 XBOS-WF-201 «Definition saved»
data.workflow_code = hrm_requisition_approval
data.name = Phê duyệt yêu cầu tuyển dụng HRM
```

### FE after 2xx

| Check | Result |
|-------|--------|
| Toast / banner | «Đã lưu quy trình lên workflow-engine (DB).» |
| Returned to list | Bridge cards still show `hrm_requisition_approval · đã có` |

### After F5

```http
GET /api/xbos/workflow-engine/definitions
→ 200 XBOS-WF-200
hit: id=944c9abf-a566-4e45-965c-ce441632e746
     workflow_code=hrm_requisition_approval
     status=active
     company_id=main
     scope_level=group
     applyingEntityId="" (Toàn tập đoàn)
     step requisition_approval resolverType=null (Legacy — expected; soft check = options available)
```

List FE row after F5:

`hrm_requisition_approval | Phê duyệt yêu cầu tuyển dụng HRM | Toàn tập đoàn | 1 | 48 | Chỉnh sửa`

---

## BM-03 soft — resolver catalog (canvas)

`data-testid=workflow-resolver-type` options after open **and** after F5 reopen:

| value | label (VI) |
|-------|------------|
| `` (empty) | Legacy (hat / cố định — không set resolver_type) |
| `direct_manager` | Quản lý trực tiếp |
| `position_template` | Chức danh |
| `parallel_group` | Song song |
| `fixed_user` | User cố định |
| `role_code` | Mã vai trò |

Job wording «parallel» maps to product value **`parallel_group`** — soft PASS.

---

## Residual / not promoted

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| Journey map status still ⬜ DRAFT for J-REC-WF-01 | P3 process | pm / ba | Product AC PASS; map row not updated by QA |
| GET by-id `/definitions/{id}` returned 404 `XBOS-CFG-001` in ad-hoc probe | P3 soft | — | List GET + FE path sufficient for this UF; not blocker |
| Tab race: CC → HR recruitment when clicking settings on shared HR tab | P3 UX/ops | — | Workaround: dedicated tab + `?settings=workflow` |

**No Dev residual P0/P1** for this work item.

---

## must_keep confirmation

- Did **not** set Đơn vị áp dụng = VISUN (or any member) — left **Toàn tập đoàn**.
- Did **not** delete / deactivate `hrm_requisition_approval` / plan / pipeline definitions.
- J-REC-WF-02 (spawn) / J-REC-WF-03 (inbox) prior 🟢 **not wiped**.

---

## Handoff

```yaml
work_item_id: BM-QA-J-REC-WF-01-CANVAS-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/bm-qa-j-rec-wf-01-canvas-01-20260722.md
next_owner: qc
pm_dispatch_hint: QC-BM-J-REC-WF-01-CANVAS-01 — audit browser evidence PASS; promote J-REC-WF-01; no seed; must_keep spawn path
```
