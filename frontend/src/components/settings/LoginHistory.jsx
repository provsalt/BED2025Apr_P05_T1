import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher";
import { DateTime } from "luxon";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TIMEZONE_OPTIONS } from "@/lib/constants";

export const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [timezone, setTimezone] = useState("local");
  const alert = useAlert();

  useEffect(() => {
    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/login-history`)
      .then((data) => setLoginHistory(data))
      .catch(() => {
      alert.error({
          title: "Login History Error",
          description: "Could not load login history.",
        });
      });
  }, []);

  const getZoneLabel = () => {
    if (timezone === "local") {
      const dt = DateTime.local();
      return `${dt.offsetNameShort} (${dt.zoneName})`;
    }
    if (timezone === "utc") {
      return "UTC";
    }
    if (timezone === "Asia/Singapore") {
      return "SGT (Asia/Singapore)";
    }
    return timezone;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Logins</CardTitle>
        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
          Times are shown in:
          <select
            className="border rounded px-2 py-1 ml-2"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          >
            {TIMEZONE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="font-semibold">{getZoneLabel()}</span>
        </div>
      </CardHeader>
      <CardContent>
        {loginHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">No login records found.</p>
        ) : (
          <Table className="w-full mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Date</TableHead>
                <TableHead className="w-1/3">Time</TableHead>
                <TableHead className="w-1/3">Time Zone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginHistory.map((entry) => {
                let dt = DateTime.fromISO(entry.login_time);
                if (timezone !== "local") {
                  dt = dt.setZone(timezone);
                }
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{dt.toFormat("yyyy-MM-dd")}</TableCell>
                    <TableCell>{dt.toFormat("hh:mm a")}</TableCell>
                    <TableCell>{dt.offsetNameShort}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
