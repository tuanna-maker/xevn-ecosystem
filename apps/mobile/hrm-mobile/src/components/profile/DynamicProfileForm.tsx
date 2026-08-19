/**
 * @CODE-MEMORY
 * Screen:     TabProfile â†’ Profile â†’ ThĂ´ng tin â€” DynamicProfileForm
 * UC:         UC-HRM-MOB-12 full (W7-6)
 * BR:         BR-ESS-01 Â· BR-ESS-02 Â· AC-ESS-01..02
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md Â§4.5
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md DynamicProfileForm
 * Purpose:    Catalog-driven ESS profile fields â€” self editors â‰¥44px; read-only rows for HR-only.
 * WorkItem:   PCOMP-W7-MOB-PROFILE-FULL-01
 * Coded:      2026-07-19
 * @CODE-MEMORY-CHANGE 2026-07-28 â€” J-MOB-12 testIDs must_keep for qa-device
 *
 * Callers:
 *   - features/profile/ProfileScreen.tsx
 *
 * Callees:
 *   - FormField Â· PrimaryButton Â· ProfileSectionCard Â· IconDetailRow
 *   - dynamicProfileForm helpers
 *
 * FE-Actions:
 *   | User action     | Handler        | Lib                          |
 *   |-----------------|----------------|------------------------------|
 *   | Äá»•i SÄT â†’ LÆ°u   | onSave         | parent â†’ PATCH custom_fields |
 *
 * Impact:     Missing testIDs â†’ qa-device J-MOB-12 blind; <44px â†’ U49 FAIL
 * must_keep:  testID dynamic-profile-form Â· employee_code never editable Â· touch â‰¥44
 * SOLID:      Presentational form â€” save/load owned by ProfileScreen
 * LastVerified: components/profile/__tests__/dynamicProfileFormUx.test.ts
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FormField } from '../ui/FormField';
import { PrimaryButton } from '../ui/PrimaryButton';
import { IconDetailRow } from './IconDetailRow';
import { ProfileSectionCard } from './ProfileSectionCard';
import {
  DYNAMIC_PROFILE_TOUCH_MIN,
  type DynamicProfileField,
} from '../../utils/dynamicProfileForm';
import { colors, typography } from '../../theme/tokens';
import { vi } from '../../i18n/vi';

type DynamicProfileFormProps = {
  fields: DynamicProfileField[];
  draft: Record<string, string>;
  onChangeField: (code: string, value: string) => void;
  onSave: () => void;
  saving?: boolean;
  canSave: boolean;
  hint?: string;
};

function iconForCode(code: string): React.ComponentProps<typeof IconDetailRow>['icon'] {
  if (code === 'email') return 'mail-outline';
  if (code.includes('phone')) return 'call-outline';
  if (code.includes('address') || code.includes('hometown')) return 'location-outline';
  if (code === 'gender') return 'people-outline';
  if (code === 'employee_code' || code === 'national_id') return 'id-card-outline';
  return 'ellipse-outline';
}

export function DynamicProfileForm({
  fields,
  draft,
  onChangeField,
  onSave,
  saving = false,
  canSave,
  hint,
}: DynamicProfileFormProps) {
  const { readOnly, editable } = useMemo(() => {
    const ro: DynamicProfileField[] = [];
    const ed: DynamicProfileField[] = [];
    for (const f of fields) {
      if (f.editableBy === 'self' || f.editableBy === 'hr') ed.push(f);
      else ro.push(f);
    }
    return { readOnly: ro, editable: ed };
  }, [fields]);

  return (
    <View testID="dynamic-profile-form" style={styles.root}>
      {readOnly.length > 0 ? (
        <ProfileSectionCard
          title="ThĂ´ng tin há»“ sÆ¡"
          icon="person-outline"
          testID="profile-ess-readonly-section"
        >
          {readOnly.map((row) => (
            <IconDetailRow
              key={row.code}
              icon={iconForCode(row.code)}
              label={row.label}
              value={row.displayValue}
              testID={`profile-ess-field-${row.code}`}
            />
          ))}
        </ProfileSectionCard>
      ) : null}

      {editable.length > 0 ? (
        <ProfileSectionCard
          title="Cáº­p nháº­t liĂªn há»‡"
          icon="create-outline"
          testID="profile-ess-edit-section"
        >
          {editable.map((field) => (
            <View
              key={field.code}
              style={styles.fieldWrap}
              testID={`profile-ess-editor-${field.code}`}
            >
              <FormField
                label={field.label}
                value={draft[field.code] ?? field.value}
                onChangeText={(t) => onChangeField(field.code, t)}
                keyboardType={field.keyboardType}
                multiline={field.multiline}
                autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'sentences'}
                placeholder={field.label}
                editable={!saving}
              />
            </View>
          ))}
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
          <PrimaryButton
            label={saving ? vi.loading : vi.save}
            onPress={onSave}
            disabled={!canSave || saving}
            loading={saving}
            testID="profile-ess-save"
            accessibilityLabel="LÆ°u thĂ´ng tin liĂªn há»‡"
            style={styles.saveBtn}
          />
        </ProfileSectionCard>
      ) : (
        <ProfileSectionCard title="Cáº­p nháº­t há»“ sÆ¡" icon="information-circle-outline">
          <Text style={styles.hint} testID="profile-ess-hr-hint">
            {hint ||
              'Báº¡n cĂ³ thá»ƒ Ä‘á»•i áº£nh Ä‘áº¡i diá»‡n á»Ÿ trĂªn. Sá»‘ Ä‘iá»‡n thoáº¡i vĂ  thĂ´ng tin khĂ¡c â€” liĂªn há»‡ HR náº¿u khĂ´ng chá»‰nh Ä‘Æ°á»£c táº¡i Ä‘Ă¢y.'}
          </Text>
        </ProfileSectionCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },
  fieldWrap: {
    minHeight: DYNAMIC_PROFILE_TOUCH_MIN,
    marginBottom: 8,
  },
  saveBtn: {
    marginTop: 8,
    minHeight: DYNAMIC_PROFILE_TOUCH_MIN,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    marginBottom: 8,
  },
});
