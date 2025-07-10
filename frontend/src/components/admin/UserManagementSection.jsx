import React from 'react';
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";

const UserManagementSection = ({ users, updateUserRole, deleteUser }) => (
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
                <Chip variant={userItem.role === 'Admin' ? 'admin' : 'user'}>
                  {userItem.role || 'User'}
                </Chip>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <Button
                  variant={userItem.role === 'Admin' ? "secondary" : "default"}
                  size="sm"
                  onClick={() => updateUserRole(userItem.id, userItem.role === 'Admin' ? 'User' : 'Admin')}
                >
                  {userItem.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(userItem.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default UserManagementSection;
