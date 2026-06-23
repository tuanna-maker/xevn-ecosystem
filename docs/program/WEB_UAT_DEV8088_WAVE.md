# Web UAT wave — Dev server :8088 (sponsor 2026-06-16)

**Scope:** Web portal only — **không APK/mobile**  
**Dev URL:** [http://14.225.217.232:8088/](http://14.225.217.232:8088/)  
**Accounts:** [`docs/qa/PILOT_TEST_ACCOUNTS.md`](../qa/PILOT_TEST_ACCOUNTS.md)  
**Flag matrix:** [`docs/qa/USER_FLOW_OPERABILITY_MATRIX.md`](../qa/USER_FLOW_OPERABILITY_MATRIX.md)

## Pipeline (bắt buộc thứ tự)

| Step | work_item_id | Owner | Exit |
|------|----------------|-------|------|
| W1 | `P1-USER-FLOW-WEB-QA-L0` | QA | Local `:5173` — mọi UF-* web ⬜/🟡/🔴 tested; evidence + matrix cờ |
| W2 | `P1-USER-FLOW-WEB-QC-L0` | QC | GO/GWC/NO-GO local; 🔴 có owner dispatch |
| W3 | `P1-DEPLOY-8088-WEB-UAT-01` | DevOps | VPS `:8088` smoke 200; APIs up |
| W4 | `P1-USER-FLOW-WEB-QA-8088` | QA | Retest cùng UF-* trên `:8088`; cột **Dev :8088** trong matrix |
| W5 | `P1-USER-FLOW-WEB-QC-8088` | QC | GO/GWC cho demo khách web |

## Tiêu chí 🟢 USER-OK (mỗi action)

1. **Nghiệp vụ rõ:** ghi UF-ID + mô tả SRS (vd. «Thêm cổ đông đơn vị thành viên»).
2. **Thao tác:** click path đầy đủ → nhập → **Lưu** → **F5** → dữ liệu đúng nghiệp vụ (không mock sai scope).
3. **Không lỗi:** không banner đỏ, không 409/500 che UI, không trống khi API 200 có data.
4. **Evidence:** screenshot + Network method/URL/status + `envelope.code`.

## Personas bắt buộc (web)

| Persona | Account | Test gì |
|---------|---------|---------|
| Chủ tịch tập đoàn | `ceo@xe.vn` | CC + HRM embed rollup `main` |
| CEO du lịch | `du-lich.ceo@xe.vn` | Member scope + negative group paths |
| HRBP du lịch | `du-lich.hr@xe.vn` | HRM mutate trong `xe-du-lich` |

## Out of scope wave này

- Mobile APK / J-MOB / adb
- Production cutover / DNS HTTPS (nip.io optional smoke only)

## Exit criteria nghiệm thu (bắt buộc)

| # | Điều kiện | Owner |
|---|-----------|-------|
| E0 | **Code parity** — VPS HEAD = local fix (commit+push+redeploy, không `-SkipPush`) | DevOps + sponsor |
| E1 | **0** hàng ⬜/🟡/🔴 trong §3–§4 (web scope) | QA + Dev |
| E2 | Cột **Dev8088=🟢** cho mọi UF web in-scope | QA W4 |
| E3 | QC **GO** (không GWC) `P1-USER-FLOW-WEB-QC-8088` | QC W5 |
| E4 | Sponsor không cần tránh màn nào — full script khách | PM |

**Cấm:** «Nếu kịp», «chỉ demo 🟢», workaround màn lỗi.

**PM status:** ACCEPTANCE CLOSE — DISPATCHED 2026-06-20
