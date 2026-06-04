import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest, resolveHrmCompanyHeaderId } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';
import { ASYNC_CACHE } from '../../storage/asyncKeys';

type Health = { service?: string; status?: string };
type Emp = { id: string; full_name: string; employee_code: string };
type AttRow = { attendance_date: string; status: string; check_in_at?: string | null };

export function DashboardScreen() {
  const auth = useAuth();
  const net = useNetwork();
  const [health, setHealth] = useState('');
  const [scopeCard, setScopeCard] = useState('');
  const [employees, setEmployees] = useState('');
  const [attendance, setAttendance] = useState('');
  const [pendingReq, setPendingReq] = useState('');
  const [cacheHint, setCacheHint] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setCacheHint('');
    const cfg = auth.getHrmAuth();
    const cid = auth.getAttendanceCompanyId();
    const eid = auth.employeeId.trim();

    const persistSnapshot = async (snap: {
      health: string;
      scope: string;
      employees: string;
      attendance: string;
      pendingReq: string;
    }) => {
      await AsyncStorage.setItem(
        ASYNC_CACHE.DASHBOARD_V1,
        JSON.stringify({ savedAt: new Date().toISOString(), ...snap }),
      );
    };

    const restoreFromCache = async () => {
      const raw = await AsyncStorage.getItem(ASYNC_CACHE.DASHBOARD_V1);
      if (!raw) {
        setCacheHint('Không có cache offline.');
        return;
      }
      try {
        const j = JSON.parse(raw) as Record<string, string>;
        setHealth(j.health ?? '');
        setScopeCard(j.scope ?? '');
        setEmployees(j.employees ?? '');
        setAttendance(j.attendance ?? '');
        setPendingReq(j.pendingReq ?? '');
        setCacheHint(`Đang xem cache (${j.savedAt ?? '?'})`);
      } catch {
        setCacheHint('Cache hỏng, không đọc được.');
      }
    };

    if (net.ready && net.offline) {
      await restoreFromCache();
      setLoading(false);
      return;
    }

    const headerCompany = resolveHrmCompanyHeaderId(cfg.companyUuid, cfg.companyId);
    const scopeText = `tenant: ${auth.tenantId}\ncompany slug: ${auth.companyId}\nx-company-id: ${headerCompany || '(thiếu)'}\nemployeeId: ${eid || '(thiếu)'}`;
    setScopeCard(scopeText);

    const batch1 = await Promise.allSettled([
      hrmRequest<Health>(cfg, '/', { method: 'GET' }),
      hrmRequest<unknown>(
        cfg,
        `/employees?${new URLSearchParams({ company_id: cid || headerCompany, page: '1', page_size: '5' }).toString()}`,
        { method: 'GET' },
      ),
    ]);

    let hText = '';
    if (batch1[0].status === 'fulfilled') {
      const r = batch1[0].value;
      hText = r.ok ? `OK (${r.code})` : formatHrmError(r);
    } else {
      hText = 'HRM-MOB-ERR-NETWORK';
    }

    let eText = '';
    if (batch1[1].status === 'fulfilled') {
      const r = batch1[1].value;
      if (r.ok) {
        const rows = readListRows<Emp>(r.data);
        eText = rows.map((x) => `${x.employee_code} — ${x.full_name}`).join('\n') || '(rỗng)';
      } else eText = formatHrmError(r);
    } else {
      eText = 'HRM-MOB-ERR-NETWORK';
    }

    let aText = '';
    let pText = '';

    const attPromise =
      cid && eid
        ? (() => {
            const today = new Date().toISOString().slice(0, 10);
            const aq = new URLSearchParams({
              company_id: cid,
              employee_id: eid,
              from_date: today,
              to_date: today,
              page: '1',
              page_size: '10',
            });
            return hrmRequest<unknown>(cfg, `/attendance/records?${aq.toString()}`, { method: 'GET' });
          })()
        : null;

    const pendPromise = cid
      ? hrmRequest<unknown>(
          cfg,
          `/attendance/update-requests?${new URLSearchParams({ company_id: cid, status: 'pending' }).toString()}`,
          { method: 'GET' },
        )
      : null;

    const tail = await Promise.allSettled([attPromise ?? Promise.resolve(null), pendPromise ?? Promise.resolve(null)]);

    if (cid && eid) {
      const r = tail[0];
      if (r.status === 'fulfilled' && r.value) {
        const res = r.value as Awaited<ReturnType<typeof hrmRequest<unknown>>>;
        if (res.ok) {
          const rows = readListRows<AttRow>(res.data);
          aText =
            rows.length === 0
              ? 'Hôm nay: chưa có bản ghi.'
              : rows
                  .map((row) => {
                    const t = row.check_in_at
                      ? new Date(row.check_in_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return `${row.status}${t ? ` · vào ${t}` : ''}`;
                  })
                  .join('\n');
        } else aText = formatHrmError(res);
      } else if (r.status === 'rejected') {
        aText = 'HRM-MOB-ERR-NETWORK';
      }
    } else {
      aText = 'Bỏ qua: thiếu UUID công ty hoặc employeeId (Cài đặt / Đăng nhập).';
    }

    if (cid) {
      const r = tail[1];
      if (r.status === 'fulfilled' && r.value) {
        const res = r.value as Awaited<ReturnType<typeof hrmRequest<unknown>>>;
        if (res.ok) {
          const n = readListRows(res.data).length;
          pText = `${n} đơn công đang chờ`;
        } else pText = formatHrmError(res);
      } else if (r.status === 'rejected') {
        pText = 'HRM-MOB-ERR-NETWORK';
      }
    } else {
      pText = 'Thiếu UUID công ty cho đơn công.';
    }

    setHealth(hText);
    setEmployees(eText);
    setAttendance(aText);
    setPendingReq(pText);

    await persistSnapshot({
      health: hText,
      scope: scopeText,
      employees: eText,
      attendance: aText,
      pendingReq: pText,
    });

    setLoading(false);
  }, [auth, net.ready, net.offline]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.h1}>{vi.dashboard}</Text>
      {cacheHint ? <Text style={styles.cache}>{cacheHint}</Text> : null}
      <Text style={styles.meta}>UC-HRM-MOB-03 · UC-HRM-MOB-02 (phạm vi) · tối đa 4 request song song</Text>
      <Pressable style={styles.btn} onPress={() => void load()} disabled={loading}>
        <Text style={styles.btnText}>{loading ? vi.loading : vi.refresh}</Text>
      </Pressable>
      <Card title="Sức khỏe API (UC-01)" body={health} />
      <Card title="Phạm vi đang hoạt động (UC-02)" body={scopeCard} />
      <Card title="Nhân viên (mẫu 5)" body={employees} />
      <Card title="Chấm công hôm nay (UC-04/05)" body={attendance} />
      <Card title="Đơn công chờ (UC-07)" body={pendingReq} />
    </ScrollView>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 12, paddingBottom: 32 },
  h1: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  cache: { color: '#fbbf24', fontSize: 13 },
  meta: { color: '#64748b', fontSize: 12 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnText: { color: '#e2e8f0', fontWeight: '600' },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
  cardBody: { color: '#f1f5f9', fontSize: 14 },
});
