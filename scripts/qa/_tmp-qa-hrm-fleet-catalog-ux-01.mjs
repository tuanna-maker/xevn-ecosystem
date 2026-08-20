import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const PORTAL = "http://127.0.0.1:5173";
const XBOS = "http://127.0.0.1:28002";
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = {
  work_item_id: "QA-HRM-FLEET-CATALOG-UX-01",
  startedAt: new Date().toISOString(),
  checks: {},
  network: [],
  verdict: "FAIL",
};

const loginRes = await fetch(`${XBOS}/api/xbos/auth/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "ceo@xe.vn", password: "Xevn@2026" }),
});
const loginJson = await loginRes.json();
const data = loginJson?.data ?? loginJson;
const token = data.accessToken || data.access_token;
if (!token) {
  out.checks.login = { pass: false, detail: "no token", status: loginRes.status };
  writeFileSync("docs/qa/evidence/_tmp-qa-hrm-fleet-catalog-ux-runtime.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  process.exit(1);
}
out.checks.login = { pass: true, status: loginRes.status };

const browser = await puppeteer.launch({
  headless: true,
  executablePath: CHROME,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();

const fleetGets = [];
const mutateHits = [];
page.on("response", async (res) => {
  try {
    const url = res.url();
    const method = res.request().method();
    if (/\/api\/hrm\/fleet\/vehicles/i.test(url)) {
      const entry = {
        method,
        status: res.status(),
        url: url.replace(/([?&](access_token|token)=)[^&]+/gi, "$1***"),
      };
      if (method === "GET") fleetGets.push(entry);
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) mutateHits.push(entry);
      out.network.push(entry);
    }
  } catch {
    /* ignore */
  }
});

await page.evaluateOnNewDocument(
  (s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem("xevn.portal.accessToken", s.token);
      store.setItem("xevn.portal.tokenExpiresAt", String(s.expiresAt));
      store.setItem("xevn.portal.user", JSON.stringify(s.user));
      store.setItem("xevn.portal.tenantId", "xevn");
      store.setItem("xevn.portal.companyId", "main");
    }
  },
  {
    token,
    expiresAt: Date.now() + 8e6,
    user: data.user || { userId: "ceo@xe.vn", email: "ceo@xe.vn", roles: ["group_ceo"] },
  },
);

const targetUrl = `${PORTAL}/command-center/hrm/fleet`;
await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 90000 });
await sleep(4500);

// Prefer iframe HRM embed content
let frame = page.frames().find((f) => /\/hr\/fleet/i.test(f.url()));
if (!frame) {
  // try direct embed
  await page.goto(
    `${PORTAL}/hr/fleet?portal=1&tenantId=xevn&companyId=main`,
    { waitUntil: "networkidle2", timeout: 90000 },
  );
  await sleep(3500);
  frame = page.mainFrame();
}

const probe = await frame.evaluate(() => {
  const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const body = text(document.body);
  const pageEl = document.querySelector('[data-testid="fleet-page"]');
  const emptyEl = document.querySelector('[data-testid="fleet-empty"]');
  const banner = document.querySelector('[data-testid="fleet-catalog-missing-banner"]');
  const search = document.querySelector('[data-testid="fleet-search-input"]');
  const loading = document.querySelector('[data-testid="fleet-loading"]');
  const table = document.querySelector('[data-testid="fleet-table-card"]');
  const createCtas = [...document.querySelectorAll("button,a")].filter((el) =>
    /tạo xe|thêm xe|create vehicle|new vehicle|thêm hồ sơ xe/i.test(text(el)),
  );
  const rawKeyLeak = /hrm_fleet_[a-z0-9_]+/i.test(body);
  const spinnerCount = document.querySelectorAll(".animate-spin").length;
  return {
    url: location.href,
    hasPage: !!pageEl,
    hasEmpty: !!emptyEl,
    emptyKind: emptyEl?.getAttribute("data-empty-kind") || null,
    emptyTitle: emptyEl ? text(emptyEl.querySelector("p.font-medium, p")) : null,
    emptyBody: emptyEl ? text(emptyEl) : null,
    hasBanner: !!banner,
    bannerText: banner ? text(banner).slice(0, 280) : null,
    hasSearch: !!search,
    hasLoading: !!loading,
    hasTable: !!table,
    createCtaCount: createCtas.length,
    createCtaLabels: createCtas.map((el) => text(el)).slice(0, 5),
    rawKeyLeak,
    spinnerCount,
    bodyHasChuaCo: /Chưa có hồ sơ xe|Không tìm thấy xe khớp|Cần cấu hình danh mục/i.test(body),
    bodyHasHoSoXe: /Hồ sơ xe/i.test(body),
    slice: body.slice(0, 600),
  };
});

out.checks.pageLoad = {
  pass: probe.hasPage && probe.bodyHasHoSoXe && !probe.hasLoading,
  probe,
};

out.checks.noCreateCta = {
  pass: probe.createCtaCount === 0,
  count: probe.createCtaCount,
  labels: probe.createCtaLabels,
};

out.checks.noRawKeys = {
  pass: !probe.rawKeyLeak,
  rawKeyLeak: probe.rawKeyLeak,
};

out.checks.emptyOrCatalogUx = {
  pass:
    (probe.hasEmpty && probe.bodyHasChuaCo) ||
    probe.hasBanner ||
    probe.hasTable,
  emptyKind: probe.emptyKind,
  hasBanner: probe.hasBanner,
  hasTable: probe.hasTable,
  hasEmpty: probe.hasEmpty,
};

const getOk = fleetGets.find((g) => g.status >= 200 && g.status < 300);
out.checks.networkFleetGet = {
  pass: !!getOk,
  status: getOk?.status ?? null,
  sample: fleetGets.slice(0, 5),
  mutateHits,
};

// Keyword search — type non-match; expect GET with q= and honest empty
if (probe.hasSearch) {
  const input = await frame.$('[data-testid="fleet-search-input"]');
  if (input) {
    await input.click({ clickCount: 3 });
    await input.type("ZZZ-NOMATCH-FLEET-UX-20260727", { delay: 15 });
    await sleep(1200);
    const afterSearch = await frame.evaluate(() => {
      const emptyEl = document.querySelector('[data-testid="fleet-empty"]');
      const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
      return {
        emptyKind: emptyEl?.getAttribute("data-empty-kind") || null,
        emptyTitle: emptyEl ? text(emptyEl.querySelector("p.font-medium") || emptyEl) : null,
        hasTable: !!document.querySelector('[data-testid="fleet-table-card"]'),
      };
    });
    const qHit = fleetGets.find((g) => /[?&]q=/i.test(g.url) && g.status >= 200 && g.status < 300);
    out.checks.keywordSearch = {
      pass:
        !!qHit &&
        (afterSearch.emptyKind === "keyword_empty" ||
          afterSearch.emptyKind === "honest_empty" ||
          (!afterSearch.hasTable && !!afterSearch.emptyTitle)),
      qHit,
      afterSearch,
      note: "U65 honesty — empty OK when list empty; keyword_empty preferred when total=0 + q",
    };
  } else {
    out.checks.keywordSearch = { pass: false, detail: "search input handle missing" };
  }
} else {
  out.checks.keywordSearch = { pass: false, detail: "no search input" };
}

out.checks.noMutate = {
  pass: mutateHits.length === 0,
  mutateHits,
};

out.checks.noSpinnerStorm = {
  pass: (probe.spinnerCount || 0) <= 1 && !probe.hasLoading,
  spinnerCount: probe.spinnerCount,
};

const pngPath = "docs/qa/evidence/screenshots/qa-hrm-fleet-catalog-ux-01-20260727.png";
mkdirSync(dirname(pngPath), { recursive: true });
await page.screenshot({ path: pngPath, fullPage: true });
out.screenshot = pngPath;

const required = [
  "login",
  "pageLoad",
  "noCreateCta",
  "noRawKeys",
  "emptyOrCatalogUx",
  "networkFleetGet",
  "keywordSearch",
  "noMutate",
  "noSpinnerStorm",
];
const allPass = required.every((k) => out.checks[k]?.pass === true);
out.verdict = allPass ? "PASS" : "FAIL";
out.finishedAt = new Date().toISOString();

writeFileSync(
  "docs/qa/evidence/_tmp-qa-hrm-fleet-catalog-ux-runtime.json",
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
process.exit(allPass ? 0 : 2);
