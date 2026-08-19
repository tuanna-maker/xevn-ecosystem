# PO-HRM-CTR-CREATE-AUDIT-SA-01 — Portal geometry: Option A vs Option B (no sponsor pick)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-AUDIT-SA-01` |
| **parent** | `docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md` Task 4 |
| **lane** | governance · sa |
| **date** | 2026-08-10 |
| **change_mode** | **ADD** architecture option note · **NO CODE** `apps/**` |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** |
| **verdict** | **OPTIONS ONLY** — PM/sponsor chọn; SA **không** lock Option trong seat audit |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Context (facts from repo)

### 1.1 Sponsor / process signals

| Nguồn | Fact |
|-------|------|
| `PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md` | Popup **không full màn** CC; bước 2 DnD / tab; **không revert** code |
| `INC-PM-COMPOSER-DIRECT-CODE-CTR-UX-20260810.md` §Addendum | Create dialog dùng `portalScope="iframe"` → modal **trong bbox iframe**; view dialog vẫn parent portal; đề xuất **AC-CTR-UX-06/07** |
| `PO_HRM_CTR_CREATE_REDESIGN_SPONSOR_INTAKE.md` | UX popup/layout là P0; AMIS IA đã lock ở `PO-HRM-CTR-CREATE-REDESIGN-SA-01` (wizard IA, **không** chọn portal geometry) |
| QA slice `po-hrm-ctr-create-redesign-qa-02.md` | DnD **PASS** sau `sameNodeDragBind` + FE-DND fixes; nested-scroll advisory P2 (không block) |

### 1.2 Normative embed rule (TECHSPEC)

`docs/ecosystem/TECHSPEC.md` **§4.1** yêu cầu:

- HRM `?portal=1` → overlay/dialog che **toàn viewport trình duyệt** (gồm rail/sidebar CC), **không** bị cắt trong khung iframe.
- `getDialogPortalContainer()` / `getRadixPortalContainer()` tại `apps/web/hrm/src/lib/hrmDialogPortal.ts`.
- Parent mount + **`syncHrmStylesheetsToParentForPortalDialogs()`** (clone `link[rel=stylesheet]` + `style` từ iframe → parent).
- Floating layers (Select/Popover/Dropdown) **z-index** `HRM_PORTAL_FLOATING_Z` > overlay `HRM_PORTAL_OVERLAY_Z`.
- **Cross-origin:** parent access `null` → fallback iframe; **postMessage** full-viewport = hướng dự phòng **chưa** triển khai.

### 1.3 AS-IS code (create vs view — cite only)

| Surface | `portalScope` / portal | Ghi chú |
|---------|------------------------|---------|
| **Create/Edit** `Contracts.tsx` `DialogContent` | `portalScope="iframe"` | Comment vẫn ghi «CC embed: Content portals to parent (TECHSPEC §4.1)» — **mâu thuẫn** với prop |
| **View** `Contracts.tsx` `DialogContent` | omit → **parent** (default `dialog.tsx`) | `data-hrm-dialog-portal="parent"` |
| **JD writer** (precedent) | `portalScope="iframe"` | `po-hrm-ui-header-jd-dnd-fe-01.md` — pangea `findDragHandle` chỉ query **iframe `document`** |

`hrmDialogPortal.ts` (must_keep): idempotent stylesheet sync; same-origin only; floating z > overlay z; **không** đổi geometry DnD — geometry ở CSS + `DialogContent`.

`dialog.tsx`: default **omit** `portalScope` = parent portal; `portalScope="iframe"` = mount iframe body **cho DnD trong cùng document**.

---

## 2. Architecture problem (one sentence)

**Mục tiêu UX §4.1 (full browser viewport trên CC)** và **ràng buộc kỹ thuật `@hello-pangea/dnd` (DragDropContext + handles trong cùng `document` với thư viện)** đang **kéo ngược** nhau trên cùng một `DialogContent` nếu chỉ bật/tắt `portalScope` mà không thêm thiết kế bổ sung.

```text
  web-portal (CC chrome: sidebar, header)
       │
       └── iframe HRM (?portal=1)
                 │
                 ├── Option A: Radix Portal → parent.body
                 │      overlay covers CC + iframe (TECHSPEC §4.1 ✓)
                 │      DnD DOM may live in parent document (pangea risk ✗ unless engineered)
                 │
                 └── Option B: Radix Portal → iframe.body
                        modal max-w/ max-h inside iframe bbox only
                        DnD same document (pangea ✓)
                        CC chrome still visible around iframe (sponsor «không full màn» ✗)
```

