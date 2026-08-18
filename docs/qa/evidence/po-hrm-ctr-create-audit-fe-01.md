# FE audit — CTR create wizard (AS-IS code only)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-AUDIT-FE-01` |
| **from_role** | dev-fe |
| **to_role** | pm |
| **ack_status** | `PASS_TO_PM` |
| **date** | 2026-08-10 |
| **scope** | Audit only — **no** `apps/**` changes in this seat |
| **read_first** | `docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md` Task 3 · `PO-HRM-CTR-CREATE-REDESIGN-BA-01.md` §4–§5 · `INC-PM-COMPOSER-DIRECT-CODE-CTR-UX-20260810.md` addendum |

**QA cross-ref:** `po-hrm-ctr-create-audit-qa-01.md` not present at audit time — findings are **static code** vs spec/comments; browser PASS/FAIL remains QA seat.

---

## 1. Portal create dialog — `portalScope` / className vs embed TECHSPEC trail

**Spec / comment trail (not BA O-table):**

| Source | Says |
|--------|------|
| `Contracts.tsx` comment | Create/Edit dialog — «CC embed: Content portals to **parent document** (TECHSPEC §4.1)» — `Contracts.tsx:1596` |
| `PO-UC-TC-W4` CODE-MEMORY on same file | «keep Dialog **parent-portal** (TECHSPEC §4.1)» — `Contracts.tsx:77–80` |
| `hrmDialogPortal.ts` | Default Radix mount: **parent** body when `?portal=1` — overlay full browser viewport — `hrmDialogPortal.ts:5–8`, `getRadixPortalContainer` `78–84` |
| `dialog.tsx` CODE-MEMORY | **Default omit** `portalScope` = parent portal; `'iframe'` = mount in **iframe** body for hello-pangea — `dialog.tsx:106–110`, `130–135` |
| INC addendum 2026-08-10 | Create wrongly `portalScope="iframe"` → modal inside embed bbox; view uses parent — `INC-PM-COMPOSER-DIRECT-CODE-CTR-UX-20260810.md:68–78` |
| BA-01 wireframe §4 | Dialog rộng (`max-w-5xl` hoặc **full-bleed embed**) · `xevn-safe-inline` — `PO-HRM-CTR-CREATE-REDESIGN-BA-01.md:123` |
| QA matrix O1 | Dialog full viewport CC — dispatch `PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md:77` |

**Code does:**

| Item | Location | Fact |
|------|----------|------|
| Create/edit `portalScope` | `Contracts.tsx:1598–1599` | `portalScope="iframe"` — mounts dialog in **iframe** `document.body`, not parent CC |
| Create `className` | `Contracts.tsx:1600` | `max-w-[min(96vw,80rem)] max-h-[92vh] w-full overflow-hidden flex flex-col gap-4 p-6 xevn-safe-inline text-base` |
| Scroll shell | `Contracts.tsx:1623` | Inner `min-h-0 flex-1 overflow-y-auto` wraps wizard |
| View dialog | `Contracts.tsx:1670–1675` | Comment «portals to parent»; `data-hrm-dialog-portal="parent"`; **no** `portalScope` prop → **parent** portal when embed (`dialog.tsx` default) |
| Wizard body | `ContractCreateWizardDialog.tsx` | No portal props — inherits create `DialogContent` mount |

**spec says / code does:**

| Dimension | Spec / comment | Code | Verdict |
|-----------|----------------|------|---------|
| Portal target | Parent document / full CC viewport (comments §4.1 trail + `hrmDialogPortal`) | Create: **iframe**; View: **parent** | **GAP** — create ≠ view ≠ comment §4.1 trail |
| Width / height | full-bleed embed or large dialog (BA wireframe; INC AC-CTR-UX-06 draft) | 96vw cap but **clipped by iframe** if portal=iframe | **GAP** (UX) — CSS may be correct per iframe, sponsor symptom «màn con» consistent with iframe portal |
| `xevn-safe-inline` | BA wireframe | Present on create `DialogContent` | **ALIGNED** |

