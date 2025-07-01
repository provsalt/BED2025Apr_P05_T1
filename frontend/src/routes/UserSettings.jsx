import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/provider/UserContext";
import { useAlert } from "@/provider/AlertProvider.jsx";

export function UserSettings() {
  const auth = useContext(UserContext);
  const alert = useAlert();

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
    axios
      .get("/api/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then((res) => {
        const user = res.data;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          date_of_birth: user.date_of_birth?.split("T")[0] || "",
          gender: user.gender || "",
          language: user.language || "",
          profile_picture_url: user.profile_picture_url || ""
        });
        setUserId(user.id);
      })
      .catch((err) => {
        console.error("User fetch failed:", err);
        alert.error({ title: "Error", description: "Failed to load user details." });
      });
  }, []);

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
      await axios.post(`/api/user/${userId}/picture`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      alert.success({ title: "Profile Picture Updated", description: "Image uploaded successfully." });
    } catch (err) {
      console.error("Upload error:", err);
      alert.error({ title: "Upload Failed", description: "Image upload failed." });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userId) return;

    try {
      await axios.put(
        `/api/user/${userId}`,
        {
          name: formData.name,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
          language: formData.language
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      alert.success({ title: "Profile Updated", description: "Your profile was saved successfully." });
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
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
      await axios.put(
        `/api/user/${userId}/password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      alert.success({ title: "Password Updated", description: "Your password was changed successfully." });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error:", err.response?.data || err.message);
      alert.error({ title: "Password Update Failed", description: "Incorrect old password or server error." });
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-8">
      <div className="flex flex-col items-center space-y-2">
        {formData.profile_picture_url && (
          <img
            src={`/uploads/${formData.profile_picture_url.split("\\").pop()}`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <input type="file" onChange={handleProfilePictureChange} className="mt-2" />
        <Button onClick={handleProfilePictureUpload}>Upload Picture</Button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Settings</h2>
        <Button onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? "Cancel" : "Edit Settings"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name:</label>
          <Input name="name" value={formData.name || ""} onChange={handleChange} disabled={!editMode} />
        </div>

        <div>
          <label className="block font-medium">Email (read-only):</label>
          <Input name="email" value={formData.email || ""} disabled />
        </div>

        <div>
          <label className="block font-medium">Date of Birth:</label>
          <Input
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth || ""}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        <div>
          <label className="block font-medium">Gender:</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={!editMode}
          >
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Preferred Language:</label>
          <Input
            name="language"
            value={formData.language || ""}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>

        {editMode && <Button type="submit">Save Changes</Button>}
      </form>

      <hr />

      <h3 className="text-xl font-semibold">Change Password</h3>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block font-medium">Old Password:</label>
          <Input
            type="password"
            name="oldPassword"
            value={passwordForm.oldPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <div>
          <label className="block font-medium">New Password:</label>
          <Input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Confirm New Password:</label>
          <Input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <Button type="submit">Update Password</Button>
      </form>
    </div>
  );
}
