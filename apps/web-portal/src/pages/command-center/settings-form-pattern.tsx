/**
 * XeVN Symmetrical Grid Law (Apple-style rhythm)
 *
 * Viewport: `XEVN_VIEWPORT_PADDING` = `xevn-safe-inline` (clamp đối xứng px-8 → px-12). Kèm `XEVN_FLUID_SHELL` max-width 1920px.
 *
 * Section: `SETTINGS_SECTION_GRID` — lưới 12 cột, gap-6.
 * - Trục neo 4-4-4: trường chuẩn (mã, ngày, vốn, MST, hotline…) → `SETTINGS_COL.span4`.
 * - 8-4 / 6-6: tên dài (`span8`) hoặc cặp nhân sự (`span6`) — không dùng 5-5-2 hay 3-3-6.
 *
 * Input: `SETTINGS_RADIUS_INPUT`; thẻ khối: `SETTINGS_RADIUS_CARD`; shadow: shadow-soft; sticky: backdrop-blur-md.
 * Sticky Workspace header (tiêu đề + tìm kiếm): `WORKSPACE_STICKY_HEADER_ROW` + `WORKSPACE_STICKY_HEADER_AXIS_H` — luôn `items-center`, cùng chiều cao slot.
 * Typography: `SETTINGS_PAGE_TITLE_CLASS` → `SETTINGS_SECTION_TITLE_CLASS` → `SETTINGS_LABEL_CLASS` (16px); Navigation: `NAV_*` (Rail + Sub-sidebar, 15px). Bảng workspace: tiêu đề cột dùng `text-sm` (tránh `text-xs` trên laptop).
 */

import React, { useEffect, useRef } from 'react';

/** Đệm ngang fluid (clamp) — đối xứng; class trong index.css */
export const XEVN_VIEWPORT_PADDING = 'xevn-safe-inline';

/** Vỏ giới hạn chiều ngang ultra-wide + căn giữa */
export const XEVN_FLUID_SHELL = 'mx-auto w-full min-w-0 max-w-[1920px]';

/**
 * Hàng sticky trong panel Workspace (Cài đặt / Danh sách…): **flex + items-center**.
 * Tiêu đề trang (`h2`) và shell ô tìm kiếm dùng chung `WORKSPACE_STICKY_HEADER_AXIS_H` để tâm dọc trùng một trục — không `mt-`/`pt-` riêng trên tiêu đề.
 */
export const WORKSPACE_STICKY_HEADER_ROW =
  'sticky top-0 z-20 flex w-full shrink-0 items-center gap-3 border-b border-xevn-border bg-white/80 xevn-safe-inline py-2.5 shadow-soft backdrop-blur-md';

/** Chiều cao hàng trục ngang: tiêu đề ↔ thanh tìm (đồng bộ mọi màn Workspace dùng pattern này). */
export const WORKSPACE_STICKY_HEADER_AXIS_H = 'h-10';

/** `h2` trong hàng sticky (layout cũ — flex-1); ưu tiên `WORKSPACE_STICKY_TITLE_ABSOLUTE_CENTER_CLASS` + parent `relative`. */
export const WORKSPACE_STICKY_PAGE_TITLE_H2_CLASS = `m-0 ${WORKSPACE_STICKY_HEADER_AXIS_H} flex min-w-0 flex-1 items-center overflow-hidden text-xl font-bold leading-tight tracking-tight text-xevn-text sm:text-2xl`;

/** Tiêu đề căn giữa tuyệt đối trong hàng sticky (đối xứng với search). Parent: `relative flex min-h-10 items-center`. */
export const WORKSPACE_STICKY_TITLE_ABSOLUTE_CENTER_CLASS =
  'pointer-events-none absolute left-1/2 top-1/2 z-[1] m-0 max-w-[min(36rem,calc(100%-11rem))] -translate-x-1/2 -translate-y-1/2 truncate whitespace-nowrap text-center text-2xl font-semibold leading-tight tracking-tight text-xevn-text sm:max-w-[min(40rem,calc(100%-14rem))]';

/** Vỏ bọc icon Search + input — cùng `h-10` với tiêu đề */
export const WORKSPACE_STICKY_SEARCH_SHELL_CLASS = `${WORKSPACE_STICKY_HEADER_AXIS_H} flex min-w-[min(100%,11rem)] shrink-0 items-center gap-2 sm:min-w-[14rem] md:min-w-[16rem] lg:min-w-[18rem]`;

