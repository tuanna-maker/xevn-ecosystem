type JwtPayload = {
    iss?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
};
export type InternalJwtPayload = JwtPayload & Record<string, unknown>;
export declare function getVerifiedInternalJwtPayload(authorizationHeader?: string): InternalJwtPayload | null;
export declare function extractBearerToken(rawAuthorization?: string): string | undefined;
export declare function resolveAuthorizationHeader(authorizationHeader?: string, headers?: Record<string, unknown>): string | undefined;
export declare function normalizeAuthorizationHeaderInPlace(headers: Record<string, unknown>): void;
export declare function isAuthorizedInternalRequest(authorizationHeader?: string, internalApiKey?: string): boolean;
export {};
