# P1-BA-FE-POST-MUTATION-AC-01 — Delta AC: FE sau API 2xx (U63)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BA-FE-POST-MUTATION-AC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P1 |
| **sponsor lock** | U63 — mọi mutate flow phải mô tả hành vi FE sau API **2xx**; QA browser wave `P1-BROWSER-E2E-XBOS-WAVE-8088` FAIL `spec_gap` nếu thiếu |
| **generated** | 2026-06-20 |
| **ack_status** | **PASS_TO_PM** |

**Inputs scanned:** [`docs/xbos/COMMAND_CENTER_P0_SRS.md`](../../xbos/COMMAND_CENTER_P0_SRS.md) · [`docs/hrm/SRS.md`](../../hrm/SRS.md) §13–15 · [`docs/qa/USER_FLOW_OPERABILITY_MATRIX.md`](../../qa/USER_FLOW_OPERABILITY_MATRIX.md) · [`docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md`](../../qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md) · prior delta [`p1-cc-shr-ratio-ux-ba-delta-20260620.md`](./p1-cc-shr-ratio-ux-ba-delta-20260620.md)

**Legend — cột «SRS has AC?»**

| Mã | Ý nghĩa |
|----|---------|
| **Y-FE** | SRS đã có AC đo được **FE sau 2xx** (toast/row/F5 rõ) |
| **Y-API** | SRS có AC nhưng chỉ **API/reload** — thiếu mô tả UI post-mutation → **spec_gap U63** |
| **N** | SRS **không** có AC mutate hoặc UC chỉ mô tả GET |

**Quy tắc QA (U63):** PASS browser chỉ khi quan sát được **FE change sau Network 2xx** + F5 persist — không chỉ probe JSON.

---

## 1. Tóm tắt quét

| Metric | Count |
|--------|------:|
| Mutate UC / UF rows in-scope (web :8088 wave) | **24** |
| SRS **Y-FE** | **0** |
| SRS **Y-API** (partial — cần bổ sung FE) | **9** |
| SRS **N** (gap mutate AC) | **15** |
| Delta AC rows proposed (§4) | **12** clusters |

**Verdict:** Toàn bộ wave browser E2E đang dựa vào matrix UF + QA script — **SRS chưa đủ lớp FE post-mutation**. PM nên dispatch **ba-process** merge §4 vào SRS delta (không rewrite full SRS) trước khi QC gate `P1-BROWSER-E2E-QC-8088` ký GO.

---

## 2. Ma trận mutate — Command Center (XBOS)

