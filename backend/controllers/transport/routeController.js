import transportModel from '../../models/transport/transportModel.js';
import {
    createRoute,
    getRouteById,
    getRoutesByUserId,
    updateRoute,
    deleteRoute
} from '../../models/transport/routeModel.js';

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
export const createRouteController = async (req, res) => {
  const { name, start_station, end_station } = req.body;
    const userId = req.user.id;

    if (!name || !start_station || !end_station) {
        return res.status(400).json({ error: 'Name, start and end stations are required.' });
    }

    const stationCodes = transportModel.getStationCodes();
    if (!stationCodes.includes(start_station) || !stationCodes.includes(end_station)) {
        return res.status(400).json({ error: 'Invalid station code.' });
    }

    try {
        const newRoute = await createRoute(userId, name, start_station, end_station);
        res.status(201).json(newRoute);
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({ error: 'Failed to create route.' });
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
export const getRouteController = async (req, res) => {
    try {
        const routeId = Number(req.params.id);
        const route = await getRouteById(routeId);
        if (!route) {
            return res.status(404).json({ error: 'Route not found.' });
        }
        res.status(200).json(route);
    } catch (error) {
        console.error('Error getting route:', error);
        res.status(500).json({ error: 'Failed to get route.' });
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
export const getUserRoutesController = async (req, res) => {
    const userId = req.user.id;

    try {
        const routes = await getRoutesByUserId(userId);
        res.status(200).json(routes);
    } catch (error) {
        console.error('Error getting user routes:', error);
        res.status(500).json({ error: 'Failed to get user routes.' });
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
export const updateRouteController = async (req, res) => {
    const routeId = parseInt(req.params.id);
    const { name, start_station, end_station } = req.body;

    if (!name || !start_station || !end_station) {
        return res.status(400).json({ error: 'Name, start and end stations are required.' });
    }

    const stationCodes = transportModel.getStationCodes();
    if (!stationCodes.includes(start_station) || !stationCodes.includes(end_station)) {
        return res.status(400).json({ error: 'Invalid station code.' });
    }

    try {
        const success = await updateRoute(routeId, name, start_station, end_station);
        if (!success) {
            return res.status(404).json({ error: 'Route not found or not updated.' });
        }
        res.status(200).json({ message: 'Route updated successfully.' });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(500).json({ error: 'Failed to update route.' });
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
export const deleteRouteController = async (req, res) => {
    const routeId = parseInt(req.params.id);

    try {
        const success = await deleteRoute(routeId);
        if (!success) {
            return res.status(404).json({ error: 'Route not found.' });
        }
        res.status(200).json({ message: 'Route deleted successfully.' });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ error: 'Failed to delete route.' });
    }
};
