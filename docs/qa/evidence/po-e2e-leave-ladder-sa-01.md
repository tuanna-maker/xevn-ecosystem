# PO-E2E-LEAVE-LADDER-SA-01 — BR-LEAVE-LADDER-01 architecture design

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-LEAVE-LADDER-SA-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **cấm** | `apps/**` implement · invent production `N` without **ASSUMPTION** flag · claim UAT / Phase 1 DONE |
| **must_keep** | U65 zero-seed · no seed inbox · soft-delete · scope_parity (list↔get↔mutate↔WF resolve) |

---

## 0. Context (evidence-based)

| Fact | Source |
|------|--------|
| FR-UC-H03 Mục đích: «phê duyệt **hai cấp**»; bảng loại nghỉ có 12 ngày / báo trước ≥3 / ốm giấy ≥3 — **không** có ngưỡng cắt L1 vs L2 | `SRS_NEW.md` FR-UC-H03 |
| Sequence/Diễn biến H03 hiện mô tả **một** QL duyệt | Cùng FR — intent «hai cấp» ≠ graph AS-IS |
| FR-UC-B03 happy L1→L2 generic — **không** bind `total_days` | `SRS_NEW` · BA matrix §1 |
| WF `hrm_leave_approval` = **1 bước** `manager_approval` · `direct_manager` · fallback `hrbp` | `workflow-catalog.constants.ts` `buildHrmLeaveApprovalWorkflowDefinition()` |
| Bridge spawn **không** gửi `total_days` / leave_type vào XBOS context | `leave-workflow.bridge.ts` `startLeaveWorkflowIfConfigured` |
| Terminal callback → `approved` sau **mọi** instance completed (1 bước = APPROVED ngay sau L1) | Bridge `handleTerminalCallback` |
| ốm ≥3 ngày = **validate chứng từ** (`HRM-LEAVE-VAL-ATT`) — **tách** khỏi ladder | `leave-requests.service.ts` · BA LOCKED |
| BA locked SPEC_GAP `GAP-LEAVE-LADDER-01` / residual `R-PO-LEAVE-DAY-LADDER` | `po-e2e-ba-case-matrix-01.md` §1.3 · `po-hrm-comp-ba-01.md` §2 |
| SA boundary GĐ1: ESS leave IN; ladder = BR chờ khóa; không mở Face/OT | `po-hrm-comp-sa-01.md` |
| Resolver engine đã có `position_template` / `role_code` (có thể gắn L2) | `resolver-registry.ts` |

**Architecture problem statement:** Intent SRS «hai cấp» + case LV-02 không thể nghiệm thu khi catalog WF chỉ 1 bước và **không** có SoT cho ngưỡng ngày `N` (`T_L1`). SA **không** khóa `N` production trong wave này.

---

## 1. Target BR (design — chưa production-locked)

### BR-LEAVE-LADDER-01 (proposed)

| Field | Definition |
|-------|------------|
| **ID** | `BR-LEAVE-LADDER-01` |
| **Scope** | Đơn nghỉ loại phép năm (`annual` / catalog tương đương) có `total_days` |
| **Config** | Ngưỡng `T_L1` (số ngày) — **configurable per legal entity (company)**; không hardcode magic `N` trong product code |
| **Rule** | (a) `total_days ≤ T_L1` → sau L1 `direct_manager` instance **có thể** terminal `APPROVED` (L2 skipped / not required). (b) `total_days > T_L1` → sau L1 **phải** hoàn thành bước L2 mới terminal `APPROVED`. (c) Reject ở bất kỳ bước bắt buộc → `rejected`; số dư hoàn theo TS-LEAVE hiện hữu. |
| **Actors L1** | QL trực tiếp (`resolver_type: direct_manager`, fallback `hrbp` — giữ BR-CD-F4-02/04) |
| **Actors L2** | Giám đốc CT thành viên / hat tương đương — **prefer** `resolver_type: position_template` (hoặc `role_code` / hat đã có trên XBOS) trong cùng `company_id` scope — **không** escalate group_ceo mặc định cho đơn member |
| **Anti-goals** | Không dùng số ngày ốm-attach (3) làm `T_L1`. Không seed inbox. Không bypass scope. |

### BR-LEAVE-LADDER-02 (companion — optional same wave / next)

