/**
 * Bảng danh sách điều khoản HĐ — dùng chung list + popup (Settings IA).
 * WorkItem: PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 */
import type { HrmContractClauseRecord } from '@/integrations/hrmApi';
import {
  clauseGroupLabelVi,
  clausePackLabelsVi,
  clauseStatusLabelVi,
} from '@/lib/contractClauseLibraryUx';
import { contractLibraryOriginDetailText } from '@/lib/contractLibraryPublishRequest';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type ContractClauseListTableProps = {
  rows: HrmContractClauseRecord[];
  onEdit: (row: HrmContractClauseRecord) => void;
  onActivate: (id: string) => void;
  onRetire: (id: string) => void;
  emptyMessage?: string;
};

export function ContractClauseListTable({
  rows,
  onEdit,
  onActivate,
  onRetire,
  emptyMessage = 'Không có điều khoản phù hợp bộ lọc.',
}: ContractClauseListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã</TableHead>
          <TableHead>Tiêu đề</TableHead>
          <TableHead>Nhóm</TableHead>
          <TableHead>TT</TableHead>
          <TableHead>Ver</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((c) => (
            <TableRow key={c.id} data-testid={`ctr-clause-row-${c.code}`}>
              <TableCell className="font-mono text-xs">{c.code}</TableCell>
              <TableCell className="max-w-[240px] truncate font-medium">{c.title_vi}</TableCell>
              <TableCell className="text-xs">{clauseGroupLabelVi(c.clause_group)}</TableCell>
              <TableCell className="text-xs" data-testid={`ctr-clause-status-label-${c.code}`}>
                {clauseStatusLabelVi(c.status)}
              </TableCell>
              <TableCell className="text-xs">{c.version}</TableCell>
              <TableCell className="space-x-1 whitespace-nowrap">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(c)}
                  data-testid={`settings-contract-clauses-row-${c.id}-edit`}
                >
                  Sửa
                </Button>
                {c.status !== 'active' ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    data-testid={`settings-contract-clauses-row-${c.id}-activate`}
                    onClick={() => onActivate(c.id)}
                  >
                    Hiệu lực
                  </Button>
                ) : null}
                {c.status !== 'retired' ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    data-testid={`settings-contract-clauses-row-${c.id}-delete`}
                    onClick={() => onRetire(c.id)}
                  >
                    Ngừng
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
