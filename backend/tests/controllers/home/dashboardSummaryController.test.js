import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardSummary } from "../../../controllers/home/dashboardSummaryController.js";

function createMockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe("getDashboardSummary controller", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1 } };
    res = createMockRes();
  });

  it("should return a summary object with all features", async () => {
    await getDashboardSummary(req, res);
    expect(res.json).toHaveBeenCalled();
    const summary = res.json.mock.calls[0][0];
    expect(summary).toHaveProperty("meals");
    expect(summary).toHaveProperty("events");
    expect(summary).toHaveProperty("medications");
    expect(summary).toHaveProperty("nutrition");
    expect(summary).toHaveProperty("transport");
  });
}); 