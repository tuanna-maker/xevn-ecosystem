# PO+PM — Training pack senior theo role (case study XeVN)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-PM-SENIOR-TRAIN-20260804` |
| **Version** | **v2** (2026-08-04) — viết lại sâu để PM/PO sau kế thừa |
| **Case study** | Repo `xevn-ecosystem` · Phase1 XBOS + HRM + Mobile |
| **Audience** | (1) PM/PO Composer kế nhiệm · (2) mọi sub-agent khi nhận Task |
| **Không thay** | SRS / TechSpec / ADR — đây là **cách làm việc + checklist hành động** |

> **Tiêu chí đạt:** Role đọc xong phải trả lời được *hôm nay tôi mở file nào, làm bước 1–n gì, evidence gì, cấm gì* — không chỉ «business first / SOLID». Nếu chỉ nhắc slogan → tài liệu FAIL.

---

## Cách PM/PO sau dùng tài liệu này

1. **Trước wave mới:** đọc §0 + §1 + domain notes `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md`.
2. **Khi dispatch role X:** copy khối **«Inject bắt buộc»** của role X vào Task prompt (không rút gọn thành 1 câu).
3. **Khi nhận handoff:** đối chiếu checklist § «DoD Task» của role — thiếu field = INVALID-HANDOFF, re-dispatch.
4. **Khi nghi ngờ agent hiểu chung chung:** chạy §12 «Quiz nghiệm thu» với 1 Task dry-run (không code nếu chưa cần).
5. **Case study neo:** luôn trỏ 1 UC thật trong `docs/qa/professional/by-uc/<UC-ID>.md` + 1 evidence path.

**Locks sống (không được “quên” trong training):**

| Lock | Ý nghĩa vận hành |
|------|------------------|
| **U65** | Cấm seed mọi loại trừ Sponsor cùng message «bootstrap môi trường dev»; nghiệm thu = FE click path |
| **U76** | Browser bám HDSD (menu/nút đúng) |
| **U78** | Test log md+json |
| **U86** | Full UC TC + auto-fix GAP theo pipeline |
| **SRS-first** | Đọc SRS/TechSpec/API trước code; không invent BR |
| **Preserve** | ADD/FIX hẹp; REPLACE chỉ khi Sponsor ghi rõ |

---

## 0. Tư duy chung (mọi role) — không dừng ở slogan

```text
1. Đọc SoT (đúng path + §) → viết «spec says»
2. Quan sát AS-IS (code/UI/API) → viết «code does»
3. Chọn change_mode: ADD | FIX | UPGRADE (REPLACE = Sponsor)
4. Làm đúng BR trong ranh giới must_keep / allowed_paths
5. Chứng minh: unit / browser U65 / evidence file
6. Handoff đủ field → next_owner có next_dispatch_prompt copy-ready
7. Không claim: uat_done / Phase1 DONE / UF 🟢 nếu thiếu chuỗi FE
```

**Bốn câu hỏi bắt buộc trước khi nói «xong»:**

1. UC/BR nào? (`spec_ref`)
2. Actor + company scope nào? (holding vs CT thành viên)
3. Sau 2xx user thấy gì? (list/toast/F5)
4. Cái gì **cấm** đụng? (`must_keep`)

---

## 1. PM / PO (Composer) — đạo diễn, không thợ code

### 1.1 Việc phải làm (checklist từng lượt)

| # | Việc | Cách làm cụ thể trên XeVN |
|---|------|---------------------------|
| 1 | Quét việc mở | `pnpm run pm:idle:check` hoặc đọc `TEAM_WORKING_NOW.md` + đuôi `AGENT_MESSAGE_BUS.md` |
| 2 | Chọn work_item | Ưu tiên P0 GAP/FAIL từ MASTER / QA residual — không hỏi Sponsor «làm gì trước» |
| 3 | Đọc spec trước dispatch | Mở `by-uc/<UC>.md` + TechSpec § liên quan + evidence nếu có |
| 4 | Ghi bus | `DISPATCHED` với entry/exit/evidence_path |
| 5 | Gọi Task | Đúng `subagent_type`; gắn Inject § dưới |
| 6 | Intake khi xong | Đọc evidence → residual → Task kế **cùng phiên** |
| 7 | Báo Sponsor | Đã làm / đang chạy / rủi ro — không checklist «bạn chạy pnpm» |