**Đề xuất — cần BA/sponsor + SA Option (không implement audit wave):** SA Task 4 Option A/B; sponsor chốt AC-CTR-UX-06; nếu parent portal + DnD → stylesheet sync (`hrmDialogPortal.ts`) vs iframe-only DnD (`dialog.tsx:106–107`).

---

## 2. Stepper tab vs nút «Tiếp» vs `goStep2` / `templateCode` gate

**Spec (BA-01):**

| Ref | Expectation |
|-----|-------------|
| O1 | Stepper 2 bước «Thông tin & mẫu» / «Điều khoản & xem trước» — `BA-01.md:191` |
| O2 | Bước 1 combobox `template_code` từ catalog active — `BA-01.md:192` |
| J-01 | Bước 1 chọn mẫu + NV + ngày → **Tiếp** — `BA-01.md:223` |
| Wireframe footer | `Quay lại` \| `Tiếp` / `Lưu` — `BA-01.md:124` |

**Code does:**

| Mechanism | Location | Behavior |
|-----------|----------|----------|
| Stepper UI | `ContractCreateWizardDialog.tsx:254–282` | Two `StepChip` tabs: «1. Thông tin & mẫu», «2. Điều khoản & xem trước»; `data-testid="ctr-create-wizard-stepper"` |
| Tab 2 disabled | `ContractCreateWizardDialog.tsx:272` | `disabled={step === 1 && (isSubmitting \|\| !templateCode.trim())}` |
| Tab 2 `title` hint | `ContractCreateWizardDialog.tsx:273–276` | Explains chọn mẫu + «cùng nút Tiếp» |
| Tab 2 click | `ContractCreateWizardDialog.tsx:278–280` | If not already step 2: `void goStep2()` |
| Tab 1 click | `ContractCreateWizardDialog.tsx:264–266` | From step 2 → `setStep(1)` only (no API) |
| `goStep2` | `ContractCreateWizardDialog.tsx:230–237` | If `!templateCode.trim()` → toast error; else `persistRegistry(false)`; on success `setStep(2)` |
| «Tiếp» button | `ContractCreateWizardDialog.tsx:363–370` | `disabled={isSubmitting \|\| !templateCode.trim()}`; `onClick={() => void goStep2()}`; `data-testid="ctr-create-next-btn"` |
| Step 2 guard | `ContractCreateWizardDialog.tsx:239–242` | If `step === 2` without `sessionContractId` → force `setStep(1)` |
| Step 2 body | `ContractCreateWizardDialog.tsx:322–332` | Renders `ContractCreateStep2ClausePreview` only when `sessionContractId` set (after successful persist) |
| Template load step 1 | `ContractCreateWizardDialog.tsx:111–127` | `listContractTemplates({ status: 'active' })` |
| No active template banner | `ContractCreateStep1GeneralGrid.tsx:166–173` | Banner + CTA Settings when `activeTemplates.length === 0` |

**spec says / code does:**

| Check | Verdict |
|-------|---------|
| O1 — structural 2-step stepper (not single long form) | **ALIGNED** — wizard replaces inline print spine in dialog |
| Tab 2 vs «Tiếp» same gate (`templateCode`) | **ALIGNED** — both call `goStep2()` / same disabled rule |
| Tab 2 without mẫu | **ALIGNED** — disabled + toast in `goStep2` |
| Bước 2 requires API persist | **CODE FACT** — `goStep2` always `persistRegistry(false)` before step 2; failure leaves step 1 (sponsor «không sang bước 2» may be validation/API, not missing tab wiring) |
| Tab 1 from step 2 without re-persist | **GAP vs strict AMIS?** — tab click only `setStep(1)`; clause edits on step 2 may be stale until next «Tiếp»/Lưu — **NEED-SPONSOR/BA** if tab switch must not skip persist |

