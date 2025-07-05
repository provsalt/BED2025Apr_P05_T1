import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '@/provider/UserContext.js';
import { fetcher } from '@/lib/fetcher.js';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { useAlert } from '@/provider/AlertProvider.jsx';

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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