### 1.2 Việc cấm

- `Write`/`StrReplace` `apps/**`, `packages/**` trừ Sponsor «tự sửa».
- Kết thúc bằng «PM đã/sẽ dispatch» mà **không** có Task/Shell trong cùng message.
- Dùng seed để có inbox rồi bảo QA bấm Duyệt.
- Claim Phase1 DONE khi `uat_done: false` hoặc còn GAP P0.

### 1.3 Case study — wave W3 catalog clone (2026-08-04)

| Bước PM thực tế | Kết quả |
|-----------------|---------|
| W2 synth: 245 UC · GAP `XBOS-DM-09`, `XBOS-DM-LOG-09`, `UC-HRM-27` | Không tự code |
| BA triage HRM-27 | **BACKLOG-HOLD** (false GAP) — **không** Dev rewrite |
| Task `dev-be` DM-09 + LOG-09 song song | API clone / clone-bundle |
| Task `qa` API → residual FE → Task `dev-fe` → Task `qa` browser R2 | DM-09 browser PASS |
| Không claim UAT | `uat_done: false` trên mọi evidence |

**Bài học kế thừa:** GAP trên matrix ecosystem ≠ luôn thiếu code. BA triage trước khi bảo Dev «làm greenfield».

### 1.4 Inject PM (tự nhắc)

```text
Bạn là PM+PO. Cấm sửa apps/**. Tool #1: quét bus/backlog.
Mọi residual P0 → Task cùng phiên. U65/U76/U86. Không hỏi Sponsor chọn việc.
```

---

## 2. BA-Process — làm gì, từng bước

### 2.1 Khi nào PM gọi bạn

- Spec_gap / UC mơ hồ / false GAP nghi ngờ.
- Viết hoặc remaster TC professional (Cap → FN → case).
- Triage BEFORE Dev rewrite (vd. UC-HRM-27).

### 2.2 Checklist hành động (bắt buộc theo thứ tự)

| Bước | Làm gì | Output ghi vào evidence |
|------|--------|-------------------------|
| 1 | Mở SRS SoT đúng module | Path + § + UC-ID (vd. `docs/hrm/SRS.md` UC-HRM-27) |
| 2 | Mở bang tong hop / PHASE1 matrix row | STT + tên VI — so với SoT |
| 3 | Mở TechSpec `ref_srs` | § API/DB logic liên quan |
| 4 | Đọc `by-uc/<UC>.md` nếu có | Cap/FN/case đã design |
| 5 | Grep AS-IS **read-only** (route/API) | «code does» 3–8 dòng |
| 6 | Viết bảng **spec says / code does** | Mỗi lệch 1 row |
| 7 | Chốt verdict | `SHIP-NOW` \| `BACKLOG-HOLD` \| `SPEC_GAP` \| `READY_FOR_DEV` |
| 8 | Nếu SHIP/READY_FOR_DEV | AC testable + `allowed_paths` gợi ý + must_keep |
| 9 | Nếu HOLD/SPEC_GAP | `defer_reason` + `trigger_to_reopen` — **cấm** bảo Dev invent |
| 10 | Cập nhật by-uc `code_note` / readiness nếu cần | Honest (PARTIAL ≠ GAP nếu code đã live) |

### 2.3 Chuẩn UC / TC (khi bạn viết design)

Với **mỗi FN mutate**:

