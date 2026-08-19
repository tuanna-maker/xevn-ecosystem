# Menu TC Pack — `XBOS-LOGIN` · Portal đăng nhập → Command Center shell

| Meta | Value |
|------|--------|
| **menu_id** | `XBOS-LOGIN` |
| **surface** | `xbos-cc` |
| **route(s)** | `/login` → `/command-center` (default) · `?redirect=` deep return |
| **HDSD** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` row 1 · `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 UF-XBOS-01 |
| **SRS / FR / UC** | `docs/xbos/TECHSPEC.md` §14.1 **FR-XBOS-AUTH-01** · §14.2 **FR-XBOS-TENANT-01** · UC-XBOS-AUTH-01 · UC-XBOS-TENANT-01 |
| **TechSpec** | `docs/xbos/TECHSPEC.md` §5 Platform auth · OpenAPI `xbosAuthLogin` · `xbosAuthSelectMembership` |
| **API_CONTRACT** | `POST /api/xbos/auth/login` → **201** envelope `XBOS-AUTH-200` · `GET /api/xbos/auth/me` · `POST /api/xbos/auth/select-membership` → **201** `XBOS-AUTH-201` |
| **UF / J-*** | **UF-XBOS-01** · **J-CC-01** · pointer **UF-XBOS-11** (member CEO — không nhân bản matrix scope tại đây) |
| **author** | qa · PO-ECO-TC-XBOS-LOGIN-01 |
| **work_item_id** | `PO-ECO-TC-XBOS-LOGIN-01` |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean · **U65** precond execution = luồng FE (không seed) · **PLANNED** = catalog depth, không claim UAT DONE.  
> **Synth note:** Login happy-path trùng `TC-CC-HP-001` trong `XBOS-CC-HOME-KPI.md` — pack này **sở hữu** form auth + fail-deep + redirect guard; CC-HOME **sở hữu** widget/rail sau khi đã vào shell.

---

## 0. spec_read_ack

