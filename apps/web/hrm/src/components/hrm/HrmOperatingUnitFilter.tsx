import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Loader2 } from 'lucide-react';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';

/**
 * Group CEO operating-unit switcher — JWT stays main; API query uses selected slug (U39).
 */
export function HrmOperatingUnitFilter() {
  const { showFilter, units, unitsLoading, selectedSlug, setSelectedSlug } =
    useHrmOperatingUnitFilter();

  if (!showFilter) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2 text-sm">
      <Building2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      <span className="font-medium text-slate-800">Đơn vị thành viên</span>
      <Select
        value={selectedSlug}
        onValueChange={(value) => setSelectedSlug(value as typeof selectedSlug)}
      >
        <SelectTrigger className="h-8 w-[min(100%,16rem)] bg-white" aria-label="Lọc đơn vị vận hành">
          <SelectValue placeholder="Tất cả đơn vị" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả đơn vị (rollup)</SelectItem>
          {unitsLoading && units.length === 0 ? (
            <SelectItem value="all" disabled>
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Đang tải…
              </span>
            </SelectItem>
          ) : (
            units.map((unit) => (
              <SelectItem key={unit.operating_slug} value={unit.operating_slug}>
                {unit.display_name_vi}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
