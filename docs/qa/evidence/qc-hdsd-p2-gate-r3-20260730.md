# QC Gate R3 — HDSD Phase 2 Re-gate (`QC-HDSD-P2-GATE-01-R3`)

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HDSD-P2-GATE-01-R3 |
| **program** | HDSD-P2-FULL-01 |
| **gate_type** | Phase 2 re-gate after R2 GWC condition progress |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **prior_gate** | `qc-hdsd-p2-gate-r2-20260730.md` (GWC doc slice) |
| **ack_status** | PASS_TO_PM |

## Verdict

**GO WITH CONDITIONS (web client doc slice)** — HDSD HTML+PDF deliverable **approved for sponsor web review** with **8 mobile CH12 figures explicitly deferred**. Closes R2 conditions **C-R2-01** (phrase scrub), **C-R2-03** (matrix W0–W4 promote), **C-R2-04** (web FIG wiring). **C-R2-02 remains OPEN** (8 `hrm-12-*.png` missing; `qa-device` blocked on UAT NV auth 401).

**NOT:** client-final · full Phase 2 GO · HDSD UAT-PASS program · PROD-READY · mobile-complete deliverable.

---

## R2 condition audit

| ID | R2 status | R3 audit | QC verdict |
|----|-----------|----------|------------|
| **C-R2-01** | OPEN — 21× `placeholder Phase 2` | `hdsd-p2-scrub-phrase-01-20260730.md`; grep MD **0** · HTML **0** | 🟢 **CLOSED** |
| **C-R2-03** | OPEN — matrix body ⬜ | `qa-hdsd-matrix-promote-02-20260730.md`; **+25** rows; spot 083/048/028 🟢; **0 regression** | 🟢 **CLOSED (W0–W4 body scope)** |
| **C-R2-04** | OPEN — 51 FIG web duplicates | `qa-hdsd-fig-verify-01-20260730.md`; FIG **8** mobile-only · webFIG **0** · IMG **95** | 🟢 **CLOSED (web scope)** |
| **C-R2-02** | OPEN — mobile CH12 capture | 8 PNG **MISSING** on disk; `qa-hdsd-mob-ch12-01-r3` auth **401** BLOCKED | 🔴 **OPEN** |

---

## Evidence polled

| Artifact | Path | QC read |
|----------|------|---------|
| Prior GWC | `docs/qa/evidence/qc-hdsd-p2-gate-r2-20260730.md` | ✅ baseline |
| Phrase scrub | `docs/qa/evidence/hdsd-p2-scrub-phrase-01-20260730.md` | ✅ C-R2-01 |
| Matrix promote | `docs/qa/evidence/qa-hdsd-matrix-promote-02-20260730.md` | ✅ C-R2-03 |
| FIG verify | `docs/qa/evidence/qa-hdsd-fig-verify-01-20260730.md` | ✅ C-R2-04 |
| Mobile UAT | `docs/qa/evidence/qa-hdsd-mob-ch12-01-r3-20260730.md` | ✅ C-R2-02 blocker |
| HTML artifact | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | ✅ 23.37 MB |
| PDF artifact | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` | ✅ 7.28 MB |

---

## Independent QC scan (fail-closed)

Script: `node scripts/qa/_tmp-qc-hdsd-r3-scan.mjs` (session 20260730)

| Metric | R2 GWC | R3 independent | Result |
|--------|--------|----------------|--------|
| PNG on disk | 110 | **110** | 🟢 |
| `[[IMG:…]]` wired | 95 | **95** (89 unique paths) | 🟢 |
| `[[FIG:…]]` total | 51 | **8** | 🟢 (−43 web removed) |
| Web `[[FIG:…]]` | 43 | **0** | 🟢 |
| Mobile CH12 `[[FIG:…]]` | 8 | **8** | 🟡 C-R2-02 |
| DIAGRAMS bundle keys | 110 | **110** | 🟢 |
| PDF present | ✅ 8.25 MB | **✅ 7.28 MB** | 🟢 |
| `placeholder Phase 2` (HTML) | 20 | **0** | 🟢 C-R2-01 |
| `placeholder Phase 2` (MD src) | 21 | **0** | 🟢 |
| `work_item` / `TC-HDSD-` | 0 | **0** | 🟢 |
| `ảnh chưa có` in HTML | 0 | **8** (mobile FIG captions only) | 🟡 expected until capture |
| CH01 `eco-1` · CH03 `xbos-3-0` · CH05 `hrm-5-1` | 🟢 | **🟢** inline IMG + DIAGRAMS | 🟢 |
| Duplicate IMG+FIG pairs (120 char window) | — | **0** | 🟢 |

### 8 mobile FIG slots (C-R2-02 backlog)

| # | Asset | PNG on disk | FIG caption (abbrev) |
|---|-------|-------------|----------------------|
| 1 | `hrm/hrm-12-1.png` | ❌ MISSING | Đăng nhập HRM Mobile |
| 2 | `hrm/hrm-12-2.png` | ❌ MISSING | Trang chủ + FAB Chấm công |
| 3 | `hrm/hrm-12-3.png` | ❌ MISSING | Đội nhóm + Check-in |
| 4 | `hrm/hrm-12-4.png` | ❌ MISSING | Nghỉ phép |
| 5 | `hrm/hrm-12-5.png` | ❌ MISSING | Phiếu lương |
| 6 | `hrm/hrm-12-6.png` | ❌ MISSING | Phê duyệt QL |
| 7 | `hrm/hrm-12-7.png` | ❌ MISSING | Hồ sơ cá nhân |
| 8 | `hrm/hrm-12-8.png` | ❌ MISSING | Thông báo |

**Capture policy:** U65 device/emulator only · `uat.nv####@xe.vn` / `xevn-uat-2026` · **cấm** ceo fallback for promote · blocked until `D-HDSD-MOB-UAT-AUTH-01` resolves 401.

