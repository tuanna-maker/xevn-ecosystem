/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard — phụ cấp sub-grid read-only
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01
 */
import type { ContractCreateAllowanceLine } from '@/lib/contractCreateApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type ContractAllowancesSubGridProps = {
  lines: ContractCreateAllowanceLine[];
};

export function ContractAllowancesSubGrid({ lines }: ContractAllowancesSubGridProps) {
  return (
    <div className="space-y-2" data-testid="ctr-create-allowances-grid">
      <p className="text-sm font-medium">Phụ cấp (snapshot)</p>
      {lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có dòng phụ cấp trên gói C&B active.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Diễn giải</TableHead>
              <TableHead className="text-right">Số tiền (VND)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={`${line.code}-${line.label_vi}`}>
                <TableCell className="font-mono text-xs">{line.code}</TableCell>
                <TableCell>{line.label_vi}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {line.amount_vnd.toLocaleString('vi-VN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
