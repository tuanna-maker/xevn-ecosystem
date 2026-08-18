# PO-ECO-TC-XBOS-RBAC-01 — QA evidence (TC pack authoring)

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-ECO-TC-XBOS-RBAC-01` |
| **from_role** | qa |
| **to_role** | qa-synth / pm |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **u65_zero_seed** | true — precond = login + navigate; không seed matrix DB |
| **hdsd_align** | true — CC **Hệ thống phân quyền** · UF-XBOS-13 · J-XBOS-09 click path |
| **uat_done** | **false** — TC pack only; no browser execution this task |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-RBAC-MATRIX.md` |

---

## completion_report

**Closed**

- Inventoried **8 screen/section IDs** for `?settings=permission` including RACI reference block, 8 role tabs, 4 module accordions, row grid, sticky **Thêm vai trò mới**, and entity **Nhiệm vụ & RACI** tab (separation negative).
- Documented **65** user-facing / matrix controls: 11 rows × (Xem/Ghi/Xóa/Duyệt + Phạm vi), 8 role tabs, RACI ref columns, header actions.
- Cataloged **13 functions** with API mapping (`GET/PUT /api/xbos/position-rbac/matrix`, debounce 600ms, strict `x-company-id`, separation from `raci-governance`).
- Published **38 TCs** covering **UF-XBOS-13**, **J-XBOS-09**, checkbox **save (debounce PUT) + F5** for all four permission bits + dataScope selects, role isolation, custom role prompt, AU scope, RACI split, API fail/regression.
- Coverage check §5 **0 GAP** on depth_gate checklist.
- Cited prior EVIDENCED runs (`p1-xbos-w6-rbac-audit`, R3 UF-13) without claiming re-test.

**Residual**

- Synth: merge `TC-XRM-*` into ecosystem rollup + `PO_SPEC_TEST_REPORT.md`; dedupe vs UF-XBOS-13 row only.
- Browser execution **not** in scope — all TC **PLANNED** until U78 `po-eco-tc-xbos-rbac-01-test-log.md/.json` pair on execute wave.
- Known product UX carry: **no save toast** (D-W6-RBAC-UX-01 P3), overlay click (D-W6-RBAC-UI-01 P2) — encoded in TC-XRM-UX-002/003.

---

## Inventory summary (for synth)

### Navigation (HDSD)

| Step | UI |
|------|-----|
| Login | `ceo@xe.vn` / `Xevn@2026` (Group CEO) |
| Entry | Command Center → **CÀI ĐẶT HỆ THỐNG** → **Hệ thống phân quyền** |
| Deep link | `/command-center?settings=permission` |

### Matrix grid (per row)

| Control | VI label | Persist |
|---------|----------|---------|
| Checkbox | **Xem** · **Ghi** · **Xóa** · **Duyệt** | Debounce **600ms** → `PUT …/position-rbac/matrix` |
| Select | **Phạm vi dữ liệu** | Cá nhân · Phòng ban · Pháp nhân · Tập đoàn |
| Save UX | *Không nút Lưu* | Wait Network PUT **2xx** then **F5** |

### Role tabs (API `roleId`)

`raci_hdqt` · `raci_ceo` · `raci_cfo` · `raci_chro` · `raci_ptgd_kd` · `raci_truong_kho` · `raci_nv_th` · `admin_ht` (+ custom `role-{timestamp}`)

### Row IDs (11)

`pm-org-1..3` · `pm-log-1..3` · `pm-hr-1..2` · `pm-sys-1..3`

### Separation check (UF-XBOS-07 vs UF-XBOS-13)

| Surface | API |
|---------|-----|
| Settings permission | `/api/xbos/position-rbac/matrix` |
| LE tab Nhiệm vụ & RACI | `/api/xbos/raci-governance/companies/{uuid}/matrix` |

---

## spec_ref

- **UC-CC-P0-04** · **FR-CC-P0-04** · **UF-XBOS-13** · **J-XBOS-09**
- **AC-UF-XBOS-13:** checkbox mutate → PUT 200 → F5 sticky (Dev8088 R3 + W6 audit)
- **BR-UF-RACI-SPLIT-01:** distinct APIs/UI from entity RACI

---

## next_owner

**qa-synth** (PO-ECO-TC-SYNTH) or **pm** for roster % update

## next_dispatch_prompt

```text
@qa-synth — PO-ECO-TC-SYNTH (XBOS-RBAC slice)

work_item_id: PO-ECO-TC-SYNTH-01 (or active synth WI)
entry_criteria: PO-ECO-TC-XBOS-RBAC-01 ack READY_FOR_SYNTH; pack docs/qa/testcases/xbos/XBOS-RBAC-MATRIX.md (38 TC, 13 fn, 65 fields)
exit_criteria: Merge TC-XRM-* into docs/qa/testcases/README.md + ECOSYSTEM_MENU_ROSTER status; append PO_SPEC_TEST_REPORT ecosystem depth counts; no duplicate UF-XBOS-13 row conflict
evidence_path: docs/qa/evidence/po-eco-tc-synth-*.md
ack_status target: PASS_TO_PM
preserve: Prior 🟢 UF-XBOS-13 browser evidence paths — do not overwrite matrix Dev8088 column
```

## evidence_path

`docs/qa/evidence/po-eco-tc-xbos-rbac-01.md`

## ack_status

**READY_FOR_SYNTH**

---

*Authoring only · U65 · no apps/** · 2026-08-03*
