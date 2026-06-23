# QA evidence — P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01 |
| **depends_on** | VPS `0ea889d` (`docs/ops/evidence/p1-cc-devops-member-legal-browser-deploy-20260604.md`) |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL_TO_PM** |
| **executed_at** | 2026-06-04 (retest after browser deploy) |
| **environment** | Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026` |

## Scope

L2 + **L2.5** browser save on Command Center member legal entity (not probe-only).

| Layer | Route / journey | Check |
|-------|-----------------|--------|
| L2 | **P-CC-02** | `?settings=company_member_units` loads; list ≥1 row |
| L2.5 | **J-CC-02** | List → **Chỉnh sửa** **XE_DU_LICH** → change name → **Lưu thay đổi** |
| API regression | `test:xbos:cc-member-save` | Confirm **4/4** still PASS on nip.io |

**PASS criteria (PM):** no ERROR banner; PUT `/api/xbos/org-foundation/legal-entities/{id}` **HTTP 200**; request JSON root has **`code`** (`XE_DU_LICH`) and **`name`** from form.

---

## 1) API probe — PASS (4/4)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run test:xbos:cc-member-save
```

| Step | Result |
|------|--------|
| Login | **PASS** |
| GET group-member-units | **200**, members=4 |
| PUT XE_TMDV / VISUN / XE_DU_LICH / XE_VIETNAM | **200** `XBOS-ORG-201` each |
| Reload group-member-units | **200** |
| **Exit code** | **0** (`=== 4/4 member PUT PASS ===`) |

**Conclusion:** Probe-shaped PUT on VPS remains healthy after `0ea889d` deploy.

---

## 2) Browser L2.5 — FAIL (retest post `0ea889d`)

### Click path

| Step | URL / action |
|------|----------------|
| 1 | `https://14-225-217-232.nip.io/login` → sign in `ceo@xe.vn` |
| 2 | `https://14-225-217-232.nip.io/command-center?settings=company_member_units` |
| 3 | Row **XE_DU_LICH** → **Chỉnh sửa** (CDP row click) |
| 4 | **Tên tiếng Việt** → `QA L25 browser save retest 20260604` (**Tên viết tắt** remained `XE_DU_LICH`) |
| 5 | **Lưu thay đổi** |

### UI observations

| Signal | Result |
|--------|--------|
| List load (L2) | **PASS** — 4 member rows |
| Detail preload warn | **PASS** — no *Không tải được hồ sơ…* banner on this run |
| Form heading | **PASS** — `Đơn vị thành viên - XE_DU_LICH` |
| ERROR banner after save | **FAIL** — persists (HTTP **400**) |
| Save button | **Đang lưu…** then error state |

### ERROR banner (verbatim)

```text
org-foundation.legal-entities.update failed: code must be longer than or equal to 1 characters; code must be a string; name must be longer than or equal to 1 characters; name must be a string (HTTP 400)
```

### Network — browser PUT (fetch hook, MCP)

| Field | Value |
|-------|--------|
| Method | **PUT** |
| URL | `/api/xbos/org-foundation/legal-entities/11d2bb7b-6190-4cb4-b0fe-03d43b5596b8` |
| **HTTP status** | **400** `XBOS-VAL-001` (not 200) |
| Root `code` | **`XE_DU_LICH`** (correct) |
| Root `name` | **`QA L25 browser save retest 20260604`** (correct) |

**Request body excerpt (root):**

```json
{
  "code": "XE_DU_LICH",
  "name": "QA L25 browser save retest 20260604",
  "entityType": "subsidiary",
  "taxCode": "0123456789",
  "charterCapital": 1000000000,
  "payload": {
    "companyForm": {
      "nameVi": "QA L25 browser save retest 20260604",
      "shortName": "XE_DU_LICH",
      "enterpriseCode": "0123456789",
      "entityLevel": "subsidiary"
    }
  }
}
```

**Screenshot:** `docs/qa/evidence/p1-cc-qa-member-legal-l25-save-20260604.png` (ERROR banner on form).

### Delta vs prior fail (`4e55d31` only)

| Prior (pre-`0ea889d`) | This retest (`0ea889d` + FE `46d20a3`) |
|------------------------|----------------------------------------|
| PUT **500** `reading 'code'` | PUT **400** `code`/`name` validation |
| Root `code` = edited **name** (wrong) | Root `code` = **`XE_DU_LICH`** (correct) |
| Detail GET warn banner | No warn banner |

**Conclusion:** FE normalize **improved** request shape; **BE DTO/middleware** on nip.io still rejects browser PUT despite non-empty root `code`/`name` — **L2.5 still FAIL**.

---

