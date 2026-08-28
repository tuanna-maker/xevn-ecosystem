# Team operating model — cách làm việc chung (mọi dự án)

**Cập nhật:** 2026-06-28  
**Nguồn:** Sponsor feedback + phiên điều phối multi-wave (SmartClinic Biomedic).  
**Mục đích:** Agent mới vào **bất kỳ** repo → đọc file này + `01`–`08` → biết cách hành xử **không cần sponsor nhắc lại**.

> **Không** ghi SRS/BR chi tiết từng khách vào đây — chỉ **quy trình**. SRS/tech-spec nằm `<project>/docs/`.

---

## 1. Ai làm gì (khối sản xuất)

```
Sponsor REQ
  → PM intake (work_item_id, lane, bus, read_first, must_keep, forbidden_paths)
  → SA/BA: SRS (UC, BR) + sponsor CONFIRM  [spec-first nếu đổi nghiệp vụ]
  → Tech-spec FE + BE/DB
  → dev-fe / dev-be: code + @CODE-MEMORY + test map BR/UC
  → QA: matrix prod/local + evidence + probe JSON + screens
  → QC: GO / GO WITH CONDITIONS / NO-GO
  → devops: commit scoped, preflight, GHA, prod bundle hash
  → PM: wave kế — không idle sau PASS_TO_PM / READY_FOR_QA
```

| Role | Được | Cấm |
|------|------|-----|
| **PM + PO (lead agent)** | Định hướng sản phẩm (research, IN/OUT, thuyết phục members) **và** dispatch Task, bus, đọc code phân tích — SoT `32-PM-PO-DUAL-ROLE.md` | Sửa `src/`, migration, test trực tiếp; chỉ điều phối không research khi sponsor đòi tầm sản phẩm |
| **dev-fe** | Web UI + gọi API | prisma / Nest / migration (`26`) |
| **dev-mobile** | RN / offline | API Nest / portal CSS |
| **dev-be** | API + DB | polish JSX / RN |
| **QA** | Prod/local matrix thật | PASS không chạy; seed DB giả workflow |
| **QC** | Gate từ evidence | Promote thiếu AC |
| **devops** | Push + deploy poll | Unscoped commit |

Chi tiết: `26-DEV-LANES-WEB-MOBILE-BE.md`, `01-DELIVERY-PIPELINE.md`, `06-PM-ORCHESTRATION.md`, `roles/*.md`.  
Project: copy `templates/SUBAGENT_READ_MAP.md` → `docs/program/SUBAGENT_READ_MAP.md` + root `AGENTS.md`.

---

## 2. PM — khi nào được code trực tiếp

**Gate bắt buộc trước mọi `Write`/`StrReplace` vào `src/**`, `supabase/**`, `tests/**`:**

> Sponsor đã nói **đúng** một trong: `code trực tiếp` · `mày làm` · `push lên` · `giữ code` (đóng wave đã duyệt)?

| Sponsor nói | PM làm |
|-------------|--------|
| `code trực tiếp` / `mày làm` / `push lên` / `giữ code` | Dev lane (hoặc PM code **chỉ** wave đó); xong → quay PM |
| Screenshot + mô tả UI | **Task dev-fe** |
| `deploy đê` / `làm đi` / `ổn rồi` | **Dispatch** dev → QA → devops — **không** tự sửa file |
| Task “nhỏ”, “vài dòng”, UI polish | Vẫn **Task dev-fe** |

**Lời hứa “từ giờ chỉ điều phối” không thay gate.** Incident: `incidents/INC-PM-CODES-INSTEAD-OF-DISPATCH.md`.

---

## 3. Dispatch packet (mọi Task)

Copy `~/.cursor/templates/ROLE_DISPATCH_PROMPT.md`:

```text
work_item_id: W-...
scope_lane: ...
change_mode: ADD | REPLACE | REMOVE
must_keep: [...]
forbidden_paths: [...]
read_first: [ordered paths — xem project SUBAGENT_READ_MAP]
spec_read_ack: (dev/qa fill)
code_memory_required: true
exit_criteria: tests + evidence path + ack_status
residual_auto_fix: true
```

**1 UC = 1 sub-agent = 1 lane** — áp dụng cho **coding scope** sau khi spec đã khóa.  
**Khối research/design lớn** (inventory lớn, TechSpec depth, remaster nhiều UC): **cấm** 1 subagent ôm hết → mở **squad** đủ vị trí (`16-SQUAD-PARALLEL-ORCHESTRATION.md` · `templates/SQUAD_DISPATCH.md`). Prompt rộng → PM tách squad + seat + parallel Task.

---

## 4. Spec-first & additive

