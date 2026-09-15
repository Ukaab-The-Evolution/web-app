import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import DashboardSkeleton from './DashboardSkeleton';

// Import role-based profile components
import TruckingCompanyProfile from '../dashboard/profile/TruckingCompanyProfile';
import TruckDriverProfile from '../dashboard/profile/DriverProfile';
import ShipperProfile from '../dashboard/profile/ShipperProfile';

const ProfileLayout = () => {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const userRole = user?.user_type || localStorage.getItem('userRole');

  useEffect(() => {
    setLoading(!user);
  }, [user]);

  const renderProfileByRole = () => {
    switch (userRole) {
      case 'trucking_company':
        return <TruckingCompanyProfile user={user} />;
      case 'driver':
        return <TruckDriverProfile user={user} />;
      case 'shipper':
        return <ShipperProfile user={user} />;
      default:
        return <div className="p-8 text-red-700">Your account role is not configured.</div>;
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
