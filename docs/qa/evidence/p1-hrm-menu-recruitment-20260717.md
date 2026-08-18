# P1-HRM-MENU-QA-RECRUITMENT — Tuyển dụng exclusive menu (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-RECRUITMENT` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · Group CEO · `companyId=main` |
| **spec_ref** | P-CC-06 · J-HRM-05 · UF-HRM-12 · UC-HRM-22 |
| **U65** | zero-seed · browser FE path; API read/probe only with session Bearer (no `pnpm seed:*`) |
| **ack_status** | **FAIL_TO_PM** |

---

## Verdict

**FAIL** — Menu shell + list loads for Dashboard / Requisitions / Candidates, but exclusive-menu gate fails on **console toast errors**, **candidate-evaluations request storm → HTTP 429**, **PermissionGate blocking requisition mutate UI**, and **Đề xuất list UI empty vs API data**. Mutate «Tạo đề xuất → Lưu → F5» **not closed**.

| Gate | Result |
|------|--------|
| L0 portal `/command-center/hrm/recruitment` | **PASS** — login redirect OK; sidebar **Tuyển dụng** current; no ERROR banner / 409 / `54321` |
| L2 Dashboard tab | **PASS** — KPIs (CV=5); recent activity rows; no Sync ERROR |
| L2 Yêu cầu tuyển dụng | **PASS** list — **45** rows; `GET …/requisitions` **200** `HRM-REC-200` (~3079 ms) |
| L2 Ứng viên | **PASS** list — **5** pool rows (`candidates-pool` **200**); UI actions present |
| L2 Đề xuất | **FAIL** — UI cards **0** while `GET …/headcount-proposals` **200** total **8** |
| Console / toast | **FAIL P0** — toast «Lỗi / signal is aborted without reason»; later «Too many requests» |
| Network storm | **FAIL P0** — `GET …/candidate-evaluations` × tens; durations → **20–30s** then **429** `RATE-429` |
| L2.5 J-HRM-05 requisition detail (UI) | **FAIL** — **Thao tác** empty; no **Sửa** (PermissionGate `recruitment:update` + empty `usePermissions`) |
| L2.5 J-HRM-05 requisition detail (API) | **PASS** — `GET …/requisitions/{id}?company_id=main` **200** `HRM-REC-200` (scope OK; sample `company_id=holding`) |
| L2.5 candidate detail | **PASS** — Eye → detail headings «Quá trình tuyển dụng / Thông tin cá nhân» |
| Mutate UF-HRM-12 «Tạo đề xuất» | **FAIL** — dialog opens + fields fillable; FE submit did not persist; POST probe also **429** under storm |
| U65 no seed | **PASS** |

---

## Environment / session

| Item | Value |
|------|-------|
| Portal URL | `http://14.225.217.232:8088/command-center/hrm/recruitment` |
| HRM iframe / direct | `http://14.225.217.232:8088/hr/recruitment?portal=1&tenantId=xevn&companyId=main` |
| Click path | Login `ceo@xe.vn` → redirect recruitment → (iframe) Dashboard → Yêu cầu tuyển dụng → Ứng viên → Eye detail → Đề xuất → Tạo đề xuất |
| Storage | `hrm_portal_mode=1` · `hrm_current_company_id=main` · JWT `roleCode=group_ceo` |
| Scope filter UI | «Tất cả đơn vị (rollup)» |

---

## L0 / L2 evidence

### Portal shell
- Login with redirect to recruitment succeeded.
- CC sidebar: **Tuyển dụng** badge **3**, state `current`.
- Iframe `title=HRM Workspace` loaded **200**.

### Dashboard
- Tabs present: Dashboard, Yêu cầu tuyển dụng, Tin Tuyển dụng, Ứng viên, Đề xuất, Chiến dịch, Phỏng vấn, Đánh giá, Kế hoạch, Báo cáo.
- Cards: Chỉ tiêu «Không có dữ liệu»; **CV Ứng tuyển = 5**; Phỏng vấn/Đã tuyển = 0.
- Recent: QA Pool `17801147…` rows.

### Yêu cầu tuyển dụng (P-CC-06 / UC-HRM-22)
- Heading + copy: «UC-HRM-22 — tạo / sửa trạng thái requisition qua HRM API (F5 xác minh danh sách).»
- Table rows ≈ **45** (titles `QA UF12…`, dept `operations`, status Tạm dừng / Đang tuyển).
- **Thêm yêu cầu** / **Sửa** **not rendered** (PermissionGate).
- Network: `GET /api/hrm/recruitment/requisitions?company_id=main` → **200** · **~3079 ms** (P1 latency).

### Ứng viên
- «Quản lý ứng viên» · tabs **Tất cả 5 / Ứng tuyển 5**.
- Rows: QA Pool emails `@mail.xe.vn`, source `qa-smoke`.
- `GET /api/hrm/recruitment/candidates-pool?company_id=main` → **200**.
- Session probe: `GET /api/hrm/recruitment/candidates?company_id=main` → **200** `HRM-REC-200` · total **99** (UI uses pool subset — note cardinality gap, non-blocking alone).

### Đề xuất
- Cards all **0**; list title «Danh sách đề xuất ngoài định biên».
- Button **Tạo đề xuất** visible (not PermissionGate-blocked).
- XHR (before full 429 lock): `GET /api/hrm/recruitment/headcount-proposals?company_id=main` → **200** `HRM-REC-HC-200` · **total 8** · sample title present → **UI↔API mismatch**.

---

## Console / Network (P0)

