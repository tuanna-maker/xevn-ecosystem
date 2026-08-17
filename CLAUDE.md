hello claude abc abc abc

## Agent entry (đọc trước)

1. **`AGENTS.md`** — vai trò PM vs Dev lanes  
2. **`docs/program/SUBAGENT_READ_MAP.md`** — chỉ đọc file theo role (không đọc hết `_vibe-team-os`)  
3. Path lock: **`docs/program/PATH_CANONICAL_LOCK.md`** (NFD `Tài liệu` only)  
4. OS doctrine khi cần: `_vibe-team-os/PM-START-HERE.md` · `26-DEV-LANES-WEB-MOBILE-BE.md` · `25-SOLID-AND-CODING-CONVENTION.md`
5. **Cuốn chiếu Claude:** `docs/program/TEAM_CLAUDE_ROLLING_QUEUE.md` — sau mỗi WI DONE → đọc queue kế **ngay**, không hỏi sponsor. `.claude/skills/enterprise-docs` · `.claude/skills/code-reviewer`

## Project Overview
XeVN Ecosystem OS — centralized multi-tenant HR/operations platform for XeVN Group.
Stack: Node.js 20+ + NestJS, React 18+ + Vite + React Native 0.76+, PostgreSQL 16+ + Prisma, Redis 7+, Turborepo + pnpm.

## Runtime Ports (Docker Compose)
- portal-fe: http://host:8088/command-center
- hrm-fe: http://host:8080/hr/
- hrm-be: http://host:3001/api/hrm
- xbos-fe: http://host:5173
- xbos-be: http://host:3002/api/xbos

## Key Paths
- Code: apps/ (portal-fe, hrm-fe, hrm-be, xbos-fe, xbos-be), packages/
- Deploy: deploy/xevn-ecosystem/
- Docs: docs/brand-new-documents-20270801/ (BRD/SRS/TECH_SPEC/DB/API — Vietnamese, enterprise-grade)

## Multi-Tenancy
- Every DB query filters by tenant_id via DAL
- JWT carries tenantId + membershipId; X-Tenant-ID header must match
- Soft-delete only; hard-delete forbidden
- Platform catalog rows cannot be hard-deleted by tenants

## Auth
- Tokens issued by xbos-api RBAC engine only
- RS256 JWT + rotating refresh tokens
- Redis blacklist revocation (keyed by jti)
- Lockout: 5 failed attempts -> 30-min cooldown

## Events
- Cross-module comms via named events (at-least-once delivery)
- Direct DB access across service boundaries prohibited
- Dead-letter queue for failed dispatches

## Commands
- pnpm install (root)
- pnpm dev (root) — all services
- pnpm dev --filter hrm-be — single service
- pnpm build (root)
- pnpm test (root)

## Path lock (canonical NFD)
Only work in: C:\Users\ADMIN\OneDrive\Ta\u0300i li\u00EA\u0323u\Vibe Coding\projects\xevn-ecosystem
Forbidden: OneDrive\T\u00E0i li\u1EC7u\... (NFC) and OneDrive\Tai lieu\... (ASCII)
Verify: cd this dir && test -d .git && test -d apps
