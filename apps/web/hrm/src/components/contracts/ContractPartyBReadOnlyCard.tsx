/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard — Bên B read-only
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01 · O3
 */
import type { ContractCreateContextSnapshot } from '@/lib/contractCreateApi';

export type ContractPartyBReadOnlyCardProps = {
  party: ContractCreateContextSnapshot['employee_party_b'];
};

export function ContractPartyBReadOnlyCard({ party }: ContractPartyBReadOnlyCardProps) {
  return (
    <div className="rounded-card border p-4 space-y-2" data-testid="ctr-create-party-b-card">
      <p className="text-sm font-medium">Bên B (nhân viên)</p>
      <div className="grid grid-cols-12 gap-3 text-sm">
        <div className="col-span-4">
          <p className="text-xs text-muted-foreground">Họ và tên</p>
          <p>{party.full_name}</p>
        </div>
        <div className="col-span-4">
          <p className="text-xs text-muted-foreground">CCCD/CMND</p>
          <p>{party.id_number}</p>
        </div>
        <div className="col-span-4">
          <p className="text-xs text-muted-foreground">Điện thoại</p>
          <p>{party.phone}</p>
        </div>
        <div className="col-span-4">
          <p className="text-xs text-muted-foreground">Ngày sinh</p>
          <p>{party.dob_display}</p>
        </div>
        <div className="col-span-4">
          <p className="text-xs text-muted-foreground">Chức danh</p>
          <p>{party.job_title}</p>
        </div>
      </div>
    </div>
  );
}
