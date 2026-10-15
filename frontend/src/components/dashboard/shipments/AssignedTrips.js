import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../../actions/loads';
import { normalizeApiError } from '../../../api/client';
import AsyncState from '../../ui/AsyncState';

const AssignedTrips = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setBookings(await dispatch(getMyBookings())); } catch (requestError) { setError(normalizeApiError(requestError)); } finally { setLoading(false); }
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Assigned trips</h1><p className="mt-1 text-gray-600">Track loads accepted for your driver or company.</p></div>
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <AsyncState loading={loading} error={error} onRetry={load} empty="No accepted trips yet.">
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <button type="button" key={booking.booking_id} onClick={() => navigate(`/dashboard/shipment-details/${booking.load?.id || booking.load_id}`)} className="grid w-full gap-4 p-5 text-left transition hover:bg-gray-50 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
                <div><p className="font-semibold text-gray-800">{booking.load?.cargo_type || 'Assigned load'}</p><p className="text-sm text-gray-500">{booking.load?.origin} → {booking.load?.destination}</p></div>
                <span className="text-sm text-gray-600">Vehicle {booking.vehicle?.registration_number || booking.vehicle_id || '—'}</span>
                <span className="text-sm capitalize text-gray-600">{String(booking.status || '').replaceAll('_', ' ')}</span>
                <span className="text-sm font-medium text-[#578C7A]">Open trip →</span>
              </button>
            ))}
          </div>
        </AsyncState>
      </section>
    </div>
  );
};

export default AssignedTrips;
