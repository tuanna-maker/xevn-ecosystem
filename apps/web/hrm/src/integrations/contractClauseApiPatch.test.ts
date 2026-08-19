import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateContractClause } from "./hrmApi";

describe("updateContractClause PATCH scope (PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          success: true,
          code: "HRM-CTR-CL-200",
          data: { id: "clause-test-id" },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends company_id as query only, not in JSON body", async () => {
    await updateContractClause("4fed201f-12a6-4464-a466-e37aa5b56dfd", "main", {
      title_vi: "Tiêu đề",
      body_vi: "Draft body v2",
      clause_group: "GENERAL",
      apply_to_packs: ["GENERAL"],
      mandatory: false,
      status: "draft",
    });

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/contract-clauses/4fed201f-12a6-4464-a466-e37aa5b56dfd");
    expect(url).toContain("company_id=main");
    expect(init.method).toBe("PATCH");
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body).not.toHaveProperty("company_id");
    expect(body.body_vi).toBe("Draft body v2");
  });
});
