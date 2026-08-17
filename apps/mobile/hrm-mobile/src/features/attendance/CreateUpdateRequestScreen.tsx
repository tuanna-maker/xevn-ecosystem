/**
 * @CODE-MEMORY
 * Screen:     ProfileStack → CreateUpdateRequest (Đơn công)
 * UC:         AT-01 · đi muộn / điều chỉnh chấm công
 * BR:         ESS create path · U65 FE-only
 * SRS:        PO_E2E spine AT-01
 * TechSpec:   POST /attendance/update-requests
 * Purpose:    Form tạo đơn công — meta NV từ membership/GET employees.
 * WorkItem:   R-SPINE-AT-NAV-01 (nav entry; form sẵn có)
 * Coded:      2026-05 (baseline)
 * Callers:    FAB create_update_request · Settings «Đơn công» · hub Đi muộn · UpdateRequests header
 * Callees:    hydrateEmployeeMetaForRequest · auth.requestHrm
 * must_keep:  POST body company_id + employee_id + update_type + reason
 * LastVerified: docs/qa/evidence/r-spine-at-nav-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-AT-NAV-01
 * change_mode: ADD
 * What: Document HDSD callers (FAB / Settings / hub) — không đổi contract submit
 * Why: AT-01 blocked on missing nav; form already existed
 * must_keep: leave create FAB path; AUTH không reopen
 */

import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { FormField } from '../../components/ui/FormField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StickyFooter } from '../../components/ui/StickyFooter';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import {
  hydrateEmployeeMetaForRequest,
  resolveEmployeeMetaFromMemberships,
} from '../../integrations/hrmEmployees';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';
import {
  MISSING_EMPLOYEE_META_MESSAGE,
  userFacingScopeError,
} from '../../utils/scopeError';

export function CreateUpdateRequestScreen() {
  const auth = useAuth();
  const blockIfOffline = useOfflineWriteGuard();
  const [updateType, setUpdateType] = useState('adjust_check_in');
  const [reason, setReason] = useState('Điều chỉnh giờ vào (mobile)');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [busy, setBusy] = useState(false);

  const cid = auth.getAttendanceCompanyId();
  const eid = auth.employeeId.trim();

  useEffect(() => {
    if (!eid) return;
    const fromMembership = resolveEmployeeMetaFromMemberships(auth.memberships, eid);
    if (fromMembership) {
      setEmployeeCode(fromMembership.employee_code);
      setEmployeeName(fromMembership.employee_name);
    }
    let cancelled = false;
    void (async () => {
      const meta = await hydrateEmployeeMetaForRequest(auth.getHrmAuth(), auth.memberships, eid);
      if (cancelled || !meta) return;
      setEmployeeCode(meta.employee_code);
      setEmployeeName(meta.employee_name);
      if (meta.department) setDepartment(meta.department);
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, eid]);

  const submit = async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}: không gửi đơn khi ngoại tuyến.`);
      return;
    }
    if (!cid || !eid) {
      Alert.alert(vi.error, userFacingScopeError('companyAndEmployee'));
      return;
    }
    if (!employeeCode.trim() || !employeeName.trim()) {
      Alert.alert(vi.error, MISSING_EMPLOYEE_META_MESSAGE);
      return;
    }
    setBusy(true);
    try {
      const res = await auth.requestHrm<unknown>('/attendance/update-requests', {
        method: 'POST',
        body: JSON.stringify({
          company_id: cid,
          employee_id: eid,
          employee_code: employeeCode.trim(),
          employee_name: employeeName.trim(),
          department: department.trim() || undefined,
          position: undefined,
          attendance_date: new Date().toISOString().slice(0, 10),
          update_type: updateType.trim(),
          reason: reason.trim(),
        }),
      });
      if (res.ok) Alert.alert('Thành công', res.code);
      else Alert.alert(vi.error, formatHrmError(res));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreenLayout
      title="Đơn công"
      subtitle="Yêu cầu điều chỉnh chấm công — dữ liệu nhân viên từ GET /employees"
      scroll
      keyboardShouldPersistTaps="handled"
      footer={
        <StickyFooter>
          <PrimaryButton
            label={busy ? vi.loading : 'Gửi đơn'}
            onPress={() => void submit()}
            disabled={busy}
            loading={busy}
          />
        </StickyFooter>
      }
    >
      <SurfaceCard title="Thông tin nhân viên">
        <FormField label="Mã nhân viên" value={employeeCode} onChangeText={setEmployeeCode} autoCapitalize="none" />
        <FormField label="Họ tên" value={employeeName} onChangeText={setEmployeeName} />
        <FormField label="Phòng ban (tuỳ chọn)" value={department} onChangeText={setDepartment} />
      </SurfaceCard>

      <SurfaceCard title="Nội dung đơn">
        <FormField label="Loại điều chỉnh" value={updateType} onChangeText={setUpdateType} />
        <FormField label="Lý do" value={reason} onChangeText={setReason} multiline />
      </SurfaceCard>

    </AppScreenLayout>
  );
}
