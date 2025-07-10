import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { UserContext } from '@/provider/UserContext.js';
import { useAlert } from '@/provider/AlertProvider.jsx';
import { fetcher } from '@/lib/fetcher';
import AnnouncementsList from '@/components/AnnouncementsList.jsx';

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

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-2">Total Users</h3>
        <p className="text-3xl font-bold text-blue-600">{users.length}</p>
        <p className="text-gray-600 text-sm">All registered users</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-2">Admins</h3>
        <p className="text-3xl font-bold text-red-600">{admins.length}</p>
        <p className="text-gray-600 text-sm">Users with admin privileges</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-2">Regular Users</h3>
        <p className="text-3xl font-bold text-green-600">{users.filter(u => u.role !== 'Admin').length}</p>
        <p className="text-gray-600 text-sm">Non-admin users</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-2">Actions</h3>
        <button 
          className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={fetchAllData}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">User Management</h3>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(userItem => (
              <tr key={userItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userItem.role === 'Admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userItem.role || 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      userItem.role === 'Admin'
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                    }`}
                    onClick={() => updateUserRole(userItem.id, userItem.role === 'Admin' ? 'User' : 'Admin')}
                  >
                    {userItem.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button
                    className="px-3 py-1 bg-red-200 text-red-800 rounded text-xs font-medium hover:bg-red-300"
                    onClick={() => deleteUser(userItem.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnnouncement = () => (
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Announcements Management</h3>
        <p className="text-gray-600">Create and manage system announcements</p>
      </div>
      <div className="p-6 space-y-6">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={announcementTitle}
              onChange={e => setAnnouncementTitle(e.target.value)}
              maxLength={255}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={announcementContent}
              onChange={e => setAnnouncementContent(e.target.value)}
              maxLength={5000}
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Publish Announcement
          </button>
        </form>
        <AnnouncementsList
          key={announcementsKey}
          isAdmin={true}
          onDelete={handleDeleteAnnouncement}
          adminApiEndpoint={`${import.meta.env.VITE_BACKEND_URL}/api/announcements`}
        />
      </div>
    </div>
  );

  const renderDebug = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Debug Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Environment:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p><strong>Backend URL:</strong> {import.meta.env.VITE_BACKEND_URL}</p>
              <p><strong>Token exists:</strong> {!!user?.token ? 'Yes' : 'No'}</p>
              <p><strong>User role:</strong> {user?.role || 'None'}</p>
              <p><strong>Is authenticated:</strong> {user?.isAuthenticated ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">API Test:</h4>
            <div className="space-x-2 mb-2">
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  console.log('Testing API endpoints...');
                  fetchUsers();
                }}
              >
                Test Users API
              </button>
              <button 
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                onClick={() => {
                  console.log('Testing Admin API...');
                  fetchAdmins();
                }}
              >
                Test Admin API
              </button>
            </div>
            <div className="space-x-2">
              <button 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={async () => {
                  try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('Direct fetch response:', response.status, response.statusText);
                    const data = await response.text();
                    console.log('Direct fetch data:', data);
                    alert.success({title: "Direct Test", description: `Status: ${response.status}`});
                  } catch (error) {
                    console.error('Direct fetch error:', error);
                    alert.error({title: "Direct Test Error", description: error.message});
                  }
                }}
              >
                Direct API Test
              </button>
              <button 
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                onClick={() => {
                  console.log('Environment variables:');
                  console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
                  console.log('Token from localStorage:', localStorage.getItem('token'));
                  console.log('User context:', user);
                }}
              >
                Check Environment
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Data Status:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p><strong>Users loaded:</strong> {users.length} users</p>
              <p><strong>Admins loaded:</strong> {admins.length} admins</p>
              <p><strong>Loading state:</strong> {loading ? 'Loading...' : 'Ready'}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Raw Data:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm max-h-64 overflow-y-auto">
              <p><strong>Users:</strong></p>
              <pre>{JSON.stringify(users, null, 2)}</pre>
              <p><strong>Admins:</strong></p>
              <pre>{JSON.stringify(admins, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {user?.data?.email || 'Admin'}</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading...</div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'User Management' },
              { id: 'announcements', label: 'Announcements' },
              { id: 'debug', label: 'Debug' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'announcements' && renderAnnouncement()}
        {activeTab === 'debug' && renderDebug()}
      </div>
      </div>
  );
};

export default AdminDashboard;
