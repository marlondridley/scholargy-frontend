// src/components/Layout.js
// This component provides a consistent layout with a sidebar and header for all authenticated pages.
import React from 'react';
import Header from './Header'; // Assuming you have a Header component
import Sidebar from './Sidebar';

// The `children` prop will be the specific page component rendered by the router.
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* You can create a simple Header component if you don't have one */}
        {/* <Header /> */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;