import { useEffect, useState, useContext } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { UserContext } from "@/provider/UserContext.js";
import { useAlert } from "@/provider/AlertProvider.jsx";
import { useLocation, useNavigate } from "react-router";
import { fetcher } from "@/lib/fetcher.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";
import { Controller, useForm } from "react-hook-form";

export function Settings() {
  const auth = useContext(UserContext);
  const alert = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [userId, setUserId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    if (!auth) return;

    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user`)
      .then((user) => {
        setValue("name", user.name || "");
        setValue("email", user.email || "");
        setValue("date_of_birth", user.date_of_birth?.split("T")[0] || "");
        setValue("gender", user.gender === "0" ? "female" : user.gender === "1" ? "male" : "");
        setValue("language", user.language || "");
        setProfilePictureUrl(user.profile_picture_url || "");
        setUserId(user.id);
      })
      .catch(() => {
        alert.error({ title: "Error", description: "Failed to load user info." });
      });
  }, [auth, setValue]);

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleProfilePictureChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  async function handleProfilePictureUpload() {
    if (!selectedFile) return;
    const data = new FormData();
    data.append("avatar", selectedFile);

    try {
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/picture`, {
        method: "POST",
        body: data
      });

      setProfilePictureUrl(response.url);

      auth.setUser((prev) => ({
        ...prev,
        profile_picture_url: response.url || "",
        isAuthenticated: true,
      }));

      alert.success({ title: "Profile Picture Updated", description: "Image uploaded successfully." });
    } catch (err) {
      alert.error({ title: "Upload Failed", description: "Image upload failed." });
    }
  }

  async function handleDeletePicture() {
    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/picture`, {
        method: "DELETE",
      });
      setProfilePictureUrl("");

      auth.setUser((prev) => ({
        ...prev,
        profile_picture_url: ""
      }));

      alert.success({ title: "Picture Deleted", description: "Profile picture removed." });
    } catch (err) {
      alert.error({ title: "Delete Failed", description: "Could not delete profile picture." });
    }
  }

  async function onProfileSubmit(data) {
    if (!userId) return;

    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: data.name,
          gender: data.gender === "female" ? "0" : data.gender === "male" ? "1" : null,
          date_of_birth: data.date_of_birth,
          language: data.language
        })
      });

      alert.success({ title: "Profile Updated", description: "Your profile was saved successfully." });
      setEditMode(false);
    } catch (err) {
      alert.error({ title: "Update Failed", description: "Could not update your profile." });
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      alert.error({ title: "Password Mismatch", description: "New passwords do not match." });
      return;
    }

  try {
    const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    alert.success({ title: "Password Updated", description: "Your password was changed successfully." });
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });

  } catch (err) {
    try {
      const errorJson = JSON.parse(err.message.replace("Error fetching: ", ""));
      const description = errorJson.details ? errorJson.details.map(d => d.message).join(" | ") : errorJson.error || "Something went wrong";
      alert.error({ title: "Password Update Failed", description });
    } catch (fallback) {
      alert.error({ title: "Password Update Failed", description: "Incorrect old password or server error." });
      }
    }
  }

  useEffect(() => {
    return () => {
      if (auth.refreshUser) auth.refreshUser();
    };
  }, [location.pathname]);

  if (!auth.token) return null;

  return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">No Image</span>
                  </div>
                )}
                <Input type="file" onChange={handleProfilePictureChange} className="text-sm" />
                <div className="flex gap-2">
                  <Button onClick={handleProfilePictureUpload} size="sm">Upload</Button>
                  <Button variant="destructive" onClick={handleDeletePicture} size="sm">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
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
          </div>

          <div className="md:col-span-3">
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
                      required/>
                  </div>
                  <div>
                    <label className="block font-medium">New Password:</label>
                    <Input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required/>
                  </div>
                  <div>
                    <label className="block font-medium">Confirm Password:</label>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required/>
                  </div>

                  <div className="md:col-span-3">
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3 flex justify-center">
            <Button
              variant="destructive"
              onClick={() => {
                auth.setUser({ id: null, token: null, isAuthenticated: false });
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
