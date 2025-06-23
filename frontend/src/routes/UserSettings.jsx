import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const UserSettings = ({ userId }) => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: "",
    profile_picture_url: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get(`/api/user/${userId}`)
      .then(res => setFormData(res.data))
      .catch(err => console.error("Fetch error", err));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleProfilePictureUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("avatar", selectedFile);
    try {
      await axios.post(`/api/user/${userId}/picture`, formData);
      setMessage("✅ Profile picture updated.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to upload profile picture.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/user/${userId}`, {
        name: formData.name,
        gender: formData.gender,
        dob: formData.dob
      });
      setMessage("✅ Profile updated successfully.");
    } catch (err) {
      console.error("Update error", err);
      setMessage("❌ Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (newPassword !== confirmPassword) {
      return setMessage("❌ New passwords do not match.");
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
      setMessage("✅ Password updated successfully.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error", err);
      setMessage("❌ Failed to update password.");
    }
  };

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

      <h2 className="text-2xl font-semibold">User Settings</h2>
      {message && (
        <p className={`font-medium ${message.includes("❌") ? "text-red-600" : "text-green-600"}`}>{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name:</label>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </div>

        <div>
          <label className="block font-medium">Email (read-only):</label>
          <Input name="email" value={formData.email} disabled />
        </div>

        <div>
          <label className="block font-medium">Date of Birth:</label>
          <Input name="dob" type="date" value={formData.dob ? formData.dob.split("T")[0] : ""} onChange={handleChange}/>
        </div>

        <div>
          <label className="block font-medium">Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>

      <hr />

      <h3 className="text-xl font-semibold">Change Password</h3>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block font-medium">Old Password:</label>
          <Input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required/>
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
};
