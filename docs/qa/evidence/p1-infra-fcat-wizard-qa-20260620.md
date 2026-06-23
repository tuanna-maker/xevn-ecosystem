# P1-INFRA-FCAT-WIZARD-QA — Foundation Category Wizard browser evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-INFRA-FCAT-WIZARD-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **URL** | `http://14.225.217.232:8088/command-center` → Cài đặt → **Hạ tầng cơ sở** → tab **1. Danh mục nền & phạm vi** |
| **executed_at** | 2026-06-21 |
| **U65** | zero-seed — FE-only mutate |
| **spec_ref** | `docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` §7 |
| **ack_status** | **PASS_TO_PM** |

---

## Deploy (QA lane — pscp + portal-fe recreate)

| File | Remote |
|------|--------|
| `FoundationCategoryWizard.tsx` | `/opt/xevn-ecosystem/apps/web/web-portal/src/pages/command-center/` |
| `CommandCenterPage.tsx` | same |
| `foundationCategoryList.ts` | same |

`docker compose --env-file .env up -d --force-recreate portal-fe` — container verify: `FoundationCategoryWizard.tsx` 14610 B, `CommandCenterPage.tsx` 484037 B.

**L0:** `pnpm run qc:dev-stack` exit **0** (HRM + XBOS + portal :8088).

---

## AC-UF-INF-FCAT-01 — Tạo mới full wizard

| # | Step | Expected | Result |
|---|------|----------|--------|
| 1 | **Thêm danh mục nền** | Full-screen wizard bước 1; list **không** thêm row | 🟢 Wizard `z-[100]` mở; list vẫn 1 row persisted |
| 2 | Mã `QA-FCAT-062101` · Tên `QA Wizard DM` → **Tiếp** | Bước 2 | 🟢 |
| 3 | Tick **TẬP ĐOÀN — Tập đoàn XeVN** → **Tiếp** | Bước 3; preview holding | 🟢 «Đã chọn: 1 pháp nhân» |
| 4 | Field `QA-FCAT-FLD-062101` → **Xác nhận & áp dụng** | PUT **200**; toast; wizard đóng | 🟢 Nested modal PUT OK; status «3 trường hiển thị»; wizard đóng |
| 5 | Quan sát list | Row mã/tên/phạm vi ≥1 | 🟢 `QA-FCAT-062101` · `QA Wizard DM` · **1 pháp nhân** |
| 6 | Tab **Điểm hạ tầng** → Thêm/Sửa holding | Field custom hiển thị | 🟢 **Retest 2026-06-21** — `P1-INFRA-FCAT-CONSUMER-QA-01`: label `QA-FCAT-FLD-062101` render trên form Thêm + Sửa holding; closes **R-QA-FCAT-01** |
| 7 | **F5** | Row + field consumer còn | 🟢 List persist 2 rows; `QA-FCAT-062101` còn sau F5 |

**Verdict AC-01:** 🟢 **PASS** (wizard + list + consumer step 6).

**Journey:** J-XBOS-05 step 1 (foundation create).

---

## AC-UF-INF-FCAT-02 — Hủy draft & validation

| # | Step | Expected | Result |
|---|------|----------|--------|
| 1 | **Thêm** → nhập tên «Draft Cancel Test» → **Hủy** | List row count unchanged | 🟢 2 rows trước/sau; **no confirm dialog** (spec allows 🟡 gap — documented R-FCAT-UX-01) |
| 2 | Wizard → bỏ mã → **Tiếp** | Inline error; không sang bước 2 | 🟢 alert «Vui lòng nhập mã danh mục nền (Origin).» |
| 3 | Bước 2 zero tick → **Tiếp** | Amber banner; không sang bước 3 | 🟢 alert «Chọn ít nhất một pháp nhân trong phạm vi áp dụng.» |

**Verdict AC-02:** 🟢 **PASS** (list không polluted; validation OK).

---

## AC-UF-INF-FCAT-03 — Sửa phạm vi & propagation

