# QA-HRM-SETTINGS-MD-JT-BROWSER-01 — Browser UF Job Templates `position_code`

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MD-JT-BROWSER-01` |
| **Prior** | `QA-HRM-SETTINGS-MD-JT-01` (BE+FE-code PASS; browser not_promoted) |
| **spec_ref** | FR-HRM-RC-JD-01 · AC-SET-FS-03 · BR-HRM-MD-01 |
| **U65** | zero-seed · **HOLD_DEPLOY** · local · **NOT** Phase1/PROD/:8088 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Verdict

| Exit | Result | Evidence |
|------|--------|----------|
| Recruitment → Thư viện JD → Thêm JD → pick `job_titles` → Lưu | **PASS** | Puppeteer via portal `:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main` |
| Network POST body has `position_code` → **2xx** | **PASS** | POST **201** `HRM-REC-JD-201`; `position_code=CHRO`; code=`JD-QA-JT-09IVVR` |
| F5 → row persists | **PASS** | After reload + tab: code + title visible; API row `position_code=CHRO` / `position_name=Giám đốc Nhân sự` |
| Empty catalog → CTA + Lưu disabled | **PASS** | Request-intercept strip `job_titles` → amber CTA «Chưa có mục…» + Settings link; **Lưu JD disabled** |
| Overall | **PASS_TO_PM** | Browser residual from JT-01 **CLOSED** |

Runtime JSON: `docs/qa/evidence/_tmp-qa-hrm-settings-md-jt-browser-01-runtime.json`  
Script: `scripts/qa/qa-hrm-settings-md-jt-browser-01.mjs`

---

## 2. L0 / env

| Check | Result |
|-------|--------|
| Portal `:5173` | **200** |
| HRM FE `:8080` (assets) | **200** |
| `GET :28001/api/hrm` | **200** `HRM-HEALTH-200` (dist-uat-w6 serve) |
| Seed | **none** (U65) |
| Invent codes | **none** — pick from live `job_titles` (`CHRO`) |

**UF origin note:** Browser must hit **portal** `http://127.0.0.1:5173/hr/...` so `/api/hrm` proxies to `:28001`. Direct `:8080/hr/...` uses HRM Vite default `VITE_DEV_PROXY_HRM_API → :3001` → **500** on settings-catalogs (FE shows «Không tải được danh mục chức danh»). Not a BE lock failure.

---

## 3. Click path (happy)

1. Login API `ceo@xe.vn` → inject `xevn.portal.*` storage  
2. Goto `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main`  
3. Tab **Thư viện JD** → **Thêm JD**  
4. Fill Mã JD + Tiêu đề  
5. Combobox **Chọn chức danh từ Cài đặt** → select **CHRO**  
6. **Lưu JD** (enabled)  
7. Network: POST `/api/hrm/recruitment/job-templates` body includes `position_code: "CHRO"` → **201**  
8. F5 → Thư viện JD → row `JD-QA-JT-09IVVR` + title present  
9. Cleanup DELETE created id → **200** (reverse of FE create; not seed)

---

## 4. Empty catalog (reproducible)

| Assert | Result |
|--------|--------|
| Intercept GET settings-catalogs → strip `job_titles` | applied |
| Amber empty CTA | **PASS** |
| «Mở Cài đặt → Danh mục…» | **PASS** |
| Lưu JD `disabled` | **PASS** |

---

## 5. Residual / not promoted

| ID | Severity | Owner | Item |
|----|----------|-------|------|
| R1 | P2 ops/FE | devops / dev-fe | Align `apps/web/hrm/vite.config.ts` default proxy `:3001` → `:28001` (mirror portal) so direct `:8080` UF works without portal origin |
| — | — | — | HOLD_DEPLOY · not Phase1/PROD · not matrix 🟢 claim beyond this UF |
| — | — | — | F5 list shows label not raw `CHRO` code (expected denorm UI) — API SoT verified |

**Do not FAIL BE** for R1.

---

## 6. Handoff

- **completion_report:** Browser UF create with catalog `position_code` → 201 → F5 persist **PASS**. Empty catalog CTA + Lưu disabled **PASS**. Prior JT-01 browser not_promoted **CLOSED**. U65 no seed. Residual: HRM FE direct `:8080` proxy default `:3001` (P2).
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qa-hrm-settings-md-jt-browser-01-20260725.md`
- **next_dispatch_prompt:** (copy-ready)

```text
work_item_id: D-HRM-FE-PROXY-28001-01
from_role: pm
to_role: devops (or dev-fe)
ack_status_target: READY_FOR_QA
entry: QA-HRM-SETTINGS-MD-JT-BROWSER-01 PASS via portal:5173; direct :8080 /api/hrm → 500 (vite default :3001)
exit: apps/web/hrm default VITE_DEV_PROXY_HRM_API = http://127.0.0.1:28001 (or .env.local); curl :8080/api/hrm/settings-catalogs 200 with Bearer; smoke Thêm JD picker loads; evidence docs/qa/evidence/devops-hrm-fe-proxy-28001-01-20260725.md
cấm: seed; change BE catalog lock; Phase1/PROD/:8088
residual_auto_fix: true (P2 — optional same session)
```

Optional PM: promote JT browser row in Settings MD matrix / close R1 from `qa-hrm-settings-md-jt-01-20260725.md`.
