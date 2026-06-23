# Mobile W7 — Gap closure orchestration (PM auto-dispatch)

**Program:** `P1-MOBILE-W7` · **Trigger:** U51 — không hỏi sponsor; SRS+TechSpec bắt buộc trước code nghiệp vụ mới  
**Gap source:** `MOBILE_WEB_PROFILE_AVATAR_GAP_AUDIT.md` · `MOBILE_HOME_HUB_AC_DELTA.md` · U48/U49/U50

---

## Nguyên tắc gate

| Bước | Owner | Artifact | Dev được chạy khi |
|------|-------|----------|-------------------|
| 1 | BA-Process + BA-Data | `docs/hrm/MOBILE_W7_SRS_DELTA.md` + `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` | — |
| 2 | SA | ADR ngắn nếu scope/API mới | BA draft xong |
| 3 | Dev-BE / FE / Mobile | Implementation | SRS § + TechSpec § cited trong bus |
| 4 | QA-Device | J-* evidence | READY_FOR_QA |

**Ngoại lệ (hotfix đã code, cần formalize):** PROFILE-AVATAR-01, MOB-LEAVE-META-01 — BA bổ sung SRS § trong cùng pack W7.

---

## Wave W7 (thứ tự PM — không hỏi user)

| Wave | ID | Nội dung | SRS UC | Dev lane | QA |
|------|-----|----------|--------|----------|-----|
| **W7-0** | Closure | Avatar BE/FE/MOB + leave meta + Smart Hub 04a + header 03b | BA formalize | — | QA batch |
| **W7-1** | MOB-UX-04b | Sinh nhật + Ai nghỉ hôm nay + home/summary wire | UC-HRM-MOB-03 ext, J-MOB-08/09 | BE+Mobile | J-MOB-08/09 |
| **W7-2** | PROFILE-AVATAR | Promote avatar end-to-end | UC-HRM-MOB-12 ext | QA only | J-AVT-01..03 |
| **W7-3** | LEAVE-DOC | Upload giấy nghỉ (medical) mobile+web | **UC-HRM-MOB-06b** mới | BE→FE→Mobile | J-MOB-11 |
| **W7-4** | LEAVE-BAL | Số dư phép trên wizard + Home | **UC-HRM-MOB-06c** | BE→Mobile | J-MOB-04 ext |
| **W7-5** | DIRECTORY | Danh bạ / org lite (Personio People) | **UC-HRM-MOB-16** | BE→Mobile | J-MOB-16 |
| **W7-6** | PROFILE-FULL | MOB-12 metadata động, SĐT, ESS web | UC-HRM-MOB-12 full | BE→FE→Mobile | J-MOB-12 |
| **W7-7** | NOTIFY-PUSH | FCM + deep link | UC-HRM-MOB-13 ext | BE→Mobile→DevOps | J-MOB-13 |
| **W7-8** | SEARCH-HUB | Workday-lite search tab | UC-HRM-MOB-17 | Mobile | Phase 2 QC |

---

## Dispatch active (2026-06-07)

| work_item_id | Role | Status |
|--------------|------|--------|
| PCOMP-W7-BA-SRS-01 | ba-process + ba-data | **DISPATCHED** — SRS+TechSpec pack |
| PCOMP-W7-QA-CLOSE-01 | qa-device | **DISPATCHED** — avatar + meta + 04a + persona R2 |
| PCOMP-W7-MOB-HOME-WIRE | dev-mobile | **QUEUED** after 04a QA — wire `GET /home/summary` |
| PCOMP-W7-* execution | dev-* | **BLOCKED** on BA pack except W7-0 QA |

---

## RACI

| Role | W7 accountability |
|------|-------------------|
| PM | Orchestration, bus, không hỏi sponsor scope |
| BA-Process | SRS delta đủ UC if/else + AC |
| BA-Data | Field matrix, API payload |
| SA | Scope parity, ADR |
| Dev-BE Lead | API + policy + seed |
| Dev-FE | Web ESS + upload parity |
| Dev-Mobile Lead | Mobile UX U49 |
| QA-Device | L2.5 all J-* |
| QC | W7 gate sau QA batch |
