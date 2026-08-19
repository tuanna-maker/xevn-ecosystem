# PO-HRM-REC-E2E-LINKAGE-SPEC-01 — Spine liên kết E2E tuyển dụng (spec-first)

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-E2E-LINKAGE-SPEC-01` |
| lane | governance · ba-process · senior BA accountability |
| change_mode | ADD delta only · **NO CODE** `apps/**` |
| date | 2026-08-06 |
| SoT khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **v0.10** |
| SoT đội ngũ (picker) | `docs/hrm/SRS.md` §16.0 **BR-HRM-MD-01** · **AC-HRM-PICKER-01** · §16.4 **A9 Candidate position** |
| Consumer YCTD↔JD | `docs/program/specs/PO-HRM-JD-YCTD-REF-SPEC-01.md` (+ DB/API/TechSpec REF) |
| Console evidence | `docs/qa/evidence/sponsor-console-20260806-recruitment.log` |
| honesty | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · FORBIDDEN dual-write `job_postings` as JD SoT · U65 zero-seed |
| ack_status | **PASS_TO_PM** |

---

## 0. Verdict thẳng (sponsor challenge)

Sponsor đúng về **liên kết nghiệp vụ**. Đây không phải “một field sai”.

| Layer | Honesty |
|-------|---------|
| **Enterprise SRS MVP spine** | Đã khóa 4 phần: JD master → YCTD → **ứng viên gắn bắt buộc YCTD** → dashboard. **FR-UC-BP-REC-03 tin đăng / chiến dịch = OUT MVP.** |
| **BA depth trên form Thêm UV + So sánh** | **Thiếu.** Spine master nói «UV gắn YCTD» nhưng **không** có FR 7-mục đủ Diễn biến cho *Thêm ứng viên: chọn YCTD bắt buộc → vị trí derived/select catalog*. So sánh ma trận **không** có FR riêng (chỉ đánh giá trong pipeline **FR-UC-BP-REC-06**). |
| **Team SRS (đội ngũ)** | Đã cấm free-text vị trí (**BR-HRM-MD-01** / **AC-HRM-PICKER-01**) và liệt kê **A9 Candidate position** — nhưng **chưa** được enforce trên `CandidateFormDialog` + DTO vẫn ghi «Lane B free-text». |
| **FE hiện tại** | Nhiều màn leftover: `job_postings` / campaigns / compare stub rỗng / plan UI lệch thuật ngữ định biên — **không** theo spine MVP. |

**Kết luận BA:** Lõi quy trình (định biên → YCTD → UV trên YCTD) **đã có trong SRS**; **depth form UV + compare + map UI «kế hoạch»** = **spec_gap shallow + impl_gap nặng**. Không được claim recruitment UAT-ready.

---

## §1 Spine bảng — Menu/nút → màn → entity → FR → FE → Gap

> Gap class: `spec_gap` | `impl_gap` | `OUT_MVP` | `broken`  
> Owner next = lane kế sau confirm SRS (không code trong wave này).

| # | Bước nghiệp vụ | Actor | Màn/nút UI hiện tại | Entity SoT (SRS) | FR cite | FE does | Gap | Owner next |
|---|----------------|-------|---------------------|------------------|---------|---------|-----|------------|
| 1 | Lập / duyệt định biên vị trí × tháng «Cần tuyển» | Trưởng BP · HCNS · Lãnh đạo | Tab **Kế hoạch tuyển** (`plans`) + form tạo plan (phòng/vị trí free-text NS/DX) | **Định biên** (lưới 12 tháng; chỉ theo dõi **Cần tuyển**) | **FR-UC-BP-REC-01** Luồng #1–6 · Diễn biến #1–4 · Thành công → UC kế YCTD | UI gọi `recruitment-plans`; nhập **tên phòng/vị trí tay**; cột NS+DX; không khóa ô «Cần tuyển đã duyệt» theo FR | **impl_gap** + **terminology** (UI «kế hoạch» ≠ entity định biên SRS) · shallow **spec_gap** map thuật ngữ | ba-docs merge §3.3 → sa/TechSpec plan↔headcount → **dev-fe/be** |
| 2 | Đề xuất ngoài định biên (BOD) | TP · HCNS · BGĐ | Tab **Đề xuất** (`HeadcountProposalTab`) | YCTD **ngoài ĐB** (cờ + lý do) | **FR-UC-BP-REC-02b** | Có picker vị trí danh mục trên đề xuất; nút convert → **job posting** (Lane B) | **impl_gap** convert sai SoT (phải spawn **YCTD** 02b, không tin đăng) | sa + **dev-fe/be** (sau confirm) |
| 3 | Auto sinh YCTD từ ô Cần tuyển | Hệ thống · HCNS | (ít/không thấy surface spawn từ plan) | YCTD 1–1 ô đã duyệt | **FR-UC-BP-REC-01b** Diễn biến #1–3 | Plan detail có banner spawn WF; không chứng minh 1 YCTD / ô theo BR-BP-HC-04 | **impl_gap** (linkage plan→YCTD) | **dev-be** + qa sau spec map |
| 4 | Tạo YCTD trong/ngoài ĐB + gắn JD Hiệu lực | TP · HCNS | Tab Jobs → **Yêu cầu tuyển** (`JobRequisitionsTab`) | **YCTD** + soft FK **JD master** | **FR-UC-BP-REC-02** / **02b** · **REC-00/00c** · REF-SPEC | Picker JD + `job_template_id` (lõi aligned); status Hiệu lực gate còn residual REF | **impl_gap** hẹp (status gate / preview) — **không** invent tin đăng | Dev narrow sau YCTD-REF cascade |
| 5 | Thư viện JD master | HRBP | Tab Thư viện JD | JD master | **FR-UC-BP-REC-00** · **00a/b/c** | Dynamic writer + DnD; console `@hello-pangea/dnd` storm trên log sponsor | **broken** UX (console P0) · `jd_dynamic_done=false` | **dev-fe** (JD DnD) — lane riêng, không dual-write postings |
| 6 | **Thêm ứng viên — vị trí & YCTD** | HR tuyển | **Ứng viên** → Thêm → `CandidateFormDialog` field «Vị trí ứng tuyển» | **Ứng tuyển** = liên kết UV↔**YCTD** (N–N); vị trí từ catalog / derived YCTD | Enterprise MVP § «UV gắn bắt buộc YCTD» · **REC-04** tiên quyết YCTD · **REC-05** «đã gắn ≥1 YCTD» · Team **BR-HRM-MD-01** · **A9** | `position` = **Input free-text** optional; **không** field chọn YCTD trên form; `createCandidatePool` Lane B; DTO `position` optional free-text; `requisition_id` optional | **spec_gap** (thiếu Diễn biến Thêm UV) + **impl_gap** (sai AC picker / thiếu YCTD bắt buộc) | **ba-docs** merge §3.1 → sa DB/API → **dev-fe + dev-be** |
| 7 | Gắn UV từ ngữ cảnh YCTD | HR | `JobCandidatesDialog` từ YCTD | Ứng tuyển trên YCTD | **REC-04** #3 · **REC-05** #1 | Có gắn application; vẫn phụ thuộc `candidates.position` text | **impl_gap** (position vẫn text; cross-nav tạo UV từ YCTD chưa là SoT chính) | **dev-fe** sau §3.1 |
| 8 | Quét kho nội bộ trước kênh ngoài | HR | (surface mờ / lẫn pool) | Kho CV + YCTD | **FR-UC-BP-REC-04** | Pool candidates tách; không gate «đã quét» trước ngoài | **impl_gap** / partial | ba-docs depth nếu cần → Dev |
| 9 | Pipeline trạng thái UV trên YCTD | HR · PV | Candidates tab stages + board | Liên kết UV–YCTD + lịch sử | **FR-UC-BP-REC-05** Diễn biến #1–2 | Stage trên pool; lịch sử/N–N YCTD mỏng | **impl_gap** | **dev-be/fe** |
| 10 | Lịch PV + đánh giá | HR · PV | Interviews / Evaluations tabs | Đánh giá trên liên kết UV–YCTD | **FR-UC-BP-REC-06** Luồng #1–4 | Có dialog đánh giá; **không** bắt buộc ngữ cảnh YCTD | **impl_gap** | **dev-fe** |
| 11 | **So sánh đánh giá ứng viên** | HR | Nút So sánh → `CandidateComparisonDialog` | So sánh trên **cùng YCTD** (alias approved); đánh giá từ REC-06 | **Không có FR Enterprise** cho matrix compare · REC-06 = đánh giá từng UV | Dropdown «Chọn tin tuyển dụng / vị trí»; `fetchJobPostings` **hard-set `[]`**; candidates luôn rỗng → empty vĩnh viễn | **broken** + **wrong SoT** (`job_postings` / tin đăng) + **spec_gap** (cần ADD FR hoặc gắn REC-06) | **ba-docs** §3.2 → sa → **dev-fe/be** (YCTD list, cấm postings) |
| 12 | Offer → hồ sơ NS | HR · HCNS | Hire link dialog | Onboard từ YCTD | **FR-UC-BP-REC-07** | Có hire bind employee_id khi hired | Partial aligned | giữ must_keep |
| 13 | Dashboard KH vs TT | HR · Lãnh đạo | Tab Dashboard / Reports | Định biên Cần tuyển vs pipeline/onboard YCTD | **FR-UC-BP-REC-08** Luồng #2 · Diễn biến #3 khoan YCTD | Funnel/KPI; drill YCTD không đầy đủ | **impl_gap** | sau spine UV/YCTD |
| 14 | Chiến dịch / tin đăng đa kênh | — | Tab Campaigns · JobPostingsTab | — | **FR-UC-BP-REC-03 OUT / GĐ2** | Menu còn; ARCH FORBIDDEN JD SoT trên postings | **OUT_MVP** (giữ leftover; **cấm** dùng nghiệm thu / dual-write JD) | pm governance — không mở GĐ1 |
| 15 | Cross-nav list→detail→back; tạo UV từ YCTD | HR | Candidates list / detail / YCTD candidates | J-* list→detail | Journey + REC-05 | Detail có; create UV **không** inherit YCTD context làm bắt buộc | **impl_gap** (J-HRM-REC cross-nav) | **qa** stamp J-* sau Dev |

### §1.1 Thuật ngữ khóa (chống hiểu sai)

| UI / sponsor nói | SoT SRS MVP |
|------------------|-------------|
| Tin tuyển dụng / job posting / chiến dịch | **OUT** trừ GĐ2 (**REC-03**). Trạng thái «đã đăng tin» nằm trên **YCTD**. |
| Kế hoạch tuyển dụng (tab Plans) | Map nghiệp vụ → **định biên** **FR-UC-BP-REC-01** (hoặc rename UI); không entity «plan» song song làm SoT headcount nếu lệch FR |
| Vị trí ứng tuyển | **Không** free-text SoT: chọn **YCTD** (bắt buộc) → vị trí = catalog/position của YCTD (read-only hoặc picker đồng bộ) |
| So sánh ứng viên | Nguồn lọc = **YCTD** (hoặc alias đã duyệt = requisition); **không** `job_postings` |

---

## §2 Verdict — 3 lỗi sponsor

| Defect | SRS says | Code does | Gap class | Fix lane |
|--------|----------|-----------|-----------|----------|
| **Position free-text** trên Thêm ứng viên | MVP: UV **gắn bắt buộc YCTD** (SRS § phạm vi tuyển dụng). REC-04/05 tiên quyết / hậu điều kiện gắn YCTD. Team: **BR-HRM-MD-01** cấm free-text vị trí; **AC-HRM-PICKER-01**; E1-A **A9 Candidate position**. | `CandidateFormDialog`: `<Input>` `position` optional; schema `z.string().optional()`; POST pool không bắt `requisition_id`; DTO comment «Lane B free-text». | **spec_gap** (Enterprise thiếu Diễn biến Thêm UV đủ depth) + **impl_gap** (team picker lock đã có mà FE/DTO không theo) | **ba-docs** merge §3.1 → **sa** API/DB (requisition_id required trên create path MVP; position_key) → **dev-fe + dev-be** · QA UF Thêm UV |
| **Compare empty** | Không FR matrix; đánh giá trong pipeline **REC-06** trên liên kết UV–YCTD. REC-03 tin đăng OUT. | `CandidateComparisonDialog`: label tin tuyển/vị trí; **không gọi API** — `setJobPostings([])` / `setCandidates([])` cố định → empty luôn. | **broken** (stub) + **impl_gap** (sai entity) + **spec_gap** (cần ADD FR compare hoặc thu hẹp = so sánh điểm REC-06 theo YCTD) | **ba-docs** §3.2 → **sa** → **dev-fe** (bind YCTD + evaluations; empty-state AC khi 0 YCTD) · **cấm** bind job_postings |
| **Plan console / «đầy lỗi»** | **FR-UC-BP-REC-01**: lưới định biên theo danh mục vị trí/đơn vị; chỉ **Cần tuyển**; phòng tự trình. | Tab Plans: free-text dept/position; NS+DX; list `TMDV-PLAN-*`. Console sponsor: storm **DnD** JD + **`Uncaught ReferenceError: getDialogPortalContainer is not defined`** trong `dialog.tsx` (stack qua `AppLayout` / Recruitment) — crash dialog tuyển (CandidateForm / Import / create flows), không phải “React AppLayout logic nghiệp vụ”. | **broken** (P0 console/dialog) + **impl_gap** nghiệp vụ plan≠định biên | **dev-fe** hotfix dialog portal (**PO-HRM-REC-PLAN-CONSOLE-FE-01** đã DISPATCH) **song song** ba-docs §3.3 terminology; Dev plan↔định biên **sau** confirm map |

---

## §3 SRS ADD deltas (draft — cần sponsor CONFIRM · no wipe · no_prompt_echo)

> Merge vào `SRS_HRM_ENTERPRISE.md` bởi **ba-docs** sau confirm. Không xóa stub FR hiện có.

### §3.1 ADD — Thêm / cập nhật ứng viên gắn YCTD (đề xuất mã `FR-UC-BP-REC-05a` hoặc EXPAND **REC-05** / inventory create-UV)

**Mục đích:** Tạo hồ sơ ứng viên trong kho và **bắt buộc** gắn một YCTD thuộc pháp nhân; vị trí hiển thị lấy từ YCTD/danh mục — **không** nhập free-text làm nguồn sự thật.

**Tiên quyết:** Có ít nhất một YCTD đã duyệt (hoặc trạng thái được phép nhận hồ sơ) đúng pháp nhân; danh mục chức danh pháp nhân.

**Dữ liệu đầu vào (bổ sung):**

| Trường | Bắt buộc | Quy tắc |
|--------|----------|---------|
| YCTD | Có | Picker YCTD đúng pháp nhân; trạng thái được nhận hồ sơ |
| Vị trí hiển thị | Hệ thống / đồng bộ | Derived từ YCTD (mã/tên chức danh đã gắn); cho phép picker catalog **khớp** YCTD — **cấm** ô text tự do làm SoT |
| Họ tên · liên hệ · nguồn · stage | Theo form hiện hành | Stage pipeline gắn trên **liên kết** UV–YCTD |

**sequenceDiagram (draft):**

```mermaid
sequenceDiagram
  autonumber
  actor HR as Nhân sự tuyển dụng
  participant Form as Form thêm ứng viên
  participant YCTD as Danh sách YCTD
  participant Cat as Danh mục vị trí

  HR->>Form: Mở Thêm ứng viên
  Form->>YCTD: Tải YCTD được nhận hồ sơ
  alt Không có YCTD
    YCTD-->>Form: Rỗng
    Form-->>HR: Empty rõ — hướng tạo/duyệt YCTD; không cho Lưu thiếu YCTD
  else Có YCTD
    HR->>Form: Chọn YCTD
    Form->>Cat: Lấy vị trí từ YCTD / catalog
    Form-->>HR: Vị trí hiển thị (read-only hoặc select khớp)
    alt Thử gõ vị trí tự do / lệch YCTD
      Form-->>HR: Chặn hoặc bỏ qua — không lưu SoT text
    else Đủ họ tên và YCTD
      HR->>Form: Lưu
      Form-->>HR: Thành công — list có UV; F5 còn; mở detail thấy YCTD gắn
    end
  end
```

**Diễn biến (draft):**

| # | Tương tác | Điều kiện / quy tắc | Kết quả hoặc lỗi |
|---|-----------|---------------------|------------------|
| 1 | Mở Thêm ứng viên | Có quyền tuyển | Form; bắt buộc chọn YCTD |
| 2 | Danh sách YCTD rỗng | Chưa có YCTD nhận hồ sơ | Empty + CTA YCTD; **không** Lưu |
| 3 | Chọn YCTD | Đúng pháp nhân · được nhận hồ sơ | Gắn liên kết; vị trí derived |
| 4 | Vị trí | BR-HRM-MD-01 / picker | Không free-text SoT |
| 5 | Lưu thiếu YCTD | — | Từ chối; giữ form |
| Thành công | — | — | UV trên list; liên kết YCTD còn sau F5; UC kế = pipeline REC-05 / đánh giá REC-06 |

**AC đo được:**

- AC-REC-UV-01: Không chọn YCTD → không 2xx tạo.
- AC-REC-UV-02: Sau 2xx + F5, detail/list vẫn thấy YCTD + vị trí derived (không chỉ chuỗi gõ tay).
- AC-REC-UV-03: Không có control text SoT «Vị trí ứng tuyển» lưu DB thay `position_key` / YCTD.
- AC-REC-UV-04: Tạo từ ngữ cảnh YCTD → YCTD pre-selected; user không phải chọn lại trừ đổi có chủ đích.

### §3.2 ADD — So sánh ứng viên theo YCTD (đề xuất `FR-UC-BP-REC-06b` hoặc mở rộng REC-06)

**Mục đích:** Chọn một YCTD → xem ứng viên đã gắn và đã có đánh giá → chọn tối đa N ứng viên → ma trận/radar theo tiêu chí đánh giá đã lưu trên liên kết UV–YCTD.

**sequenceDiagram (draft):**

```mermaid
sequenceDiagram
  autonumber
  actor HR as Nhân sự tuyển dụng
  participant Cmp as Màn so sánh
  participant Y as YCTD
  participant Ev as Đánh giá PV

  HR->>Cmp: Mở So sánh ứng viên
  Cmp->>Y: Tải YCTD pháp nhân
  alt 0 YCTD
    Y-->>Cmp: Rỗng
    Cmp-->>HR: Empty trung thực — chưa có yêu cầu tuyển; CTA mở YCTD
  else Có YCTD
    HR->>Cmp: Chọn một YCTD
    Cmp->>Ev: Lấy UV gắn YCTD + điểm đánh giá
    alt 0 UV / chưa đánh giá
      Cmp-->>HR: Empty theo ngữ cảnh — không giả dữ liệu
    else Có UV
      HR->>Cmp: Chọn ≤ N ứng viên
      Cmp-->>HR: Ma trận / radar theo tiêu chí đã lưu
    end
  end
```

**Diễn biến (draft):**

| # | Tương tác | Điều kiện / quy tắc | Kết quả hoặc lỗi |
|---|-----------|---------------------|------------------|
| 1 | Mở so sánh | Có quyền | Dropdown **YCTD** (không «tin tuyển dụng») |
| 2 | 0 YCTD | — | Empty + CTA; không spinner giả |
| 3 | Chọn YCTD | Đúng pháp nhân | List UV của YCTD đó |
| 4 | Chọn ≤ N UV | N cấu hình (vd. 4) | Vượt N → chặn + thông báo |
| 5 | Thiếu đánh giá | REC-06 chưa có điểm | Hiện «chưa đánh giá»; vẫn cho chọn nếu chính sách cho |
| Thành công | — | — | Ma trận hiển thị điểm theo tiêu chí đã lưu; F5 giữ YCTD đã chọn nếu deep-link |

**AC:** AC-REC-CMP-01..05 (YCTD SoT · empty 0 YCTD · empty 0 UV · max N · không gọi job_postings).

### §3.3 DOC-DELTA thuật ngữ — Tab «Kế hoạch tuyển» ↔ **FR-UC-BP-REC-01**

| UI hiện tại | Chuẩn SRS | Hành động tài liệu |
|-------------|-----------|-------------------|
| Kế hoạch tuyển dụng / `recruitment_plans` / mã TMDV-PLAN-* | Định biên vị trí × 12 tháng · ô **Cần tuyển** | ba-docs: ghi chú ánh xạ + khuyến nghị đổi nhãn UI «Định biên» hoặc chú thích đồng nghĩa; **một** SoT headcount |
| Cột NS + DX trên mọi tháng | Chỉ theo dõi **Cần tuyển** (không cặp kế hoạch/đề xuất trùng) — REC-01 phạm vi | Spec: bỏ hoặc đổi nghĩa cột cho khớp FR; không invent cặp song song |
| Free-text tên vị trí trên lưới plan | Danh mục vị trí / đơn vị (tiên quyết REC-01) | Picker catalog — cùng BR-HRM-MD-01 |

Không mở **REC-03** trong delta này.

---

## §4 Cascade plan (work_item_ids)

```text
Sponsor CONFIRM §3 deltas (thuật ngữ YCTD / định biên / compare)
  → PO-HRM-REC-E2E-LINKAGE-DOCS-01 (ba-docs) merge SRS Enterprise ADD-only
  → PO-HRM-REC-UV-YCTD-TECH-01 (sa) TechSpec F.1 Thêm UV + compare
  → PO-HRM-REC-UV-YCTD-DB-01 (ba-data / sa) physical: application/requisition_id required MVP; position_key; cấm dual job_postings
  → PO-HRM-REC-UV-YCTD-API-01 (sa) API_DESIGN mục đích + bước SRS
  → PO-HRM-REC-UV-YCTD-BE-01 (dev-be) + PO-HRM-REC-UV-YCTD-FE-01 (dev-fe)
  → PO-HRM-REC-CMP-FE-01 (dev-fe) so sánh theo YCTD
  → PO-HRM-REC-PLAN-ALIGN-01 (dev — sau docs map định biên)
  → PO-HRM-REC-E2E-LINKAGE-QA-01 (qa) UF + J-* · U65
  → QC gate hẹp — vẫn recruitment_uat_ready=false đến khi spine 1–11 PASS

Song song P0 (đã/đang DISPATCH — không chờ full cascade):
  → PO-HRM-REC-PLAN-CONSOLE-FE-01 (dev-fe) — getDialogPortalContainer / dialog crash
  → JD DnD console — lane JD residual (không claim jd_dynamic_done)
```

**FORBIDDEN toàn cascade:** dual-write mô tả/JD SoT vào `job_postings`; mở REC-03 GĐ1; seed để có UV/YCTD cho PASS.

---

## §5 Honesty locks

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| FORBIDDEN `job_postings` as JD / compare / UV SoT | **true** |
| U65 zero-seed | **true** |
| Narrow QC GWC JD ≠ module tuyển chạy được | **true** (xem `po-hrm-rec-ux-qc-process-01`) |
| Invent tin đăng GĐ2 | **false** |

---

## §6 BA accountability (blunt)

1. **Enterprise SRS** đã đúng hướng spine (4 phần + OUT REC-03) — **không** “không có nghiệp vụ”.
2. **Depth BA trên consumer UV** (form Thêm, so sánh, map Plans) **nông / thiếu** so với challenge sponsor — đây là **spec_gap** cần ADD §3, không chỉ đổ hết cho Dev.
3. **Team SRS** đã có **BR-HRM-MD-01 / A9** chống free-text — FE/DTO **impl_gap** rõ; BA phải **đưa Enterprise khớp** và **chặn handoff** thiếu `requisition_id` + picker.
4. Compare UI hiện tại = **broken stub** hướng tin đăng — trái MVP; không được giải thích là “chưa có data”.

---

## Completion contract

- `completion_report`: Đã phát hành SoT linkage §1–§5; 3 defect phân lớp; draft Diễn biến UV + compare + map kế hoạch; cascade work_item_ids; honesty false.
- `next_owner`: **ba-docs** (merge §3 sau confirm) **và** **pm** (giữ P0 **dev-fe** console; không mở full Dev UV đến khi docs/Tech/DB/API).
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/program/specs/PO-HRM-REC-E2E-LINKAGE-SPEC-01.md`
