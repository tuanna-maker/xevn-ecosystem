# Evidence — PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-17 seat #19) |
| **uc_ids** | `UC-BP-CORE-02b` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` · peer `CORE09DQC1-MSLDR8I3` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED HOLD** |
| **change_mode** | DOC-DELTA HOLD/RETAIN · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| CONFIRM HOLD — no ADD `profile_groups_json` / Nest `emp_custom_field` / mega-EAV / Nest `/core` table / wipe Settings extension SoT; RETAIN LIVE extension-items + merge_tokens + custom_fields + four catalogs | **PASS** — DATA §1 HOLD · §4 RETAIN |
| Cite physical columns already LIVE for defs (`catalog_key`·`code`·`label`·`status` + unit/tenant/company) + token `origin=extension_field` + `custom_fields` values | **PASS** — §3 Nest cite · §4.1–§4.4 · note: physical `sort_order` col **ABSENT** (AS-IS `ORDER BY code`) |
| Conditional UNLOCK ONLY if BA O5 gap proven — BA-01 = gap NOT proven → NOT unlock `profile_groups_json` | **PASS** — §4.5 HOLD · NOT unlock |
| RETAIN CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest `/core` DENY · EMPCF/EXT seals | **PASS** — §1/§8 |
| DENY invent Nest `emp_custom_field` · claim EMPCF = CORE-02b / personnel UAT · claim CORE-09d printable / closed-8 DONE · honesty flip · reopen J-HRM-CORE-09D/09C/09B/09A/08/02/01 · seed · apps/** | **PASS** — §8 DENY |
| Unlock next: sa API-01 HOLD/RETAIN cite F-EMP-CF-* / CNS / TOK — not Dev invent · FE P2 HOLD only | **PASS** — §10 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | HOLD default · O1 path · O2 groups=catalogs · O3 extension-items · O4 TOK · O5 JSON OUT · O6 CNS · O7 soft-retire · O8 C&B/public · O9 FE P2 HOLD · O10 honesty · O11 display-ready · O12 J-* |
| SA-01 | Option A LOCKED · LIVE F-EMP-CF-* / TOK / CNS · `profile_groups_json` HOLD invent · REJECT Nest field-def / mega-EAV / Nest `/core` |
| AS-IS Nest (read-only) | `settings-catalogs.service.ts` `ensureExtensionSchema` · `merge-tokens.service.ts` · `emp-merge-token-register.ts` allow-list · `emp-custom-field-consumer-assert.ts` · `employees.service.ts` `custom_fields` · no Nest `/core` EMP-CF SoT · no `profile_groups_json` on employees ensureSchema |
| EMPCF / EXT | `EMPCFQA-MSK14LUH` · `EMPTOKEXTQA-MSJ57PE1` RETAIN |
| CORE-09d..01 DATA | must_keep · ≠ printable · Nest `/core` DENY |

---

## 3. Physical decisions (summary)

1. **HOLD / RETAIN:** LIVE EMP-CF spine — extension-items + merge_tokens + custom_fields + four catalogs — **no ADD** `profile_groups_json` / Nest field-def / mega-EAV / Nest `/core` / wipe.
2. **LIVE cols cited:** defs `catalog_key`·`code`·`label`·`unit`·`status`·tenant/company; TOK `origin=extension_field` · `custom.emp.*`; values `employees.custom_fields`.
3. **sort_order:** physical col **ABSENT** on extension-items — display = catalog_key + `ORDER BY code` · **HOLD ADD** · **≠** unlock JSON.
4. **Unlock:** O5 gap **NOT proven** → **NOT unlock** `profile_groups_json`.
5. **Path:** physical `/settings-catalogs*` + `/employees*` · `/core` alias only.
6. **must_keep:** CORE-09d..01 · EMPCF/EXT · Nest `/core` DENY · honesty false · C-SLICE · FE CTA P2 HOLD.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** · **DENY** flip |
| `hrm_personnel_uat_ready` | **false** · **DENY** flip |
| CORE / personnel / CTR UAT | **false** |
| Claim EMPCF = CORE-02b / personnel DONE | **DENIED** |
| Claim CORE-09d printable / closed-8 DONE | **DENIED** |
| C-SLICE | GWC later ≠ module UAT ≠ personnel ready |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED RETAIN · then FE **P2 HOLD** residual only |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02b
depends_on: DATA-01 CONFIRMED HOLD · docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · peer CORE09DQC1-MSLDR8I3 must_keep
spec_ref: F-EMP-CF-01..03 · F-EMP-TOK-03 · F-EMP-CF-CNS-01/02 RETAIN cite · physical /settings-catalogs* + /employees* · paper /core alias only · profile_groups_json HOLD invent/OUT · Nest emp_custom_field DENY · Nest /core DENY · four catalogs = groups · DTO↔DB from DATA-01

MISSION — API F.1 lock (docs-only · HOLD/RETAIN):
1) RETAIN cite LIVE GET/POST …/settings-catalogs* (+ :catalogKey/extension-items) + soft-retire + POST/PUT/PATCH /employees* custom_fields — F.1 mỗi fn: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS (FR-02b Diễn biến #) · DTO↔DB cols from DATA-01 · lỗi HRM-EMP-CUSTOM-FIELD-KEY · admin format/UQ · HRM-SCOPE-409 · ESS 403
2) LOCK: groups=four catalogs · field-def=extension-items · TOK origin=extension_field same-TX · CNS invent when EFF>0 · U19 scope_parity Settings↔employees · soft-retire status=draft
3) DENY Nest /core dual EMP-CF SoT · DENY invent Nest emp_custom_field endpoints/schema · DENY invent profile_groups_json primary · DENY claim EMPCF = CORE-02b / personnel UAT · DENY claim CORE-09d printable / closed-8 DONE
4) RETAIN must_keep CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · EMPCF/EXT seals
5) Honesty: hrm_personnel_uat_ready=false · contracts_printable_ready=false · C-SLICE · no apps/** · no seed
6) Unlock next: FE P2 HOLD (R-PLT-EMP-CF-FE-01) only if residual — Dev-BE HOLD unless residual wire gap proven — not Dev invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02B-CLUSTER-API-01.md · PASS_TO_PM
```

---

*End evidence · Wave-17 CORE-02b DATA · ba-data HOLD · 2026-08-09*
