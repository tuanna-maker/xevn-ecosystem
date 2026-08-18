# BM-QA-J-REC-WF-06-REJECT-01 — Inbox Từ chối → HRM rejected

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-J-REC-WF-06-REJECT-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~10:48–10:55 ICT |
| **URL** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / Group CEO |
| **U65** | zero-seed · browser FE only · **cấm** seed inbox · no Phase1/PROD |
| **J-*** | **J-REC-WF-06** only (narrow) |
| **spec_ref** | `PROGRAM_JOURNEY_MAP.md` J-REC-WF-06 · reject + lý do → `rejected`; không downgrade `hired` |

---

## Executive summary

**PASS** — FE **Gửi duyệt QT** on existing draft YCTD (no seed) → Inbox deep-link → **Từ chối nhiệm vụ** (+ confirm) → `POST …/reject` **201** `XBOS-WF-205` with reason → HRM requisition **`status=rejected`** · FE list **Từ chối** after F5. Prior open R2 stays **`open` / Đang tuyển**; funnel **Đã tuyển 1** unchanged (no hired downgrade).

---

## Verdict matrix

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| **1 Spawn** | YCTD → Gửi duyệt QT (FE) | **PASS** | `201` `HRM-REC-WF-200` · `spawnMissing:false` · wi set |
| **2 Reject** | Inbox Từ chối + lý do | **PASS** | Confirm dialog; reason `rejected_from_portal` |
| **3 HRM** | status `rejected` | **PASS** | GET `200` `HRM-REC-200` |
| **4 hired** | must NOT downgrade hired / open peers | **PASS** | R2 still `open`; funnel Đã tuyển **1** |
| **5 F5** | Persist | **PASS** | FE row **Từ chối** after reload |
| **U65** | No seed | **PASS** | FE submit + inbox only |

---

## Click path

```
/hr/recruitment → Yêu cầu tuyển dụng
→ row BM-QA-REC YCTD từ JD 1784649801 (Chờ duyệt QT, wi=null)
→ Gửi duyệt QT
→ /command-center?wfInstanceId=5a3346d0-…&wfTaskId=97884fbc-…
→ Từ chối nhiệm vụ → confirm Từ chối
→ /hr/recruitment F5 → list Từ chối
```

---

## Network / IDs

| Step | Result |
|------|--------|
| Submit | `POST …/requisitions/4757395f-…/submit-workflow?company_id=holding` → **201** `HRM-REC-WF-200` · `workflow_instance_id=5a3346d0-f92f-4bbc-b605-4f8e4c723e30` · `spawnMissing:false` |
| CEO task | `97884fbc-358e-4955-9a68-366a54b4959a` · assignee `ceo@xe.vn` · parallel `any` (sibling `admin@xe.vn`) |
| Reject | `POST …/tasks/97884fbc-…/reject` → **201** `XBOS-WF-205` · body `{ outcome:rejected, reason:rejected_from_portal, userId:ceo@xe.vn }` · task `status=rejected` |
| HRM GET | `…/requisitions/4757395f-…?company_id=main` → **200** · `status=rejected` · wi retained |
| Peer R2 | `d4f3edb1-…` still `status=open` (Đang tuyển) |
| Funnel | Dashboard chips: **Đã tuyển1** (unchanged) · candidate Từ chối0 (pipeline, N/A to YCTD reject) |

---

## Residual

| Item | Sev | Owner |
|------|-----|-------|
| Confirm dialog uses default reason `rejected_from_portal` (no free-text field in a11y) — reason still present on reject payload | P3 | defer / BA if SRS requires typed lý do |
| Promote `PROGRAM_JOURNEY_MAP.md` J-REC-WF-06 ⬜→✅ | P3 | pm |
| No Phase1 / PROD claim | — | — |

---

## Handoff

```
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/bm-qa-j-rec-wf-06-reject-01-20260722.md
next_owner: pm
```
