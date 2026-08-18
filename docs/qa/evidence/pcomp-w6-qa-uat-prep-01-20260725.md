# PCOMP-W6-QA-UAT-PREP-01 — Sponsor UAT session pack (localhost · 2026-07-25)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W6-QA-UAT-PREP-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Baseline** | `docs/program/evidence/pcomp-w6-uat-session-pack-20260609.md` |
| **Host policy** | **1B LOCAL ONLY** — assert **chỉ** `localhost` / `127.0.0.1` |
| **Out of scope** | `:8088` · `portal.xe.vn` · corp DNS · theme commit · Phase1/PROD claim |
| **Locks** | **U65** zero-seed · **HOLD_DEPLOY** · **5A** do NOT claim Phase1/PROD |

---

## 0. Verdict (prep pack)

| Item | Status |
|------|--------|
| Pack refreshed for sponsor click session | **PASS** (this file) |
| L0 `qc:dev-stack` | **BLOCKED** — see §1 |
| Sponsor may start `PCOMP-W6-SP-01` | **NO** until L0 green (PM invite after stack up) |
| Phase1 / PROD / portal.xe.vn | **NOT claimed** · **OUT OF SCOPE** |

---

## 1. L0 status (2026-07-25 ~18:25 UTC+8)

```text
pnpm run qc:dev-stack
```

| Process | Probe | Result |
|---------|-------|--------|
| **hrm-api** | `http://127.0.0.1:28001/api/hrm` | **FAIL** — `fetch failed` / connection refused |
| **xbos-api** | `http://127.0.0.1:28002/api/xbos` | **PASS** HTTP 200 |
| **web-portal** | `http://127.0.0.1:5173` | **PASS** HTTP 200 (L0 optional) |
| web-portal `:5175` | — | not listening (OK — use **5173**) |

**Missing process (exact):** `hrm-api` on port **28001**.

**Start order (team — not sponsor):** `docs/ops/LOCAL_DEV_STACK_L0.md`

```bash
pnpm run dev:hrm-api    # Terminal A — wait Nest "successfully started"
# xbos + portal already up on this workstation
pnpm run qc:dev-stack   # expect exit 0
pnpm run qc:fe-be-health
```

Parallel stack work already noted in `TEAM_WORKING_NOW.md`: `PCOMP-W6-DO-LOCAL-STACK-01`.

**U65:** Do **not** seed to “unblock” L0. Fix process/compile only.

---

## 2. Sponsor session — URL & accounts (LOCAL ONLY)

### URL

| Dịch vụ | URL |
|---------|-----|
| Web portal | **http://localhost:5173** |
| HRM API (health) | http://localhost:28001/api/hrm |
| XBOS API (health) | http://localhost:28002/api/xbos |

**Cấm assert:** `http://…:8088`, `https://portal.xe.vn`, corp DNS, nip.io-as-UAT-host for this W6 pack (1B / 4C).

### Tài khoản

| Persona | Email | Mật khẩu | Kỳ vọng scope |
|---------|-------|----------|---------------|
| CEO tập đoàn | `ceo@xe.vn` | `Xevn@2026` | JWT `company_id=main` · full Command Center + HRM embed rollup |
| CEO ĐVTV | `du-lich.ceo@xe.vn` | `Xevn@2026` | Scope member (`xe-du-lich`) · **403/409** trên rollup tập đoàn = **PASS negative** · **không** dùng `xevn-uat-2026` trên portal |

Mobile APK / `uat.nv####` = **không bắt buộc** cho phiên sponsor W6 web (team lane riêng nếu cần).

---

## 3. Checklist sponsor click (đánh dấu PASS / FAIL)

> Chỉ chạy khi L0 = green. Mọi bước = **FE-only** (login → menu → click). **Cấm seed**. Empty + HTTP 200 hợp lệ; banner đỏ / 409 scope / 54321 / detail 404 sau list = **FAIL**.

### 3a. L2 — P-CC (Command Center + HRM embed)

| ID | Route / hành động | PASS khi | ☐ |
|----|-------------------|----------|---|
| **P-CC-01** | `/login` → `/command-center` (`ceo@xe.vn`) | Redirect OK; session sống | ☐ |
| **P-CC-02** | CC settings / đơn vị thành viên | List units load; không 403 bất thường trên holding | ☐ |
| **P-CC-03** | `/command-center/hrm/employees` | Sync OK hoặc empty+200; không banner Sync ERROR; không 409 load | ☐ |
| **P-CC-04** | `/command-center/hrm/contracts` | List 200; không 409/54321 | ☐ |
| **P-CC-05** | `/command-center/hrm/insurance` | List 200 hoặc empty+200 | ☐ |
| **P-CC-06** | `/command-center/hrm/recruitment` | List 200 hoặc empty+200 | ☐ |
| **P-CC-07** | `/command-center/hrm/attendance` | Records/sheets load; không ngày 01/01/1970 | ☐ |
| **P-CC-08** | `/command-center/hrm/payroll` | Payslips 200 hoặc empty+200 | ☐ |
| **P-CC-09** | Catalog governance inbox | Inbox 200; empty OK | ☐ |