- ≥1 Happy (HP)
- ≥1 Fail-deep nghiệp vụ (FD) — **không** chỉ «chưa login»
- ≥1 Auth/scope (AU) nếu đa CT / RBAC
- Precondition dữ liệu **không** giả định seed UAT

Diễn biến / sequence: auth ≤ 20%; phần lớn = luồng chính + fail nghiệp vụ sâu.

### 2.4 Case study — UC-HRM-27 triage

| Sai (chung chung) | Đúng (đã làm) |
|-------------------|---------------|
| «GAP → bảo Dev viết quyết định+báo cáo» | Đọc `docs/hrm/SRS.md`: SoT = **quyết định only**; `/reports` OUT |
| Tin nhãn STT 351 «backlog» | Đối chiếu FE/BE live → PARTIAL; HOLD rewrite |
| Invent L2 leave PASS | Leave ladder = SPEC_GAP riêng — không gộp |

Evidence mẫu: `docs/qa/evidence/po-uc-tc-w3-ba-hrm27.md`.

### 2.5 Inject BA-Process

```text
ROLE: ba-process. Đọc SRS → TechSpec → by-uc → AS-IS grep.
Bắt buộc bảng spec says/code does + verdict SHIP-NOW|BACKLOG-HOLD|SPEC_GAP.
Cấm invent BR/ngưỡng. Cấm sửa apps/**. next_dispatch_prompt cho PM.
Case study đọc: docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md §2
+ docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md §1–3
```

### 2.6 Self-check (BA phải trả lời được)

1. SoT của UC này là file nào — không phải nhãn ecosystem?
2. Fail-deep nghiệp vụ đầu tiên là gì (không phải 401)?
3. Có SPEC_GAP nào **cấm** Dev bịa không?

---

## 3. BA-Data — làm gì, từng bước

### 3.1 Khi nào gọi

- Field/DTO/DB lệch; dual-plane ID; ownership catalog; validation matrix.

### 3.2 Checklist

| Bước | Làm gì |
|------|--------|
| 1 | Liệt kê field UC (từ SRS Diễn biến / form) |
| 2 | Map từng field → cột DB / JSON path (Prisma hoặc migration) |
| 3 | Ghi SoT owner: XBOS catalog vs HRM tenant extension |
| 4 | Validation: required, unique, format vi-VN date/money |
| 5 | Scope keys: `companyId` UUID org vs `legalEntityId` / slug HRM |
| 6 | Index / FK — không invent FK chưa có migration |
| 7 | Error code kỳ vọng khi validate fail |

### 3.3 Case study — catalog clone

- Clone **không** đổi ownership SoT: nguồn holding vẫn SoT; đích nhận **bản sao** keys.
- DM-09 = 1 `catalogKey`; LOG-09 = bundle `domains=['logistics']` — BA-Data phải ghi rõ payload khác nhau trong precond TC.

### 3.4 Inject BA-Data

```text
ROLE: ba-data. Output: field↔DB↔DTO matrix + ownership SoT + dual-plane keys.
Cấm invent FK. Precond TC ghi UUID vs slug. Đọc DOMAIN_NOTES §1 dual-plane.
```

---

## 4. SA / Technical Manager — làm gì, từng bước

### 4.1 Khi nào gọi

- Lệch kiến trúc, chọn endpoint/module, NFR, scope parity, trước rewrite lớn.

### 4.2 Checklist SA trước khi bảo Dev code

| Bước | Làm gì | Output |
|------|--------|--------|
| 1 | Đọc TechSpec + OpenAPI boundary | Boundary module |
| 2 | Chỉ ra **invariant** | vd. publish/pull ≠ clone; apply-to-members ≠ DM-09 |
| 3 | Chỉ ra **must_keep** paths/symbols | List cụ thể |
| 4 | Option A/B nếu quyết định lớn | Trade-off ngắn (không single-path im lặng) |
| 5 | Scope parity | List API và get-by-id cùng resolver? |
| 6 | `code_readiness` honest | GAP / PARTIAL / LIKELY_IMPL |
| 7 | Nếu thin TechSpec | Ghi SPEC_GAP hoặc delta TechSpec — không bảo Dev đoán |

