// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '匠' },
        { name: 'Student Profile', path: '/student-profile', icon: '側' },
        { name: 'Scholarships', path: '/scholarships', icon: '雌' },
        { name: 'StudentVue', path: '/studentvue', icon: '迫' },
        { name: 'Compare Colleges', path: '/compare', icon: '投' },
    ];

    return (
        <div className="w-64 bg-white shadow-md border-r border-gray-200 flex-col hidden lg:flex">
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">Scholargy</span>
                </div>
            </div>
            <nav className="flex-1 px-4 py-2 space-y-2">
                {navItems.map(item => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                            location.pathname === item.path
                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
