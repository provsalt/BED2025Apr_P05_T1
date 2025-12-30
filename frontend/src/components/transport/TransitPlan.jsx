import React, { useState } from 'react';
import { Button } from "@/components/ui/button.jsx";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog.jsx";
import { Input } from "@/components/ui/input.jsx";
import { fetcher } from "@/lib/fetcher.js";
import {useAlert} from "@/provider/AlertProvider.jsx";

const TransitPlan = ({ path, stations }) => {
  const [routeName, setRouteName] = useState("");
  const alert = useAlert();

  const handleSaveRoute = async () => {
    try {
      await fetcher("/transport/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: routeName,
          start_station: path[0],
          end_station: path[path.length - 1],
        }),
      });
      alert.success({
        title: "Route Saved",
        description: `The route "${routeName}" has been saved successfully.`,
      });
    } catch (error) {
      alert.error({
        title: "Error",
        description: "Failed to save the route.",
      });
    }
  };

  if (!path || path.length === 0 || !stations) {
    return null;
  }

  const getLineFromStationCode = (code) => {
    const lineCodes = {
      NS: "North-South Line",
      EW: "East-West Line",
      NE: "North-East Line",
      CC: "Circle Line",
      DT: "Downtown Line",
      TE: "Thomson-East Coast Line",
      BP: "Bukit Panjang LRT",
      SE: "Sengkang LRT (East)",
      SW: "Sengkang LRT (West)",
      PE: "Punggol LRT (East)",
      PW: "Punggol LRT (West)",
      CG: "Changi Airport Branch Line",
      CE: "Circle Line Extension",
    };

    for (const prefix in lineCodes) {
      if (code.startsWith(prefix)) {
        return lineCodes[prefix];
      }
    }
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
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">Transit Plan</h3>
      <AlertDialog>
        <Button asChild>
          <AlertDialogTrigger className="w-full">
            Save this route
          </AlertDialogTrigger>
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save route</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Please enter a name for this route</p>
              <Input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Route name"
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveRoute}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
