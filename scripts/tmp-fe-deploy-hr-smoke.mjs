import https from "https";

const base = "https://14-225-217-232.nip.io";
const agent = new https.Agent({ rejectUnauthorized: false });

function get(path) {
  return new Promise((resolve) => {
    https
      .get(`${base}${path}`, { agent }, (res) => {
        let b = "";
        res.on("data", (d) => (b += d));
        res.on("end", () => resolve({ status: res.statusCode, body: b }));
      })
      .on("error", (e) => resolve({ status: 0, body: String(e) }));
  });
}

const hr = await get("/hr/");
const checks = {
  hr_status: hr.status,
  hr_len: hr.body.length,
  crash_isSupabaseConfigured: hr.body.includes("isSupabaseConfigured is not defined"),
  crash_reference: /ReferenceError.*isSupabaseConfigured/.test(hr.body),
  has_vite: hr.body.includes("@vite") || hr.body.includes("/hr/src/"),
};

// Fetch a transformed module if we can find main entry
const mod = await get("/hr/src/hooks/useSubscriptionPlans.ts");
checks.module_status = mod.status;
checks.module_has_supabaseEnabled = mod.body.includes("supabaseEnabled = false");
checks.module_undefined_ref = /enabled:\s*isSupabaseConfigured/.test(mod.body);

const pass =
  checks.hr_status === 200 &&
  !checks.crash_isSupabaseConfigured &&
  !checks.crash_reference &&
  (checks.module_status !== 200 || checks.module_has_supabaseEnabled);

console.log(JSON.stringify({ ts: new Date().toISOString(), checks, pass }, null, 2));
process.exit(pass ? 0 : 1);
