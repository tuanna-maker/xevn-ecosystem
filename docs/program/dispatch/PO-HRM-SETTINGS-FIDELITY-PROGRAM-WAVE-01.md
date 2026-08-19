# Dispatch — Program fidelity Cài đặt + UC mở · SRS/TechSpec/API/UI_SCREEN

| Meta | Value |
|------|--------|
| **Parent** | `PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01` · `PHASE1_UC_SRS_TECHSPEC_MATRIX` |
| **Sponsor** | 2026-08-10 — toàn UC chưa DONE · chức năng đã làm phải **chạy đúng** SRS · JD list · catalog consumer · QA thật |
| **U65** | Browser mutate + F5 · cấm seed pass QA |

---

## MUST_KEEP (density W1.5 — cấm đè)

SoT: `PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01.md` § MUST_KEEP.

---

## Wave 0 — QA W3 (unblock sponsor)

| ID | Role | Entry | Exit |
|----|------|-------|------|
| `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST` | qa | `pnpm run qc:dev-stack` + `qc:fe-be-health` **exit 0**; portal **đang chạy** `:5173` | Evidence đầy đủ tab; không RUNNER ERR_CONNECTION_REFUSED |

**Ghi chú:** Lần chạy trước (`SETW3QA-MSMXZ8Q9`) **đã kết thúc** FAIL vì stack down — **không** treo subagent.

Evidence prior: `docs/qa/evidence/po-hrm-settings-w3-browser-01.md`

---

## Wave 1 — P0 functional gaps (screenshot + sponsor voice)

| work_item_id | Role | Scope | Exit |
|--------------|------|-------|------|
| `PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01` | dev-fe | `ContractLegalPrintSettingsPanel` templates: composer **inside** Dialog; AC PAT-CTR-TEMPLATE-COMPOSER-01 | Build + test ctr-tpl-* · evidence |
| `PO-HRM-JD-IA-LIST-DETAIL-FE-01` | dev-fe + ba | Tab JD: **list JD master** (vị trí) + detail cfg; tách hoặc bổ sung nav; UI spec `UI-SETTINGS-JD-MASTER-LIST.md` | SRS UC-BP-REC-00 list AC |
| `PO-HRM-SETTINGS-CATALOG-CONSUMER-AUDIT-FE-01` | dev-fe | Rà Contracts/Employee/REC bind `settings-catalogs`; fix empty select nếu có API data | Ma trận consumer + 3 smoke paths |

---

## Wave 2 — SRS fidelity audit (toàn Cài đặt + UC liên quan)

| work_item_id | Role | Scope | Exit |
|--------------|------|-------|------|
| `BA-PO-HRM-SETTINGS-SRS-FIDELITY-01` | ba-process | Mỗi tab Settings: spec says / code does / gap class C-SPEC-SHALLOW \| C-ORPHAN-SCREEN | Delta + UI_SCREEN_SPEC backlog |
| `BA-PO-HRM-FE-UI-SCREEN-SPEC-PACK-01` | ba-process | 15 tab P0 Settings + JD + CTR composer — file `docs/hrm/ui-screens/*` | PM dispatch Dev theo pack |
| `QC-PO-HRM-SETTINGS-FIDELITY-GATE-01` | qc | Sau QA retest + P0 fix: GWC · honesty flags giữ | PASS_TO_PM |

---

## Wave 3 — Cuốn chiếu UC program (ngoài Settings shell)

- Lấy hàng **planned / partial** từ `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` + sponsor slice ATT/REC/CTR.
- Mỗi UC: bắt buộc UI_SCREEN_SPEC trước Dev nếu có màn mới hoặc IA đổi.
- Không claim tab «xong UI» khi AC SRS mutate/F5 FAIL.

---

## Handoff QA (Settings fidelity)

```text
URL: http://localhost:5173/command-center/hrm/settings?tab=<id>
Account: ceo@xe.vn / Xevn@2026
Per tab: SRS AC block · Network 2xx · FE sau Lưu · F5
contract-templates: palette+canvas IN dialog · DnD 1 clause
jd-dynamic / jd-master: list vị trí → detail (khi FE-01 xong)
catalogs: sync FE path; consumer Contracts form có option sau pull
```

Evidence index: `docs/qa/evidence/po-hrm-settings-fidelity-*.md`
