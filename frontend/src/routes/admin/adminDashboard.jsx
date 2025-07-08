import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router';
import { UserContext } from '@/provider/UserContext.js';
import { useAlert } from '@/provider/AlertProvider.jsx';

// Admin Dashboard Component
const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const alert = useAlert();
  const navigate = useNavigate();
  
  // State for data
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
        console.log('Users fetched:', userData);
      } else {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const adminData = await response.json();
        setAdmins(adminData);
        console.log('Admins fetched:', adminData);
      } else {
        throw new Error(`Failed to fetch admins: ${response.status}`);
      }
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        alert.success({
          title: "Success",
          description: `User role updated to ${newRole}`
        });
        fetchAllData(); // Refresh data
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert.error({
        title: "Error",
        description: error.message
      });
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert.success({
          title: "Success",
          description: "User deleted successfully"
        });
        fetchAllData(); // Refresh data
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert.error({
        title: "Error",
        description: error.message
      });
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {user?.email || 'Admin'}</p>
        <p className="text-sm text-gray-500">Role: {user?.role}</p>
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
        {activeTab === 'Announcements' && renderAnnouncement()}
          </div>
      </div>
  );
};

export default AdminDashboard;