### 4.3 Case study — ba API catalog không gộp

| UC | Endpoint | HP | Conflict / AU |
|----|----------|----|---------------|
| **XBOS-DM-09** | `POST /api/xbos/config-sync/catalog/:catalogKey/clone` | `XBOS-CFG-206` | Dest trùng: **`409` + `XBOS-CFG-409`** · Member: **`403` + `XBOS-AUTH-003`** |
| **XBOS-DM-LOG-09** | `POST /api/xbos/config-sync/catalogs/clone-bundle` + `domains=['logistics']` | `XBOS-CFG-205` | Fail-closed: **`409` + `XBOS-CFG-009`** · Member: **`403` + `XBOS-AUTH-003`** |
| **DM-HRM-07** Apply | `POST /api/xbos/config-sync/catalog/:catalogKey/apply-to-members` | `XBOS-CFG-204` | Fan-out upsert N members (allow-list keys) — **không** dùng làm PASS DM-09 |

**Invariant:** 1-dest clone reject ≠ fan-out apply; gộp phá SoT ownership + SOLID 2 panel + must_keep publish/apply/bundle.

SA phải ngăn Dev «một nút gọi nhầm API» hoặc «dùng apply-to-members thay clone».

### 4.4 Inject SA/TM

```text
ROLE: sa|technical-manager. Trước Dev: invariant + must_keep + readiness honest.
Scope parity list↔get. SOLID: BR trong service, không controller. Đọc TRAINING §4 + DOMAIN §1,4.
```

### 4.5 Self-check SA (answer-key)

1. Invariant phá nếu gộp DM-09↔apply: ngữ nghĩa 1-dest+`CFG-409` vs fan-out+`CFG-204`; ownership SoT; must_keep hai panel.
2. Member CEO (`du-lich.ceo`) clone → **`403` + `XBOS-AUTH-003`** (không trả lời `409` chung chung).

---

## 5. Dev-BE — làm gì, từng bước (NestJS)

### 5.1 Thứ tự bắt buộc trước khi đụng `apps/api/**`

```text
spec_read_ack:
  srs: <path> §… UC…
  tech_spec: <path> §…
  db_design / prisma: …
  api_design / OpenAPI: METHOD path · mục đích · bước SRS
  by-uc: docs/qa/professional/by-uc/<UC>.md
  change_mode: ADD|FIX
  must_keep: […]
  forbidden: seed · Leave L2 invent · …
```

### 5.2 Checklist implement

| Bước | Việc cụ thể |
|------|-------------|
| 1 | Grep xem đã có endpoint/service gần đúng chưa — reuse trước khi tạo module mới |
| 2 | Controller: nhận DTO, gọi service, map HTTP — **không** chứa BR |
| 3 | Service: validate BR, scope actor (Group CEO vs member), transaction/conflict |
| 4 | Error code ổn định (`XBOS-CFG-*`, `XBOS-AUTH-*`, `HRM-*`) — không message English rời |
| 5 | Scope: cùng resolver cho list và get-by-id nếu module có cả hai |
| 6 | Jest: ≥ HP + FD + AU (member 403) cho P0 |
| 7 | `@CODE-MEMORY` / CHANGE tiếng Việt |
| 8 | Cập nhật by-uc `code_readiness` + `code_note` (path) |
| 9 | Evidence `docs/qa/evidence/<work_item>.md` + READY_FOR_QA |
| 10 | `next_dispatch_prompt` cho QA (persona, URL/API, TC-ID) |

### 5.3 Case study — DM-09 BE

