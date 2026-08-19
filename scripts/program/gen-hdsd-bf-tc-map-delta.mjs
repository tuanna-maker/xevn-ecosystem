import fs from 'node:fs';

function assignBF(hdsd, _uf, id) {
  if (id.includes('-M01') || /W5|Member CEO/.test(hdsd)) {
    return { bf: 'W5', wave: 'D5', priority: 'P2', note: 'Member scope negative — du-lich.ceo@xe.vn' };
  }
  if (id.startsWith('TC-MOB-')) {
    const n = parseInt(id.split('-').pop(), 10);
    if (n >= 14 && n <= 18) return { bf: 'BF-02', wave: 'D1', priority: 'P0', note: 'Mobile leave lifecycle J-MOB-03/04' };
    if (n >= 19 && n <= 22) return { bf: 'BF-03', wave: 'D2', priority: 'P0', note: 'Mobile payslip J-MOB-04' };
    if (n >= 23 && n <= 25) return { bf: 'BF-02', wave: 'D1', priority: 'P0', note: 'Manager approvals J-MOB-05' };
    if (n === 30) return { bf: 'BF-03', wave: 'D2', priority: 'P1', note: 'Mobile contracts screen' };
    return { bf: 'sweep', wave: 'D4', priority: 'P2', note: 'Mobile shell — scope/login/settings' };
  }
  if (/CH05_HRM_NHAN_SU/.test(hdsd)) return { bf: 'BF-03', wave: 'D2', priority: 'P0', note: 'Ch05 NV list/dialog/profile depth' };
  if (/CH06_HRM_HD_BH/.test(hdsd)) return { bf: 'BF-03', wave: 'D2', priority: 'P0', note: 'Ch06 HD/BH dialog mutate depth' };
  if (/CH07_HRM_TUYEN_DUNG/.test(hdsd)) return { bf: 'BF-01', wave: 'D3', priority: 'P0', note: 'Ch07 recruitment tabs/YCTD/JD' };
  if (/CH08_HRM_CHAM_CONG/.test(hdsd)) return { bf: 'BF-02', wave: 'D1', priority: 'P0', note: 'Ch08 attendance/leave/shift depth' };
  if (/CH09_HRM_LUONG/.test(hdsd)) return { bf: 'BF-03', wave: 'D2', priority: 'P0', note: 'Ch09 payroll policy/run depth' };
  if (/CH10_HRM_CO_QD_CV §10\.1/.test(hdsd)) return { bf: 'BF-01', wave: 'D3', priority: 'P1', note: 'Headcount INT-02 company admin' };
  if (/CH10_HRM_CO_QD_CV §10\.5/.test(hdsd)) return { bf: 'BF-01', wave: 'D3', priority: 'P1', note: 'WF read-only — canvas context' };
  if (/CH10_HRM_CO_QD_CV/.test(hdsd)) return { bf: 'sweep', wave: 'D4', priority: 'P2', note: 'Ch10 QD/CV/dich vu/Fleet admin' };
  if (/CH11_HRM_SETTINGS/.test(hdsd)) {
    const p = id.match(/152|173|174|175|176/) ? 'P3-spec_gap' : 'P2';
    const note = id.match(/152|173/) ? 'Residual R-SWEEP-02/03' : 'Ch11 catalog/report dialog depth';
    return { bf: 'sweep', wave: 'D4', priority: p, note };
  }
  if (/CH04_XBOS_WF_CAT_KPI/.test(hdsd)) return { bf: 'BF-01', wave: 'D3', priority: 'P0', note: 'XBOS inbox/canvas/RACI/catalog' };
  if (/CH03_XBOS_TO_CHUC/.test(hdsd)) return { bf: 'sweep', wave: 'D4', priority: 'P2', note: 'XBOS org/RBAC/legal-entity dialogs' };
  if (/CH02_COMMAND_CENTER_LEGACY|XBOS_CH01|XBOS_CH04_DASHBOARD/.test(hdsd)) {
    return { bf: 'sweep', wave: 'D4', priority: 'P2', note: 'Portal/CC/dashboard error/dialog depth' };
  }
  if (/ECOSYSTEM|HRM_CH00/.test(hdsd)) return { bf: 'sweep', wave: 'D4', priority: 'P2', note: 'Entry shell depth' };
  return { bf: 'sweep', wave: 'D4', priority: 'P2', note: 'Default sweep' };
}

