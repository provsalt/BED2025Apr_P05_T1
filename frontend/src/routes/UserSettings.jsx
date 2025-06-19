import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/userSettings.css";

export const UserSettings = () => {
  const userId = 1;

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
    axios.get(`/api/users/${userId}`)
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
      await axios.post(`/api/users/${userId}/picture`, formData);
      setMessage("✅ Profile picture updated.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to upload profile picture.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${userId}`, {
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
      await axios.put(`/api/users/${userId}/password`, {
        oldPassword,
        newPassword
      });
      setMessage("✅ Password updated successfully.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error", err);
      setMessage("❌ Failed to update password.");
    }
  };

  return (
    <div className="user-settings-container">
      <div className="profile-section">
        {formData.profile_picture_url && (
          <img
            src={`/uploads/${formData.profile_picture_url.split("\\").pop()}`}
            alt="Profile"
            className="profile-picture"
          />
        )}
        <input type="file" onChange={handleProfilePictureChange} />
        <button onClick={handleProfilePictureUpload}>Upload Picture</button>
      </div>

      <h2>User Settings</h2>
      {message && <p className={message.includes("❌") ? "error" : "success"}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Name:
          <input name="name" value={formData.name} onChange={handleChange} />
        </label>

        <label>Email (read-only):
          <input name="email" value={formData.email} disabled />
        </label>

        <label>Date of Birth:
          <input
            name="dob"
            type="date"
            value={formData.dob ? formData.dob.split("T")[0] : ""}
            onChange={handleChange}
          />
        </label>

        <label>Gender:
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <button type="submit">Save Changes</button>
      </form>

      <hr />

      <h3>Change Password</h3>
      <form onSubmit={handleChangePassword}>
        <label>Old Password:
          <input
            type="password"
            name="oldPassword"
            value={passwordForm.oldPassword}
            onChange={handlePasswordChange}
            required
          />
        </label>

        <label>New Password:
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            required
          />
        </label>

        <label>Confirm New Password:
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            required
          />
        </label>

        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};
