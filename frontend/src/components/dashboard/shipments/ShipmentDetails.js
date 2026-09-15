import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { acceptBid, getLoadBids, getLoadBookings, selectLoad, updateBookingStatus } from '../../../actions/loads';
import api, { normalizeApiError, normalizeLoad } from '../../../api/client';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

const label = (value = '') => value.replaceAll('_', ' ');
const formatDate = (value) => value ? new Date(value).toLocaleString() : 'Not scheduled';

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSupabaseAuth();
  const [load, setLoad] = useState(null);
  const [bids, setBids] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/v1/loads/${id}`);
      const nextLoad = normalizeLoad(response.data?.data?.load);
      setLoad(nextLoad);
      dispatch(selectLoad(nextLoad));
      if (user?.user_type === 'shipper') setBids(await dispatch(getLoadBids(id)));
      setBookings(await dispatch(getLoadBookings(id)));
    } catch (requestError) {
      setError(normalizeApiError(requestError));
    } finally {
      setLoading(false);
    }
  }, [dispatch, id, user?.user_type]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAccept = async (bidId) => {
    setActionMessage('');
    try {
      const allocation = await dispatch(acceptBid(id, bidId));
      setActionMessage(allocation?.fulfilled ? 'Pool complete. All required truck capacity is allocated.' : 'Driver added to the pool. More capacity is still required.');
      await loadData();
    } catch (requestError) {
      setActionMessage(normalizeApiError(requestError));
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    setActionMessage('');
    try {
      await dispatch(updateBookingStatus(bookingId, status));
      setActionMessage(status === 'delivered' ? 'Trip marked as delivered.' : 'Trip started and marked in transit.');
      await loadData();
    } catch (requestError) {
      setActionMessage(normalizeApiError(requestError));
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Loading load details…</p>;
  if (error) return <div className="p-8"><p className="text-red-600">{error}</p><button type="button" onClick={() => navigate(-1)} className="mt-4 text-[#578C7A]">← Back</button></div>;
  if (!load) return <p className="p-8 text-gray-500">Load not found.</p>;

  const pool = load.pool || {};
  const required = Number(pool.required || load.required_trucks || 0);
  const accepted = Number(pool.accepted || load.accepted_trucks || 0);
  const capacity = Number(pool.accepted_capacity || load.accepted_capacity || 0);
  const requiredCapacity = Number(pool.required_capacity || load.required_capacity || load.load_weight || 0);
  const truckProgress = required ? (accepted / required) * 100 : 0;
  const capacityProgress = requiredCapacity ? (capacity / requiredCapacity) * 100 : 0;
  const progress = Math.min(100, Math.round(Math.min(truckProgress, capacityProgress || truckProgress)));

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-5 text-sm font-medium text-[#578C7A]">← Back to loads</button>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-800">{load.cargo_type || 'Load details'}</h1><p className="mt-1 text-gray-500">{load.origin} → {load.destination}</p><p className="mt-1 text-xs text-gray-400">{load.id}</p></div><span className="rounded-full bg-[#E8F2EE] px-4 py-2 text-sm capitalize text-[#3B6255]">{label(load.status)}</span></div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-semibold text-gray-800">Load information</h2><div className="grid grid-cols-2 gap-5 text-sm"><div><p className="text-gray-400">Weight</p><p className="font-medium text-gray-700">{Number(load.load_weight || 0).toLocaleString()} kg</p></div><div><p className="text-gray-400">Required trucks</p><p className="font-medium text-gray-700">{required}</p></div><div><p className="text-gray-400">Pickup</p><p className="font-medium text-gray-700">{formatDate(load.pickup_time)}</p></div><div><p className="text-gray-400">Estimated delivery</p><p className="font-medium text-gray-700">{formatDate(bookings[0]?.estimated_delivery_time)}</p></div></div><div className="mt-8"><div className="mb-2 flex justify-between text-sm text-gray-600"><span>Pool progress</span><span>{accepted}/{required} trucks · {capacity}/{requiredCapacity} kg</span></div><div className="h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#578C7A]" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-sm text-gray-500">{pool.remaining ?? 0} truck slots remaining</p></div></section>
        <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-semibold text-gray-800">Accepted allocations</h2>{bookings.length === 0 ? <p className="text-sm text-gray-500">No driver has been accepted yet.</p> : <div className="space-y-3">{bookings.map((booking) => <div key={booking.booking_id} className="rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-gray-700">Driver {booking.bid?.driver_id || '—'}</p><p className="text-sm text-gray-500">Vehicle {booking.vehicle?.registration_number || booking.vehicle_id} · Final price: {booking.final_price}</p>{booking.vehicle?.current_location?.label && <p className="mt-1 text-xs text-gray-400">Last location: {booking.vehicle.current_location.label}</p>}</div><span className="text-xs capitalize text-[#3B6255]">{label(booking.status)}</span></div>{user?.user_type === 'driver' && <div className="mt-3 flex gap-2">{booking.status === 'booked' && <button type="button" onClick={() => handleBookingStatus(booking.booking_id, 'in_transit')} className="rounded-lg bg-[#578C7A] px-3 py-2 text-xs font-medium text-white">Start trip</button>}{booking.status === 'in_transit' && <button type="button" onClick={() => handleBookingStatus(booking.booking_id, 'delivered')} className="rounded-lg border border-[#578C7A] px-3 py-2 text-xs font-medium text-[#3B6255]">Mark delivered</button>}</div>}</div>)}</div>}</section>
        {user?.user_type === 'shipper' && <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-5 text-lg font-semibold text-gray-800">Driver bids</h2>{actionMessage && <p className="mb-4 rounded-lg bg-[#E8F2EE] p-3 text-sm text-[#3B6255]">{actionMessage}</p>}{bids.length === 0 ? <p className="text-sm text-gray-500">No driver bids yet.</p> : <div className="space-y-3">{bids.map((bid) => <div key={bid.id} className="rounded-lg border border-gray-200 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-medium text-gray-700">Driver {bid.driver_id}</p><p className="text-sm text-gray-500">Capacity: {bid.proposed_capacity} kg · Bid: {bid.bid_amount ?? '—'}</p></div>{bid.status === 'pending' && <button type="button" onClick={() => handleAccept(bid.id)} className="rounded-lg bg-[#578C7A] px-3 py-2 text-sm font-medium text-white">Accept</button>}</div><p className="mt-2 text-xs capitalize text-gray-400">{label(bid.status)}</p></div>)}</div>}</section>}
      </div>
    </div>
  );
};

export default ShipmentDetails;
