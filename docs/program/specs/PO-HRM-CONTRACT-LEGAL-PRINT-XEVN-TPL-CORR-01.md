# CORRECTION — Catalog mẫu HĐ **động** (supersede closed enum)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |
| **from_role** | ba-process |
| **lane** | governance |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **Sponsor correction** | 2026-08-07 — 8 mẫu X.E = **ví dụ only**; catalog **PHẢI ĐỘNG**; HR tự thêm mẫu **9+**; **CẤM** fix cứng 8 mã |
| **Lock SoT** | [`PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) |
| **change_mode** | **ADD-only CORRECTION** · APPEND `@CHANGE` trên SPEC/DATA/API/TECH · **NO** `apps/**` · **no** seed · **no** wipe UF/print-spine/Q-CTR |
| **Date** | 2026-08-07 |
| **Status** | **BA LOCKED CORRECTION** — supersede closed enum trên SoT cascade |
| **Honesty** | `contracts_printable_ready=false` · U65 zero-seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. Supersede map (closed → open)

| Prior SoT claim (SUPERSEDED) | Correction (authoritative) |
|------------------------------|----------------------------|
| Exactly **8** `XEVN_*` = closed enum / SoT ceiling | **8** = **starter examples** from Excel X.E — optional bootstrap, **not** ceiling |
| **FORBIDDEN** invent 9th `template_code` | **REQUIRED**: HR/Settings **CRUD** tạo mẫu thứ **9+** (code + pack + clause + duration) **không** cần release code |
| DB `CHK code IN (<8 XEVN_*>)` | **FORBIDDEN** — remove / never ship |
| API reject «9th» via `HRM-CTR-TPL-CODE-INVALID` on unknown XEVN | **FORBIDDEN** as enum gate — validate **format/slug** + pack ∈ configured packs + UQ `(company_id, lower(code))` only |
| FE hardcode list 8 / seed-only catalog | **FORBIDDEN** — picker = **open list** from API (`status=active`) |
| AC-CTR-XEVN-01 = đúng 8 active · fail nếu >8 | **REVISED**: starter 8 **có thể** có sau bootstrap; catalog **≥0** open; **PASS** khi tạo thêm mã thứ 9+ |
| VAL-XEVN-06 = block `XEVN_%` not in 8-set | **SUPERSEDED** — see §4 |
| VAL-XEVN-07 = soft warn nếu active ≠ 8 (ceiling UX) | **REVISED**: soft warn chỉ khi **thiếu** starter bootstrap (optional CTA), **không** chặn thêm mẫu |

**Still valid (must_keep):**

| Keep | Note |
|------|------|
| 8 `XEVN_*` matrix rows as **starter examples** | Pack / term / duration / title từ SPEC-01 §2.1 |
| Pack `GENERAL` \| `IT_OFFICE` \| `DRIVER` | Neo `*_OFFICE`→`IT_OFFICE` · `*_DRIVER`→`DRIVER` cho starter; HR mẫu mới chọn pack ∈ configured |
| Alias Excel `HĐKXĐ` / `HĐ KXĐ` | **Không auto-bootstrap** mã riêng (dedupe) — **không** = cấm HR tạo mã khác hợp lệ |
| UF-HRM-02 registry CRUD không bắt buộc print template | AC-CTR-XEVN-08 |
| Print-spine preview→PDF→F5 | AC-CTR-PRINT-* · freeze `template_code` |
| **Q-CTR-01 CLOSED** · **Q-CTR-02 CLOSED** | Không mở lại |
| Holding publish/pull versioned | Members nhận mẫu mới qua library, **không** hardcode list |
| `contracts_printable_ready=false` | Honesty |

---

## 1. Target process (to-be)

```text
hrm_contract_templates = OPEN CATALOG
  · unique code per company/scope (active, soft-delete)
  · optional ensure/upsert 8 XEVN_* starter rows (Excel matrix)
  · HR Settings: CREATE / UPDATE / activate / retire bất kỳ mã hợp lệ (9+)
  · Print/merge binds template_code → active row (any HR-created code)
  · Validation: slug/format · pack_code ∈ configured packs · term/duration rules
  · NOT: closed code enum · CHK IN (8) · FE fixed 8 · API reject 9th
```

### Actors

| Actor | Action |
|-------|--------|
| HCNS / Settings admin | CRUD mẫu (code, name, pack, term defaults, clause DnD, title) |
| HCNS (HĐ) | Chọn bất kỳ mẫu active trên form tạo/sửa → preview / issue |
| System | Bootstrap starter 8 (optional); publish/pull lineage DATA-02 |

### Scope in / out

| In | Out |
|----|-----|
| Open catalog + starter 8 + AC 9th U65 | Redesign PDF engine |
| Remove closed enum / CHK IN 8 / FORBIDDEN 9th | Claim printable UAT |
| Pack / UF-02 / print-spine / Q-CTR keep | Paste full HĐ body · seed body |
| DOC-DELTA SoT | `apps/**` this seat |

---

## 2. Business rules (ADD / REPLACE)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-CTR-TPL-DYN-01** | Catalog SoT | `hrm_contract_templates` open; `code` unique active per company | HR thêm 9+ không cần deploy |
| **BR-CTR-TPL-DYN-02** | Bootstrap | Ensure may upsert 8 `XEVN_*` from Excel matrix | Starter only — **not** max count |
| **BR-CTR-TPL-DYN-03** | Create/upsert code | Validate slug/format (non-empty, charset policy) + UQ | Reject invalid format / conflict — **not** «not in 8» |
| **BR-CTR-TPL-DYN-04** | `pack_code` | Must ∈ configured packs (`GENERAL`\|`IT_OFFICE`\|`DRIVER` ± tenant) | `HRM-CTR-TPL-PACK-MISMATCH` / pack-invalid |
| **BR-CTR-TPL-DYN-05** | Starter `XEVN_*_OFFICE` / `*_DRIVER` | Keep pack matrix for those codes when present | Same as SPEC §2.1 |
| **BR-CTR-TPL-DYN-06** | Print issue | Freeze whatever `template_code` was selected (any active row) | F5 keeps code |
| **BR-CTR-TPL-DYN-07** | Alias Excel sheets | Do **not** auto-create `HĐKXĐ` / `HĐ KXĐ` as separate starter codes | AC-CTR-XEVN-10 keep (bootstrap dedupe) |
| **BR-CTR-TPL-01..07** | Prior | **Keep** (type multi-map, amend version, indefinite dates, GPLX DRIVER, orgSuffix CFG, unit scope) | Unchanged |

**SUPERSEDED rules (do not implement):**

- Closed enum of exactly 8 codes as product ceiling
- `CHK chk_hrm_ctr_tpl_xevn_code` = `code IN (8)`
- VAL-XEVN-06 reject unknown `XEVN_%`
- API/FE treat «9th» as invalid by definition

---

## 3. Acceptance criteria (U65 — browser)

> Probe/API alone **không** 🟢. Zero-seed. FE sau 2xx + F5.

### 3.1 REVISED existing

| Mã | Đạt khi (CORR) | Không đạt khi |
|----|----------------|---------------|
| **AC-CTR-XEVN-01** | Settings list load từ API open catalog; **starter 8** có thể hiện sau bootstrap/ensure (nếu chạy); **không** hardcode FE 8 mã; HR **được** thấy >8 sau khi thêm | FE list cứng 8 · API/DB chặn thêm · seed body để «đủ 8» |
| **AC-CTR-XEVN-02..09** | Giữ hành vi starter / pack / GPLX / duration / unit / UF-02 (SPEC-01) | Regression starter hoặc registry |
| **AC-CTR-XEVN-10** | Bootstrap/UI SoT **không** auto-sinh mã riêng cho sheet alias `HĐKXĐ` / `HĐ KXĐ` | Auto-duplicate alias = 2 starter KXĐ DRIVER |

### 3.2 ADD — dynamic 9th (sponsor lock)

| Mã | Đạt khi | Không đạt khi |
|----|---------|----------------|
| **AC-CTR-XEVN-11** | Settings → **Tạo mẫu** với `template_code` **thứ 9** (vd. `XEVN_CUSTOM_OFFICE_01` hoặc mã HR đặt) + pack ∈ configured + metadata tối thiểu → Network **2xx** → list hiện row mới → **F5** còn row → trên tạo HĐ / preview **chọn được** mã 9 → preview bind đúng pack/title (theo cấu hình) → F5 còn `template_code` nếu đã gắn | API/DB `CODE-INVALID` vì «không thuộc 8» · FE không hiện mã 9 · preview chỉ enum cứng · mất sau F5 |

**J-* đề xuất (ba-docs / journey):** giữ `J-HRM-CTR-04..06`; **ADD** `J-HRM-CTR-07` — Settings tạo mẫu 9+ → picker HĐ → preview (U65).

---

## 4. VAL / error taxonomy CORRECTION

| ID | Prior | CORR |
|----|-------|------|
| **VAL-XEVN-06** | Block `XEVN_%` not in 8-set → `HRM-CTR-TPL-CODE-INVALID` | **SUPERSEDED** — chỉ reject **format/slug invalid** hoặc reserved conflict policy (nếu có); **không** closed set |
| **VAL-XEVN-07** | Soft warn active ≠ 8 | Soft warn **missing starter** (optional CTA bootstrap) — **cấm** hard block thêm mẫu |
| **VAL-XEVN-05** | Pack mismatch OFFICE↔DRIVER on starter codes | **Keep** for starter matrix; for custom codes: pack must ∈ configured packs |
| **`HRM-CTR-TPL-CODE-INVALID`** | Unknown / forbidden 9th | **REVISED**: invalid **format** / empty / illegal charset only — **not** «not in starter 8» |
| **CHK `chk_hrm_ctr_tpl_xevn_code`** | `IN (8)` | **REMOVE / FORBIDDEN to ship** |

Keep VAL-XEVN-01..04, 08..10 (GPLX, term, registry nullable, unit remesh, scope_parity).

---

## 5. Artifact patch checklist (this wave)

| Artifact | Action |
|----------|--------|
| [`…-DYNAMIC-LOCK.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DYNAMIC-LOCK.md) | Already authoritative lock |
| [`…-SPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-SPEC-01.md) | APPEND `@CHANGE` CORR-01 |
| [`…-DATA-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-DATA-01.md) | APPEND `@CHANGE` — remove FORBIDDEN 9th · remove CHK IN 8 |
| [`…-API-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-API-01.md) | APPEND `@CHANGE` — open upsert · revise CODE-INVALID |
| [`…-TECHSPEC-01.md`](./PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-TECHSPEC-01.md) | APPEND `@CHANGE` — Option A = open catalog + starter, not closed CHECK enum |
| Evidence | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-corr-01.md` |

**Client SRS / API_DESIGN enterprise:** residual **sa / ba-docs DOC-DELTA** pointer (FR-09d wording «8 mẫu» → «catalog động + starter 8») — **no wipe**; printable still false.

---

## 6. FR-09d Diễn biến delta (draft for ba-docs)

| # | Prior | CORR |
|---|-------|------|
| 1 | Form + danh sách **8** mẫu | Form + danh sách mẫu **active từ catalog** (gồm starter + HR-added) |
| — | — | Settings: tạo/sửa mẫu 9+ (AC-CTR-XEVN-11) trước hoặc song song |

must_keep CORE-09a/b/c · UF-HRM-02.

---

## 7. Honesty & residual

| Flag | Value |
|------|-------|
| `contracts_printable_ready` | **false** |
| Closed enum on SoT | **SUPERSEDED** by this CORR |
| Residual | **sa** quick DOC-DELTA TECH/API pointers if needed · **dev-be** already re-dispatched dynamic · **dev-fe** Settings CRUD 9+ · QA AC-CTR-XEVN-11 U65 |
| This seat | docs only — **cấm** `apps/**` · **cấm** claim printable ready |

---

## 8. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | See evidence |
| **next_owner** | **pm** → **sa** (optional DOC-DELTA) · BE dynamic in flight |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-corr-01.md` |
