# Mô hình vận hành team — Execution vs Governance (U16)

**Lệnh user (authoritative, 2026-05-24):**

> Chỉ **đội Dev + đội Test (QA)** làm xong delivery.  
> **PM, SA, BA, TA** giám sát chất lượng, đánh giá, thảo luận, rồi **tự cập nhật** prompt / tri thức / rule / hook và mọi thứ trong Cursor cho nhau.

**Rule:** `.cursor/rules/team-execution-vs-governance.mdc`  
**Vòng cải tiến:** `GOVERNANCE_IMPROVEMENT_LOOP.md` · **Registry:** `.cursor/team/GOVERNANCE_ARTIFACT_REGISTRY.md`

---

## Hai lane

| Lane | Roles | Nhiệm vụ |
|------|-------|----------|
| **Execution** | Dev-BE, Dev-FE, Dev-Mobile, **QA** (+ DevOps theo dispatch) | Implement, test, evidence, handoff |
| **Governance** | **PM**, **SA**, **BA**, **TA** (TM + QC) | Giám sát, đánh giá, retro/thảo luận, cập nhật Cursor artifacts |

**TA** = Technical Auditor: TM (review kỹ thuật, SOLID, security) + QC (Go/No-Go).

**U18:** Nếu nghiệp vụ đã có SRS/TechSpec → **SA/BA/TA/Dev Lead chủ động** delta spec + chia việc (`.cursor/rules/proactive-srs-governance.mdc`).

**U19:** PM duy trì `PROGRAM_JOURNEY_MAP.md`; QA **L2.5 J-*** bắt buộc; mỗi lỗi user → governance update cùng ngày — `UAT_PRODUCTION_OPERATING_PLAN.md`, `uat-production-readiness-orchestration.mdc`.

---

## Nguồn sự thật (SoT)

| Giai đoạn | SoT | Ai sở hữu thay đổi |
|-----------|-----|-------------------|
| Yêu cầu / UC | `PHASE1_UC_SRS_TECHSPEC_MATRIX.md`, BRD/SRS trong `docs/` | BA **delta** khi CR / spec_gap |
| Kiến trúc / API | OpenAPI, ADR `docs/architecture/` | SA khi arch_drift |
| Triển khai | Code + test | **Dev** |
| Chứng minh | QA evidence, gate scripts | **QA** |
| Release | QC Go/No-Go | **TA (QC)** |
| Vận hành team | Bus, WBS, rules, hooks | **PM** (+ governance vòng §3 loop doc) |

---

## Công suất sprint (S2+)

| Role | % effort điển hình | Lane |
|------|-------------------|------|
| Dev-* | 60–75% | Execution |
| QA | 15–25% | Execution |
| DevOps | 5–10% | Execution (support) |
| PM | Liên tục | Governance + dispatch |
| SA / BA | 5–10% mỗi role | Governance **on trigger** |
| TM / QC | Gate wave + sprint close | Governance (TA) |

---

## Khi nào PM dispatch governance (BA/SA/TA)

| Trigger | Role | Output |
|---------|------|--------|
| QA/Dev `spec_gap` | BA | Delta matrix / AC |
| Validation không có trong spec | BA-D | Contract note |
| JWT, tenant, tích hợp mới | SA | ADR ngắn |
| Matrix drift / TM condition | SA hoặc BA | Spike 0.5d |
| Sau wave Dev/QA PASS | **TA** (TM, QC) | Review + GWC/GO |
| Cuối sprint | PM + all governance | Retro + **cập nhật Cursor** (U16) |

## Khi nào PM dispatch execution (mặc định)

- Backlog sprint: implement + test UC.
- Sau governance review: wave Dev/QA kế.
- **Không** gán BA+SA+Dev+QA cùng lúc “đủ role”.

```
IF sprint_backlog_has_impl → dev-* + qa
ELIF qa_passed_wave && no_tm_verdict → technical-manager and/or qc
ELIF spec_gap | arch_drift → ba-* or sa (narrow)
ELIF sprint_close → governance loop §3 + P1-SN-PM-02
```

---

## S2 (áp dụng U16)

| Work item | Lane |
|-----------|------|
| P1-S2-FE-01, P1-S2-BE-WAVE-01 | **Execution** (Dev) |
| P1-S2-QA-01 | **Execution** (QA) |
| P1-S2-SA-01 | **Governance** (ADR C2 — đã trigger) |
| P1-S2-BA-P-01 | **DEFER** governance unless spec_gap |
| P1-S2-TM-01, P1-S2-QC-01 | **Governance** (TA) W2 |

Playbook: `PM_ORCHESTRATION_PLAYBOOK.md` · Bus tag: `lane: execution` | `lane: governance`
