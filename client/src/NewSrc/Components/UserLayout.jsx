import React from 'react';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* User Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Grocery Store</h1>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* User Content - This is where child routes will render */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
