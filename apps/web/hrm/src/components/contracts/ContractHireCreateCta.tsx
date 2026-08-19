/**
 * @CODE-MEMORY
 * Screen:     REC — CTA «Tạo HĐ» sau chốt tuyển
 * UC:         FR-HRM-INT-01 · AC-CTR-HIRE-CTA-01
 * WorkItem:   PO-HRM-CTR-WORKSPACE-WAVE-G3
 * Purpose:    Deep-link to ContractWorkspace create with NV prefill (+ optional probation template).
 */
import { Link } from 'react-router-dom';
import { FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildContractHireCtaPath } from '@/lib/contractWorkspaceHireCta';

export type ContractHireCreateCtaProps = {
  employeeId: string;
  templateCode?: string;
  className?: string;
  size?: 'sm' | 'default';
};

export function ContractHireCreateCta({
  employeeId,
  templateCode,
  className,
  size = 'sm',
}: ContractHireCreateCtaProps) {
  const id = employeeId.trim();
  if (!id) return null;

  const href = buildContractHireCtaPath(id, {
    templateCode,
    embedSearch: typeof window !== 'undefined' ? window.location.search : '',
  });

  return (
    <Button
      type="button"
      size={size}
      className={className}
      variant="default"
      asChild
      data-testid="rec-hire-cta-create-contract"
    >
      <Link to={href}>
        <FileSignature className="h-4 w-4 mr-1" />
        Tạo HĐ
      </Link>
    </Button>
  );
}