| UC-ID | UF-ID | API success (2xx) | Expected FE UI change (sponsor-visible) | SRS has AC? | spec_ref |
|-------|-------|-------------------|----------------------------------------|-------------|----------|
| **UC-CC-P0-01** | UF-XBOS-04/05 | `POST …/shareholders` **201** `XBOS-SHR-201`; `PUT` **200** | Row mới có `id` DB trong bảng; ô **Tỉ lệ %** + **Giá trị góp vốn** editable độc lập; ✓ biến submitted; **không** toast «đã lưu» giả khi API fail | **Y-API** | `COMMAND_CENTER_P0_SRS.md` L73–75 — thiếu FE row/toast |
| **UC-CC-P0-02** | UF-XBOS-06 | `POST …/documents` **201**; `POST …/upload` **200** | Doc xuất hiện trong list; icon View enable; progress upload đóng | **Y-API** | L113–115 — View file, không mô tả list refresh |
| **UC-XBOS-ORG-03** | UF-XBOS-03 | `PUT …/legal-entities/{id}` **200** `XBOS-ORG-201` | Toast/thành công; form fields (MST, đại diện) giữ sau **F5**; banner lỗi nếu 409 | **N** | Org profile mutate ngoài P0 SRS body chính |
| **UC-CC-P0-03** | UF-XBOS-12 | `POST/PUT/DELETE …/org-units` **201/200** | Node mới/sửa trong cây phòng ban; xóa → node biến mất sau reload tree | **Y-API** | L128–129 — «Reload trang → cây khớp DB» |
| **UC-CC-P0-04** | UF-XBOS-13 | `PUT …/position-rbac/matrix` **200** | Checkbox đổi trạng thái sticky; debounce save không revert ô | **Y-API** | L143–144 |
| **UC-CC-RACI** | UF-XBOS-07 | `PUT …/raci-governance/…/matrix` **200/201** | Ô RACI đã sửa giữ sau F5; không banner 409 scope | **N** | Chỉ CRUD matrix / pilot trace |
| **UC-CC-P0-05** | UF-XBOS-14 | `PUT …/business-master/…/items` **200** | Ô catalog autosave indicator; row giữ giá trị sau F5; Network **không** gọi `version/publish` làm SoT | **Y-API** | L153–154 |
| **UC-XBOS-WF-04/05** | UF-XBOS-08 | `POST …/workflow-engine/tasks/{id}/complete` **201** `XBOS-WF-200` | Task biến mất khỏi inbox hoặc chuyển trạng thái; pending count giảm | **N** | UC-CC-P0-06 drawer-only L168–169 |
| **UC-XBOS-CAT-05** | UF-XBOS-09 | `POST …/catalog-governance/tasks/{id}/approve` **201** | Inbox row biến mất; consumer catalog (HRM DM) có thể sync | **N** | Không trong P0 SRS |
| **UC-XBOS-CAT-01** | UF-XBOS-15 | `POST …/settings-catalogs/{key}/extension-items` **201** `HRM-SET-209` | Item mới trong list extension; không mock row local | **N** | HRM-SC cross-ref only |

---

## 3. Ma trận mutate — HRM embed (portal)

| UC-ID | UF-ID | API success (2xx) | Expected FE UI change (sponsor-visible) | SRS has AC? | spec_ref |
|-------|-------|-------------------|----------------------------------------|-------------|----------|
| **UC-HRM-21** (C) | UF-HRM-03 | `POST …/employees` **201** `HRM-EMP-201` | Row NV mới trong bảng; click → detail load **200** | **N** | §13 UC-HRM-21 — AC read-only L269 |
| **UC-HRM-21** (U) | UF-HRM-03/13 | `PATCH …/employees/{id}` **200** `HRM-EMP-202` | `full_name` (hoặc field sửa) cập nhật trên list/detail; F5 giữ | **N** | §13 — không PATCH AC |
| **UC-HRM-25** (C/U) | UF-HRM-02/13 | `POST …/contracts` **201**; `PATCH …/contracts/{id}` **200** | Form đóng hoặc row list cập nhật; field (`notes`, dates) F5 persist | **N** | §13 UC-HRM-25 — chỉ GET L311–315 |
| **UC-HRM-25** (insurance) | UF-HRM-04 | `POST/PATCH …/insurance-policy-participants` **201/200** | Link NV hiển thị trên tab BH; F5 giữ participation | **N** | §13 — không mutate AC |
| **UC-HRM-23** (C/U) | UF-HRM-05 | `POST/PATCH …/attendance/records` **201/202** | Bản ghi mới/sửa trong list; date ≠ epoch 0 | **N** | §13 UC-HRM-23 — GET only |
| **UC-HRM-22** (C/U) | UF-HRM-12 | `POST …/recruitment/requisitions` **201**; `PATCH` **200** `HRM-REC-200` | Requisition row + status (`on_hold`, …) sau F5 GET-by-id | **N** | §13 UC-HRM-22 — GET only L271–289 |
| **HRM-SC-01..03** | UF-HRM-10 | `POST …/catalog-sync/pull` **201**; `POST/PATCH …/settings-catalogs/items` **201/200** | Banner sync OK; item mới trong bảng catalog; không «Sync ERROR» | **N** | §13 pointer catalog; UC-HRM-06 API-only |
| **UC-HRM-26** | UF-HRM-11 | `POST …/change-requests/{id}/approve\|reject` **201** | Queue row → trạng thái Approved/Rejected; count pending giảm | **N** | §13 L321 — activity only |
| **UC-HRM-SCOPE-02** | UF-HRM-09/13 | Member PATCH same codes | Cùng FE rules trong scope member; **403** hiển thị rõ cross-company | **Y-API** | §15 AC-INT-SCOPE-M-* — API scope, không FE toast |

