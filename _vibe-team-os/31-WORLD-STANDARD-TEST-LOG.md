# 31 — Test Log chuẩn quốc tế (bắt buộc mỗi lần QA chạy)

**Sponsor (2026-08-03):** Test **phải có log test** — không được chỉ nói PASS/FAIL hoặc screenshot màn đứng. Log theo chuẩn thế giới (lean từ **IEEE 829 Test Log** + **ISO/IEC/IEEE 29119-3** Test execution log / Test result), kèm artifact máy đọc được.

**Mọi PM** khi dispatch QA/QC: `test_log_required: true`. Thiếu log chuẩn → **INVALID-HANDOFF** / QC NO-GO.

**Liên kết:** `30` (HDSD + case matrix) · `roles/qa.md` · template `templates/TEST_EXECUTION_LOG.md`

---

## 1. Tham chiếu chuẩn (không copy nguyên bản trả phí)

| Chuẩn | Ý bắt buộc giữ |
|-------|----------------|
| **IEEE 829** Level Test Log (LTL) | Nhật ký **theo thời gian**: case nào chạy, thứ tự, ai chạy, pass/fail, incident liên quan |
| **ISO/IEC/IEEE 29119-3** | **Test execution log** + **Test result** (actual vs expected) + **Incident report** khi lệch |
| Thực hành CI hiện đại | **JUnit XML** (CI gate) và/hoặc **Allure-style JSON** (step + attachment) |

XeVN/OS chọn **hai lớp bắt buộc**:

1. **Human log (Markdown)** — đủ field §2 (đọc được trong PR/evidence).  
2. **Machine log (JSON)** — schema §3 (script/CI đọc được).

Optional sau: export JUnit XML / Allure từ JSON (DevOps wave).

---

## 2. Human Test Execution Log (mỗi `work_item_id` / session)

File: `docs/qa/evidence/<work_item_id>-test-log.md` **hoặc** section `## Test execution log` trong evidence chính.

| Field | Bắt buộc | Ví dụ |
|-------|----------|--------|
| `log_id` | ✅ | `TEL-W1B-EMP-RET3-20260803` |
| `work_item_id` | ✅ | `W1-B-02-EMP-QA-RET3` |
| `tester` / role | ✅ | `qa` · agent_id |
| `started_at` / `ended_at` | ✅ ISO-8601 + TZ | `2026-08-03T20:25:00+07:00` |
| `environment` | ✅ | URL, port, build/commit, device serial, API health |
| `hdsd_sot` | ✅ (browser) | path HDSD |
| `spec_ref` | ✅ | SRS UC · Diễn biến # · FR |
| **Chronological steps** | ✅ | bảng §2.1 |
| **Case results** | ✅ | A-fail / B-success / C-logic → pass\|fail\|blocked\|skipped |
| **Incidents** | ✅ nếu fail | defect id + expected vs actual |
| `ack_status` | ✅ | PASS_TO_PM / FAIL / BLOCKED |

### 2.1. Bảng bước (IEEE LTL lean)

| seq | time | action (HDSD label) | expected | actual | network/status | result | attachment |
|-----|------|---------------------|----------|--------|----------------|--------|------------|
| 1 | 20:25:10 | Mở menu Nhân viên | List load | List OK | GET 200 | pass | `01-list.png` |
| 2 | 20:25:40 | Lưu thiếu CCCD | Lỗi BR | Toast … | POST 400 | pass | … |

**Cấm:** evidence không có bảng bước theo thời gian.  
**Cấm:** chỉ 1 screenshot idle.  
**Cấm:** PASS khi không có `started_at`/`ended_at` và ≥1 bước `result=pass|fail`.

---

## 3. Machine log JSON (bắt buộc cạnh Markdown)

Path: `docs/qa/evidence/<work_item_id>-test-log.json`

Schema tối thiểu (Allure-inspired + 29119):

```json
{
  "schema": "xevn-test-log/v1",
  "log_id": "TEL-…",
  "work_item_id": "…",
  "tester": "qa",
  "started_at": "…",
  "ended_at": "…",
  "environment": {
    "base_url": "http://127.0.0.1:5173",
    "apis": { "hrm": "http://127.0.0.1:28001", "xbos": "http://127.0.0.1:28002" },
    "device": "emulator-5554|null",
    "git_sha": "optional"
  },
  "hdsd_sot": "…",
  "spec_ref": ["UC-…", "Diễn biến #…"],
  "cases": [
    {
      "id": "A-fail-required",
      "name": "…",
      "status": "passed|failed|blocked|skipped",
      "steps": [
        {
          "name": "…",
          "status": "passed|failed",
          "start": "…",
          "stop": "…",
          "expected": "…",
          "actual": "…",
          "attachments": ["docs/qa/evidence/screens/…"]
        }
      ]
    }
  ],
  "incidents": [],
  "summary": { "passed": 0, "failed": 0, "blocked": 0, "skipped": 0 },
  "ack_status": "PASS_TO_PM|FAIL|BLOCKED"
}
```

---

## 4. Gate

| Role | Hành vi |
|------|---------|
| **QA** | Mỗi wave browser/device/API UAT: xuất **cả** `.md` log + `.json` |
| **QC** | NO-GO nếu thiếu log hoặc log không có bước theo thời gian |
| **PM** | Task thiếu `test_log_required: true` = lỗi điều phối; handoff thiếu JSON = INVALID |

---

## 5. Copy-ready PM dispatch

```text
test_log_required: true
test_log_md: docs/qa/evidence/<WI>-test-log.md
test_log_json: docs/qa/evidence/<WI>-test-log.json
read_first: _vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md · templates/TEST_EXECUTION_LOG.md · 30
hdsd_align: true
case_matrix: fail_deep + success_hdsd + logic_br
anti_idle: true
```
