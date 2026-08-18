# PO-ECO-TC-XBOS-WF-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-XBOS-WF-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true — precond on every chain row; inbox leg delegated to INBOX-CAT |
| **hdsd_align** | true — CH04 §4.2 paths in Steps |
| **uat_done** | **false** — TC pack only; no browser execution this task |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-WF-DESIGNER.md` |
| **cross_ref** | `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` (UF-XBOS-08 approve — no duplicate matrix) |

---

## completion_report

**Closed**

- Scoped **Wave B** menu pack **`XBOS-WF-DESIGNER`** — route `?settings=workflow` only (create · edit · save · canvas · L2.5 list↔detail).
- Inventoried **7 screens** (list, detail, form tab, graph tab, HRM preset card, dev seed control, instance overlay pointer).
- Documented **22 user-visible fields** (list columns, metadata, step grid, canvas nodes, preset card).
- Cataloged **12 designer functions** + **1 U65 chain pointer** + **1 dev negative**; inbox mutate/approve **not** duplicated — **4 cross-ref rows** point to `TC-XIC-WF-*`.
- Published **30 TC rows** (26 designer + 4 chain cross-ref); coverage check §5 **GAP 0**.
- Neo **PO_SPEC_TEST_CASE_CATALOG** TC-HP-01 (save/preset) · TC-HP-03/04 (inbox via INBOX-CAT) · journeys **J-XBOS-10** · **J-REC-WF-01** · UF-XBOS-08 **Bước 1**.
- **depth_gate** all ☑ on pack meta.
- **No** `apps/**` edits · **no** seed · **no** browser test-log (U78 deferred to execution wave).

**Residual**

- Synth: dedupe `TC-WFD-*` vs master `TC-HP-01/03/04` and vs `TC-XIC-WF-*`; merge counts into `PO_SPEC_TEST_REPORT.md` Ecosystem depth §.
- **R-REC-C-BRIDGE-01:** preset card `hrm-rec-wf-presets` may be ABSENT on `:8088` — TC-WFD-PST-HP-001 documents product_gap.
- **D-W7-WF-GET-ID-01:** GET definitions by id **404** — TC-WFD-EDT-FD-001 GWC note.
- Roster line `ECOSYSTEM_MENU_ROSTER.md` `XBOS-WF-DESIGNER` → promote **READY_FOR_SYNTH** on synth merge.
- Browser execution: run designer TCs with U78 pair `po-eco-tc-xbos-wf-01-test-log.md/json` when PM dispatches execution WI.

---

## Inventory summary (for synth)

### List (`SCR-WF-LIST`)

| UI element | Notes |
|------------|-------|
| Entry | CC sidebar **Hệ thống quy trình** · `settings=workflow` |
| CTA | **Thêm quy trình mới** |
| Columns | **Mã** · **Tên** · **Trạng thái** · **Phiên chạy** (evidence p1-s1-fe-02) |
| Row action | **Chỉnh sửa** |
| Bridge | `data-testid=hrm-rec-wf-presets` — optional |
| Dev-only | **Seed quy trình (dev)** — REG hide on :8088 |

### Detail / canvas (`SCR-WF-DETAIL`)

| UI element | Notes |
|------------|-------|
| Fields | **Mã quy trình** · **Tên quy trình** · bước **Bước 1** name |
| Section | **Cấu hình bước & luồng** (HDSD 01c) |
| Primary save | **Lưu quy trình** → POST/PUT `workflow-engine/definitions` |
| Tab | **Sơ đồ luồng** — **Bắt đầu** · steps · **Hoàn thành** |
| Dropdown | **Phiên bản chạy** (instances overlay) |
| Nav | **Quay lại danh sách** |
| Consumer | After save list **n→n+1** without F5 (**J-XBOS-10**) |

### UF-XBOS-08 two-step (delegated)

| Step | This pack | Inbox pack |
|------|-----------|------------|
| 1 Create/save WF from FE | TC-WFD-CRT/EDT/PST-* | TC-XIC-WF-HP-001 overlap — synth dedupe |
| 2 Spawn + approve | TC-WFD-CHAIN-* cross-ref only | TC-XIC-WF-HP-002/003 full steps |

---

## spec_ref

- UF-XBOS-08 · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3
- UF-XBOS-08 Bước 1 · `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` row 8
- `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` DoD §2 · Wave B
- `docs/program/PROGRAM_JOURNEY_MAP.md` J-XBOS-10
- `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` (execution deferred)
- Inbox approve: `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` §4.1

---

## Counts (machine)

```json
{
  "work_item_id": "PO-ECO-TC-XBOS-WF-01",
  "pack": "XBOS-WF-DESIGNER",
  "screens": 7,
  "fields": 22,
  "functions_designer": 12,
  "tcs_designer": 26,
  "tcs_chain_cross_ref": 4,
  "tcs_total": 30,
  "coverage_gap": 0,
  "ack_status": "READY_FOR_SYNTH"
}
```

---

## next_owner

**qa-synth** (or **pm** to dispatch synth Task)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-XBOS-WAVE-B-01
from_role: pm
to_role: qa

Merge depth packs Wave B: docs/qa/testcases/xbos/XBOS-WF-DESIGNER.md (PO-ECO-TC-XBOS-WF-01 READY_FOR_SYNTH) with roster ECOSYSTEM_MENU_ROSTER.md — dedupe TC-WFD-* vs TC-HP-01/03/04 and vs TC-XIC-WF-* in XBOS-INBOX-CAT.md; keep inbox approve matrix single-sourced in INBOX-CAT. Update docs/qa/reports/PO_SPEC_TEST_REPORT.md ecosystem depth counts; set roster XBOS-WF-DESIGNER ack READY_FOR_SYNTH → SYNTHED. entry_criteria: both pack files exist + evidence po-eco-tc-xbos-wf-01.md. exit_criteria: zero orphan TC-ID collisions; cross-ref table for UF-XBOS-08 step1=WFD step2=XIC documented. ack_status PASS_TO_PM. No browser run in synth.
```

---

## evidence_path

`docs/qa/evidence/po-eco-tc-xbos-wf-01.md`

---

## ack_status

**READY_FOR_SYNTH**
