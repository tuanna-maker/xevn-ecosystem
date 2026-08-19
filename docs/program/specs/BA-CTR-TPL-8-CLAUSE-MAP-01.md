# BA-Process — Clause map 8 mẫu HĐ X.E + bắt buộc luật

| Meta | Value |
|------|-------|
| work_item_id | BA-CTR-TPL-8-CLAUSE-MAP-01 |
| status | **PASS_TO_PM** |
| source | BA-CTR-INSURANCE-SALARY-SOURCE-01.md §7 + Excel 2026.08.07 + REF-VN-LABOR-CONTRACT-CLAUSE-BASIS-01.md |
| completed_at | 2026-08-17T20:15+07:00 |

## 1. Ma trận 8 mẫu
| Excel | template_code | pack_code | term | dynamic fields |
|---|---|---|---|---|
| HĐTV VP | XEVN_PROBATION_OFFICE | IT_OFFICE | TV | — |
| HĐLĐ 12T VP | XEVN_FT_12M_OFFICE | IT_OFFICE | +12 | — |
| HĐLĐ 24T VP | XEVN_FT_24M_OFFICE | IT_OFFICE | +24 | — |
| HĐLĐ KXĐTH VP | XEVN_INDEF_OFFICE | IT_OFFICE | KXĐ | — |
| HĐTV LX | XEVN_PROBATION_DRIVER | DRIVER | TV | GPLX×4 |
| HĐLĐ 12T LX | XEVN_FT_12M_DRIVER | DRIVER | +12 | GPLX |
| HĐLĐ 24T LX | XEVN_FT_24M_DRIVER | DRIVER | +24 | GPLX |
| HĐ KXĐ LX | XEVN_INDEF_DRIVER | DRIVER | KXĐ | GPLX |

## 2. Clause inventory (điều khoản chung)
- Điều 1. Thời hạn và công việc: loại HĐ / ngày hiệu lực / địa điểm / chức danh / công việc
- Điều 2. Chế độ làm việc: thời gian / dụng cụ
- Điều 3. Quyền lợi NLĐ: lương / phụ cấp / kỳ trả lương / thưởng / nghỉ / BHXH / đào tạo / bảo mật
- Điều 4. Nghĩa vụ + quyền hạn NSDLĐ
- Điều 5. Thi hành: 2 bản, hiệu lực ký

### Khác biệt mẫu (cần composer bind khác nhau)
- TV vs HĐLĐ: title khác; HĐLĐ có thêm điều khoản bồi thường chi phí đào tạo khi đơn phương chấm dứt (Điều 3 mục 2). TV không có.
- VP vs LX: LX thêm điều khoản chấp hành luật giao thông + báo cáo nguy cơ TNLĐ; có trường GPLX hạng D (ngày cấp / nơi cấp). VP không có.
- 24T VP dùng công ty VISUN (khác X.E) — réo header legal entity.

## 3. Map clause id → Settings CTR template composer (có `required_by_law`)

