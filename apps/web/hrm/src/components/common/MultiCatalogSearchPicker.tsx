import { useMemo, useState, useRef, KeyboardEvent } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  filterCatalogPickerOptions,
  type CatalogPickerOption,
} from '@/lib/catalogSearchPicker';

export type MultiCatalogSearchPickerProps = {
  options: readonly CatalogPickerOption[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  errorText?: string;
  className?: string;
  triggerClassName?: string;
};

const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function displayCodeForOption(opt: CatalogPickerOption): string | null {
  const code = (opt.code ?? '').trim();
  if (!code || code === opt.value.trim()) return null;
  if (UUID_LIKE.test(code) || UUID_LIKE.test(opt.value)) return null;
  return code;
}

function cmdkItemValue(opt: CatalogPickerOption): string {
  const label = opt.label.trim();
  return label.length > 0 ? `${label} ${opt.value}` : opt.value;
}

export function MultiCatalogSearchPicker({
  options,
  values,
  onValuesChange,
  placeholder = 'Chọn các mục…',
  emptyText = 'Không có mục khớp',
  disabled,
  loading,
  errorText,
  className,
  triggerClassName,
}: MultiCatalogSearchPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = useMemo(
    () => values.map(v => options.find(o => o.value === v)).filter(Boolean) as CatalogPickerOption[],
    [options, values],
  );

  const filtered = useMemo(
    () => filterCatalogPickerOptions(options, query),
    [options, query],
  );

  const handleUnselect = (value: string) => {
    onValuesChange(values.filter((v) => v !== value));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (input) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && input.value === '' && values.length > 0) {
        onValuesChange(values.slice(0, -1));
      }
      if (e.key === 'Escape') {
        input.blur();
        setOpen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className={cn('flex min-h-10 w-full items-center gap-2 rounded-input border border-xevn-border px-3 py-2 text-sm text-muted-foreground', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải...
      </div>
    );
  }

  if (errorText) {
    return (
      <div className={cn('rounded-input border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive', className)}>
        {errorText}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-input border border-xevn-border bg-background px-3 py-2 text-sm ring-offset-background cursor-text hover:bg-accent/10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            disabled && 'cursor-not-allowed opacity-50',
            className,
            triggerClassName
          )}
          onClick={() => {
            if (!disabled) {
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          {selectedOptions.length === 0 && !query && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          
          {selectedOptions.map((opt) => (
            <Badge
              key={opt.value}
              variant="secondary"
              className="hover:bg-secondary flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-normal"
            >
              {displayCodeForOption(opt) ? (
                <span className="font-mono text-[10px] text-muted-foreground mr-1">{displayCodeForOption(opt)}</span>
              ) : null}
              {opt.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUnselect(opt.value);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnselect(opt.value);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[50px] text-sm h-5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={selectedOptions.length === 0 ? '' : ''}
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filtered.map((opt) => {
                const isSelected = values.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={cmdkItemValue(opt)}
                    onSelect={() => {
                      if (isSelected) {
                        onValuesChange(values.filter((v) => v !== opt.value));
                      } else {
                        onValuesChange([...values, opt.value]);
                      }
                      setQuery('');
                    }}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {displayCodeForOption(opt) ? (
                      <span className="font-mono text-xs text-muted-foreground mr-2">{displayCodeForOption(opt)}</span>
                    ) : null}
                    <span>{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