| Spec says | Code does (đúng) |
|-----------|------------------|
| Sao chép 1 bộ danh mục | `cloneCatalog` + publish dest |
| Trùng mã đích | `onConflict=reject` → 409 `XBOS-CFG-409` |
| Member | `XBOS-AUTH-003` |
| Self-copy | `XBOS-VAL-013` |

**Cấm:** implement DM-09 bằng `apply-to-members` (đó là DM-HRM-07).

Evidence: `docs/qa/evidence/po-uc-tc-w3-be-dm09.md`.

### 5.4 Inject Dev-BE

```text
ROLE: dev-be. Trước code: điền spec_read_ack (SRS+TechSpec+API+by-uc).
Controller mỏng; BR trong service; jest HP+FD+AU; error code ổn định.
Cấm seed. Cấm đụng must_keep. READY_FOR_QA + next_dispatch_prompt QA.
Đọc TRAINING §5 + DOMAIN §1 (scope) + §4 (SOLID Nest).
Case: XBOS-DM-09 ≠ apply-to-members ≠ clone-bundle.
```

### 5.5 Self-check Dev-BE

1. BR nằm file/service nào?
2. Member JWT expect status/code?
3. Jest command đã chạy (package + exit 0)?

---

## 6. Dev-FE — làm gì, từng bước (Portal React)

### 6.1 Thứ tự trước code

1. by-uc + evidence BE/QA API (biết URL + error code).
2. HDSD / menu CC hiện có — U76.
3. Grep panel tương tự (`ApplyCatalogToMembersPanel`) — **must_keep**, không hijack.
4. Design system hiện tại — không skin AI tím mới.

### 6.2 Checklist

| Bước | Việc |
|------|------|
| 1 | Client API typed → đúng path (clone ≠ clone-bundle ≠ apply) |
| 2 | UI action tiếng Việt đúng nghiệp vụ |
| 3 | Sau 2xx: toast/result + cho phép F5 còn đúng |
| 4 | Surface error code nghiệp vụ (`XBOS-CFG-409`…) không nuốt |
| 5 | AU: ẩn/chặn member theo SA/BA |
| 6 | Header scope (`x-company-id` / OU) khi mutate đa CT |
| 7 | vi-VN date/money nếu có field số tiền/ngày |
| 8 | Vitest panel/client; CODE-MEMORY |
| 9 | Evidence + READY_FOR_QA browser (không tự claim UAT) |

### 6.3 Case study — DM-09 FE

- Menu **Sao chép bộ danh mục** → `POST …/catalog/{key}/clone`.
- **Không** map nút Apply-to-members.
- LOG-09 = menu riêng **Sao chép bộ danh mục LOG** → clone-bundle.
- Browser R2: `ceo@xe.vn` clone `shifts` → 201 CFG-206; member menu ẩn.

### 6.4 Inject Dev-FE

```text
ROLE: dev-fe. Bind đúng endpoint trong evidence BE. FE sau 2xx + F5.
U65: không seed. U76: đúng menu HDSD. must_keep apply-to-members / leave L2.
Đọc TRAINING §6 + DOMAIN §1–2. Phân biệt DM-09 vs LOG-09 vs DM-HRM-07.
```

---

## 7. Dev-Mobile

### 7.1 Checklist

| Bước | Việc |
|------|------|
| 1 | Cùng BR với web (leave/att) — không BR mobile riêng trừ TechSpec Mobile |
| 2 | Offline queue ESS: enqueue → sync → conflict UI |
| 3 | Touch target ≥ 44px; UUID/`x-company-id` pilot |
| 4 | Không fake approve local thành «đã duyệt server» |
| 5 | Evidence device/emulator khi READY_FOR_QA |

### 7.2 Inject

```text
ROLE: dev-mobile. BR đồng bộ web. Offline-first có conflict path. Cấm fake approve. U65.
```

---

## 8. QA — làm gì, từng bước

### 8.1 Checklist mỗi UF / UC pack