---

## 4. Delta AC rows (đề xuất merge SRS — top gaps)

> Format chuẩn U63 / QA evidence block. PM có thể append vào SRS module hoặc `docs/srs-overrides/` per UC.

### 4.1 Cổ đông — UC-CC-P0-01 (UF-XBOS-04/05)

**Cross-ref:** [`p1-cc-shr-ratio-ux-ba-delta-20260620.md`](./p1-cc-shr-ratio-ux-ba-delta-20260620.md) (AC-SHR-01..06).

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-SHR-01** | Tab Cổ đông, holding/member UUID hợp lệ | User ✓ submit POST **201** | Row xuất hiện với `holder_name`; state `submitted`; **không** local-only id | Không row / toast success mà Network 4xx |
| **AC-FE-POST-SHR-02** | `charterCapital` đã load | User sửa `ratioPercent` only | `contributedValue` **không** auto đổi (BR-SHR-02) | Auto calc charter×ratio |
| **AC-FE-POST-SHR-03** | POST **201** | F5 trang | GET list cùng row + field values | Mất row sau F5 |

### 4.2 Phòng ban — UC-CC-P0-03 (UF-XBOS-12)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-ORG-01** | Cây phòng ban mở | POST org-unit **201** | Node mới visible trên tree **không cần** F5 (optimistic OK nếu F5 khớp) | Chỉ toast, tree trống |
| **AC-FE-POST-ORG-02** | Node có `unitId` | PUT **200** | Label/node metadata cập nhật; F5 giữ | F5 mất node |
| **AC-FE-POST-ORG-03** | DELETE **200** | — | Node removed khỏi tree; không ghost node | Soft-delete vẫn hiện active |

### 4.3 Catalog CC autosave — UC-CC-P0-05 (UF-XBOS-14)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-CATCC-01** | Row catalog editable | Debounced PUT **200** | Indicator «Đã lưu»/idle; ô giữ value | Spinner vô hạn |
| **AC-FE-POST-CATCC-02** | PUT **200** | F5 | GET business-master trả cùng value | Reload mất |
| **AC-FE-POST-CATCC-03** | User sửa | Network | **Không** POST `/version/publish` làm persistence duy nhất | publishVersionChange SoT |

### 4.4 Ma trận phân quyền — UC-CC-P0-04 (UF-XBOS-13)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-RBAC-01** | Matrix CEO role loaded | Toggle checkbox → PUT **200** | Ô giữ checked state sau debounce | Revert sau 2s |
| **AC-FE-POST-RBAC-02** | PUT **200** | F5 | GET matrix khớp UI | Drift UI vs API |

### 4.5 Hồ sơ pháp nhân member — UC-XBOS-ORG-03 (UF-XBOS-03)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-LE-01** | Form member legal entity | PUT **200** | Toast success; field edited visible ngay | Silent fail |
| **AC-FE-POST-LE-02** | PUT **200** | F5 | Re-GET form = saved values | 409 masked as OK |

### 4.6 Hợp đồng lao động — UC-HRM-25 mutate (UF-HRM-02/13)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-HRM-CTR-01** | Tab Hợp đồng embed | POST contract **201** | Row/list có contract mới; mở detail **200** | API 201 UI trống |
| **AC-FE-POST-HRM-CTR-02** | Contract mở form | PATCH **200** `HRM-CTR-200` | Field (`notes`, dates) cập nhật trên UI | Chỉ Network OK |
| **AC-FE-POST-HRM-CTR-03** | PATCH **200** | F5 | GET-by-id cùng payload | F5 revert |

