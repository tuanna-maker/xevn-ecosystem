# Evidence — PO-HRM-JD-GROUP-SPEC-01

| Field | Value |
|-------|--------|
| **Date** | 2026-08-06 |
| **Role** | ba-process |
| **work_item_id** | PO-HRM-JD-GROUP-SPEC-01 |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |

---

## completion_report

### Closed

- ADD-only delta: `docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md`
- UC/FR: **00d** Group · **00e** Default Pack · **00f** Rule áp dụng · **00g** Viết JD (auto pack + kéo Group) · **00h** View theo Group
- BR-BP-JD-GRP-01..10 + keep DYN/spine locks
- AC-JD-GRP-01..23 (2xx · F5 · empty/error · IT vs Driver resolve)
- `sequenceDiagram` tiếng Việt end-to-end
- Map IT (`PACK_IT_OFFICE`) vs Driver (`PACK_DRIVER_OPS`) + corp default từ GROUP-MODEL-01 / 3 JD mẫu
- Locks stamped: Option A · Q1 · Q6 · SoT `job_description_templates`
- Out-of-scope explicit: invent brand · dual-write `job_postings` · U65 no seed evidence
- J-* đề xuất: J-HRM-JD-04..06
- Handoff packets: ba-data GROUP-DATA-01 · sa GROUP-ARCH-01 APPEND
- **no apps/** touched
- **no_prompt_echo** on client-facing narrative (meta §0 đội ngũ only)

### APPEND 2026-08-06 — World benchmark import (trước final PASS)

| Import từ WORLD-BENCHMARK-01 | Vào GROUP-SPEC |
|------------------------------|----------------|
| Catalog §4 | §21.1 — `SEC_ABOUT_ROLE`, `SEC_REQ_MIN`/`SEC_REQ_PREF`, `SEC_BENEFITS`, `SEC_LICENSE`, `SEC_SAFETY`, `SEC_AI_TOOLS`… |
| Packs §3.5 | §21.2 — `PACK_IT_OFFICE` · `PACK_DRIVER_OPS` · **`PACK_CORP_DEFAULT`** (alias `PACK_COMPANY_DEFAULT`) |
| View order §3.6 | §21.3 TopCV-style Meta→About→Resp→Min→Pref→Working→Benefits (+ Driver Safety/License) |
| Google min vs preferred | BR-BP-JD-GRP-11..14 · AC-JD-GRP-24..27 |
| Alias mã cũ | §12.1 → SoT §21 |

**read_ack append:** `docs/program/specs/PO-HRM-JD-WORLD-BENCHMARK-01.md`

### Residual (not this seat)

- ba-data: physical entities `rec_jd_group_def` / pack / rules + snapshot shape + §21 codes/alias
- sa: APPEND ARCH-02 group layer + API F.1 + view composer §21.3
- ba-docs: merge FR-00d..h vào SRS enterprise sau sponsor confirm (nhãn VI; không dán tên LinkedIn/Google vào bản khách)
- Dev: blocked until DATA + ARCH group sẵn sàng (cùng gate DYNAMIC)

### must_keep honesty

- Không claim JD dynamic product DONE
- Không wipe REC-00 / UC-00a..c
- Không dual-write job_postings

---

## read_ack

| Artifact | Kết quả |
|----------|---------|
| `PO-HRM-JD-GROUP-MODEL-01.md` | Intent 3 lớp Field/Group/Pack · rule ưu tiên · IT vs Driver |
| `_tmp_jd_samples_extract.txt` | 3 JD IT cùng 4 khối; thời gian/đãi ngộ lặp |
| `PO-HRM-JD-DYNAMIC-SPEC-01.md` | Neo 00a..c; ADD 00d..h |
| `PO-HRM-JD-WORLD-BENCHMARK-01.md` | **Imported** §4 catalog · §3.5 packs · §3.6 view · min/pref → GROUP-SPEC §21 |
| Option A · Q1 · Q6 | LOCKED qua ARCH-02 stamps |

---

## next_owner

**pm** → parallel **ba-data** (`PO-HRM-JD-GROUP-DATA-01`) + **sa** (`PO-HRM-JD-GROUP-ARCH-01` APPEND)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-JD-GROUP-DATA-01
lane: governance · ba-data
no_prompt_echo: true

## entry
- SPEC SoT: docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md (§21 world APPEND · PASS_TO_PM)
- WORLD: docs/program/specs/PO-HRM-JD-WORLD-BENCHMARK-01.md
- MODEL: docs/program/specs/PO-HRM-JD-GROUP-MODEL-01.md
- Parent DATA: docs/program/specs/PO-HRM-JD-DYNAMIC-DATA-01.md
- Locks: Option A · Q1 · Q6 · SoT job_description_templates · cấm dual-write job_postings

## deliver ADD-only
docs/program/specs/PO-HRM-JD-GROUP-DATA-01.md
- Entities: rec_jd_group_def · rec_jd_default_pack (+ pack_groups) · rec_jd_pack_rule
- Codes SoT GROUP-SPEC §21.1–21.2 (SEC_ABOUT_ROLE, SEC_REQ_MIN/PREF, PACK_CORP_DEFAULT…)
- Alias: PACK_COMPANY_DEFAULT→PACK_CORP_DEFAULT; SEC_HEADER→SEC_META; SEC_REQUIREMENTS→MIN+PREF
- Extend layout_snapshot_json: pack_code + groups[] (view order §21.3)
- VAL map BR-BP-JD-GRP-01..14 / AC-JD-GRP-01..27 · min≠pref validate
- Soft-stop; unique codes; usage vs always_on; rule priority deterministic
- Scope parity list↔get-by-id
- Cấm invent phá YCTD FK; cấm hard-delete; cấm SoT trên job_postings

## exit
ack PASS_TO_PM · evidence docs/qa/evidence/po-hrm-jd-group-data-01.md
Cấm apps/**

## parallel (PM same turn after DATA or with SA)
work_item_id: PO-HRM-JD-GROUP-ARCH-01
role: sa
APPEND trên PO-HRM-JD-DYNAMIC-ARCH-02 — API group/pack/rule + resolve-pack + FE surfaces Q1; view composer §21.3; F.1 map UC-00d..00h; cấm FE hardcode PACK_* / section order.
```

---

## evidence_path

`docs/qa/evidence/po-hrm-jd-group-spec-01.md`

## ack_status

**PASS_TO_PM**
