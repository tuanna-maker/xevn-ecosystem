/**
 * P1-INC-P0-HRM-DASH-01-QA-R2 — workspace-meta + L0 probe (nip.io)
 */
import https from "https";

const base = (process.env.PORTAL_DEV_URL || "https://14-225-217-232.nip.io").replace(
  /\/+$/,
  "",
);
const agent = new https.Agent({ rejectUnauthorized: false });

function req(method, path, body, extraHeaders = {}) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const r = https.request(
      `${base}${path}`,
      {
        method,
        agent,
        headers: {
          "content-type": "application/json",
          ...extraHeaders,
        },
      },
      (res) => {
        let b = "";
        res.on("data", (d) => (b += d));
        res.on("end", () => {
          let json = {};
          try {
            json = JSON.parse(b);
          } catch {
            /* ignore */
          }
          resolve({ status: res.statusCode, json, raw: b.slice(0, 800) });
        });
      },
    );
    r.on("error", (e) => resolve({ status: 0, json: {}, raw: String(e) }));
    if (payload) r.write(payload);
    r.end();
  });
}

function isEpochAsOf(asOf) {
  if (!asOf || typeof asOf !== "string") return true;
  if (asOf === "1970-01-01T00:00:00.000Z") return true;
  const y = new Date(asOf).getFullYear();
  return Number.isNaN(y) || y < 2000;
}

const out = { ts: new Date().toISOString(), base, checks: {} };

const l0 = await req("GET", "/api/xbos/");
out.checks.l0_xbos = { status: l0.status, pass: l0.status === 200 };

const login = await req("POST", "/api/xbos/auth/login", {
  email: "ceo@xe.vn",
  password: "Xevn@2026",
});
const token =
  login.json?.data?.accessToken || login.json?.data?.tokens?.accessToken;
const tenant = login.json?.data?.defaultTenantId || "xevn";
const company = login.json?.data?.defaultCompanyId || "main";
out.checks.login = {
  status: login.status,
  pass: (login.status === 200 || login.status === 201) && Boolean(token),
  tenant,
  company,
};

if (!token) {
  console.log(JSON.stringify(out, null, 2));
  process.exit(2);
}

const authHeaders = {
  Authorization: `Bearer ${token}`,
  "x-tenant-id": tenant,
  "x-company-id": company,
};

const metaPath = `/api/xbos/command-center/workspace-meta?tenantId=${tenant}&companyId=${company}`;
const meta = await req("GET", metaPath, null, authHeaders);
const asOf = meta.json?.data?.asOf ?? meta.json?.asOf;
const epochFail = isEpochAsOf(asOf);
out.checks.workspace_meta = {
  status: meta.status,
  path: metaPath,
  asOf,
  epoch_fail: epochFail,
  year: asOf ? new Date(asOf).getFullYear() : null,
  pass: meta.status === 200 && !epochFail,
};

const hrmHealth = await req("GET", "/api/hrm/", null, authHeaders);
out.checks.l0_hrm = { status: hrmHealth.status, pass: hrmHealth.status === 200 };

out.verdict_api = out.checks.workspace_meta.pass && out.checks.login.pass;
console.log(JSON.stringify(out, null, 2));
process.exit(out.verdict_api ? 0 : 1);