| Source | Path | Cited |
|--------|------|--------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` | DoD §2 |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` | Structure |
| FE inventory | `LoginPage.tsx` · `RequireAuth.tsx` · `AuthContext.tsx` · `authSession.ts` · `ExecutiveDashboardLayout.tsx` · `TopHeader.tsx` |
| BE contract (read-only) | `apps/api/xbos-api/src/auth/auth.service.ts` | XBOS-AUTH-401/403 semantics |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 UF-XBOS-01 |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` J-CC-01 |
| Physical auth | `docs/xbos/TECHSPEC.md` §14.1–14.2 · U71 `API_DESIGN_XBOS_AUTH_TENANT.md` (pointer) |

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States |
|-----------|------|-----------------|-------|--------|
| **SCR-LOGIN** | page | `/login` | Form Email/Mật khẩu · brand shell XeVN | default · busy · error banner |
| **SCR-REQ-LOADING** | gate | Protected route while `AuthContext.loading` | «Đang tải phiên…» full viewport | loading |
| **SCR-CC-SHELL** | shell | `/command-center` post-login | `ExecutiveDashboardLayout` + `TopHeader` + CC home outlet | success · partial API fail (banner) |
| **SCR-LOGIN-REDIRECT** | page | `/login?redirect=/command-center/hrm/...` | Same form; safe path only | query valid/invalid |
| **DLG-MEMBERSHIP** | dropdown | TopHeader `portal-membership-switcher` | Chọn tenant khi `tenants.length > 1` | open · switching · switch error banner |
| **SCR-MEMBERSHIP-STATIC** | chip | TopHeader `portal-membership-static` | Một membership — không dropdown | ready |
| **DLG-PROFILE** | dropdown | TopHeader avatar/profile | Đăng xuất · (links stub) | open |
| **SCR-401-RETURN** | redirect | API **401** on protected page | Stash path → `/login?redirect=…` | session cleared |

**Đếm:** pages=4 · shell=1 · dialogs/dropdowns=2 → **screens=8**

---

## 2. Field dictionary (đủ mọi trường — form login + shell entry)

### 2.1 SCR-LOGIN (form)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB | format | notes |
|----------|---------------|-----------|---------|----------|-----------------|----------|--------|-------|
| **LGN-FLD-BRAND-IMG** | (logo alt XeVN) | SCR-LOGIN | img `/xevn-logo.png` | — | — | — | — | 64×64 card |
| **LGN-FLD-TITLE** | XeVN Portal | SCR-LOGIN | h1 display | — | — | — | — | xevn-type-title |
| **LGN-FLD-SUBTITLE** | Đăng nhập tập đoàn / công ty thành viên | SCR-LOGIN | p | — | — | — | — | |
| **LGN-FLD-EMAIL** | Email | SCR-LOGIN | `input type=email` | **Y** | HTML5 email · FE trim+lower on submit | `POST login` body `email` | email | `autoComplete=username` |
| **LGN-FLD-PASSWORD** | Mật khẩu | SCR-LOGIN | `input type=password` | **Y** | HTML5 required | body `password` | plain (masked UI) | `autoComplete=current-password` |
| **LGN-FLD-ERROR** | (message) | SCR-LOGIN | `role=alert` rose banner | — | BE `json.message` or fallback «Đăng nhập thất bại» | 401/403/4xx | VI text | cleared on retry |
| **LGN-FLD-SUBMIT** | Đăng nhập / Đang đăng nhập… | SCR-LOGIN | button submit | — | disabled when `busy` | triggers login | — | primary CTA |
| **LGN-FLD-DEV-HINT** | Dev: du-lich.ceo@xe.vn / Xevn@2026 | SCR-LOGIN | footer mono | — | informational only | — | — | not production AC |

### 2.2 SCR-REQ-LOADING

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| **LGN-FLD-SESSION-LOAD** | Đang tải phiên… | SCR-REQ-LOADING | text center | — | until token/me resolved | `GET /auth/me` optional | RequireAuth |

### 2.3 SCR-CC-SHELL (success land — UF-XBOS-01 minimum)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| **SHL-FLD-BRAND-MARK** | XeVN — về Command Center | SCR-CC-SHELL | Link `data-testid=portal-brand-mark` | — | visible on CC path | — | success marker |
| **SHL-FLD-MEMBERSHIP-LABEL** | Membership đang làm việc | SCR-CC-SHELL / DLG | text in chip | — | `tenant_label` from BE | login memberships | no raw slug invent |
| **SHL-FLD-COMPANY-ROLE** | {company} · {role} | SCR-CC-SHELL | truncated subtitle | — | `company_label` · `role_label` | display-ready | fallback «—» |
| **SHL-FLD-CC-HOME-TITLE** | Command Center (subtitle) | SCR-CC-SHELL | CC page chrome | — | persona header optional | — | xref CC-HOME pack |
| **SHL-FLD-SWITCH-ERR** | (switch error) | SCR-CC-SHELL | red banner | — | select-membership fail | POST select **403** | TopHeader |

### 2.4 DLG-MEMBERSHIP (multi-tenant — FR-XBOS-TENANT-01)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----|-------|
| **MEM-FLD-LIST-TITLE** | Tenant được gán (membership) | DLG-MEMBERSHIP | section label | — | one row per membership | login `memberships[]` | |
| **MEM-FLD-ROW-TENANT** | (tenant_label) | DLG-MEMBERSHIP | button row | — | Check icon on active | | Building2 icon |
| **MEM-FLD-ROW-META** | company · kind · role | DLG-MEMBERSHIP | subtitle | — | BE labels | | |
| **MEM-FLD-FOOTER-COUNTS** | N tenant thành viên · M tổng | DLG-MEMBERSHIP | footer | — | counts from list | — | |

**Đếm fields:** 18

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes / UI | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|-----------------|------|
| **LGN-FN-SUBMIT** | Đăng nhập | SCR-LOGIN | logged out · xbos-api up | `POST /api/xbos/auth/login` **201** `XBOS-AUTH-200` | JWT stored; navigate `from`; CC shell | **401** `XBOS-AUTH-401` · **403** no tenant | UF-01 · J-CC-01 |
| **LGN-FN-BUSY** | (submit) | SCR-LOGIN | double-click guard | — | label «Đang đăng nhập…»; btn disabled | — | UX |
| **LGN-FN-AUTO-SKIP** | (visit /login authed) | SCR-LOGIN | valid JWT | — | `<Navigate to={from}>` | — | |
| **LGN-FN-REDIRECT-QUERY** | (load login) | SCR-LOGIN-REDIRECT | `?redirect=/path` | — | post-login land path if safe | ignore `//` external | HRM embed return |
| **LGN-FN-REDIRECT-STATE** | RequireAuth | SCR-LOGIN | unauthed CC | — | `from` state + query | — | |
| **LGN-FN-GUARD** | RequireAuth | any protected | no token | — | redirect `/login?redirect=…` | dev bypass off on CC | UC-ECO-SCOPE-01 |
| **LGN-FN-SESSION-RESTORE** | (app boot) | SCR-REQ-LOADING | stored token | `GET /api/xbos/auth/me` **200** | skip login form | **401** → stash + login | |
| **LGN-FN-401-STASH** | handleUnauthorized | any API | 401 | — | clear session; login with redirect | not on 403 scope | authSession |
| **LGN-FN-PERSIST-F5** | (F5 CC) | SCR-CC-SHELL | after login | me optional | still on CC; header visible | expired → login | J-CC-01 |
| **MEM-FN-SWITCH** | Chọn tenant row | DLG-MEMBERSHIP | >1 tenant · ready scope | `POST …/auth/select-membership` **201** `XBOS-AUTH-201` | new JWT; chip updates; F5 keeps | **403** banner | FR-TENANT-01 |
| **MEM-FN-STATIC** | (single tenant) | SCR-MEMBERSHIP-STATIC | 1 membership | — | static chip shown | — | |
| **PRF-FN-LOGOUT** | Đăng xuất | DLG-PROFILE | logged in | — | clear storage; `/login` | — | SSO HRM xref |

