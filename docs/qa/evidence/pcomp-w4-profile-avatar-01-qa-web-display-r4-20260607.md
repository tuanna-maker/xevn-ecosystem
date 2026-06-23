# PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R4 — J-AVT-01 display retest (nip.io)

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R4`  
**Date:** 2026-06-07  
**Owner:** QA  
**Environment:** Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026`  
**ack_status:** `PASS_TO_PM`  
**Journey:** J-AVT-01 (web — visible `<img src="/api/hrm/files/holding/*">` on list row TCN-0954 + profile, not Radix initials)

**Upstream:** DevOps `PCOMP-W4-DO-AVT-WEB-03` READY_FOR_QA — `docs/qa/evidence/pcomp-w4-do-avt-web-03-20260607.md`  
**Closes:** `D-W4-AVT-DISPLAY-01` — **CLOSED**

---

## L0 — Stack health (pilot)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot
```

| Check | Result |
|-------|--------|
| Script exit | **0** |
| Health checks | **8/8 PASS** |
| `test:pilot:flows` | **13/13 PASS** |

---

## L1 — Source / deploy parity

| Probe | Result |
|-------|--------|
| `GET /hr/src/pages/Employees.tsx` (nip.io Vite) | **HTTP 200** |
| `selectedSlug` occurrences | **8** |
| `companyFilter` in Vite body | **absent** |
| R3 regression `ReferenceError: companyFilter is not defined` | **not reproduced** |

**Employee:** `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de` — Đặng Xuân Hà / **TCN-0954**  
**Avatar file:** `/api/hrm/files/holding/employee-avatar-1780830092205-qa-javt01.png`

---

## L2.5 — J-AVT-01 DISPLAY (browser — mandatory)

**Account:** `ceo@xe.vn` (session active on Command Center)

### Employees list (CC embed) — **PASS**

| Path | `#root` mount | TCN-0954 row | Holding `<img>` on TCN-0954 | Radix initials |
|------|---------------|--------------|----------------------------|----------------|
| `/command-center/hrm/employees?companyId=main` (iframe) | **4** children | **yes** | **yes** — `/api/hrm/files/holding/employee-avatar-1780830092205-qa-javt01.png` **28×28** visible | **0** fallbacks |

**iframe src:** `https://14-225-217-232.nip.io/hr/employees?portal=1&tenantId=xevn&companyId=main`  
**List UI:** "Quản lý nhân viên" — Danh sách nhân viên trong công ty - 100  
**Console:** no `companyFilter is not defined` on list route (CDP iframe eval after 8–10s settle)

### Profile deep link (CC embed) — **PASS**

| Path | `#root` mount | TCN-0954 | Holding `<img>` | Radix initials |
|------|---------------|----------|-----------------|----------------|
| `/command-center/hrm/employees/ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main` (iframe) | **4** children | **yes** | **yes** — same holding path **90×90** visible | **0** fallbacks |

**iframe src:** `https://14-225-217-232.nip.io/hr/employees/ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?portal=1&tenantId=xevn&companyId=main`

**Screenshots (local temp):**

- Profile avatar gradient + TCN-0954 badge — `page-2026-06-07T14-18-56-293Z.png`
- List route re-verify — CDP post-10s settle (rootKids=4, tcn holding img 28px)

---

## Exit criteria matrix

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `pnpm run qc:fe-be-health:pilot` exit 0 | **PASS** |
| 2 | `ceo@xe.vn` @ nip.io list + profile routes | **PASS** |
| 3 | HRM iframe mounts; holding `<img>` on TCN-0954 list + profile (not Radix initials) | **PASS** |
| 4 | Evidence file | **PASS** (this file) |
| 5 | Closes `D-W4-AVT-DISPLAY-01` | **CLOSED** |

---

## Defect status

| ID | Severity | Prior (R3) | After R4 |
|----|----------|------------|----------|
| `D-W4-AVT-DISPLAY-01` | P0 | OPEN — list blocked | **CLOSED** |
| `D-W4-AVT-EMPLOYEES-CRASH-01` | P0 | OPEN — `companyFilter` crash | **CLOSED** (DevOps + QA confirm) |
| `D-W4-AVT-HRM-BLANK-01` | P1 | OPEN — list `#root` empty | **CLOSED** |

---

## Handoff packet

**completion_report:** R4 retest after DevOps `PCOMP-W4-DO-AVT-WEB-03` deploy. L0 `qc:fe-be-health:pilot` exit **0** (8/8 + 13/13) on nip.io. Vite `Employees.tsx` has `selectedSlug`, **no** `companyFilter`. CC embed employees **list** and **profile** both mount iframe `#root` **4** children. J-AVT-01: TCN-0954 row shows visible holding `<img>` **28×28** on list and **90×90** on profile; **0** Radix avatar fallbacks on those surfaces. **D-W4-AVT-DISPLAY-01 CLOSED.**

**next_owner:** `pm`

**next_dispatch_prompt:** INTAKE QA R4 PASS — `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R4` closes `D-W4-AVT-DISPLAY-01` on nip.io J-AVT-01 (list TCN-0954 + profile holding img). Evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md`. If W4 avatar slice is release-impacting, dispatch `qc` for L3 re-gate on J-AVT-01; else promote journey map row J-AVT-01 web to PASS and continue W4 mobile residual per backlog.

**evidence_path:** `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md`

**ack_status:** `PASS_TO_PM`
