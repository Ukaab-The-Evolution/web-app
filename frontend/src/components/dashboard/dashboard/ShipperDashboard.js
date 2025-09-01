import { useState } from 'react';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import DashboardHeader from '../../ui/DashboardHeader';
import DashboardStatsCard from '../../ui/DashboardStatsCard';
import { FaTruckFast } from "react-icons/fa6";
import { FaRegHourglass } from "react-icons/fa6";
import { GiPieChart } from "react-icons/gi";
import WeeklyShipmentsChart from '../../ui/WeeklyShipmentsChart';
import DeliveriesDonutChart from '../../ui/DeliveriesDonutChart';
import ShipmentsList from '../../ui/ShipmentsList';
import { RiWechatLine } from "react-icons/ri";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getDashboardOverview, getDashboardPieChart } from '../../../actions/dashboard';

const ShipperDashboard = ({getDashboardOverview, getDashboardPieChart }) => {
    const { user } = useSupabaseAuth();
    const [searchQuery, setSearchQuery] = useState('')
    const [dashboardData, setDashboardData] = useState({
        totalActiveShipments: 35,
        pendingRequests: 3,
        deliveredThisMonth: 54,
        weeklyShipments: [15, 18, 22, 19, 25, 20, 16],
        deliveries: { ontime: 68, inProgress: 20, delayed: 12 },
        shipments: [
            { id: 'SHP-1003', description: 'Truck #B07 - Flatbed', status: 'pending' },
            { id: 'SHP-1004', description: 'Truck #C45 - Container', status: 'in transit' }
        ]
    });

    getDashboardOverview();

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Implement search logic here
        console.log('Searching for:', query);
    };

    return (
        <>
            {/* Header */}
            <DashboardHeader
                userName={user?.first_name || "Ahmed"}
                subtitle="Here is your main dashboard"
                onSearch={handleSearch}
                searchPlaceholder="Search shipments, requests..."
                userAvatar={user?.avatar_url}
            />

            {/*shipper dashboard content*/}
            <div className="p-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mr-40">
                    <DashboardStatsCard
                        icon={<FaTruckFast />}
                        title="Total Active Shipments"
                        value={dashboardData.totalActiveShipments}
                    />

                    <DashboardStatsCard
                        icon={<FaRegHourglass />}
                        title="Pending Requests"
                        value={dashboardData.pendingRequests}
                    />

                    <DashboardStatsCard
                        icon={<GiPieChart />}
                        title="Delivered This Month"
                        value={dashboardData.deliveredThisMonth}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 mb-8">
                    {/* Weekly Shipments Chart */}
                    <WeeklyShipmentsChart
                        title="Shipments Overview"
                        thisWeekData={[10, 20, 15, 30, 25, 18, 22]}
                        prevWeekData={[8, 14, 12, 28, 20, 15, 18]}
                    />

                    {/* Deliveries Donut Chart */}
                    <DeliveriesDonutChart
                        data={{ ontime: 68, inProgress: 20, delayed: 12 }}
                    />
                </div>

                {/* Your Shipments */}
                <ShipmentsList />
            </div>

            {/* Floating Chat Icon */}
            <button
                className="
          fixed bottom-6 right-3
          bg-[#1847a5] text-white 
          w-12 h-12 flex items-center justify-center 
          shadow-xl border border-[#351580]
          rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none
          hover:bg-blue-700 transition
        "
            >
                <RiWechatLine className="w-6 h-6" />
            </button>
        </>
    );
};

export default connect(null, { getDashboardOverview, getDashboardPieChart })(ShipperDashboard);