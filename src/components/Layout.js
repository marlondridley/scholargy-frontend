// Layout.js - A wrapper component that provides a consistent layout for all pages.

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, activeView, setView }) => {
  return (
    // Main container with a light gray background, consistent font, and flex layout.
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 flex">
      {/* The sidebar component for navigation. */}
      <Sidebar activeView={activeView} setView={setView} />
      {/* The main content area that grows to fill the available space. */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-8">
          {children} {/* Renders the actual page content. */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
