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
  <div className="space-y-4 sm:space-y-6">
    <div className="bg-background rounded-lg shadow-md border">
      <div className="p-4 sm:p-6 border-b text-center sm:text-left">
        <h3 className="text-lg font-semibold">Debug Information</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h4 className="font-medium mb-2 text-sm sm:text-base">Environment:</h4>
          <div className="bg-muted p-3 rounded text-xs sm:text-sm overflow-x-auto">
            <p><strong>Backend URL:</strong> {backendUrl}</p>
            <p><strong>Token exists:</strong> {!!user?.token ? 'Yes' : 'No'}</p>
            <p><strong>User role:</strong> {user?.role || 'None'}</p>
            <p><strong>Is authenticated:</strong> {user?.isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-sm sm:text-base">API Test:</h4>
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0 mb-2">
            <Button 
              className="w-full sm:w-auto text-xs sm:text-sm"
              onClick={() => {
                console.log('Testing API endpoints...');
                fetchUsers();
              }}
            >
              Test Users API
            </Button>
            <Button 
              variant="secondary"
              className="w-full sm:w-auto text-xs sm:text-sm"
              onClick={() => {
                console.log('Testing Admin API...');
                fetchAdmins();
              }}
            >
              Test Admin API
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0">
            <Button 
              variant="success"
              className="w-full sm:w-auto text-xs sm:text-sm"
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
              className="w-full sm:w-auto text-xs sm:text-sm"
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
          <h4 className="font-medium mb-2 text-sm sm:text-base">Data Status:</h4>
          <div className="bg-muted p-3 rounded text-xs sm:text-sm">
            <p><strong>Users loaded:</strong> {users.length} users</p>
            <p><strong>Admins loaded:</strong> {admins.length} admins</p>
            <p><strong>Loading state:</strong> {loading ? 'Loading...' : 'Ready'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-sm sm:text-base">Raw Data:</h4>
          <div className="bg-muted p-3 rounded text-xs sm:text-sm max-h-64 overflow-y-auto">
            <p><strong>Users:</strong></p>
            <pre className="text-xs overflow-x-auto">{JSON.stringify(users, null, 2)}</pre>
            <p><strong>Admins:</strong></p>
            <pre className="text-xs overflow-x-auto">{JSON.stringify(admins, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DebugSection;
