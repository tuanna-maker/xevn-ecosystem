# Mobile UI — Layout Composition Audit (ILA Rubric)

**work_item_id:** `MOB-UX-16-PROGRAM`  
**owner:** PM (governance) · QA-Device (score) · Dev-Mobile (fix)  
**updated:** 2026-06-09  
**parent:** `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §3–4 · `MOBILE_APPLE_HIG_ESS_PROGRAM.md`

> Sponsor yêu cầu: **bố cục cấu phần hợp lý** phải có **căn cứ đo được**, không chỉ «đẹp hơn». Rubric **ILA** (Information Layout Audit) = chuẩn PM gate trước partner QC.

---

## 1. Thang đo ILA (0–2 mỗi tiêu chí → tối đa 20 điểm / màn)

| ID | Tiêu chí | 0 FAIL | 1 GWC | 2 PASS | Căn cứ benchmark |
|----|----------|--------|-------|--------|------------------|
| **ILA-01** | **Thứ tự thông tin** (primary trước secondary) | Nội dung phụ che task chính | Một block lệch thứ tự | Đúng F-pattern / Workday task-first | Workday Canvas «Today» |
| **ILA-02** | **Nhịp khoảng cách** (12/16/24pt) | Chip/tab sát header hoặc trống >40% viewport | 1 vùng lệch token | `groupedLayout` + DS §3 đủ | Apple grouped inset |
| **ILA-03** | **Mật độ** (không thừa trống, không nhồi) | Scroll >2× viewport cho 1 task; hoặc 1 field chiếm nửa màn | Scroll 1.2–2× hoặc trống 25–40% | Above-fold đủ task; phụ trong sheet | Personio density |
| **ILA-04** | **Nhóm cấu phần** (cùng nghiệp vụ 1 section) | Field rời rạc không card | 1 section thiếu header | ProfileSectionCard / inset group | iOS Settings |
| **ILA-05** | **Trùng chrome** | Title 2 lần (stack + in-content) | Subtitle trùng nghĩa | Single large title | HIG navigation |
| **ILA-06** | **Căn số / label** | Số to giữa ô cao | Số phải nhưng ô vẫn cao | EssStatRow label trái / số phải | Apple Settings row |
| **ILA-07** | **Copy người dùng** | Slug API / UUID / UC-* | 1 token tiếng Anh | 100% Việt + dữ liệu HRM | MOB-UX-15 |
| **ILA-08** | **Responsive 4 class** | FAIL ≥2 viewport | 1 viewport FAIL | SE/412/430/iPad PASS matrix | MOB-UX-14d |
| **ILA-09** | **Vùng ngón cái** | CTA chính trên 60% màn; tab che 3-button | CTA sát tab nhưng tap được | Sticky footer + safe inset ≥24dp | HIG thumb zone |
| **ILA-10** | **Persona** | NV/QL/LDR giống hệt | 1 khác biệt thiếu | Layout khác theo `MOBILE_PERSONA_UX_MATRIX` | Workday role home |

**PASS màn:** ≥ **16/20** và **không** ILA-07 = 0 · **không** ILA-01 = 0.  
**Partner-ready slice:** Mọi màn **bắt buộc** trong `PILOT_BUSINESS_FLOW_MATRIX` mobile rows ≥ 16/20.

---

## 2. Ma trận màn hình — điểm ILA (2026-06-09, căn cứ evidence)

| Màn | ILA /20 | Sponsor evidence | Gap chính | work_item |
|-----|---------|------------------|-----------|-----------|
| **Home** | **17** | MOB-UX-16a vitest + layout gate | ILA-01/06/08: welcome slide removed; compact EssStatRow 44pt; above-fold budget PASS | **16a** ✅ |
| **Thông báo** | **18** | ảnh slug debug (trước) | ILA-07 đã sửa; ILA-02 list density OK | MOB-UX-15a ✅ |
| **Nghỉ phép list** | **16** | groupedLayout 12pt tab gap | ILA-02: `belowBalanceCards` on tabWrap; device QA pending | **16b** ✅ |
| **Phê duyệt** | **16** | stackHeaderPresent + chipWrap | ILA-02/05: no duplicate title; `belowSubtitle` chip breathing | **16b** ✅ |
| **Chấm công** | **16** | MOB-UX-16d thumb-zone | ILA-09: FAB hidden on CheckIn; sticky footer ≥24dp + footerBottomExtra | **16d** ✅ |
| **Đội nhóm** | **16** | SET G | ILA-04 OK; ILA-08 partial | 12b ✅ |
| **Đồng nghiệp detail** | **17** | ảnh DRIVER (trước) | ILA-04/07 fixed 12a | 12a ✅ |
| **Hồ sơ** | **16** | MOB-UX-16d tab gap | ILA-02: groupedLayout belowStackHeader/belowBalanceCards on SegmentedTabBar | **16d** ✅ |
| **Phiếu lương** | **17** (R2) | holding slug (R1) | ILA-07 **16e** ✅ «Tập đoàn XeVN» | MOB-UX-16e ✅ |
| **Settings/Scope** | **16** | MOB-UX-16d scope copy | ILA-07: OU subtitles + roles Vi; Settings fetch operating-units | **16d** ✅ |

**Trung bình partner slice (R3 dev):** **~16.3/20** — **10/10 ≥16** target post-16d; QA R3 device scorecard pending (`MOB-UX-16-QA-R3`). Carry closed dev: CheckIn/Profile/Settings 16.

---

## 3. Quy tắc bố cục bắt buộc (PM chỉ đạo — Dev implement)

### 3.1 Home (persona EMP)

**Sponsor lock 2026-06-09 — Hướng 1:** **Không** render danh sách «Thông báo» trên Home scroll. Inbox chỉ qua **chuông TopBar** + màn `InAppNotificationsScreen`. Lý do: fallback inbox leave/attendance trùng Hoạt động (ILA-01/03).

```
[Safe top — 0 white gap]
TopBar (tên · công ty · avatar · chuông inbox)
→ QuickAccess 4×N grid (tile 52–72dp)
→ EssStatRow list (max 1–2 rows viewport)
→ Hoạt động trigger (sheet: payslip/tasks/upcoming)
—— STOP above-fold ——
Hero carousel / culture / journey (below fold only)
—— NO announcements list on Home ——
```

| Rule | Token / AC | Vitest / device |
|------|------------|-----------------|
| Không expandable stack trước grid | `HOME_ABOVE_FOLD_RENDER_ORDER` | `homeScrollBudget.test.ts` |
| Grid 4 cột @ width≥360 | `ACTION_GRID_COLS=4` | `homeActionGrid.test.ts` |
| Scroll depth ≤1.2× SE | `estimateAboveFoldHeight ≤520` | 14d matrix |
| Welcome banner | **Bỏ** hoặc gộp TopBar (trùng ILA-01) | **16a** |

### 3.2 List screens (Leave, Approvals, Notifications)

| Vùng | Gap token | File |
|------|-----------|------|
| Stack header → first card | `belowStackHeader` 16pt | `groupedLayout.ts` |
| Balance cards → segmented tab | `belowBalanceCards` 12pt | `LeaveBalanceHeader` |
| Subtitle → filter chips | `belowSubtitle` 12pt | `ManagerApprovalsScreen` |
| Empty illustration | `emptyVertical` 24pt | Lottie wrappers |
| List bottom | `resolveScrollPaddingBottom` + tab bar | `AppScreenLayout` |

### 3.3 Form screens (CheckIn, Create leave)

- **Một** primary CTA sticky bottom (ILA-09)
- **Không** editable UUID (ILA-07)
- Hero read-only identity trước field (ILA-04)

---

## 4. Công cụ kiểm tra (bắt buộc CI / QA)

| Lệnh | PASS khi |
|------|----------|
| `pnpm run verify:mobile:layout` | Token constants + above-fold order + no duplicate title patterns |
| `pnpm run test:mobile:user-copy` | No dev strings |
| `node scripts/qa-mobile-home-responsive-matrix.mjs` | 4 viewport ILA-08 |
| QA scorecard | `docs/qa/evidence/mob-ux-16-ila-scorecard-*.md` per screen |

---

## 5. WBS MOB-UX-16 (layout composition — dispatch song song Phase 1)

| ID | Owner | Exit |
|----|-------|------|
| **MOB-UX-16a** | dev-mobile | Home: bỏ welcome trùng; ILA-01/03; 16/20 @ SE |
| **MOB-UX-16b** | dev-mobile | Leave+Approvals ILA-02 device PASS |
| **MOB-UX-16c** | dev-mobile | `verify:mobile:layout` script |
| **MOB-UX-16-QA** | qa-device | ILA scorecard 10 màn + screenshot pack |
| **MOB-UX-16-QC** | qc | Partner layout GO ≥16/20 mandatory screens |

**Phase 1 G8 gate mới:** `MOB-UX-16-QC` GO trước `MOB-PARTNER-QC-01`.

---

## 6. Traceability sponsor screenshot → ILA → work_item

| Ảnh sponsor | ILA fail | Fix wave |
|-------------|----------|----------|
| Home grid trống 3 cột | ILA-03, ILA-08 | 14a, 16a |
| Home scroll expandables | ILA-01, ILA-03 | 14b, 16a |
| Stat ô vuông số giữa | ILA-06 | 14c |
| Nghỉ phép tab sát | ILA-02 | 13d, 16b |
| Phê duyệt chip sát | ILA-02, ILA-05 | 13d, 16b |
| Thông báo slug | ILA-07 | 15a ✅ |
| Chấm công UUID | ILA-07, ILA-04 | 13a ✅ |

---

## 7. PM accountability (U60)

- Mỗi lượt sponsor gửi ảnh → cập nhật **§2 điểm ILA** trong file này **cùng ngày**
- Không dispatch Dev chỉ nói «polish» — phải ghi **ILA-xx = N** + AC
- `PROJECT_STATUS_REPORT.md` §UI Layout pulse cập nhật theo §2
