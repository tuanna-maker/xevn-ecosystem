# CD-FB-09-SOFT-NAV — QA retest soft-nav iframe Tuyển dụng

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-09-SOFT-NAV` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **date** | `2026-07-19` |
| **ack_status** | **PASS_TO_PM** |
| **closes** | QC residual **C-CD-FB-09-01** (soft-nav stall) |
| **parent** | `docs/qa/evidence/cd-fb-09-recruit-qc-20260719.md` (GWC; this wave = residual only) |
| **FE evidence** | `docs/qa/evidence/cd-fb-09-soft-nav-20260719.md` |
| **spec_ref** | C-CD-FB-09-01 · P-CC-06 hard path must_keep · F6 AC-CD-F6-01..04 **not reopened** |
| **U65** | browser-only · **zero-seed** |
| **NOT claimed** | Phase 1 DONE · PROD-READY · F-DELIVERY · J-REC-WF · XBOS WF |

---

## Verdict

**PASS_TO_PM** — Soft click Attendance → Tuyển dụng shows `/hr/recruitment` content **without** hard browser reload; Att ↔ Rec soft-nav repeats OK; hard-nav **P-CC-06** 6-stage funnel still visible. Original stall (portal URL recruitment + iframe stuck on Attendance) **not reproduced**.

Recommend **QC** close condition **C-CD-FB-09-01**.

---

## L0 — Dev stack

| Check | Result |
|-------|--------|
| hrm-api `:28001` | HTTP **200** |
| xbos-api `:28002` | HTTP **200** (after build; briefly EADDRINUSE then healthy) |
| web-portal `:5173` | HTTP **200** |

---

## Session

| Item | Value |
|------|--------|
| URL base | `http://localhost:5173` |
| Persona | Group CEO `ceo@xe.vn` / `Xevn@2026` |
| JWT | `tenantId=xevn` · `companyId=main` · `roleCode=group_ceo` · BOD |
| Method | Browser click path + same-origin CDP iframe `contentDocument.location.pathname` |
| Seed | **none** |

---

## Exit criteria matrix

| # | Criteria | Evidence | Verdict |
|---|----------|----------|---------|
| 1 | Soft Att → Tuyển dụng → `/hr/recruitment` without hard reload | Round 1: portal `/command-center/hrm/recruitment`; iframe spaPath `/hr/recruitment`; UI Dashboard / Thư viện JD / Yêu cầu; `performance` nav entries still only attendance hard-load (`navCount=1`); `_v=1784452921294` stable | **PASS** |
| 2 | Soft Att ↔ Rec repeat | Round 1 Att→Rec; Rec→Att (`spaPath=/hr/attendance`); Round 2 Att→Rec; Round 3 after hard-nav Rec→Att→Rec — all remount recruitment, **not** stuck Attendance | **PASS** |
| 3 | Hard-nav P-CC-06 funnel must_keep | Hard navigate `/command-center/hrm/recruitment` → iframe src `/hr/recruitment?...`; text **Pipeline ứng viên (6 giai đoạn)** + Chờ CV/Mới · Sàng lọc · Phỏng vấn · Đề nghị · Đã tuyển · Từ chối; no `1OFFICE` | **PASS** |
| 4 | Do not reopen F6 AC mutate | Smoke only: Thư viện JD / Yêu cầu / Dashboard / funnel visible — **no** JD CRUD / requisition mutate this wave | **PASS** (N/A mutate) |
| 5 | No seed / no J-REC-WF | None used | **PASS** |

---

## UF — Soft-nav Attendance → Tuyển dụng

### Click path

1. Login `ceo@xe.vn` → Command Center
2. Hard open `/command-center/hrm/attendance` → iframe `#root` Attendance Overview (`Ca làm việc` / `Quản lý đơn`)
3. Soft click sidebar **Tuyển dụng** (no F5 / no address-bar reload)
4. Soft click **Chấm công** → soft **Tuyển dụng** again
5. Hard navigate dedicated recruitment URL (P-CC-06)
6. Soft Rec → Att → Rec once more

### Round observations (CDP iframe)

