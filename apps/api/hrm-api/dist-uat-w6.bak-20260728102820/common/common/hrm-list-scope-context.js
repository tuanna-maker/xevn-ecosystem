"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHrmListScopeContext = toHrmListScopeContext;
function toHrmListScopeContext(tenantId) {
    if (typeof tenantId !== 'string') {
        return undefined;
    }
    const trimmed = tenantId.trim();
    return trimmed ? { tenantId: trimmed } : undefined;
}
//# sourceMappingURL=hrm-list-scope-context.js.map