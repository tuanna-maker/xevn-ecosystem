# Phase 1 — Program đóng UC song song (sponsor 2026-08-10)

| Meta | Value |
|------|--------|
| **Mục tiêu** | Đóng **toàn bộ UC Phase 1 chưa `e2e_pass`** (baseline ~245 UC; snapshot gate: **63+ planned**, **~30–44 e2e_pass** — regen bằng `pnpm phase1:gate`) |
| **Song song** | (1) **SOLID + OS convention** mọi dispatch Dev · (2) **Fidelity SRS** (Settings/JD/catalog) · (3) **Burn UC theo khối** |
| **Không claim DONE** | Phase 1 / PROD cho đến `phase1:gate` + QC GO + sponsor UAT (`PHASE1_PMP_PROJECT_PLAN.md`) |
| **U65** | Nghiệm thu UC mutate = FE → 2xx → F5; **cấm seed** làm bằng chứng |

---

## 1. Định nghĩa “UC done”

| Trạng thái matrix | Ý nghĩa | Còn việc |
|-------------------|---------|----------|
| `planned` | Chưa impl hoặc chưa nối FE↔BE | Dev + spec (DB/API/UI_SCREEN) + QA |
| `be` | API có; FE/mobile chưa UF | Dev-FE/Mobile + QA L2.5 |
| `partial` | Một phần AC SRS | BA delta AC + Dev + QA |
| `e2e_pass` | UF/browser/jest evidence | **Giữ** — cấm đè (pm-srs-first) |
| `waived` | PM/QC ghi owner+expiry | Không burn |

**Done một UC** = `e2e_pass` **hoặc** `waived` có bus + evidence + trace SRS bước Diễn biến.

---

## 2. Nguyên tắc chạy song song (≤4 Task/lượt)

```text
Mỗi wave UC:
  BA (nếu planned & thiếu DB/API/UI_SCREEN) → Dev-BE → Dev-FE/Mobile (song song khi contract khóa)
  → QA (UF + J-*) → QC (slice) → BA/SA wave kế
```

**Mọi Dev dispatch** kèm: `docs/program/knowledge/DEV_SOLID_AND_OS_CONVENTION_ENFORCEMENT.md` + `solid_convention_ack` + `code_memory_required`.

**SoT ưu tiên:** `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · `docs/program/PROGRAM_JOURNEY_MAP.md` · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md`.

---

## 3. Wave map (cuốn chiếu — không một monolith)

| Wave | ID | Phạm vi UC / chương trình | Owner chính | Exit |
|------|-----|---------------------------|-------------|------|
| **U0** | Inventory | Quét matrix → backlog UC `planned/be/partial` có spec_ref | **ba-process** | `PHASE1_UC_CLOSURE_BACKLOG.md` |
| **U1** | Settings fidelity | FR Settings + catalog consumer + JD list + CTR tpl (đang mở) | dev-fe + qa | `PO-HRM-SETTINGS-FIDELITY-PROGRAM-WAVE-01` QA PASS slice |
| **U2** | HRM spine | Employees · Contracts · Insurance · Payroll · Attendance leave (UC có SRS, chưa UF) | dev-be/fe + qa | J-HRM-* + matrix HRM 🟢 |
| **U3** | XBOS khối A | Burn `be` → `e2e_pass` (catalog, KPI, org, WF…) | dev-be/fe + qa | e2e_pass delta + `test:xbos` |
| **U4** | Mobile MOB | `UC-HRM-MOB-*` + `docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md` | dev-mobile + qa-device | J-MOB-* |
| **U5** | Data / catalog 183 | 50 UC `data` + publish/pull XBOS (`HRM_FULL_FIDELITY_PROGRAM`) | dev-be + devops | **Chỉ UAT sau FE path** — không seed-only pass |
| **U6** | Gate | `phase1:gate` · QC Phase 1 · sponsor sign-off | qc + pm | G1/G2 closure |

**Đang active sponsor:** **U1** (Settings) + **U2** (CTR create, payroll cluster P0 bus) **song song** sau U0 inventory.

---

## 4. P0 bus (2026-08-10 — từ `PM_OPEN_BACKLOG.json`)

| work_item_id | Lane | Ghi chú PM |
|--------------|------|------------|
| `HRM-MVP-GD1-PAY-09-CLUSTER-01` | dev-be | Payroll cluster — FAIL QA → BE |
| `HRM-CTR-CREATE-REDESIGN-01` | dev-fe/be | Tạo HĐ CC — scope parity + picker |
| `HRM-CTR-PICKER-INLINE-PORTAL-01` | dev-fe | Inline UV picker |
| `HRM-CTR-PICKER-INLINE-PORTAL-01-RETEST-DND` | **qa** (U65 FE data) | **Không** dev-be nếu chỉ thiếu TPL+UV từ FE |
| `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` | dev-fe → qa | Settings catalog mutate |
| `HRM-MVP-GD1-PAY-06-CLUSTER-*` | qa | SA/BA handoff → QA payroll |

---

## 5. Governance song song SOLID

| Việc | Artifact |
|------|----------|
| Dispatch Dev | §9 `PM_DETAILED_DISPATCH` + `solid_convention_ack` |
| Code | `@CODE-MEMORY` + append CHANGE |
| QA | UF template + SRS bước Diễn biến |
| QC | Reject thiếu ack / FE aggregate |
| Target CI | `check-code-memory` preflight (bootstrap C-CM-01) |

---

## 6. Báo cáo sponsor (cadence)

- **`PROJECT_STATUS_REPORT.md`:** % UC `e2e_pass` / planned (sau mỗi wave QA PASS)
- **`TEAM_WORKING_NOW.md`:** wave active + 4 WI đang chạy
- **Không** hứa «xong hết UC trong một ngày» — burn theo wave có evidence

---

## 7. Work items mở (execution)

| work_item_id | Role | Mô tả |
|--------------|------|--------|
| `BA-PHASE1-UC-CLOSURE-INVENTORY-01` | ba-process | U0 — file backlog UC + map wave U1–U6 |
| `PO-HRM-SETTINGS-FIDELITY-QA-02` | qa | Retest mutate + JD + ctr tpl post-fix |
| `HRM-MVP-GD1-PAY-09-CLUSTER-01` | dev-be | P0 payroll |
| `HRM-CTR-CREATE-REDESIGN-FE-BE-02` | dev-fe + dev-be | CTR slice (picker + scope) song song file tách |

Evidence index: `docs/program/EVIDENCE_INDEX.md` · Bus: `AGENT_MESSAGE_BUS.md`
