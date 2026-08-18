# Evidence — PO-HRM-BP-ATT-SIGN-UF-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-UF-BA-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | governance · user-flow AC (no new UC) |
| **ack_status** | **PASS_TO_PM** |
| **apps/** | **not touched** |
| **Attendance CLOSED / product GO / D7 signed / Face LIVE** | **not claimed** |

---

## 1. Purpose

Seal **UF-HRM-ATT-SIGN** browser click path, **AC post-mutation FE**, and **J-HRM-06c** L2.5 steps for QA dispatch after Dev-BE **`PO-HRM-BP-ATT-SIGN-BE-01`** → **`READY_FOR_QA`**. Maps Manifest **AC-ATT-SIGN-04** and compiler AC **AC-ATT-SIGN-UF-01..07**. **No new UC** — only **UC-BP-ATT-11** / **FR-UC-BP-ATT-11**.

**Prior spec waves:** `po-hrm-bp-att-sign-ts-01.md` · `po-hrm-bp-att-sign-db-api-01.md` · `po-hrm-bp-att-sign-sa-01.md`.

---

## 2. spec_read_ack

| Artifact | Path / § | Status |
|----------|----------|--------|
| **SRS** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** · Luồng #1–#4 · Diễn biến #1–#3 · **BR-BP-TS-02** · **R-SIGN-01** | READ |
| **TechSpec** | `TECHSPEC_HRM_ENTERPRISE.md` **§6.4** · §6.4.1 state funnel · §6.4.2 XBOS WF | READ |
| **API** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02** close · **F-ATT-SHEET-03** reopen | READ |
| **Manifest AC** | `change-manifest.sample.json` **AC-ATT-SIGN-04** · `uf_or_j`: UF-HRM-ATT-SIGN | READ |
| **Prerequisite UF** | `USER_FLOW_OPERABILITY_MATRIX.md` **UF-HRM-16** 🟢 · **J-HRM-06b** | READ |
| **Scope tests** | `po-hrm-bp-att-sign-sa-01.md` **SP-ATT-SIGN-01..04** | READ |

```markdown
## spec_read_ack (handoff)
- srs: FR-UC-BP-ATT-11 · Diễn biến #1 xem chờ chốt · #2 ký · #3 hủy chốt (out of UF happy path)
- tech_spec: §6.4 · must_keep NV bắt buộc · không một nút «Chốt» che thiếu bước
- api_design: POST/GET …/attendance/attendance-sheets/{id}/signatures · POST …/close
- sponsor_confirm: CONFIRMED 2026-08-05 · wave PO-HRM-BP-SRS-CHOT-01
- change_mode: ADD (journey/UF matrix only)
```

---

## 3. UF / journey binding

| ID | Role |
|----|------|
| **UF-HRM-ATT-SIGN** | User-flow operability row §4 — mutate + F5 (AC-ATT-SIGN-04) |
| **J-HRM-06c** | L2.5 cross-nav spine **after** J-HRM-06b (sheet exists) |
| **UC-BP-ATT-11** | SRS FR map — **only** UC in scope |
| **BR-BP-TS-02** | Evaluator before close / PAY |

**Matrix:** [`USER_FLOW_OPERABILITY_MATRIX.md`](../USER_FLOW_OPERABILITY_MATRIX.md) §4 · **Journey:** [`PROGRAM_JOURNEY_MAP.md`](../../program/PROGRAM_JOURNEY_MAP.md) **J-HRM-06c**.

---

## 4. Environment & personas (QA copy-ready)

| Item | Value |
|------|--------|
| **Portal (Dev8088)** | `http://localhost:8088/command-center` → HRM embed `?portal=1` |
| **HRM standalone (local QA)** | `http://localhost:5175/hr/attendance` or embed tab **Chấm công** |
| **Group scope** | `ceo@xe.vn` / `Xevn@2026` · tenant `xevn` · `company_id=main` |
| **HCNS (web)** | `du-lich.hr@xe.vn` or holding HRBP account with HCNS WF step — [`PILOT_TEST_ACCOUNTS.md`](../PILOT_TEST_ACCOUNTS.md) |
| **NV / QL trực tiếp** | Account **gắn membership** trên cùng pháp nhân với dòng bảng công; thứ tự bước = **WF tenant** (R-SIGN-01), không hard-code |
| **U65** | **Cấm** seed sign steps / set `closed` DB; mọi bước từ **UI → API 2xx → FE → F5** |

**Tiên quyết nghiệp vụ (U65 FE chain):**

1. **UF-HRM-16 / J-HRM-06b** — đã có bảng kỳ trên list (`data-testid=att-sheets-precision`).
2. Sheet header **`status=submitted`** (chờ ký) — tạo qua luồng SRS **tổng hợp / gửi chờ ký** (FR-UC-BP-ATT-10 → funnel §6.4.1); **không** ký trên sheet `open` nháp.
3. WF tenant đã sync từ XBOS (bước NV + QL + HCNS visible trong **GET signatures**).

---

## 5. Click path — UF-HRM-ATT-SIGN (happy path)

**SRS ref:** FR-UC-BP-ATT-11 Luồng chính #1–#3 · Diễn biến #1–#2.

| Step | Actor | UI path (tiếng Việt / testid) | Network (TechSpec) |
|------|-------|-------------------------------|---------------------|
| **S0** | HCNS / C&B | Login portal → Command Center → tab/miền **Nhân sự (HRM)** → sidebar **Chấm công** (`/attendance`) | — |
| **S1** | HCNS | Tab/sub **Bảng chấm công** (list) — `data-testid=att-sheets-precision` | `GET /api/hrm/attendance/attendance-sheets?company_id=main` **200** |
| **S2** | HCNS | Click **kỳ** (cột Thời gian / Tên bảng) → mở chi tiết sheet **`submitted`** | `GET …/attendance-sheets/{id}` **200** · `status=submitted` |
| **S3** | HCNS / NV | Mở **panel / tab Ký chốt** (trạng thái từng bên — label nghiệp vụ, **cấm** raw `submitted`/`UC-*`) | `GET …/attendance-sheets/{id}/signatures` **200** · `steps[]` + `missing_mandatory_roles` |
| **S4** | **NV** | Đăng xuất → login NV → cùng sheet (inbox/task WF hoặc deep link list) → **Xác nhận** bước NV | `POST …/signatures` **200/201** · `persona_role=employee` · `outcome=approved` |
| **S5** | **QL** | Login QL → **Xác nhận** bước quản lý trực tiếp (theo WF tenant) | `POST …/signatures` **200/201** · `persona_role=direct_manager` (hoặc `step_code` WF) |
| **S6** | **HCNS** | Login HCNS → **Xác nhận / Ký** bước HCNS | `POST …/signatures` **200/201** · `can_close=true` khi evaluator PASS |
| **S7** | HCNS | Nút **Chốt bảng công** / **Hoàn tất chốt** — **chỉ** enabled khi đủ bước (must_keep) | `POST …/attendance-sheets/{id}/close` **200** · `{ status: closed }` |
| **S8** | HCNS | **F5** hoặc navigate list → mở lại row | `GET …/{id}` **200** · `status=closed` · signatures còn |
| **S9** | HCNS | (Optional L2.5) List → back → mở sheet khác scope **404/409** — SP-ATT-SIGN-02 | scope parity |

**Deep link anchor (L2.5):** URL embed giữ `company_id=main`; mở trực tiếp `{sheetId}` từ list row (click path S2) — **không** 404 scope khi id có trong list (SP-ATT-SIGN-01).

**Cấm PASS QA:**

- «Chốt» **200** khi thiếu NV/QL/HCNS (409 `HRM-ATT-SIGN-INCOMPLETE` phải hiện copy nghiệp vụ trên FE).
- Chỉ assert API không đổi UI.
- Seed `att_timesheet_sign_step` hoặc `status=closed` ngoài UI.

---

## 6. AC-ATT-SIGN-UF-01..07 (browser — QA gate)

| AC-ID | Điều kiện | PASS khi (FE sau 2xx) | FAIL khi |
|-------|-----------|------------------------|----------|
| **AC-ATT-SIGN-UF-01** | S1–S3 load | List có row kỳ; mở sheet **submitted**; panel ký hiển thị **≥1** bước WF; không banner Sync ERROR / 409 scope | Spinner vô hạn; list 0 do API 5xx; tech chrome |
| **AC-ATT-SIGN-UF-02** | S4 NV mutate | Sau POST sign NV: cột/trạng thái bước NV = **Đã xác nhận** (hoặc tương đương VI); `missing_mandatory_roles` giảm | NV chưa ký mà bước hiện xanh; im lặng |
| **AC-ATT-SIGN-UF-03** | S5 QL mutate | QL bước cập nhật; **cấm** close trước QL nếu WF bắt buộc QL sau NV | Nút Chốt enable khi QL chưa ký |
| **AC-ATT-SIGN-UF-04** | S6 HCNS mutate | HCNS bước cập nhật; UI gợi ý **có thể chốt** (`can_close`/label) | HCNS ký xong vẫn «thiếu chữ ký» sai |
| **AC-ATT-SIGN-UF-05** | S7 close | Header/badge **Đã chốt** / **Closed** (label VI); toast success; không overlay lỗi | `closed` API mà UI vẫn «Chờ ký» |
| **AC-ATT-SIGN-UF-06** | S8 F5 | F5: trạng thái **closed** + lịch sử bước ký còn; list row phản ánh chốt | F5 về `submitted` hoặc mất steps |
| **AC-ATT-SIGN-UF-07** | Negative (QL/HCNS) | Thử **Chốt** khi thiếu NV: **409** + message nghiệp vụ; FE **không** 🟢 | Bypass một nút Chốt → closed |

**Compiler map:** **AC-ATT-SIGN-04** (Manifest) = **UF-01..07** bundle PASS trên **cùng** sheet id U65.

---

## 7. AC post-mutation FE (SRS — bắt buộc mỗi bước mutate)

Pattern QA evidence (mẫu `qa-fe-outside-browser-gate.mdc`):

### UF-HRM-ATT-SIGN — Ký chốt (happy path)

- **Persona / URL / click path:** `ceo@xe.vn` → `:8088/command-center` → HRM → Chấm công → Bảng chấm công → row kỳ → panel Ký → NV/QL/HCNS lần lượt → Chốt → F5.
- **Trước mutate:** snapshot `status=submitted`; `steps[]` pending cho NV/QL/HR.
- **Action (NV):** Xác nhận → Lưu / ✓
- **Network:** `POST …/signatures` → **200/201**
- **FE sau 2xx:** bước NV hiển thị approved; không banner đỏ.
- **F5:** bước NV vẫn approved.
- **Lặp** cho QL, HCNS, **POST close**, **F5 closed**.
- **Verdict:** ⬜ until Dev `READY_FOR_QA` · target 🟢
- **spec_ref:** SRS FR-UC-BP-ATT-11 Diễn biến #2 · API F-ATT-WF-SIGN-01 · F-ATT-SHEET-02

| Mutate | API | FE sau 2xx (bắt buộc) | F5 |
|--------|-----|------------------------|-----|
| NV xác nhận | POST signatures | Bước NV ✓; chưa «Đã chốt» | NV ✓ |
| QL xác nhận | POST signatures | Bước QL ✓ | QL ✓ |
| HCNS xác nhận | POST signatures | Bước HCNS ✓; **Chốt** enable nếu `can_close` | HCNS ✓ |
| Chốt | POST close | Badge **Đã chốt**; lưới read-only / khóa chỉnh | **closed** |
| Reopen | — | **Out of UF** (UF chỉ happy close) | — |

---

## 8. Alternate / exception (document — không 🟢 UF)

| Case | SRS | QA note |
|------|-----|---------|
| Một bên **Từ chối** | FR-UC-BP-ATT-11 · BR-BP-TS-02 | POST `outcome=rejected` → sheet **không** close; PAY blocked — separate defect if missing |
| **Hủy chốt** | Diễn biến #3 · F-ATT-SHEET-03 | UF follow-up `UF-HRM-ATT-REOPEN` (not in this wave) |
| Sheet `open` | P1 F-ATT-SHEET-02 | Panel ký ẩn hoặc 409 — không test ký trên nháp |

---

## 9. TR-CM-05 / compiler

| ID | Verdict | Notes |
|----|---------|-------|
| **TR-CM-05** | **PASS (compile-time)** | UF + J-06c + AC-ATT-SIGN-UF-01..07 on disk; browser 🟢 deferred product |
| **AC-ATT-SIGN-04** | **READY_FOR_QA** | Blocked until `PO-HRM-BP-ATT-SIGN-BE-01` + FE wire |

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | UF-HRM-ATT-SIGN click path · AC-ATT-SIGN-UF-01..07 · post-mutation FE table · J-HRM-06c steps sealed; matrix §4 + journey map updated |
| **next_owner** | **dev-be** (in flight) → **qa** after `READY_FOR_QA` |
| **not promoted** | 🟢 UF / ✅ J-06c — requires browser evidence U65 |
| **residual** | Pilot NV/QL accounts for holding sheet — QA ghi account thực tế trong evidence run; FE panel ký có thể chưa wire (Dev-FE wave tách nếu PM dispatch) |

### next_dispatch_prompt (PM → qa — when BE READY_FOR_QA)

```text
work_item_id: PO-HRM-BP-ATT-SIGN-QA-01
role: qa
entry_criteria: dev-be PO-HRM-BP-ATT-SIGN-BE-01 ack READY_FOR_QA; qc:fe-be-health exit 0; UF-HRM-16 prerequisite 🟢; U65 zero-seed
read_first: docs/qa/evidence/po-hrm-bp-att-sign-uf-ba-01.md · USER_FLOW_OPERABILITY_MATRIX UF-HRM-ATT-SIGN · PROGRAM_JOURNEY_MAP J-HRM-06c
exit_criteria: AC-ATT-SIGN-UF-01..07 browser on :8088 or :5175 embed; Network POST signatures + POST close 2xx; FE post-mutation + F5; evidence docs/qa/evidence/qa-uf-hrm-att-sign-01-YYYYMMDD.md; matrix UF-HRM-ATT-SIGN → 🟢 or 🟡 with defect id
hdsd_align: HRM → Chấm công → Bảng chấm công → Ký chốt
cấm: pnpm seed:* · DB fake sign steps
ack_status target: PASS_TO_PM or FAIL_TO_PM with spec_ref
```

### pm_dispatch_hint

`PO-HRM-BP-ATT-SIGN-BE-01` must complete before QA; parallel **dev-fe** if signature panel not in `Attendance.tsx`.

---

## 11. Trace index

| Artifact | Path |
|----------|------|
| This evidence | `docs/qa/evidence/po-hrm-bp-att-sign-uf-ba-01.md` |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §4 UF-HRM-ATT-SIGN |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` J-HRM-06c |
| Slice | `docs/program/slices/HRM-ATT-SIGN-01.md` |

---

*End evidence PO-HRM-BP-ATT-SIGN-UF-BA-01 · ack_status: PASS_TO_PM*