| Field | Definition |
|-------|------------|
| **ID** | `BR-LEAVE-LADDER-02` |
| **Rule** | Một số `leave_type` (vd. unpaid / maternity — **danh sách khóa BA**) → **luôn** yêu cầu L2 (bỏ qua so sánh `T_L1`) |
| **Storage** | Metadata trên item catalog `leave_types` (XBOS SoT → HRM pull) — flag kiểu `requires_l2: true` |

### Tách rõ (không gộp)

| Rule | Ngưỡng | Owner |
|------|--------|-------|
| Báo trước phép năm ≥ 3 ngày lịch | Validation submit | FR-UC-H03 LOCKED |
| ốm ≥ 3 ngày cần attachment | Validation submit | BR-LEAVE-ATT-01 LOCKED |
| Cắt L1 vs L2 theo `total_days` | **`T_L1` configurable** | BR-LEAVE-LADDER-01 (this design) |

---

## 2. Options A / B / C

### Option A — Configurable `T_L1` per company + L2 step in WF graph (**recommended**)

| Dimension | Detail |
|-----------|--------|
| **Summary** | WF `hrm_leave_approval` luôn có **2 bước** trong graph (L1 + L2). Runtime: đọc `T_L1` từ **company settings** (hoặc tenant settings theo legal entity); spawn context mang `total_days` + `leave_type`; engine **skip L2** khi `total_days ≤ T_L1` (và leave_type không `requires_l2`). |
| **Scope** | GĐ1 P0 leave ladder; multi-entity sẵn (mỗi CT có thể khác `T_L1`) |
| **Complexity** | Medium — catalog graph + skip semantics + settings field + bridge payload |
| **Risk** | Medium — cần skip/activate deterministic; regression LV-01 (đơn ngắn vẫn 1 task) |
| **Cost / timeline** | 1 Dev-BE wave (xbos WF + hrm bridge/settings) + FE canvas honesty + QA LV-02 sau sponsor/`T_L1` |
| **Pros** | Khớp DNA XeVN đa pháp nhân; không invent magic `N` trong code; canvas phản ánh «hai cấp»; LV-01/LV-02 đo được sau config |
| **Cons** | Cần capability skip-step (hoặc tương đương) trên WF engine nếu chưa có; Settings UI tối thiểu hoặc seed-config **chỉ** khi sponsor bootstrap (không dùng seed cho QA PASS) |
| **Failure modes** | (1) Skip sai → APPROVED sớm → mitigate: unit + LV-02. (2) L2 resolve null → escalate policy rõ (hrbp/member_ceo) — **không** silent group. (3) Missing `T_L1` → fail-closed spawn hoặc default **chỉ** khi ASSUMPTION pilot đã sponsor-confirm |

### Option B — Fixed default `N` in SRS (sponsor confirm) · same 2-step graph

| Dimension | Detail |
|-----------|--------|
| **Summary** | Sponsor chốt **một** số nguyên `N` cho toàn tập đoàn (hoặc toàn pilot); ghi cứng vào SRS BR; WF 2 bước + skip theo hằng số tenant. |
| **Scope** | Đơn giản hơn A về storage |
| **Complexity** | Low–medium |
| **Risk** | Medium–high product: member CT logistics khác nhau sẽ CR sớm; hardcode khó đổi |
| **Pros** | Ít bảng settings; BA/QA viết AC số cụ thể nhanh |
| **Cons** | **Cấm** SA tự chọn `N` production; chờ sponsor; kém fit multi-entity |
| **Failure modes** | Sai `N` → toàn hệ phê duyệt sai; rollback = CR + migrate config |

### Option C — Always L1+L2 (không dùng ngưỡng ngày)

| Dimension | Detail |
|-----------|--------|
| **Summary** | Mọi đơn nghỉ (hoặc mọi phép năm) luôn 2 bước; không cần `T_L1`. |
| **Scope** | Literal «hai cấp» FR-UC-H03 |
| **Complexity** | Lowest cho ladder logic |
| **Risk** | High UX — đơn 0.5–1 ngày cũng chờ GĐ; inbox overload; LV-01 đổi ý nghĩa |
| **Pros** | Không invent `N`; graph đơn giản |
| **Cons** | Lệch thực tế Personio/Bamboo + BA đề xuất ngưỡng; tăng ma sát ESS; không đóng G-P0-LEAVE-LADDER theo «ngày→cấp» |
| **Failure modes** | Sponsor reject UX; backlog «thêm ngưỡng» = quay lại A |

### Trade-off matrix

