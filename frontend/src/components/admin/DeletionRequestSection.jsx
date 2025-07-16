import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React from "react";

const DeletionRequestsSection = ({ deletionRequests, confirmDeleteUser, setConfirmDeleteUser, approveDeletion }) => (
  <div className="bg-white rounded-lg shadow-md border p-6">
    <h3 className="text-lg font-semibold mb-4">Account Deletion Requests</h3>
    {deletionRequests.length === 0 ? (
      <p className="text-gray-600">No pending deletion requests.</p>
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
        {deletionRequests.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.deletionRequestedAt ? new Date(user.deletionRequestedAt).toLocaleString() : ''}</TableCell>
            <TableCell>
              <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteUser(user.id)}>
                  Approve & Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    )}
    {typeof confirmDeleteUser === 'number' && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
          <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
          <p className="mb-4">Are you sure you want to approve and delete this user account? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setConfirmDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { approveDeletion(confirmDeleteUser); setConfirmDeleteUser(null); }}>Yes, Delete</Button>
          </div>
        </div>
      </div>
    )}
  </div>
);
export default DeletionRequestsSection; 