- Đổi **nghiệp vụ / workflow / schema** → SRS + tech-spec + sponsor confirm **trước** code.
- **UI polish / bug / i18n** → spec exempt.
- Mặc định **ADD** — không ẩn/xóa control cũ trừ khi sponsor REMOVE. Xem `03-ADDITIVE-ONLY.md`.
- **Chất lượng tài liệu (2026-07-20):** đọc **`13-BRD-SRS-TECHSPEC-QUALITY.md`** — SRS tiếng Việt đơn giản, failure-first, gắn phần mềm hiện tại; TechSpec/QC sau SRS confirm. Incident: `INC-SRS-HAPPY-PATH-ONLY-JARGON`.
- **Trace + comment (2026-07-20):** đọc **`14-TRACEABILITY-SRS-TECHSPEC-CODE.md`** — TechSpec có `ref_srs`; CODE-MEMORY 100% tiếng Việt; trước sửa đọc SRS→TS→comment; UPGRADE không đè nghiệp vụ 🟢.

---

## 5. Dev — SOLID & mapping (mọi repo)

> **Training SoT (chi tiết S/O/L/I/D + convention + checklist sub-agent):**  
> **`25-SOLID-AND-CODING-CONVENTION.md`** — §5 này chỉ là *bảng nhìn nhanh*.  
> **Phân lane FE web / mobile / BE:** **`26-DEV-LANES-WEB-MOBILE-BE.md`** + `roles/dev-*.md`.  
> Task `dev-*` bắt buộc `read_first` file `25` (+ `26`) + điền `solid_convention_ack` trong evidence.

| Layer | Trách nhiệm | Test |
|-------|-------------|------|
| `src/lib/**` | Logic thuần, map BR, args RPC | `*.test.ts` tên BR/UC |
| Hooks / flows | `*Flows.ts`, data fetch | `*.Flows.test.ts` mock `callRpc` |
| Components | Wire UI, `t('key')` only | Smoke / matrix QA |
| Migrations | GRANT + RLS + `search_path` | `*.migration.test.ts` |
| Edge | handler / validator / repo split | curl partner payload |

- File **>300 LOC** → split.
- **Type contract:** migration/enum ↔ hand types **cùng commit**.
- **@CODE-MEMORY** mọi file business — `04-CODE-MEMORY-JOURNAL.md` (field **SOLID** bắt buộc).
- **Neo đa loại file + slice** (CSS/route/env/CI/docs, không chỉ TS) — `22-ARTIFACT-NEO-AND-FEATURE-SLICE.md`; mỗi Story `docs/program/slices/<StoryID>.md`.
- UI: nhãn human, không UUID — `formatStaffPickerLabel` pattern.

---

## 6. QA — cách test (không phụ thuộc dự án)

### Bắt buộc

- `spec_read_ack` trong evidence.
- Matrix **PASS/FAIL từng hàng** + screenshot/probe JSON.
- Prod: ghi **bundle hash** `/assets/index-*.js`.
- `ack_status`: `READY_FOR_QC` hoặc `BLOCKED` + lý do.

### Cấm (E2E integrity)

- `supabase.from().update/insert` giả partner / paid / queue state.
- PASS chỉ vì unit test; không mở prod.
- Seed workflow thay UI/API production path.

### Mẫu matrix (áp dụng mọi wave)

| Loại | Cách |
|------|------|
| UI layout | Viewport cố định; đo width; footer visible without scrolling whole dialog |
| Regression có điều kiện | Test **đúng thứ tự** precondition (vd full cart trước khi assert disable — không test sau khi đã xóa data) |
| Prod fixture | MRNs/IDs **live** từ prod UI hoặc REST read — không file cũ |
| Read-only assert | GET/UI trước-sau; không mutate DB |
| Physical / onsite | `DEFERRED` + GWC ID — **không fake** |

---

## 7. QC — light gate

- Reconcile QA evidence ↔ probe ↔ screens.
- Independent vitest spot-check khi có lib thuần.
- **GO WITH CONDITIONS** khi code OK nhưng physical/onsite chưa làm — không block deploy FE.
- Residual P2 → PM dispatch cùng phiên; không “optional follow-up”.

---

## 8. Memory — đừng chỉ cập nhật từng mảnh

| Layer | Path | Ghi gì |
|-------|------|--------|
| **Global OS** | `_vibe-team-os/MEMORY.md` | Charter, incident class, cách team làm |
| **Project working** | `<repo>/.agentmemory/MEMORY.md` | Incidents + **session rollup** khi đóng chương trình lớn |
| **Bus (vertical)** | `<repo>/.cursor/team/AGENT_MESSAGE_BUS.md` | Mọi dispatch/handoff subagent |
| **Peer PM (horizontal)** | `<repo>/docs/program/PEER_PM_COLLAB.md` | Đồng điều hành giữa lead IDE/factory — SoT `_vibe-team-os/19-PEER-PM-COLLAB.md` |
| **Evidence** | `<repo>/docs/evidence/W-*.md` | SoT verify từng wave |