**Đề xuất — cần BA/sponsor:** Clarify whether step-2 entry must always POST/PATCH (current) or allow preview-only navigation; document fail reasons from `buildRegistrySubmitPayload` in QA evidence.

---

## 3. Employee control — `Select` vs `CatalogSearchPicker`

**Spec:**

| Ref | Expectation |
|-----|-------------|
| Sponsor intake / O3 | NV **search** (not long UUID display) — dispatch wave · `BA-01.md:193` (merge fields + NV) |
| AS-IS BA scan | Historically picker shallow — `BA-01.md:51–61` |

**Code does:**

| Location | Control |
|----------|---------|
| `ContractCreateStep1GeneralGrid.tsx:150–161` | **Create only** when `!isEdit && employeesList.length > 0`: `CatalogSearchPicker` |
| Options label | `ContractCreateStep1GeneralGrid.tsx:110–113` | `label: \`${emp.full_name} — ${emp.employee_code}\`` |
| Value | `ContractCreateStep1GeneralGrid.tsx:155` | `value={form.employee_id ?? ''}` — **UUID** as picker value (display via label when matched) |
| Placeholder | `ContractCreateStep1GeneralGrid.tsx:157` | «Gõ tên hoặc mã NV để tìm…» |
| testid | `ContractCreateStep1GeneralGrid.tsx:158` | `HDSD_MUTATE_TEST_IDS.contractsFormEmployee` |
| No employee `Select` in wizard | Grep wizard components | **No** `<Select>` for employee in `ContractCreateStep1GeneralGrid` / wizard |
| List prefetch | `Contracts.tsx:386–387`, `497–512` | Employees load when dialog opens; auto-prefill first NV if empty |

**spec says / code does:**

| Check | Verdict |
|-------|---------|
| Search picker vs raw UUID dropdown | **ALIGNED** with TO-BE search — `CatalogSearchPicker`, not `Select` with UUID labels |
| UUID visible in UI | **CONDITIONAL** — if picker fails to resolve label (stale id / empty list), value may show raw id — QA must verify |
| `employeesList.length === 0` | **GAP** — no employee field rendered (`ContractCreateStep1GeneralGrid.tsx:150` guard); create may proceed without NV UI — **NEED-SPONSOR** empty-list behavior |

**Đề xuất — cần BA/sponsor:** AC for zero employees in scope; confirm CatalogSearchPicker portal popover with create `portalScope=iframe` (popover mount may differ from parent portal).

---

## 4. Step 2 DnD — `DragDropContext`, ids, `sameNodeDragBind`

**Spec (BA-01):**

| Ref | Expectation |
|-----|-------------|
| O6 | Palette + canvas; drag palette→canvas; PUT order 2xx — `BA-01.md:196` |
| O7 | Mẫu → clause → Xem trước — `BA-01.md:197` |
| O6/O7 | «Gỡ» before submit — sponsor intake / QA matrix O6–O7 |

**Code does:**

