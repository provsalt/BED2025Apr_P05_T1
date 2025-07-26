import transportModel from "../../models/transport/transportModel.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/transport/stations:
 *   get:
 *     summary: Get a map of station codes to station names.
 *     tags:
 *       - Transport
 *     responses:
 *       200:
 *         description: Successfully retrieved the station code-name map.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 codeNameMap:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                   description: An object where keys are station codes and values are station names.
 *       500:
 *         description: Internal server error.
 */
export const getStationCodeNameMap = (req, res, next) => {
  try {
    const codeNameMap = transportModel.getStationCodeNameMap();
    return res.status(200).json({
      codeNameMap: codeNameMap,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/transport/shortest:
 *   get:
 *     summary: Find the shortest path between two stations.
 *     tags:
 *       - Transport
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *         required: true
 *         description: The code of the starting station.
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *         required: true
 *         description: The code of the ending station.
 *     responses:
 *       200:
 *         description: Successfully retrieved the shortest path information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 distance:
 *                   type: number
 *                   description: The distance of the shortest path.
 *                 path:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         description: The station code.
 *                       name:
 *                         type: string
 *                         description: The station name.
 *                   description: An array of station objects representing the shortest path.
 *       400:
 *         description: Bad request, e.g., missing start/end stations or start and end stations are the same.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: One or both stations not found, or no path found between them.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 */
export const getShortestPath = (req, res, next) => {
    try {
        const { start, end } = req.query;

        const pathInfo = transportModel.findShortestPath(start, end);

        if (!pathInfo) {
            throw ErrorFactory.notFound("Station");
        }

        if (pathInfo.distance === Infinity) {
            throw ErrorFactory.notFound(`Path between ${start} and ${end}`);
        }

        const pathWithNames = pathInfo.path.map(code => ({
            code,
            name: transportModel.getStationByCode(code)?.[code].name
        }));

        res.json({
            ...pathInfo,
            path: pathWithNames
        });
    } catch (error) {
        next(error);
    }
};
