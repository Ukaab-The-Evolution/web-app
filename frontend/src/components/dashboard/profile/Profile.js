import React from 'react';

const Profile = ({ user }) => {
  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
        <p className="text-gray-600">User: {user?.email}</p>
        <p className="text-gray-600">Profile management content will go here.</p>
      </div>
    </div>
  );
};

export default Profile;