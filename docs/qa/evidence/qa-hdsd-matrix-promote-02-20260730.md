# HDSD Matrix Verdict Promotion — W0–W4 Wave 02

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-MATRIX-PROMOTE-02 |
| **program** | P-HDSD-QA-SRS-01 |
| **QC condition** | C-R2-03 (`QC-HDSD-P2-GATE-01-R2` GWC) |
| **from_role** | pm |
| **to_role** | qa → pm |
| **date** | 2026-07-30 |
| **policy** | U65 zero-seed · browser evidence only · no fake mutate |
| **prior wave** | QA-HDSD-MATRIX-PROMOTE-01 — 26 rows |
| **ack_status** | PASS_TO_PM |

## Entry criteria met

| Gate | Status |
|------|--------|
| QC-HDSD-P2-GATE-01-R2 GWC C-R2-03 | ✅ matrix body promote |
| Prior PROMOTE-01 (26 rows) | ✅ baseline preserved |
| W0–W4 UAT evidence `hdsd-uat-*.md` | ✅ polled |
| Mutate P0 `TC-HDSD-08-02-01` + `06-03-01` | ✅ from `qa-hdsd-mutate-ret-01-20260730.md` |

## Matrix diff summary

| Metric | Before PROMOTE-02 | After PROMOTE-02 | Delta |
|--------|-------------------|------------------|-------|
| 🟢 | 46 | **71** | **+25** |
| 🟡 | 7 | **6** | −1 (TC-HRM-HDSD-001 ⬆️) |
| ⬜ | 309 | **285** | −24 |
| **Promoted this wave** | — | **25 unique rows** | — |
| **Regression 🟢→⬜/🟡** | — | **0** | — |

*Total body TC rows: 362 · Cumulative promoted (🟢+🟡): 77*

## Source evidence files

| Wave | Evidence | Role |
|------|----------|------|
| W0 | `hdsd-uat-eco-20260730.md` | ECO + HRM Ch.0 smoke |
| W1 | `hdsd-uat-xbos-20260730.md` · `hdsd-uat-ch02-04-20260730.md` | XBOS CC/org/WF |
| W2 | `hdsd-uat-ch05-09-20260730.md` · `hdsd-uat-hrm-embed-20260730.md` | HRM embed L2.5 |
| W2 menus | `hdsd-uat-ch10-11-20260730.md` | Ch10–11 load |
| W4 | `hdsd-uat-w4-20260730.md` · `hdsd-uat-integration-20260730.md` | INT-01/02 already 🟢 in PROMOTE-01 |
| Mutate P0 | `qa-hdsd-mutate-ret-01-20260730.md` | leave POST 201 · insurance 3×200 |

## Legacy → matrix v2.0 promotions (this wave)

| Legacy UAT TC | Matrix v2.0 ID | Verdict | Wave | Evidence |
|---------------|----------------|---------|------|----------|
| TC-HRM-HDSD-001 | TC-HRM-HDSD-001 | 🟢 | W0 | eco — embed+standalone load |
| TC-HDSD-02-01-01 | TC-XBOS-HDSD-028 | 🟢 | W1 | ch02-04 login cách vào |
| TC-HDSD-02-01-01 | TC-XBOS-HDSD-029 | 🟢 | W1 | ch02-04 login buttons |
| TC-HDSD-02-01-02 | TC-XBOS-HDSD-033 | 🟢 | W1 | ch02-04 wrong password 401 |
| TC-HDSD-02-03-01 | TC-XBOS-HDSD-050 | 🟢 | W1 | ch02-04 HRM embed dash |
| TC-HDSD-04-02-01 | TC-XBOS-HDSD-117 | 🟢 | W1 | WF designer deep link |
| TC-HDSD-05-02-01 | TC-HRM-HDSD-027 | 🟢 | W2 | J-HRM profile navigation |
| TC-HDSD-05-03-01 | TC-HRM-HDSD-016 | 🟢 | W2 | mutate POST employees 201 |
| TC-HDSD-06-03-01 | TC-HRM-HDSD-044 | 🟢 | W2 | BHXH tab load |
| **TC-HDSD-06-03-01** | **TC-HRM-HDSD-048** | **🟢** | **W2** | **P0 insurance 3×200 L1** |
| TC-HDSD-06-04-01 | TC-HRM-HDSD-046 | 🟢 | W2 | BHXH sắp hết hạn |
| TC-HDSD-07-03-01 | TC-HRM-HDSD-059 | 🟢 | W2 | Pipeline ứng viên |
| TC-HDSD-08-01-01 | TC-HRM-HDSD-075 | 🟢 | W2 | Attendance overview |
| **TC-HDSD-08-02-01** | **TC-HRM-HDSD-083** | **🟢** | **W2** | **P0 leave POST 201 LVT_01** |
| TC-HDSD-08-03-01 | TC-HRM-HDSD-079 | 🟢 | W2 | Ca làm việc tab |
| TC-HDSD-09-02-01 | TC-HRM-HDSD-097 | 🟢 | W2 | Phiếu lương drill |
| TC-HDSD-10-02-01 | TC-HRM-HDSD-114 | 🟢 | W2 | Quyết định NS |
| TC-HDSD-10-03-01 | TC-HRM-HDSD-122 | 🟢 | W2 | Công việc |
| TC-HDSD-10-04-01 | TC-HRM-HDSD-129 | 🟢 | W2 | DVC nội bộ route |
| TC-HDSD-10-04-01 | TC-HRM-HDSD-130 | 🟢 | W2 | DVC tab |
| TC-HDSD-10-05-01 | TC-HRM-HDSD-136 | 🟢 | W2 | Quy trình read-only |
| TC-HDSD-10-06-01 | TC-HRM-HDSD-142 | 🟢 | W2 | Fleet load |
| TC-HDSD-10-06-01 | TC-HRM-HDSD-145 | 🟢 | W2 | Fleet empty OK |
| TC-HDSD-11-01-01 | TC-HRM-HDSD-147 | 🟢 | W2 | Settings catalog |
| TC-HDSD-11-02-01 | TC-HRM-HDSD-170 | 🟢 | W2 | Reports tab |

