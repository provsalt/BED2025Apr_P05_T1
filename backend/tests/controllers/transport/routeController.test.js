
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    createRouteController,
    getRouteController,
    getUserRoutesController,
    updateRouteController,
    deleteRouteController
} from "../../../controllers/transport/routeController.js";
import * as transportModel from "../../../models/transport/transportModel.js";
import * as routeModel from "../../../models/transport/routeModel.js";

describe("Route Controller", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { id: 1 }
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("createRouteController", () => {
        it("should create a route and return 201", async () => {
            req.body = { name: "Work", start_station: "A", end_station: "B" };
            const newRoute = { id: 1, ...req.body, user_id: req.user.id };
            vi.spyOn(transportModel.default, "getStationCodes").mockReturnValue(["A", "B", "C"]);
            vi.spyOn(routeModel, "createRoute").mockResolvedValue(newRoute);

            await createRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(newRoute);
        });

        it("should return 400 if station code is invalid", async () => {
            req.body = { name: "Work", start_station: "INVALID", end_station: "B" };
            vi.spyOn(transportModel.default, "getStationCodes").mockReturnValue(["A", "B", "C"]);

            await createRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid station code." });
        });

        it("should return 400 if name, start or end station is missing", async () => {
            req.body = { start_station: "A" };

            await createRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe("getRouteController", () => {
        it("should get a route and return 200", async () => {
            req.params.id = 1;
            const route = { id: 1, start_station: "A", end_station: "B", user_id: 1 };
            vi.spyOn(routeModel, "getRouteById").mockResolvedValue(route);

            await getRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(route);
        });

        it("should return 404 if route not found", async () => {
            req.params.id = 1;
            vi.spyOn(routeModel, "getRouteById").mockResolvedValue(null);

            await getRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("getUserRoutesController", () => {
        it("should get all user routes and return 200", async () => {
            const routes = [{ id: 1, start_station: "A", end_station: "B", user_id: 1 }];
            vi.spyOn(routeModel, "getRoutesByUserId").mockResolvedValue(routes);

            await getUserRoutesController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(routes);
        });
    });

    describe("updateRouteController", () => {
        it("should update a route and return 200", async () => {
            req.params.id = 1;
            req.body = { name: "Home", start_station: "C", end_station: "D" };
            vi.spyOn(transportModel.default, "getStationCodes").mockReturnValue(["A", "B", "C", "D"]);
            vi.spyOn(routeModel, "updateRoute").mockResolvedValue(true);

            await updateRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Route updated successfully." });
        });

        it("should return 400 if station code is invalid", async () => {
            req.params.id = 1;
            req.body = { name: "Home", start_station: "INVALID", end_station: "D" };
            vi.spyOn(transportModel.default, "getStationCodes").mockReturnValue(["A", "B", "C", "D"]);

            await updateRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Invalid station code." });
        });

        it("should return 404 if route to update not found", async () => {
            req.params.id = 1;
            req.body = { name: "Home", start_station: "C", end_station: "D" };
            vi.spyOn(transportModel.default, "getStationCodes").mockReturnValue(["A", "B", "C", "D"]);
            vi.spyOn(routeModel, "updateRoute").mockResolvedValue(false);

            await updateRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("deleteRouteController", () => {
        it("should delete a route and return 200", async () => {
            req.params.id = 1;
            vi.spyOn(routeModel, "deleteRoute").mockResolvedValue(true);

            await deleteRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Route deleted successfully." });
        });

        it("should return 404 if route to delete not found", async () => {
            req.params.id = 1;
            vi.spyOn(routeModel, "deleteRoute").mockResolvedValue(false);

            await deleteRouteController(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