| Round | Portal URL | iframe spaPath | UI | Hard reload? | `_v` |
|-------|------------|----------------|----|--------------|------|
| Pre | `/…/attendance` | `/hr/attendance` | Tổng quan Chấm công · Ca làm việc | Hard load | `1784452921294` |
| 1 Att→Rec | `/…/recruitment` | `/hr/recruitment` | Dashboard · Yêu cầu · Thư viện JD · Ứng viên | **No** (`navCount=1`) | same |
| Rec→Att | `/…/attendance` | `/hr/attendance` | Attendance scope chrome | No | same |
| 2 Att→Rec | `/…/recruitment` | `/hr/recruitment` | Recruitment tabs remount | No | same |
| Hard P-CC-06 | `/…/recruitment` | `/hr/recruitment` | **Pipeline 6 giai đoạn** visible | Hard nav (must_keep) | new `_v=1784452991963` |
| 3 Att→Rec | `/…/recruitment` | `/hr/recruitment` | Dashboard / Thư viện | No | — |

**FE sau soft-nav:** iframe document path = `/hr/recruitment`; recruitment tabs visible; **not** Attendance Overview. Portal URL and iframe SPA path aligned.

**Network:** Soft-nav does not require parent document reload; prior defect class was SPA path stall — path probe is authoritative. No seed. F5 optional — not required (hard-nav already covered must_keep).

### Screenshots

- `docs/qa/evidence/cd-fb-09-soft-nav-qa-att-rec-20260719.png` — soft-nav recruitment UI
- `docs/qa/evidence/cd-fb-09-soft-nav-qa-hard-pcc06-20260719.png` — hard-nav P-CC-06 / funnel shell

---

## Regression guard (must_keep)

| Guard | Result |
|-------|--------|
| F6 product ACs AC-CD-F6-01..04 | **Not reopened** — no mutate; visual smoke OK |
| P-CC-06 hard-nav funnel | **PASS** — 6 stages labeled on Dashboard |
| XBOS WF / J-REC-WF | **Out of scope** — not required |
| Seed | **None** |

---

## Residuals

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| C-CD-FB-09-01 | — | **qc** | Soft-nav AC closed — recommend gate close |
| C-CD-FB-09-02 | deferred | pm | Interview deep-link — out of this residual |
| C-CD-FB-09-03 | deferred | pm | XBOS WF — cấm require |

---

## Handoff packet

- `work_item_id`: `CD-FB-09-SOFT-NAV`
- `from_role`: `qa`
- `to_role`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/cd-fb-09-soft-nav-qa-20260719.md`
- `completion_report`: Browser U65 retest on `:5173` after FE soft-nav UPGRADE **PASS**. Soft Att→Tuyển dụng remounts `/hr/recruitment` without hard reload; Att↔Rec ×3 OK; hard-nav P-CC-06 6-stage funnel visible; F6 mutate ACs not reopened; zero-seed. Recommend QC close **C-CD-FB-09-01**. No Phase1/PROD claim.
- `next_owner`: `qc`
- `next_dispatch_prompt`: (below)
- `pm_dispatch_hint`: `CD-FB-09-SOFT-NAV-QC` — close C-CD-FB-09-01 on GWC residual

### next_dispatch_prompt

```text
work_item_id: CD-FB-09-SOFT-NAV-QC
from_role: pm
to_role: qc
subagent_type: qc
lane: governance
residual_auto_fix: true

Close QC condition C-CD-FB-09-01 after QA soft-nav PASS.
entry_criteria: QA evidence docs/qa/evidence/cd-fb-09-soft-nav-qa-20260719.md PASS_TO_PM; parent GWC docs/qa/evidence/cd-fb-09-recruit-qc-20260719.md
read_first:
  - docs/qa/evidence/cd-fb-09-soft-nav-qa-20260719.md
  - docs/qa/evidence/cd-fb-09-soft-nav-20260719.md
  - docs/qa/evidence/cd-fb-09-recruit-qc-20260719.md
exit_criteria:
  1) Adjudicate soft-nav residual C-CD-FB-09-01 CLOSED or keep OPEN with reason
  2) Do NOT reopen F6 AC-CD-F6-01..04 without regression proof
  3) Do NOT require J-REC-WF / XBOS WF / seed
  4) Evidence: docs/qa/evidence/cd-fb-09-soft-nav-qc-20260719.md
ack_status: PASS_TO_PM (GO / GWC update)
```
