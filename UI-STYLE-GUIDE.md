# XEVN UI/UX STYLE GUIDE (FE PROTOTYPE)

> **Version**: 1.0 | **Last Updated**: 2026-03-23

## 🎨 COLORS

| Token | Value | Usage |
|-------|-------|-------|
| `xevn-primary` | `#1E40AF` | Primary buttons, main accents, icons |
| `xevn-accent` | `#06B6D4` | Hover states, secondary actions, highlights |
| `xevn-success` | `#10B981` | Success states, positive indicators |
| `xevn-warning` | `#F59E0B` | Warning states, caution indicators |
| `xevn-danger` | `#EF4444` | Danger states, delete actions, errors |
| `xevn-info` | `#3B82F6` | Informational banners, help indicators |
| `xevn-neutral` | `#6B7280` | Secondary text, icons, dividers |
| `xevn-background` | `#F9FAFB` | Page background |
| `xevn-surface` | `#FFFFFF` | Cards, modals, panels |
| `xevn-text` | `#1F2937` | Primary text |
| `xevn-textSecondary` | `#6B7280` | Secondary text, captions |
| `xevn-border` | `#E5E7EB` | Borders, dividers |

> ✅ **Rule**: Always use design tokens — never hardcode hex values.

## 📜 TYPOGRAPHY

| Scale | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Captions, badges |
| `text-sm` | 14px | Labels, secondary text |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Subheaders |
| `text-xl` | 20px | Section titles |
| `text-2xl` | 24px | Page titles |
| `text-3xl` | 30px | Hero headings |
| `text-4xl` | 36px | Main page headers |

| Font Weight | Usage |
|-------------|-------|
| `font-normal` | Body text |
| `font-medium` | Labels, buttons |
| `font-semibold` | Subheaders |
| `font-bold` | Headings |

> ✅ **Rule**: Use semantic class names: `.page-title`, `.section-title`, `.body-text`, `.caption`.

## 📐 SPACING & LAYOUT

| Token | Value | Usage |
|-------|-------|-------|
| `px` | 1px | Borders |
| `0.5` | 8px | Small padding/margin |
| `1` | 16px | Standard padding/margin |
| `1.5` | 24px | Section padding |
| `2` | 32px | Large spacing between sections |
| `3` | 48px | Page padding on desktop |

> ✅ **Rule**: Always use multiples of 8px. Never use 12px, 20px, 28px.

## 🧩 COMPONENTS

All UI components must come from `@xevn/ui`. Do NOT create new components in app directories.

| Component | Purpose | Example |
|----------|---------|---------|
| `Button` | Primary actions | "Thêm nhân viên", "Xuất báo cáo" |
| `Card` | Content containers | StatCard, ModuleCard |
| `Badge` | Status indicators | "Đang hoạt động", "Chờ phê duyệt" |
| `DataTable` | Tabular data | Khách hàng, Đối tác |
| `PageHeader` | Page title & subtitle | Top of every page |
| `StatCard` | Key metrics | Doanh thu, Tổng nhân sự |
| `TreeView` | Hierarchical data | Tổ chức công ty |
| `InfoBanner` | Guidance messages | "Chế độ chỉ xem" |
| `Skeleton` | Loading placeholders | Before data loads |
| `EmptyState` | No data states | "Không tìm thấy khách hàng" |
| `LoadingOverlay` | Full-screen loading | During API calls |
| `Container` | Page layout wrapper | Wraps all content |
| `Section` | Grouped content | Groups related components |
| `Breadcrumbs` | Navigation path | Page navigation trail |

> ✅ **Rule**: Use `Card` for all panels. Use `StatCard` for KPIs. Use `InfoBanner` for guidance, not alerts.

## 🖥️ LAYOUT STRUCTURE

Every page must follow this structure:

```tsx
<PageLayout>
  <PageHeader title="Tên trang" subtitle="Mô tả ngắn" icon={<Icon />} />
  <InfoBanner title="Tiêu đề" message="Nội dung hướng dẫn" />
  <Container>
    <Section gap="md">
      <StatCard ... />
      <DataTable ... />
    </Section>
  </Container>
</PageLayout>
```

