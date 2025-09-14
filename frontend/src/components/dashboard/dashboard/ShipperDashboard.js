import { useEffect, useState } from 'react';
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
import { getDashboardOverview, getDashboardPieChart, getShipperShipments } from '../../../actions/dashboard';

const ShipperDashboard = ({
    getDashboardOverview,
    getDashboardPieChart,
    getShipperShipments,
    overview,
    pieChart,
    shipments
}) => {
    const { user } = useSupabaseAuth();
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

    useEffect(() => {
        getDashboardOverview();
        getDashboardPieChart();
        getShipperShipments();
    }, [getDashboardOverview, getDashboardPieChart, getShipperShipments]);

    return (
        <>
            {/* Header */}
            <DashboardHeader
                userName={user?.first_name || "Ahmed"}
                subtitle="Here is your main dashboard"
                userAvatar={user?.avatar_url}
            />

            {/*shipper dashboard content*/}
            <div className="p-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mr-40">
                    <DashboardStatsCard
                        icon={<FaTruckFast />}
                        title="Total Active Shipments"
                        value={overview?.total_shipments || 0}
                    />

                    <DashboardStatsCard
                        icon={<FaRegHourglass />}
                        title="Pending Requests"
                        value={overview?.active_shipments || 0}
                    />

                    <DashboardStatsCard
                        icon={<GiPieChart />}
                        title="Delivered This Month"
                        value={overview?.completed_shipments || 0}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 mb-8">
                    {/* Weekly Shipments Chart */}
                    <WeeklyShipmentsChart
                        title="Shipments Overview"
                        thisWeekData={overview?.weeklyShipments || []}
                        prevWeekData={[6,12,21,14,17,20,4]} // Optionally add previous week data
                    />

                    {/* Deliveries Donut Chart */}
                    <DeliveriesDonutChart
                        data={{
                            active: pieChart?.active || 0,
                            completed: pieChart?.completed || 0,
                            cancelled: pieChart?.cancelled || 0
                        }}
                    />
                </div>

                {/* Your Shipments */}
                <ShipmentsList shipments={shipments || []} />
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

ShipperDashboard.propTypes = {
    getDashboardOverview: PropTypes.func.isRequired,
    getDashboardPieChart: PropTypes.func.isRequired,
    getShipperShipments: PropTypes.func.isRequired,
    overview: PropTypes.object,
    pieChart: PropTypes.object,
    shipments: PropTypes.array
};

const mapStateToProps = (state) => ({
    overview: state.dashboard.overview,
    pieChart: state.dashboard.pieChart,
    shipments: state.dashboard.shipments
});

export default connect(mapStateToProps, {
    getDashboardOverview,
    getDashboardPieChart,
    getShipperShipments
})(ShipperDashboard);