| Criterion | A Config `T_L1` | B Fixed `N` | C Always L2 |
|-----------|-----------------|-------------|-------------|
| Multi-entity fit | **High** | Low | Medium |
| No magic production `N` in SA wave | **Yes** (config) | Needs sponsor lock first | N/A |
| Matches BA «ngày→cấp» | **Yes** | Yes | No |
| WF honesty (canvas 2 bước) | **Yes** | Yes | Yes |
| Maintainability | **High** | Medium | High short-term / Low long-term |
| Pilot speed | Medium (settings + skip) | Fast after sponsor number | Fastest |

---

## 3. Recommendation

**Recommend Option A.**

Rationale:

1. Mission + BA: prefer **configurable threshold + L2 in WF graph**; cấm invent production `N`.
2. XeVN differentiator = multi-entity (`po-hrm-comp-sa-01`) — `T_L1` per company khớp hơn hằng số tập đoàn.
3. Engine đã có resolver L2-capable (`position_template` / `role_code`); thiếu chủ yếu là **bước 2 + điều kiện kích hoạt + payload ngày**.
4. Option C phá ESS ngắn; Option B chặn delivery đến khi sponsor số — vẫn có thể **dùng A với ASSUMPTION pilot** sau khi sponsor gật đầu giá trị UAT.

---

## 4. What Dev must change (when unlocked — **not this wave**)

> SA docs-only. Dev **HOLD** cho đến: (1) sponsor confirm cơ chế A (+ giá trị pilot nếu dùng ASSUMPTION), (2) ba-docs SRS ADD BR-LEAVE-LADDER-01, (3) TechSpec/API delta (SA hoặc ba-data) cho field + skip.

### 4.1 XBOS — WF catalog / engine

| Change | Detail |
|--------|--------|
| `buildHrmLeaveApprovalWorkflowDefinition()` | Thêm bước 2: vd. `stepKey: 'director_approval'`, `order: 2`, `resolver_type: 'position_template'` (hoặc hat/role đã chuẩn hóa member CEO), `allowsReject: true` |
| Step condition / skip | Contract: skip L2 khi `context.total_days ≤ context.t_l1` **và** `!requires_l2`; ngược lại require L2. Prefer declarative step `skipWhen` / engine policy — **không** FE tự nhảy bước |
| Definition versioning | Active definition mới; canvas UF-XBOS-08 vẫn U65 (user Lưu/activate — **không** seed inbox) |
| Terminal | Instance `completed` chỉ khi mọi bước **required** xong; L2 skipped ≠ missing |

### 4.2 Config SoT — `T_L1`

| Prefer | Field | Notes |
|--------|-------|-------|
| **Primary** | `company_settings` (hoặc HRM/XBOS settings key scoped by `company_id`) · key đề xuất: `leave_l1_max_days` / `T_L1` | Integer ≥ 0; scope_parity trên GET/PUT settings |
| **Secondary (LADDER-02)** | Metadata item `leave_types` · `requires_l2: boolean` | Catalog XBOS publish → HRM pull; soft-delete catalog rules giữ nguyên |
| **Reject** | Hardcode trong Nest `const N = 3` làm production BR | Chỉ được nếu Option B + sponsor lock ghi SRS |

### 4.3 HRM — leave bridge / service

| Change | Detail |
|--------|--------|
| Spawn body `context` | Thêm `total_days`, `leave_type`, `t_l1` (resolved at spawn), `requires_l2` |
| Resolve `t_l1` | Đọc company setting theo `entityCompanyId` / slug TEXT (giữ CD-FB-07 — **không** `::uuid` cast) |
| Missing config | Fail-closed: không silent APPROVED L2-required; mã lỗi VI deterministic (đề xuất `HRM-LEAVE-CFG-LADDER` / WF skip-miss) — BA chốt message |
| Terminal callback | Giữ: chỉ `pending` → `approved`/`rejected`; **không** approve local trước khi WF terminal |
| Direct approve path | Nếu còn path approve không qua WF — phải cùng ladder semantics hoặc deprecate (scope_parity / BR-WF) |

### 4.4 FE / Mobile

| Surface | Change |
|---------|--------|
| Portal WF canvas | Hiển thị 2 bước leave definition khi activated |
| Inbox / Mobile duyệt | L2 task xuất hiện đúng khi vượt ngưỡng; LV-01 không thấy L2 |
| Settings (minimal) | UI hoặc admin path set `leave_l1_max_days` — **U65**: cấu hình từ FE, không seed để pass QA |

