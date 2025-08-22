// src/pages/ScholarshipsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchScholarships } from '../services/api';

const ScholarshipsPage = () => {
    const navigate = useNavigate();
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for search and filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        minAmount: '',
        maxDeadline: '',
        sortBy: 'deadline_asc' // Default sort
    });

    // Fetch scholarships when search term or filters change
    useEffect(() => {
        const loadScholarships = async () => {
            setLoading(true);
            setError('');
            try {
                // Pass search and filter parameters to the API
                const params = {
                    query: searchTerm,
                    minAmount: filters.minAmount || 0,
                    maxDeadline: filters.maxDeadline || null,
                    sortBy: filters.sortBy
                };
                const result = await searchScholarships(params);
                setScholarships(result.scholarships || []);
            } catch (err) {
                console.error("Failed to load scholarships:", err);
                setError('Could not load scholarships. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        // Debounce the search to avoid excessive API calls
        const timerId = setTimeout(() => {
            loadScholarships();
        }, 500); // 500ms delay

        return () => clearTimeout(timerId);
    }, [searchTerm, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Calculate total eligible amount using useMemo for performance
    const totalAmount = useMemo(() => {
        return scholarships.reduce((sum, s) => sum + (s.amount || 0), 0);
    }, [scholarships]);

    // Sort scholarships by deadline for display
    const sortedScholarships = useMemo(() => {
        return [...scholarships].sort((a, b) => {
            const dateA = new Date(a.deadline || 0);
            const dateB = new Date(b.deadline || 0);
            return dateA - dateB;
        });
    }, [scholarships]);

    // Filter scholarships based on search term and filters
    const filteredScholarships = useMemo(() => {
        let filtered = sortedScholarships;
        
        // Filter by minimum amount
        if (filters.minAmount) {
            filtered = filtered.filter(s => (s.amount || 0) >= parseInt(filters.minAmount));
        }
        
        // Filter by maximum deadline
        if (filters.maxDeadline) {
            const maxDate = new Date(filters.maxDeadline);
            filtered = filtered.filter(s => {
                const deadline = new Date(s.deadline || 0);
                return deadline <= maxDate;
            });
        }
        
        // Apply sorting
        switch (filters.sortBy) {
            case 'amount_desc':
                return filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
            case 'amount_asc':
                return filtered.sort((a, b) => (a.amount || 0) - (b.amount || 0));
            case 'deadline_asc':
            default:
                return filtered.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
        }
    }, [sortedScholarships, filters]);

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return '$0';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h1 className="text-3xl font-bold text-gray-800">Find Scholarships</h1>
                <p className="text-gray-500 mt-1">Search and filter thousands of opportunities.</p>
                
                {/* Search Input */}
                <div className="mt-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by keyword, major, or provider..."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap items-center gap-4">
                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} className="p-2 border rounded-lg bg-gray-50">
                    <option value="deadline_asc">Sort by Deadline (Soonest)</option>
                    <option value="amount_desc">Sort by Amount (High to Low)</option>
                    <option value="amount_asc">Sort by Amount (Low to High)</option>
                </select>
                <input 
                    type="number"
                    name="minAmount"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                    placeholder="Min Amount ($)"
                    className="p-2 border rounded-lg bg-gray-50"
                />
                <input 
                    type="date"
                    name="maxDeadline"
                    value={filters.maxDeadline}
                    onChange={handleFilterChange}
                    className="p-2 border rounded-lg bg-gray-50"
                />
            </div>

            {/* Results Summary */}
            {!loading && !error && scholarships.length > 0 && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">
                                {filteredScholarships.length} Scholarships Found
                            </h3>
                            <p className="text-sm text-green-600">
                                Total Eligible Amount: {formatCurrency(totalAmount)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-green-600">
                                Average Amount: {formatCurrency(totalAmount / filteredScholarships.length)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Section */}
            <div>
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Finding opportunities...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10 bg-red-50 p-6 rounded-lg">
                        <p className="text-red-600 font-semibold">{error}</p>
                    </div>
                ) : filteredScholarships.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 p-6 rounded-lg">
                        <p className="text-gray-600 font-semibold">No scholarships found.</p>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredScholarships.map(scholarship => (
                            <div
                                key={scholarship._id}
                                onClick={() => navigate(`/scholarship/${scholarship._id}`)}
                                className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-lg hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-blue-800">{scholarship.title}</h3>
                                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            {formatCurrency(scholarship.amount)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{scholarship.provider}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                                    <p><strong>Deadline:</strong> {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'Varies'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScholarshipsPage;