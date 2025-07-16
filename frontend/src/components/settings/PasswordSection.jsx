import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import React from "react";

const PasswordSection = ({ passwordForm, handlePasswordChange, handleChangePassword }) => (
  <Card>
    <CardHeader>
      <CardTitle>Change Password</CardTitle>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium">Old Password:</label>
          <Input
            type="password"
            name="oldPassword"
            value={passwordForm.oldPassword}
            onChange={handlePasswordChange}
            required />
        </div>
        <div>
          <label className="block font-medium">New Password:</label>
          <Input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            required />
        </div>
        <div>
          <label className="block font-medium">Confirm Password:</label>
          <Input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            required />
        </div>
        <div className="md:col-span-3">
          <Button type="submit">Update Password</Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

export default PasswordSection; 