### Skipped (already promoted)

| Matrix ID | Reason |
|-----------|--------|
| TC-ECO-006 | Already 🟢 from PROMOTE-01 / W0 re-run |

## P0 mutate promotions (explicit)

### TC-HDSD-08-02-01 → TC-HRM-HDSD-083

- **UF:** UF-HRM-09 · **Evidence:** `qa-hdsd-mutate-ret-01-20260730.md` §2
- **Network:** POST `/api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` · LVT_01 lazy catalog
- **Verdict:** 🟢 — U65 FE mutate chain (not seed)

### TC-HDSD-06-03-01 → TC-HRM-HDSD-048 (+ TC-HRM-HDSD-044 load)

- **UF:** UF-HRM-06 · **Evidence:** `qa-hdsd-mutate-ret-01-20260730.md` §2 + `hdsd-uat-ch05-09-20260730.md`
- **Network:** GET insurance `company_id=main` **3×200** · no `chk_contract_date_range` 500
- **Verdict:** 🟢 — L1 probe authoritative over harness 🟡

## Intentionally not promoted (honest U65)

| Legacy TC | Verdict in UAT | Matrix stays |
|-----------|----------------|--------------|
| TC-HDSD-03-02-01 shareholder | 🔴 / 🟡 | ⬜ |
| TC-HDSD-06-02-01 contract create | 🟡 no POST | ⬜ |
| TC-HDSD-07-02-01 YCTD | 🟡 JD empty U65 | ⬜ |
| TC-ECO-INT-03 WF inbox card | 🟡 GWC | 🟡 |
| Dialog/field-level depth (334−77 rows) | n/a | ⬜ |

## Regression check

- **0** existing 🟢 rows downgraded
- PROMOTE-01 rows (26) unchanged except additive neighbors on same chapter
- Machine result: `docs/qa/evidence/_tmp-hdsd-matrix-promote-02-result.json`

## Handoff

**completion_report:** Mapped W0–W4 🟢 UAT evidence delta to `HDSD_SRS_TESTCASE_MATRIX.md` Verdict column. **+25 rows** promoted this wave (46→71 🟢). Included P0 mutate **TC-HDSD-08-02-01** → `TC-HRM-HDSD-083` and **TC-HDSD-06-03-01** → `TC-HRM-HDSD-048`. **0 regressions.** C-R2-03 body promote closed for W0–W4 spot scope; 285 dialog/mutate-depth rows remain ⬜.

**next_owner:** pm

**next_dispatch_prompt:**
```
work_item_id: QC-HDSD-P2-GATE-01-R3-PREP
program: P-HDSD-QA-SRS-01
from_role: qa | to_role: qc
entry_criteria: docs/qa/evidence/qa-hdsd-matrix-promote-02-20260730.md PASS_TO_PM — C-R2-03 closed (71🟢 6🟡); matrix diff 0 regression
exit_criteria: QC spot-audit 10-row sample (083 leave mutate + 048 insurance + W1 login + W2 J-HRM-027); re-gate C-R2-01 phrase scrub + C-R2-02 mobile FIG still open; ack GO WITH CONDITIONS or GO for matrix slice
read_first: docs/qa/evidence/hdsd-p2-qc-gate-r2-20260730.md · docs/qa/HDSD_SRS_TESTCASE_MATRIX.md
evidence_path: docs/qa/evidence/qc-hdsd-matrix-promote-02-audit-20260730.md
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-matrix-promote-02-20260730.md`

**ack_status:** PASS_TO_PM
