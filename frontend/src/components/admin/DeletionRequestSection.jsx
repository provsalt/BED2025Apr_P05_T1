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
    <div className="bg-background rounded-lg shadow-md border p-6">
      <h3 className="text-lg font-semibold mb-4">Account Deletion Requests</h3>

      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 mb-2">
        Times are shown in:
        <select
          className="border rounded px-2 py-1 ml-2"
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
        <p className="text-muted-foreground">No pending deletion requests.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deletionRequests.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.deletionRequestedAt ? formatDeletionTime(user.deletionRequestedAt) : ""}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                      >
                        Approve & Delete
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
      )}
    </div>
  );
};

export default DeletionRequestsSection;
