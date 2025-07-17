
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sql from "mssql";
import {
    createRoute,
    getRouteById,
    getRoutesByUserId,
    updateRoute,
    deleteRoute
} from "../../../models/transport/routeModel.js";

vi.mock("mssql", () => ({
  default: {
    connect: vi.fn(),
  }
}));


describe("Route Model", () => {
    let mockRequest;

    beforeEach(() => {
        mockRequest = {
            input: vi.fn(),
            query: vi.fn(),
        };
        sql.connect.mockResolvedValue({ request: () => mockRequest });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should create a new route", async () => {
        const userId = 1;
        const startStation = "stationA";
        const endStation = "stationB";
        const expectedRoute = { id: 1, user_id: userId, start_station: startStation, end_station: endStation };
        mockRequest.query.mockResolvedValue({ recordset: [{ id: 1 }] });

        const newRoute = await createRoute(userId, startStation, endStation);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("userId", sql.Int, userId);
        expect(mockRequest.input).toHaveBeenCalledWith("startStation", sql.VarChar, startStation);
        expect(mockRequest.input).toHaveBeenCalledWith("endStation", sql.VarChar, endStation);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(newRoute).toEqual(expectedRoute);
    });

    it("should get a route by ID", async () => {
        const routeId = 1;
        const expectedRoute = { id: routeId, user_id: 1, start_station: "A", end_station: "B" };
        mockRequest.query.mockResolvedValue({ recordset: [expectedRoute] });

        const route = await getRouteById(routeId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("routeId", sql.Int, routeId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(route).toEqual(expectedRoute);
    });

    it("should get all routes for a user", async () => {
        const userId = 1;
        const expectedRoutes = [{ id: 1, user_id: userId, start_station: "A", end_station: "B" }];
        mockRequest.query.mockResolvedValue({ recordset: expectedRoutes });

        const routes = await getRoutesByUserId(userId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("userId", sql.Int, userId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(routes).toEqual(expectedRoutes);
    });

    it("should update a route", async () => {
        const routeId = 1;
        const startStation = "newA";
        const endStation = "newB";
        mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

        const success = await updateRoute(routeId, startStation, endStation);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("routeId", sql.Int, routeId);
        expect(mockRequest.input).toHaveBeenCalledWith("startStation", sql.VarChar, startStation);
        expect(mockRequest.input).toHaveBeenCalledWith("endStation", sql.VarChar, endStation);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(success).toBe(true);
    });

    it("should delete a route", async () => {
        const routeId = 1;
        mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

        const success = await deleteRoute(routeId);

        expect(sql.connect).toHaveBeenCalled();
        expect(mockRequest.input).toHaveBeenCalledWith("routeId", sql.Int, routeId);
        expect(mockRequest.query).toHaveBeenCalled();
        expect(success).toBe(true);
    });
});
