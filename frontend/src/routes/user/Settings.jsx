import { useEffect, useState, useContext } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { UserContext } from "@/provider/UserContext.js";
import { useAlert } from "@/provider/AlertProvider.jsx";
import { useNavigate } from "react-router";
import {fetcher} from "@/lib/fetcher.js";
import { useLocation } from "react-router-dom";

export function Settings() {
  const auth = useContext(UserContext);
  const alert = useAlert();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date_of_birth: "",
    gender: "",
    language: "",
    profile_picture_url: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!auth) return;

    fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user`)
      .then((user) => {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          date_of_birth: user.date_of_birth?.split("T")[0] || "",
          gender: user.gender === 0 ? "female" : user.gender === 1 ? "male" : "",
          language: user.language || "",
          profile_picture_url: user.profile_picture_url || ""
        });
        setUserId(user.id);
      })
      .catch(() => {
        alert.error({ title: "Error", description: "Failed to load user info." });
      });
  }, [auth]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleProfilePictureChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  async function handleProfilePictureUpload() {
    if (!selectedFile || !userId) return;
    const data = new FormData();
    data.append("avatar", selectedFile);

    try {
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/picture`, {
        method: "POST",
        body: data
      });

      setFormData((prev) => ({
        ...prev,
        profile_picture_url: response.url
      }));  

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
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/profile-picture/${userId}`, {
        method: "DELETE",
      });
      setFormData((prev) => ({ ...prev, profile_picture_url: "" }));

      auth.setUser((prev) => ({
        ...prev,
        profile_picture_url: ""
      }));

      alert.success({ title: "Picture Deleted", description: "Profile picture removed." });
    } catch (err) {
      alert.error({ title: "Delete Failed", description: "Could not delete profile picture." });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userId) return;

    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender === "female" ? 0 : formData.gender === "male" ? 1 : null,
          date_of_birth: formData.date_of_birth,
          language: formData.language
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
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      alert.success({ title: "Password Updated", description: "Your password was changed successfully." });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert.error({ title: "Password Update Failed", description: "Incorrect old password or server error." });
    }
  }
  
  const location = useLocation();

  // ###idt this will affect the other parts if it refreshes?
  useEffect(() => {
    return () => {
      if (auth.refreshUser) auth.refreshUser();
    };
  }, [location.pathname]);

  if (!auth.token) return null;

 return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h3>
            {formData.profile_picture_url ? (
              <img
                src={formData.profile_picture_url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center mb-4">
                <span className="text-gray-600">No Image</span>
              </div>
            )}
            <input type="file" onChange={handleProfilePictureChange} className="mb-4" />
            <div className="flex gap-2">
              <Button onClick={handleProfilePictureUpload}>Upload Picture</Button>
              <Button variant="destructive" onClick={handleDeletePicture}>Delete Picture</Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
              <Button onClick={() => setEditMode((prev) => !prev)}>
                {editMode ? "Cancel" : "Edit Settings"}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Name:</label>
                <Input name="name" value={formData.name} onChange={handleChange} disabled={!editMode} />
              </div>
              <div>
                <label className="block font-medium">Email (read-only):</label>
                <Input name="email" value={formData.email} disabled />
              </div>
              <div>
                <label className="block font-medium">Date of Birth:</label>
                <Input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} disabled={!editMode} />
              </div>
              <div>
                <label className="block font-medium">Gender:</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  disabled={!editMode}>
                  <option value="">-- Select Gender --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Preferred Language:</label>
                <Input name="language" value={formData.language} onChange={handleChange} disabled={!editMode} />
              </div>

              {editMode && <Button type="submit">Save Changes</Button>}
            </form>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>
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
          </div>

          <div className="md:col-span-2 flex justify-center">
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