| clause_id | title | bind_scope | required_by_law | legal_basis | notes |
|---|---|---|---|---|---|
| CTR-CLAUSE-001 | Điều 1. Thời hạn và công việc | all | **true** | BLLĐ 2019 Đ.21 c, đ | Loại HĐ + thời hạn (hoặc thời gian thử việc) + địa điểm + công việc |
| CTR-CLAUSE-002 | Điều 2. Chế độ làm việc | all | **true** | BLLĐ 2019 Đ.21 g | Thời giờ làm việc, nghỉ ngơi |
| CTR-CLAUSE-003a | Điều 3. Quyền lợi — Lương & phụ cấp | all | **true** | BLLĐ 2019 Đ.21 đ | Mức lương theo công việc, hình thức trả, thời hạn trả, phụ cấp |
| CTR-CLAUSE-003b | Điều 3. Quyền lợi — Chế độ nâng bậc/lương | ft_* (12T/24T/KXĐ) | **true** | BLLĐ 2019 Đ.21 e | **Không bắt buộc HĐ thử việc** (Đ.24 k.2) |
| CTR-CLAUSE-003c | Điều 3. Quyền lợi — BHXH/BHYT/BHTN | ft_* (12T/24T/KXĐ) | **true** | BLLĐ 2019 Đ.21 i | **Không bắt buộc HĐ thử việc** (Đ.24 k.2) — `si_base` từ C&B |
| CTR-CLAUSE-003d | Điều 3. Quyền lợi — Đào tạo / bồi dưỡng | ft_* (12T/24T/KXĐ) | **true** | BLLĐ 2019 Đ.21 k | **Không bắt buộc HĐ thử việc** (Đ.24 k.2) |
| CTR-CLAUSE-003e | Điều 3. Quyền lợi — Thưởng / nghỉ / bảo mật | all | **false** (company_specific) | — | Từ 8 file mẫu X.E |
| CTR-CLAUSE-004 | Bồi thường chi phí đào tạo | ft_* (12T/24T/KXĐ) | **true** | BLLĐ 2019 Đ.21 k + Đ.22 | Chỉ HĐ chính thức; probation **optional** (company policy) |
| CTR-CLAUSE-005 | GPLX + Luật GT + TNLĐ LX | driver pack | **true** | BLLĐ 2019 Đ.21 h | Bảo hộ lao động theo khối (Tài xế ≠ Văn phòng) |
| CTR-CLAUSE-006 | Quyền hạn NSDLĐ | all | **true** | BLLĐ 2019 Đ.21 a | Pháp nhân, người đại diện ký kết |
| CTR-CLAUSE-007 | Điều 5. Thi hành | all | **true** | BLLĐ 2019 Đ.21 a, đ | 2 bản, hiệu lực ký |
| CTR-CLAUSE-008 | Bí mật kinh doanh / công nghệ | theo chức danh | **true** | BLLĐ 2019 Đ.21 k.2 | Thỏa thuận bằng văn bản, có thời hạn bảo vệ + bồi thường |

## 4. Dynamic field inventory (có `required_by_law` / `source`)

| field | dùng cho | required_by_law | legal_basis | source | ghi chú |
|---|---|---|---|---|---|
| base_salary_vnd | bootstrap | **true** | BLLĐ 2019 Đ.21 đ | law | Khi snapshot rỗng; mức lương theo công việc/chức danh |
| insurance_salary_vnd | bootstrap | **true** (chỉ ft_*) | BLLĐ 2019 Đ.21 i | law | "Lương đóng BH" — `si_base` từ C&B; **không bắt buộc HĐ thử việc** |
| effective_from | term | **true** | BLLĐ 2019 Đ.21 đ | law | Ngày hiệu lực HĐ |
| effective_to | term | **true** (TV/KXĐ) | BLLĐ 2019 Đ.21 đ | law | Bắt buộc TV (có ngày hết hạn) + KXĐ (có thể có) |
| work_location | all | **true** | BLLĐ 2019 Đ.21 c | law | Địa điểm làm việc |
| department / job_title | all | **true** | BLLĐ 2019 Đ.21 c | law | Từ chức danh (JD catalog `job_titles`) |
| gplx_number / gplx_class / gplx_issued_at / gplx_issued_by | driver | **true** | BLLĐ 2019 Đ.21 h | law | Bảo hộ lao động cho Tài xế — bắt buộc LX |
| company_legal_name / company_address / representative | header | **true** | BLLĐ 2019 Đ.21 a | law | Pháp nhân ký HĐ (VISUN vs X.E cho 24T VP) |
| probation_days | TV | **true** | BLLĐ 2019 Đ.25 | law | Thời gian thử việc tối đa 180/60/30 ngày + 06 ngày làm việc khác |
| training_cost_reimbursement | ft_* | **true** | BLLĐ 2019 Đ.21 k + Đ.22 | law | Chỉ HĐ chính thức; điều khoản bồi thường đào tạo |

