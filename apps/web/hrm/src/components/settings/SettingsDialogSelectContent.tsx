/**
 * Select dropdown trong Dialog/Sheet HRM embed — mount parent + z floating (không iframe).
 * WorkItem: DEF-SETTINGS-SELECT-IN-DIALOG-EMBED-01 · PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 *
 * AC: Mở popup catalog → Select «Nhóm» → danh sách option **trên** overlay dialog, click được.
 * Cấm `portalScope="iframe"` trong Dialog — z-50 iframe body nằm dưới dialog z-[100000] parent.
 */
import * as React from 'react';
import { SelectContent } from '@/components/ui/select';

type SettingsDialogSelectContentProps = React.ComponentPropsWithoutRef<typeof SelectContent>;

export const SettingsDialogSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  SettingsDialogSelectContentProps
>((props, ref) => <SelectContent ref={ref} portalScope="parent" {...props} />);
SettingsDialogSelectContent.displayName = 'SettingsDialogSelectContent';