### 4.5 Tests Dev phải thêm (khi code)

- Jest: graph 2 steps; skip L2 when `total_days ≤ t_l1`; require L2 when `>`; `requires_l2` overrides.
- Scope: L2 resolve cùng company TEXT set với list leave.
- Soft-delete: archived manager / position holder → fallback deterministic (BR-CD-F4-04 extended).

---

## 5. Pilot ASSUMPTION (không phải production BR)

| Item | Value | Flag |
|------|-------|------|
| Cơ chế | **Option A** (configurable) | Design recommend |
| Giá trị UAT / pilot thảo luận | `T_L1 = 3` (ngày phép năm) — cùng họ số với «báo trước 3 ngày» / «ốm 3 ngày» nhưng **nghĩa khác** — chỉ để pilot measurable | **ASSUMPTION — cần sponsor confirm** |
| Áp dụng | Chỉ môi trường pilot/UAT sau confirm; **không** ghi vào SRS như hằng production cho đến confirm | |
| Alternate thảo luận | BA đã nêu `T_L1 ∈ {1, 2, 3}` (`po-hrm-comp-ba-01`) — sponsor chọn 1 giá trị pilot **hoặc** chỉ bật settings trống + nhập từ FE | |

**SA không claim** `T_L1 = 3` là BR production. QC/QA **cấm** 🟢 LV-02 dựa trên ASSUMPTION chưa confirm.

---

## 6. Spec delta required (governance next)

| Artifact | ADD (không wipe) |
|----------|------------------|
| `SRS_NEW` FR-UC-H03 | BR-LEAVE-LADDER-01/02; Diễn biến tách L1/L2; AC: `total_days ≤ T_L1` → APPROVED sau L1; `>` → cần L2; post-mutation UI |
| HDSD | `BR-LEAVE-LADDER-HDSD-01` — bảng «Số ngày → người duyệt» **sau** `T_L1` confirm |
| `TECH_SPEC_NEW` §4.4 / TS-WF | Spawn context fields; skip L2; settings key; L2 resolver |
| API/DB | Settings column/key + optional leave_types metadata — ba-data sau SRS confirm |
| Matrix | LV-02 exit criteria bind BR + config |

**Thứ tự khóa:** Sponsor confirm Option A (+ pilot `T_L1` nếu dùng ASSUMPTION) → **ba-docs SRS ADD** → TechSpec/API → Dev → QA LV-02.

---

## 7. Test impact

| Case | Hiện tại | Sau design ship |
|------|----------|-----------------|
| **LV-01** | Executable AS-IS (1 bước L1) | Vẫn PASS nếu `total_days ≤ T_L1` (L2 skipped) |
| **LV-02** | **🟡 BLOCKED / SPEC_GAP** | 🟢 chỉ khi: BR in SRS + WF 2 bước active + `T_L1` configured + browser U65 L1 rồi L2 → APPROVED + F5 |
| LV-03..06 | Không phụ thuộc ladder số | Giữ; không regression soft-delete / scope / BR-WF-04 |

**QA rule (giữ):** Cấm invent `N` để 🟢 LV-02. Cấm seed inbox. Probe API ≠ UF PASS (U65).

Residual program: **`R-PO-LEAVE-DAY-LADDER` = OPEN** until SRS+impl+QA.

---

## 8. Architecture invariants (must_keep)

| Invariant | Enforcement |
|-----------|-------------|
| **U65** | Toàn chuỗi từ FE/mobile; không `pnpm seed:*` / seed inbox để có task L2 |
| **No seed for PASS** | Settings `T_L1` set qua UI/admin path hoặc sponsor-explicit bootstrap — không gắn evidence UAT |
| **Soft-delete** | Manager / position / leave_type archived → không hard-delete; resolve fallback documented |
| **scope_parity** | List leave / get-by-id / approve / WF resolve dùng cùng company TEXT expansion (CD-FB-07); L2 không đọc cross-company |
| **XBOS WF SoT** | HRM không tự bịa graph; catalog/definition trên xbos-api |
| **Catalog pull** | `leave_types` metadata từ XBOS; HRM không publish SoT tập đoàn |

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Dev hardcodes `N=3` | TM reject; SA Option A; code đọc settings |
| L2 = group_ceo cho mọi đơn member | Resolver bound member company; ADR scope |
| Diễn biến SRS vẫn 1 QL | ba-docs ADD sequence 2 actors trước Dev |
| Skip-step chưa có trên engine | Dev-BE spike: skipWhen vs spawn-two-definitions — prefer **one definition + skip** (canvas honesty) |
| ASSUMPTION bị hiểu là BR | Flag rõ §5; LV-02 stays 🟡 |

