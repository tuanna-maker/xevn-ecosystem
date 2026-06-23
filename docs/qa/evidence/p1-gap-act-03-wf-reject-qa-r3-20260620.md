# P1-GAP-ACT-03-WF-REJECT-QA-R3 — Inbox Từ chối AlertDialog retest (post-deploy)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-03-WF-REJECT-QA-R3` |
| **role** | qa |
| **executed_at** | 2026-06-20T20:05+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **capability** | `ACT-CC-WF-REJECT` |
| **spec_ref** | `ACTION_BUTTON_INVENTORY.md` §2 · **AC-ACT-WF-REJ-01** · **AC-UX-CFM-01** · DEF-GAP-ACT-03-CFM |
| **prior_handoff** | `docs/qa/evidence/p1-gap-act-03-wf-reject-deploy-8088-20260620.md` (READY_FOR_QA) |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS** — Post DevOps sync/recreate, `:8088` serves `promptRejectInboxFromDrawer` bundle. Browser U65 (no seed): drawer **Từ chối** → `[role=alertdialog]` «Từ chối nhiệm vụ» + **Hủy** (zero POST) → confirm **Từ chối** → POST **201** → inbox **112→111** → F5 **111** persists.

| Metric | Target | Observed |
|--------|--------|----------|
| GAP-ACT-03 | 🟢 | 🟢 **CLOSED** |
| P0 block | 20/20 🟢 | **20/20 🟢** |
| Hủy → no POST | PASS | 🟢 **PASS** (`rejectPosts=0`) |
| Confirm → POST 201 + F5 | PASS | 🟢 **PASS** (201; inbox ↓; F5) |
| Deploy parity symbols | served | 🟢 `promptRejectInboxFromDrawer`×2 · `onRejectRequest`×2 |

**DEF-GAP-ACT-03-CFM / DEF-GAP-ACT-03-CFM-R2:** **CLOSED** (deploy gap resolved; AlertDialog UX verified).

---

## L0 stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | exit **0** — hrm-api 28001, xbos-api 28002, web-portal 5173 **200** |
| `:8088` HTTP | **200** (Vite dev, logged in) |

---

## Deploy parity probe (browser fetch)

| Asset | Symbol | Count | PASS |
|-------|--------|------:|------|
| `CommandCenterPage.tsx` | `promptRejectInboxFromDrawer` | 2 | ✅ |
| `CommandCenterPage.tsx` | `Từ chối nhiệm vụ` | 1 | ✅ |
| `WorkflowTaskDetailDrawer.tsx` | `onRejectRequest` | 2 | ✅ |

Aligns with DevOps curl evidence in `p1-gap-act-03-wf-reject-deploy-8088-20260620.md`.

---

## Browser test — UF ACT-CC-WF-REJECT (U65 · no seed)

**Click path:** Login → CC → inbox (**112**) → **Mở chi tiết** → drawer **Từ chối**

**Instance under test:** `20383f9d-aa94-4626-8a8d-3d27ccb3c80e` (display) · task id `85d4bd22-6950-4e4f-91ed-f9c104a3db9f` (reject POST)

### Run A — AlertDialog on reject (no immediate POST)

| Step | Expected | Observed | Verdict |
|------|----------|----------|---------|
| Click drawer **Từ chối** | `[role=alertdialog]` «Từ chối nhiệm vụ» | `alertDialogCount=1`; text includes «Xác nhận từ chối "Phê duyệt bổ sung danh mục HRM — X.E Du lịch VN"?» | 🟢 |
| **Hủy** visible | Yes | `huyVisible=true` | 🟢 |
| Network before confirm | **No** POST | `rejectPosts=0`, `rejectLog=[]` | 🟢 |

### Run B — Hủy cancels without mutate

| Step | Expected | Observed | Verdict |
|------|----------|----------|---------|
| Click **Hủy** | Dialog closes; no POST | `alertDialogCount=0`; `rejectPosts=0` | 🟢 |
| Task status | Still pending | `Trạng thái: Đang chờ` | 🟢 |

### Run C — Confirm → POST 201 + F5

| Step | Expected | Observed | Verdict |
|------|----------|----------|---------|
| Re-open drawer → **Từ chối** → confirm | AlertDialog then POST | `alertBeforeConfirm=1` | 🟢 |
| POST reject | **201** | `POST /api/xbos/workflow-engine/tasks/85d4bd22-6950-4e4f-91ed-f9c104a3db9f/reject` → **201** | 🟢 |
| FE after 2xx | Inbox count ↓ | **112 → 111** | 🟢 |
| Status after | **Từ chối** | `Trạng thái: Từ chối` | 🟢 |
| F5 persistence | Count unchanged | Inbox **111** after reload | 🟢 |

### Verdict matrix

| Criterion | Verdict |
|-----------|---------|
| AC-UX-CFM-01 AlertDialog (not native) | 🟢 **PASS** |
| AC-ACT-WF-REJ-01 POST reject **201** | 🟢 **PASS** |
| Hủy cancels without POST | 🟢 **PASS** |
| Confirm-then-POST flow | 🟢 **PASS** |

**J-XBOS-01** (inbox drawer list→detail→mutate): L2.5 **PASS** for reject confirm path on synced bundle.

---

## P0 block promotion

| Before R3 | After R3 |
|-----------|----------|
| 19/20 🟢 (GAP-ACT-03 ⬜) | **20/20 🟢** |
| GAP-ACT-03 🟡 PARTIAL | **GAP-ACT-03 🟢 CLOSED** |

Screen-action row `ACT-CC-WF-REJECT`: promote 🟡 → 🟢 in `screen-action-catalog-map-20260620.md` § R3 append.

---

## Residual / not promoted

| Item | Status |
|------|--------|
| GAP-ACT-05 vendors CU browser spot | ⬜ unchanged (out of R3 scope) |
| Full `uf` catalog 22/52 | unchanged — map expansion deferred |
| DEF-GAP-ACT-03-CFM* | **CLOSED** |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | R3 browser retest **PASS**: AlertDialog + Hủy/no POST + confirm POST **201** + F5 on `:8088` post DevOps sync. GAP-ACT-03 **CLOSED** 🟢. P0 block **20/20**. DEF-GAP-ACT-03-CFM closed. |
| **next_owner** | **pm** → **qc** (`P1-SCREEN-ACTION-QC-SLICE-01` screen-action P0 slice) |
| **next_dispatch_prompt** | `work_item_id: P1-SCREEN-ACTION-QC-SLICE-01 — entry: PASS_TO_PM docs/qa/evidence/p1-gap-act-03-wf-reject-qa-r3-20260620.md — GAP-ACT-03 🟢 P0 20/20. exit: QC audit screen-action-catalog-map P0 block + promote ACT-CC-WF-REJECT row; verify no regression GAP-ACT-01/02/04/06; ack GO/GWC with evidence path. cấm seed. evidence: docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md` |
| **evidence_path** | `docs/qa/evidence/p1-gap-act-03-wf-reject-qa-r3-20260620.md` |
| **ack_status** | **PASS_TO_PM** |
