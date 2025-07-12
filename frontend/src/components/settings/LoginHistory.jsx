import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher";
import { DateTime } from "luxon";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const alert = useAlert();
  const userZone = DateTime.local().zoneName;
  const userZoneAbbr = DateTime.local().toFormat('ZZZZ');

  useEffect(() => {
    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/login-history`)
      .then((data) => {
        setLoginHistory(data);
      })
      .catch(() => {
        alert.error({
          title: "Login History Error",
          description: "Could not load login history.",
        });
      });
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Logins</CardTitle>
        <div className="text-sm text-gray-500 mt-1">
          Times are shown in your local timezone: <span className="font-semibold">{userZoneAbbr} ({userZone})</span>
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
                const dt = DateTime.fromISO(entry.login_time).setZone("local");
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
