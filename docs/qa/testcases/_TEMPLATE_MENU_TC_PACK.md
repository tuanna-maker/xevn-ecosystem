# Menu TC Pack — `<MENU_ID>` · `<Tên menu VI>`

| Meta | Value |
|------|--------|
| **menu_id** | `HRM-EMPLOYEES` |
| **surface** | `hrm-web` \| `xbos-cc` \| `hrm-mobile` |
| **route(s)** | |
| **HDSD** | path + § |
| **SRS / FR / UC** | |
| **TechSpec** | |
| **API_CONTRACT** | endpoints chính |
| **UF / J-*** | |
| **author** | qa · agent_id |
| **work_item_id** | `PO-ECO-TC-…` |
| **date** | |
| **ack_status** | DRAFT \| READY_FOR_SYNTH \| PASS_TO_PM |
| **depth_gate** | Screen inventory ☑ · Field dict ☑ · Function inv ☑ · TC matrix ☑ · Trace ☑ |

> Chuẩn: IEEE 829 / ISO 29119 lean — mỗi TC quan sát được; fail-deep trước/cùng happy; không prompt-echo.

---

## 1. Screen inventory (màn + popup)

| screen_id | Loại | Route / trigger | Mô tả | States (loading/empty/error/success) |
|-----------|------|-----------------|-------|--------------------------------------|
| SCR-LIST | page | | | |
| SCR-DETAIL | page | | | |
| SCR-TAB-… | tab | | | |
| DLG-CREATE | dialog | nút … | | |
| DLG-EDIT | dialog | | | |
| DRW-… | drawer | | | |
| POP-CONFIRM | confirm | | | |
| SHT-… | sheet (mobile) | | | |

**Đếm:** pages=__ · tabs=__ · dialogs=__ · drawers=__ · confirms=__

---

## 2. Field dictionary (đủ mọi trường)

| field_id | UI label (VI) | screen_id | control | required | validation / BR | API / DB column | format (vi-VN) | notes |
|----------|---------------|-----------|---------|----------|-----------------|-----------------|----------------|-------|
| F-… | | | text/select/date/money/file/switch | Y/N | | | | |

**Đếm fields:** __ (bắt buộc liệt kê cả cột bảng list nếu user thấy)

---

## 3. Function inventory (đủ mọi function)

| fn_id | UI (nút/menu) | screen_id | precond | API METHOD path | success FE+F5 | fail codes | HDSD |
|-------|---------------|-----------|---------|-----------------|---------------|------------|------|
| FN-… | | | | | | | |

**Đếm functions:** __

---

## 4. Test case matrix (chi tiết)

### Quy ước TC-ID

`TC-<MENU>-<FN|FLD>-<nnn>` · Type: `HP` happy · `FD` fail-deep · `BD` boundary · `AU` auth/scope · `UX` state

| TC-ID | Type | Covers (fn/field) | Persona | Precond | Steps (HDSD) | Expected | Layer | Automate | Status |
|-------|------|-------------------|---------|---------|--------------|----------|-------|----------|--------|
| TC-…-HP-001 | HP | FN-… | | | 1.… 2.… | | UI | MANUAL | PLANNED |
| TC-…-FD-001 | FD | F-… / FN-… | | | | mã lỗi + UI | UI/API | | PLANNED |

**Coverage check (bắt buộc điền):**

| Check | Count required | Count in matrix | GAP |
|-------|----------------|-----------------|-----|
| Functions với ≥1 HP | = đếm §3 | | |
| Functions mutate với ≥1 FD | = mutate fns | | |
| Required fields với ≥1 FD/BD | = required fields | | |
| Popups có ≥1 open/cancel/submit TC | = dialogs | | |

---

## 5. Traceability

| TC-ID | SRS Diễn biến # | TechSpec | API | HDSD § |
|-------|-----------------|----------|-----|--------|
| | | | | |

---

## 6. Out of scope / stub

| Item | Reason | TC status |
|------|--------|-----------|
| | Phase-2 / HOLD T_L1 / … | OOS \| BLOCKED |

---

## 7. Handoff

```
ack_status: READY_FOR_SYNTH
evidence_path: docs/qa/evidence/po-eco-tc-<menu>-01.md
next_owner: qa-synth
counts: screens=N fields=N functions=N tcs=N
```