---

## 10. Rollout / checkpoint

| # | Checkpoint | Owner | Exit |
|---|------------|-------|------|
| 1 | This SA evidence published | sa | **PASS_TO_PM** |
| 2 | Sponsor: Option A + pilot `T_L1` ASSUMPTION yes/no/value | pm → sponsor | Written confirm |
| 3 | SRS ADD BR-LEAVE-LADDER-01 (+ HDSD delta sau số) | ba-docs | Spec measurable |
| 4 | TechSpec/API/DB field + skip contract | sa / ba-data | Unlock Dev |
| 5 | Implement WF+bridge+settings | dev-be (+ fe canvas/settings) | READY_FOR_QA |
| 6 | QA LV-02 U65 | qa | 🟢 or 🟡 honest |
| 7 | QC spine leave ladder | qc | Close `R-PO-LEAVE-DAY-LADDER` |

---

## 11. Validation / acceptance evidence plan

| AC (after unlock) | Evidence |
|-------------------|----------|
| Graph `hrm_leave_approval` có ≥2 steps | Canvas + catalog read |
| `total_days ≤ T_L1` → APPROVED sau L1 only | LV-01 U78 + Network |
| `total_days > T_L1` → L1 không terminal leave approved; L2 → approved | LV-02 U78 |
| Sai CT / tự duyệt | LV-05/06 unchanged FAIL-deep |
| F5 status ổn định | Matrix FE-after-2xx |

---

## 12. Handoff

### completion_report

- **Closed:** SA design for `BR-LEAVE-LADDER-01` — Options A/B/C; **recommend A** (configurable `T_L1` per company + L2 step in WF graph); Dev change list; pilot `T_L1=3` marked **ASSUMPTION only**; LV-02 remains 🟡; must_keep U65/soft-delete/scope_parity; no `apps/**`; no production `N` claimed.
- **Open:** Sponsor confirm Option A + optional pilot value; ba-docs SRS ADD; TechSpec/API physical; Dev implementation; `R-PO-LEAVE-DAY-LADDER`.

### next_owner

`pm` — intake → **sponsor confirm** trên Option A / ASSUMPTION `T_L1`, rồi **`ba-docs`** SRS ADD (không Dev trước SRS).

### next_dispatch_prompt

```text
work_item_id: PO-E2E-LEAVE-LADDER-BA-DOCS-01
role: ba-docs
priority: P0
lane: governance

ENTRY: Sponsor đã confirm Option A (configurable T_L1) trong chat/bus — nếu CHƯA confirm số pilot thì chỉ ADD BR khung «T_L1 từ company_settings» + Diễn biến L1/L2, CẤM ghi số nguyên production; nếu sponsor confirm ASSUMPTION pilot T_L1=3 thì ghi rõ «pilot/UAT only» tách khỏi BR production.

Mission: SRS_NEW FR-UC-H03 ADD-only — BR-LEAVE-LADDER-01 (+ stub BR-LEAVE-LADDER-02 requires_l2 trên leave_types); sequenceDiagram 2 cấp; bảng Diễn biến L1/L2; AC measurable; ref SA docs/qa/evidence/po-e2e-leave-ladder-sa-01.md. HDSD bảng ngày→cấp = delta sau số chốt (BR-LEAVE-LADDER-HDSD-01) hoặc placeholder. no_prompt_echo: true.

Evidence: docs/qa/evidence/po-e2e-leave-ladder-ba-docs-01.md
ack_status: PASS_TO_PM
Cấm: apps/** · invent N không ASSUMPTION/sponsor · wipe FR-UC-H03
```

**Nếu sponsor chưa trả lời `T_L1` / Option A:** PM **chờ sponsor** — không dispatch Dev; có thể dispatch ba-docs **khung configurable only** (không số) theo prompt trên.

### evidence_path

`docs/qa/evidence/po-e2e-leave-ladder-sa-01.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`PO-E2E-LEAVE-LADDER-BA-DOCS-01` sau sponsor confirm Option A — **không** `dev-be` trước SRS ADD. LV-02 giữ 🟡.