---

## 3. Option A — Parent portal full CC + stylesheet sync (`hrmDialogPortal`)

### 3.1 Mô tả

- Create/edit wizard `DialogContent`: **không** set `portalScope="iframe"` (hoặc `portalScope="parent"`).
- Radix mount `window.parent.document.body`; gọi `syncHrmStylesheetsToParentForPortalDialogs()`; overlay `z-[100000]`; Select/Popover dùng `getRadixPortalContainer()` cùng parent khi mở từ dialog đã portal.
- Layout: `max-w` / `max-h` theo **viewport** (~90–96vw, ~90–92vh) như AC-CTR-UX-06 draft trong incident.

### 3.2 Ưu điểm

| # | Lợi ích |
|---|---------|
| A1 | **Khớp TECHSPEC §4.1** và comment kiến trúc embed mặc định toàn HRM |
| A2 | **Đồng nhất** với view dialog và phần lớn dialog HRM khác (default parent) |
| A3 | Backdrop che **sidebar/top chrome CC** — cảm giác «một app», đúng phản hồi sponsor «full màn CC» |
| A4 | Tái sử dụng hạ tầng đã có: a11y mirror (`hrmDialogPortalA11y`), z-index, stylesheet sync — **không** mở slice postMessage |

### 3.3 Nhược điểm / rủi ro

| # | Rủi ro | Cite / cơ chế |
|---|--------|----------------|
| A-R1 | **DnD fail** «Unable to find drag handle» nếu `DragDropContext` ở iframe nhưng draggable mount parent (hoặc ngược) | `po-hrm-ui-header-jd-dnd-fe-01.md` root cause #2 |
| A-R2 | **Select/Popover** trong Bước 1 lệch layer nếu mix iframe-only + parent dialog không đồng bộ `portalScope` trên mọi Radix consumer | TECHSPEC §4.1 liệt kê Select/Popover/Dropdown |
| A-R3 | **CSS drift**: Tailwind/shadcn clone sang parent — dev HMR / hash style có thể lệch; phụ thuộc `syncHrmStylesheetsToParentForPortalDialogs` idempotent | `hrmDialogPortal.ts` must_keep |
| A-R4 | **Nested scroll** trong dialog lớn + palette `overflow-y-auto` → advisory pangea (đã thấy QA-02 P2) có thể tăng trên modal cao ~90vh | `po-hrm-ctr-create-redesign-qa-02.md` |
| A-R5 | **Regression surface** rộng: mọi UF HRM embed dùng chung `dialog.tsx` default — CTR create là **stress test** (2 bước + DnD + nhiều Select) | `Contracts.tsx` vs `JdTemplateWriterDialog` precedent |

### 3.4 Điều kiện kỹ thuật nếu chọn A (không implement ở seat này)

Ít nhất một trong các hướng (PM giao FE + QA matrix):

1. **Toàn bộ** Bước 2 DnD tree (DragDropContext + droppables) render trong **cùng document** với portal target — thường nghĩa là portal parent **và** không giữ context trong iframe, **hoặc**
2. Giữ iframe document cho DnD nhưng **overlay giả** full viewport trên parent (postMessage / portal host) — **ngoài** §4.1 hiện tại (GAP platform), **hoặc**
3. Tiếp tục `sameNodeDragBind` + defer `dndReady` (`ContractCreateStep2ClausePreview.tsx`) **và** chứng minh QA J-HRM-CTR-CREATE-02 trên URL CC với **parent** portal (hiện create đang iframe).

### 3.5 Evidence plan (sponsor U65)

- URL CC `…/command-center/hrm/contracts` · persona `ceo@xe.vn`
- Screenshot: overlay che **cả** sidebar CC (không viền iframe lộ quanh modal)
- Bước 2: kéo palette → canvas → **Gỡ** · console **không** `Unable to find drag handle`
- Network mutate giữ nguyên U65; **không** seed

---

## 4. Option B — Iframe-scoped modal («full-iframe» trong bbox embed)

### 4.1 Mô tả

