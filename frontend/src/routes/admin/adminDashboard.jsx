import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/provider/UserContext.js';
import { fetcher } from '@/lib/fetcher.js';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { useAlert } from '@/provider/AlertProvider.jsx';

// Admin Dashboard Component
const AdminDashboard = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const alert = useAlert();
  
  // State for different sections
  const [activeTab, setActiveTab] = useState('overview');
  const [announcements, setAnnouncements] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAdminUserId, setNewAdminUserId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkRoleUpdate, setBulkRoleUpdate] = useState('User');

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Decode token to check role
    if (user.token) {
      try {
        const payload = JSON.parse(atob(user.token.split('.')[1]));
        if (payload.role !== 'Admin') {
          alert.error({
            title: 'Access Denied',
            description: 'You need admin privileges to access this page.',
            variant: 'destructive'
          });
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
        return;
      }
    }
    
    // Load initial data
    loadAnnouncements();
    loadAdmins();
    loadUsers();
  }, [user, navigate]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`);
      setAnnouncements(response);
    } catch (error) {
      console.error('Error loading announcements:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/admin`);
      setAdmins(response);
    } catch (error) {
      console.error('Error loading admins:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to load admins',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`);
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      alert.error({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      if (editingAnnouncement) {
        await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementForm)
        });
        alert.success({
          title: 'Success',
          description: 'Announcement updated successfully'
        });
        setEditingAnnouncement(null);
      } else {
        await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/announcements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementForm)
        });
        alert.success({
          title: 'Success',
          description: 'Announcement created successfully'
        });
      }
      
      setAnnouncementForm({ title: '', content: '' });
      loadAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to save announcement',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      setLoading(true);
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/announcements/${id}`, {
        method: 'DELETE'
      });
      alert.success({
        title: 'Success',
        description: 'Announcement deleted successfully'
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addAdminRole = async (e) => {
    e.preventDefault();
    if (!newAdminUserId.trim()) {
      alert.error({
        title: 'Validation Error',
        description: 'Please enter a user ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/admin/add-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(newAdminUserId) })
      });
      alert.success({
        title: 'Success',
        description: 'Admin role added successfully'
      });
      setNewAdminUserId('');
      loadAdmins();
    } catch (error) {
      console.error('Error adding admin role:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to add admin role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeAdminRole = async (userId) => {
    if (!confirm('Are you sure you want to remove admin role from this user?')) {
      return;
    }

    try {
      setLoading(true);
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/admin/remove-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId })
      });
      alert.success({
        title: 'Success',
        description: 'Admin role removed successfully'
      });
      loadAdmins();
    } catch (error) {
      console.error('Error removing admin role:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to remove admin role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      alert.success({
        title: 'Success',
        description: `User role updated to ${newRole} successfully`
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      alert.success({
        title: 'Success',
        description: 'User deleted successfully'
      });
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateUserRoles = async () => {
    if (selectedUsers.length === 0) {
      alert.error({
        title: 'No Users Selected',
        description: 'Please select users to update',
        variant: 'destructive'
      });
      return;
    }

    const updates = selectedUsers.map(userId => ({
      userId: userId,
      role: bulkRoleUpdate
    }));

    try {
      setLoading(true);
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/bulk-role-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRoleUpdates: updates })
      });
      alert.success({
        title: 'Success',
        description: `${selectedUsers.length} user roles updated successfully`
      });
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      alert.error({
        title: 'Error',
        description: 'Failed to update user roles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const editAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content
    });
    setActiveTab('announcements');
  };

  const cancelEdit = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', content: '' });
  };

  const logout = () => {
    setUser({
      id: null,
      token: null,
      isAuthenticated: false,
      admin: false
    });
    navigate('/login');
  };

  const renderOverview = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{announcements.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{admins.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Active</div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createAnnouncement} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md resize-vertical"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {editingAnnouncement ? 'Update' : 'Create'} Announcement
              </Button>
              {editingAnnouncement && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-gray-500">No announcements found.</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <p className="text-gray-600 mt-1">{announcement.content}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        By: {announcement.author_name} • {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editAnnouncement(announcement)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdmins = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Admin Role</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addAdminRole} className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="number"
                value={newAdminUserId}
                onChange={(e) => setNewAdminUserId(e.target.value)}
                placeholder="Enter user ID to make admin"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              Add Admin Role
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.length === 0 ? (
              <p className="text-gray-500">No admins found.</p>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{admin.name}</h3>
                      <p className="text-gray-600">{admin.email}</p>
                      <p className="text-sm text-gray-500">
                        ID: {admin.id} • Created: {new Date(admin.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeAdminRole(admin.id)}
                    >
                      Remove Admin
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        ID: {user.id} • Role: {user.role} • Created: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserRole(user.id, user.role === 'Admin' ? 'User' : 'Admin')}
                      >
                        {user.role === 'Admin' ? 'Revoke Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!user?.isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, Admin
            </span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'announcements'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'admins'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                Manage Admins
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                Manage Users
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {loading && (
            <div className="mb-4">
              <Alert>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </div>
              </Alert>
            </div>
          )}

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'admins' && renderAdmins()}
          {activeTab === 'users' && renderUsers()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
