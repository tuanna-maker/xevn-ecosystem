/**
 * QA-XBOS-CTRL-G1-01 — FE browser allow-list + optional apply click (U65)
 */
import puppeteer from 'puppeteer';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function note(id, ok, detail) {
  console.log(ok ? 'PASS' : 'FAIL', id, String(detail).slice(0, 260));
  return { id, ok: !!ok, detail: String(detail).slice(0, 600) };
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function loginApi() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASS }),
      });
      const j = await r.json();
      const token = j?.data?.accessToken ?? j?.accessToken;
      if (token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user: j?.data?.user ?? { userId: EMAIL, displayName: 'CEO' },
          via: url,
        };
      }
    } catch {
      /* try next */
    }
  }
  throw new Error('login failed');
}

async function nativeClickByText(page, text, { exact = false } = {}) {
  const box = await page.evaluate(
    (t, exactMatch) => {
      const nodes = Array.from(
        document.querySelectorAll(
          'button, a, [role="tab"], [role="button"], [role="menuitem"], li, span, div',
        ),
      );
      const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
      const candidates = nodes
        .map((n) => ({ n, text: norm(n.textContent) }))
        .filter(({ text }) => text.length > 0 && text.length < 80)
        .filter(({ text }) => (exactMatch ? text === t : text.includes(t)))
        .sort((a, b) => a.text.length - b.text.length);
      const el = candidates[0]?.n;
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return {
        x: r.x + r.width / 2,
        y: r.y + r.height / 2,
        text: norm(el.textContent).slice(0, 80),
      };
    },
    text,
    exact,
  );
  if (!box) return null;
  await page.mouse.click(box.x, box.y);
  return box;
}

const results = [];