### Session rollup (bắt buộc khi sponsor hỏi “đã nhớ hết chưa?”)

Khi đóng **program / nhiều wave** trong một phiên, PM (hoặc PROCESS agent) append **một block rollup** vào project `MEMORY.md`:

- Pipeline đã chạy (không chỉ incident lẻ)
- Work items đóng / mở
- QA doctrine học được (pattern, không copy SRS)
- Prod bundle lineage
- `read_first` map trỏ file SRS project

**Không** thay thế SRS — **chỉ index + lesson learned.**

Incident: `incidents/INC-MEMORY-ROLLUP-INCREMENTAL.md`.

---

## 9. Signals → hành động PM (≤3 tool call đầu phiên)

| Signal | Làm ngay |
|--------|----------|
| `PASS_TO_PM` / `subagentStop` | Bus INTAKE + Task |
| `READY_FOR_QA` | devops verify deploy → QA |
| QA/QC Residual | Task owner — mọi item |
| User logout / “chạy lại wave dở” | Poll evidence + bus; resume stalled subagent |
| Sponsor “deploy” | devops lane — không PM code |

---

## 10. Bootstrap dự án mới

1. `node _vibe-team-os/scripts/bootstrap.mjs`
2. Copy/adapt `docs/PROJECT_CARD.md`, `docs/program/SUBAGENT_READ_MAP.md`
3. Đọc `00-SPONSOR-CHARTER.md` + file này
4. Project `.cursorrules` + `08-LOVABLE-SUPABASE-RULES.md` nếu stack Lovable/Supabase

---

## 11. Đọc thêm (theo vai)

| Vai | File |
|-----|------|
| PM + PO | `32-PM-PO-DUAL-ROLE.md`, `06-PM-ORCHESTRATION.md`, `roles/pm.md` |
| BA/SA | `02-SPEC-FIRST-GATE.md` |
| Dev | `04-CODE-MEMORY-JOURNAL.md`, `roles/dev-fe.md`, `roles/dev-be.md` |
| QA | `roles/qa.md`, `e2e-no-fake-db` rule |
| QC | `roles/qc.md` |

---

## 12. Baseline · Freeze · Triage (2026-06-28)

**Đọc:** `10-BASELINE-FREEZE-TRIAGE.md`

- Không vá từng case — dùng **Layer stack** + **Blast radius** + **Baseline contract**
- Sponsor OK → ghi FREEZE vào `PROJECT_CARD` § Baseline registry
- Bug mới: `templates/TRIAGE_INTAKE.md` **trước** `src/**`
- Incident class → `incidents/INC-*.md` (vd `INC-SID-PADDING-SCOPE-CREEP`)
- Preflight: `scripts/check-blast-radius.mjs` (copy vào repo qua bootstrap)

| Vai | Đọc thêm |
|-----|----------|
| PM | `10-BASELINE-FREEZE-TRIAGE.md`, `templates/TRIAGE_INTAKE.md` |
| Dev | `blast-radius.config.json` per repo |

---

## 13. Scope commit & deploy slice (2026-07-09)

**Sponsor:** kiểm soát phạm vi member + commit/deploy tách lane — **duy trì mọi dự án**.

| Bước | Làm |
|------|-----|
| Dispatch | `allowed_paths` + `must_keep` + `forbidden_paths` |
| Commit | Stage explicit paths only — không lẫn SID/specimen/docs khác lane |
| Deploy | `gh workflow run "Deploy to Server"` — verify `headSha` |
| UX reject | `skills/sponsor-ux-minimal-fix` — KEEP/REMOVE table từ sponsor screenshot |
| Correction | Wave `-02` supersede QA/QC wave sai |

**Đọc:** `skills/scope-controlled-delivery/SKILL.md` · `rules/team-scope-commit-deploy-slice.mdc` · `incidents/INC-COLLECT-UX-OVER-ENGINEER.md`

---

## 14. Squad parallel — chia nhóm + đủ vị trí (2026-07-21)

**Sponsor:** khối lớn không giao 1 member/subagent; chia nhóm; mỗi nhóm đủ role (BA-P / BA-D / SA / QA…) rồi Synth gộp.

| Việc | Đọc |
| --- | --- |
| Doctrine | `16-SQUAD-PARALLEL-ORCHESTRATION.md` |
| Packet | `templates/SQUAD_DISPATCH.md` |
| Rule | `rules/team-squad-parallel-orchestration.mdc` |
| TechSpec depth | `13` §3.4.11.E |
