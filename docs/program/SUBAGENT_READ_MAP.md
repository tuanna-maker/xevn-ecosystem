# SUBAGENT_READ_MAP — xevn-ecosystem

**Purpose:** Sub-agent chỉ đọc đúng file. Template gốc: `_vibe-team-os/templates/SUBAGENT_READ_MAP.md`.  
**Lane Dev:** `_vibe-team-os/26-DEV-LANES-WEB-MOBILE-BE.md`

PM mọi Task phải có `read_first` / `do_not_read` / `allowed_paths` / `forbidden_paths`.

---

## 0. Trước mọi Task

1. `AGENTS.md`  
2. File này  
3. Bus tail `docs/program/AGENT_MESSAGE_BUS.md`  
4. `_vibe-team-os/roles/<role>.md`  
5. PM mới: `_vibe-team-os/PM-START-HERE.md` (theo tình huống — không đọc hết OS)

---

## 1. Theo role

| Role | OS (tối đa) | Project |
|------|-------------|---------|
| pm | `PM-START-HERE` · `09` · `06` · tình huống **M** (`28`/`29`) | Bus · `TEAM_WORKING_NOW` · `PROGRAM_JOURNEY_MAP` · UF matrix · `OS_STD_AND_CODING_ACTION_PLAN` |
| dev-fe | `26` · `25` · **`28`** · `roles/dev-fe` · `04` | SRS UC · API contract · slice · CODE-MEMORY FE |
| dev-mobile | `26` · `25` · **`28`** · `roles/dev-mobile` | SRS mobile · API · `apps/mobile` |
| dev-be | `26` · `25` · **`28`** · `12` · `roles/dev-be` | DB schema/prisma · OpenAPI · Nest module · SRS bước |
| qa | `roles/qa` · **`30`** · **`31`** (test log) | `docs/qa/USER_FLOW_*` · HDSD · U65/U76/U78 · `*-test-log.md/json` |
| qc | `roles/qc` · spot `28`/`29` khi gate OS | evidence pack |
| ba-docs / ba-process | `13` · `02` | `docs/brand-new-documents-*` · SRS/BRD |
| sa | `13` · `02` · `14` · **`28`** · **`29`** (Team Claude) | TechSpec · ADR · slices |
| devops | `roles/devops` | `docs/ops/*` · deploy compose |
| Team Claude (external) | **`29`** · `25` · `26` · **`28`** · `27` (init ≠ lane) | slice · `allowed_paths` · NFD path lock |

---

## 2. SoT path (XeVN)

| Artifact | Path |
|----------|------|
| Brand-new docs pack (QC GWC) | `docs/brand-new-documents-20270801/{BRD,SRS,TECH_SPEC,DB_DESIGN,API_CONTRACT}_NEW.md` |
| FE/BE display-ready SoC | `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md` |
| Team Claude external lane | `_vibe-team-os/29-TEAM-CLAUDE-EXTERNAL-CODING-LANE.md` |
| HDSD QA + case + neo SRS | `_vibe-team-os/30-HDSD-ALIGNED-QA-AND-SRS-BRANCH-TRACE.md` |
| World-standard Test Log | `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` |
| **SOLID + convention enforcement (dispatch)** | `docs/program/knowledge/DEV_SOLID_AND_OS_CONVENTION_ENFORCEMENT.md` |
| OS std → coding plan | `docs/program/OS_STD_AND_CODING_ACTION_PLAN.md` |
| HRM SRS (legacy SoT) | `docs/hrm/SRS.md` (+ module docs) |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` |
| HDSD REC inventory | `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` |
| Path lock | `docs/program/PATH_CANONICAL_LOCK.md` |
| Evidence QA | `docs/qa/evidence/` |
| Evidence ops | `docs/ops/evidence/` |
| Prisma HRM | `apps/api/hrm-api` / packages schema (theo tree thực tế Task) |
| Portal / HRM FE | `apps/web/**` |
| Mobile | `apps/mobile/**` |

Khi brand-new `DB_DESIGN_NEW` / `API_CONTRACT_NEW` đã confirm → Dev **ưu tiên** các file đó + `ref_srs`.

---

## 3. Lane module (hay dùng)

### LANE: `FE_WEB_HRM`

| | |
|--|--|
| read_first | UC HRM · API endpoint · `apps/web/hrm/**` CODE-MEMORY · `26` |
| allowed | `apps/web/**` (thu hẹp Task) |
| forbidden | `apps/api/**`, prisma migrations, `apps/mobile/**` |
| verify | vitest + browser U65 `:8088` |

### LANE: `FE_WEB_XBOS` / portal

| | |
|--|--|
| read_first | UC XBOS · workflow/inbox · portal routes |
| forbidden | hrm-api prisma; mobile |

### LANE: `BE_HRM` / `BE_XBOS`

| | |
|--|--|
| read_first | DB_DESIGN / prisma model · API_DESIGN/OpenAPI · Nest module · scope ladder ADR |
| allowed | `apps/api/**`, prisma, openapi |
| forbidden | `apps/web/**/components/**`, RN screens |
| verify | jest + scope parity list↔get |

### LANE: `MOBILE`

| | |
|--|--|
| read_first | UC-M* · `docs/hrm/SRS_MOBILE.md` · **`docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md`** · API_DESIGN · `apps/mobile/**` |
| forbidden | api/prisma/web components |
| verify | unit + `qa-device` cho J-MOB-* |

### LANE: `DOCS_BRAND_NEW`

| | |
|--|--|
| read_first | `_vibe-team-os/13` · `.claude/skills/enterprise-docs/SKILL.md` · `docs/brand-new-documents-20270801/` |
| allowed | `docs/brand-new-documents-20270801/**`, evidence ba |
| forbidden | `apps/**` |

### LANE: `OPS_VPS`

| | |
|--|--|
| read_first | deploy runbook · evidence ops trước |
| allowed | deploy scripts, compose, ops evidence |
| forbidden | đổi BR nghiệp vụ trong `apps/**` trừ hotfix có bus |

---

## 4. Claude / Cursor init artifacts

| Path | Khi dùng |
|------|----------|
| `CLAUDE.md` | Session Claude Code |
| `.claude/skills/enterprise-docs` | Viết BRD/SRS/TechSpec brand-new |
| `.claude/skills/code-reviewer` | Review trước commit |
| `.cursor/rules/*.mdc` | Always-on Cursor — bổ sung, không thay map này |
| `.agentmemory/` | Incident (nếu bật) — xem OS `05` |

---

## 5. `do_not_read` mặc định (giảm nhiễu)

- Toàn bộ `_vibe-team-os/case-studies/**` trừ PM ghi rõ case  
- `_vibe-team-os/00`–`24` không liên quan tình huống (PM dùng `PM-START-HERE`)  
- HDSD PDF/HTML build artifacts khi đang code API  
- NFC/ASCII shadow paths ngoài canonical  

---

## 6. Handoff FE ↔ BE

Xem `_vibe-team-os/26` §3. API_DESIGN khóa trước khi FE bind; thiếu contract → `PASS_TO_BA` / sa, không đoán.