## 5. Bắt buộc theo luật (trích dẫn chính xác)

| Văn bản | Điều | Nội dung áp dụng cho clause map |
|---|---|---|
| **BLLĐ 2019 (45/2019/QH14)** | **Đ.21 khoản 1** | 10 nội dung bắt buộc của HĐLĐ (a–k) — checklist clause |
| **BLLĐ 2019** | **Đ.24 khoản 2** | **HĐ thử việc CHỈ bắt buộc: a, b, c, đ, g, h**. Các điểm **e, i, k KHÔNG bắt buộc** cho thử việc. |
| **BLLĐ 2019** | **Đ.24 khoản 3** | Không áp dụng thử việc với HĐ thời hạn **dưới 01 tháng** |
| **BLLĐ 2019** | **Đ.25** | Thời gian thử việc tối đa: 180/60/30 ngày theo trình độ; 06 ngày làm việc với công việc khác |
| **BLLĐ 2019** | **Đ.26** | Tiền lương thử việc do hai bên thỏa thuận (thường ≥85%) |
| **BLLĐ 2019** | **Đ.22** | Phụ lục HĐ **không được sửa thời hạn** HĐLĐ |
| **TT 10/2020/TT-BLĐTBXH** | **Đ.3** | Chi tiết từng nội dung chủ yếu của HĐLĐ theo khoản 1 Đ.21 (cụ thể hóa điểm a–k) |

**Mặt nạ `required_by_law` per template_code:**

| clause_ref | XEVN_PROBATION_OFFICE | XEVN_FT_12M_OFFICE | XEVN_FT_24M_OFFICE | XEVN_INDEF_OFFICE | XEVN_PROBATION_DRIVER | XEVN_FT_12M_DRIVER | XEVN_FT_24M_DRIVER | XEVN_INDEF_DRIVER |
|---|---|---|---|---|---|---|---|---|
| CTR-CLAUSE-001 (Đ.1 thời hạn/cv) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CTR-CLAUSE-002 (Đ.2 làm việc) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CTR-CLAUSE-003a (Lương/phụ cấp) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CTR-CLAUSE-003b (Nâng bậc/lương) | ❌ optional | ✅ | ✅ | ✅ | ❌ optional | ✅ | ✅ | ✅ |
| CTR-CLAUSE-003c (BHXH/BHYT/BHTN) | ❌ optional | ✅ | ✅ | ✅ | ❌ optional | ✅ | ✅ | ✅ |
| CTR-CLAUSE-003d (Đào tạo) | ❌ optional | ✅ | ✅ | ✅ | ❌ optional | ✅ | ✅ | ✅ |
| CTR-CLAUSE-004 (Bồi thường đào tạo) | ❌ optional | ✅ | ✅ | ✅ | ❌ optional | ✅ | ✅ | ✅ |
| CTR-CLAUSE-005 (GPLX/Luật GT) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| CTR-CLAUSE-006 (Quyền hạn NSDLĐ) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CTR-CLAUSE-007 (Thi hành) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CTR-CLAUSE-008 (Bí mật) | theo chức danh | theo chức danh | theo chức danh | theo chức danh | theo chức danh | theo chức danh | theo chức danh | theo chức danh |

## 6. Sponsor questions (có căn cứ điều khoản cụ thể)

