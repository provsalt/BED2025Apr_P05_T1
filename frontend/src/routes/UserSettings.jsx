import { useState, useEffect } from "react";
import axios from "axios";

const UserSettings = ({ userId }) => {
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
    <div>
      <h2>User Settings</h2>
      {/* Profile information input */}
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name"/>
        <input name="email" value={formData.email} disabled placeholder="Email (read-only)"/>
        <input name="dob" type="date" value={formData.dob?.split("T")[0]}
          onChange={handleChange}/>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">-- Select Gender --</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit">Save Profile</button>
      </form>

      <hr />

      {/*Change Password Form */}
      <h3>Change Password</h3>
      <form onSubmit={handleChangePassword}>
        <input type="password" name="oldPassword" placeholder="Old Password" value={passwordForm.oldPassword} onChange={handlePasswordChange} required/>
        <input type="password" name="newPassword" placeholder="New Password" value={passwordForm.newPassword} onChange={handlePasswordChange} required/>
        <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required/>
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default UserSettings;
