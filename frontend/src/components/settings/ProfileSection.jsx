import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@radix-ui/react-label";
import { Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import React from "react";

const ProfileSection = ({ editMode, errors, register, control, handleSubmit, onProfileSubmit, setEditMode }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>User Details</CardTitle>
        <Button onClick={() => setEditMode((prev) => !prev)} variant="outline">
          {editMode ? "Cancel" : "Edit Settings"}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: true, min: 3, maxLength: 255 })} disabled={!editMode} />
          {errors.name && <span className="text-red-500 text-sm">Please enter a valid name.</span>}
        </div>
        <div>
          <Label htmlFor="email">Email (read-only)</Label>
          <Input id="email" {...register("email")} disabled />
        </div>
        <div>
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input id="date_of_birth" type="date" {...register("date_of_birth", { required: true })} disabled={!editMode} />
          {errors.date_of_birth && <span className="text-red-500 text-sm">Please enter a valid date of birth.</span>}
        </div>
        <div>
          <Label>Gender</Label>
          <Controller
            name="gender"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex items-center space-x-4"
                disabled={!editMode}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="gender-female" />
                  <Label htmlFor="gender-female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="gender-male" />
                  <Label htmlFor="gender-male">Male</Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.gender && <span className="text-red-500 text-sm">Please select a gender.</span>}
        </div>
        <div>
          <Label htmlFor="language">Preferred Language</Label>
          <Input id="language" {...register("language")} disabled={!editMode} />
        </div>
        {editMode && <Button type="submit">Save Changes</Button>}
      </form>
    </CardContent>
  </Card>
);

export default ProfileSection; 