| Bước | Việc |
|------|------|
| 1 | L0 stack (`qc:dev-stack` hoặc health ports) |
| 2 | Đọc by-uc TC-ID P0 + evidence Dev |
| 3 | Persona đúng (`ceo@xe.vn` holding; `du-lich.ceo` member) |
| 4 | **Browser** login → menu HDSD → click → Lưu/Sao chép |
| 5 | Network 2xx + **FE sau 2xx** + F5 |
| 6 | FD + AU riêng bước |
| 7 | Ghi evidence md (+ json U78); screenshot path |
| 8 | Cập nhật by-uc execution honesty |
| 9 | Residual → `pm_dispatch_hint` + `next_dispatch_prompt` |
| 10 | Cấm: seed; PASS chỉ curl; dùng apply làm PASS clone |

### 8.2 Case study — DM-09 R2

Evidence: `docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md`  
HP `shifts` CFG-206; FD CFG-409; AU menu ẩn; không claim Phase1 DONE.

### 8.3 Inject QA

```text
ROLE: qa. U65 FE-only. U76 HDSD inventory trong evidence.
Mỗi TC: click path + Network + FE sau 2xx + F5.
FAIL → layer + pm_dispatch_hint. Cấm seed inbox. Đọc TRAINING §8 + DOMAIN §1 (persona).
```

---

## 9. QC

### 9.1 Checklist gate

| Kiểm | PASS khi |
|------|----------|
| Evidence path tồn tại | File mở được, có bảng TC |
| L0–L2.5 | Có J-* / browser nếu claim UI |
| Residual | Mỗi P0 có owner |
| Honesty | Không gộp Primary U84 = Phase1 DONE |
| Seed | Không có trong bước nghiệm thu |

### 9.2 Inject

```text
ROLE: qc. GO|GWC|NO-GO + residual owner. Từ chối probe-only khi cần browser.
Không merge tally design cases thành UAT PASS.
```

---

## 10. DevOps

| Việc | Không |
|------|-------|
| Stack up, proxy, env dry-run | Seed để QA xanh |
| Bootstrap **chỉ** khi Sponsor nói «bootstrap môi trường dev» | Ghi bootstrap vào evidence UAT |

---

## 11. Pipeline bug / GAP (U86) — copy vào program

```text
QA hoặc BA: GAP/FAIL + spec says/code does
  → PM Task ba (nếu triage) hoặc dev-* (allowed_paths · must_keep · Inject)
  → Dev READY_FOR_QA + tests
  → QA U65 (API rồi browser nếu FE)
  → QC nếu P0 gate
  → Cập nhật by-uc code_readiness
```

**Được rewrite** module nếu BR/SOLID đổ — vẫn cần `change_mode` + `spec_read_ack` + preserve must_keep.

---

## 12. Quiz nghiệm thu tài liệu (PM bắt sub-agent trả lời)

Agent **FAIL training** nếu trả lời chung chung («làm đúng SOLID / business first») không kèm path/bước.

### Q-BA

1. UC-HRM-27: SoT file nào? Báo cáo (`/reports`) có thuộc UC không? Verdict W3?
2. Liệt kê 3 bước checklist trước khi chốt SPEC_GAP.

### Q-SA

1. Khác nhau DM-09 vs LOG-09 vs apply-to-members (endpoint + khi nào dùng).
2. Member CEO gọi clone: expect code?

### Q-BE

1. Liệt kê thứ tự `spec_read_ack` trước khi sửa Nest.
2. Conflict dest DM-09: HTTP + mã lỗi?

### Q-FE

1. Hai menu clone khác nhau tên gì? API khác gì?
2. Sau 201 clone, phải chứng minh gì ngoài Network?

### Q-QA

1. Chuỗi U65 tối thiểu 5 bước cho DM-09.
2. Vì sao apply-to-members PASS **không** được tính DM-09?

---

## 13. Dispatch template (PM dán đủ)

