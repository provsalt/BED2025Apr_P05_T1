import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DateTime } from "luxon";
import { TIMEZONE_OPTIONS } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";

const DeletionRequestsSection = ({
  deletionRequests,
  confirmDeleteUser,
  setConfirmDeleteUser,
  approveDeletion
}) => {
  const [timezone, setTimezone] = useState("local");

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

const formatDeletionTime = (isoTime) => {
  let dt = DateTime.fromISO(isoTime);
  if (timezone === "local") {
    dt = dt.toLocal();
  } else {
    dt = dt.setZone(timezone);
  }

  return `${dt.toFormat("yyyy-MM-dd")}, ${dt.toFormat("hh:mm a")}, ${dt.offsetNameShort}`;
};



  return (
    <div className="bg-background rounded-lg shadow-md border p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Account Deletion Requests</h3>

      <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <span>Times are shown in:</span>
        <select
          className="border rounded px-2 py-1 text-xs sm:text-sm"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {TIMEZONE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="font-semibold">{getZoneLabel()}</span>
      </div>

      {deletionRequests.length === 0 ? (
        <p className="text-muted-foreground text-sm">No pending deletion requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">ID</TableHead>
                <TableHead className="text-xs sm:text-sm">Name</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                <TableHead className="text-xs sm:text-sm">Requested At</TableHead>
                <TableHead className="text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {deletionRequests.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-xs sm:text-sm">{user.id}</TableCell>
                <TableCell className="text-xs sm:text-sm">{user.name}</TableCell>
                <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{user.email}</TableCell>
                <TableCell className="text-xs sm:text-sm">
                  {user.deletionRequestedAt ? formatDeletionTime(user.deletionRequestedAt) : ""}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs"
                      >
                        Approve
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve and delete this user account? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel>
                        <AlertDialogAction asChild><Button variant="destructive" onClick={() => approveDeletion(user.id)}>Yes, Delete</Button></AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
};

export default DeletionRequestsSection;
