import { MetadataQueueTab } from '@/components/settings/MetadataQueueTab';

/** UF-HRM-11 — deep link /hr/employee-metadata */
export default function EmployeeMetadataPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Hàng chờ metadata nhân sự</h1>
        <p className="text-sm text-muted-foreground">
          Duyệt yêu cầu thay đổi metadata nhân viên (UC-HRM-26 · UF-HRM-11).
        </p>
      </div>
      <MetadataQueueTab />
    </div>
  );
}
