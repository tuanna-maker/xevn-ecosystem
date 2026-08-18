# BM-QA-JD-HIRE-APPLY-R2 — YCTD JD gate · Hire chức vụ · apply-to-members

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-JD-HIRE-APPLY-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P0 |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **executed_at** | 2026-07-21 ~23:33–23:45 ICT (evidence stamp 20260722) |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (existing session JWT → Command Center) |
| **U65** | zero-seed · browser FE primary · API only for apply-to-members (no FE UX) |
| **entry** | `d-do-sync-8088-bm-wave1-01` · `bm-fe-jd-req-only` · `bm-fe-hire-title` · `bm-be-cfg-apply-members` |
| **ack_status** | **PASS_TO_PM** |
| **spec_ref** | BM-AC-05-02 · BM-AC-07 (hire picker) · XBOS-DM-HRM-07 / G-BM-REC-01 · `XBOS-CFG-204` |

---

## Executive summary

| AC | Verdict | Notes |
|----|---------|-------|
| **BM-AC-05** YCTD cannot save without JD; select JD → POST `job_template_id` + `headcount` ≥1 → 2xx + F5 | **PASS** | FE VI gate; POST **201** `HRM-REC-201`; list + F5 Số lượng **2** |
| **BM-AC-07** Hire picker Select shows chức vụ | **PASS** | Labels `CODE — Name · TITLE (dept)`; e.g. `PORTAL-GCEO — CEO Tập đoàn · CEO` |
| **Apply-to-members** FE UX | **N/A (absent)** | No FE string/button for apply-to-members / Áp dụng thành viên |
| **Apply-to-members** API + HRM pull | **PASS** (L1 + pull) | POST **201** `XBOS-CFG-204`; HRM pull **201** `HRM-SYNC-200` |
| Member catalog FE under Group CEO | **DOCUMENTED GAP** | GET member `companyId` → **409** `SCOPE_CONTEXT_MISMATCH`; holding Settings `job_titles` still visible (4 items) |

Overall **PASS_TO_PM**. No seed. No Phase1/PROD claim. Hire dialog cancelled after picker evidence (no extra hire mutate).

---

## Environment

| Item | Detail |
|------|--------|
| Portal | `http://14.225.217.232:8088` |
| HRM surface | `http://14.225.217.232:8088/hr/recruitment?tenantId=xevn&companyId=main` |
| Seed | **none** |
| Auth | Session `xevn.portal.accessToken` present (redirect `/login` → `/command-center`) |

---

## 1) BM-AC-05 — YCTD JD-required + headcount

### Click path

1. Login/session → `/hr/recruitment?tenantId=xevn&companyId=main`
2. Tab **Yêu cầu tuyển dụng** → **Thêm yêu cầu**
3. Dialog: `JD từ thư viện *` required; mô tả/yêu cầu **disabled** until JD; helper *«Bắt buộc chọn JD từ thư viện…»*
4. Negative: fill Tiêu đề + Phòng/Ban, **no JD** → **Lưu yêu cầu**

### Negative (no JD)

| Check | Result |
|-------|--------|
| Dialog stays open | **PASS** |
| VI error | *«Chọn JD từ thư viện trước khi lưu yêu cầu tuyển dụng.»* |
| Network POST | **none** (0 requisition POSTs) |
| Option «Không dùng template» / `__none__` | **absent** — only library JDs |

### Happy path

| Step | Result |
|------|--------|
| Select JD | `JD-BM-QA-1784649801 — BM-QA-REC JD Thư viện 1784649801` |
| Snapshot | Mô tả enabled + filled from JD |
| Title / headcount | `BM-QA-R2 YCTD từ JD 1784651727039` · **Số lượng = 2** |
| Network | `POST /api/hrm/recruitment/requisitions` → **201** `HRM-REC-201` |

**Request body (excerpt):**

```json
{
  "company_id": "main",
  "title": "BM-QA-R2 YCTD từ JD 1784651727039",
  "department": "Nhân sự tập đoàn",
  "employment_type": "full_time",
  "headcount": 2,
  "job_description": "Mô tả JD tạo từ BM-QA-REC-E2E-8088-01 — phụ trách sàng lọc CV và phối hợp phỏng vấn.",
  "job_template_id": "eb057743-009c-461a-8b62-ef64bdea09ca"
}
```

**Response data:** `id=16f3151f-5fc4-4d4d-87a3-da82e7a0afdf` · `headcount:2` · `job_template_id` stamped · `company_id` resolved `holding`.

### FE after 2xx + F5

| Check | Result |
|-------|--------|
| List row | `BM-QA-R2 YCTD từ JD 1784651727039` · Phòng `Nhân sự tập đoàn` · **Số lượng 2** · `Đang tuyển` |
| F5 reload + tab Yêu cầu | **PASS** — same row persists |

**Verdict BM-AC-05:** 🟢

---

## 2) BM-AC-07 — Hire picker chức vụ

### Click path

1. `/hr/recruitment` → **Ứng viên** → **Tất cả ứng viên**
2. Row stage **Ứng tuyển** (`QA Pool 1780114488912`) → change to **Đã tuyển**
3. Dialog **Gắn hồ sơ nhân viên** → open Select **Hồ sơ nhân viên**
4. **Hủy** (picker evidence only — no confirm)

### Select labels (sample of 100)

```
PORTAL-GCEO — CEO Tập đoàn · CEO
HLD-0996 — Phạm Đức Hùng · LEGAL_SPECIALIST (Kinh doanh)
TCN-0684 — Đỗ Đức Giang · RECRUITER (Vận hành)
LOG-0098 — Trần Ngọc An · IT_ADMIN (Pháp chế)
…
```

