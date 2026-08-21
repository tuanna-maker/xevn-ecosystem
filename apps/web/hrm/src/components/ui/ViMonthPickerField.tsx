/**
 * @CODE-MEMORY
 * Screen:     Shared HRM month picker (modal-safe)
 * UC:         Month selection (e.g., Recruitment Dashboard, Payroll)
 * Purpose:    Nhập tháng dạng vi-VN (MM/yyyy), output chuỗi yyyy-MM
 * WorkItem:   UI-SYNC-MONTH-PICKER
 * Coded:      2026-08-20
 * Callers:    RecruitmentNestDashboardPanel, Payroll
 * Callees:    Popover
 * FEActions:  Chọn tháng từ Popover grid -> yyyy-MM
 * must_keep:  portalScope support for iframe embedding
 * SOLID:      Wrapper thay thế native input type="month"
 */

import { useState } from 'react';
import { format, parse } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ViMonthPickerFieldProps = {
  value?: string; // Format: "yyyy-MM"
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  portalScope?: 'iframe' | 'parent';
};

export function ViMonthPickerField({
  value,
  onValueChange,
  placeholder = 'Chọn tháng',
  disabled,
  className,
  portalScope,
}: ViMonthPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const valueYear = value ? parseInt(value.split('-')[0], 10) : currentYear;
  const [viewYear, setViewYear] = useState(valueYear || currentYear);

  const months = [
    'Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6',
    'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'
  ];

  const handleSelect = (monthIndex: number) => {
    const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
    onValueChange(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  const displayValue = value ? format(parse(value, 'yyyy-MM', new Date()), 'MM/yyyy') : '';

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) {
        setViewYear(value ? parseInt(value.split('-')[0], 10) : new Date().getFullYear());
      }
    }} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-start text-left font-normal', !value && 'text-muted-foreground', className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4 bg-background" align="start" portalScope={portalScope}>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewYear(y => y - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold text-sm">{viewYear}</div>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewYear(y => y + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => {
            const isSelected = value === `${viewYear}-${(index + 1).toString().padStart(2, '0')}`;
            return (
              <Button
                key={month}
                variant={isSelected ? 'default' : 'ghost'}
                className="h-9"
                onClick={() => handleSelect(index)}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