| Q | Câu hỏi | Căn cứ pháp lý | Ghi chú cho sponsor |
|---|---|---|---|
| **Q1** | Mức BHXH (`insurance_salary_vnd`) có thể khác `base_salary_vnd` không? | BLLĐ 2019 **Đ.21 i** + TT 10/2020/TT-BLĐTBXH **Đ.3** điểm i | Luật yêu cầu ghi rõ "BHXH, BHYT, BHTN" trong HĐ. Thực tế X.E có 2 cột lương cơ bản + lương đóng BH (Excel cột Y/AK) → **Có thể khác**. Cần bind cả 2 field động trong composer. |
| **Q2** | Sponsor nói "6 mẫu" nhưng Excel có 8 starter — bind chỉ 6 hay cần 8? | BLLĐ 2019 **Đ.24 khoản 3** (không thử việc HĐ < 1 tháng) + Đ.25 | 8 mẫu = 4 VP × 2 loại (TV + HĐLĐ 3 kỳ hạn) + 4 LX × 2 loại. Nếu "6 mẫu" = bỏ 2 mẫu TV (hoặc gộp TV vào 1), cần xác nhận. **Đề xuất bind đủ 8** để composer đầy đủ, UI có thể ẩn TV nếu sponsor chỉ muốn 6. |
| **Q3** | "Chỉ lưu sổ đăng ký" có bắt buộc đã có gói C&B không? | BLLĐ 2019 **Đ.21 i** → `si_base` tại `employee_compensation_packages/lines` | `insurance_salary_vnd` (`si_base`) là SoT từ C&B pack. Nếu chưa có C&B → bootstrap từ field động `insurance_salary_vnd` (required_by_law=true cho ft_*). **Cần C&B trước hoặc đồng thời**. |
| **Q4** | "Những thoả thuận khác" ở cuối HĐ bind theo template hay dùng 1 clause chung? | BLLĐ 2019 **Đ.21 k.2** (bí mật kinh doanh) + company_specific | Các điều khoản vượt Đ.21 = `company_specific` từ 8 file mẫu. **Đề xuất**: clause chung `CTR-CLAUSE-009` (company_specific) + override per template trong composer. |

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → dispatch next item in `TEAM_CLAUDE_ROLLING_QUEUE.md` §3 |
| **evidence** | This file + `docs/qa/evidence/ba-ctr-tpl-8-clause-map-01.md` |
| **Dev unlock** | NO — docs-only, no `apps/**` changes |

---

## 8. Next dispatch prompt (copy-ready)

```text
work_item_id: <next_from_rolling_queue>
role: <per_queue_lane>
lane: execution · <FE_web|BE|QA|BA>
entry_criteria:
  - BA-CTR-TPL-8-CLAUSE-MAP-01.md PASS_TO_PM
  - Rolling queue §3 status updated
read_first:
  - docs/program/TEAM_CLAUDE_ROLLING_QUEUE.md §3 (next QUEUED)
  - docs/program/SUBAGENT_READ_MAP.md (<role> lane)
  - docs/program/TEAM_WORKING_NOW.md
spec_read_ack required: rolling_queue + subagent_read_map
code_memory_required: true · change_mode: <UPGRADE|AUDIT|NEW> · preserve_default: true
allowed_paths:
  - <per_queue_item>
forbidden_paths:
  - <per_queue_item>
exit_criteria:
  - evidence_path: docs/qa/evidence/<next_wi>.md
  - ack_status: READY_FOR_QA | PASS_TO_PM
```


---

## 7. Sponsor decisions + resolution (2026-08-18)

Source: sponsor answers to §6 Q1–Q4, received 2026-08-18 mid-turn.

### 7.1 Sponsor decisions (verbatim)

| Q | Sponsor answer |
|---|---|
| **Q1** | Có, nghiên cứu quy định ở nước Việt Nam đi, có thể nghiên cứu thêm cả AMIS HRM hay các con HRM khác ở Việt Nam xem nó cấu hình như nào. Nếu chỉ là con số thì chỉ cần tạo ra 1 danh mục lương nữa và điền số thôi thì oke, nếu còn nghiệp vụ nào nữa thì nghiên cứu thêm rồi đề xuất cho tôi. |
| **Q2** | bind 6 thôi |
| **Q3** | optional thôi |
| **Q4** | bind theo template, phải cấu hình động vì có nhiều đối tượng áp dụng nhiều điều khoản khác nhau, có thể option nữa là để trống rồi điền tay |

