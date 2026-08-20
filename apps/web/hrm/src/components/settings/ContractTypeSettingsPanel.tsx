import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsCatalogF5ListPanels } from './SettingsCatalogF5ListPanels';

export function ContractTypeSettingsPanel() {
  const { t } = useTranslation();

  return (
    <SettingsCatalogF5ListPanels
      tabId="contract-types"
      title="Loại hợp đồng"
      description="Quản lý danh mục loại hợp đồng lao động, thử việc, dịch vụ."
      catalogKeys={['contract_types']}
      defaultWriteKey="contract_types"
      enableRefresh={true}
    />
  );
}