/** Bán kính 8px — input / select / textarea */
export const SETTINGS_RADIUS_INPUT = 'rounded-input';

/** Bán kính 12px — card section */
export const SETTINGS_RADIUS_CARD = 'rounded-card';

/**
 * Lưới 12 cột, gap-6.
 * md+: 12 cột + căn đỉnh ô (vertical alignment).
 */
export const SETTINGS_SECTION_GRID =
  'grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start';

/**
 * Responsive Symmetry: span4 → 12 / 6 / 4; span8 → 12 / 8 (từ lg).
 * span12: một hàng full lưới 12 cột (trường tìm kiếm/ghép mã–tên dài).
 */
export const SETTINGS_COL = {
  /** Một cột neo (STT, SLA ngắn) — full width mobile, 1/12 từ lg */
  span1:
    'col-span-12 min-w-0 sm:col-span-3 md:col-span-2 lg:col-span-1',
  span2:
    'col-span-12 min-w-0 sm:col-span-6 md:col-span-4 lg:col-span-2',
  span3:
    'col-span-12 min-w-0 sm:col-span-6 md:col-span-4 lg:col-span-3',
  span4:
    'col-span-12 min-w-0 md:col-span-6 lg:col-span-4',
  span5:
    'col-span-12 min-w-0 md:col-span-6 lg:col-span-5',
  span6: 'col-span-12 min-w-0 md:col-span-6',
  span8: 'col-span-12 min-w-0 lg:col-span-8',
  span12: 'col-span-12 min-w-0',
} as const;

/** Label trường form — 16px (base), medium; lớn hơn nhãn menu trái 1px (15px) */
export const SETTINGS_LABEL_CLASS =
  'block min-w-0 break-words text-left text-base font-medium leading-snug text-slate-500 hyphens-auto';

/**
 * Thứ bậc Typography (Workspace):
 * Page title (2xl) → Section trong card (xl) → Field label (16px/base medium slate-500).
 */

/** Tiêu đề trang trong Workspace (vd. "Thiết lập công ty") — cấp 1 */
export const SETTINGS_PAGE_TITLE_CLASS =
  'break-words text-2xl font-bold tracking-tight text-xevn-text';

/** Phụ đề dưới tiêu đề trang */
export const SETTINGS_PAGE_SUBTITLE_CLASS =
  'mt-1 text-sm font-medium leading-snug text-slate-600 sm:text-[15px]';

/** Tiêu đề khối trong card (vd. "Khối Định danh") — cấp 2, dưới page title */
export const SETTINGS_SECTION_TITLE_CLASS =
  'break-words text-xl font-bold tracking-tight text-xevn-text';

/** Tiêu đề cột Sub-sidebar (vd. "Cài đặt hệ thống") — đồng cấp gần section, nhẹ hơn page */
export const NAV_SUBSIDEBAR_TITLE_CLASS =
  'text-lg font-bold tracking-tight text-xevn-text sm:text-xl';

/** Dòng phụ dưới tiêu đề cột Sub-sidebar */
export const NAV_SUBSIDEBAR_HELPER_CLASS =
  'mt-1 text-[13px] font-medium leading-snug text-slate-500 sm:text-sm';

/** Icon ↔ nhãn mục Sub-sidebar (hàng ngang): gap-1 hoặc gap-2 */
export const NAV_SUBSIDEBAR_ITEM_ROW_GAP = 'gap-2';

/**
 * Chữ mục menu Sub-sidebar — 15px, font-normal; active: font-bold (token ACTIVE).
 */
export const NAV_SUBSIDEBAR_ITEM_BASE_CLASS =
  'min-w-0 flex-1 text-left text-[15px] leading-snug break-words hyphens-auto';

export const NAV_SUBSIDEBAR_ITEM_IDLE_CLASS = `${NAV_SUBSIDEBAR_ITEM_BASE_CLASS} font-normal text-slate-500`;

export const NAV_SUBSIDEBAR_ITEM_ACTIVE_CLASS = `${NAV_SUBSIDEBAR_ITEM_BASE_CLASS} font-bold text-xevn-primary`;