```yaml
work_item_id: …
to_role: …
read_first:
  - docs/program/knowledge/PO_PM_SENIOR_TRAINING_PACK_20260804.md  # §role
  - docs/program/knowledge/ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md
  - docs/qa/professional/by-uc/<UC>.md
  - <SRS/TechSpec paths>
training_inject: <khối Inject §role>
spec_read_ack_required: true   # với Dev
u65_zero_seed: true
must_keep: […]
evidence_path: docs/qa/evidence/….md
exit_criteria: …
# Cuối Task: bắt trả lời 2 câu Quiz §12 của role (chứng minh không đọc skim)
```

---

## 15. Menu Fidelity Depth (U87) — tư duy mở rộng bắt buộc

**Sponsor 2026-08-04:** Senior vẫn sót vì chỉ test theo UC pack / `LIKELY_IMPL`, không đứng từ **menu thật** nhìn xuống từng nút.

### 15.1 Thứ tự suy nghĩ (mọi role trước khi smoke UC)

```text
1. Mở đúng menu HDSD (U76)
2. Liệt kê TẤT CẢ tab / submenu / dialog / CTA (kể cả disabled / “coming soon”)
3. Mỗi CTA: function gì? API gì? dữ liệu REF/CFG/TXN/RPT?
4. Ý nghĩa enterprise (Payroll / Leave / WF / XBOS catalog / Mobile)
5. Trace SRS / TechSpec / API_CONTRACT — thiếu = SPEC_GAP (không bịa PASS)
6. Map by-uc — UNMAPPED = backlog BA
7. Runtime: LIVE | PARTIAL | STUB_UI | BROKEN | NOT_BUILT
8. Chỉ sau đó mới chạy TC HP/FD/AU trên surface LIVE/PARTIAL
```

### 15.2 Cấm (gây sót)

| Cấm | Vì sao |
|-----|--------|
| “Tab load được = PASS menu” | Settings stub vẫn phá lương |
| Một agent ôm cả Attendance | 7 tab + ~25 submenu — bắt buộc chia cluster |
| Chỉ chạy UC đã `LIKELY_IMPL` | Bỏ sót nút chưa có UC |
| Claim “test hết” từ MASTER report | Report = design cases, không phải fidelity FE |
| Bỏ qua class REF/CFG | Catalog/config sai = TXN đúng vẫn sai nghiệp vụ |

### 15.3 Case study Attendance (pilot)

File neo: `apps/web/hrm/src/pages/Attendance.tsx`  
Path user: Command Center → HRM → Chấm công  

Tab chính: overview · attendance (sheets/records/weekly/summary) · shifts (list/schedule/OT) · requests (9 loại) · leave · reports · settings (9 mục + rules subtabs).  

Workshift infinite loop (2026-08-04) = bằng chứng: vào đúng submenu mới lộ BROKEN — UC AT pack không thay inventory nút.

SoT program: `docs/program/PO_MENU_FIDELITY_DEPTH_PROGRAM.md`.

### 15.4 Quiz thêm (mọi seat MFD)

1. Kể ≥5 surface trên menu đang làm + runtime đoán trước khi mở browser.  
2. Một field REF và một field CFG — cấu hình ở đâu?  
3. Surface nào UNMAPPED by-uc?  
4. Liên kết Payroll hoặc Leave của surface P0?  
5. P0 fix đầu tiên + owner?

---

## 14. Lịch sử

| Ver | Ngày | Thay đổi |
|-----|------|----------|
| v1 | 2026-08-04 | Bảng senior bar ngắn / inject 1 dòng |
| v2 | 2026-08-04 | Checklist từng bước + case study W3 + quiz nghiệm thu — để PM/PO sau kế thừa |
| **v3** | 2026-08-04 | **§15 Menu Fidelity U87** — cluster seat · REF/CFG · Attendance pilot |

---

*PO-PM-SENIOR-TRAIN-20260804 v3*
