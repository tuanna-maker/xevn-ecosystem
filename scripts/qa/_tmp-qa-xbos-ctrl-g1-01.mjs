/**
 * QA-XBOS-CTRL-G1-01 — ephemeral probe (U65, no seed)
 * Run: node scripts/qa/_tmp-qa-xbos-ctrl-g1-01.mjs
 */
import puppeteer from 'puppeteer';

const XBOS = 'http://127.0.0.1:28002';
const HRM = 'http://127.0.0.1:28001';
const PORTAL = 'http://127.0.0.1:5173';
const EMAIL = 'ceo@xe.vn';
const PASS = 'Xevn@2026';

async function jfetch(url, opts = {}) {
  const r = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  let body = null;
  try {
    body = await r.json();
  } catch {
    body = await r.text();
  }
  return { status: r.status, body };
}

function note(id, ok, detail) {
  console.log(ok ? 'PASS' : 'FAIL', id, String(detail).slice(0, 240));
  return { id, ok: !!ok, detail: String(detail).slice(0, 500) };
}

async function main() {
  const results = [];
  const login = await jfetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const token = login.body?.data?.accessToken;
  results.push(note('L0-login', !!token, `HTTP ${login.status} ${login.body?.code}`));
  if (!token) {
    console.log(JSON.stringify({ results }, null, 2));
    process.exit(2);
  }
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Source L0
  for (const key of ['departments', 'leave_types', 'hr_decision_types', 'decision_types']) {
    const g = await jfetch(
      `${XBOS}/api/xbos/config-sync/catalog/${key}?target=hrm&tenantId=xevn&companyId=holding`,
      { headers: H },
    );
    const d = g.body?.data || {};
    results.push(
      note(
        `GET-src-${key}`,
        key === 'decision_types' ? g.status === 404 : g.status === 200,
        `HTTP ${g.status} code=${g.body?.code} items=${d.itemCount ?? '?'} key=${d.key || ''}`,
      ),
    );
  }

  async function apply(key, memberCompanyIds = ['visun']) {
    return jfetch(`${XBOS}/api/xbos/config-sync/catalog/${encodeURIComponent(key)}/apply-to-members`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        tenantId: 'xevn',
        companyId: 'main',
        memberCompanyIds,
        actor: 'qa-xbos-ctrl-g1-01',
      }),
    });
  }

  for (const key of ['departments', 'leave_types']) {
    const r = await apply(key, ['visun', 'xe-du-lich']);
    const d = r.body?.data || {};
    const checksumMatch =
      Array.isArray(d.applied) &&
      d.applied.every((row) => row.checksum && row.checksum === d.source?.checksum);
    results.push(
      note(
        `APPLY-${key}`,
        (r.status === 200 || r.status === 201) && r.body?.code === 'XBOS-CFG-204' && checksumMatch,
        `HTTP ${r.status} code=${r.body?.code} appliedCount=${d.appliedCount} writeKey=${d.writeKey} checksumMatch=${checksumMatch} applied=${JSON.stringify(d.applied || []).slice(0, 180)}`,
      ),
    );
  }

  // DEC writeKey = source L0 (hr_decision_types)
  for (const key of ['decision_types', 'hr_decision_types']) {
    const r = await apply(key, ['visun']);
    const d = r.body?.data || {};
    results.push(
      note(
        `APPLY-DEC-${key}`,
        (r.status === 200 || r.status === 201) &&
          r.body?.code === 'XBOS-CFG-204' &&
          d.writeKey === 'hr_decision_types',
        `HTTP ${r.status} code=${r.body?.code} writeKey=${d.writeKey} catalogKey=${d.catalogKey} sourceKey=${d.source?.catalogKey}`,
      ),
    );
  }

  for (const key of ['cost_centers', 'salary_components', 'totally_unknown_catalog_xyz']) {
    const r = await apply(key);
    results.push(
      note(
        `REJECT-${key}`,
        r.status === 400 && r.body?.code === 'XBOS-CFG-005',
        `HTTP ${r.status} code=${r.body?.code} msg=${String(r.body?.message || '').slice(0, 120)}`,
      ),
    );
  }

  // Group CEO member GET — expect 409 by design (ADR)
  const memGet = await jfetch(
    `${XBOS}/api/xbos/config-sync/catalog/departments?target=hrm&tenantId=xevn&companyId=visun`,
    { headers: H },
  );
  results.push(
    note(
      'GET-member-groupCEO-409-by-design',
      memGet.status === 409 && memGet.body?.code === 'SCOPE_CONTEXT_MISMATCH',
      `HTTP ${memGet.status} code=${memGet.body?.code}`,
    ),
  );

  // HRM pull smoke
  for (const key of ['departments', 'leave_types', 'hr_decision_types']) {
    const r = await jfetch(
      `${HRM}/api/hrm/catalog-sync/pull/${key}?tenant_id=xevn&company_id=dfb107a7-99e3-433a-94e5-f78ce8b2d665`,
      { method: 'POST', headers: H, body: '{}' },
    );
    results.push(
      note(
        `HRM-pull-${key}`,
        (r.status === 200 || r.status === 201) && String(r.body?.code || '').includes('SYNC'),
        `HTTP ${r.status} code=${r.body?.code} msg=${String(r.body?.message || '').slice(0, 100)}`,
      ),
    );
  }

  // Holding source still readable after apply (F5 contract)
  const hold = await jfetch(
    `${XBOS}/api/xbos/config-sync/catalog/departments?target=hrm&tenantId=xevn&companyId=holding`,
    { headers: H },
  );
  const holdItems = hold.body?.data?.items?.length ?? hold.body?.data?.itemCount ?? 0;
  results.push(
    note(
      'GET-holding-after-apply',
      hold.status === 200 && holdItems >= 1,
      `HTTP ${hold.status} items=${holdItems} ver=${hold.body?.data?.version} checksum=${String(hold.body?.data?.checksum || '').slice(0, 24)}`,
    ),
  );

  // Browser FE allow-list residual
  const CHROME =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  let browserNotes = [];
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1440, height: 900 },
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(45000);
    await page.goto(`${PORTAL}/`, { waitUntil: 'networkidle2' });
    await page.evaluate(
      (tok, user) => {
        const auth = JSON.stringify({ accessToken: tok, user });
        for (const k of [
          'xevn_access_token',
          'xbos_access_token',
          'accessToken',
          'token',
        ]) {
          localStorage.setItem(k, tok);
          sessionStorage.setItem(k, tok);
        }
        localStorage.setItem('xevn_auth', auth);
        localStorage.setItem('xbos_auth', auth);
        localStorage.setItem('auth', auth);
      },
      token,
      login.body?.data?.user || { email: EMAIL, userId: EMAIL },
    );
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    // open Cài đặt / settings area if needed
    await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('button,a,[role="button"],div,span')];
      const settings = nodes.find((n) => /^Cài đặt$|Settings/i.test((n.textContent || '').trim()));
      settings?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    const navText = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll('button,a,[role="button"],div,span,li')];
      const hit = nodes.find((n) => /Áp dụng danh mục HRM/i.test(n.textContent || ''));
      if (hit) {
        hit.click();
        return (hit.textContent || '').trim().slice(0, 80);
      }
      return null;
    });
    browserNotes.push(note('FE-nav-apply', !!navText, navText || 'nav not found'));
    await new Promise((r) => setTimeout(r, 1200));
    const panelOk = await page.$('[data-testid="apply-catalog-to-members-panel"]');
    browserNotes.push(note('FE-panel', !!panelOk, panelOk ? 'present' : 'absent'));
    const opts = await page.evaluate(() => {
      const sel =
        document.querySelector('#apply-catalog-key') ||
        document.querySelector('[data-testid="apply-catalog-key"]') ||
        document.querySelector('select');
      if (!sel) return { found: false, values: [] };
      const values = [...sel.querySelectorAll('option')]
        .map((o) => o.value)
        .filter(Boolean);
      return { found: true, values };
    });
    const values = opts.values || [];
    browserNotes.push(
      note(
        'FE-allowlist',
        values.length === 3 && values.includes('job_titles'),
        `count=${values.length} values=${values.join(',')}`,
      ),
    );
    browserNotes.push(
      note(
        'FE-missing-P0P1',
        !values.includes('departments') && !values.includes('leave_types'),
        `departments=${values.includes('departments')} leave_types=${values.includes('leave_types')} decision=${values.includes('decision_types')}`,
      ),
    );
    await browser.close();
  } catch (e) {
    browserNotes.push(note('FE-browser', false, String(e).slice(0, 300)));
  }

  const all = [...results, ...browserNotes];
  const hardFailIds = [
    'APPLY-departments',
    'APPLY-leave_types',
    'APPLY-DEC-decision_types',
    'APPLY-DEC-hr_decision_types',
    'REJECT-cost_centers',
    'REJECT-salary_components',
  ];
  const hardFails = all.filter((r) => hardFailIds.includes(r.id) && !r.ok);
  const feResidual = all.find((r) => r.id === 'FE-allowlist');
  console.log('\n===SUMMARY===');
  console.log(
    JSON.stringify(
      {
        hardFails: hardFails.map((h) => h.id),
        feStillAsIs3: feResidual?.ok === true,
        results: all,
      },
      null,
      2,
    ),
  );
  process.exit(hardFails.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
