# PCOMP-W8-MOB-ESS-LEAVE-01-R3-QC — MOB-UX-07 leave device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-ESS-LEAVE-01-R3-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-07** leave UX slice **promotable** nip.io emulator; **J-MOB-23..29 device CLOSED** with balance-display GWC |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W8 MOB-UX-07 @ nip.io emulator)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-23..29** device L2.5 @ `https://14-225-217-232.nip.io` | Phase 1 DONE / `verify:product:completion` program exit |
| Hub regression **J-MOB-06..09** on unified qa-device APK | PROD cutover / store release |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` (employee + seeded manager) | Web portal embed J-HRM-* browser |
| APK `hrm-mobile-qa-device.apk` SHA-256 `C2F76C2C…BD56FBA` | J-AVT-02 upload/display E2E (separate **C-W4QC-AVT-MOB-01**) |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev MOB-UX-07 | `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-20260608.md` | READY_FOR_QA — SET B/C/D deliverables |
| QA R1 | `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-qa-20260608.md` | FAIL_TO_PM — 502 pilot + no MOB-UX-07 APK |
| QA-device R3 | `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-r3-20260609.md` | PASS_TO_PM — blockers closed |
| Machine JSON | `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-r3-20260609.json` | `pass: true`, journeys 23..29 PASS |
| UI dumps | `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-r3-screens/` (29 XML) | QC spot-audit |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w8-mob-ess-leave-01-r3-20260609.md
# exit 1 — 2/8 checks (2026-06-09 QC audit)
# FAIL: command_table (pnpm exit-code table), portal_url
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Failures are **format / slice-appropriate** for mobile device pack (same class as `pcomp-w8-mob-ess-dash-qc-01` 3/8):

| Failed check | QC ruling |
|--------------|-----------|
| `command_table` | **Format** — adb/node scripts documented; missing normalized `pnpm run` + exit-code table |
| `portal_url` | **N/A W8 mobile** — `api_base` nip.io documented; no web portal probe in device slice |

Material pack present: journey matrix J-MOB-23..29, hub regression, API probe table, JSON booleans, 29 XML dumps, residual section, valid handoff — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Prior FAIL: nip.io **502** + missing APK | ENV | **CLOSED** — R3 cold boot + install PASS |
| Emulator `emulator-5554` + deep-link login `home_reached: true` | ENV / L2.5 | **PASS** |
| `GET /attendance/leave-balance` **200** `available=8` `used=3` | API / PRODUCT | **PASS** — nip.io probe confirmed |
| **J-MOB-23** inline Duyệt/Từ chối + manager inbox | PRODUCT / L2.5 | **PASS** — `r3-mgr-approvals.xml`, `r3-supp-mgr.xml` |
| **J-MOB-24** confirm modal Duyệt đơn? + Huỷ/Duyệt | PRODUCT / L2.5 | **PASS** — `r3-supp-mgr-modal.xml` |
| **J-MOB-25** Kỳ nghỉ header + Còn lại/Đã dùng cards | PRODUCT / L2.5 | **GWC** — structure PASS; numeric values **—** + `Resource not found` in `r3-leaves-list.xml` despite API 200 |
| **J-MOB-26** tabs Đang xét \| Đã duyệt \| Từ chối | PRODUCT / L2.5 | **PASS** — `r3-leaves-list.xml` |
| **J-MOB-27** empty illustration + Đăng ký nghỉ CTA | PRODUCT / L2.5 | **PASS** — `r3-leaves-list.xml`, `r3-tab-rejected.xml` |
| **J-MOB-28** create step 2 balance chip | PRODUCT / L2.5 | **GWC** — `Còn lại` chip present; shows **Liên hệ HR để tra cứu số dư** not `8 ngày` in `r3-supp-create2.xml` |
| **J-MOB-29** wizard step 1 date + Tiếp tục | PRODUCT / L2.5 | **PASS** — `r3-supp-create.xml`, `r3-supp-create2.xml` |
| **J-MOB-06..09** hub regression | PRODUCT / L2.5 | **PASS** — JSON + scroll XML (`r3-supp-home-scroll2.xml` J-MOB-08) |
| **J-AVT-02** native picker opens | Separate track | **PASS** best-effort — not MOB-UX-07 blocker |
| Undo snackbar 5s post-approve | PRODUCT / BR | **ACCEPTED** — BR-ESS-UNDO-01 alert-only; confirm modal PASS |
| Supplement JSON `J-MOB-23: false` | Automation | **INFO** — main walk + `r3-mgr-approvals.xml` supersedes; not product FAIL |

**Product NO-GO avoided:** Core leave UX navigation (manager approve, tabs, empty CTA, create wizard) functionally verified on device; balance **numeric bind** is bounded GWC, not slice blocker for structure promotion.

---

## L2.5 — J-MOB audit (device @ nip.io emulator)

### J-MOB-23..29 (primary — MOB-UX-07)

| Journey | Requirement | QA R3 | XML / JSON | QC verdict |
|---------|-------------|-------|------------|------------|
| **J-MOB-23** | Manager inbox + inline Duyệt/Từ chối | PASS | `r3-mgr-approvals.xml` | **PASS** |
| **J-MOB-24** | Confirm modal on approve | PASS | `r3-supp-mgr-modal.xml` «Duyệt đơn?» | **PASS** |
| **J-MOB-25** | Kỳ nghỉ + Còn lại/Đã dùng from API | PASS | `r3-leaves-list.xml` — labels OK, values **—** | **GWC** — **D-W8-MOB-BAL-UI-01** |
| **J-MOB-26** | Segmented tabs Review/Approved/Rejected | PASS | `r3-leaves-list.xml` Đang xét/Đã duyệt/Từ chối | **PASS** |
| **J-MOB-27** | Empty state + Đăng ký nghỉ CTA | PASS | `r3-leaves-list.xml` illustration + CTA | **PASS** |
| **J-MOB-28** | Create step 2 «Còn lại: X ngày» | PASS | `r3-supp-create2.xml` — HR fallback text | **GWC** — **D-W8-MOB-BAL-UI-01** |
| **J-MOB-29** | Date range wizard step 1 + Tiếp tục | PASS | `r3-supp-create.xml` Chọn ngày | **PASS** |

**MOB-UX-07 summary:** **7/7 journeys device-verified** — **5 PASS**, **2 GWC** (shared balance UI bind). Slice **promotable** with condition.

### Hub regression — J-MOB-06..09

| Journey | QA R3 | QC verdict | Evidence |
|---------|-------|------------|----------|
| **J-MOB-06** | PASS | **PASS** | `r3-home.xml` |
| **J-MOB-07** | PASS | **PASS** | `r3-home.xml` Đơn chờ duyệt |
| **J-MOB-08** | PASS | **PASS** | `r3-supp-home-scroll2.xml` after scroll |
| **J-MOB-09** | PASS | **PASS** | Prior QC CLOSED chain — reaffirmed regression |

---

## Defect / condition adjudication

| ID | Severity | Class | Owner | Expiry | QC ruling |
|----|----------|-------|-------|--------|-----------|
| **D-W8-MOB-BAL-UI-01** | P1 UX | PRODUCT | dev-mobile | **2026-06-16** | **GWC OPEN** — leave-balance API 200 on nip.io but list header + create chip show **—** / HR fallback; fix client bind or error handling |
| **BR-ESS-UNDO-01** | P2 design | PRODUCT | — | accepted | **CLOSED** — Undo alert-only; confirm modal sufficient for wave |
| **C-W4QC-AVT-MOB-02** | P2 | Separate | dev-mobile | program | **CARRY** — picker PASS; upload/display E2E not in MOB-UX-07 slice |
| **C-W8QC-PACK-02** | Process | Format | qa-device | next mobile wave | Add `pnpm run` exit-code table to device packs |
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | dev-mobile | 2026-06-14 | **CARRY** from ESS dash QC — unrelated to leave slice |

---

## Journey map sync (executed)

`PROGRAM_JOURNEY_MAP.md` row **J-MOB-23..29** updated:
- ✅ **device PASS** QC GWC reduced — cite this file
- Condition **D-W8-MOB-BAL-UI-01** on J-MOB-25/28 numeric display

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **MOB-UX-07** leave UX **device promotable** nip.io emulator |
| | **J-MOB-23,24,26,27,29** **CLOSED** device L2.5 |
| | **J-MOB-25,28** **CLOSED** structure; **GWC** numeric balance bind (**D-W8-MOB-BAL-UI-01**) |
| | Hub **J-MOB-06..09** regression **reaffirmed PASS** |
| | **NOT Phase 1 DONE** / **NOT PROD** / **NOT** W8 program full exit |

---

## Handoff

**completion_report:** PCOMP-W8-MOB-ESS-LEAVE-01-R3-QC **GO WITH CONDITIONS (reduced)**. Audited MOB-UX-07 evidence chain Dev→QA FAIL→R3 PASS. Pack verify **2/8** process-only. XML spot-audit confirms manager modal, tabs, empty CTA, create wizard. **D-W8-MOB-BAL-UI-01** opened: API 200 but UI shows dashes/HR fallback on J-MOB-25/28. **J-MOB-23..29 promoted** in journey map with GWC note.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake QC PASS → (1) dispatch `dev-mobile` `D-W8-MOB-BAL-UI-01` — fix `LeaveBalanceHeader` + `CreateLeaveRequestScreen` balance chip to render `available_days`/`used_days` when nip.io `GET /attendance/leave-balance` returns 200; eliminate `Resource not found` leak on list; evidence vitest + qa-device retest J-MOB-25/28 XML shows `8`/`3`; owner dev-mobile, expiry 2026-06-16; (2) dispatch `dev-mobile` or `qa-device` per backlog `PCOMP-W8-MOB-ZENHR-FAB-01` MOB-UX-10b when balance GWC in flight or after fix; (3) carry **D-W8-ESS-PROMISE-01** + **C-W4QC-AVT-MOB-01** on separate tracks; (4) **NOT** Phase 1 DONE claim.

**evidence_path:** `docs/qa/evidence/qc-pcomp-w8-mob-ess-leave-01-r3-20260609.md`

**ack_status:** `PASS_TO_PM`