## Matrix / journey verdict

| ID | Verdict | Notes |
|----|---------|--------|
| **P-CC-02** | **PASS** (load) / **FAIL** (save) | Tab + list OK; save ERROR |
| **J-CC-02** | **FAIL** (L2.5) | Edit → save blocked by banner + HTTP 400 |

**L2 PASS + L2.5 FAIL → overall QA FAIL** (per U19 / business-flow gate).

---

## Root-cause hypothesis (for dispatch)

| # | Finding | Likely owner |
|---|---------|--------------|
| 1 | Validation runs on DTO instance where root `code`/`name` not mapped (middleware order or `ValidationPipe` before strip) | **dev-be** |
| 2 | Probe script sends shape that passes; browser sends extra `payload.companyForm` — regression test gap | **dev-be** + **qa** (add browser-shaped jest) |
| 3 | FE normalize deployed — not primary blocker this run | dev-fe (monitor) |

---

## Residual

| Item | Owner |
|------|--------|
| Fix `XBOS-VAL-001` on browser PUT when root `code`/`name` present | **dev-be** |
| Redeploy xbos-be to nip.io after fix | **devops** |
| Re-run **P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01** browser J-CC-02 | **qa** |

---

## References

- Deploy: `docs/ops/evidence/p1-cc-devops-member-legal-browser-deploy-20260604.md`
- Prior API QA: `docs/qa/evidence/p1-cc-qa-member-legal-save-01-20260604.md`
- FE normalize: `apps/web/web-portal/src/integrations/legalEntityPutBody.ts`

## ack_status

**FAIL_TO_PM** — probe **4/4 PASS**; browser save **FAIL** (ERROR banner, PUT **400**, root `code`/`name` present). Dispatch **dev-be** before QC.

---

# Retest @ VPS `5ae6bca` (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01 |
| **depends_on** | `docs/ops/evidence/p1-cc-devops-member-legal-browser-put-01-20260604.md` |
| **VPS HEAD** | `5ae6bca` (xbos-be validation-order fix) |
| **executed_at** | 2026-06-04 |
| **ack_status** | **FAIL_TO_PM** |

## 1) API probe — PASS (4/4)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
pnpm run test:xbos:cc-member-save
```

| Step | Result |
|------|--------|
| Login | **PASS** |
| GET group-member-units | **200**, members=4 |
| PUT XE_TMDV / VISUN / XE_DU_LICH / XE_VIETNAM | **200** `XBOS-ORG-201` each |
| Reload | **200** |
| **Exit code** | **0** |

## 2) Browser L2.5 J-CC-02 — FAIL

### Click path

| Step | Action |
|------|--------|
| 1 | Login `ceo@xe.vn` @ `https://14-225-217-232.nip.io/login` |
| 2 | `?settings=company_member_units` — list **4** member rows (L2 **PASS**) |
| 3 | Row **XE_DU_LICH** → **Chỉnh sửa** |
| 4 | **Tên tiếng Việt** → `QA L25 browser save retest 5ae6bca` (**Tên viết tắt** `XE_DU_LICH`) |
| 5 | **Lưu thay đổi** (clean retest without fetch hook also **FAIL**) |

### UI

| Signal | Result |
|--------|--------|
| Form heading | **PASS** — `Đơn vị thành viên - XE_DU_LICH` |
| ERROR banner | **FAIL** — HTTP **400** persists |
| Field hints | `Mã viết tắt (code) không hợp lệ…` / `Tên pháp nhân (name) không hợp lệ…` |

### ERROR banner (verbatim)

```text
org-foundation.legal-entities.update failed: code must be longer than or equal to 1 characters; code must be a string; name must be longer than or equal to 1 characters; name must be a string (HTTP 400)
```

### Network — browser PUT (fetch hook)

| Field | Value |
|-------|--------|
| URL | `/api/xbos/org-foundation/legal-entities/11d2bb7b-6190-4cb4-b0fe-03d43b5596b8` |
| **HTTP status** | **400** `XBOS-VAL-001` |
| Root `code` | **`XE_DU_LICH`** |
| Root `name` | **`QA L25 browser save retest 5ae6bca`** |
| `x-tenant-id` | `xe-du-lich` |
| `x-company-id` | `main` |

**Request headers (browser):** both `content-type: application/json` **and** `Content-Type: application/json` present (duplicate).

**Screenshot:** `docs/qa/evidence/p1-cc-qa-member-legal-l25-save-5ae6bca-20260604.png`

## 3) Isolation — BE `5ae6bca` OK; duplicate Content-Type breaks body parse