---

## CH01 / CH03 / CH05 spot (sample chapters)

| Chapter | Sample keys | IMG wired | DIAGRAMS | Verdict |
|---------|-------------|-----------|----------|---------|
| **CH01** Ecosystem | `ecosystem/eco-1.png` | ✅ | ✅ base64 | 🟢 |
| **CH03** XBOS Org | `xbos/xbos-3-0.png` | ✅ | ✅ base64 | 🟢 |
| **CH05** HRM NV | `hrm/hrm-5-1.png` | ✅ | ✅ base64 | 🟢 |

**PDF spot (structural):** File exists 7.28 MB; prior rebuild embedded images (not draft 387 KB). Full print audit deferred to sponsor; mobile CH12 pages show dashed FIG until C-R2-02 closes.

---

## Matrix spot (C-R2-03)

| Matrix ID | Legacy TC | Verdict | Evidence ref |
|-----------|-----------|---------|----------------|
| TC-XBOS-HDSD-028 | TC-HDSD-02-01-01 | 🟢 | W1 ch02-04 login |
| TC-HRM-HDSD-048 | TC-HDSD-06-03-01 | 🟢 | insurance 3×200 L1 |
| TC-HRM-HDSD-083 | TC-HDSD-08-02-01 | 🟢 | leave POST 201 U65 |
| TC-HRM-HDSD-027 | TC-HDSD-05-02-01 | 🟢 | J-HRM profile nav |

QA wave summary: **71 🟢** body promote (+25 this wave); **0** 🟢→⬜ regression. **285** dialog/mutate-depth rows remain ⬜ (honest U65).

---

## Browser / journey (doc slice · read-only)

| Check | URL / account | L2 | L2.5 |
|-------|---------------|-----|------|
| Portal load spot (upstream R2) | `:5173` · `ceo@xe.vn` | 🟢 5/5 routes | deferred program wave |
| J-CC-HRM-01 | embed CC→HRM | — | not re-run R3 doc gate |
| J-MOB-03/04/05 | mobile NV UAT | — | 🔴 BLOCKED auth 401 |

**portal_url:** `http://127.0.0.1:5173` (web doc capture) · mobile pilot `http://14.225.217.232:3001` (auth probe only)

---

## Classification

| Class | Items |
|-------|-------|
| **CLOSED (R3 vs R2 GWC)** | C-R2-01 phrase scrub · C-R2-03 matrix W0–W4 body · C-R2-04 web FIG (51→8 mobile-only) · web 95/95 IMG · PDF present |
| **P2 mobile (condition)** | C-R2-02 — 8 PNG + 8 dashed FIG · `ảnh chưa có` visible in CH12 until capture |
| **P2 program (out of slice)** | 285 matrix ⬜ depth · mutate gaps · J-MOB blocked · NOT Phase 2 DONE |
| **ENV (non-blocker doc)** | `uat.nv0001` 401 on pilot/local — **product auth lane**, not HTML build defect |

**ENV vs PRODUCT:** Mobile auth 401 blocks **capture/UAT**, not web HTML/PDF integrity. Web deliverable GWC stands.

---

