import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import Sidebar from './Sidebar';
import ChatWidget from '../ui/ChatWidget';
import DashboardSkeleton from './DashboardSkeleton';

// Import role-based dashboard components
import TruckingCompanyDashboard from '../dashboard/dashboard/TruckingCompanyDashboard';
import TruckDriverDashboard from '../dashboard/dashboard/TruckDriverDashboard';
import ShipperDashboard from '../dashboard/dashboard/ShipperDashboard';

const DashboardLayout = () => {
  const { user, signOut } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(); 
  const location = useLocation();
  const navigate = useNavigate();

  // Get active section from current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.includes('/shipments')) return 'shipments';
    if (path.includes('/load-request')) return 'loadRequest';
    if (path.includes('/loadRequests')) return 'loadRequests';
    if (path.includes('/acceptedLoads')) return 'acceptedLoads';
    if (path.includes('/fleet')) return 'fleet';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeSection = getActiveSection();

  useEffect(() => {
    const getUserRole = () => {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    };

    getUserRole();

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, [user]); // Remove setUserRole from dependencies

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (section) => {
    switch (section) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      // Shipper routes
      case 'shipments':
        navigate('/dashboard/shipments');
        break;
      case 'loadRequest':
        navigate('/dashboard/load-request');
        break;

      // Trucking Company routes
      case 'loadRequests':
        navigate('/dashboard/load-requests');
        break;
      case 'acceptedLoads':
        navigate('/dashboard/accepted-loads');
        break;
      case 'fleet':
        navigate('/dashboard/fleet');
        break;

      // Truck Driver routes
      case 'orders':
        navigate('/dashboard/orders');
        break;

      // Common routes
      case 'profile':
        navigate('/dashboard/profile');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const renderDashboardByRole = () => {
    switch (userRole) {
      case 'truckingCompany':
        return <TruckingCompanyDashboard />;
      case 'driver':
        return <TruckDriverDashboard />;
      case 'shipper':
      default:
        return <ShipperDashboard />;
    }
  };

 if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex font-poppins">
        {/* Sidebar Skeleton */}
        <div className="fixed left-0 top-0 h-full w-56 bg-white shadow-lg z-50">
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="px-6 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 ml-64 overflow-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-poppins">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleNavigation}
        handleSignOut={handleSignOut}
        userRole={userRole}
      />

      <ChatWidget />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-56 overflow-auto">
        {location.pathname === '/dashboard' ? (
          renderDashboardByRole()
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;