### 4.7 Nhân viên — UC-HRM-21 mutate (UF-HRM-03/13)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-HRM-EMP-01** | List NV | POST **201** | Bảng có row; sort/filter không ẩn row | Mock local row |
| **AC-FE-POST-HRM-EMP-02** | Detail NV | PATCH **200** | `full_name`/field hiển thị mới trên list+detail | Detail 404 sau patch |
| **AC-FE-POST-HRM-EMP-03** | Group CEO rollup | PATCH member slug NV | **409/403** banner — không toast success | Cross-scope silent |

### 4.8 Settings catalogs — HRM-SC (UF-HRM-10)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-HRM-SC-01** | Menu company_group_hr | POST sync **201** | Banner «Đồng bộ thành công»; không «Sync ERROR» | 401/409 banner đỏ im lặng |
| **AC-FE-POST-HRM-SC-02** | Catalog list | POST item **201** `HRM-SET-201` | Row item mới; code/name visible | Empty list + 201 |
| **AC-FE-POST-HRM-SC-03** | Extension path | POST extension **201** `HRM-SET-209` | UF-XBOS-15 consumer list có item | CC vs embed desync |

### 4.9 Metadata queue — UC-HRM-26 (UF-HRM-11)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-HRM-META-01** | Queue có pending CR | POST approve **201** | Row status → Approved; badge pending ↓ | Row stuck pending |
| **AC-FE-POST-HRM-META-02** | POST reject **201** | — | Row Rejected + lý do hiển thị | API OK UI unchanged |

### 4.10 Tuyển dụng — UC-HRM-22/30 (UF-HRM-12)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-HRM-REC-01** | Tab Tuyển dụng | POST requisition **201** | Row chiến dịch mới | List 0 dòng |
| **AC-FE-POST-HRM-REC-02** | Row mở form | PATCH **200** `HRM-REC-200` | Cột status/title cập nhật | PATCH OK list stale |
| **AC-FE-POST-HRM-REC-03** | PATCH **200** | F5 GET-by-id | `status` (vd. `on_hold`) persist | GWC API-only |

### 4.11 Catalog governance approve — UC-XBOS-CAT-05 (UF-XBOS-09)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-CATGOV-01** | Inbox có task pending | Approve POST **201** | Row biến mất / moved Done | Empty inbox false positive |
| **AC-FE-POST-CATGOV-02** | Approve **201** | Mở HRM settings catalog | Extension/DM item consumable | Approve không sync consumer |

### 4.12 Workflow inbox — UC-XBOS-WF (UF-XBOS-08)

| AC-ID | Given | When | Then (FE sau 2xx) | FAIL |
|-------|-------|------|-------------------|------|
| **AC-FE-POST-WF-01** | Inbox pending ≥1 | Complete POST **201** | Task removed hoặc status chip đổi | Count unchanged |
| **AC-FE-POST-WF-02** | Complete **201** | F5 inbox | Task không reappear pending | Seed ghost only |

---

## 5. Business rules — FE post-mutation (cross-cut)

| BR-ID | Condition | FE action | Outcome |
|-------|-----------|-----------|---------|
| **BR-FE-POST-01** | API trả **2xx** + envelope success code | Refresh list/detail **hoặc** optimistic update khớp GET | User thấy thay đổi **≤3s** |
| **BR-FE-POST-02** | API **4xx/5xx** | Toast/banner lỗi; **không** toast success; **không** submitted local state | U63 fail-closed |
| **BR-FE-POST-03** | Mutate tab consumer (U34) | Tab liên quan refetch on focus | Cross-tab stale = FAIL |
| **BR-FE-POST-04** | Debounce save (RACI, catalog, RBAC) | UI khớp payload PUT cuối | Race revert = FAIL |
| **BR-FE-POST-05** | `publishVersionChange` alone | **Không** coi là persist | BR-UF-PERSIST-01 |

---

## 6. Gap register — spec_gap vs QA wave