| Check | Result |
|-------|--------|
| Format includes `· <chức vụ/job_title_key>` | **PASS** (15/15 sampled had `·`) |
| Not only `code — name` | **PASS** |
| Soft: NV list column **CHỨC VỤ** | Visible on `/hr/employees` |

**Verdict BM-AC-07 (hire picker):** 🟢  
Soft residual (from FE handoff): catalog **display label** may still be key string vs XBOS friendly label — acceptable for this AC.

---

## 3) Apply-to-members (`job_titles` / XBOS-CFG-204)

### FE UX search

| Surface | Result |
|---------|--------|
| HRM Settings → Danh mục | **No** «Áp dụng thành viên» / apply-to-members CTA |
| Repo `apps/web` grep | **0** matches for `apply-to-members` / `applyToMembers` |
| Conclusion | **FE apply UX not shipped** → API + HRM pull smoke per dispatch |

### API smoke (browser `fetch` with portal JWT — not seed)

**Source read:**  
`GET /api/xbos/config-sync/catalog/job_titles?target=hrm&tenantId=xevn&companyId=main`  
→ **200** `XBOS-CFG-201` · `version:7` · `itemCount:4` · checksum `sha256:af60ffad…`

**Apply:**  
`POST /api/xbos/config-sync/catalog/job_titles/apply-to-members`

```json
{
  "tenantId": "xevn",
  "companyId": "main",
  "targets": [{ "tenantId": "xevn", "companyId": "dfb107a7-99e3-433a-94e5-f78ce8b2d665" }],
  "actor": "bm-qa-jd-hire-apply-r2"
}
```

→ **201** `XBOS-CFG-204` «Catalog applied to members»  
→ `appliedCount:1` · target VISUN UUID · source `holding` itemCount **4** · checksum match on applied row

**HRM pull:**  
`POST /api/hrm/catalog-sync/pull/job_titles?tenant_id=xevn&company_id=dfb107a7-99e3-433a-94e5-f78ce8b2d665`  
→ **201** `HRM-SYNC-200` «Catalog pulled from XBOS»

### Member FE / GET observation (Group CEO)

| Call | Result |
|------|--------|
| `GET …/config-sync/catalog/job_titles?…&companyId=dfb107a7-…` | **409** `SCOPE_CONTEXT_MISMATCH` |
| Same for slugs `xe-du-lich` / `visun` / `VISUN` | **409** |
| `GET /api/hrm/settings-catalogs?company_id=<member>` | **409** |
| Holding Settings `job_titles` | **200** · key present · **4** items (FE-observable on `company_id=main`) |

**Documented:** Member partition apply+pull succeeded at API; **Group CEO JWT cannot browse member-scoped catalog GET** (409). Full member UI confirm needs member persona (`du-lich.ceo@xe.vn`) or select-membership — **out of this wave’s account** unless PM dispatches follow-up.

**Verdict apply-to-members:** 🟢 API contract + pull · 🟡 member FE observe blocked by scope under `ceo@xe.vn`

---

## Gate table

| Criterion | Verdict |
|-----------|---------|
| U65 no seed | **PASS** |
| BM-AC-05 JD gate + POST shape + F5 | **PASS** |
| BM-AC-07 hire Select chức vụ | **PASS** |
| FE apply-to-members | **ABSENT** (documented) |
| API `XBOS-CFG-204` + HRM pull | **PASS** |
| Phase1 / PROD claim | **not claimed** |

---

## Residual / next

| Item | Owner hint |
|------|------------|
| FE apply-to-members wizard | `BM-FE-CFG-APPLY-MEMBERS-01` (BE READY; QA L1 green) |
| Member persona FE catalog after apply | QA with `du-lich.ceo@xe.vn` or membership switch |
| BM-06 / J-REC-WF-02 SPAWN-MISSING | Still open from `bm-qa-rec-e2e-8088-01` — **out of this R2 scope** |
| Soft: job_title_key → friendly label on hire picker | Optional FE polish |

---

## completion_report

**Closed:** BM-AC-05 JD-required YCTD create (201 + F5); BM-AC-07 hire picker shows chức vụ; apply-to-members documented as **no FE UX** + API **XBOS-CFG-204** + HRM pull **HRM-SYNC-200**.  
**Residual:** Member FE catalog observe under Group CEO = 409; FE apply wizard not built; BM-06 WF spawn still prior FAIL.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: BM-FE-CFG-APPLY-MEMBERS-01
from_role: pm
to_role: dev-fe
priority: P1
program: P1-BMINUTES-CUST-RETEST-01
entry_criteria: docs/qa/evidence/bm-qa-jd-hire-apply-r2-20260722.md PASS_TO_PM · bm-be-cfg-apply-members READY · U65
job:
  - Add XBOS/HRM Settings UX to POST /api/xbos/config-sync/catalog/{key}/apply-to-members for allow-list keys (job_titles, recruitment_channels, job_grades)
  - After 2xx show appliedCount + checksum; F5 list still holding source
  - Optional: member OU filter or deep-link note when Group CEO hits 409 SCOPE_CONTEXT_MISMATCH on member GET
  - must_keep: BM-AC-05 JD-required YCTD · hire picker title format · no leave change · no seed
exit_criteria: READY_FOR_QA · evidence docs/qa/evidence/bm-fe-cfg-apply-members-01-YYYYMMDD.md
spec_ref: XBOS-DM-HRM-07 · G-BM-REC-01 · OpenAPI configSyncApplyCatalogToMembers
parallel_optional: QA-BM-MEMBER-CATALOG-FE-01 with du-lich.ceo@xe.vn to observe job_titles after apply+pull
```

## ack_status

**PASS_TO_PM**
