/**
 * @CODE-MEMORY
 * Screen:                HRM Lương → Thiết lập lương → Loại Hợp đồng & Loại hình Lao động (Wave 4)
 * UC:                    UC-HRM-CTR-TYPE-01..02
 * SRS:                   docs/program/deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_SRS_01_20260813.md
 * TechSpec:              docs/program/deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_TECHSPEC_01_20260813.md
 * UI:                    docs/hrm/ui-screens/UI-HRM-CONTRACT-EMPLOYMENT-TYPE-01.md
 * WorkItem:              D-PO-HRM-CTR-EMP-TYPE-FE-01
 * solid_convention_ack:  Refactored to SOLID using useContractEmploymentTypes hook & CatalogHeaderBanner.
 */
import { FileCheck, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useContractEmploymentTypes } from './hooks/useContractEmploymentTypes';
import { CatalogHeaderBanner } from './components/CatalogHeaderBanner';

export function ContractEmploymentTypesSetupScreen() {
  const { activeTab, setActiveTab, contractTypes, employmentTypes } = useContractEmploymentTypes();

  return (
    <div className="space-y-4" data-testid="contract-employment-types-setup-screen">
      <CatalogHeaderBanner
        message={
          <>
            Danh mục Loại Hợp đồng & Loại hình Lao động sử dụng cơ chế <strong>`emp_employment_type` Group Ref</strong>.
          </>
        }
      />

      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('CONTRACT')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'CONTRACT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
          data-testid="tab-contract-types"
        >
          <FileCheck className="mr-1.5 h-3.5 w-3.5 inline" /> Loại Hợp đồng Lao động ({contractTypes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('EMPLOYMENT')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'EMPLOYMENT' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
          data-testid="tab-employment-types"
        >
          <Users className="mr-1.5 h-3.5 w-3.5 inline" /> Loại hình Lao động ({employmentTypes.length})
        </button>
      </div>

      {activeTab === 'CONTRACT' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left" data-testid="contract-types-table">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3">Mã loại hợp đồng</th>
                    <th className="px-4 py-3">Tên loại hợp đồng</th>
                    <th className="px-4 py-3">Thời hạn chuẩn</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contractTypes.map((ct) => (
                    <tr key={ct.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono font-medium">{ct.code}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{ct.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ct.durationRange}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left" data-testid="employment-types-table">
                <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3">Mã loại hình lao động</th>
                    <th className="px-4 py-3">Tên loại hình</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employmentTypes.map((et) => (
                    <tr key={et.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-mono font-medium">{et.code}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{et.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
