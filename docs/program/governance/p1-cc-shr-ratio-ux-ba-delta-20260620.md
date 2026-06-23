# P1-CC-SHR-RATIO-UX-01-BA — Delta AC/BR: Cổ đông `ratio_percent` vs `contributed_value`

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-CC-SHR-RATIO-UX-01-BA` |
| **from_role** | ba-process |
| **to_role** | pm → dev-fe (`P1-CC-SHR-RATIO-UX-01-FE`) |
| **lane** | governance |
| **incident** | Sponsor — nhập tỉ lệ cổ phần bị FE tự tính số tiền góp vốn; không yêu cầu |
| **ack_status** | **PASS_TO_PM** |
| **generated** | 2026-06-20 |

---

## 1. Mục tiêu phân tích

Xác định **SoT nghiệp vụ** cho hai trường cổ đông trên Command Center (tab Cổ đông, form Thiết lập công ty): `ratio_percent` và `contributed_value` — **độc lập** hay **phụ thuộc** `charterCapital`.

---

## 2. Spec says (SoT)

### 2.1 SRS — UC-CC-P0-01

**spec_ref:** `docs/xbos/COMMAND_CENTER_P0_SRS.md` § UC-CC-P0-01 (L38–76)

| Khía cạnh | Nội dung SoT |
|-----------|--------------|
| Happy path | User nhập dòng cổ đông → Submit (✓) → `POST …/shareholders` → reload list |
| Alternate | Sửa dòng đã lưu → `PUT …/shareholders/:id` |
| Exception | `holderName` thiếu → `XBOS-SHR-400`; `ratioPercent` ∉ [0,100] → `XBOS-SHR-400` |
| Data — `ratio_percent` | 0–100 numeric (XBOS validate) |
| Data — `contributed_value` | `>= 0` (XBOS validate) |
| Công thức | **Không có** quy tắc `contributed_value = charterCapital × ratio_percent / 100` |
| Liên kết vốn điều lệ | **Không** mô tả auto-fill từ `charterCapital` form pháp nhân |

**Kết luận SRS:** Hai trường là **input độc lập** do user nhập; BE lưu đúng giá trị gửi lên.

### 2.2 TechSpec — schema & API

**spec_ref:** `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §2 `xbos_legal_entity_shareholder` (L20–33), §4 Legal entity profile (L77–84), §5 `legalEntityProfileApi.ts` (L125–131)

| Artifact | Quy định |
|----------|----------|
| DB `ratio_percent` | `NUMERIC(5,2)` — cột riêng |
| DB `contributed_value` | `NUMERIC(18,2)` — cột riêng |
| POST/PUT body | Cả `ratioPercent` và `contributedValue` optional trong payload; không có derived field |
| FE integration | `legalEntityProfileApi.ts` map thẳng `ratioPercent` / `contributedValue` → API |

### 2.3 BE implementation (align spec)

**spec_ref:** `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.service.ts` L75–137

- `createShareholder`: validate `ratioPercent` ∈ [0,100]; persist `contributedValue` từ body (`Number(body.contributedValue ?? 0)`).
- `updateShareholder`: `COALESCE` từng field — **không** tính lại từ vốn điều lệ.
- **Không** có cross-field formula server-side.

---

## 3. Code does (FE — lệch spec)

**spec_ref:** `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`

### 3.1 Auto-calc khi sửa tỉ lệ (unsolicited business logic)

```3711:3722:apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx
  function updateShareholderRow(id: string, key: keyof ShareholderRow, value: string | number | boolean) {
    setShareholderRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [key]: value } as ShareholderRow;
        if (key === 'ratioPercent' || key === 'contributedValue') {
          const ratio = Number(key === 'ratioPercent' ? value : row.ratioPercent);
          next.contributedValue = Math.round((Number(companyForm.charterCapital) * ratio) / 100);
        }
        return next;
      }),
    );
  }
```

**Hành vi:** Mỗi lần user sửa `ratioPercent` (hoặc thậm chí chạm nhánh `contributedValue`) → FE **ghi đè** `contributedValue = round(charterCapital × ratio / 100)`.

### 3.2 Trường số tiền góp vốn read-only

```4884:4889:apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx
                          <td className="px-3 py-2">
                            <input
                              value={row.contributedValue.toLocaleString('vi-VN')}
                              readOnly
                              className="w-full rounded-input border border-xevn-border bg-slate-50 px-2 py-1"
                            />
```

