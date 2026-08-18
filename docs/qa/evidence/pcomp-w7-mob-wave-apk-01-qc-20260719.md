# QC Gate Decision — PCOMP-W7-MOB-WAVE-APK-01-QC (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-MOB-WAVE-APK-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **qa_wave** | `docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qa-20260719.md` (**PASS_TO_PM**) |
| **qa_search** | `docs/qa/evidence/pcomp-w7-mob-directory-search-01-qa-20260719.md` (**PASS_TO_PM**) |
| **dev_search** | `docs/qa/evidence/pcomp-w7-mob-directory-search-01-20260719.md` |
| **executed_at** | `2026-07-19` |
| **decision** | **GO WITH CONDITIONS** — SHA-split mobile wave; leave/profile/dir-list on WAVE SHA; search AC-DIR-01/R2 on fix SHA |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited consolidated WAVE device L2.5 plus the later directory-search residual close. **SHA split is material:** WAVE install `9C346CA3…5C79` closed leave-doc / leave-bal / profile / directory list+detail; search ACs **must not** be promoted from that SHA (Dev marked it prior FAIL; fix APK `D1E095F3…E201` closed AC-DIR-01 + R2).

**Verdict: GO WITH CONDITIONS** for scoped mobile WAVE slice on `uat.nv0001@xe.vn` @ nip.io (U65 zero-seed).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **no seed** in either QA pack.

---

## SHA reconciliation (authoritative)

| SHA-256 (prefix) | Bytes | Role | QC accepts |
|------------------|-------|------|------------|
| `9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79` | 66,182,369 | WAVE APK (qa-device + installed base.apk) | **leave-doc**, **leave-bal**, **profile**, **dir list / J-MOB-16/30 list→detail** |
| `D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201` | 71,591,235 | Directory search fix APK | **AC-DIR-01**, **R2**, **J-MOB-30 smoke** only |

**Adjudication:** WAVE matrix row claiming **AC-DIR-01 / R2 PASS on `9C346CA3…`** is **superseded / not promoted**. Authoritative search PASS = search QA on `D1E095F3…` (`qa-result.json`: chip 213→18; empty «Không tìm thấy nhân viên»; detail smoke).

Leave / profile / dir-list **not retested** on `D1E095F3…` (search QA `must_keep`) → residual condition **C-W7-MOB-SHA-CROSS** (P2).

---

## Product matrix audit

### 1) leave-doc — SHA `9C346CA3…`

| AC | QA | QC |
|----|-----|-----|
| **AC-LEAVE-DOC-01** sick block without attach | PASS | **PASS** — `leave-create-next` disabled; stayed Bước 2 |
| **AC-LEAVE-DOC-02** annual without attach | PASS | **PASS** — advanced past attach gate |
| **AC-LEAVE-DOC-03** detail Xem/tải | PASS | **PASS** — `leave-attachment-open` |

### 2) leave-bal — SHA `9C346CA3…`

| ID | QA | QC |
|----|-----|-----|
| **J-MOB-25** header 8/3 · 2026 | PASS | **PASS** |
| **J-MOB-28** chip «Còn lại: 8 / 12 ngày phép năm 2026» | PASS | **PASS** |
| **AC-LEAVE-BAL-01** chip ≠ «—» | PASS | **PASS** |
| **AC-LEAVE-BAL-02** approve→refresh drop | NOT_TESTED | **OPEN condition** (optional P2) |

### 3) profile — SHA `9C346CA3…`

| ID | QA | QC |
|----|-----|-----|
| **J-MOB-12** dynamic form + phone Lưu toast | PASS | **PASS** — «Đã cập nhật thông tin liên hệ.»; prior 403 self-patch CLOSED on device |

### 4) directory

| ID | SHA | QA claim | QC |
|----|-----|----------|-----|
| **J-MOB-16** list | `9C346CA3…` | PASS | **PASS** |
| **J-MOB-30** list→detail | `9C346CA3…` + smoke on `D1E095F3…` | PASS | **PASS** |
| **AC-DIR-02** detail | WAVE | PASS | **PASS** (with J-MOB-30) |
| **R1** 1-char | WAVE | PASS | **PASS** (list still populated) |
| **AC-DIR-01** search ≥2 | WAVE claimed PASS; search QA PASS on fix | **PASS only on `D1E095F3…`** |
| **R2** empty copy | WAVE claimed PASS; search QA PASS on fix | **PASS only on `D1E095F3…`** |

---

## L2.5 / journey scope (U19)

| Journey / AC | In-scope | Status | SHA |
|--------------|----------|--------|-----|
| AC-LEAVE-DOC-01..03 | Yes | **PASS** | `9C346CA3…` |
| J-MOB-25 / 28 + AC-LEAVE-BAL-01 | Yes | **PASS** | `9C346CA3…` |
| AC-LEAVE-BAL-02 | Optional | **NOT_TESTED** → condition | — |
| J-MOB-12 | Yes | **PASS** | `9C346CA3…` |
| J-MOB-16 / 30 list→detail | Yes | **PASS** | `9C346CA3…` (+ smoke `D1E095F3…`) |
| AC-DIR-01 / R2 | Yes | **PASS** | `D1E095F3…` only |

