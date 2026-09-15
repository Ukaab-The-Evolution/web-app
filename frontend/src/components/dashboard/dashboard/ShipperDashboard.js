import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyLoads } from '../../../actions/loads';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

const statusLabel = (status) => status.replace('_', ' ');

const ShipperDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSupabaseAuth();
  const { items: loads, loading, error } = useSelector((state) => state.loads || {
    items: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    dispatch(getMyLoads());
  }, [dispatch]);

  const active = loads.filter((load) => ['open', 'booked', 'in_progress'].includes(load.status));
  const delivered = loads.filter((load) => load.status === 'delivered');

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome {user?.full_name || 'Shipper'}!
        </h1>
        <p className="text-gray-600 mt-1">Manage your loads and pooled truck capacity.</p>
      </div>

      <div className="p-8">
        <div className="flex justify-end mb-6">
          <Link to="/dashboard/load-request" className="rounded-lg bg-[#578C7A] px-5 py-3 font-medium text-white">
            Create load request
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-gray-500">Total loads</p><p className="text-3xl font-bold text-[#3B6255]">{loads.length}</p></div>
          <div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-gray-500">Active loads</p><p className="text-3xl font-bold text-[#3B6255]">{active.length}</p></div>
          <div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-gray-500">Delivered</p><p className="text-3xl font-bold text-[#3B6255]">{delivered.length}</p></div>
        </div>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Your load requests</h2>
          {loading && <p className="text-gray-500">Loading loads…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && loads.length === 0 && (
            <p className="text-gray-500">No loads yet. Create your first load request to start a pool.</p>
          )}
          <div className="space-y-4">
            {!loading && !error && loads.map((load) => (
              <div key={load.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{load.cargo_type}</p>
                    <p className="text-sm text-gray-600">{load.origin} → {load.destination}</p>
                  </div>
                  <span className="rounded-full bg-[#E8F2EE] px-3 py-1 text-sm capitalize text-[#3B6255]">
                    {statusLabel(load.status)}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
                  <span>Trucks: {load.pool?.accepted || 0}/{load.pool?.required || load.required_trucks}</span>
                  <span>Remaining: {load.pool?.remaining || 0}</span>
                  <span>Capacity: {load.pool?.accepted_capacity || 0}/{load.pool?.required_capacity || load.load_weight}</span>
                  <span>Pool: {load.pool?.fulfilled ? 'Complete' : 'Open'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShipperDashboard;
