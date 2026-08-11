/**
 * @CODE-MEMORY
 * Screen:     Command Center — metadata / infra custom field dataType
 * UC:         C-XBOS-U72-P2 · AC-F-XBOS (display soft)
 * BR:         BR-XBOS-COPY-01 · display-label-no-raw-key (U72)
 * SRS:        docs/xbos/SRS_FIELD_DISPLAY.md
 * TechSpec:   N/A (display-label FIX; wire value= giữ key kỹ thuật)
 * Purpose:    Map dataType wire key (text/number/date/…) → nhãn tiếng Việt user-facing.
 *             Không in EN «Text/Number/Date» hay raw slug trên list/select.
 * WorkItem:   D-FE-U72-SOFT-P2-01
 * Coded:      2026-07-27
 * Callers:    CommandCenterPage EMPLOYEE_METADATA_DATA_TYPES + field list meta
 * Callees:    pure map — không gọi API
 * FEActions:  | Xem kiểu dữ liệu | render | resolveMetadataDataTypeDisplayLabel |
 * Impact:     Sai map → lộ EN Text/Number/Date trên HR catalog / infra field UI (U72 P2).
 * must_keep:  option value= vẫn wire key; F-09/F-10 CLOSED; U65 no seed
 * SOLID:      Resolver thuần — tách khỏi CommandCenterPage để vitest
 * LastVerified: utils/metadataDataTypeDisplayLabels.test.ts
 */

export type MetadataDataTypeWire =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'phone'
  | 'email'
  | 'boolean';

const METADATA_DATA_TYPE_LABELS_VI: Record<MetadataDataTypeWire, string> = {
  text: 'Văn bản',
  number: 'Số',
  date: 'Ngày',
  select: 'Lựa chọn',
  phone: 'Điện thoại',
  email: 'Email',
  boolean: 'Đúng/Sai',
};

/** Options for select: value= wire key, label= VI. */
export const METADATA_DATA_TYPE_OPTIONS_VI: ReadonlyArray<{
  value: Exclude<MetadataDataTypeWire, 'boolean'>;
  label: string;
}> = [
  { value: 'text', label: METADATA_DATA_TYPE_LABELS_VI.text },
  { value: 'number', label: METADATA_DATA_TYPE_LABELS_VI.number },
  { value: 'date', label: METADATA_DATA_TYPE_LABELS_VI.date },
  { value: 'select', label: METADATA_DATA_TYPE_LABELS_VI.select },
  { value: 'phone', label: METADATA_DATA_TYPE_LABELS_VI.phone },
  { value: 'email', label: METADATA_DATA_TYPE_LABELS_VI.email },
];

/**
 * Map dataType wire → VI display. Unknown / empty → «—» (never echo raw EN/slug).
 */
export function resolveMetadataDataTypeDisplayLabel(
  dataType: string | null | undefined,
): string {
  const key = (dataType ?? '').trim().toLowerCase() as MetadataDataTypeWire | '';
  if (!key) return '—';
  return METADATA_DATA_TYPE_LABELS_VI[key as MetadataDataTypeWire] ?? '—';
}
