/**
 * Select dropdown trong Dialog/Sheet HRM embed.
 * WorkItem: DEF-SETTINGS-SELECT-IN-DIALOG-EMBED-01 · DEF-FLOATING-IN-DIALOG-Z-INDEX-01
 *
 * SelectContent tự đọc HrmOverlayPortalScopeContext từ Dialog/Sheet:
 * - Dialog parent (CC embed): dropdown parent z-[100010]
 * - Dialog iframe / standalone: dropdown iframe z-[100] (trên overlay dialog z-50)
 */
import * as React from 'react';
import { SelectContent } from '@/components/ui/select';

type SettingsDialogSelectContentProps = React.ComponentPropsWithoutRef<typeof SelectContent>;

export const SettingsDialogSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  SettingsDialogSelectContentProps
>((props, ref) => <SelectContent ref={ref} portalScope="parent" {...props} />);
SettingsDialogSelectContent.displayName = 'SettingsDialogSelectContent';