**Đếm functions:** 12

---

## 4. Test case matrix (chi tiết)

**Persona mặc định (Group CEO):** `ceo@xe.vn` / `Xevn@2026` · base URL `:8088` hoặc `:5173`.

**Quy ước TC-ID:** `TC-LGN-{HP|FD|BD|AU|UX|API|UNIT|REG}-{nnn}`

### 4.1 Happy path — UF-XBOS-01 · J-CC-01

| TC-ID | Type | Covers | Persona | Precond | Steps (HDSD) | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|--------------|----------|-------|------|--------|
| TC-LGN-HP-001 | HP | LGN-FN-SUBMIT · UF-01 | Group CEO | logged out · L0 stack | Mở `/login` → giữ/xóa dev default → **Đăng nhập** | Network **POST login 201** · code `XBOS-AUTH-200`; URL `/command-center`; **SHL-FLD-BRAND-MARK** visible; không Vite overlay | UI | MANUAL | PLANNED |
| TC-LGN-HP-002 | HP | SCR-CC-SHELL minimum | ceo@xe.vn | TC-LGN-HP-001 | Quan sát TopHeader + CC home mount | **Command Center** workspace (rail hoặc widgets); không banner auth lỗi | UI | MANUAL | PLANNED |
| TC-LGN-HP-003 | HP | LGN-FN-PERSIST-F5 · J-CC-01 | ceo@xe.vn | on CC | F5 | Vẫn authenticated; CC shell; không quay `/login` | UI | MANUAL | PLANNED |
| TC-LGN-HP-004 | HP | LGN-FN-REDIRECT-QUERY | ceo@xe.vn | logged out | Mở `/login?redirect=%2Fcommand-center%2Finbox` → login OK | Land `/command-center/inbox` (hoặc equivalent inbox route) | UI | MANUAL | PLANNED |
| TC-LGN-HP-005 | HP | LGN-FN-AUTO-SKIP | ceo@xe.vn | valid session | Navigate `/login` | Immediate redirect to default `/command-center` | UI | MANUAL | PLANNED |
| TC-LGN-HP-006 | HP | MEM-FN-STATIC or MEM-FN-SWITCH | ceo@xe.vn | multi membership if data | After login observe chip | `portal-membership-static` **or** `portal-membership-switcher`; labels VI not raw tenantId | UI | MANUAL | PLANNED |

