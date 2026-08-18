# PCOMP-W6-QA-UAT-PREP-02 — Sponsor UAT session pack (localhost · 2026-07-28)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-PCOMP-W6-LOCAL-UAT-02` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Baseline** | `docs/program/evidence/pcomp-w6-uat-session-pack-20260609.md` · `docs/qa/evidence/pcomp-w6-qa-uat-prep-01-20260725.md` |
| **Host policy** | **1B LOCAL ONLY** — assert **chỉ** `localhost` / `127.0.0.1` |
| **Out of scope** | `:8088` · `portal.xe.vn` · corp DNS · theme commit · Phase1/PROD claim · sponsor click sign-off |
| **Locks** | **U65** zero-seed · **HOLD_DEPLOY** · **5A** do NOT claim Phase1/PROD |

---

## 0. Verdict (prep pack)

| Item | Status |
|------|--------|
| Pack refreshed for sponsor click session | **PASS** (this file) |
| L0 `qc:dev-stack` | **BLOCKED** — see §1 (all three probes down) |
| Optional team smoke (ceo → CC → one HRM tab) | **SKIPPED** — L0 not green |
| Sponsor may start `PCOMP-W6-SP-01` | **NO** until `qc:dev-stack` exit 0 |
| Phase1 / PROD / portal.xe.vn / UAT-PASS sponsor | **NOT claimed** · **OUT OF SCOPE** |

---

## 1. L0 status (2026-07-28 ~08:50–08:52 UTC+7)

**Command:** `pnpm run qc:dev-stack` (ASCII SoT `C:\xevn-ecosystem`)

| Attempt | Time (UTC+7) | Exit | Notes |
|---------|--------------|------|-------|
| 1 | ~08:50 | **1** | All three FAIL fetch |
| 2 | ~08:51 (+20s wait) | **1** | All three FAIL; no LISTENING on 28001/28002/5173/5175 |
| 3 | ~08:52 (+45s wait) | **1** | All three FAIL; ports still empty |
| 4 | **08:52:36** | **1** | Final confirm — same |

| Process | Probe | Result |
|---------|-------|--------|
| **hrm-api** | `http://127.0.0.1:28001/api/hrm` | **FAIL** — `fetch failed` / connection refused |
| **xbos-api** | `http://127.0.0.1:28002/api/xbos` | **FAIL** — `fetch failed` / connection refused |
| **web-portal** | `http://127.0.0.1:5173` | **FAIL** — `fetch failed` (optional L0) |
| web-portal `:5175` | — | not listening |

**Missing processes (exact):** `hrm-api` **:28001**, `xbos-api` **:28002**, `web-portal` **:5173** (all down).

**Coord:** Bus `pm -> devops | DISPATCHED PCOMP-W6-DO-LOCAL-STACK-02` @ 2026-07-28T08:50:18+07:00 — evidence `pcomp-w6-do-local-stack-02-20260728.md` **not yet present** at QA close. Prior green evidence (2026-07-25): `docs/qa/evidence/pcomp-w6-do-local-stack-01-20260725.md` (historical; processes not left up).

**Start order (team — not sponsor):** `docs/ops/LOCAL_DEV_STACK_L0.md`

```bash
pnpm run dev:hrm-api    # Terminal A — wait Nest "successfully started"
pnpm run dev:xbos-api   # Terminal B
pnpm run dev:web        # or web-only — expect :5173
pnpm run qc:dev-stack   # expect exit 0
pnpm run qc:fe-be-health
```

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

## 4. Optional team smoke (not sponsor sign-off)

| Step | Result |
|------|--------|
| Login `ceo@xe.vn` → `/command-center` → one HRM embed tab | **SKIPPED** — L0 BLOCKED (no portal/API listeners) |
| Verdict | N/A — does **not** replace `PCOMP-W6-SP-01` |

---

## 5. Explicit locks (mọi handoff)

| Lock | Rule |
|------|------|
| **U65** | Zero-seed; không `pnpm seed:*`; không API/DB fake để có data UAT |
| **HOLD_DEPLOY** | Không deploy / không promote `:8088` làm host UAT W6 |
| **1B** | Localhost only |
| **4C** | `portal.xe.vn` **OUT OF SCOPE** — không test corp DNS |
| **5A** | **Không** claim Phase 1 DONE / PROD-READY từ phiên này |
| **2B** | Theme commit không bắt buộc cho pack này |
| **Sponsor UAT** | Pack prep ≠ UAT-PASS; only sponsor marks `PCOMP-W6-SP-01` |

---

## 6. Gate — Sponsor may start `PCOMP-W6-SP-01`

| Question | Answer |
|----------|--------|
| **Sponsor may start PCOMP-W6-SP-01?** | **NO** |
| Reason | L0 `qc:dev-stack` exit **1** — hrm :28001 + xbos :28002 + portal :5173 all down |
| Unblock | DevOps completes `PCOMP-W6-DO-LOCAL-STACK-02` → `qc:dev-stack` exit **0** → PM reconfirms → then invite sponsor with **this pack** |

---

## 7. Ký nhận sponsor (`PCOMP-W6-SP-01`)

| Field | Value |
|-------|-------|
| Verdict | [ ] UAT-PASS [ ] UAT-FAIL [ ] BLOCKED (L0) |
| Defect notes | |
| Ngày | |
| Pack used | `docs/qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md` |

Ghi bus: `PCOMP-W6-SP-01 | sponsor -> pm | verdict`

---

## 8. Handoff

```text
completion_report: |
  Refreshed W6 sponsor UAT pack 20260728 (localhost FE-only, U65).
  L0 BLOCKED after 4 probes: hrm:28001 + xbos:28002 + portal:5173 all down.
  Coord: PCOMP-W6-DO-LOCAL-STACK-02 DISPATCHED, evidence not yet on disk.
  Checklist tables ready: P-CC-01..09 + J-HRM-01..07 + member negative.
  Team smoke SKIPPED. Sponsor may start PCOMP-W6-SP-01: NO.
  Explicit: NOT sponsor UAT-PASS · HOLD_DEPLOY · NOT Phase1/PROD · NOT portal.xe.vn · NOT :8088.
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W6-SP-01
from_role: pm
to_role: sponsor (invite) — ONLY after L0 green
entry_criteria:
  - PCOMP-W6-DO-LOCAL-STACK-02 (or reconfirm) brings hrm:28001 + xbos:28002 + portal:5173 UP
  - pnpm run qc:dev-stack exit 0 (prefer also qc:fe-be-health exit 0)
  - Pack: docs/qa/evidence/pcomp-w6-qa-uat-prep-02-20260728.md
URL: http://localhost:5173
accounts:
  - ceo@xe.vn / Xevn@2026 (holding / company_id=main)
  - du-lich.ceo@xe.vn / Xevn@2026 (member negative 403/409)
exit_criteria:
  - PM invites sponsor to run click checklist §3 (P-CC-01..09 L2 + J-HRM-01..07 L2.5)
  - Sponsor marks verdict on bus PCOMP-W6-SP-01
  - Team does NOT claim UAT-PASS for sponsor
cấm: seed · deploy :8088 · portal.xe.vn · Phase1/PROD claim
locks: U65 · HOLD_DEPLOY · 1B local only
standing_today: Sponsor may start = NO until L0 green
```