/**
 * Nhãn dưới icon rail (Command Center): cố ý 13px + tracking-tight để thị giác cân với mục menu con 15px
 * (thường là chữ thường); chữ IN HOA trên nền hẹp trông “nặng” hơn nếu cùng 15px.
 */
export const NAV_RAIL_MODULE_CAPTION_IDLE_CLASS =
  'w-full max-w-full text-center text-balance text-[13px] font-normal leading-snug tracking-tight text-slate-500 break-words hyphens-auto';

export const NAV_RAIL_MODULE_CAPTION_ACTIVE_CLASS =
  'w-full max-w-full text-center text-balance text-[13px] font-bold leading-snug tracking-tight text-xevn-primary break-words hyphens-auto';

export const NAV_RAIL_MODULE_CAPTION_DISABLED_CLASS =
  'w-full max-w-full text-center text-balance text-[13px] font-normal leading-snug tracking-tight text-slate-400 break-words hyphens-auto';

/** Chiều ngang cột Sub-sidebar (X-BOS): 280px desktop; hẹp hơn khi viewport &lt;1200px */
export const NAV_SUBSIDEBAR_WIDTH_CLASS =
  'lg:w-[280px] lg:min-w-[280px] lg:max-w-[280px] max-[1199px]:lg:w-[220px] max-[1199px]:lg:min-w-[220px] max-[1199px]:lg:max-w-[220px]';

/** Rail: nhãn nhóm trên cùng ("Phân hệ") */
export const NAV_RAIL_GROUP_LABEL_CLASS =
  'mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500';

/**
 * Identity Block: icon + tên phân hệ — gap dọc chặt (4px; tối đa 8px nếu cần chỉnh).
 * Dùng với `flex flex-col items-center`.
 */
export const NAV_RAIL_IDENTITY_BLOCK_GAP = 'gap-1';

/** Khoảng cách giữa các mục phân hệ khác nhau (đủ thoáng, tránh nhồi) */
export const NAV_RAIL_MODULE_STACK = 'space-y-6';

/** Rail: caption dưới icon — 15px, font-normal; full width trong cột có px-3; active: font-bold ở component */
export const NAV_RAIL_ICON_CAPTION_CLASS =
  'w-full text-balance text-center text-[15px] font-normal leading-snug text-slate-600 break-words';

/** Rail: nút phụ / mô tả persona */
export const NAV_RAIL_META_TEXT_CLASS =
  'text-center text-[12px] font-medium leading-snug text-slate-600 sm:text-sm';

/** Rail: tiêu đề vùng link ("Mở phân hệ") */
export const NAV_RAIL_LINK_SECTION_LABEL_CLASS =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500';

/** Khoảng cách dọc đồng nhất giữa các section / widget hàng đầu */
export const SETTINGS_SECTION_STACK = 'space-y-6';

/** Chuẩn chữ trong ô nhập (Input / Select / Textarea) — break-words trong Safe Area */
export const SETTINGS_CONTROL_TEXT = 'break-words text-base leading-snug';

/** Ô select/input/textarea: không tràn ô lưới */
export const SETTINGS_FIELD_COMPACT =
  'min-w-0 max-w-full [&_input]:w-full [&_input]:min-w-0 [&_input]:max-w-full [&_input]:text-base [&_input]:leading-snug [&_select]:w-full [&_select]:min-w-0 [&_select]:text-base [&_select]:leading-snug [&_textarea]:w-full [&_textarea]:min-w-0 [&_textarea]:max-w-full [&_textarea]:text-base [&_textarea]:leading-snug';

/** Label gọn trên field — min-w-0 để grid/flex không nuốt độ rộng (tránh overflow sai) */
export const SETTINGS_FIELD_SHELL = 'flex min-w-0 flex-col gap-1 text-left';

export const AutoResizeTextarea: React.FC<{
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  'aria-label'?: string;
}> = ({ value, onChange, className, placeholder, 'aria-label': ariaLabel }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className={`box-border min-w-0 max-w-full resize-none overflow-hidden border border-xevn-border bg-white px-3 py-2 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-xevn-accent ${SETTINGS_CONTROL_TEXT} ${SETTINGS_RADIUS_INPUT} ${className ?? ''}`}
    />
  );
};
