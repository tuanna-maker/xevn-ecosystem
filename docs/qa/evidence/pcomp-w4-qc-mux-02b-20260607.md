# PCOMP-W4-QC-MUX-02b — MOB-UX-02b Home hub slice gate (Personio §3.2)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QC-MUX-02b` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **decision** | **GO** — **MOB-UX-02b** Home hub Personio widgets promotable on nip.io emulator (strict adb, no CDP) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — W4 MUX Wave Home hub)

| In scope | Out of scope |
|----------|--------------|
| **PCOMP-W4-MOB-UX-02b** Personio Home hub per `MOBILE_HRM_BENCHMARK_TOP_APPS.md` §3.2 | Web portal embed / J-HRM-* browser |
| Greeting + action cards + Hôm nay + Sắp tới widgets | Leave balance widget (Phase 2) |
| **J-MOB-01** login regression + Home L2.5 cross-nav taps | J-MOB-05 manager approve device (`pending=0` pilot) |
| Check-in CTA → CheckIn · leave CTA → create wizard · upcoming row → detail | MOB-UX-03b unified manager inbox |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io | Phase 1 DONE / `verify:product:completion` program claim |
| Emulator `emulator-5554` · x86_64 APK UX-02b rebuild | arm64 physical device build |

**Upstream QA:** `docs/qa/evidence/pcomp-w4-qa-mux-02b-20260607.md` + `pcomp-w4-qa-mux-02b-20260607.json` + screens `pcomp-w4-qa-mux-02b-screens/` (15 artifacts)

**Prior gates:** `pcomp-w4-qc-mux-03-20260607.md` (DS GO) · `pcomp-w4-qc-mux-02-20260607.md` (UX-02 leave GWC)

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w4-qa-mux-02b-20260607.md
# exit 1 — 2/8 checks (2026-06-07 QC audit)
# FAIL: command_table, portal_url
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile-slice pattern as MUX-02 / MUX-03 QC gates:

| Failed check | QC ruling |
|--------------|-----------|
| `command_table` | **Format gap** — preconditions use `\| Step \| Command \| Exit \|`; verifier expects colon-style `Command:` block — QA normalize next mobile wave |
| `portal_url` | **N/A** — mobile device pack; `api_base` `https://14-225-217-232.nip.io` documented |

Material pack: automation **9/9 PASS**, JSON `checks[]` all `pass: true`, Vitest **83/83**, screen/XML dir auditable — **sufficient for QC audit**.

**Spot-check (QC, no CDP):** Opened `mux02b-home.xml` — confirms §3.2 widget tree (greeting, both action cards, Hôm nay card, Sắp tới section + 2 rows, 4-tab bar).

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator + APK install (UX-02b rebuild 65,445,120 B) | ENV | **PASS** |
| Pilot probe `leave=2 pending=0` | ENV/DATA | **PASS** — Home employee pending from own APIs; manager probe not MUX-02b scope |
| **MUX02B-GREETING** Xin chào + name + company | PRODUCT / UX | **PASS** |
| **MUX02B-CHECKIN-CTA** + **MUX02B-LEAVE-CTA** action cards | PRODUCT / UX | **PASS** — Personio primary cards with subtitles |
| **MUX02B-TODAY** check-in + Có mặt badge + pending line | PRODUCT / UX | **PASS** |
| **MUX02B-UPCOMING-SEC** Vi labels (no `LVT_*`) | PRODUCT / UX | **PASS** |
| **MUX02B-CHECKIN-NAV** / **MUX02B-LEAVE-NAV** / **MUX02B-UPCOMING-TAP** | PRODUCT / L2.5 | **PASS** — cross-nav beyond tab load |
| Logcat `hasMain: false`, UUID scoped, no 409 | PRODUCT / scope | **PASS** |
| Vitest regression **83/83** | PRODUCT / regression | **PASS** |
| Leave balance on Home | PRODUCT / P2 defer | **NOT in slice** — Phase 2 per dev + QA residual |
| Manager pending on Home | PRODUCT / P2 defer | **NOT in slice** — MOB-UX-03b |
| arm64 multi-ABI cmake path-length | ENV / build | **INFO** — x86_64 emulator sufficient |

**No P0/P1 product defect** on audited MUX-02b Home journeys.

---

## L2.5 — J-MOB + §3.2 benchmark audit

