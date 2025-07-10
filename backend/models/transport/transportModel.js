import nodes from './node.json' with { type: 'json' };

const stationNames = Object.values(nodes).map(node => node.name);
const stationCodes = Object.keys(nodes);
const stationCodeToIndex = new Map(stationCodes.map((code, i) => [code, i]));
const indexToStationCode = new Map(stationCodes.map((code, i) => [i, code]));

const dist = [];
const next = [];

const initializeMatrices = () => {
    const numNodes = stationCodes.length;
    for (let i = 0; i < numNodes; i++) {
        dist[i] = [];
        next[i] = [];
        for (let j = 0; j < numNodes; j++) {
            if (i === j) {
                dist[i][j] = 0;
                next[i][j] = j;
            } else {
                dist[i][j] = Infinity;
                next[i][j] = null;
            }
        }
    }

    for (const stationCode of stationCodes) {
        const fromIndex = stationCodeToIndex.get(stationCode);
        const edges = nodes[stationCode].edges;
        for (const edge of edges) {
            const toIndex = stationCodeToIndex.get(edge);
            if (toIndex !== undefined) {
                dist[fromIndex][toIndex] = 1;
                next[fromIndex][toIndex] = toIndex;
            }
        }
    }
};

const floydWarshall = () => {
    const numNodes = stationCodes.length;
    for (let k = 0; k < numNodes; k++) {
        for (let i = 0; i < numNodes; i++) {
            for (let j = 0; j < numNodes; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }
};

initializeMatrices();
floydWarshall();

const transportModel = {
    nodes,
    stationNames,
    stationCodes,

    findShortestPath: (startCode, endCode) => {
        const startIndex = stationCodeToIndex.get(startCode);
        const endIndex = stationCodeToIndex.get(endCode);

        if (startIndex === undefined || endIndex === undefined) {
            return null;
        }

        if (dist[startIndex][endIndex] === Infinity) {
            return { path: [], distance: Infinity };
        }

        const path = [];
        let currentIndex = startIndex;
        while (currentIndex !== endIndex) {
            path.push(indexToStationCode.get(currentIndex));
            if (next[currentIndex]?.[endIndex] === null) {
                return null;
            }
            currentIndex = next[currentIndex][endIndex];
        }
        path.push(indexToStationCode.get(endIndex));

        return { path, distance: dist[startIndex][endIndex] };
    },

    getStationNames: () => stationNames,

    getStationCodes: () => stationCodes,

    getStationByName: (name) => {
        const stationCode = Object.keys(nodes).find(code => nodes[code].name === name);
        return stationCode ? { [stationCode]: nodes[stationCode] } : null;
    },

    getStationByCode: (code) => nodes[code] ? { [code]: nodes[code] } : null
};

export default transportModel;
