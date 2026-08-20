/**
 * @CODE-MEMORY
 * Screen:     HRM Settings — dual SoT leave_types (group REF) vs att_leave_type (tenant writer)
 * UC:         HRM-SC-01 · FR-HRM-SC-LEAVE-01 · BR-PLT-06 · L-ATT-LEAVE-02/03
 * SRS:        docs/hrm/SRS.md §16 · docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md §2.5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01.md §4 L-ATT-LEAVE-*
 * Purpose:    Guard settings-catalog extension mutate on leave_types; stamp Nest writer paths for overview.
 * WorkItem:   PO-HRM-SETTINGS-ATT-LVT-SOT-BE-01
 * Coded:      2026-08-10
 * Callers:    settings-catalogs.service (append/delete/removal/overview)
 * must_keep:  XBOS pull/sync leave_types REF · F-ATT-CAT-LVT/EFF · U65 no seed
 * SOLID:      Pure policy — no Nest inject
 * LastVerified: hrm-settings-leave-type-sot.spec.ts
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  normalizeMasterCatalogKey,
  resolveCatalogFamily,
} from './hrm-settings-master-keys';

export const HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN =
  'HRM-SC-LEAVE-REF-ONLY' as const;
export const HRM_SC_LEAVE_TENANT_WRITER_API =
  '/api/hrm/attendance/leave-types' as const;
export const HRM_SC_LEAVE_EFFECTIVE_API =
  '/api/hrm/attendance/leave-types/effective' as const;

export type LeaveTypesTenantWriterMeta = {
  kind: 'att_leave_type';
  apiPath: typeof HRM_SC_LEAVE_TENANT_WRITER_API;
  effectiveApiPath: typeof HRM_SC_LEAVE_EFFECTIVE_API;
  groupRefReadOnly: true;
};

export const LEAVE_TYPES_TENANT_WRITER_META: LeaveTypesTenantWriterMeta = {
  kind: 'att_leave_type',
  apiPath: HRM_SC_LEAVE_TENANT_WRITER_API,
  effectiveApiPath: HRM_SC_LEAVE_EFFECTIVE_API,
  groupRefReadOnly: true,
};

export function isLeaveTypesGroupRefCatalogKey(catalogKey: string): boolean {
  const fam = resolveCatalogFamily(normalizeMasterCatalogKey(catalogKey));
  return fam.familyId === 'leave';
}

/** Settings extension_items / MD upsert on leave_types — REF partition only (tenant writer = Nest). */
export function assertLeaveTypesExtensionMutateForbidden(
  catalogKey: string,
): void {
  if (!isLeaveTypesGroupRefCatalogKey(catalogKey)) {
    return;
  }
  throw new ApiException(
    HRM_SC_LEAVE_REF_EXTENSION_FORBIDDEN,
    'leave_types trên settings-catalogs chỉ là REF tập đoàn (kéo XBOS) — CRUD tenant dùng /api/hrm/attendance/leave-types (att_leave_type)',
    HttpStatus.CONFLICT,
  );
}
