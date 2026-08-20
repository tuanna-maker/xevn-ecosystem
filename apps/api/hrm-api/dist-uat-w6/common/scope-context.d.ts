type ScopeContext = {
    tenantId: string;
    companyId: string;
};
export declare function resolveScopeContext(authorization: string | undefined, requested: {
    tenantId?: string;
    companyId?: string;
}): ScopeContext;
export {};