**NO-GO trigger not met:** in-scope L2.5 has device evidence; search residual closed on newer APK; SHA split documented as GWC (not silent GO).

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `pcomp-w7-mob-wave-apk-01-qa-20260719.md` | **1** | **1/8** | **PROCESS** — missing `command_table` regex; device matrices + SHA + screens present |
| `pcomp-w7-mob-directory-search-01-qa-20260719.md` | **1** | **1/8** | **PROCESS** — same; JSON + screenshots under `screenshots/pcomp-w7-mob-directory-search-01-qa-20260719/` |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qa-20260719.md
# FAIL 1/8 — command_table
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w7-mob-directory-search-01-qa-20260719.md
# FAIL 1/8 — command_table
```

**Rule applied:** Pack format gap ≠ product NO-GO when readable device L2.5 + SHA + U65 evidence exist (precedent JWT / residual-03 / soft-nav).

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC |
|--------|------|-----|
| Device leave-doc / bal / profile / dir-list on WAVE SHA | PRODUCT | **PASS** |
| AC-DIR-01 / R2 on WAVE SHA alone | PRODUCT | **NOT promoted** (prior FAIL class) |
| AC-DIR-01 / R2 on fix SHA | PRODUCT | **PASS** |
| Leave/profile not re-run on fix SHA | PRODUCT residual risk | **Condition OPEN** |
| AC-LEAVE-BAL-02 manager approve path | PRODUCT optional | **Condition OPEN** |
| Require-cycle toast overlay | PRODUCT P2 UX | **Condition OPEN** (non-blocking) |
| Seed / DB fake | PROCESS U65 | **PASS** — none |
| evidence-pack command_table 1/8 | PROCESS | **GWC format** — not product reopen |
| Phase1 / PROD | OUT OF SLICE | **NOT claimed** |

---

## Conditions (GWC)

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **C-W7-MOB-SHA-SPLIT** | P1 process | **OPEN (documented)** | pm / qa-device | Dual SHA SoT: promote matrices by SHA above; do not merge search PASS onto WAVE SHA |
| **C-W7-MOB-SHA-CROSS** | P2 | **OPEN** | qa-device (optional) | leave-doc / bal / profile not retested on `D1E095F3…` |
| **C-W7-MOB-BAL-02** | P2 | **OPEN** | qa-device (optional) | **AC-LEAVE-BAL-02** approve→refresh remaining drop |
| **C-W7-MOB-TOAST** | P2 | **OPEN** | dev-mobile | Require-cycle toast overlays FAB (`D-MOB-REQUIRE-CYCLE-TOAST` / `D-MOB-DIR-TOAST-01`) |
| **C-W7-MOB-PACK** | P3 process | **OPEN** | qa (optional polish) | Add command_table exit codes → 8/8 pack |
| **C-W7-MOB-NO-PHASE1** | Standing | **OPEN** | pm | **NOT** Phase1 DONE / PROD-READY from this gate |

---

## Forbidden claims (reaffirmed)

- Phase 1 DONE / PROD-READY / program exit from this mobile wave alone
- Promote **AC-DIR-01 / R2** using SHA `9C346CA3…`
- Claim single-APK full-suite PASS without SHA table
- Seed / API fake / inbox seed for balance approve path
- Close **AC-LEAVE-BAL-02** without device manager-approve evidence

---

## completion_report

```yaml
completion_report: |
  PCOMP-W7-MOB-WAVE-APK-01-QC → GO WITH CONDITIONS (PASS_TO_PM).
  SHA split reconciled:
    - 9C346CA3…5C79: AC-LEAVE-DOC-01..03, J-MOB-25/28, AC-LEAVE-BAL-01, J-MOB-12, J-MOB-16/30 list→detail PASS
    - D1E095F3…E201: AC-DIR-01 + R2 + J-MOB-30 smoke PASS (WAVE search rows NOT promoted)
  Conditions OPEN: SHA-CROSS (leave/profile not on fix APK), AC-LEAVE-BAL-02 optional,
    require-cycle toast P2, pack command_table 1/8 PROCESS, NOT Phase1/PROD.
  U65 zero-seed observed. No seed. No Phase1/PROD claim.
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qc-20260719.md
next_dispatch_prompt: |
  work_item_id: PCOMP-W7-MOB-WAVE-APK-01
  Operate as pm.
  INTAKE: qc GO WITH CONDITIONS — docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qc-20260719.md
  Promote matrix/journey by SHA:
    leave-doc/bal/profile/dir-list → 9C346CA3…5C79
    AC-DIR-01/R2 → D1E095F3…E201
  Do NOT claim Phase1/PROD. Do NOT re-dispatch leave/profile unless regression.
  Optional later: qa-device AC-LEAVE-BAL-02; optional cross-SHA smoke on D1E095F3…;
  optional qa polish command_table 8/8.
  Next: update PROGRAM_JOURNEY_MAP / UF mobile rows + continue PCOMP backlog (zero residual P0).
```

---

## ack_status

**PASS_TO_PM**
