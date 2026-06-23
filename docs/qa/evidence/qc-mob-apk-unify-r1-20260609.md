# MOB-APK-UNIFY-R1-QC — Unified qa-device APK gate @ nip.io emulator

| Field | Value |
|-------|-------|
| work_item_id: | `MOB-APK-UNIFY-R1-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — canonical unified APK **promotable**; **D-W8-ESS-PROMISE-01 CLOSED**; **R-DIR-DETAIL-01 reaffirmed** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| ack_status: | **PASS_TO_PM** |

---

## Scope (bounded — MOB-APK-UNIFY-R1 unified artifact)

| In scope | Out of scope |
|----------|--------------|
| Single canonical `hrm-mobile-qa-device.apk` containing **both** R-DIR-DETAIL-01 + D-W8-ESS-PROMISE-01 fix sets | Phase 1 DONE / `verify:product:completion` program exit |
| SHA-256 `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` | PROD cutover / store release |
| **D-W8-ESS-PROMISE-01** — no promise snackbar on Home; J-MOB-23/24 manager approve | J-MOB-28/29 create submit (not re-run this wave — inherited prior QC) |
| **R-DIR-DETAIL-01** / J-MOB-30 ext row→detail→back on unified APK | Web portal J-HRM-* browser |
| Personas `uat.nv0001@xe.vn` + `uat.nv0002@xe.vn` @ nip.io emulator-5554 | Physical device matrix beyond emulator |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev-mobile unify | [`mob-apk-unify-r1-20260609.md`](mob-apk-unify-r1-20260609.md) | READY_FOR_QA — vitest **245/245**; bundle markers both fix sets |
| QA-device | [`mob-apk-unify-r1-device-20260609.md`](mob-apk-unify-r1-device-20260609.md) | **PASS_TO_PM** — dual-persona L2.5 @ nip.io |
| Machine JSON | [`mob-apk-unify-r1-device-probe.json`](mob-apk-unify-r1-device-probe.json) | `pass: true`; all journey booleans true |
| UI dumps | [`mob-apk-unify-r1-screens/`](mob-apk-unify-r1-screens/) (13 XML) | QC spot-audit |
| Prior R-DIR QC | [`qc-r-dir-detail-01-20260609.md`](qc-r-dir-detail-01-20260609.md) | GO scoped same SHA — **reaffirmed** on unified retest |
| Prior ESS R4 QC | [`qc-pcomp-w8-mob-residual-r4-01-20260609.md`](qc-pcomp-w8-mob-residual-r4-01-20260609.md) | J-MOB-23..29 CLOSED — **D-W8-ESS-PROMISE-01 was CARRY** |

**APK lineage:** `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` · **68,849,340 B** · SHA-256 `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED`

**Problem closed:** Divergent APK SHAs (`8063446E…` R-DIR vs `4A942BF2…` ESS promise R2) — **one canonical artifact** now device-verified for both fix sets.

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-apk-unify-r1-device-20260609.md
# exit 0 — 8/8 checks (2026-06-09 QC re-audit)
```

**QC adjudication:** **PASS** — upstream QA pack verifier green. Material pack: machine JSON all booleans true, 13 UIAutomator XML dumps, APK SHA verify, `## Residual` section, valid handoff block — **auditable**.

**Process carry (reduced):** **C-W8QC-PACK-02** — optional normalize mobile device packs for future waves; not blocking this gate.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + unified APK SHA `8063446E…` | ENV / L2.5 | **PASS** |
| nip.io pilot `https://14-225-217-232.nip.io` | ENV | **PASS** |
| `adb install -r` exit 0 | ENV / L2.5 | **PASS** |
| Persona nv0001 `company_uuid=6efaa5d6-…` ≠ `main` | ENV / scope | **PASS** |
| **D-W8-ESS-PROMISE-01** — no `promise rejection` text on Home + scroll XMLs | PRODUCT / UX | **PASS** — spot audit 6 home/scroll XMLs |
| **J-MOB-23** — **Phê duyệt** screen + inline **Duyệt đơn** | PRODUCT / L2.5 | **PASS** — `unify-nv0001-approvals.xml` |
| **J-MOB-24** — approve tap → detail without promise snackbar | PRODUCT / L2.5 | **PASS** — `unify-nv0001-after-approve.xml`; attendance-update pending |
| **R-DIR-DETAIL-01** — list→**Thông tin nhân viên**→back search/chips | PRODUCT / L2.5 | **PASS** — `unify-nv0002-list/detail/back.xml` |
| Logcat fatal `vn.xevn.hrm.mobile` | PRODUCT / stability | **PASS** — both personas |
| `leave_count=0` — UndoSnackbar leave path not exercised | PRODUCT / seed | **GWC** — **GWC-UNIFY-LEAVE-UNDO-01** P2 |
| J-MOB-28/29 create submit not re-run on unified APK | Process | **REAFFIRMED** — prior R4 QC CLOSED; optional spot on next wave |

**Product NO-GO avoided:** L2.5 cross-nav verified on unified APK with machine JSON + UIAutomator XML corroboration for both fix sets.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — MOB-APK-UNIFY-R1 wave

| Journey | Requirement | QA | XML / evidence | QC verdict |
|---------|-------------|-----|----------------|------------|
| **D-W8-ESS-PROMISE-01** | No red promise snackbar on Home after login | PASS | `unify-nv0001-home.xml`, scroll-0..3 | **PASS — CLOSED** |
| **J-MOB-23** | Manager approvals inline UI | PASS | `unify-nv0001-approvals.xml` | **PASS — reaffirmed** |
| **J-MOB-24** | Approve tap flow (attendance pending) | PASS | `unify-nv0001-after-approve.xml` | **PASS — reaffirmed** (leave undo GWC) |
| **R-DIR-DETAIL-01** / **J-MOB-30 ext** | Đội nhóm row→detail→back | PASS | `unify-nv0002-list/detail/back.xml` | **PASS — reaffirmed** |