**Hành vi:** User **không thể** nhập `contributed_value` trực tiếp — mâu thuẫn SRS (input độc lập).

### 3.3 Mock fallback (chỉ demo — không phải SoT)

L2529–2530: seed mock `contributedValue: Math.round((500000000000 * 40) / 100)` — pattern giống auto-calc nhưng chỉ khi API fail; **không** biện minh formula cho production UX.

---

## 4. Spec vs code — verdict

| # | Spec says | Code does | Gap |
|---|-----------|-----------|-----|
| G1 | `ratio_percent` user-editable | Editable | — |
| G2 | `contributed_value` user-editable, `>= 0` | **readOnly** + auto từ charter×ratio | **P0 spec_gap** |
| G3 | Không công thức charter×ratio | FE `updateShareholderRow` áp công thức | **P0 unsolicited logic** |
| G4 | POST/PUT gửi giá trị user nhập | POST gửi `contributedValue` đã bị FE ghi đè | **Data integrity vs ý user** |
| G5 | BE lưu độc lập | BE đúng spec; lỗi nằm ở FE | Fix FE only |

**Root cause (layer):** `dev-fe` — giả định nghiệp vụ kế toán pháp nhân **không** có trong SRS/TechSpec P0. Sponsor **không** yêu cầu (incident U61).

---

## 5. Business rule delta (BR-SHR-*)

| Rule ID | Condition | Action | Outcome | spec_ref |
|---------|-----------|--------|---------|----------|
| **BR-SHR-01** | User mở tab Cổ đông (UC-CC-P0-01) | Hiển thị cột **Tỉ lệ %** và **Giá trị góp vốn** | Cả hai là input số có thể sửa (trừ dòng đã submit-only theo UX hiện tại) | `COMMAND_CENTER_P0_SRS.md` § Data |
| **BR-SHR-02** | User nhập `ratio_percent` | FE **chỉ** cập nhật state `ratioPercent` | `contributed_value` **không đổi** trừ khi user sửa cột đó | Delta — cấm auto-calc |
| **BR-SHR-03** | User nhập `contributed_value` | FE validate `>= 0` (client) trước submit | BE `XBOS-SHR-400` nếu âm (future); hiện BE nhận `>= 0` | SRS § Exception (mở rộng client) |
| **BR-SHR-04** | User submit (✓) | `POST/PUT` payload gồm **cả hai** giá trị user nhập | GET sau save trả đúng cặp đã lưu | UC-CC-P0-01 Happy |
| **BR-SHR-05** | `charterCapital` form pháp nhân thay đổi | **Không** cascade recalc hàng cổ đông | Tránh side-effect ngoài spec | Delta — cấm |
| **BR-SHR-06** | Tổng `ratio_percent` ≠ 100% | **Không** chặn save P0 (SRS không yêu cầu) | Cảnh báo optional **out of scope** wave này | — |

---

## 6. Acceptance criteria delta (AC-SHR-*)

| AC ID | Given | When | Then (PASS) | Then (FAIL) | Test evidence |
|-------|-------|------|-------------|-------------|---------------|
| **AC-SHR-01** | Holding root, `charterCapital = 500_000_000_000`, dòng cổ đông mới | Nhập `ratioPercent=40`, **không** sửa contributed | Ô contributed **giữ** giá trị user đặt (vd. `0` hoặc `123_456_789`); **không** tự thành `200_000_000_000` | Contributed auto = charter×40% | Manual CC tab Cổ đông; hoặc unit test `updateShareholderRow` |
| **AC-SHR-02** | Cùng màn | Nhập trực tiếp `contributedValue=99_000_000` | Input **editable**; submit POST body `contributedValue: 99000000` | Input readOnly hoặc bị ghi đè | Network tab + GET reload |
| **AC-SHR-03** | Dòng đã POST 201 | F5 trang | GET list trả đúng `ratio_percent` + `contributed_value` đã lưu | Lệch sau F5 | UF-XBOS-04/05 F5 probe |
| **AC-SHR-04** | Member unit XE_DU_LICH | Thêm cổ đông + ✓ | POST 201 `XBOS-SHR-201`; không regression path entity | 404/409/silent fail | **UF-XBOS-04** 🟢 regression |
| **AC-SHR-05** | TẬP ĐOÀN holding UUID | Thêm cổ đông + ✓ | POST `…/legal-entities/{uuid}/shareholders` 201 | UI-id `xbos-group-holding-root` 404 | **UF-XBOS-05** 🟢 regression |
| **AC-SHR-06** | `ratioPercent=150` | Submit | Toast/`XBOS-SHR-400` | Save thành công | API contract unchanged |

