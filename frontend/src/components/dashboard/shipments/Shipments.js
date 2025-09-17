import { FaTag, FaTruck, FaCheckCircle, FaChevronLeft, FaChevronRight, FaUser, FaClock, FaSearch } from 'react-icons/fa';
import React, { useEffect, useMemo, useState } from 'react';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import ShipmentsHeader from '../../ui/ShipmentsHeader';
import ShipmentsList from '../../ui/ShipmentsList';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getShipperShipments } from '../../../actions/dashboard';
import shipmentsData from "./ShipmentsData";
import { useNavigate } from "react-router-dom";

const Shipments = ({ getShipperShipments, shipments }) => {
    const { user } = useSupabaseAuth();
    const [viewType, setViewType] = useState('list');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const [sortBy, setSortBy] = useState(null);
    const [filterBy, setFilterBy] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const [filteredShipments, setFilteredShipments] = useState(shipmentsData);

    let allShipments = [...shipmentsData];

    useEffect(() => {
        getShipperShipments();
    }, [getShipperShipments]);

    const handleShipmentClick = (id) => {
        navigate(`/shipment-details/${id}`);
    };

    const handleLoadRequest = () => {
        navigate('/dashboard/load-request');
    };

    if (sortBy === "name") {
        allShipments.sort((a, b) => String(a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "createdAt") {
        allShipments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (filterBy === "name") {
        allShipments = allShipments.filter((s) => s.name);
    } else if (filterBy === "createdAt") {
        allShipments = allShipments.filter((s) => s.createdAt);
    }

    const onSearch = (q) => {
        // modifications required here
        const filtered = shipmentsData.filter(
            (s) =>
                s.id.toLowerCase().includes(q.toLowerCase()) ||
                s.destination.toLowerCase().includes(q.toLowerCase()) ||
                s.cargoType.toLowerCase().includes(q.toLowerCase())
        );
        setFilteredShipments(filtered);
    };

    const handleSearchToggle = () => {
        setExpanded(!expanded);
        if (expanded && query) {
            onSearch(query);
        }
    };

    let displayShipments = query ? filteredShipments : allShipments;

    const ITEMS_PER_PAGE = viewType === 'grid' ? 9 : 7;
    const totalPages = Math.ceil((displayShipments?.length || 0) / ITEMS_PER_PAGE);
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const startIndex = endIndex - ITEMS_PER_PAGE;
    const currentShipments = displayShipments?.slice(startIndex, endIndex) || [];

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
    
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <button 
                        key={i}
                        className={`px-3 py-2 text-sm rounded ${
                            currentPage === i 
                                ? 'bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] hover:from-[#2F4F43] hover:to-[#4A7D6D] text-white' 
                                : 'text-[#3B6255] hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentPage(i)}
                    >
                        {i}
                    </button>
                );
            }
            return pages;
        } else {
            // Smart pagination for large number of pages
            if (currentPage <= 3) {
                for (let i = 1; i <= 3; i++) {
                    pages.push(
                        <button 
                            key={i}
                            className={`px-3 py-2 text-sm rounded ${
                                currentPage === i 
                                ? 'bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] hover:from-[#2F4F43] hover:to-[#4A7D6D] text-white' 
                                : 'text-[#3B6255] hover:bg-gray-100'
                            }`}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i}
                        </button>
                    );
                }
                pages.push(<span key="ellipsis1" className="px-2 text-[#3B6255]">...</span>);
                pages.push(
                    <button 
                        key={totalPages}
                        className="px-3 py-2 text-sm text-[#3B6255] hover:bg-gray-100 rounded"
                        onClick={() => setCurrentPage(totalPages)}
                    >
                        {totalPages}
                    </button>
                );
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    <button 
                        key={1}
                        className="px-3 py-2 text-sm text-[#3B6255] hover:bg-gray-100 rounded"
                        onClick={() => setCurrentPage(1)}
                    >
                        1
                    </button>
                );
                pages.push(<span key="ellipsis2" className="px-2 text-[#3B6255]">...</span>);
                for (let i = totalPages - 2; i <= totalPages; i++) {
                    pages.push(
                        <button 
                            key={i}
                            className={`px-3 py-2 text-sm rounded ${
                                currentPage === i 
                                ? 'bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] hover:from-[#2F4F43] hover:to-[#4A7D6D] text-white' 
                                : 'text-[#3B6255] hover:bg-gray-100'
                            }`}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i}
                        </button>
                    );
                }
            } else {
                pages.push(
                    <button 
                        key={1}
                        className="px-3 py-2 text-sm text-[#3B6255] hover:bg-gray-100 rounded"
                        onClick={() => setCurrentPage(1)}
                    >
                        1
                    </button>
                );
                pages.push(<span key="ellipsis3" className="px-2 text-[#3B6255]">...</span>);
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(
                        <button 
                            key={i}
                            className={`px-3 py-2 text-sm rounded ${
                                currentPage === i 
                                ? 'bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] hover:from-[#2F4F43] hover:to-[#4A7D6D] text-white' 
                                : 'text-[#3B6255] hover:bg-gray-100'
                            }`}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i}
                        </button>
                    );
                }
                pages.push(<span key="ellipsis4" className="px-2 text-gray-500">...</span>);
                pages.push(
                    <button 
                        key={totalPages}
                        className="px-3 py-2 text-sm text-[#3B6255] hover:bg-gray-100 rounded"
                        onClick={() => setCurrentPage(totalPages)}
                    >
                        {totalPages}
                    </button>
                );
            }
            return pages;
        }
    };

    return (
        <>
            {/* Header */}
            <ShipmentsHeader
                userName={user?.first_name || "Ahmed"}
                subtitle="Manage all your shipments here!"
                userAvatar={user?.avatar_url}
            />

            {/* Shipments Content */}
            <div className="p-8">
                {/* Header Section with View Toggle and New Request Button */}
                <div className="flex items-center justify-between mb-4">              
                  
                    {/* View Toggle Buttons */}
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setViewType('list')}
                            className={`px-4 py-2 rounded-xl font-normal flex items-center gap-2 transition-colors ${
                                viewType === 'list' 
                                ? 'bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] hover:from-[#2F4F43] hover:to-[#4A7D6D] text-white' 
                                : 'bg-gray-100 text-[#3B6255] hover:bg-gray-200'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            List View
                        </button>
                        <button
                            onClick={() => setViewType('grid')}
                            className={`px-4 py-2 rounded-xl font-normal flex items-center gap-2 transition-colors ${
                                viewType === 'grid' 
                                ? 'bg-gradient-to-t from-[#3B6255] to-[#578C7A] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] hover:from-[#2F4F43] hover:to-[#4A7D6D] text-white' 
                                : 'bg-gray-100 text-[#3B6255] hover:bg-gray-200'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Grid View
                        </button>
                    </div>

                    <div className="flex items-center justify-end gap-1 mb-4">
                        
                        {/* Search Button */}
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={handleSearchToggle}
                                className="p-2 text-[#3B6255] font-light hover:text-gray-700 transition-colors">
                                <FaSearch stroke={[20]} />
                            </button>

                            {expanded && (
                                <input
                                    type="text"
                                    placeholder="Find shipments"
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        onSearch(e.target.value);
                                    }}
                                    className="flex ml-0 px-4 py-1 rounded-full bg-gray-200 text-sm text-[#3B6255]
                                    items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-[#578C7A] transition-all w-48">
                                </input> 
                            )}
                        </div>

                        {/* Filter Button */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setFilterDropdownOpen(!filterDropdownOpen);
                                    setSortDropdownOpen(false);
                                }}
                                className="p-2 text-[#3B6255] hover:text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </button>
                            
                            {filterDropdownOpen && (
                                <div className="absolute right-0 mt-2 p-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="flex p-2 text-sm py-1.5 text-[#A3A3A3] bg-[#80bda92b] items-center justify-start gap-2 rounded-lg"> <FaSearch /> Filter by...</div>
                                    <button
                                        onClick={() => {
                                            setFilterBy("name");
                                            setFilterDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-[#3B6255] text-sm rounded-lg"
                                    >
                                        <FaUser /> Name
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFilterBy("createdAt");
                                            setFilterDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-[#3B6255] text-sm rounded-lg"
                                    >
                                        <FaClock /> Created At
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sort Button */}
                        <div className="relative mr-2">
                            <button 
                                onClick={() => {
                                    setSortDropdownOpen(!sortDropdownOpen);
                                    setFilterDropdownOpen(false);
                                }}
                                className="p-2 text-[#3B6255] hover:text-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </button>

                            {sortDropdownOpen && (
                                <div className="absolute right-0 p-2 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="flex p-2 text-sm py-1.5 text-[#A3A3A3] bg-[#80bda92b] items-center justify-start gap-2 rounded-lg"> <FaSearch />Sort by...</div>
                                    <button
                                        onClick={() => {
                                            setSortBy("name");
                                            setSortDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-[#3B6255] text-sm rounded-lg"
                                    >
                                        <FaUser /> Name
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy("createdAt");
                                            setSortDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-[#3B6255] text-sm rounded-lg"
                                    >
                                        <FaClock /> Created At
                                    </button>
                                </div>
                            )}
                        </div>
                    

                        {/* New Load Request Button */}
                        <button 
                            onClick={handleLoadRequest} 
                            className="bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                            shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins font-semibold 
                            hover:from-[#2F4F43] hover:to-[#4A7D6D] text-white px-4 py-2 
                            rounded-xl flex items-center gap-2 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Load Request
                        </button>
                    </div>
                </div>

                {/* Shipments Table */}
                <div className="bg-white rounded-2xl overflow-hidden">
                    {/* Table Header */}
                    {viewType === 'list' && (
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="grid grid-cols-3 items-center">
                                <div className="flex items-center gap-2 text-sm font-medium text-[#052D23] justify-start pl-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    Shipment ID
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-[#052D23] justify-center">
                                    <FaTruck className="w-4 h-4" />
                                    Truck Information
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-[#052D23] justify-end pr-8">
                                    <FaTag className="w-4 h-4" />
                                    Status
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table Body */}  
                    <ShipmentsList 
                        shipments={currentShipments}
                        showTitle={false}
                        limitCount={null}
                        viewMode={viewType}
                        onShipmentClick={handleShipmentClick}
                    />
                

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6 mb-4">
                            <button 
                                className={`px-3 py-2 text-sm flex items-center gap-4 ${
                                    currentPage === 1 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-[#3B6255] hover:text-gray-700'
                                }`}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <FaChevronLeft className="w-3 h-3" />
                                Previous
                            </button>
            
                            {renderPageNumbers()}
            
                            <button 
                                className={`px-3 py-2 text-sm flex items-center gap-4 ${
                                    currentPage === totalPages 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-[#3B6255] hover:text-gray-700'
                                }`}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <FaChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

Shipments.propTypes = {
    getShipperShipments: PropTypes.func.isRequired,
    shipments: PropTypes.array
};

const mapStateToProps = (state) => ({
    shipments: state.dashboard.shipments
});

export default connect(mapStateToProps, {getShipperShipments})(Shipments);