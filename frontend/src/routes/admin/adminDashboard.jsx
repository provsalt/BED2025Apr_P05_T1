import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/provider/UserContext.js';
import { useAlert } from '@/provider/AlertProvider.jsx';
import { fetcher } from '@/lib/fetcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OverviewSection from '@/components/admin/OverviewSection.jsx';
import UserManagementSection from '@/components/admin/UserManagementSection.jsx';
import AnnouncementManagementSection from '@/components/admin/AnnouncementManagementSection.jsx';
import DebugSection from '@/components/admin/DebugSection.jsx';

// Admin Dashboard Component
const AdminDashboard = () => {
  const user = useContext(UserContext);
  const alert = useAlert();

  // State for data
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Announcement form state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementsKey, setAnnouncementsKey] = useState(0); // for force refresh

  // Fetch data when component mounts
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchAdmins()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from:', `${import.meta.env.VITE_BACKEND_URL}/api/users`);
      
      const userData = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users`);
      
      setUsers(userData);
      console.log('Users fetched successfully:', userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert.error({
        title: "Error",
        description: `Failed to fetch users: ${error.message}`
      });
    }
  };

  const fetchAdmins = async () => {
    try {
      console.log('Fetching admins from:', `${import.meta.env.VITE_BACKEND_URL}/api/users/role/admins`);
      
      const adminData = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/role/admin`);
      
      setAdmins(adminData);
      console.log('Admins fetched successfully:', adminData);
    } catch (error) {
      console.error('Error fetching admins:', error);
      alert.error({
        title: "Error", 
        description: `Failed to fetch admins: ${error.message}`
      });
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      console.log(`Updating user ${userId} role to ${newRole}`);
      console.log('Request URL:', `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/role`);
      console.log('Request body:', JSON.stringify({ role: newRole }));
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      console.log('Update response:', response);
      alert.success({
        title: "Success",
        description: `User role updated to ${newRole}`
      });
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      console.error('Full error details:', error.message);
      alert.error({
        title: "Error",
        description: error.message
      });
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      console.log(`Deleting user ${userId}`);
      
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}`, {
        method: 'DELETE'
      });

      alert.success({
        title: "Success",
        description: "User deleted successfully"
      });
      fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      alert.error({
        title: "Error",
        description: error.message
      });
    }
  };

  // Create announcement handler
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      alert.error({ title: "Error", description: "Title and content are required." });
      return;
    }
    try {
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: announcementTitle, content: announcementContent })
      });
      
      alert.success({ title: "Success", description: "Announcement created." });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementsKey(k => k + 1); // force AnnouncementsList to reload
    } catch (error) {
      alert.error({ title: "Error", description: error.message });
    }
  };

  // Delete announcement handler
  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`, {
        method: 'DELETE'
      });
      
      alert.success({ title: "Success", description: "Announcement deleted." });
      setAnnouncementsKey(k => k + 1);
    } catch (error) {
      alert.error({ title: "Error", description: error.message });
    }
  };

  return (
    <div className="p-6 mx-auto w-3/4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {user?.data?.email || 'Admin'}</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading...</div>
        </div>
      )}

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewSection users={users} admins={admins} fetchAllData={fetchAllData} />
        </TabsContent>
        <TabsContent value="users">
          <UserManagementSection users={users} updateUserRole={updateUserRole} deleteUser={deleteUser} />
        </TabsContent>
        <TabsContent value="announcements">
          <AnnouncementManagementSection
            announcementTitle={announcementTitle}
            setAnnouncementTitle={setAnnouncementTitle}
            announcementContent={announcementContent}
            setAnnouncementContent={setAnnouncementContent}
            handleCreateAnnouncement={handleCreateAnnouncement}
            announcementsKey={announcementsKey}
            handleDeleteAnnouncement={handleDeleteAnnouncement}
            backendUrl={import.meta.env.VITE_BACKEND_URL}
          />
        </TabsContent>
        <TabsContent value="debug">
          <DebugSection
            user={user}
            users={users}
            admins={admins}
            loading={loading}
            fetchUsers={fetchUsers}
            fetchAdmins={fetchAdmins}
            backendUrl={import.meta.env.VITE_BACKEND_URL}
            alert={alert}
          />
        </TabsContent>
      </Tabs>
      </div>
  );
};

export default AdminDashboard;