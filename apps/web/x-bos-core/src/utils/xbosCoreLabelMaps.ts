import type {
  CascadeAllocationStatus,
  KpiFrequency,
  MetadataDataType,
  OrgUnit,
} from '@/types';

export const ORG_TYPE_LABELS: Record<OrgUnit['orgTypeCode'], string> = {
  holding: 'Tập đoàn',
  subsidiary: 'Công ty thành viên',
  division: 'Khối',
  department: 'Phòng ban',
};

export function resolveOrgTypeCodeLabel(code: string | null | undefined): string {
  if (!code) return '—';
  if (code === 'holding' || code === 'subsidiary' || code === 'division' || code === 'department') {
    return ORG_TYPE_LABELS[code];
  }
  return '—';
}

export function resolveActiveInactiveStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const s = status.trim().toLowerCase();
  if (s === 'active') return 'Đang hoạt động';
  if (s === 'inactive') return 'Tạm dừng';
  return '—';
}

export function resolveRecordStatusLabel(status: string | null | undefined): string {
  // x-bos-core uses both "draft/active/inactive" and "pending_approval/approved/..." styles
  if (!status) return '—';
  const s = status.trim().toLowerCase();
  if (s === 'draft') return 'Nháp';
  if (s === 'active') return 'Đang hoạt động';
  if (s === 'inactive') return 'Tạm dừng';
  return '—';
}

export function resolveKpiFrequencyLabel(freq: string | null | undefined): string {
  if (!freq) return '—';
  const f = freq.trim().toLowerCase() as KpiFrequency | string;
  switch (f) {
    case 'daily':
      return 'Hằng ngày';
    case 'weekly':
      return 'Hằng tuần';
    case 'monthly':
      return 'Hằng tháng';
    default:
      return '—';
  }
}

export function resolveCascadeAllocationStatusLabel(
  status: string | null | undefined,
): string {
  if (!status) return '—';
  const s = status.trim().toLowerCase();
  // CascadeAllocationStatus (x-bos-core types)
  switch (s as CascadeAllocationStatus) {
    case 'draft':
      return 'Nháp';
    case 'pending_approval':
      return 'Chờ duyệt';
    case 'approved':
      return 'Đã duyệt';
    case 'frozen':
      return 'Đã khóa';
    default:
      return '—';
  }
}

export function resolveMetadataEntityTypeLabel(entityType: string | null | undefined): string {
  if (!entityType) return '—';
  const s = entityType.trim().toLowerCase();
  switch (s) {
    case 'org_unit':
      return 'Đơn vị tổ chức';
    default:
      return '—';
  }
}

export function resolveMetadataDataTypeLabel(dataType: string | null | undefined): string {
  if (!dataType) return '—';
  const s = dataType.trim().toLowerCase() as MetadataDataType | string;
  switch (s) {
    case 'text':
      return 'Văn bản';
    case 'number':
      return 'Số';
    case 'date':
      return 'Ngày';
    case 'boolean':
      return 'Đúng/Sai';
    case 'select':
      return 'Lựa chọn';
    default:
      return '—';
  }
}

export function resolveRewardPenaltyRunStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const s = status.trim().toLowerCase();
  switch (s) {
    case 'draft':
      return 'Nháp';
    case 'final':
      return 'Hoàn tất';
    default:
      return '—';
  }
}

