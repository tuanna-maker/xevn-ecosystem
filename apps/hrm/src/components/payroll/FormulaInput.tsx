import { useState, useRef, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface FormulaInputProps {
  value: string;
  onChange: (value: string) => void;
  availableComponents: { code: string; name: string }[];
  placeholder?: string;
  className?: string;
}

// Excel-like formula functions
const EXCEL_FUNCTIONS = [
  'SUM', 'IF', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'MIN', 'MAX', 'AVG', 'ABS',
  'AND', 'OR', 'NOT', 'IFERROR', 'VLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH',
  'COUNT', 'COUNTA', 'COUNTIF', 'SUMIF', 'AVERAGEIF', 'CEILING', 'FLOOR',
  'MOD', 'POWER', 'SQRT', 'LEN', 'LEFT', 'RIGHT', 'MID', 'TRIM', 'UPPER',
  'LOWER', 'CONCATENATE', 'TEXT', 'VALUE', 'DATE', 'YEAR', 'MONTH', 'DAY',
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate formula syntax
const validateFormula = (
  formula: string, 
  availableCodes: string[],
  t: ReturnType<typeof import('react-i18next').useTranslation>['t']
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!formula.trim()) {
    return { isValid: true, errors: [], warnings: [] };
  }
  
  // Check if formula starts with =
  if (!formula.startsWith('=')) {
    errors.push(t('formulaInput.mustStartWithEquals'));
    return { isValid: false, errors, warnings };
  }
  
  const formulaContent = formula.slice(1);
  
  // Check for balanced parentheses
  let parenCount = 0;
  for (const char of formulaContent) {
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (parenCount < 0) {
      errors.push(t('formulaInput.extraCloseParen'));
      break;
    }
  }
  if (parenCount > 0) {
    errors.push(t('formulaInput.missingCloseParen', { count: parenCount }));
  }
  
  // Check for empty parentheses in functions (but allow for optional params)
  const emptyFuncMatch = formulaContent.match(/[A-Z_]+\(\s*\)/);
  if (emptyFuncMatch) {
    warnings.push(t('formulaInput.emptyFunction', { name: emptyFuncMatch[0] }));
  }
  
  // Check for unknown functions
  const funcMatches = formulaContent.match(/[A-Z][A-Z_]*(?=\()/g) || [];
  for (const func of funcMatches) {
    if (!EXCEL_FUNCTIONS.includes(func)) {
      warnings.push(t('formulaInput.unknownFunction', { name: func }));
    }
  }
  
  // Check for referenced components that don't exist
  const componentRefs = formulaContent.match(/[A-Z][A-Z0-9_]+/g) || [];
  for (const ref of componentRefs) {
    // Skip if it's a function name
    if (EXCEL_FUNCTIONS.includes(ref)) continue;
    // Check if it's a valid component
    if (!availableCodes.includes(ref)) {
      warnings.push(t('formulaInput.componentNotExist', { code: ref }));
    }
  }
  
  // Check for consecutive operators
  if (/[+\-*/]{2,}/.test(formulaContent)) {
    errors.push(t('formulaInput.consecutiveOperators'));
  }
  
  // Check for operator at end
  if (/[+\-*/,]$/.test(formulaContent.trim())) {
    errors.push(t('formulaInput.endsWithOperator'));
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Get current word being typed for autocomplete
const getCurrentWord = (value: string, cursorPos: number): { word: string; start: number } => {
  const beforeCursor = value.slice(0, cursorPos);
  const match = beforeCursor.match(/[A-Z_][A-Z0-9_]*$/i);
  if (match) {
    return { word: match[0].toUpperCase(), start: cursorPos - match[0].length };
  }
  return { word: '', start: cursorPos };
};

export const FormulaInput = ({
  value,
  onChange,
  availableComponents,
  placeholder,
  className,
}: FormulaInputProps) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const availableCodes = useMemo(() => availableComponents.map(c => c.code), [availableComponents]);
  
  const validation = useMemo(
    () => validateFormula(value, availableCodes, t), 
    [value, availableCodes, t]
  );
  
  const { word: currentWord, start: wordStart } = useMemo(
    () => getCurrentWord(value, cursorPosition),
    [value, cursorPosition]
  );
  
  // Generate suggestions based on current word
  const suggestions = useMemo(() => {
    if (!currentWord || currentWord.length < 1) return [];
    
    const componentSuggestions = availableComponents
      .filter(c => c.code.startsWith(currentWord))
      .map(c => ({ type: 'component' as const, code: c.code, name: c.name }));
    
    const functionSuggestions = EXCEL_FUNCTIONS
      .filter(f => f.startsWith(currentWord))
      .map(f => ({ type: 'function' as const, code: f, name: `${t('formulaInput.function')} ${f}` }));
    
    return [...componentSuggestions, ...functionSuggestions].slice(0, 10);
  }, [currentWord, availableComponents, t]);
  
  // Show suggestions when there are matches and input is focused
  useEffect(() => {
    setShowSuggestions(isFocused && suggestions.length > 0 && currentWord.length > 0);
    setSelectedSuggestionIndex(0);
  }, [isFocused, suggestions.length, currentWord]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };
  
  // Handle cursor movement
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart || 0);
  };
  
  // Insert suggestion
  const insertSuggestion = (suggestion: { code: string; type: 'component' | 'function' }) => {
    const before = value.slice(0, wordStart);
    const after = value.slice(cursorPosition);
    const insertText = suggestion.type === 'function' ? `${suggestion.code}()` : suggestion.code;
    const newValue = before + insertText + after;
    onChange(newValue);
    
    // Set cursor position after inserted text (or inside parentheses for functions)
    const newCursorPos = suggestion.type === 'function' 
      ? before.length + suggestion.code.length + 1 
      : before.length + insertText.length;
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        setCursorPosition(newCursorPos);
      }
    }, 0);
    
    setShowSuggestions(false);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        if (suggestions[selectedSuggestionIndex]) {
          e.preventDefault();
          insertSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };
  
  // Scroll selected suggestion into view
  useEffect(() => {
    if (suggestionsRef.current && showSuggestions) {
      const selected = suggestionsRef.current.children[selectedSuggestionIndex] as HTMLElement;
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedSuggestionIndex, showSuggestions]);
  
  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('formulaInput.placeholder')}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            validation.errors.length > 0 && value ? "border-destructive" : "border-input",
            validation.warnings.length > 0 && validation.errors.length === 0 && value ? "border-amber-500" : "",
            className
          )}
        />
        
        {/* Validation status icon */}
        {value && (
          <div className="absolute top-2 right-2">
            {validation.isValid && validation.warnings.length === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : validation.errors.length > 0 ? (
              <AlertCircle className="w-4 h-4 text-destructive" />
            ) : (
              <Info className="w-4 h-4 text-amber-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Autocomplete suggestions dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.code}`}
              className={cn(
                "flex items-center justify-between px-3 py-2 cursor-pointer text-sm",
                index === selectedSuggestionIndex ? "bg-accent" : "hover:bg-muted/50"
              )}
              onMouseDown={() => insertSuggestion(suggestion)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-medium",
                  suggestion.type === 'function' 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}>
                  {suggestion.type === 'function' ? t('formulaInput.function') : t('formulaInput.component')}
                </span>
                <span className="font-mono font-medium">{suggestion.code}</span>
              </div>
              <span className="text-xs text-muted-foreground truncate ml-2 max-w-[200px]">
                {suggestion.name}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Validation messages */}
      {value && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="mt-2 space-y-1">
          {validation.errors.map((error, index) => (
            <p key={`error-${index}`} className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {error}
            </p>
          ))}
          {validation.warnings.map((warning, index) => (
            <p key={`warning-${index}`} className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              {warning}
            </p>
          ))}
        </div>
      )}
      
      {/* Helper text */}
      {!value && (
        <p className="mt-1 text-xs text-muted-foreground">
          {t('formulaInput.helperText')}
        </p>
      )}
    </div>
  );
};