### Inherited (not re-run — prior QC CLOSED)

| Journey | Prior QC | QC ruling |
|---------|----------|-----------|
| **J-MOB-25..29** leave UX | [`qc-pcomp-w8-mob-residual-r4-01-20260609.md`](qc-pcomp-w8-mob-residual-r4-01-20260609.md) | **REAFFIRMED** — not regressed by unify build |
| **J-MOB-30** list slice | [`qc-mob-w7-5-directory-final-20260609.md`](qc-mob-w7-5-directory-final-20260609.md) | **REAFFIRMED** |

---

## Defect / condition adjudication

| ID | Severity | Class | Prior state | QC ruling |
|----|----------|-------|-------------|-----------|
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | **OPEN** (carried from R-DIR QC, portal QC, R4 QC) | **CLOSED** — Home + manager approve paths device-verified on unified APK |
| **R-DIR-DETAIL-01** | P2 | PRODUCT/nav | **CLOSED** (prior QC) | **REAFFIRMED CLOSED** — same SHA retest PASS |
| **GWC-UNIFY-LEAVE-UNDO-01** | P2 | PRODUCT/seed | NEW | **OPEN GWC** — J-MOB-24 leave-type UndoSnackbar not exercised (`leave_count=0`) |
| **C-W8-DEVICE-01** | Process | Device | CARRY | **CARRY** — emulator-only matrix |
| **C-W8QC-PACK-02** | Process | Format | CARRY | **CARRY** — pack format normalization |

No P0/P1 blockers for unified APK promotion.

---

## Journey map sync (recommended PM action)

Update `PROGRAM_JOURNEY_MAP.md`:

- **J-MOB-11..15** — remove **D-W8-ESS-PROMISE-01** GWC tag (lifted this gate)
- **J-MOB-19..22** — remove promise condition (lifted)
- **J-MOB-23..29** — cite this QC + prior R4 QC; note **GWC-UNIFY-LEAVE-UNDO-01** on J-MOB-24 leave undo only
- **J-MOB-30** — add unified APK cite [`qc-mob-apk-unify-r1-20260609.md`](qc-mob-apk-unify-r1-20260609.md)

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | Canonical unified APK SHA `8063446E…` **promotable** @ nip.io emulator |
| **CLOSED** | **D-W8-ESS-PROMISE-01** (Home + manager approve on unified APK) |
| **REAFFIRMED** | **R-DIR-DETAIL-01** · **J-MOB-23/24** · **J-MOB-30 ext** |
| **GWC** | **GWC-UNIFY-LEAVE-UNDO-01** — leave UndoSnackbar path (optional devops reseed) |
| **CARRY** | **C-W8-DEVICE-01** · **C-W8QC-PACK-02** |
| | **NOT Phase 1 DONE** / **NOT PROD** |

---

## Residual (program — outside unify slice)

| ID | Owner | Trigger |
|----|-------|---------|
| **GWC-UNIFY-LEAVE-UNDO-01** | qa-device | devops reseed `leave_count>=1` on nip.io; retest J-MOB-24 UndoSnackbar |
| **C-W8-DEVICE-01** | qa-device | Physical device matrix expansion |
| **C-W8QC-PACK-02** | qa-device | Pack format normalization (`work_item_id:` colon, pnpm command table) |

---

## Handoff

**completion_report:** MOB-APK-UNIFY-R1-QC **GO WITH CONDITIONS (reduced)**. Audited dev-mobile → qa-device chain on unified APK SHA `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED`. Pack verify upstream **8/8 PASS**. Spot XML: no promise rejection on Home; **Phê duyệt** + **Duyệt đơn** approve path; **Thông tin nhân viên** detail + back preserves search/chips. Machine JSON `pass: true`. **D-W8-ESS-PROMISE-01 CLOSED**. **R-DIR-DETAIL-01 reaffirmed CLOSED**. Carry **GWC-UNIFY-LEAVE-UNDO-01** (leave undo path P2).

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake MOB-APK-UNIFY-R1-QC PASS_TO_PM (GO WITH CONDITIONS reduced).

Closed: D-W8-ESS-PROMISE-01 on unified APK @ nip.io emulator — evidence docs/qa/evidence/qc-mob-apk-unify-r1-20260609.md. Canonical SHA 8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED promotable for all downstream mobile QA.

Sync PROGRAM_JOURNEY_MAP.md — lift D-W8-ESS-PROMISE-01 GWC from J-MOB-11..15 and J-MOB-19..22 rows; cite unify QC on J-MOB-30.

Mark MOB-APK-UNIFY-R1 [x] in PHASE1_PRODUCT_COMPLETION_TODO if listed.

Next dispatch (priority):
1) PM_OPEN_BACKLOG top execution item (MOB-UX-10a / J-MOB-32 QC pending or program gate).
2) Optional P2: qa-device GWC-UNIFY-LEAVE-UNDO-01 after devops nip.io leave seed.
3) Carry: C-W8QC-PACK-02, C-W8-DEVICE-01. NOT Phase 1 DONE / NOT PROD.
```

**evidence_path:** `docs/qa/evidence/qc-mob-apk-unify-r1-20260609.md`

**ack_status:** `PASS_TO_PM`
