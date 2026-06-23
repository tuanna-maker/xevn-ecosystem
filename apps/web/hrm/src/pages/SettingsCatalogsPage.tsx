import { SettingsCatalogsTab } from '@/components/settings/SettingsCatalogsTab';

/** UF-HRM-10 — deep link /hr/settings-catalogs */
export default function SettingsCatalogsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Danh mục cài đặt</h1>
        <p className="text-sm text-muted-foreground">
          Đồng bộ danh mục từ XBOS và quản lý mục cài đặt HRM (UF-HRM-10).
        </p>
      </div>
      <SettingsCatalogsTab />
    </div>
  );
}