- Giữ (hoặc cố ý) `portalScope="iframe"` trên create/edit `DialogContent`.
- Modal **phình** trong iframe: `max-w-[min(96vw,80rem)]`, `max-h-[92vh]`, scroll nội bộ — như AS-IS patch PM (`Contracts.tsx` ~1596–1600).
- **Không** mount overlay lên `parent.document.body`; CC chrome **luôn** nhìn thấy quanh khung HRM.

**Biến thể B′ (không có trong code):** phóng iframe embed **full vùng nội dung CC** (layout web-portal), modal ~100% iframe — vẫn **không** che sidebar nếu sidebar nằm ngoài iframe.

### 4.2 Ưu điểm

| # | Lợi ích |
|---|---------|
| B1 | **DnD cùng document** với `@hello-pangea/dnd` — khớp precedent JD writer + FE-DND wave | `dialog.tsx` CODE-MEMORY-CHANGE 2026-08-06 |
| B2 | **Ít phụ thuộc** stylesheet sync parent (dialog chrome trong iframe) |
| B3 | **Cô lập** regression embed: thay đổi create dialog **không** đụng z-index/a11y mirror trên parent |
| B4 | QA-02 đã chứng minh DnD **có thể PASS** trên slice với pattern iframe + `sameNodeDragBind` | `po-hrm-ctr-create-redesign-qa-02.md` |

### 4.3 Nhược điểm / rủi ro

| # | Rủi ro | Cite |
|---|--------|------|
| B-R1 | **Lệch TECHSPEC §4.1** cho dialog tạo HĐ — overlay không full viewport browser | §4.1 bullet «không bị cắt trong khung iframe» |
| B-R2 | **Trực tiếp mâu thuẫn** phản hồi sponsor / audit: «popup không full màn CC», «màn con» | dispatch wave + incident addendum |
| B-R3 | **Lệch parity** create (iframe) vs view (parent) trên cùng màn `Contracts` | `Contracts.tsx` create `iframe` vs view omit parent |
| B-R4 | Modal lớn trong iframe **nhỏ** vẫn cảm giác chật; scroll lồng (list + dialog + step2 palette) — sponsor đã phàn nàn layout/scroll |
| B-R5 | Harness / HDSD latch `data-hrm-dialog-portal="parent"` trên create **mâu thuẫn** implementation | sr-only latch ~1047 vs `portalScope="iframe"` ~1599 |

### 4.4 «Sponsor đã reject?» (fact-only)

- Sponsor **chưa** vote Option B bằng tên trong chat; sponsor **đã reject UX outcome** mô tả như Option B (modal trong khung embed, không phủ CC).
- Incident ghi patch PM **cố ý** iframe để DnD — **không** có SA sign-off geometry tại thời điểm patch.
- **Không suy luận** «reject Option B vĩnh viễn» — chỉ: **outcome hiện tại trùng hướng B và bị sponsor đánh FAIL UX viewport**.

### 4.5 Evidence plan

- Chứng minh DnD PASS (đã có QA-02 class).
- **FAIL** AC-CTR-UX-06 (khi BA-02 publish): screenshot còn sidebar CC / viền iframe.
- PM cần **không** claim §4.1 compliance cho create dialog nếu giữ B.

---

## 5. Trade-off matrix (sponsor decision input)

| Tiêu chí | Option A — parent full CC + sync | Option B — iframe modal |
|----------|----------------------------------|-------------------------|
| TECHSPEC §4.1 | **Align** | **Misalign** |
| Sponsor «full màn CC» | **Align** (nếu implement đúng geometry) | **Misalign** |
| `@hello-pangea/dnd` Bước 2 | **Risk** — cần engineering proof | **Align** (precedent) |
| View/create parity | **Align** view | **Split** create≠view |
| Blast radius | CC-wide dialog stack | Hẹp create wizard |
| Cross-origin prod | Cùng rủi ro fallback §4.1 | Ít đụng parent DOM |
| QA cost | Retest full matrix + J-02 trên CC | DnD ít hơn; viewport FAIL likely |

---

## 6. BA / AC hooks (không bịa — pointer)