## GO WITH CONDITIONS scope

**Approved for handoff (web):**

- `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` (95 inline web screenshots)
- `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf`
- `docs/client-delivery/hdsd/assets/**` (110 web PNG; excludes hrm-12-*)
- Chapters CH01–CH11 fully wired; CH12 text + 8 dashed FIG placeholders

**Conditions before sponsor «client-final» or full Phase 2 GO:**

| ID | Condition | Owner | Blocks |
|----|-----------|-------|--------|
| C-R2-02 | Capture 8 mobile PNG → inject `hrm-12-1..8` · rebuild | qa-device + dev-fe | client-final · full GO |
| C-R3-MOB-AUTH | `D-HDSD-MOB-UAT-AUTH-01` — uat.nv0001 login 201 | dev-be | C-R2-02 |
| C-R3-MOB-TEXT | Replace customer-visible `ảnh chưa có` in FIG captions after PNG inject | ba-docs | print polish |
| C-R3-PROG | Matrix depth 285 ⬜ · full J-* mobile UAT | PM program | Phase 2 DONE |

---

## Residual

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| R-P2-MOB-FIG | 8 mobile PNG + FIG placeholders CH12 | P0 doc | qa-device |
| R-P2-MOB-AUTH | UAT NV 401 pilot + local | P0 blocker | dev-be |
| R-P2-MATRIX-DEPTH | 285 TC dialog/mutate ⬜ | P2 program | qa |
| R-P2-J-MOB | J-MOB-03/04/05 untested strict NV | P0 mobile | qa-device |
| R-P2-FIG-CAPTION | 8× `ảnh chưa có` in dashed FIG text | P2 polish | ba-docs (post-capture) |

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `node scripts/qa/_tmp-qc-hdsd-r3-scan.mjs` | **0** | FIG=8 mob · webFIG=0 · IMG=95 · PDF ✅ · banned phrase 0 |
| `pnpm run hdsd:build -- --html-only` | **0** | `images=110 imgTokens=95 ok=true` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-p2-gate-r3-20260730.md` | **0** | 8/8 (self after write) |
| Upstream `qa-hdsd-fig-verify-01` pack | **1** | 6/8 — doc-build slice; not elevated NO-GO |
| Upstream `qa-hdsd-matrix-promote-02` pack | **1** | 5/8 — matrix slice; audited independently |

---

## QC recommendation

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | HDSD P2 **web client doc slice** (HTML+PDF+95 IMG; CH01–CH11) |
| **NOT GO** | Full Phase 2 including mobile · client-final |
| **Closed vs R2 GWC** | C-R2-01/03/04 · FIG 51→8 mobile-only · phrase scrub |
| **Re-gate full GO** | After C-R2-02 PNG inject + mobile J-MOB PASS + optional caption polish |

**next_owner:** PM

---

## Handoff

**completion_report:** R3 re-gate audited closed conditions C-R2-01 (0 banned phrase MD/HTML), C-R2-03 (matrix +25 🟢 spot PASS), C-R2-04 (FIG=8 mobile-only, webFIG=0, IMG=95). Independent scan confirms CH01/03/05 inline figures, PDF 7.28 MB, build ok. **C-R2-02 OPEN** — 8 hrm-12 PNG missing; mobile UAT auth 401. **GO WITH CONDITIONS** for web deliverable; **NOT client-final**.

**next_dispatch_prompt:**

```
work_item_id: D-HDSD-MOB-UAT-AUTH-01
program: HDSD-P2-FULL-01
from_role: pm | to_role: dev-be
entry_criteria:
- QC-HDSD-P2-GATE-01-R3 GWC; C-R2-02 OPEN blocks client-final
- qa-hdsd-mob-ch12-01-r3: uat.nv0001@xe.vn / xevn-uat-2026 → 401 HRM-AUTH-401 on pilot :3001 and local :28001
exit_criteria:
- POST /api/hrm/auth/mobile/login uat.nv0001 → 201 HRM-AUTH-200 (pilot + local smoke)
- No seed (U65); document credential/scope fix in evidence
- ack_status READY_FOR_QA → qa-device QA-HDSD-MOB-CH12-01-R4 for 8 PNG capture
evidence_path: docs/qa/evidence/d-hdsd-mob-uat-auth-01-20260730.md
Parallel after auth: qa-device capture hrm-12-1..8.png → hdsd:build → QC-HDSD-P2-GATE-01-R4 target full GO
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-p2-gate-r3-20260730.md`

**ack_status:** PASS_TO_PM
