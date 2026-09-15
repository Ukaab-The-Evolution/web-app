import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableLoads, submitBid } from '../../../actions/loads';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { normalizeApiError } from '../../../api/client';
import api from '../../../api/client';

const TruckDriverDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSupabaseAuth();
  const { items: loads = [], loading, error } = useSelector((state) => state.loads || {});
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [form, setForm] = useState({ vehicle_id: '', bid_amount: '', proposed_capacity: '' });
  const [message, setMessage] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [locationForm, setLocationForm] = useState({ vehicle_id: '', latitude: '', longitude: '' });
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => { dispatch(getAvailableLoads()); }, [dispatch]);
  useEffect(() => {
    api.get('/api/v1/vehicles').then((response) => setVehicles(response.data?.data?.vehicles || [])).catch(() => setVehicles([]));
  }, []);

  const openBidForm = (load) => {
    setSelectedLoad(load);
    setMessage('');
    setForm({ vehicle_id: vehicles[0]?.id ? String(vehicles[0].id) : '', bid_amount: '', proposed_capacity: String(load.required_capacity || load.load_weight || '') });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await dispatch(submitBid(selectedLoad.id, { vehicle_id: String(form.vehicle_id).trim(), bid_amount: Number(form.bid_amount), proposed_capacity: Number(form.proposed_capacity) }));
      setMessage('Your truck has joined the load pool pending shipper acceptance.');
      setSelectedLoad(null);
    } catch (requestError) {
      setMessage(normalizeApiError(requestError));
    }
  };

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    setLocationMessage('');
    try {
      await api.patch(`/api/v1/vehicles/${locationForm.vehicle_id}/location`, {
        latitude: Number(locationForm.latitude),
        longitude: Number(locationForm.longitude),
      });
      setLocationMessage('Vehicle location updated.');
    } catch (requestError) {
      setLocationMessage(normalizeApiError(requestError));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-gray-200 bg-white px-8 py-6"><h1 className="text-2xl font-bold text-gray-800">Welcome {user?.full_name || 'Driver'}!</h1><p className="mt-1 text-gray-600">Join open load pools with your available truck capacity.</p></div>
      <div className="p-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"><div className="rounded-xl bg-[#578C7A] p-6 text-white"><p className="text-sm opacity-90">Open loads</p><p className="text-3xl font-bold">{loads.length}</p></div><div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Pool slots visible</p><p className="text-3xl font-bold text-[#3B6255]">{loads.reduce((sum, load) => sum + Number(load.pool?.remaining || 0), 0)}</p></div><div className="rounded-xl bg-white p-6 shadow-sm"><p className="text-sm text-gray-500">Role</p><p className="text-3xl font-bold capitalize text-[#3B6255]">{user?.user_type || 'driver'}</p></div></div>
        <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-semibold text-gray-800">Available pooled loads</h2>{loading && <p className="text-gray-500">Loading open loads…</p>}{error && <p className="text-red-600">{error}</p>}{!loading && !error && loads.length === 0 && <p className="text-gray-500">No open loads are available right now.</p>}<div className="space-y-4">{loads.map((load) => <div key={load.id} className="rounded-lg border border-gray-200 p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-semibold text-gray-800">{load.cargo_type || 'Load request'}</p><p className="text-sm text-gray-600">{load.origin} → {load.destination}</p><p className="mt-1 text-xs text-gray-400">{load.id}</p></div><button type="button" onClick={() => openBidForm(load)} className="rounded-lg bg-[#578C7A] px-4 py-2 text-sm font-medium text-white">Join this pool</button></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600 md:grid-cols-4"><span>Weight: {Number(load.load_weight || 0).toLocaleString()} kg</span><span>Trucks: {load.pool?.accepted || 0}/{load.pool?.required || load.required_trucks}</span><span>Remaining: {load.pool?.remaining || 0}</span><span>Capacity: {load.pool?.accepted_capacity || 0}/{load.pool?.required_capacity || load.load_weight} kg</span></div></div>)}</div></section>
        <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-2 text-lg font-semibold text-gray-800">Update vehicle location</h2><p className="mb-5 text-sm text-gray-500">Use this pilot control to send a GPS reading to the shipper.</p>{locationMessage && <p className="mb-4 rounded-lg bg-[#E8F2EE] p-3 text-sm text-[#3B6255]">{locationMessage}</p>}<form onSubmit={handleLocationSubmit} className="grid gap-3 md:grid-cols-3"><select required value={locationForm.vehicle_id} onChange={(event) => setLocationForm({ ...locationForm, vehicle_id: event.target.value })} aria-label="Vehicle for location update" className="rounded-lg border border-gray-200 px-4 py-3 text-sm"><option value="">Select vehicle</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registration_number}</option>)}</select><input required type="number" min="-90" max="90" step="any" value={locationForm.latitude} onChange={(event) => setLocationForm({ ...locationForm, latitude: event.target.value })} placeholder="Latitude" aria-label="Latitude" className="rounded-lg border border-gray-200 px-4 py-3 text-sm" /><input required type="number" min="-180" max="180" step="any" value={locationForm.longitude} onChange={(event) => setLocationForm({ ...locationForm, longitude: event.target.value })} placeholder="Longitude" aria-label="Longitude" className="rounded-lg border border-gray-200 px-4 py-3 text-sm" /><button disabled={!vehicles.length} type="submit" className="rounded-lg bg-[#578C7A] px-4 py-3 text-sm font-medium text-white disabled:opacity-50 md:col-span-3">Send location</button></form></section>
        {message && <p className="mt-5 rounded-lg bg-[#E8F2EE] p-4 text-sm text-[#3B6255]">{message}</p>}
      </div>
      {selectedLoad && <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4"><form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"><h2 className="text-lg font-semibold text-gray-800">Join {selectedLoad.cargo_type || 'load'} pool</h2><p className="mt-1 text-sm text-gray-500">Choose an assigned vehicle and the capacity it can contribute.</p><div className="mt-5 space-y-4">{vehicles.length ? <select required value={form.vehicle_id} onChange={(event) => setForm({ ...form, vehicle_id: event.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"><option value="">Select vehicle</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registration_number} · {vehicle.capacity} kg</option>)}</select> : <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">No vehicle is assigned to your driver profile yet. Ask your trucking company to add and assign one.</p>}<input required type="number" min="0" step="0.01" value={form.proposed_capacity} onChange={(event) => setForm({ ...form, proposed_capacity: event.target.value })} placeholder="Capacity (kg)" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" /><input required type="number" min="0" step="0.01" value={form.bid_amount} onChange={(event) => setForm({ ...form, bid_amount: event.target.value })} placeholder="Bid amount" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" /></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setSelectedLoad(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">Cancel</button><button disabled={!vehicles.length} type="submit" className="rounded-lg bg-[#578C7A] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Submit bid</button></div></form></div>}
    </div>
  );
};

export default TruckDriverDashboard;
