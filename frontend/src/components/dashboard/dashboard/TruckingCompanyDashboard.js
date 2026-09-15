import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableLoads } from '../../../actions/loads';
import { normalizeApiError } from '../../../api/client';
import api from '../../../api/client';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

const emptyVehicle = { registration_number: '', vehicle_type: 'truck', capacity: '', driver_id: '' };

const TruckingCompanyDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSupabaseAuth();
  const { items: loads = [], loading, error } = useSelector((state) => state.loads || {});
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [vehicleMessage, setVehicleMessage] = useState('');
  const [inviteCode, setInviteCode] = useState(user?.invite_code || '');

  const loadFleet = async () => {
    try {
      const [vehicleResponse, driverResponse] = await Promise.all([
        api.get('/api/v1/vehicles'),
        api.get('/api/v1/profile/company-drivers'),
      ]);
      setVehicles(vehicleResponse.data?.data?.vehicles || []);
      setDrivers(driverResponse.data?.data?.drivers || []);
    } catch (requestError) {
      setVehicleMessage(normalizeApiError(requestError));
    }
  };

  useEffect(() => {
    dispatch(getAvailableLoads());
    loadFleet();
  }, [dispatch]);

  useEffect(() => {
    setInviteCode(user?.invite_code || '');
  }, [user?.invite_code]);

  const generateInviteCode = async () => {
    setVehicleMessage('');
    try {
      const response = await api.post('/api/v1/profile/generate-invite-code');
      setInviteCode(response.data?.data?.invite_code || '');
      setVehicleMessage('Invite code generated. Share it with your drivers.');
    } catch (requestError) {
      setVehicleMessage(normalizeApiError(requestError));
    }
  };

  const createVehicle = async (event) => {
    event.preventDefault();
    setVehicleMessage('');
    try {
      await api.post('/api/v1/vehicles', {
        ...vehicleForm,
        capacity: Number(vehicleForm.capacity),
        driver_id: Number(vehicleForm.driver_id),
      });
      setVehicleForm(emptyVehicle);
      setVehicleMessage('Vehicle added and assigned to the selected driver.');
      await loadFleet();
    } catch (requestError) {
      setVehicleMessage(normalizeApiError(requestError));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-gray-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome {user?.full_name || 'Trucking Company'}!</h1>
        <p className="mt-1 text-gray-600">Manage fleet capacity and review pooled loads.</p>
      </div>
      <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 rounded-xl bg-[#578C7A] p-6 text-white"><p className="text-sm opacity-90">Open loads in the network</p><p className="text-4xl font-bold">{loads.length}</p></div>
          <h2 className="mb-5 text-lg font-semibold text-gray-800">Open load pools</h2>
          {loading && <p className="text-gray-500">Loading open loads…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && loads.length === 0 && <p className="text-gray-500">No open load pools are available.</p>}
          <div className="space-y-4">{loads.map((load) => <div key={load.id} className="rounded-lg border border-gray-200 p-4"><div className="flex justify-between gap-4"><div><p className="font-semibold text-gray-800">{load.cargo_type}</p><p className="text-sm text-gray-600">{load.origin} → {load.destination}</p></div><span className="text-sm font-medium text-[#3B6255]">{load.pool?.remaining || load.required_trucks} truck(s) needed</span></div><p className="mt-3 text-sm text-gray-600">Pool progress: {load.pool?.accepted || 0}/{load.pool?.required || load.required_trucks} trucks · {load.pool?.accepted_capacity || 0}/{load.pool?.required_capacity || load.load_weight} kg</p></div>)}</div>
        </section>
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">Fleet vehicles</h2>
          <p className="mb-5 text-sm text-gray-500">Add a vehicle and assign it to a driver before bidding.</p>
          {vehicleMessage && <p className="mb-4 rounded-lg bg-[#E8F2EE] p-3 text-sm text-[#3B6255]">{vehicleMessage}</p>}
          <div className="mb-5 rounded-lg border border-dashed border-[#578C7A] p-4">
            <p className="text-sm font-medium text-gray-700">Driver invite code</p>
            <p className="mt-1 break-all text-sm text-gray-500">{inviteCode || 'Generate a code to onboard drivers.'}</p>
            <button type="button" onClick={generateInviteCode} className="mt-3 rounded-lg border border-[#578C7A] px-3 py-2 text-sm font-medium text-[#3B6255]">{inviteCode ? 'Regenerate code' : 'Generate invite code'}</button>
          </div>
          {!drivers.length && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">No drivers are assigned to this company yet.</p>}
          <form onSubmit={createVehicle} className="space-y-3">
            <input required value={vehicleForm.registration_number} onChange={(event) => setVehicleForm({ ...vehicleForm, registration_number: event.target.value })} placeholder="Registration number" aria-label="Registration number" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" />
            <select value={vehicleForm.vehicle_type} onChange={(event) => setVehicleForm({ ...vehicleForm, vehicle_type: event.target.value })} aria-label="Vehicle type" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"><option value="truck">Truck</option><option value="trailer">Trailer</option><option value="van">Van</option></select>
            <input required type="number" min="1" step="1" value={vehicleForm.capacity} onChange={(event) => setVehicleForm({ ...vehicleForm, capacity: event.target.value })} placeholder="Capacity (kg)" aria-label="Capacity in kilograms" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" />
            <select required value={vehicleForm.driver_id} onChange={(event) => setVehicleForm({ ...vehicleForm, driver_id: event.target.value })} aria-label="Assign to driver" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"><option value="">Assign to driver</option>{drivers.map((driver) => <option key={driver.driver_id} value={driver.driver_id}>{driver.full_name} · ID {driver.driver_id}</option>)}</select>
            <button type="submit" disabled={!drivers.length} className="w-full rounded-lg bg-[#578C7A] px-4 py-3 font-medium text-white disabled:opacity-50">Add vehicle</button>
          </form>
          <div className="mt-6 space-y-2">{vehicles.map((vehicle) => <div key={vehicle.id} className="rounded-lg border border-gray-200 p-3 text-sm"><div className="flex justify-between"><span className="font-medium text-gray-700">{vehicle.registration_number}</span><span className="capitalize text-gray-500">{vehicle.status}</span></div><p className="mt-1 text-gray-500">{vehicle.capacity} kg · Driver {vehicle.driver_id}</p></div>)}</div>
        </section>
      </div>
    </div>
  );
};

export default TruckingCompanyDashboard;
