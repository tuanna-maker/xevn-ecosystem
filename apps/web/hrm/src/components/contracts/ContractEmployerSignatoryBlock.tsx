/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard — đại diện công ty ký
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01
 */
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ContractEmployerSignatoryBlockProps = {
  employer: { legal_name: string; unit_label: string };
  signerName: string;
  signerPosition: string;
  onSignerNameChange: (v: string) => void;
  onSignerPositionChange: (v: string) => void;
};

export function ContractEmployerSignatoryBlock({
  employer,
  signerName,
  signerPosition,
  onSignerNameChange,
  onSignerPositionChange,
}: ContractEmployerSignatoryBlockProps) {
  return (
    <div className="space-y-3" data-testid="ctr-create-signatory-block">
      <p className="text-sm font-medium">Bên A & người đại diện ký</p>
      <div className="grid grid-cols-12 gap-3 text-sm">
        <div className="col-span-6">
          <p className="text-xs text-muted-foreground">Pháp nhân</p>
          <p>{employer.legal_name}</p>
        </div>
        <div className="col-span-6">
          <p className="text-xs text-muted-foreground">Đơn vị</p>
          <p>{employer.unit_label}</p>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6 space-y-2">
          <Label htmlFor="ctr-signer-name">Người đại diện công ty ký</Label>
          <Input
            id="ctr-signer-name"
            value={signerName}
            onChange={(e) => onSignerNameChange(e.target.value)}
            placeholder="Họ tên người ký"
          />
        </div>
        <div className="col-span-6 space-y-2">
          <Label htmlFor="ctr-signer-position">Chức danh người ký</Label>
          <Input
            id="ctr-signer-position"
            value={signerPosition}
            onChange={(e) => onSignerPositionChange(e.target.value)}
            placeholder="Giám đốc / Phó GĐ…"
          />
        </div>
      </div>
    </div>
  );
}