| Gap ID | UC / UF | SRS AC tier | QA risk `P1-BROWSER-E2E-XBOS-WAVE-8088` | Owner |
|--------|---------|-------------|-------------------------------------------|-------|
| **GAP-FE-01** | UC-CC-P0-01 / UF-XBOS-04/05 | Y-API | QA FAIL spec_gap nếu chỉ assert POST 201 | ba-process → SRS delta §4.1 |
| **GAP-FE-02** | UC-CC-P0-03 / UF-XBOS-12 | Y-API | Tree UI not in SRS | §4.2 |
| **GAP-FE-03** | UC-HRM-25 / UF-HRM-02 | **N** | Contract mutate — highest sponsor demo risk | §4.6 + **SRS §13 append** |
| **GAP-FE-04** | UC-HRM-21 PATCH / UF-HRM-03 | **N** | Employee save UI | §4.7 |
| **GAP-FE-05** | HRM-SC / UF-HRM-10 | **N** | Sync banner regression | §4.8 |
| **GAP-FE-06** | UC-HRM-26 / UF-HRM-11 | **N** | Approve queue UI | §4.9 |
| **GAP-FE-07** | UC-HRM-22 PATCH / UF-HRM-12 | **N** | Requisition F5 | §4.10 |
| **GAP-FE-08** | UC-CC-P0-05 / UF-XBOS-14 | Y-API | Autosave indicator | §4.3 |

---

## 7. Handoff — SA / Dev / QA

| Role | Action |
|------|--------|
| **PM** | Accept §4 as SRS delta backlog; không block QA nếu dùng AC-FE-* làm script checklist (U63) |
| **ba-process** (optional follow-up) | Append §4 blocks vào `COMMAND_CENTER_P0_SRS.md` § Acceptance per UC + `docs/hrm/SRS.md` §13 mutate subsection |
| **SA** | Confirm TechSpec field↔UI bind không mâu thuẫn AC-FE-* |
| **dev-fe** | Implement/fix only where code ≠ AC-FE (shareholder done — `P1-CC-SHR-RATIO-UX-01`) |
| **qa** | `P1-BROWSER-E2E-XBOS-WAVE-8088` — mỗi UF evidence block = template §2 `qa-fe-outside-browser-gate.mdc` |

---

## 8. Completion contract

| Field | Value |
|-------|-------|
| **completion_report** | Quét **24** mutate UF/UC (10 XBOS + 14 HRM). Ma trận §2–§3: **0** Y-FE, **9** Y-API, **15** N. Đề xuất **12** delta AC clusters (**AC-FE-POST-***) với FE rules đo được. Cross-link shareholder AC-SHR từ wave trước. |
| **residual** | SRS files **chưa** patched inline — delta ở artifact này; PM quyết định merge SRS vs override. RACI/WF/CATGOV vẫn **N** ngoài §4.11–12. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-BA-FE-POST-MUTATION-SRS-MERGE-01 — PM intake PASS_TO_PM from docs/program/governance/p1-fe-post-mutation-ac-ba-delta-20260620.md. Dispatch ba-process (0.5d governance): append §4.1–4.12 AC-FE-POST-* blocks into COMMAND_CENTER_P0_SRS.md Acceptance subsections + docs/hrm/SRS.md §13 mutate AC (UC-HRM-21/22/25/26, HRM-SC) without rewriting full SRS. Then dispatch qa work_item_id P1-BROWSER-E2E-XBOS-WAVE-8088 — browser :8088; mỗi UF dùng AC-FE-POST-* làm exit criteria; FAIL spec_gap → ba-process same day. Exit: SRS delta merged + qa DISPATCHED.` |
| **evidence_path** | `docs/program/governance/p1-fe-post-mutation-ac-ba-delta-20260620.md` |
| **ack_status** | **PASS_TO_PM** |

---

*Maintained by BA-Process · U63 sponsor lock · sync with USER_FLOW_OPERABILITY_MATRIX after SRS merge.*