async function main() {
  const session = await loginApi();
  results.push(note('FE-login', true, `via ${session.via}`));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  const posts = [];
  page.on('response', async (res) => {
    try {
      const req = res.request();
      if (req.method() === 'POST' && /apply-to-members/.test(res.url())) {
        let body = null;
        try {
          body = await res.json();
        } catch {
          body = null;
        }
        posts.push({
          url: res.url(),
          status: res.status(),
          code: body?.code,
          writeKey: body?.data?.writeKey,
          appliedCount: body?.data?.appliedCount,
          catalogKey: body?.data?.catalogKey,
        });
      }
    } catch {
      /* ignore */
    }
  });

  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
    }
  }, session);

  // Deep link per commandCenterSettingsDeepLink({ settingsMenu: 'hrm_catalog_apply_members' })
  const deep = `${PORTAL}/command-center?settings=hrm_catalog_apply_members`;
  await page.goto(deep, { waitUntil: 'networkidle2' });
  await sleep(2500);
  results.push(note('FE-cc-load', !/login/i.test(page.url()), `url=${page.url()}`));

  // Open system settings rail (exact label from command-center-rail-catalog)
  let settingsHit = null;
  for (const t of ['CÀI ĐẶT HỆ THỐNG', 'Cài đặt hệ thống']) {
    settingsHit = await nativeClickByText(page, t, { exact: true });
    if (settingsHit) break;
  }
  if (!settingsHit) {
    settingsHit = await nativeClickByText(page, 'CÀI ĐẶT HỆ THỐNG', { exact: false });
  }
  results.push(note('FE-settings-nav', !!settingsHit, settingsHit?.text || 'not found'));
  await sleep(1200);

  // dump visible settings menu labels for triage
  const menuDump = await page.evaluate(() =>
    [...document.querySelectorAll('button, a, [role="button"], li')]
      .map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim())
      .filter((t) => t.length > 2 && t.length < 60)
      .filter((t) => /danh mục|Cài đặt|HRM|Phòng|Quy trình|phân quyền/i.test(t))
      .slice(0, 40),
  );
  results.push(note('FE-menu-dump', menuDump.length > 0, menuDump.join(' || ')));

  let applyNav = null;
  for (const t of ['Áp dụng danh mục HRM', 'Áp dụng danh mục']) {
    applyNav = await nativeClickByText(page, t, { exact: t === 'Áp dụng danh mục HRM' });
    if (applyNav) break;
  }
  results.push(note('FE-apply-nav', !!applyNav, applyNav?.text || 'not found'));
  await sleep(1500);

  let panel = await page.$('[data-testid="apply-catalog-to-members-panel"]');
  if (!panel) {
    // deep search text
    await page.evaluate(() => {
      const n = [...document.querySelectorAll('*')].find((el) =>
        /Áp dụng danh mục HRM sang ĐVTV/i.test(el.textContent || ''),
      );
      n?.scrollIntoView?.({ block: 'center' });
    });
    await sleep(500);
    panel = await page.$('[data-testid="apply-catalog-to-members-panel"]');
  }
  results.push(note('FE-panel', !!panel, panel ? 'present' : 'absent'));

  const opts = await page.evaluate(() => {
    const sel =
      document.querySelector('#apply-catalog-key') ||
      document.querySelector('[data-testid="apply-catalog-key"]');
    if (!sel) {
      const any = document.querySelector(
        '[data-testid="apply-catalog-to-members-panel"] select',
      );
      if (!any) return { found: false, values: [], texts: [] };
      return {
        found: true,
        values: [...any.querySelectorAll('option')].map((o) => o.value).filter(Boolean),
        texts: [...any.querySelectorAll('option')].map((o) => (o.textContent || '').trim()),
      };
    }
    return {
      found: true,
      values: [...sel.querySelectorAll('option')].map((o) => o.value).filter(Boolean),
      texts: [...sel.querySelectorAll('option')].map((o) => (o.textContent || '').trim()),
    };
  });

  const values = opts.values || [];
  const need = ['departments', 'leave_types', 'decision_types', 'job_titles'];
  const hasAll = need.every((k) => values.includes(k));
  const hasP2 = values.includes('salary_components') || values.includes('cost_centers');
  results.push(
    note(
      'FE-allowlist-10',
      values.length >= 10 && hasAll && !hasP2,
      `count=${values.length} values=${values.join(',')} texts=${(opts.texts || []).join('|')}`,
    ),
  );

  // Try apply departments via UI if panel ready (button label: "Áp dụng cho N ĐVTV")
  if (panel && values.includes('departments')) {
    // Re-open apply menu in case settings rail click drifted
    await nativeClickByText(page, 'Áp dụng danh mục HRM', { exact: true });
    await sleep(1200);
    const mutatePrep = await page.evaluate(async () => {
      const root = document.querySelector('[data-testid="apply-catalog-to-members-panel"]');
      if (!root) return { ok: false, reason: 'no panel' };
      const sel =
        root.querySelector('#apply-catalog-key') || root.querySelector('select');
      if (sel) {
        sel.value = 'departments';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        sel.dispatchEvent(new Event('input', { bubbles: true }));
      }
      await new Promise((r) => setTimeout(r, 600));
      for (const b of [...root.querySelectorAll('button')]) {
        if (/Tải lại nguồn tập đoàn/i.test(b.textContent || '')) b.click();
      }
      await new Promise((r) => setTimeout(r, 1800));
      for (const b of [...root.querySelectorAll('button')]) {
        if (/Làm mới ĐVTV/i.test(b.textContent || '')) b.click();
      }
      await new Promise((r) => setTimeout(r, 1800));
      const allBtn = [...root.querySelectorAll('button')].find((b) =>
        /Chọn tất cả/i.test(b.textContent || ''),
      );
      allBtn?.click();
      await new Promise((r) => setTimeout(r, 400));
      const apply = [...root.querySelectorAll('button')].find((b) =>
        /Áp dụng cho/i.test(b.textContent || ''),
      );
      const applyText = apply ? (apply.textContent || '').trim() : null;
      const disabled = apply ? !!apply.disabled : true;
      const source = !!root.querySelector('[data-testid="apply-catalog-source-summary"]');
      const members = root.querySelectorAll('[data-testid^="apply-member-"]').length;
      if (apply && !disabled) apply.click();
      return {
        ok: !!apply && !disabled,
        applyText,
        disabled,
        source,
        members,
        key: sel?.value,
      };
    });
    results.push(
      note(
        'FE-click-apply',
        !!mutatePrep.ok,
        JSON.stringify(mutatePrep).slice(0, 300),
      ),
    );
    await sleep(800);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(
        (b) => (b.textContent || '').trim() === 'Áp dụng',
      );
      btn?.click();
    });
    await sleep(4000);
    const postDept = posts.find((p) => /\/departments\/apply-to-members/.test(p.url));
    results.push(
      note(
        'FE-POST-departments',
        !!postDept &&
          (postDept.status === 200 || postDept.status === 201) &&
          postDept.code === 'XBOS-CFG-204',
        postDept
          ? JSON.stringify(postDept)
          : `no post; seen=${JSON.stringify(posts).slice(0, 240)}`,
      ),
    );
  }

  // Static source fallback already known — capture screenshot path optional
  const htmlSnippet = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="apply-catalog-to-members-panel"]');
    return {
      url: location.href,
      bodyLen: document.body?.innerText?.length || 0,
      hasPanelText: /Áp dụng danh mục/i.test(document.body?.innerText || ''),
      panelHtml: panel ? panel.innerText.slice(0, 400) : null,
    };
  });
  results.push(
    note('FE-page-context', htmlSnippet.hasPanelText || !!panel, JSON.stringify(htmlSnippet).slice(0, 400)),
  );

  await browser.close();

  const hardIds = ['FE-allowlist-10'];
  const hardFails = results.filter((r) => hardIds.includes(r.id) && !r.ok);
  console.log('\n===FE SUMMARY===');
  console.log(JSON.stringify({ hardFails: hardFails.map((h) => h.id), posts, results }, null, 2));
  process.exit(hardFails.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
