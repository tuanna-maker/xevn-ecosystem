# CLAUDE.md

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
