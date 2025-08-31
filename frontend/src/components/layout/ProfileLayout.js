import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import DashboardSkeleton from './DashboardSkeleton';

// Import role-based profile components
import TruckingCompanyProfile from '../dashboard/profile/TruckingCompanyProfile';
import DriverProfile from '../dashboard/profile/DriverProfile';
import ShipperProfile from '../dashboard/profile/ShipperProfile';

const ProfileLayout = () => {
  const { user, signOut } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('driver');
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
    // Get user role from user metadata, backend, or local storage
    const getUserRole = () => {
      // This could come from:
      // - user?.user_metadata?.role
      // - localStorage.getItem('userRole')
      // - API call to get user profile
      // - URL parameter during role selection
      
      // For now, let's simulate different roles based on email or set manually
      const role = user?.user_metadata?.role || 'driver';
      console.log(user)
      setUserRole(role);
    };

    if (user) {
      getUserRole();
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [user]);

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

  const renderProfileByRole = () => {
    switch (userRole) {
      case 'truckingCompany':
        return <TruckingCompanyProfile user={user} />;
      case 'driver':
        return <DriverProfile user={user} />;
      case 'shipper':
      default:
        return <ShipperProfile user={user} />;
    }
  };

 if (loading) {
    return (
      <div className="min-h-screen bg-white flex font-poppins">
        {/* Main Content Skeleton */}
        <div className="flex-1 ml-64 overflow-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex font-poppins">
      
      {/* Main Content Area */}
      <div className="flex-1 ml-0 overflow-auto">
        {location.pathname === '/dashboard/profile' ? (
          renderProfileByRole()
        ) : location.pathname === '/dashboard' ? (
          <div>Dashboard Content</div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default ProfileLayout;