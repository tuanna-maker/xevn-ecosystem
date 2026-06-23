# Mobile ESS — Secondary Screen Visual Polish (SET G)

**work_item_id:** `MOB-UX-12-PROGRAM`  
**trigger:** Sponsor feedback 2026-06-08 — Home đỡ; **Team/Profile/Leave/Approve** quá đơn điệu (screenshot `TeamColleagueDetail` raw DRIVER/active)  
**owner:** PM → dev-mobile → qa-device → qc  
**palette:** XeVN `#1E40AF` primary · accent `#06B6D4` sparingly  
**npm (đã cài — bắt buộc dùng):** `expo-linear-gradient`, `react-native-reanimated`, `moti`, `react-native-svg`, `@shopify/flash-list`, `lottie-react-native`

---

## 1. Benchmark synthesis (US + China — không copy pixel)

| App | Pattern áp dụng XeVN | Màn |
|-----|----------------------|-----|
| **Workday Canvas** | Gradient hero band + avatar ring + **action chips** (Gọi/Nhắn) + grouped inset lists | Colleague detail, Profile |
| **SAP SuccessFactors** | Semantic **status pill** màu; section header icon; không hiện raw enum | Detail, Approvals |
| **BambooHR / Personio** | **2×2 metric tiles** trên profile; contact row với icon; empty state illustration | Profile, Team |
| **ZenHR** (sponsor ref U55) | Attendance badge lớn trên hero; org line «Phòng ban · Chức danh» | Team detail |
| **钉钉 DingTalk / 飞书 Feishu** | Employee card **depth shadow**, tag chips (职级/部门), quick dial | Team directory |
| **北森 Beisen iHR** | Hero + **快捷入口** icon grid (工资条/请假/考勤) | Profile |

**Nguyên tắc PM:** Layout/IA đã có (U54/U55); SET G = **visual layer** — hierarchy, color semantics, iconography, motion, **không** raw seed/API codes trên UI.

---

## 2. Anti-patterns (FAIL QA — sponsor screenshot class)

| Anti-pattern | Ví dụ screenshot | Fix |
|--------------|------------------|-----|
| Raw `job_title_key` / `status` enum | `DRIVER`, `active` | `resolveRoleSubtitle` + `mapEmploymentStatusVi` |
| Một `SurfaceCard` + `DetailRow` stack phẳng | Thông tin nhân viên ×2 title | Hero + **section cards** (Liên hệ / Công việc / Chấm công) |
| Avatar initials only, no ring/gradient | BA circle xám | `LinearGradient` ring + optional photo |
| Không CTA | Chỉ đọc | Gọi / Email / (stub Nhắn) icon row |
| Spinner full-screen | AppScreenLayout default | Shimmer hero + sections (MOB-UX-11f) |

---

## 3. Wave breakdown

| Wave | work_item | Screens | SET | J-* |
|------|-----------|---------|-----|-----|
| **G-1** | `MOB-UX-12a` | `TeamColleagueDetailScreen` | F-3 ext | J-MOB-30 ext |
| **G-2** | `MOB-UX-12b` | `TeamDirectoryScreen` row density | ZenHR directory | J-MOB-30 |
| **G-3** | `MOB-UX-12c` | `ProfileScreen` tabs (F-3 hero + 2×3 status grid + quick actions) | F-3 | J-MOB-17 ext |
| **G-4** | `MOB-UX-12d` | `ManagerApprovalsScreen`, `LeaveRequestsListScreen`, `ContractsScreen`, `OperationsScreen` | Personio inbox | J-MOB-23..28 |
| **G-5** | `MOB-UX-12e` | `PayslipDetailScreen`, `CreateLeaveRequestScreen` | SET E | J-MOB-04, 28 |

**Sequence:** G-1 (sponsor pain) → G-2 → G-3 → parallel G-4/G-5 → `MOB-UX-12-QA-DEVICE` regression matrix.

---

## 4. Component kit (dev-mobile — reuse)

| Component | Mô tả |
|-----------|--------|
| `EmployeeHeroCard` | Gradient top, avatar ring 96–112, name, subtitle «Phòng · Chức danh», status pill |
| `QuickActionRow` | 3–4 icon+label (Gọi, Email, Lịch, …) `PressableScale` |
| `ProfileSectionCard` | Title + icon header; children `IconDetailRow` |
| `IconDetailRow` | Ionicons left, label muted, value semibold, optional chevron |
| `StatusMetricGrid` | 2×2 or 2×3 colored numerals (moti stagger) |

**Không** migrate Tamagui/Gluestack (MOBILE_UI_LIBRARY_DECISION.md Option D).

---

## 5. Acceptance (device @ nip.io)

- Colleague detail: **không** chữ `DRIVER`/`active`/`engineer` raw; badge «Đã chấm»/«Chưa chấm» có màu semantic
- Mỗi màn SET G: ≥1 gradient or elevated hero; ≥2 section groups; skeleton first load
- Regression: J-MOB-02..35 + 4-tab IA APK canonical
- Evidence: `docs/qa/evidence/mob-ux-12*-20260609.md`

---

## 6. Traceability

- U54 `MOBILE_HRM_ESS_UX_BENCHMARK.md` SET E  
- U56 `MOBILE_UI_LIBRARY_DECISION.md` F-3, MOB-UX-11d (absorbed into G-3)  
- `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §11