| Test | HTTP | Notes |
|------|------|--------|
| Node replay — exact browser JSON + JWT + headers (single `Content-Type`) | **200** `XBOS-ORG-201` | Same payload BE accepts |
| Node replay — **duplicate** `content-type` + `Content-Type` | **400** `XBOS-VAL-001` | Reproduces browser failure |
| Probe `test:xbos:cc-member-save` | **200** | No duplicate header in script |

**Root cause (QA):** Portal FE merges `buildApiAuthHeaders()` (`content-type`) with `scopeHeaders()` (`Content-Type`) → proxy/body-parser drops JSON body → ValidationPipe sees empty `code`/`name` despite client-side payload correct. **Owner: dev-fe** (`orgFoundationApi.ts` / `xbosHttp.ts` header merge). xbos-be `5ae6bca` fix is necessary but **not sufficient** until FE header dedupe + portal-fe redeploy.

## Matrix / journey verdict

| ID | Verdict | Notes |
|----|---------|--------|
| **P-CC-02** | **PASS** (load) / **FAIL** (save) | Tab + list OK |
| **J-CC-02** | **FAIL** (L2.5) | Edit → save blocked |

**L2 PASS + L2.5 FAIL → overall QA FAIL**

## Residual

| Item | Owner |
|------|--------|
| Dedupe Content-Type on XBOS fetch (single canonical header) | **dev-fe** |
| Redeploy `portal-fe` on nip.io | **devops** |
| Re-run **P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01** browser J-CC-02 | **qa** |

## ack_status (retest @ 5ae6bca)

**FAIL_TO_PM** — probe **4/4 PASS**; browser J-CC-02 **FAIL** (ERROR banner, PUT **400**); root cause **duplicate Content-Type** on FE. Dispatch **dev-fe** + **devops** (portal-fe deploy), not dev-be-only.

---

# Retest @ portal-fe `68ec457` (2026-06-04) — **PASS**

| Field | Value |
|-------|--------|
| **work_item_id** | P1-CC-QA-MEMBER-LEGAL-SAVE-L25-01 |
| **depends_on** | `docs/ops/evidence/p1-cc-devops-portal-fe-content-type-01-20260604.md` |
| **VPS HEAD** | portal-fe **`68ec457`** (`mergeRequestHeaders` — P1-CC-FE-MEMBER-LEGAL-CONTENT-TYPE-01) |
| **executed_at** | 2026-06-04 |
| **ack_status** | **PASS_TO_PM** |

## Browser L2.5 J-CC-02 — PASS

| Step | Action |
|------|--------|
| 1 | Hard refresh `https://14-225-217-232.nip.io/command-center?settings=company_member_units` (session `ceo@xe.vn`) |
| 2 | Row **XE_DU_LICH** → **Chỉnh sửa** (4th member row) |
| 3 | **Tên tiếng Việt** → `QA 68ec457 L25 network verify` (**Tên viết tắt** `XE_DU_LICH`) |
| 4 | **Lưu thay đổi** |

### UI

| Signal | Result |
|--------|--------|
| Form heading | **PASS** — `Đơn vị thành viên - XE_DU_LICH` |
| ERROR banner | **PASS** — none |
| Success | **PASS** — `Đã lưu và làm mới danh sách pháp nhân.` |

### Network — browser PUT (fetch hook, MCP)

| Field | Value |
|-------|--------|
| Method | **PUT** |
| URL | `/api/xbos/org-foundation/legal-entities/11d2bb7b-6190-4cb4-b0fe-03d43b5596b8` |
| **HTTP status** | **200** |
| **Content-Type headers** | **1** — `Content-Type: application/json` only (no duplicate `content-type`) |
| Root `code` | **`XE_DU_LICH`** |
| Root `name` | **`QA 68ec457 L25 network verify`** |

Prior save on same deploy: `QA 68ec457 pilot save OK` (first Lưu in session) — also returned to list without ERROR.

## Matrix / journey verdict

| ID | Verdict | Notes |
|----|---------|--------|
| **P-CC-02** | **PASS** | Tab load + member save |
| **J-CC-02** | **PASS** (L2.5) | List → edit **XE_DU_LICH** → Lưu → PUT **200** |

**L2 + L2.5 PASS** — ready for QC re-gate on CC member-legal slice.

## Residual (out of scope this work_item)

| Item | Owner |
|------|--------|
| GET legal-entity by id / shareholders **409** on member-only headers | **dev-be** (separate item) |

## ack_status (retest @ 68ec457)

**PASS_TO_PM** — browser J-CC-02 **PASS** after portal-fe `68ec457`; PUT **200**, single **Content-Type**, no ERROR banner. Recommend **QC** Go WITH CONDITIONS on residual GET 409 if still open.