### 3b. L2.5 — J-HRM-01..07 (bắt buộc)

| J-ID | Click path | FAIL tức thì | ☐ |
|------|------------|--------------|---|
| **J-HRM-01** | P-CC-04 → click **tên NV** → hồ sơ | Detail 404 / «Không tìm thấy» với `company_id=main` | ☐ |
| **J-HRM-02** | P-CC-03 → row → hồ sơ | Scope parity list≠get | ☐ |
| **J-HRM-03** | P-CC-04 → mở chi tiết HĐ (drawer/modal) | Drawer trống do API fail | ☐ |
| **J-HRM-04** | P-CC-05 → link NV linked | 404 scope | ☐ |
| **J-HRM-05** | P-CC-06 → requisition/candidate detail | Detail 404 | ☐ |
| **J-HRM-06** | P-CC-07 → bản ghi / yêu cầu detail | Detail 404 | ☐ |
| **J-HRM-07** | P-CC-08 → phiếu lương detail | Detail 404 | ☐ |

### 3c. Negative scope (member CEO)

| Step | Account | PASS khi | ☐ |
|------|---------|----------|---|
| Login member | `du-lich.ceo@xe.vn` | Vào portal member slice | ☐ |
| Thử rollup tập đoàn / data ngoài scope | same | **403/409** hoặc UI scoped — **không** full holding leak | ☐ |

### 3d. GWC đã đóng — **không re-open** trừ regression

| Condition | Evidence | Sponsor action |
|-----------|----------|----------------|
| **Company-col local GWC** (`QC-HRM-EMP-COMPANY-COL-01`) | `docs/qa/evidence/qc-hrm-emp-company-col-01-20260725.md` | Spot cột Công ty (LE SoT) trên P-CC-03 nếu hữu ích; **chỉ FAIL** nếu regress Khối / sai LE |
| **JWT GWC** (`C-JCC03-01` / P-CC-01-jwt · `expiresInSec=86400`) | QC GO freshness 2026-07-19+ · matrix P-CC-01 | **Không** re-open JWT wave; chỉ note nếu login TTL lệch rõ trên local |

---

## 4. Explicit locks (mọi handoff)

| Lock | Rule |
|------|------|
| **U65** | Zero-seed; không `pnpm seed:*`; không API/DB fake để có data UAT |
| **HOLD_DEPLOY** | Không deploy / không promote `:8088` làm host UAT W6 |
| **1B** | Localhost only |
| **4C** | `portal.xe.vn` **OUT OF SCOPE** — không test corp DNS |
| **5A** | **Không** claim Phase 1 DONE / PROD-READY từ phiên này |
| **2B** | Theme commit không bắt buộc cho pack này |

---

## 5. Ký nhận sponsor (`PCOMP-W6-SP-01`)

| Field | Value |
|-------|-------|
| Verdict | [ ] UAT-PASS [ ] UAT-FAIL [ ] BLOCKED (L0) |
| Defect notes | |
| Ngày | |
| Pack used | `docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md` |

Ghi bus: `PCOMP-W6-SP-01 | sponsor -> pm | verdict`

---

## 6. Handoff

```text
completion_report: |
  Refreshed W6 sponsor UAT pack for localhost FE-only (U65).
  L0 BLOCKED: hrm-api :28001 down (xbos 200 + portal :5173 200).
  Checklist: P-CC-01..09 + J-HRM-01..07 + member negative;
  company-col local GWC + JWT GWC noted CLOSED — do not re-open unless regress.
  Explicit: HOLD_DEPLOY · NOT Phase1/PROD · NOT portal.xe.vn · NOT :8088.
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W6-SP-01
from_role: pm
to_role: sponsor (invite) + devops confirm L0
entry_criteria:
  - PCOMP-W6-DO-LOCAL-STACK-01 (or equivalent) brings hrm-api :28001 UP
  - pnpm run qc:dev-stack exit 0
  - Pack: docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md
exit_criteria:
  - PM invites sponsor to run click checklist §3 (P-CC L2 + J-HRM-01..07)
  - Sponsor marks verdict on bus PCOMP-W6-SP-01
cấm: seed · deploy :8088 · portal.xe.vn · Phase1/PROD claim
locks: U65 · HOLD_DEPLOY · 1B local only
```