---

## 7. Cờ regression — UF 🟢 (cấm đè)

| UF ID | Mô tả | Trạng thái | Guard cho wave FE |
|-------|-------|------------|-------------------|
| **UF-XBOS-04** | Thêm cổ đông — **đơn vị thành viên** | 🟢 | AC-SHR-04 — POST member entity 201 + F5 persist |
| **UF-XBOS-05** | Thêm cổ đông — **TẬP ĐOÀN holding** | 🟢 | AC-SHR-05 — UUID POST 201; không break `resolveLegalProfileScope` |

**Quy tắc U-SRS-FIRST:** Chỉ sửa `updateShareholderRow` + input contributed; **không** refactor holding UUID resolver / submit pipeline đã 🟢.

**Evidence regression baseline:** `docs/qa/evidence/p1-web-acceptance-close-01-r3-20260620.md`, `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` L48–49.

---

## 8. Handoff dev-fe (`P1-CC-SHR-RATIO-UX-01-FE`)

### Entry criteria
- BA delta này `ack_status=PASS_TO_PM` (done).

### Exit criteria (copy-ready)
1. Xóa công thức `charterCapital × ratio / 100` trong `updateShareholderRow` (`CommandCenterPage.tsx` ~L3716–3718).
2. Bỏ `readOnly` ô contributed; cho phép nhập số (pattern giống `ratioPercent` hoặc currency input hiện có).
3. Submit vẫn gửi `{ ratioPercent, contributedValue }` qua `legalEntityProfileApi.ts` — không đổi contract API.
4. Regression: **UF-XBOS-04**, **UF-XBOS-05** — POST 201 + F5 persist.
5. Evidence: `docs/qa/evidence/p1-cc-shr-ratio-ux-fe-20260620.md`; `ack_status=READY_FOR_QA`.

### Files in scope
| File | Change |
|------|--------|
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | `updateShareholderRow`, contributed `<input>` |
| (optional) unit test | Assert no auto-calc on ratio change |

### Out of scope
- Sum ratio = 100% validation
- Link contributed ↔ charterCapital advisory UI
- BE schema/API changes

---

## 9. Handoff QA

Retest sau FE:
- **AC-SHR-01..03** manual trên CC → Cài đặt → TẬP ĐOÀN / member → Cổ đông
- **AC-SHR-04..05** = replay UF-XBOS-04/05 probe hoặc `scripts/tmp-user-flow-e2e-audit-01.mjs`
- Account: `ceo@xe.vn` / `Xevn@2026`

---

## 10. Open risks / clarifications

| ID | Risk | Owner | Trigger reopen |
|----|------|-------|----------------|
| R-SHR-01 | Sponsor sau này **muốn** auto-calc có toggle | PM + sponsor | CR mới — **không** implement trong P1-CC-SHR-RATIO-UX-01 |
| R-SHR-02 | Tổng tỉ lệ ≠ 100% gây báo cáo sai | BA-P future | Phase 2 warning UX |
| R-SHR-03 | Mock fallback L2529 vẫn dùng formula demo | dev-fe low | Chỉ khi user báo confuse offline mode |

**Không có câu hỏi mở chặn dev-fe** — SRS đủ rõ: independent fields.

---

## 11. Traceability

| Requirement | Implementation target | Test |
|-------------|----------------------|------|
| UC-CC-P0-01 | `CommandCenterPage.tsx` shareholder table | AC-SHR-01..06 |
| UF-XBOS-04 | member POST path | AC-SHR-04 |
| UF-XBOS-05 | holding UUID POST | AC-SHR-05 |
| `legal-entity-profile.service.ts` | No change | Existing jest/API |

---

**ack_status:** **PASS_TO_PM**  
**next_owner:** pm → dev-fe (`P1-CC-SHR-RATIO-UX-01-FE`)  
**evidence_path:** `docs/program/governance/p1-cc-shr-ratio-ux-ba-delta-20260620.md`