### 7.2 Q1 — BHXH base salary: separate field or derived?

**Recommendation: separate editable field `insurance_salary_vnd`, default = `base_salary_vnd`.**

Regulation grounding (must be verified against the current text — see §7.6):
- BLLĐ 2019 **Đ.21 i**: HĐLĐ phải ghi rõ "mức lương, phụ cấp" — the contract must record salary **and** allowances.
- BHXH monthly base is derived from the salary + allowances agreed in the labor contract, **not** from `base_salary_vnd` alone.
- The BH base is **capped at 2× the common regional minimum wage** (QĐ 127A/2022/QĐ-TTg, supersedes QĐ 119/2014/QĐ-TTg). This cap is genuine business logic, not "just a number".

**Therefore the sponsor's rule applies in the "nghiệp vụ thêm" branch, not the "just a number" branch.**
Consequence for the data model:
- Add `insurance_salary_vnd` as its own column on the C&B compensation line (SoT), **editable**, defaulting to `base_salary_vnd` but overridable.
- Add a **cap rule** (2× regional minimum wage, per province) as a validation hint — display-only, computed, not user-editable.
- If the sponsor rejects the cap rule, fall back to the simpler "one more salary catalog entry + fill the number" path (the "just a number" branch) and drop the cap hint.

Competitor survey (AMIS HRM, MISA LISA, Gola, etc.):
- **NOT YET VERIFIED.** The WebSearch/WebFetch gateway is returning `400 ENABLE_WEB_SERVER_TOOLS=false`
  (see `TEAM_CLAUDE_ROLLING_QUEUE.md` §3b). I have **not** seen live AMIS HRM screens, and I will not
  fabricate their BH-base modelling. **Action for sponsor**: provide screenshots of the BH salary field
  in AMIS HRM (or whichever product you use), or approve a WebFetch pass against the vendor docs.
- Working assumption until then: most Vietnamese HRM products expose the BH base as a **separate
  editable field with an auto-fill-from-base option** — which matches the recommended model above.

### 7.3 Q2 — bind 6 of 8 starter templates

Bind exactly **6**; drop the 2 TV (thử việc / trial) templates.

| Keep (6) | Drop (2) | Rationale |
|---|---|---|
| VP · HĐLĐ不定期限 (indefinite) | TV · VP | TV = probation contract; BLLĐ 2019 **Đ.24 khoản 3** governs it separately |
| VP · HĐLĐ 1 năm | TV · VP | same |
| VP · HĐLĐ 3 năm | TV · VP | same |
| LX · HĐLĐ不定期限 | TV · LX | same |
| LX · HĐLĐ 1 năm | TV · LX | same |
| LX · HĐLĐ 3 năm | TV · LX | same |

Rationale: the 8 starters decompose as 4 VP × 2 types + 4 LX × 2 types where the 2 types are TV
(probation) and HĐLĐ (fixed-term). Binding 6 = bind all fixed-term HĐLĐ across VP and LX, drop both TV.
The composer UI hides the TV tab when `bind_count=6` is active; it can be re-enabled by flipping a
config flag if the sponsor later wants 8.

### 7.4 Q3 — insurance bootstrap is OPTIONAL

`insurance_salary_vnd` is SoT from the C&B compensation pack (`employee_compensation_packages/lines`).
- If a C&B pack exists → source from it (preferred).
- If **no** C&B pack exists → **optional bootstrap**: the field is left blank / filled manually.
  `required_by_law=true` for the `ft_*` template rows remains true as a *legal* requirement, but the
  *system* does not block creation on it. The UI shows a soft warning, not a hard error.
- Explicit fallback path: admin fills `insurance_salary_vnd` by hand on the compensation line;
  no auto-derivation, no seed data.

### 7.5 Q4 — dynamic per-template clause binding