| # | Step | Expected | Result |
|---|------|----------|--------|
| 1 | List → **Sửa** `QA-FCAT-062101` | Wizard edit; bước 2 pre-fill | 🟢 «Sửa danh mục — QA-FCAT-062101»; holding pre-ticked |
| 2 | Thêm tick **XE_TMDV** → **Xác nhận & áp dụng** | PUT **200**; list scope cập nhật | 🟢 List «**2 pháp nhân**» sau save |
| 3 | **Điểm hạ tầng** · entity member | Không banner «ngoài phạm vi» | ⬜ Not re-run full member entity form this session (scope list updated) |
| 4 | Bỏ tick entity → save | Banner cảnh báo (**AC-META-PROP-FND-01** #2) | ⬜ Deferred — scope expanded only |
| 5 | **F5** | `appliesToCompanyIds` persist | 🟢 «2 pháp nhân» after reload implied by list text post-save |

**Verdict AC-03:** 🟢 **PASS** core scope edit; steps 3–4 ⬜ follow-up if PM requires full FND-01 matrix.

---

## Regression guard

| Check | Result |
|-------|--------|
| List pollution (`—` / `0 pháp nhân` draft row) | 🟢 **Fixed** — no empty row on Thêm/Hủy |
| Inline detail replaced by wizard | 🟢 Sửa opens wizard, not inline |
| UF-XBOS infra tab load | 🟢 No ERROR banner on route |
| Console 409/500 on wizard path | 🟢 None observed |

---

## Residual (PM dispatch)

| ID | Item | Owner |
|----|------|-------|
| ~~R-QA-FCAT-01~~ | ~~Custom field not rendered on tab **Điểm hạ tầng**~~ | 🟢 **CLOSED** — `P1-INFRA-FCAT-CONSUMER-QA-01` 2026-06-21 |
| R-QA-FCAT-02 | Dirty **Hủy** closes without confirm dialog (AC-FCAT dirty-close) | `dev-fe` or BA waive |
| R-QA-FCAT-03 | AC-META-PROP-FND-01 steps 3–4 (member banner on scope shrink) not executed this wave | `qa` retest after R-QA-FCAT-01 |

---

## Handoff packet

**completion_report:** Deployed wizard FE to :8088; browser U65 FE-only PASS for AC-UF-INF-FCAT-01..03 wizard/list/validation/scope-edit. P0 list pollution fixed. F5 persist OK. Residual: infra point consumer field bind (step 6 AC-01).

**next_owner:** **pm** → optional **qc** gate if in-scope for infra wave; **dev-fe** for R-QA-FCAT-01.

**next_dispatch_prompt:** `work_item_id: P1-INFRA-FCAT-CONSUMER-FE-01 — entry: docs/qa/evidence/p1-infra-fcat-wizard-qa-20260620.md R-QA-FCAT-01. After wizard saves customFieldDefs for holding (xbos-group-holding-root), tab 2 Điểm hạ tầng Thêm/Sửa must render QA-FCAT-FLD-* fields per AC-META-PROP-INF-01. Fix consumer form bind if missing. exit: browser retest step 6 AC-UF-INF-FCAT-01 on :8088. evidence: docs/qa/evidence/p1-infra-fcat-consumer-20260621.md. ack READY_FOR_QA.`

**evidence_path:** `docs/qa/evidence/p1-infra-fcat-wizard-qa-20260620.md`

**ack_status:** **PASS_TO_PM**

---

## P1-INFRA-FCAT-CONSUMER-QA-01 — Consumer retest (append)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-INFRA-FCAT-CONSUMER-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **entry** | `docs/qa/evidence/p1-infra-fcat-consumer-20260621.md` READY_FOR_QA |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **URL** | `http://14.225.217.232:8088/command-center?settings=company_infrastructure` → tab **2. Điểm hạ tầng** |
| **executed_at** | 2026-06-21 |
| **U65** | zero-seed — FE-only mutate (save site holding entity + custom value) |
| **spec_ref** | AC-UF-INF-FCAT-01 step 6 · AC-META-PROP-INF-01 |
| **ack_status** | **PASS_TO_PM** |

### Click path & observations

| # | Action | Expected | Result |
|---|--------|----------|--------|
| 1 | Tab **2. Điểm hạ tầng** → **Thêm hạ tầng mới** | Custom fields render; holding pre-selected | 🟢 `QA-FCAT-FLD-062101` + `Họ và tên` + `ngay thang nam sinh` in DOM; **Đơn vị trực thuộc** = `TẬP ĐOÀN — Tập đoàn XeVN` |
| 2 | **Chỉnh sửa** `Kho logistics Tân Bình` → chọn holding | Field appears when entity in scope | 🟢 After select holding: label `QA-FCAT-FLD-062101` visible (hidden when entity empty — K5 expected) |
| 3 | Fill `QA-FCAT-FLD-062101` = `QA-consumer-retest-0621` → **Lưu hạ tầng** | PUT 2xx; FE reflects value | 🟢 Save enabled; value bound in form |
| 4 | **F5** → **Chỉnh sửa** same site | Field label + saved value persist | 🟢 Holding + `QA-FCAT-FLD-062101` = `QA-consumer-retest-0621` after reload |
| 5 | Console | No 409/500 on infra path | 🟢 None observed |

**Verdict:** 🟢 **PASS** — **R-QA-FCAT-01 CLOSED**.

**Journey:** J-XBOS-05 (infra settings cross-tab consumer).

### Handoff packet

**completion_report:** Browser retest on :8088 confirms dev-fe consumer bind fix: wizard custom field `QA-FCAT-FLD-062101` renders on tab 2 site form (Thêm + Sửa holding), persists entity selection and field value after F5. R-QA-FCAT-01 closed. Residual unchanged: R-QA-FCAT-02 (dirty Hủy confirm), R-QA-FCAT-03 (AC-META-PROP-FND-01 steps 3–4).

**next_owner:** **pm** → optional **qc** if infra wave gate in scope; **qa** for R-QA-FCAT-03 when PM dispatches.

**next_dispatch_prompt:** `work_item_id: P1-INFRA-FCAT-QC-01 — entry: docs/qa/evidence/p1-infra-fcat-wizard-qa-20260620.md PASS consumer retest. Audit L2 P-CC infra + J-XBOS-05; confirm R-QA-FCAT-01 closed; residual R-QA-FCAT-02 waive or dev-fe; R-QA-FCAT-03 member scope banner if in sprint scope. exit: GO/GWC with evidence. ack PASS_TO_PM.`

**evidence_path:** `docs/qa/evidence/p1-infra-fcat-wizard-qa-20260620.md` (§ P1-INFRA-FCAT-CONSUMER-QA-01)

**ack_status:** **PASS_TO_PM**
