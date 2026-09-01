import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableLoads } from '../../../actions/loads';
import { normalizeApiError } from '../../../api/client';
import api from '../../../api/client';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

const TruckingCompanyDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSupabaseAuth();
  const { items: loads = [], loading, error } = useSelector((state) => state.loads || {});
  const [vehicles, setVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({ registration_number: '', vehicle_type: 'truck', capacity: '', driver_id: '' });
  const [vehicleMessage, setVehicleMessage] = useState('');

  const loadVehicles = () => api.get('/api/v1/vehicles').then((response) => setVehicles(response.data?.data?.vehicles || [])).catch((requestError) => setVehicleMessage(normalizeApiError(requestError)));
  useEffect(() => { dispatch(getAvailableLoads()); loadVehicles(); }, [dispatch]);

  const createVehicle = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/v1/vehicles', { ...vehicleForm, capacity: Number(vehicleForm.capacity), driver_id: vehicleForm.driver_id || undefined });
      setVehicleForm({ registration_number: '', vehicle_type: 'truck', capacity: '', driver_id: '' });
      setVehicleMessage('Vehicle added. Assign it to a driver through the vehicle record before bidding.');
      await loadVehicles();
    } catch (requestError) { setVehicleMessage(normalizeApiError(requestError)); }
  };

  return <div className="min-h-screen bg-[#f8fafc]"><div className="border-b border-gray-200 bg-white px-8 py-6"><h1 className="text-2xl font-bold text-gray-800">Welcome {user?.full_name || 'Trucking Company'}!</h1><p className="mt-1 text-gray-600">Manage fleet capacity and review pooled loads.</p></div><div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_1fr]"><section className="rounded-xl bg-white p-6 shadow-sm"><div className="mb-5 rounded-xl bg-[#578C7A] p-6 text-white"><p className="text-sm opacity-90">Open loads in the network</p><p className="text-4xl font-bold">{loads.length}</p></div><h2 className="mb-5 text-lg font-semibold text-gray-800">Open load pools</h2>{loading && <p className="text-gray-500">Loading open loads…</p>}{error && <p className="text-red-600">{error}</p>}{!loading && !error && loads.length === 0 && <p className="text-gray-500">No open load pools are available.</p>}<div className="space-y-4">{loads.map((load) => <div key={load.id} className="rounded-lg border border-gray-200 p-4"><div className="flex justify-between gap-4"><div><p className="font-semibold text-gray-800">{load.cargo_type}</p><p className="text-sm text-gray-600">{load.origin} → {load.destination}</p></div><span className="text-sm font-medium text-[#3B6255]">{load.pool?.remaining || load.required_trucks} truck(s) needed</span></div><p className="mt-3 text-sm text-gray-600">Pool progress: {load.pool?.accepted || 0}/{load.pool?.required || load.required_trucks} trucks · {load.pool?.accepted_capacity || 0}/{load.pool?.required_capacity || load.load_weight} kg</p></div>)}</div></section><section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-2 text-lg font-semibold text-gray-800">Fleet vehicles</h2><p className="mb-5 text-sm text-gray-500">Create vehicles here and assign them to a driver profile before bidding.</p>{vehicleMessage && <p className="mb-4 rounded-lg bg-[#E8F2EE] p-3 text-sm text-[#3B6255]">{vehicleMessage}</p>}<form onSubmit={createVehicle} className="space-y-3"><input required value={vehicleForm.registration_number} onChange={(event) => setVehicleForm({ ...vehicleForm, registration_number: event.target.value })} placeholder="Registration number" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" /><select value={vehicleForm.vehicle_type} onChange={(event) => setVehicleForm({ ...vehicleForm, vehicle_type: event.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"><option value="truck">Truck</option><option value="trailer">Trailer</option><option value="van">Van</option></select><input required type="number" min="1" step="1" value={vehicleForm.capacity} onChange={(event) => setVehicleForm({ ...vehicleForm, capacity: event.target.value })} placeholder="Capacity (kg)" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" /><input required type="number" min="1" step="1" value={vehicleForm.driver_id} onChange={(event) => setVehicleForm({ ...vehicleForm, driver_id: event.target.value })} placeholder="Assigned driver ID" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" /><button type="submit" className="w-full rounded-lg bg-[#578C7A] px-4 py-3 font-medium text-white">Add vehicle</button></form><div className="mt-6 space-y-2">{vehicles.map((vehicle) => <div key={vehicle.id} className="rounded-lg border border-gray-200 p-3 text-sm"><div className="flex justify-between"><span className="font-medium text-gray-700">{vehicle.registration_number}</span><span className="capitalize text-gray-500">{vehicle.status}</span></div><p className="mt-1 text-gray-500">{vehicle.capacity} kg · Driver {vehicle.driver_id}</p></div>)}</div></section></div></div>;
};

export default TruckingCompanyDashboard;