| ID | Requirement | QA (2026-06-07) | QC verdict | Notes |
|----|-------------|-----------------|------------|-------|
| **J-MOB-01** | Login `uat.nv0001` | PASS | **PASS** | Session + Home load |
| **MUX02B-GREETING** | §3.2 greeting block | PASS | **PASS** | XML: Xin chào, Nguyễn Văn An · holding |
| **MUX02B-CHECKIN-CTA** | Chấm công hôm nay card | PASS | **PASS** | Subtitle Check-in 16:10 |
| **MUX02B-LEAVE-CTA** | Tạo đơn nghỉ phép card | PASS | **PASS** | Subtitle Gửi yêu cầu nghỉ phép mới |
| **MUX02B-TODAY** | Hôm nay summary card | PASS | **PASS** | Check-in + Có mặt + 5 đơn chờ duyệt |
| **MUX02B-UPCOMING-SEC** | Sắp tới (nghỉ phép) | PASS | **PASS** | 2 rows, Vi date + type labels |
| **MUX02B-CHECKIN-NAV** | CTA → CheckIn screen | PASS | **PASS** | L2.5 cross-nav |
| **MUX02B-LEAVE-NAV** | CTA → 4-step create | PASS | **PASS** | L2.5 cross-nav |
| **MUX02B-UPCOMING-TAP** | Row → Chi tiết nghỉ | PASS | **PASS** | Manual retest XML; hero + metric grid |

**MUX-02b device summary:** automation **9/9 PASS**; §3.2 Personio Home widget set **complete** on device.

**Journey map sync (PM):** Extend J-MOB-01 row with MUX-02b Home hub citation (`pcomp-w4-qa-mux-02b-20260607.md` + this QC file).

---

## Residual (non-blocking for GO)

| Item | Severity | QC note |
|------|----------|---------|
| Leave balance widget on Home | P2 | Phase 2 — explicitly out of MOB-UX-02b scope |
| Manager pending on Home | P2 | MOB-UX-03b — employee home shows own pending only |
| Pilot manager probe `pending=0` | P2 | Unchanged from prior MUX gates |
| Automation upcoming tap first pass | Info | QA manual retest confirmed detail — **promotable** |
| Evidence pack format (command_table / portal_url) | Process | **C-W4QC-MUX-PACK-01** carry — QA normalize next mobile wave |
| arm64 release APK | Info | x86_64 emulator sufficient for W4 MUX gates |

---

## Promotable slice (honest)

| Item | Status |
|------|--------|
| **MOB-UX-02b Home hub** (greeting, CTAs, Hôm nay, Sắp tới + nav taps) | **Promotable** @ nip.io emulator |
| **J-MOB-01** Home tab after login | **Promoted** (MUX-02b device evidence) |
| Home → CheckIn / create leave / upcoming detail | **Promoted** |
| Leave balance widget | **NOT promoted** — Phase 2 |
| J-MOB-05 manager approve | **NOT re-tested** — prior baseline |
| Phase 1 DONE / PROD | **NOT claimed** |

---

## pm_dispatch_hint

- Mark **PCOMP-W4-QC-MUX-02b** `[x]` in `PHASE1_PRODUCT_COMPLETION_TODO.md`; **PCOMP-W4-QA-MUX-02b** already `[x]`.
- Sync `PROGRAM_JOURNEY_MAP.md` J-MOB-01 → cite MUX-02b Home hub evidence.
- W4 MUX wave **complete** (MUX-01..03 + 02b QC gates closed); program kế: W6 sponsor UAT or optional **MOB-UX-03b** manager inbox per design direction §8.

---

## completion_report

- Audited QA MUX-02b evidence + JSON (**9/9** checks PASS) + 15 screen/XML artifacts; no CDP per dispatch scope.
- Confirmed **§3.2 Personio Home** widget set on device (greeting, action cards, Hôm nay, Sắp tới) with L2.5 cross-nav (CheckIn, create, detail).
- Scope clean (`hasMain: false`); Vitest **83/83**; P2 residuals (leave balance, manager inbox) documented and **non-blocking**.
- Issued **GO** for bounded MOB-UX-02b Home hub slice; **NOT** Phase 1 DONE / PROD.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: PCOMP-W6-PM-01 (sync) or PCOMP-W4-MOB-UX-03b (if PM opens manager inbox wave)
from_role: pm
to_role: pm / dev-mobile
entry_criteria: PCOMP-W4-QC-MUX-02b GO — MOB-UX-02b Home hub promoted; W4 MUX QC gates closed; evidence docs/qa/evidence/pcomp-w4-qc-mux-02b-20260607.md PASS_TO_PM
exit_criteria: Update PHASE1_PRODUCT_COMPLETION_TODO PCOMP-W4-QC-MUX-02b [x]; sync PROGRAM_JOURNEY_MAP J-MOB-01 Home citation; advance W6 sponsor UAT (PCOMP-W6-SP-01) or dispatch MOB-UX-03b per MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §8
evidence_path: docs/qa/evidence/pcomp-w4-qc-mux-02b-20260607.md
ack_status: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/pcomp-w4-qc-mux-02b-20260607.md`

## ack_status

**PASS_TO_PM**
