# Mobile HRM — Partner Readiness & Phase 1 Honest Assessment

**work_item_id:** `MOB-PARTNER-READINESS-01`  
**date:** 2026-06-09  
**owner:** PM (sponsor-facing)  
**verdict:** **NOT partner-ready · NOT 100% · NOT Phase 1 closure**

---

## 1. Câu trả lời thẳng (sponsor 2026-06-09)

| Câu hỏi | Trả lời |
|---------|---------|
| **Unit test hết màn nghiệp vụ?** | **Không.** `pnpm test:hrm-mobile` → **345/345 test PASS** nhưng **1 suite FAIL** (`mainTabIa.test.ts` parse/rollup). Không có UI snapshot per-screen; device matrix chưa đủ kích thước. |
| **Chạy thông với web?** | **Một phần.** API parity PASS L1 UAT; mobile dùng cùng HRM API nhưng **label/scope** lệch (vd. `holding` hiện raw trên Home, `bạn` thay `full_name`). Web embed 13/13 P-CC; mobile J-MOB ~35 journey — **13e persona chưa device-closed**. |
| **Sẵn sàng 100%?** | **Không.** QC MOB-UX-13 = GO GWC **scoped 13a–d only**; 13e/13f/13g residual; sponsor UAT `PCOMP-W6-SP-01` pending; PROD 🔴. |
| **So Workday / BambooHR / ZenHR?** | **Tier-2 functional / Tier-3 polish.** Core ESS (chấm, nghỉ, phiếu lương, duyệt) có API + flow; **thiếu** density UX, responsive matrix, persona device proof, culture depth, search, onboarding. Ước **~55–65%** trải nghiệm so app HRM top (không tính enterprise SF). |
| **Đủ Phase 1 sponsor yêu cầu?** | **Portal + HRM embed ~90%** (`PHASE1_PRODUCT_COMPLETION_TODO` 38/42). **Mobile partner slice chưa đủ** — Home responsive, tên NV thật, scroll budget, 4-col grid, web-mobile parity sign-off thiếu. |

---

## 2. Sponsor screenshot class (Home 2026-06-09)

| Defect | Root cause | Wave |
|--------|------------|------|
| Khoảng trắng phía trên header | `DashboardScreen` `safeAreaTop={false}` + double padding | MOB-UX-14a |
| «holding» + «bạn» | `companyId` slug chưa map `resolveCompanyDisplayVi`; `displayName` fallback khi profile chưa hydrate | MOB-UX-14e |
| Truy cập nhanh 3 cột — trống nhiều | `ACTION_GRID_COLS = 3` | MOB-UX-14a → **4 cột** |
| Scroll quá dài | 6+ `HomeExpandableSection` trước hero ESS | MOB-UX-14b → **1-screen budget** |
| Ô thống kê số to giữa — cao | `EssStatCard` vertical layout | MOB-UX-14c → **số bên phải** |
| Chưa test đủ kích thước | Không có responsive matrix CI | MOB-UX-14d |

---

## 3. WBS — MOB-UX-14 Home Responsive + Partner Hardening

| ID | Owner | Scope | Exit |
|----|-------|-------|------|
| **MOB-UX-14a** | dev-mobile | 4-col quick grid; tile compact; top safe area fix; welcome card gọn | vitest + screenshot 360dp |
| **MOB-UX-14b** | dev-mobile | Home **1-screen budget**: grid + stats above fold; expandables → tab «Tóm tắt» hoặc bottom sheet «Xem thêm» | scroll depth ≤ 1.2× viewport |
| **MOB-UX-14c** | dev-mobile | `EssStatRow` horizontal: label trái, số phải, hairline separator (Apple Settings row) | vitest layout |
| **MOB-UX-14d** | qa-device | Device matrix: iPhone SE, 14 Pro Max, Pixel 4a/7, Samsung Tab; evidence per density | `mob-ux-14d-matrix-*.md` |
| **MOB-UX-14e** | dev-mobile | `resolveCompanyDisplayVi(holding→Tập đoàn XeVN)`; force `full_name` từ `/employees/:id` before paint | no «bạn»/«holding» on Home |
| **MOB-TEST-01** | dev-mobile | Fix `mainTabIa.test.ts` rollup parse — suite green | `test:hrm-mobile` exit 0 |
| **MOB-PARITY-01** | qa | Mobile↔web label/API parity matrix 20 routes | `mob-web-parity-*.md` |
| **MOB-UX-13e-QA** | qa-device | Persona J-MOB-36..38 device pack | 3 screenshots |
| **MOB-UX-13f-QA** | qa-device | Swipe actions device | J-MOB-23..26 |
| **MOB-UX-13g-QA** | qa-device | Culture + journey | UC-MOB-PERS-08 |
| **MOB-PARTNER-QC-01** | qc | Partner GO only when 14a–e + parity + persona + matrix PASS | qc evidence |
| **PCOMP-W6-SP-01** | sponsor | Sign-off UAT | blocker Phase 1 |

---

## 4. So sánh benchmark (PM 30yr — không marketing)

| Tiêu chí | Workday Canvas | XeVN mobile hiện tại | Gap |
|----------|----------------|----------------------|-----|
| Home density | 1 screen task + search | 2+ screens scroll | **P0** |
| Responsive | Tested phone/tablet | 1 emulator API 33 | **P0** |
| Localization | Locale complete | Slug `holding`, fallback `bạn` | **P0** |
| Persona | Role-based home | Code có 13e, chưa device QC | **P1** |
| Gestures | Swipe inbox | 13f code, chưa device QC | **P1** |
| Culture | Announcements feed | 13g partial | **P2** |
| Production | SOC2 path | nip.io pilot only | **Phase 1 out** |

---

## 5. PM dispatch order (execution)

```
Wave 1 (parallel): MOB-UX-14a + 14c + 14e + MOB-TEST-01
Wave 2: MOB-UX-14b (depends 14a layout)
Wave 3: MOB-UX-14d + MOB-PARITY-01 + 13e/f/g QA
Wave 4: MOB-PARTNER-QC-01 → sponsor PCOMP-W6-SP-01
```

**Không** báo «sẵn sàng đối tác» trước Wave 4 QC GO.
