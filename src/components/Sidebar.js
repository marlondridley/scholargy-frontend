// Sidebar.js - The main navigation sidebar for desktop view.

import React from 'react';

const Sidebar = ({ activeView, setView }) => {
    // An array of navigation items for easy mapping.
    const navItems = [
        { name: 'Dashboard', view: 'dashboard', icon: '🏠' },
        { name: 'Student Profile', view: 'studentProfile', icon: '👤' },
        { name: 'StudentVue', view: 'studentVue', icon: '🔗' },
        { name: 'Compare Colleges', view: 'compare', icon: '📊' },
    ];

    return (
        // The sidebar is hidden on small screens (lg:flex shows it on large screens and up).
        <div className="w-64 bg-white shadow-md border-r border-gray-200 flex-col hidden lg:flex">
            {/* Logo and Title Section */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">Scholargy</span>
                </div>
            </div>
            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-2 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.name}
                        onClick={() => setView(item.view)}
                        // Dynamically apply styles based on whether this is the active view.
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                            activeView === item.view
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;