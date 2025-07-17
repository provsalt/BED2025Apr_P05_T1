import { describe, it, expect } from "vitest";
import transportModel from "../../../models/transport/transportModel.js";

describe("Transport Model", () => {
  const testStationCode1 = "NS1 EW24";
  const testStationCode2 = "NS2";

  it("should return all station names", () => {
    const stationNames = transportModel.getStationNames();
    expect(stationNames).toBeInstanceOf(Array);
    expect(stationNames.length).toBeGreaterThan(0);
    expect(stationNames).toContain("Jurong East");
  });

  it("should return all station codes", () => {
    const stationCodes = transportModel.getStationCodes();
    expect(stationCodes).toBeInstanceOf(Array);
    expect(stationCodes.length).toBeGreaterThan(0);
    expect(stationCodes).toContain(testStationCode1);
  });

  it("should find shortest path between two stations", () => {
    const pathInfo = transportModel.findShortestPath(testStationCode1, testStationCode2);
    
    expect(pathInfo).toBeTruthy();
    expect(pathInfo.path).toBeInstanceOf(Array);
    expect(pathInfo.distance).toBeGreaterThanOrEqual(0);
  });

  it("should return null for non-existent stations", () => {
    const pathInfo = transportModel.findShortestPath("INVALID", "INVALID2");
    expect(pathInfo).toBeNull();
  });

  it("should get station code-name map", () => {
    const codeNameMap = transportModel.getStationCodeNameMap();
    expect(codeNameMap).toBeInstanceOf(Object);
    expect(Object.keys(codeNameMap).length).toBeGreaterThan(0);
    expect(codeNameMap[testStationCode1]).toBe("Jurong East");
  });

  it("should get station by name", () => {
    const stationName = "Jurong East";
    const station = transportModel.getStationByName(stationName);
    
    expect(station).toBeTruthy();
    const stationCode = Object.keys(station)[0];
    expect(station[stationCode].name).toBe(stationName);
  });

  it("should get station by code", () => {
    const station = transportModel.getStationByCode(testStationCode1);
    
    expect(station).toBeTruthy();
    expect(Object.keys(station)[0]).toBe(testStationCode1);
    expect(station[testStationCode1].name).toBe("Jurong East");
  });

  it("should return null for non-existent station code", () => {
    const station = transportModel.getStationByCode("INVALID");
    expect(station).toBeNull();
  });
});