### 4.2 Fail-deep auth (nghiệp vụ sâu — không chỉ «sai mật khẩu»)

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-LGN-FD-001 | FD | LGN-FLD-PASSWORD · LGN-FN-SUBMIT | any | logged out | Email đúng · password sai → **Đăng nhập** | **401** `XBOS-AUTH-401`; message «Email hoặc mật khẩu không đúng» (or BE equivalent); **LGN-FLD-ERROR**; stay `/login`; no JWT | UI/API | MANUAL | PLANNED |
| TC-LGN-FD-002 | FD | inactive / unknown email | any | logged out | Email không tồn tại hoặc inactive | **401** same message as FD-001 (no user enumeration) | UI/API | MANUAL | PLANNED |
| TC-LGN-FD-003 | FD | LGN-FLD-EMAIL empty | any | logged out | Xóa email → submit | HTML5 **required** blocks submit; no POST | UI | MANUAL | PLANNED |
| TC-LGN-FD-004 | FD | LGN-FLD-PASSWORD empty | any | logged out | Xóa password → submit | HTML5 **required** blocks submit | UI | MANUAL | PLANNED |
| TC-LGN-FD-005 | BD | LGN-FLD-EMAIL format | any | logged out | Nhập `not-an-email` → submit | Browser `type=email` validation fail | UI | MANUAL | PLANNED |
| TC-LGN-FD-006 | FD | no tenant membership | account w/o membership | logged out | Valid creds but **403** path | **403** `XBOS-AUTH-403` «Tài khoản chưa được gán tenant»; error banner; no CC | UI/API | MANUAL | PLANNED |
| TC-LGN-FD-007 | FD | xbos-api down | any | API refused | Submit login | **LGN-FLD-ERROR** «Đăng nhập thất bại» or network message; stay login | UI | MANUAL | PLANNED |
| TC-LGN-FD-008 | FD | LGN-FN-BUSY | any | slow API | Double-click **Đăng nhập** | Button disabled; single POST in Network | UI | MANUAL | PLANNED |
| TC-LGN-FD-009 | FD | MEM-FN-SWITCH | ceo@xe.vn | >1 tenant | Open picker → select invalid/disabled tenant (if reproducible) | **403** select-membership; **SHL-FLD-SWITCH-ERR**; JWT unchanged | UI/API | MANUAL | PLANNED |
| TC-LGN-FD-010 | FD | LGN-FN-401-STASH | ceo@xe.vn | session on CC | Expire/revoke token → trigger protected GET **401** | Redirect login; `redirect` query preserves path; stash consumed once | UI | MANUAL | PLANNED |

### 4.3 Guard · redirect safety · scope pointer

| TC-ID | Type | Covers | Persona | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|---------|-------|----------|-------|------|--------|
| TC-LGN-AU-001 | AU | LGN-FN-GUARD | anonymous | no JWT | Open `/command-center` direct | Redirect `/login?redirect=%2Fcommand-center` | UI | MANUAL | PLANNED |
| TC-LGN-AU-002 | AU | LGN-FN-REDIRECT-QUERY safe | any | logged out | `/login?redirect=//evil.com` | After login land **default** `/command-center` (unsafe path rejected) | UI | MANUAL | PLANNED |
| TC-LGN-AU-003 | AU | UF-XBOS-11 pointer | `du-lich.ceo@xe.vn` | member CEO | Login → CC | **201** login OK; CC loads; rollup/group endpoints may **403/409** — full matrix in UF-11 pack (`TC-AU-PTR-001`) | UI | MANUAL | PLANNED |
| TC-LGN-AU-004 | AU | allowDevBypass | dev only | `VITE_REQUIRE_LOGIN` | CC path never bypass when protected | No anonymous CC on pilot routes | REG | MANUAL | PLANNED |

### 4.4 UX · accessibility · regression

