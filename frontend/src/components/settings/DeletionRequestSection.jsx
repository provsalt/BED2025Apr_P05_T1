import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import React, { useContext } from "react";
import { UserContext } from "@/provider/UserContext";

const DeletionRequestSection = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleRequestAccountDeletion,
  hasRequestedDeletion,
  handleCancelAccountDeletion
}) => {
  const { role } = useContext(UserContext);

  if (role === "Admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Deletion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 font-semibold">Admins cannot request account deletion.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Deletion</CardTitle>
      </CardHeader>
      <CardContent>
        {hasRequestedDeletion ? (
          <div className="flex flex-col items-end w-full">
            <p className="mb-2 text-red-600 font-semibold w-full text-left">You have requested account deletion.</p>
            <Button variant="outline" onClick={handleCancelAccountDeletion}>Cancel Deletion Request</Button>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              Request Account Deletion
            </Button>
          </div>
        )}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Account Deletion</h3>
              <p className="mb-4">Are you sure you want to request account deletion? This action requires admin approval and cannot be undone once processed.</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleRequestAccountDeletion}>Yes, Request Deletion</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeletionRequestSection; 