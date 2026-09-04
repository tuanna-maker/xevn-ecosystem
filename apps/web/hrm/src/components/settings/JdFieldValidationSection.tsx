/**
 * @CODE-MEMORY
 * Screen:     Cài đặt → trường JD · Field Dialog (select validation_json)
 * UC:         UC-BP-REC-00a · F-JD-DEF-02
 * BR:         BR-BP-JD-DYN-01 · VAL-JD-21 · VAL-JD-22 · VAL-JD-23
 * SRS:        docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md (UC-00a)
 * TechSpec:   PO-HRM-JD-DYNAMIC-DATA-01.md §3.2 · §12.7 select source modes
 * Purpose:    Render the 3 select source modes inside the Field Dialog:
 *             static (1-50 free options) | catalog (platform allowlist + live items)
 *             | runtime (source reference, READ-ONLY preview — BE has no runtime writer yet).
 *             Empty / loading / error states per UIUX-01.
 * WorkItem:   PO-HRM-JD-DYNAMIC-FE-01
 * Coded:      2026-08-18
 * Callers:    JdDynamicSettingsPanel (Field Dialog)
 * Callees:    jdFieldValidation (pure) · useSettingsCatalogsOverview (shared RQ cache)
 * must_keep:  AP-01..06 scope guard · no FE join/merge/BR calc · no cross-module DB · no job_postings
 * SOLID:      Presentational — validation logic lives in jdFieldValidation; catalogs from shared RQ
 */

import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  JD_SELECT_CATALOG_ALLOWLIST,
  JD_SELECT_CATALOG_LABELS,
  JD_SELECT_SOURCE_CATALOG,
  JD_SELECT_SOURCE_RUNTIME,
  JD_SELECT_SOURCE_STATIC,
  JD_SELECT_SOURCE_LABELS,
  JD_SELECT_SOURCES,
  isSelectCatalogKeyAllowed,
  selectCatalogItems,
  selectCatalogItemLabel,
  type JdSelectSource,
  type SelectValidationShape,
} from '@/lib/jdFieldValidation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export type JdFieldValidationSectionProps = {
  /** Current select source in the Field Dialog form. */
  validationSource: JdSelectSource;
  onValidationSourceChange: (next: JdSelectSource) => void;
  /** Free-text options (static). */
  validationOptions: string;
  onValidationOptionsChange: (next: string) => void;
  /** Selected catalog_key (catalog). */
  validationCatalogKey: string;
  onValidationCatalogKeyChange: (next: string) => void;
  /** Source reference (runtime, read-only preview). */
  validationSourceRef: string;
  onValidationSourceRefChange: (next: string) => void;
  /** Optional runtime note. */
  validationNote: string;
  onValidationNoteChange: (next: string) => void;
  /** Existing validation_json when editing (used to pre-fill runtime source_ref). */
  existingValidation: SelectValidationShape | null;
  /** Number of static options currently entered (for the helper line). */
  staticOptionCount: number;
};

/**
 * Render the select-source UI for the Field Dialog.
 * - static:   free-text textarea, 1..50 options (VAL-JD-22)
 * - catalog:  allowlist Select + live item count preview (VAL-JD-21)
 * - runtime:  source_ref input + read-only note (FE preview only)
 */
