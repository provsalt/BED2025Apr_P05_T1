import React from 'react';
import { Button } from "@/components/ui/button";

const DebugSection = ({
  user,
  users,
  admins,
  loading,
  fetchUsers,
  fetchAdmins,
  backendUrl,
  alert
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-md border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Debug Information</h3>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h4 className="font-medium mb-2">Environment:</h4>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p><strong>Backend URL:</strong> {backendUrl}</p>
            <p><strong>Token exists:</strong> {!!user?.token ? 'Yes' : 'No'}</p>
            <p><strong>User role:</strong> {user?.role || 'None'}</p>
            <p><strong>Is authenticated:</strong> {user?.isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">API Test:</h4>
          <div className="space-x-2 mb-2">
            <Button 
              onClick={() => {
                console.log('Testing API endpoints...');
                fetchUsers();
              }}
            >
              Test Users API
            </Button>
            <Button 
              variant="secondary"
              onClick={() => {
                console.log('Testing Admin API...');
                fetchAdmins();
              }}
            >
              Test Admin API
            </Button>
          </div>
          <div className="space-x-2">
            <Button 
              variant="success"
              onClick={async () => {
                try {
                  const response = await fetch(`${backendUrl}/api/admin`, {
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
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                console.log('Environment variables:');
                console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
                console.log('Token from localStorage:', localStorage.getItem('token'));
                console.log('User context:', user);
              }}
            >
              Check Environment
            </Button>
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

export default DebugSection;
