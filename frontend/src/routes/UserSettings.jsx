import { useState, useEffect } from "react";
import axios from "axios";

const UserSettings = ({ userId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    gender: ""
  });

  useEffect(() => {
    axios.get(`/api/users/${userId}`)
      .then(res => setFormData(res.data))
      .catch(err => console.error("Fetch error", err));
  }, [userId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/users/${userId}`, formData)
      .then(() => alert("Settings updated!"))
      .catch(err => console.error("Update error", err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <input name="dob" type="date" value={formData.dob?.split("T")[0]} onChange={handleChange} />
      <select name="gender" value={formData.gender} onChange={handleChange}>
        <option value="">-- Select Gender --</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <button type="submit">Save Changes</button>
    </form>
  );
};
export default UserSettings;