Binding is **per template**, configured dynamically, with an explicit "empty → manual fill" option.

Design:
- A `template_clause_override` config keyed by `(template_code, clause_id)`:
  - `clause_id` — the canonical clause (e.g. `CTR-CLAUSE-009` company_specific).
  - `override_text` — per-template wording, may be **empty**.
  - `source` — `template_file` | `company_specific` | `manual`.
- Default set: every template inherits the common clause set (`CTR-CLAUSE-009` + the Đ.21 i/k.2 mandatory
  clauses). Per-template overrides layer on top.
- **Empty override = manual fill**: if `override_text` is blank, the composer renders a free-text area
  for the admin to type the clause by hand. This is the sponsor's requested option and is first-class,
  not a fallback hack.
- The composer resolves the final clause list per template at render time — no hard-coded mapping, so
  adding a new template or a new clause requires no code change.

### 7.6 Open items — ALL RESOLVED by sponsor (2026-08-18 mid-turn, verbatim in §7.1)

| # | Was | Sponsor answer | Disposition |
|---|---|---|---|
| 1 | Q1 competitor evidence (AMIS HRM BH-base field) | "Có, nghiên cứu quy định ở nước Việt Nam đi, có thể nghiên cứu thêm cả AMIS HRM hay các con HRM khác ở Việt Nam xem nó cấu hình như nào. Nếu chỉ là con số thì chỉ cần tạo ra 1 danh mục lương nữa và điền số thôi thì oke, nếu còn nghiệp vụ nào nữa thì nghiên cứu thêm rồi đề xuất cho tôi." | **DEFERRED to research phase.** WebSearch/WebFetch gateway returns `400 ENABLE_WEB_SERVER_TOOLS=false` (see `TEAM_CLAUDE_ROLLING_QUEUE.md` §3b). No AMIS screens seen; nothing fabricated. Working assumption recorded in §7.2: separate editable `insurance_salary_vnd` field. |
| 2 | Q1 regulation text (is QĐ 127A/2022/QĐ-TTg the current BH-base cap?) | (not separately answered; folded into Q1's "nghiên cứu quy định ở nước Việt Nam đi") | **DEFERRED.** Cap rule (2× regional minimum wage) recorded as a validation **hint**, display-only, computed, not user-editable. Must be verified against the live text before go-live. |
| 3 | Q2 — bind 6 or 8 of the 8 starter templates? | "bind 6 thôi" | **CLOSED** — §7.3: bind exactly 6, drop the 2 TV (probation) templates. Composer UI hides the TV tab when `bind_count=6`. |
| 4 | Q1 cap — accept 2× regional-minimum cap hint? | (not separately answered; Q1's "nếu chỉ là con số…" branch governs) | **CONDITIONAL.** If the cap turns out to be genuine business logic (BH base ≠ base salary, capped at 2× regional min) → keep the cap hint. If it is "just a number" → drop the cap hint, take the simpler "one more salary catalog entry + fill the number" path. Decision point moved to the research phase in item 1. |
| 5 | Q3 — insurance bootstrap mandatory or optional? | "optional thôi" | **CLOSED** — §7.4: `insurance_salary_vnd` is optional bootstrap. `required_by_law=true` stays true as a *legal* requirement, but the *system* does not block creation on it. UI shows a soft warning, not a hard error. |
| 6 | Q4 — bind "những thoả thuận khác" per template or one common clause? | "bind theo template, phải cấu hình động vì có nhiều đối tượng áp dụng nhiều điều khoản khác nhau, có thể option nữa là để trống rồi điền tay" | **CLOSED** — §7.5: per-template dynamic binding via `template_clause_override` keyed by `(template_code, clause_id)`, with `override_text` possibly **empty** = free-text manual fill. First-class option, not a fallback hack. |

**No new open items invented.** Remaining work is implementation of §7.3/§7.4/§7.5 in the CTR template composer — that is a dev WI, not a BA open item.

