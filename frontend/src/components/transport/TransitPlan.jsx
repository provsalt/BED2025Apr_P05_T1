import React from 'react';
import {Button} from "@/components/ui/button.jsx";

const TransitPlan = ({ path, stations }) => {
  if (!path || path.length === 0 || !stations) {
    return null;
  }

  // TODO: refactor this
  const getLineFromStationCode = (code) => {
    if (code.startsWith("NS")) return "North-South Line";
    if (code.startsWith("EW")) return "East-West Line";
    if (code.startsWith("NE")) return "North-East Line";
    if (code.startsWith("CC")) return "Circle Line";
    if (code.startsWith("DT")) return "Downtown Line";
    if (code.startsWith("TE")) return "Thomson-East Coast Line";
    if (code.startsWith("BP")) return "Bukit Panjang LRT";
    if (code.startsWith("SE")) return "Sengkang LRT (East)";
    if (code.startsWith("SW")) return "Sengkang LRT (West)";
    if (code.startsWith("PE")) return "Punggol LRT (East)";
    if (code.startsWith("PW")) return "Punggol LRT (West)";
    if (code.startsWith("CG")) return "Changi Airport Branch Line";
    if (code.startsWith("CE")) return "Circle Line Extension";
    return "Unknown Line";
  };

  const plan = [];
  let currentSegment = [];
  let currentLine = null;

  for (let i = 0; i < path.length; i++) {
    const stationCode = path[i];
    const stationName = stations[stationCode];
    const stationLines = stationCode.split(" ").map(getLineFromStationCode);

    if (currentSegment.length === 0) {
      currentSegment.push({ code: stationCode, name: stationName });
      currentLine = stationLines[0];
    } else {
      const prevStationCode = path[i - 1];
      const prevStationLines = prevStationCode.split(" ").map(getLineFromStationCode);

      const commonLines = stationLines.filter(line => prevStationLines.includes(line));

      if (commonLines.length === 0 || (commonLines.length === 1 && commonLines[0] !== currentLine)) {
        plan.push({
          type: "travel",
          start: currentSegment[0].name,
          end: currentSegment[currentSegment.length - 1].name,
          line: currentLine,
          stations: currentSegment.map(s => s.name)
        });

        plan.push({
          type: "transfer",
          fromStation: stations[prevStationCode],
          toStation: stationName,
          fromLine: currentLine,
          toLine: stationLines[0]
        });

        currentSegment = [{ code: stationCode, name: stationName }];
        currentLine = stationLines[0];
      } else {
        currentSegment.push({ code: stationCode, name: stationName });
        if (commonLines.length > 0 && commonLines[0] !== currentLine) {
            currentLine = commonLines[0];
        }
      }
    }
  }

  if (currentSegment.length > 0) {
    plan.push({
      type: "travel",
      start: currentSegment[0].name,
      end: currentSegment[currentSegment.length - 1].name,
      line: currentLine,
      stations: currentSegment.map(s => s.name)
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md mt-4">
      <h3 className="text-lg font-semibold mb-2">Transit Plan</h3>
      <Button className="w-full">Save this route</Button>
      <ol className="list-decimal list-inside">
        {plan.map((step, index) => (
          <li key={index} className="mb-1">
            {step.type === "travel" ? (
              `Take the ${step.line} from ${step.start} to ${step.end}.`
            ) : (
              `Transfer from ${step.fromStation} (${step.fromLine}) to ${step.toStation} (${step.toLine}).`
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default TransitPlan;
