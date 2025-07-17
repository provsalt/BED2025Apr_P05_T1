import { describe, it, expect, vi } from "vitest";
import { getStationCodeNameMap, getShortestPath } from "../../../controllers/transport/transportController.js";
import transportModel from "../../../models/transport/transportModel.js";

describe("Transport Controller", () => {
  const testStationCode1 = "NS1 EW24";
  const testStationCode2 = "NS2";

  it("should get station code-name map", () => {
    const mockCodeNameMap = { [testStationCode1]: "Jurong East", [testStationCode2]: "Bukit Batok" };
    vi.spyOn(transportModel, "getStationCodeNameMap").mockReturnValue(mockCodeNameMap);

    const mockReq = {};
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    getStationCodeNameMap(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ codeNameMap: mockCodeNameMap });
  });

  it("should return 400 if start or end stations are missing", () => {
    const mockReq = { query: {} };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    getShortestPath(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Both start and end stations are required." });
  });

  it("should return 400 if start and end stations are the same", () => {
    const mockReq = { query: { start: testStationCode1, end: testStationCode1 } };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    getShortestPath(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Both start and end stations are the same." });
  });

  it("should return 404 if no path is found", () => {
    vi.spyOn(transportModel, "findShortestPath").mockReturnValue({ path: [], distance: Infinity });

    const mockReq = { query: { start: testStationCode1, end: testStationCode2 } };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    getShortestPath(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: `No path found between ${testStationCode1} and ${testStationCode2}.` });
  });

  it("should return shortest path with station names", () => {
    const mockPathInfo = {
      path: [testStationCode1, testStationCode2],
      distance: 1
    };
    vi.spyOn(transportModel, "findShortestPath").mockReturnValue(mockPathInfo);
    vi.spyOn(transportModel, "getStationByCode")
      .mockReturnValueOnce({ [testStationCode1]: { name: "Jurong East" } })
      .mockReturnValueOnce({ [testStationCode2]: { name: "Bukit Batok" } });

    const mockReq = { query: { start: testStationCode1, end: testStationCode2 } };
    const mockRes = {
      json: vi.fn()
    };

    getShortestPath(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      ...mockPathInfo,
      path: [
        { code: testStationCode1, name: "Jurong East" },
        { code: testStationCode2, name: "Bukit Batok" }
      ]
    });
  });
});