| Item | Location |
|------|----------|
| Library gate | `ContractCreateStep2ClausePreview.tsx:109–138` | Fetch templates + clauses; `setLibraryReady(true)` on success |
| `dndReady` defer | `ContractCreateStep2ClausePreview.tsx:79–99` | Double `requestAnimationFrame` after `libraryReady` — comment «iframe — same pattern as JD writer» |
| `DragDropContext` mount | `ContractCreateStep2ClausePreview.tsx:321` | Only when `libraryReady && dndReady` |
| Palette `Droppable` | `ContractCreateStep2ClausePreview.tsx:326` | `droppableId="ctr-create-palette"` **`isDropDisabled`** |
| Canvas `Droppable` | `ContractCreateStep2ClausePreview.tsx:370` | `droppableId="ctr-create-canvas"` |
| Palette `draggableId` | `ContractCreateStep2ClausePreview.tsx:334` | `draggableId={`cpal-${cl.id}`}` · React `key={`pal-${cl.id}`}` |
| Canvas `draggableId` | `ContractCreateStep2ClausePreview.tsx:383` | `draggableId={`ccan-${cl.id}`}` · `key={`can-${cl.id}`}` |
| Id parser | `ContractCreateStep2ClausePreview.tsx:163–167` | `cpal-` / `ccan-` → `slice(5)` → clause id |
| `onDragEnd` | `ContractCreateStep2ClausePreview.tsx:177–188` | Canvas reorder; palette→canvas via `placeClauseOnCanvas` |
| `sameNodeDragBind` | `ContractCreateStep2ClausePreview.tsx:336–341`, `385–390` | Full `DraggableProvided` merged on row `div` |
| «Thêm» | `ContractCreateStep2ClausePreview.tsx:345–356` | `addClauseToCanvas`; `onPointerDown` stopPropagation on button |
| «Gỡ» | `ContractCreateStep2ClausePreview.tsx:396–407` | `removeClauseFromCanvas`; `data-testid={`ctr-clause-remove-${cl.id}`}` |
| Overlay persist | `ContractCreateStep2ClausePreview.tsx:190–201`, `425–426` | `putContractPrintOverlay` |
| Anti-pattern note | `ContractCreateWizardDialog.tsx:6` | «cấm syncContractTemplateClauseBind» — step 2 uses per-contract overlay path |

**spec says / code does:**

| Check | Verdict |
|-------|---------|
| O6 structure palette/canvas + DnD wiring | **ALIGNED** in code — pangea + distinct ids + palette drop disabled |
| O6 «Gỡ» | **ALIGNED** — remove button present |
| O6/O7 runtime PASS | **UNVERIFIED** — depends on `portalScope=iframe` + `dndReady`; QA console pangea / sponsor «không kéo» |
| `sameNodeDragBind` contract | **ALIGNED** — matches `jdDndSameNodeProps.ts:39–49` (throws if handle missing) |
| Step 2 only after persist | **ALIGNED** with wizard — step 2 component receives `contractId` from `sessionContractId` |

**Đề xuất — cần BA/sponsor + SA:** If create dialog moves to **parent** portal, re-validate DnD (INC AC-CTR-UX-07); may need `portalScope="iframe"` **only** for DnD dialogs or parent+stylesheet sync per JD writer pattern.

---

## 5. Summary matrix (PM synth)

| Area | vs BA-01 / comments | Severity | Owner kế |
|------|---------------------|----------|----------|
| Create `portalScope="iframe"` vs parent §4.1 comments + view dialog | GAP | P0 UX (sponsor) | SA Option → FE fix wave sau chốt |
| Dialog size classes | Partial — good CSS but iframe-bound | P1 UX | QA screenshot + FE với portal fix |
| Stepper / Tiếp / `templateCode` | ALIGNED wiring | — | QA fail → trace `persistRegistry` / Network |
| Employee `CatalogSearchPicker` | ALIGNED TO-BE | — | QA empty list + label resolution |
| Step 2 DnD code | ALIGNED structure | — | QA J-02 + console |

---

## 6. Handoff

**completion_report:** Closed static FE audit for CTR create wizard: portal/create vs view + TECHSPEC comment trail; stepper/`goStep2`/`templateCode`; employee picker; step 2 DnD ids and `sameNodeDragBind`. No `apps/**` edits.

**Residual:** Browser verification (QA-01); SA portal Option; sponsor AC-CTR-UX-06/07; tab-1 back navigation without persist policy.

**next_owner:** pm

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS-PM-01
Intake docs/qa/evidence/po-hrm-ctr-create-audit-fe-01.md + BA/QA/SA audit seats when ready.
Gộp gap P0 create portalScope iframe vs parent §4.1 trail (Contracts.tsx:1596–1599 vs 1672–1675).
Publish PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS.md + NEED-SPONSOR-QUESTIONS; BLOCK FE fix until sponsor answers (bus 2026-08-10).
```

**evidence_path:** `docs/qa/evidence/po-hrm-ctr-create-audit-fe-01.md`

**ack_status:** `PASS_TO_PM`