function rangeStr(ids) {
  if (ids.length <= 3) return ids.join(', ');
  const sorted = [...ids].sort();
  return `${sorted[0]}..${sorted[sorted.length - 1]} (${ids.length} TC)`;
}

function sectLabel(sect) {
  return sect.replace(/^CH\d+_HRM_\w+ /, '').replace(/^CH\d+_XBOS_\w+ /, '').slice(0, 58);
}

const text = fs.readFileSync('docs/qa/HDSD_SRS_TESTCASE_MATRIX.md', 'utf8');
const rows = text.split('\n').filter((l) => l.startsWith('| TC-') && l.includes('\u2B1C'));

const byBf = { 'BF-01': [], 'BF-02': [], 'BF-03': [], sweep: [], W5: [] };
const clusters = {};

for (const l of rows) {
  const p = l.split('|').map((s) => s.trim());
  const id = p[1];
  const hdsd = p[2];
  const m = assignBF(hdsd, p[4], id);
  byBf[m.bf].push({ id, hdsd, ...m });
  const sectKey = hdsd.split('\u2192')[0].trim();
  const ck = `${m.bf}::${sectKey}`;
  if (!clusters[ck]) clusters[ck] = { ...m, sect: sectKey, ids: [] };
  clusters[ck].ids.push(id);
}

function clusterTable(bf, wiDefault) {
  return Object.values(clusters)
    .filter((c) => c.bf === bf)
    .sort((a, b) => a.sect.localeCompare(b.sect))
    .map((c) => {
      const wi = c.sect.includes('MOBILE') ? `${wiDefault} (qa-device)` : wiDefault;
      return `| ${sectLabel(c.sect)} | ${rangeStr(c.ids)} | ${c.priority} | ${wi} |`;
    })
    .join('\n');
}

