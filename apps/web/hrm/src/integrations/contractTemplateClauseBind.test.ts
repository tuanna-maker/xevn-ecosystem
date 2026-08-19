import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  putContractTemplateClauses,
  syncContractTemplateClauseBind,
  updateContractTemplate,
} from "./hrmApi";

describe("syncContractTemplateClauseBind (PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          success: true,
          code: "HRM-CTR-TPL-200",
          data: {
            id: "tpl-test-id",
            clauses: [{ id: "clause-uuid-a" }, { id: "clause-uuid-b" }],
          },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("PUT …/contract-templates/:id/clauses with ordered clause_ids (junction SoT)", async () => {
    await syncContractTemplateClauseBind("tpl-test-id", "main", [
      "clause-uuid-a",
      "clause-uuid-b",
    ]);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/contracts-insurance/contract-templates/tpl-test-id/clauses");
    expect(url).toContain("company_id=main");
    expect(url).not.toContain("/api/hrm/core/");
    expect(init.method).toBe("PUT");
    const body = JSON.parse(String(init.body)) as { clause_ids?: string[] };
    expect(body.clause_ids).toEqual(["clause-uuid-a", "clause-uuid-b"]);
  });

  it("putContractTemplateClauses is the physical bind client", async () => {
    await putContractTemplateClauses("tpl-test-id", "main", ["clause-uuid-a"]);
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/clauses?");
    expect(init.method).toBe("PUT");
  });
});

describe("updateContractTemplate PATCH (PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          success: true,
          code: "HRM-CTR-TPL-200",
          data: { id: "tpl-office-id", template_code: "XEVN_FT_12M_OFFICE" },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("R-FE-CORE-09D-PATCH-COMPANY-ID — company_id query only; body omits company_id", async () => {
    await updateContractTemplate("tpl-office-id", {
      company_id: "main",
      name_vi: "HĐ văn phòng 12 tháng",
      pack_code: "IT_OFFICE",
      layout_json: { clause_order: ["clause-uuid-a"] },
      status: "active",
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("PATCH");
    expect(url).toContain("/contracts-insurance/contract-templates/tpl-office-id");
    expect(url).toContain("company_id=main");
    expect(url).not.toContain("/api/hrm/core/");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).not.toHaveProperty("company_id");
    expect(body.name_vi).toBe("HĐ văn phòng 12 tháng");
    expect(body.pack_code).toBe("IT_OFFICE");
    expect(body.status).toBe("active");
  });
});
