import transportModel from '../../models/transport/transportModel.js';
import {
    createRoute,
    getRouteById,
    getRoutesByUserId,
    updateRoute,
    deleteRoute
} from '../../models/transport/routeModel.js';
import { ErrorFactory } from '../../utils/AppError.js';

/**
 * @openapi
 * /api/transport/routes:
 *   post:
 *     summary: Create a new transport route for the current user.
 *     tags:
 *       - Transport
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_station: 
 *                 type: string
 *               end_station:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created a new route.
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Internal server error.
 */
export const createRouteController = async (req, res, next) => {
    try {
        const { name, start_station, end_station } = req.body;
        const userId = req.user.id;

        const stationCodes = transportModel.getStationCodes();
        if (!stationCodes.includes(start_station) || !stationCodes.includes(end_station)) {
            throw ErrorFactory.validation("Invalid station code provided");
        }

        const newRoute = await createRoute(userId, name, start_station, end_station);
        res.status(201).json({ success: true, data: newRoute });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/transport/routes/{id}:
 *   get:
 *     summary: Get a specific transport route by ID.
 *     tags:
 *       - Transport
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the route.
 *       404:
 *         description: Route not found.
 *       500:
 *         description: Internal server error.
 */
export const getRouteController = async (req, res, next) => {
    try {
        const routeId = req.params.id;
        const route = await getRouteById(routeId);
        if (!route) {
            throw ErrorFactory.notFound("Route");
        }
        res.status(200).json({ success: true, data: route });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/transport/routes:
 *   get:
 *     summary: Get all transport routes for the current user.
 *     tags:
 *       - Transport
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all routes for the user.
 *       500:
 *         description: Internal server error.
 */
export const getUserRoutesController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const routes = await getRoutesByUserId(userId);
        res.status(200).json({ success: true, data: routes });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/transport/routes/{id}:
 *   put:
 *     summary: Update a specific transport route.
 *     tags:
 *       - Transport
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               start_station:
 *                 type: string
 *               end_station:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated the route.
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Route not found.
 *       500:
 *         description: Internal server error.
 */
export const updateRouteController = async (req, res, next) => {
    try {
        const routeId = req.params.id;
        const { name, start_station, end_station } = req.body;

        const stationCodes = transportModel.getStationCodes();
        if (!stationCodes.includes(start_station) || !stationCodes.includes(end_station)) {
            throw ErrorFactory.validation("Invalid station code provided");
        }

        const success = await updateRoute(routeId, name, start_station, end_station);
        if (!success) {
            throw ErrorFactory.notFound("Route");
        }
        res.status(200).json({ success: true, message: "Route updated successfully." });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/transport/routes/{id}:
 *   delete:
 *     summary: Delete a specific transport route.
 *     tags:
 *       - Transport
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted the route.
 *       404:
 *         description: Route not found.
 *       500:
 *         description: Internal server error.
 */
export const deleteRouteController = async (req, res, next) => {
    try {
        const routeId = req.params.id;
        const success = await deleteRoute(routeId);
        if (!success) {
            throw ErrorFactory.notFound("Route");
        }
        res.status(200).json({ success: true, message: "Route deleted successfully." });
    } catch (error) {
        next(error);
    }
};
