import transportModel from "../../models/transport/transportModel.js";

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
export const getStationCodeNameMap = (req, res) => {
  const codeNameMap = transportModel.getStationCodeNameMap()
  return res.status(200).json({
    codeNameMap: codeNameMap,
  })
}

/**
 * @openapi
 * /api/transport/shortest:
 *   get:
 *     summary: Find the shortest path between two stations.
 *     tags:
 *       - Transport
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
export const getShortestPath = (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: "Both start and end stations are required." });
    }

    if (start === end) {
      return res.status(400).json({ error: "Both start and end stations are the same." });
    }

    const pathInfo = transportModel.findShortestPath(start, end);

    if (!pathInfo) {
        return res.status(404).json({ error: "One or both stations not found." });
    }

    if (pathInfo.distance === Infinity) {
        return res.status(404).json({ error: `No path found between ${start} and ${end}.` });
    }

    const pathWithNames = pathInfo.path.map(code => ({
        code,
        name: transportModel.getStationByCode(code)?.[code].name
    }));

    res.json({
        ...pathInfo,
        path: pathWithNames
    });
};
