/**
 * @CODE-MEMORY WorkItem: BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-01
 * Clause override editor — fetch GET/PUT /contract-templates/:code/clauses/:id
 * TV tab hide DEFERRED: ContractCreateWizardDialog.tsx Cursor-held
 * FE boundary: no DB join, no Prisma, display-ready from API response only.
 */
import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  getContractClauseOverride,
  upsertContractClauseOverride,
  type ClauseOverrideRow,
} from '@/integrations/hrmApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';

export interface ContractClauseOverrideEditorProps {
  templateCode: string; // e.g. 'XEVN_FT_12M_OFFICE'
  clauseId: string;     // e.g. 'CTR-CLAUSE-001'
  onSaved?: () => void;
}

type LoadState = 'idle' | 'loading' | 'error' | 'ready';

const SOURCE_LABELS: Record<string, string> = {
  template_file: 'Tu mau',
  company_specific: 'Cong ty cu the',
  manual: 'Dien tay',
};

export function ContractClauseOverrideEditor({
  templateCode,
  clauseId,
  onSaved,
}: ContractClauseOverrideEditorProps) {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [row, setRow] = useState<ClauseOverrideRow | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [overrideText, setOverrideText] = useState<string>('');
  const [source, setSource] = useState<string>('template_file');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);
    try {
      const { item, warnings: w } = await getContractClauseOverride(templateCode, clauseId);
      setRow(item);
      setWarnings(w);
      setOverrideText(item.override_text ?? '');
      setSource(item.source ?? 'template_file');
      setLoadState('ready');
    } catch (err: unknown) {
      setLoadError(toErrorMessage(err, 'Khong tai duoc du lieu dieu khoan.'));
      setLoadState('error');
    }
  }, [templateCode, clauseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { item, warnings: w } = await upsertContractClauseOverride(templateCode, clauseId, {
        override_text: overrideText,
        source,
      });
      setRow(item);
      setWarnings(w);
      setOverrideText(item.override_text ?? '');
      setSource(item.source ?? 'template_file');
      toast({ title: 'Da luu dieu khoan override' });
      onSaved?.();
    } catch (err: unknown) {
      toast({
        title: 'Loi luu dieu khoan',
        description: toErrorMessage(err, 'Khong luu duoc override.'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div
        className="space-y-2 mt-2"
        data-testid="clause-override-editor"
        data-template-code={templateCode}
        data-clause-id={clauseId}
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div
        className="mt-2 rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        data-testid="clause-override-editor"
        data-template-code={templateCode}
        data-clause-id={clauseId}
      >
        <p>{loadError}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={load}
          disabled={saving}
        >
          Thu lai
        </Button>
      </div>
    );
  }

  return (
    <div
      className="mt-2 space-y-2 rounded border bg-muted/20 p-3 text-sm"
      data-testid="clause-override-editor"
      data-template-code={templateCode}
      data-clause-id={clauseId}
    >
      <p className="text-xs font-medium text-muted-foreground">Override noi dung dieu khoan</p>

      {warnings.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {warnings.map((w, i) => (
            <Badge key={i} variant="outline" className="text-amber-700 border-amber-400 text-xs">
              {w}
            </Badge>
          ))}
        </div>
      ) : null}

      <Textarea
        data-testid="clause-override-text"
        value={overrideText}
        onChange={(e) => setOverrideText(e.target.value)}
        placeholder="Dien tay"
        className="min-h-[80px] text-sm"
        disabled={saving}
      />

      <Select
        value={source}
        onValueChange={(v) => setSource(v)}
        disabled={saving}
      >
        <SelectTrigger
          data-testid="clause-override-source"
          className="h-8 text-xs w-48"
        >
          <SelectValue placeholder="Chon nguon" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="template_file">Tu mau</SelectItem>
          <SelectItem value="company_specific">Cong ty cu the</SelectItem>
          <SelectItem value="manual">Dien tay</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        size="sm"
        data-testid="clause-override-save"
        onClick={handleSave}
        disabled={saving}
        className="text-xs"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
        Luu
      </Button>

      {row ? (
        <p className="text-xs text-muted-foreground">
          Nguon: {SOURCE_LABELS[row.source] ?? row.source}
          {row.updated_by ? <span> · Cap nhat boi {row.updated_by}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