| TC-ID | Type | Covers | Precond | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|---------|-------|----------|-------|------|--------|
| TC-LGN-UX-001 | UX | LGN-FLD-ERROR a11y | after FD-001 | Inspect error | `role=alert` readable; contrast rose banner | UI | MANUAL | PLANNED |
| TC-LGN-UX-002 | UX | LGN-FLD-SUBMIT busy | slow network | Observe label | «Đang đăng nhập…» during request | UI | MANUAL | PLANNED |
| TC-LGN-UX-003 | UX | Email trim/lower | mixed case email | Login success | POST body email lowercase trimmed | UI/API | MANUAL | PLANNED |
| TC-LGN-REG-001 | REG | Prior UF-01 🟢 | ceo@xe.vn | Repeat Wave1 click path | Same as TC-LGN-HP-001..003; no regression vs matrix Dev8088 | UI | MANUAL | PLANNED |

### 4.5 API / unit automate hints

| TC-ID | Type | Covers | Steps | Expected | Layer | Auto | Status |
|-------|------|--------|-------|----------|-------|------|--------|
| TC-LGN-API-001 | API | login contract | `POST /api/xbos/auth/login` valid body | **201** · `success:true` · `accessToken` · `memberships[]` labels | API | AUTOMATED | PLANNED |
| TC-LGN-API-002 | API | login fail | wrong password | **401** · `XBOS-AUTH-401` | API | AUTOMATED | PLANNED |
| TC-LGN-UNIT-001 | UNIT | safeRedirectPath | jest on login redirect helper | reject `//` and empty | UNIT | AUTOMATED | PLANNED |
| TC-LGN-UNIT-002 | UNIT | authSession 401 stash | `authSession.test.ts` | stash path on 401 | UNIT | AUTOMATED | PLANNED |
| TC-LGN-UNIT-003 | UNIT | normalizePortalMembership | authSession tests | missing labels → «—» | UNIT | AUTOMATED | PLANNED |

**Coverage check (bắt buộc):**

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | 12 | 12 | 0 |
| Functions mutate với ≥1 FD | 2 (submit · switch) | 2 | 0 |
| Required fields với ≥1 FD/BD | 2 (email · password) | 4 TC | 0 |
| Login fail-deep (≥5 distinct BR) | ≥5 | 10 FD/AU rows | 0 |
| Success land CC shell | ≥1 | HP-001..002 | 0 |

**Tổng TC:** 28 (all **PLANNED**)

---

## 5. Traceability

| TC-ID | SRS / Diễn biến | TechSpec | API | HDSD |
|-------|-----------------|----------|-----|------|
| TC-LGN-HP-001..003 | FR-XBOS-AUTH-01 · UC-XBOS-AUTH-01 bước 1 | §14.1 | POST login | P1 Wave1 row 1 |
| TC-LGN-HP-006 · TC-LGN-FD-009 | FR-XBOS-TENANT-01 · UC-XBOS-TENANT-01 bước 2 | §14.2 | select-membership | Matrix UF-01 |
| TC-LGN-AU-003 | FR-ECO-SCOPE-02 | §14.3 | scope endpoints | UF-XBOS-11 pointer |
| TC-LGN-AU-001 | UC-ECO-SCOPE-01 | RequireAuth | — | Protected routes |
| TC-LGN-REG-001 | UF-XBOS-01 matrix 🟢 | — | — | evidence Wave1 |

---

## 6. Out of scope / cross-pack

| Item | Owner pack | Reason |
|------|------------|--------|
| CC widgets KPI/tasks/alerts detail | `XBOS-CC-HOME-KPI.md` | Post-login home |
| Inbox approve mutate | `XBOS-INBOX-CAT.md` | UF-08 |
| Member CEO full negative matrix | UF-XBOS-11 / future AUTH-MEMBER | TC-LGN-AU-003 pointer only |
| Account lockout 5×30min | NFR residual `R-M01-LOCKOUT-COL` | No DB column — HOLD T_L1 |
| HRM embed `/hr` login bridge | HRM portalLogin | Separate surface |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-xbos-login-01.md
next_owner: qa-synth
counts: screens=8 fields=18 functions=12 tcs=28
```