const lines = [];
lines.push('# HDSD — Delta map TC chua promote → BF cluster');
lines.push('');
lines.push('**Program:** `HDSD-P2-FULL-01` · **Work item:** `BA-HDSD-BF-MAP-01`');
lines.push('**Ngay:** 01/08/2026 · **Lane:** governance (ba-process)');
lines.push('**Nguon:** `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` (257 TC chua promote) · QA sweep `qa-hdsd-bf-sweep-01-20260801.md` (+25 PASS)');
lines.push('**SoT orchestration:** `docs/program/HDSD_BUSINESS_FLOW_ORCHESTRATION.md`');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## 1. Muc tieu');
lines.push('');
lines.push('Gan **moi TC con chua promote** vao dung **BF cluster** de PM dispatch QA theo dot D1-D5, khong chia theo TC le.');
lines.push('');
lines.push('## 2. Tong hop phan bo');
lines.push('');
lines.push('| BF cluster | TC chua promote | Dot QA | Owner QA | Ghi chu |');
lines.push('|------------|-----------------|--------|----------|---------|');
lines.push(`| **BF-01** Tuyen dung & WF | **${byBf['BF-01'].length}** | D3 | qa | Canvas → YCTD → inbox → funnel |`);
lines.push(`| **BF-02** Cham cong & nghi | **${byBf['BF-02'].length}** | D1 | qa-device + qa | Mobile J-MOB + Ch08 + INT-03 |`);
lines.push(`| **BF-03** HD & luong | **${byBf['BF-03'].length}** | D2 | qa | Ch05/06/09 + mobile payslip |`);
lines.push(`| **sweep** | **${byBf.sweep.length}** | D4 | qa | Org/RBAC/settings/dialog depth |`);
lines.push(`| **W5** scope negative | **${byBf.W5.length}** | D5 | qa | Member CEO 403/409 |`);
lines.push(`| **Tong** | **${rows.length}** | | | Matrix promoted: 96 PASS · 9 soft |`);
lines.push('');
lines.push('## 3. Quy tac gan');
lines.push('');
lines.push('| Dieu kien HDSD / UF | BF | Ly do nghiep vu |');
lines.push('|---------------------|-----|-----------------|');
lines.push('| Ch07 Tuyen dung · Ch10 §10.1 headcount · Ch10 §10.5 WF · CH04 XBOS WF/Inbox/Canvas | **BF-01** | Spine tuyen dung + workflow |');
lines.push('| Ch08 Cham cong · J-MOB-03/04/05 · mobile leave/approval · INT-03 | **BF-02** | Don nghi → inbox → cham cong |');
lines.push('| Ch05 Nhan su · Ch06 HD/BH · Ch09 Luong · mobile payslip/contracts | **BF-03** | NV → HD → luong |');
lines.push('| Ch03 XBOS to chuc · Ch02 legacy CC · Dashboard dialog · Ch10 admin · Ch11 post-spot | **sweep** | Dialog depth ngoai 3 BF |');
lines.push('| TC-*-M01 member persona | **W5** | Scope negative |');
lines.push('');
lines.push(`## 4. BF-01 (${byBf['BF-01'].length} TC)`);
lines.push('');
lines.push('| HDSD section | TC range | Priority | QA WI |');
lines.push('|--------------|----------|----------|-------|');
lines.push(clusterTable('BF-01', 'QA-HDSD-BF-01-01'));
lines.push('');
lines.push('**Spine AC:** Canvas QT → Lưu → F5 · YCTD Gửi duyệt POST 2xx · CC Inbox Hoàn thành · funnel + headcount INT-02.');
lines.push('');
lines.push(`## 5. BF-02 (${byBf['BF-02'].length} TC)`);
lines.push('');
lines.push('| HDSD section | TC range | Priority | QA WI |');
lines.push('|--------------|----------|----------|-------|');
lines.push(clusterTable('BF-02', 'QA-HDSD-BF-02-01'));
lines.push('');
lines.push('**Spine AC:** uat.nv0001 don nghi → Gửi · ceo CC Inbox INT-03 duyet · mobile tab Nghi/Cham cong · uat.nv0002 tab Duyet J-MOB-05.');
lines.push('');
lines.push(`## 6. BF-03 (${byBf['BF-03'].length} TC)`);
lines.push('');
lines.push('| HDSD section | TC range | Priority | QA WI |');
lines.push('|--------------|----------|----------|-------|');
lines.push(clusterTable('BF-03', 'QA-HDSD-BF-03-01'));
lines.push('');
lines.push('**Spine AC:** Them NV dialog · HD mutate prefill · cham cong overview marker · luong ky + mobile phieu luong.');
lines.push('');
lines.push(`## 7. sweep (${byBf.sweep.length} TC)`);
lines.push('');
lines.push('| HDSD section | TC range | Priority | QA WI |');
lines.push('|--------------|----------|----------|-------|');
lines.push(clusterTable('sweep', 'QA-HDSD-BF-SWEEP-02'));
lines.push('');
lines.push('**Sweep batch 1 (DONE):** QA-HDSD-BF-SWEEP-01 — Ch11 tabs + XBOS dashboard load spots, 25 PASS.');
lines.push('**Sweep batch 2:** dialog depth trong bang tren; khong lap mutate BF-01/02/03.');
lines.push('');
lines.push('## 8. Residual R-SWEEP-02 / R-SWEEP-03');
lines.push('');
lines.push('| Residual | TC | BF map | Trang thai | Quyet dinh BA |');
lines.push('|----------|-----|--------|------------|---------------|');
lines.push('| **R-SWEEP-02** | TC-HRM-HDSD-152 | sweep · Ch11 Bao mat | soft stub | Tab Bao mat co doi mat khau; **khong co UI 2FA**. Defer W5 tru khi SRS bat buoc 2FA web — neu bat buoc → dev-fe + AC toggle/QR enroll. |');
lines.push('| **R-SWEEP-03** | TC-HRM-HDSD-173..176 | sweep · Ch11 In-app Guide | not shipped | Khong co walkthrough UI. Defer W5 hoac OUT Phase 2. TC 174-176 blocked cho PASS den khi feature ship. |');
lines.push('| R-SWEEP-01 | TC-XBOS-HDSD-016,019 | sweep | soft | dev-fe icon toolbar — khong chan BF gate |');
lines.push('| R-SWEEP-04 | TC-HRM-HDSD-161 | sweep | harness | qa manual spot bucket labels |');
lines.push('');
lines.push('## 9. W5 scope negative');
lines.push('');
lines.push('| TC ID | Persona | AC |');
lines.push('|-------|---------|-----|');
lines.push('| TC-XBOS-HDSD-M01 | du-lich.ceo@xe.vn | CC rollup 403/409 |');
lines.push('| TC-HRM-HDSD-M01 | du-lich.ceo@xe.vn | HRM scope blocked |');
lines.push('');
lines.push('## 10. Handoff PM → QA');
lines.push('');
lines.push('- **D1 BF-02:** ' + byBf['BF-02'].length + ' TC · J-MOB-03/04/05 · INT-03');
lines.push('- **D2 BF-03:** ' + byBf['BF-03'].length + ' TC · J-HRM-01/03 · J-MOB-04');
lines.push('- **D3 BF-01:** ' + byBf['BF-01'].length + ' TC · J-REC-WF-01..06');
lines.push('- **D4 sweep-02:** ' + byBf.sweep.length + ' TC · exclude R-SWEEP-02/03 from PASS claim');
lines.push('- **D5 W5:** ' + byBf.W5.length + ' TC member negative');
lines.push('');
lines.push('## Traceability');
lines.push('');
lines.push('- Matrix: `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md`');
lines.push('- Orchestration: `docs/program/HDSD_BUSINESS_FLOW_ORCHESTRATION.md`');
lines.push('- Sweep evidence: `docs/qa/evidence/qa-hdsd-bf-sweep-01-20260801.md`');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## completion_report');
lines.push('');
lines.push(`Closed: Map ${rows.length}/${rows.length} TC chua promote → BF-01 (${byBf['BF-01'].length}) · BF-02 (${byBf['BF-02'].length}) · BF-03 (${byBf['BF-03'].length}) · sweep (${byBf.sweep.length}) · W5 (${byBf.W5.length}). Residual R-SWEEP-02 (2FA) va R-SWEEP-03 (in-app guide) ghi §8.`);
lines.push('');
lines.push('Residual: Per-TC promote van do QA D1-D4; R-SWEEP-02/03 can sponsor confirm defer vs build.');
lines.push('');
lines.push('## next_owner');
lines.push('');
lines.push('pm');
lines.push('');
lines.push('## next_dispatch_prompt');
lines.push('');
lines.push('```');
lines.push('work_item_id: QA-HDSD-MATRIX-PROMOTE-SWEEP-01');
lines.push('from_role: pm | to_role: qa');
lines.push('entry_criteria: BA-HDSD-BF-MAP-01 PASS — docs/program/HDSD_BF_TC_MAP_DELTA.md');
lines.push('exit_criteria: Promote 25 PASS rows per qa-hdsd-bf-sweep-01; add BF column ref from delta §2; ack PASS_TO_PM');
lines.push('read_first: HDSD_BF_TC_MAP_DELTA.md §8 residual');
lines.push('cam: regression PASS→unmapped');
lines.push('```');
lines.push('');
lines.push('## evidence_path');
lines.push('');
lines.push('docs/program/HDSD_BF_TC_MAP_DELTA.md');
lines.push('');
lines.push('## ack_status');
lines.push('');
lines.push('PASS_TO_PM');

fs.writeFileSync('docs/program/HDSD_BF_TC_MAP_DELTA.md', lines.join('\n'));
console.log('Wrote docs/program/HDSD_BF_TC_MAP_DELTA.md');
console.log('Counts:', Object.fromEntries(Object.entries(byBf).map(([k, v]) => [k, v.length])));
