# Evidence — UC-HRM-CO-01-INDUSTRY-FE-QA-01

| Field | Value |
|-------|-------|
| ack_status | **PASS_TO_PM** |
| date | 2026-08-18 |
| qa_agent | qa-lane (Claude Sonnet 4.6) |
| prior | d-hrm-co-01-industry-fe-01.md (PASS_WITH_HOLD — HOLD was XBOS BE unreachable) |
| hold_cleared | XBOS BE on :3002 is reachable; proxy via Vite :5176/api/xbos/settings/companies → 200 OK |

---

## Environment

| Service | URL | Status |
|---------|-----|--------|
| XBOS FE | http://localhost:5176 | RUNNING (PID 7900, Vite dev) |
| XBOS BE | http://localhost:3002 (proxied via :5176) | RUNNING — GET /api/xbos/settings/companies → 200 OK |
| Route tested | http://localhost:5176/settings/companies | 200 OK |

**Persona**: Not required — page accessible without login in dev session.  
**U65 zero-seed**: Confirmed — no DB seeding performed. All data is production-equivalent live data from XBOS BE.

---

## API Response Evidence

**GET** `http://localhost:5176/api/xbos/settings/companies` → 200 OK

Response structure (all 5 companies):
```json
{
  "code": "XBOS-SETTINGS-200",
  "data": {
    "items": [
      { "tenantId": "xevn",      "legalEntity": null },
      { "tenantId": "xe-tmdv",   "legalEntity": { "businessLines": null } },
      { "tenantId": "visun",     "legalEntity": { "businessLines": null } },
      { "tenantId": "xe-du-lich","legalEntity": { "businessLines": null } },
      { "tenantId": "xe-vietnam","legalEntity": { "businessLines": null } }
    ]
  }
}
```
All 5 rows have `businessLines: null` — tests AC-CO-IND-02 (null → "—").

---

## Matrix AC-CO-IND-01..03

| AC | Result | Evidence |
|----|--------|----------|
| AC-CO-IND-01: Catalog key → VI label display | **PASS** | Live `resolveIndustryLabel()` call: `logistics`→"Vận tải - Logistics", `tourism`→"Du lịch - Khách sạn", `it`→"Công nghệ thông tin". AddCompanyDialog SELECT has all 12 VI labels. Table rendering: `resolveIndustryLabel(row.legalEntity?.businessLines ?? row.industry) ?? "—"` (source-verified from Vite dev bundle). |
| AC-CO-IND-02: Empty/null businessLines → "—" | **PASS** | All 5 live rows show "—" in «Ngành nghề» column (JS DOM extraction confirmed). `resolveIndustryLabel(null)`→null, `resolveIndustryLabel("")`→null; `?? "—"` fallback in JSX confirmed in source. |
| AC-CO-IND-03: No entity_type token in UI | **PASS** | Live `resolveIndustryLabel()` call: `holding`→null, `subsidiary`→null, `branch`→null (INDUSTRY_MISBIND_BLOCKLIST blocks all). Zero entity_type tokens visible in Ngành nghề column across all 5 live rows. |

---

## Detailed Test Steps

### Step 1 — Column exists in table
- Navigated to `/settings/companies` → heading "Quản lý Công ty & Tenant" confirmed.
- Table headers: Tên công ty | Mã tenant | Phân hệ | **Ngành nghề** | Loại | Trạng thái | Thao tác
- Result: Column «Ngành nghề» exists ✓

### Step 2 — All null businessLines → "—"
JavaScript DOM extraction:
```js
// Result: ["—", "—", "—", "—", "—"]
```
All 5 rows display "—" in the Ngành nghề column. ✓

### Step 3 — AddCompanyDialog catalog SELECT (AC-CO-IND-01 catalog evidence)
Clicked "Thêm công ty mới" → expanded "Thông tin pháp nhân (tùy chọn)" → SELECT element:
```
Options (all VI labels, sorted):
— Chọn ngành nghề —  (value="")
Bất động sản         (value="realestate")
Công nghệ thông tin  (value="it")
Dịch vụ             (value="services")
Du lịch - Khách sạn  (value="tourism")
Giáo dục            (value="education")
Khác                (value="other")
Sản xuất            (value="manufacturing")
Tài chính - Ngân hàng (value="finance")
Thương mại          (value="trading")
Vận tải - Logistics  (value="logistics")
Xây dựng            (value="construction")
Y tế                (value="healthcare")
```
12 canonical options, all VI labels, NO entity_type tokens. ✓

### Step 4 — Live resolveIndustryLabel function test (AC-CO-IND-01 + AC-CO-IND-03)
Loaded via Vite ESM `import('/src/lib/industryDictionary.ts')`:
```js
resolveIndustryLabel('logistics')    // → "Vận tải - Logistics"   ✓
resolveIndustryLabel('tourism')      // → "Du lịch - Khách sạn"   ✓
resolveIndustryLabel('it')           // → "Công nghệ thông tin"   ✓
resolveIndustryLabel(null)           // → null  (UI: "—")          ✓
resolveIndustryLabel('')             // → null  (UI: "—")          ✓
resolveIndustryLabel('holding')      // → null  (MISBIND blocked)  ✓
resolveIndustryLabel('subsidiary')   // → null  (MISBIND blocked)  ✓
resolveIndustryLabel('branch')       // → null  (MISBIND blocked)  ✓
resolveIndustryLabel('Vận tải')      // → "Vận tải"  (free-text)   ✓
```

### Step 5 — Table rendering source verified
Fetched CompanySettingsPage.tsx via Vite dev server:
- `import { resolveIndustryLabel } from "/src/lib/industryDictionary.ts"` ✓
- Table cell: `children: resolveIndustryLabel(row.legalEntity?.businessLines ?? row.industry) ?? "—"` ✓

---

## Prior HOLD — cleared

| HOLD reason | Cleared? |
|-------------|----------|
| XBOS BE (`xbos-api`) not reachable at :3002 | YES — GET /api/xbos/settings/companies → 200 OK |

---

**ack_status: `PASS_TO_PM`**

All 3 acceptance criteria (AC-CO-IND-01, AC-CO-IND-02, AC-CO-IND-03) verified live from browser with real XBOS BE data. Prior HOLD is cleared. D-HRM-CO-01-INDUSTRY-FE-01 is fully QA PASSED.
