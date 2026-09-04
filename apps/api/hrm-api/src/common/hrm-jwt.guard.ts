/**
 * @CODE-MEMORY
 * Purpose:    JWT guard for HRM API. Verifies RS256 token issued by xbos-api.
 *             Attaches req.hrmUser = { tenantId, userId, email } after verification.
 *             Falls back to dev mode if HRM_JWT_DEV_BYPASS=true (local only).
 * must_keep:  Always verify token; never skip in production.
 * Coded:      2026-08-22
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import * as jwt from "jsonwebtoken";

@Injectable()
export class HrmJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { hrmUser: unknown }>();

    // Dev bypass — ONLY for local dev, never in prod
    if (process.env.HRM_JWT_DEV_BYPASS === "true") {
      req.hrmUser = {
        tenantId: process.env.HRM_DEV_TENANT_ID ?? "dev-tenant",
        userId: "dev-user",
        email: "dev@xevn.vn",
      };
      return true;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing Bearer token");
    }

    const token = authHeader.slice(7);
    try {
      const publicKey = process.env.HRM_JWT_PUBLIC_KEY?.replace(/\\n/g, "\n") ?? "";
      const payload = jwt.verify(token, publicKey, { algorithms: ["RS256"] }) as Record<
        string,
        unknown
      >;
      req.hrmUser = {
        tenantId: String(payload["tenantId"] ?? payload["tenant_id"] ?? ""),
        userId: String(payload["sub"] ?? ""),
        email: String(payload["email"] ?? ""),
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
