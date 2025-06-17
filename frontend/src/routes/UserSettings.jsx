import { useState, useEffect } from "react";
import axios from "axios";

export const UserSettings = () => {
  const userId = 1;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/users/${userId}`, formData)
      .then(() => alert("Settings updated!"))
      .catch(err => console.error("Update error", err));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match.");
    }

    try {
      await axios.put(`/api/users/${userId}/password`, {
        oldPassword,
        newPassword
      });
      alert("Password updated successfully.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error:", err);
      alert("Failed to update password.");
    }
  };

  return (
    <div className="user-settings-container">
      <h1 className="title">User Settings</h1>

      <label>Upload Profile Picture</label>
        <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])}/>
      <button type="button" onClick={handleUploadPicture}>Upload Picture</button>

      <form className="settings-form" onSubmit={handleSubmit}>
        <label>Name:<input name="name" value={formData.name} onChange={handleChange} required /></label>
        <label>Email:<input name="email" value={formData.email} disabled /></label>
        <label>Date of Birth:<input name="dob" type="date" value={formData.dob?.split("T")[0]} onChange={handleChange} required /></label>
        <label>Gender:
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <button type="submit" className="save-btn">Save Profile</button>
      </form>

      <hr />

      <h2 className="subtitle">Change Password</h2>
      <form className="password-form" onSubmit={handleChangePassword}>
        <label>Old Password:<input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} required /></label>
        <label>New Password:<input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} required /></label>
        <label>Confirm New Password:<input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required /></label>
        <button type="submit" className="save-btn">Update Password</button>
      </form>
    </div>
  );
};
