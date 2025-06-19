import { useState, useEffect } from "react";
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

  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get(`/api/users/${userId}`)
      .then(res => setFormData(res.data))
      .catch(err => console.error("Fetch error", err));
  }, [userId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/users/${userId}`, formData);
      setMessage("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Update error", err);
      setMessage("Failed to update profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match.");
    }

    try {
      await axios.put(`/api/users/${userId}/password`, { oldPassword, newPassword });
      alert("Password updated.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error:", err);
      alert("Failed to update password.");
    }
  };

  const handleUploadPicture = async () => {
    const formDataUpload = new FormData();
    formDataUpload.append("avatar", selectedFile);

    try {
      const res = await axios.post(`/api/users/${userId}/picture`, formDataUpload);
      alert("Profile picture uploaded.");
      setFormData(prev => ({ ...prev, profile_picture_url: res.data.path }));
    } catch (err) {
      console.error("Upload error", err);
      alert("Failed to upload picture.");
    }
  };

  return (
    <div className="user-settings-container">
      <div className="user-profile-header">
        <img
          src={formData.profile_picture_url || "/default-avatar.png"}
          alt="Profile"
          className="profile-picture"
        />
        <div>
          <h2 className="username">{formData.name || "Welcome!"}</h2>
          <p className="user-email">{formData.email}</p>
        </div>
      </div>

      {message && <p className="message">{message}</p>}

      {!editMode && (
        <button onClick={() => setEditMode(true)} className="edit-btn">Edit Profile</button>
      )}

      <form className="settings-form" onSubmit={handleSubmit}>
        <label>
          Name:
          <input name="name" value={formData.name} onChange={handleChange} disabled={!editMode} />
        </label>

        <label>
          Email (read-only):
          <input name="email" value={formData.email} disabled />
        </label>

        <label>
          Date of Birth:
          <input name="dob" type="date" value={formData.dob?.split("T")[0]} onChange={handleChange} disabled={!editMode} />
        </label>

        <label>
          Gender:
          <select name="gender" value={formData.gender} onChange={handleChange} disabled={!editMode}>
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        {editMode && <button type="submit" className="save-btn">Save Changes</button>}
      </form>

      <hr />

      <h2>Change Password</h2>
      <form className="password-form" onSubmit={handleChangePassword}>
        <label>Old Password:
          <input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required />
        </label>
        <label>New Password:
          <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required />
        </label>
        <label>Confirm New Password:
          <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
        </label>
        <button type="submit" className="save-btn">Update Password</button>
      </form>

      <hr />

      <h2>Upload Profile Picture</h2>
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button type="button" onClick={handleUploadPicture}>Upload Picture</button>
    </div>
  );
};
