import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsCatalogF5ListPanels } from './SettingsCatalogF5ListPanels';

export function ContractTerminationReasonSettingsPanel() {
  const { t } = useTranslation();

  return (
    <SettingsCatalogF5ListPanels
      tabId="contract-termination-reasons"
      title="Lý do chấm dứt hợp đồng"
      description="Quản lý danh mục lý do nghỉ việc, sa thải, hết hạn hợp đồng."
      catalogKeys={['contract_termination_reasons']}
      defaultWriteKey="contract_termination_reasons"
      enableRefresh={true}
    />
  );
}