> ✅ **Rule**: Never skip `PageLayout`. Always use `PageHeader` and `Container`.

## 📱 RESPONSIVE DESIGN

| Breakpoint | Layout |
|------------|--------|
| Mobile (≤640px) | 1 column |
| Tablet (641–1024px) | 2 columns |
| Desktop (≥1025px) | 4 columns |

> ✅ **Rule**: Always use responsive grid classes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.

## 🎞️ ANIMATIONS

Only use these 3 animations:

| Animation | Usage | Example |
|----------|-------|---------|
| `transition-all` | Hover, focus | Button, Card |
| `animate-pulse` | Status indicators | Badge, status light |
| `animate-bounce` | Success feedback | Toast, success message |

> ❌ **Never use**: Page fade-ins, slide-in menus, complex animations.

## 📂 MOCK DATA

All mock data must be in `src/data/mock-data.ts` with these types:

- `Customer`
- `Partner`
- `Employee`
- `OrganizationNode`
- `KPI`
- `Module`

> ✅ **Rule**: Each mock item must have realistic, complete data. No placeholder values like "Name 1".

## 📚 DOCUMENTATION

- All components are documented in Storybook (to be built).
- This guide is the single source of truth for UI/UX.
- Any deviation must be approved by the UI/UX lead.

---

> ✅ **Final Rule**: If you can’t find it in this guide, don’t make it up. Ask the UI/UX lead.


🕯️ ELEVATION & DEPTH (THE APPLE TOUCH)Thay vì dùng đường viền (border) thô cứng, XEVN OS sử dụng chiều sâu (elevation) để phân tách các lớp nội dung.TokenValueUsageradius-card12pxAll container cards, main panelsradius-input8pxButtons, Inputs, Selects, Dropdownsradius-full9999pxBadges, Search bars, Avatarsshadow-soft0 4px 20px -1px rgba(0,0,0,0.05)Standard card elevation (resting state)shadow-hover0 10px 15px -3px rgba(0,0,0,0.1)Cards on hover, active interactionshadow-overlay0 20px 25px -5px rgba(0,0,0,0.1)Drawers, Modals, Popovers (top layer)✅ Rule: Use backdrop-blur-md with bg-surface/80 for sticky headers and navigation bars to create a glass effect.🧬 X-BOS DNA STATUS COLORSDành riêng cho việc hiển thị trạng thái của dữ liệu và định mức (Gen DNA) trong toàn hệ sinh thái.TokenValueMeaningdna-active#059669Dữ liệu chuẩn, đã đồng bộ (Synced)dna-pending#D97706Đang chờ xử lý hoặc đồng bộ (Pending)dna-error#E11D48Vi phạm định mức, lỗi cấu trúc (Violation)dna-frozen#4B5563Dữ liệu tạm khóa, không cho phép sử dụng🎭 INTERACTION & MOTIONTạo cảm giác phản hồi vật lý (Haptic-like) cho người dùng trên môi trường Web/Mobile.Buttons: Sử dụng transition-all duration-200 active:scale-95 để tạo hiệu ứng nhấn.Cards: Sử dụng hover:-translate-y-1 transition-transform cho các Module/Stat cards.Inputs: Khi focus, sử dụng ring-2 ring-xevn-primary/20 border-xevn-primary.Loading: Sử dụng animate-pulse cho các Skeleton thay vì vòng xoay (spinner) truyền thống để giảm cảm giác chờ đợi.🖋️ ICONOGRAPHY STANDARDToàn bộ hệ thống thống nhất sử dụng thư viện Lucide React.Size: Mặc định 20px cho UI thông thường, 24px cho Dashboard lớn.Stroke: Luôn sử dụng stroke-width={1.5} để tạo nét thanh mảnh, hiện đại.Color: Sử dụng xevn-neutral cho trạng thái thường và xevn-primary cho trạng thái active.❌ Never use: Icon có màu đổ bóng (gradient) hoặc icon dạng đặc (solid) trừ khi là trạng thái "đang chọn".