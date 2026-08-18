# PO-ECO-TC-XBOS-INBOX-CAT-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-XBOS-INBOX-CAT-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true (precond policy encoded in every inbox/gov TC) |
| **hdsd_align** | true (paths cite P1 wave + R7 UF-09/15 click paths) |
| **uat_done** | **false** — TC pack only; no browser execution this task |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` |

---

## completion_report

**Closed**

- Inventoried **12 screens** (WF list/detail, CC inbox page + home rail, WF drawer, catalog gov two-pane, 3 CC catalog tabs, group HR + extension dialog/confirms) from portal FE sources.
- Documented **28 user-visible fields** including inbox card columns (priority, source, title, assignee, due, business type), catalog gov detail table (**Danh mục / Mã / Nhãn**), CC autosave columns (document/measurement/pricing), extension label/code/block.
- Cataloged **18 functions** with API mapping (`workflow-engine/tasks/complete|reject`, `catalog-governance/tasks/approve|reject`, `business-master/command_center_catalogs`, `hrm/settings-catalogs/.../extension-items`).
- Published **32 TCs** (HP/FD/BD/AU/UX/REG) covering **UF-XBOS-08/09/14/15** with coverage check §5 PASS (0 GAP).
- Neo **PO_SPEC_TEST_CASE_CATALOG** rows TC-HP-03/04/13 and TC-X-03; cited prior EVIDENCED runs without claiming re-test.
- **depth_gate** all ☑ on pack meta.

**Residual**

- Synth wave: dedupe TC-ID `TC-XIC-*` vs master catalog `TC-HP-*` / `TC-X-*`; merge counts into `PO_SPEC_TEST_REPORT.md` Ecosystem depth section.
- Browser execution **not** in scope this WI — statuses remain **PLANNED** until U78 test-log pair per wave.
- **R-UF15-BATCH-ROW** (P2): custom extension row may not appear in gov batch table — documented in TC-XIC-EXT-BD-001.

---

## Inventory summary (for synth)

### Inbox workflow (`CommandCenterInboxPage` + CC home rail)

| UI element | ID / testid |
|------------|-------------|
| Panel | `data-testid="cc-inbox-panel"` |
| Task list | `cc-inbox-task-list` |
| Card | `cc-inbox-task-card` · `data-business-type` |
| Approve leave | `hdsd-cc-leave-approve` |
| Approve other | `cc-inbox-task-approve` |
| Actions | **Tải lại** · **Mở chi tiết** · **Duyệt** / **Xử lý nhanh** |
| Drawer | **Từ chối** · **Duyệt**/**Hoàn thành** · confirm **Từ chối nhiệm vụ** |

### Catalog governance (`CatalogGovernancePanel`)

| UI element | Notes |
|------------|-------|
| Inbox cards | `workflow_name` · **Mã lô** · hat badge |
| Detail table cols | **Danh mục** · **Mã** · **Nhãn** |
| **Ghi chú duyệt** | textarea |
| Actions | **Làm mới** · **Phê duyệt** · **Từ chối** |
| Dialogs | «Phê duyệt yêu cầu danh mục» · «Từ chối yêu cầu danh mục» |

### Catalog CC autosave (`CommandCenterPage` settings tabs)

| Tab | Columns |
|-----|---------|
| document | Mã · Tên văn bản · Version · Hiệu lực |
| measurement | Metric Key · Đơn vị · Tiền tệ · Độ chính xác |
| pricing | Mã giá · Diễn giải · Đơn giá |
| Save | debounce ~800ms → PUT |

### Extension (UF-15)

| Step | UI |
|------|-----|
| Entry | `?settings=company_group_hr` → **Cấu hình chi tiết** |
| Mutate | **Thêm field custom** → **Xác nhận (áp dụng)** |
| API | `POST …/extension-items` → **201** `HRM-SET-209` |

---

## spec_ref

- UF-XBOS-08/09/14/15 · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3
- `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` rows 8/9/14/15
- `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` DoD §2
- `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` (execution deferred)

---

## next_owner

**qa-synth** (or **pm** to dispatch synth Task)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-XBOS-WAVE-A-01
from_role: pm
to_role: qa

Mission: SYNTH dedupe TC pack `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` (32× TC-XIC-*) against `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` and roster `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` — merge IDs, FK cross-menu (UF-15→UF-09 chain), update `docs/qa/reports/PO_SPEC_TEST_REPORT.md` Ecosystem depth § + roster status READY_FOR_EXEC.

read_first: XBOS-INBOX-CAT.md · PO_SPEC_TEST_CASE_CATALOG.md §2 TC-HP-03 · evidence po-eco-tc-xbos-inbox-cat-01.md

exit_criteria: synth report md in docs/qa/evidence/; roster rows XBOS-INBOX-WF / XBOS-CATALOG-* = SYNTHED; no duplicate TC-ID; ack PASS_TO_PM. No browser run; no UAT DONE.
```

---

## Handoff contract

| Field | Value |
|-------|-------|
| completion_report | See § completion_report above |
| next_owner | qa-synth |
| next_dispatch_prompt | See block above |
| evidence_path | `docs/qa/evidence/po-eco-tc-xbos-inbox-cat-01.md` |
| ack_status | **READY_FOR_SYNTH** |

---

*Authoring only · IEEE 829 test execution logs required when TCs move to EVIDENCED*
