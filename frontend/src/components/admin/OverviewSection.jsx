import React from 'react';

const OverviewSection = ({ users, admins, connectedUsers, fetchAllData }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
      <h3 className="text-lg font-semibold mb-2">Connected Users</h3>
      <p className="text-3xl font-bold text-orange-600">{connectedUsers !== null ? connectedUsers : '...'}</p>
      <p className="text-gray-600 text-sm">Currently online</p>
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
};

export default OverviewSection;
