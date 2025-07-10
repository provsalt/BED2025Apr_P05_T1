import transportModel from "../../models/transport/transportModel.js";

export const getStationCodes = (req, res) => {
  const codes = transportModel.getStationCodes()
  return res.status(200).json({
    codes: codes,
  })
}

export const getStationNames = (req, res) => {
  const names = transportModel.getStationNames()

  return res.status(200).json({
    names: names,
  })
}

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