export function JdFieldValidationSection({
  validationSource,
  onValidationSourceChange,
  validationOptions,
  onValidationOptionsChange,
  validationCatalogKey,
  onValidationCatalogKeyChange,
  validationSourceRef,
  onValidationSourceRefChange,
  validationNote,
  onValidationNoteChange,
  existingValidation,
  staticOptionCount,
}: JdFieldValidationSectionProps) {
  const { catalogs, loading: catalogsLoading, error: catalogsError } = useSettingsCatalogsOverview();

  const liveItems = useMemo(
    () => (validationCatalogKey ? selectCatalogItems(catalogs ?? [], validationCatalogKey) : []),
    [catalogs, validationCatalogKey],
  );

  const showCatalogLoading = catalogsLoading && liveItems.length === 0 && !catalogsError;

  return (
    <div className="space-y-3 pt-2 border-t border-border" data-testid="jd-field-validation-section">
      <div className="col-span-12 space-y-1 sm:col-span-6">
        <Label>Nguồn danh sách *</Label>
        <Select
          value={validationSource}
          onValueChange={(v) => onValidationSourceChange(v as JdSelectSource)}
        >
          <SelectTrigger data-testid="jd-field-validation-source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JD_SELECT_SOURCES.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {JD_SELECT_SOURCE_LABELS[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-xevn-textSecondary">
          {validationSource === JD_SELECT_SOURCE_RUNTIME
            ? 'Tham chiếu nguồn — chỉ hiển thị trên Writer, BE chưa hỗ trợ lưu runtime.'
            : validationSource === JD_SELECT_SOURCE_CATALOG
              ? 'Chọn catalog hệ thống (VAL-JD-21).'
              : 'Tự định nghĩa danh sách (VAL-JD-22, 1-50).'}
        </p>
      </div>

      {validationSource === JD_SELECT_SOURCE_STATIC ? (
        <div className="col-span-12 space-y-1">
          <Label>Tùy chọn (cách nhau bằng Enter hoặc dấu phẩy) *</Label>
          <Textarea
            value={validationOptions}
            onChange={(e) => onValidationOptionsChange(e.target.value)}
            placeholder="Ví dụ: Lương cao, Môi trường tốt, Phúc lợi đầy đủ"
            rows={3}
            className="min-h-[80px]"
            data-testid="jd-field-validation-options"
          />
          <p className="text-xs text-xevn-textSecondary">
            Mỗi dòng hoặc cách nhau bởi dấu phẩy. Tối thiểu 1, tối đa 50 tùy chọn
            {staticOptionCount ? ` · đang nhập ${staticOptionCount}` : ''}.
          </p>
        </div>
      ) : null}

      {validationSource === JD_SELECT_SOURCE_CATALOG ? (
        <div className="col-span-12 space-y-1 sm:col-span-6">
          <Label>Catalog key *</Label>
          <Select
            value={validationCatalogKey}
            onValueChange={onValidationCatalogKeyChange}
          >
            <SelectTrigger data-testid="jd-field-validation-catalog-key">
              <SelectValue placeholder="Chọn danh mục…" />
            </SelectTrigger>
            <SelectContent>
              {JD_SELECT_CATALOG_ALLOWLIST.map((item) => (
                <SelectItem key={item} value={item}>
                  {JD_SELECT_CATALOG_LABELS[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationCatalogKey ? (
            showCatalogLoading ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Đang tải danh mục…
              </p>
            ) : catalogsError ? (
              <p className="text-xs text-warning">Không tải được danh mục — chọn key rồi lưu (VAL-JD-21).</p>
            ) : liveItems.length === 0 ? (
              <p className="text-xs text-xevn-textSecondary">
                Danh mục «{validationCatalogKey}» trống — lưu key, BE sẽ validate khi submit.
              </p>
            ) : (
              <p className="text-xs text-xevn-textSecondary">
                {liveItems.length} mục hiện có: {liveItems.slice(0, 6).map(selectCatalogItemLabel).join(', ')}
                {liveItems.length > 6 ? '…' : ''}
              </p>
            )
          ) : null}
          <p className="text-xs text-xevn-textSecondary">Lấy từ danh mục XBOS/HRM có sẵn.</p>
        </div>
      ) : null}

      {validationSource === JD_SELECT_SOURCE_RUNTIME ? (
        <div className="col-span-12 space-y-1 sm:col-span-6">
          <Label>Tham chiếu nguồn *</Label>
          <Input
            value={validationSourceRef}
            onChange={(e) => onValidationSourceRefChange(e.target.value)}
            placeholder="vd: job_grades_runtime"
            data-testid="jd-field-validation-source-ref"
          />
          <p className="text-xs text-xevn-textSecondary">
            Đọc sẵn trên Writer (không lưu được trên BE hiện tại). {existingValidation?.note ?? ''}
          </p>
        </div>
      ) : null}

      {validationSource === JD_SELECT_SOURCE_RUNTIME ? (
        <div className="col-span-12 space-y-1 sm:col-span-6">
          <Label>Ghi chú (tuỳ chọn)</Label>
          <Input
            value={validationNote}
            onChange={(e) => onValidationNoteChange(e.target.value)}
            placeholder="Mô tả nguồn tham chiếu…"
            data-testid="jd-field-validation-note"
          />
        </div>
      ) : null}
    </div>
  );
}