| Signal | Evidence |
|--------|----------|
| `console.error` | `Error fetching evaluations: AbortError: signal is aborted without reason` (repeated ×10+) |
| Toast | «Lỗi — signal is aborted without reason»; «Lỗi — Too many requests» |
| `GET …/candidate-evaluations?company_id=main` | Count **≥38** in session; many **>3s**, later **~20–28s**, status **200 → 429** |
| Impact | Toast overlays intercept clicks; later **RATE-429** on other recruitment POSTs |

**Root-cause class:** FE mount/query storm on evaluations (dashboard + candidates) without coalesce/abort hygiene → rate limiter → product toast as user-facing error.

---

## L2.5 J-HRM-05

| Step | Result |
|------|--------|
| Requisitions list → UI detail/edit | **FAIL** — no **Sửa** button (`PermissionGate` + `usePermissions` always `[]`) |
| `GET /api/hrm/recruitment/requisitions/{id}?company_id=main` | **PASS** — **200** `HRM-REC-200` · title matched list row · id `94157232-03ee-4f9f-b247-a900cff51ada` |
| Candidates list → Eye detail | **PASS** — detail view «QA Pool… / Quá trình tuyển dụng / Thông tin cá nhân» |
| scope_parity | List + get-by-id both 200 under `company_id=main` (no 404/409) |

---

## Mutate UF-HRM-12 (U65)

| Step | Result |
|------|--------|
| Open **Tạo đề xuất** | **PASS** — dialog «Tạo đề xuất tuyển dụng ngoài định biên»; required fields visible |
| Fill title/dept/position/proposer/justification | **PASS** (browser fill) |
| Submit → Network POST 2xx → FE list update | **FAIL** — dialog stayed open; no successful create observed |
| POST probe `/api/hrm/recruitment/headcount-proposals` | **FAIL** — **429** `RATE-429` «Too many requests» (after evaluations storm) |
| F5 persistence | **Not executed** (create never succeeded) |

Note: Prior R4 🟢 for UF-HRM-12 covered **dialog open + crypto polyfill** only — this exclusive menu wave requires full mutate+F5 and fails.

---

## Defects (open)

| ID | Severity | Summary | Owner hint |
|----|----------|---------|------------|
| **D-HRM-REC-EVAL-STORM-429** | **P0** | `candidate-evaluations` fan-out → AbortError toasts + **429** | `dev-fe` (+ `dev-be` rate-limit/obs) |
| **D-HRM-REC-PERM-GATE** | **P1** | Portal Group CEO: empty permissions → no **Thêm yêu cầu** / **Sửa** | `dev-fe` (`usePermissions` / PermissionGate portal bypass) |
| **D-HRM-REC-HC-UI-ZERO** | **P1** | Đề xuất UI **0** vs API total **8** | `dev-fe` (`HeadcountProposalTab` / `currentCompanyId` fetch) |
| **D-HRM-REC-MUTATE-UI** | **P1** | Tạo đề xuất dialog does not complete FE→API create under U65 | `dev-fe` (blocked further by P0 429) |
| **D-HRM-REC-REQ-LATENCY** | **P1** | Requisitions list ~3.1s; evaluations p95 ≫3s | `dev-be` / NFR wave |

---

## Matrix / journey note

- Recommend matrix **UF-HRM-12** Dev8088 → **🔴** until P0/P1 closed and mutate+F5 retested.
- **J-HRM-05** journey map prior ✅ is **superseded for UI detail** on this env until PermissionGate fixed; API detail still green.

---

## Residual

1. P0 evaluations storm must clear before any mutate retest.
2. Requisition create/edit UI unavailable to Group CEO portal persona.
3. Headcount proposal list binding broken (0 vs 8).
4. Perf: requisitions >3s; evaluations storm.

---

## ack_status

**FAIL_TO_PM**

### completion_report
Closed exclusive-menu QA for Tuyển dụng on `:8088` with browser L0/L2/L2.5/mutate attempt under U65. **Not PASS**: P0 evaluations AbortError/429 storm, PermissionGate hides requisition edit, Đề xuất UI empty vs API, mutate save not completed.

### next_owner
`pm` → dispatch **`dev-fe`** (P0 storm + PermissionGate + HC UI) then **`qa`** retest same work_item.

### next_dispatch_prompt
```text
work_item_id: P1-HRM-MENU-QA-RECRUITMENT-FIX
from_role: pm | to_role: dev-fe
entry_criteria: evidence docs/qa/evidence/p1-hrm-menu-recruitment-20260717.md FAIL
fix:
1) D-HRM-REC-EVAL-STORM-429 — stop candidate-evaluations fan-out/abort toast; ensure Dashboard+Candidates do not fire N parallel GETs; no user toast on AbortError.
2) D-HRM-REC-PERM-GATE — portal Group CEO must see Thêm yêu cầu / Sửa on JobRequisitionsTab (fix usePermissions empty stub or portal bypass).
3) D-HRM-REC-HC-UI-ZERO — Đề xuất list must show API headcount-proposals for companyId=main.
4) D-HRM-REC-MUTATE-UI — Tạo đề xuất → POST 2xx → list row → F5.
exit_criteria: READY_FOR_QA; evidence path for FE; no 429 on recruitment tabs under ceo@xe.vn rollup.
Then QA retest P1-HRM-MENU-QA-RECRUITMENT on http://14.225.217.232:8088/command-center/hrm/recruitment (U65).
```

### evidence_path
`docs/qa/evidence/p1-hrm-menu-recruitment-20260717.md`