| ID | Nội dung | Gắn Option |
|----|----------|------------|
| **AC-CTR-UX-06** (draft incident) | Full viewport CC, ~90% w/h, cấm bbox iframe | **A** |
| **AC-CTR-UX-07** (draft incident) | DnD PASS trên URL CC; nếu iframe-only DnD → SA Option doc | **A hoặc B** — sponsor chọn trade |
| **O1** BA-01 | Stepper 2 bước (IA) | **Neutral** — cả A/B có thể |
| **O6–O7** BA-01 | DnD / Gỡ bước 2 | **B** dễ hơn **mặc định**; **A** cần điều kiện §3.4 |
| Dispatch QA audit | «Dialog full viewport CC» vs O1/§4.1 | Đo **viewport**, không chỉ `max-w` trong iframe |

---

## 7. Impacted systems

| System | Option A | Option B |
|--------|----------|----------|
| `apps/web/hrm` `dialog.tsx` | Default path + CTR wizard stress | Explicit `portalScope="iframe"` on create only |
| `hrmDialogPortal.ts` | **Critical path** sync + z-index | Ít gọi sync cho create shell |
| `ContractCreateStep2ClausePreview` | DnD + `dndReady` + scroll | Hiện trạng |
| `apps/web/web-portal` embed layout | Không bắt buộc đổi | B′ mới cần iframe sizing |
| SRS/TechSpec | §4.1 đã đủ | Cần **waiver** hoặc delta nếu sponsor chấp nhận B |
| QA J-HRM-CTR-CREATE-02 | Bắt buộc retest sau đổi portal | Viewport vs DnD split verdict |

---

## 8. Rollout checkpoints (sau khi sponsor chọn)

1. **BA-02** khóa AC-CTR-UX-06/07 + map O1/O6/O7.
2. **FE-03** (post-audit): một `portalScope` policy cho create **documented** trong slice + CODE-MEMORY-CHANGE.
3. **QA-03** U65: matrix dispatch Task 2 + J-02 + screenshot viewport.
4. **QC**: không GO printable module; GWC slice only.

---

## 9. Residual (mở — không chọn thay sponsor)

| ID | Mô tả | Owner kế |
|----|--------|----------|
| R-CTR-PORTAL-01 | Sponsor chưa chốt A vs B vs hybrid §3.4 | **pm → sponsor** via `NEED-SPONSOR-QUESTIONS` |
| R-CTR-PORTAL-02 | FE/QA audit files Task 1–3 có thể chưa merge — SA dựa code + incident + QA-02 | **pm** synth wave |
| R-CTR-PORTAL-03 | postMessage full-viewport (§4.1 fallback) chưa thiết kế | **sa** chỉ khi sponsor chọn A nhưng DnD không đóng trong parent-only |

---

## 10. completion_report

**Closed:** Docs-only Option analysis `PO-HRM-CTR-CREATE-AUDIT-SA-01` — Option **A** (parent portal + `hrmDialogPortal` sync) vs Option **B** (iframe-scoped modal), trade-offs cite TECHSPEC §4.1, `hrmDialogPortal.ts`, `dialog.tsx`, `Contracts.tsx`, incident addendum, JD-DND precedent, QA-02 DnD. **Không** lock Option; **không** sửa `apps/**`.

**Open:** Sponsor decision R-CTR-PORTAL-01; synth audit BA/QA/FE; optional hybrid/postMessage nếu sponsor từ chối cả UX A lẫn DnD risk.

| Field | Value |
|-------|--------|
| **next_owner** | **pm** |
| **evidence_path** | `docs/program/specs/PO-HRM-CTR-CREATE-AUDIT-SA-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS-01
from_role: pm
to_role: pm
lane: governance
entry_criteria: SA PASS docs/program/specs/PO-HRM-CTR-CREATE-AUDIT-SA-01.md + BA/QA/FE audit evidence paths (when available) per docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md
exit_criteria: Publish docs/program/PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS.md — gap table + NEED-SPONSOR-QUESTIONS including one multiple-choice: (A) parent full CC portal per TECHSPEC §4.1 with DnD proof plan §3.4 vs (B) iframe modal with TECHSPEC waiver vs (C) defer hybrid/postMessage spike; cite AC-CTR-UX-06/07; no FE dispatch until sponsor answers
ack_status: PASS_TO_SPONSOR_INTAKE
evidence_path: docs/program/PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS.md
cấm: implement apps/** · claim module UAT · choose Option without sponsor
```

---

*End of PO-HRM-CTR-CREATE-AUDIT-SA-01 — OPTIONS ONLY · PASS_TO_PM.*
