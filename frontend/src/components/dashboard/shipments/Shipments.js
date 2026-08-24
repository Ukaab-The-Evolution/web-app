import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableLoads, getMyLoads } from '../../../actions/loads';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';

const label = (value = '') => value.replaceAll('_', ' ');

const PoolProgress = ({ load }) => {
  const pool = load.pool || {};
  const required = Number(pool.required || load.required_trucks || 0);
  const accepted = Number(pool.accepted || load.accepted_trucks || 0);
  const percent = required ? Math.min(100, Math.round((accepted / required) * 100)) : 0;
  return (
    <div className="min-w-[150px]">
      <div className="mb-1 flex justify-between text-xs text-gray-500"><span>{accepted}/{required || '—'} trucks</span><span>{percent}%</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#578C7A]" style={{ width: `${percent}%` }} /></div>
    </div>
  );
};

const Shipments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const { items = [], loading, error } = useSelector((state) => state.loads || {});
  const isShipper = user?.user_type === 'shipper';

  useEffect(() => { dispatch(isShipper ? getMyLoads() : getAvailableLoads()); }, [dispatch, isShipper]);

  const visibleLoads = useMemo(() => items.filter((load) => {
    const haystack = [load.id, load.cargo_type, load.origin, load.destination].join(' ').toLowerCase();
    return haystack.includes(search.toLowerCase()) && (status === 'all' || load.status === status);
  }), [items, search, status]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">{isShipper ? 'Your loads' : 'Available loads'}</h1><p className="mt-1 text-gray-600">{isShipper ? 'Monitor every load and pooled booking.' : 'Find loads that match your available capacity.'}</p></div>
        {isShipper && <Link to="/dashboard/load-request" className="rounded-lg bg-[#578C7A] px-5 py-3 font-medium text-white">Create load</Link>}
      </div>
      <div className="mb-5 flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search route, cargo, or load ID" className="min-w-[240px] flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-[#578C7A]" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm capitalize"><option value="all">All statuses</option>{['open', 'booked', 'in_progress', 'delivered', 'cancelled'].map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
      </div>
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading && <p className="p-6 text-gray-500">Loading loads…</p>}
        {error && <p className="p-6 text-red-600">{error}</p>}
        {!loading && !error && visibleLoads.length === 0 && <p className="p-6 text-gray-500">No loads match your filters.</p>}
        {!loading && !error && visibleLoads.length > 0 && <div className="divide-y divide-gray-100">{visibleLoads.map((load) => <button type="button" key={load.id} onClick={() => navigate(`/dashboard/shipment-details/${load.id}`, { state: { shipmentId: load.id } })} className="grid w-full gap-4 p-5 text-left transition hover:bg-gray-50 md:grid-cols-[1.4fr_1fr_1fr_180px_auto] md:items-center"><div><p className="font-semibold text-gray-800">{load.cargo_type || 'Load request'}</p><p className="text-sm text-gray-500">{load.origin} → {load.destination}</p><p className="mt-1 text-xs text-gray-400">{load.id}</p></div><div className="text-sm text-gray-600"><span className="block text-xs text-gray-400">Weight</span>{Number(load.load_weight || 0).toLocaleString()} kg</div><div className="text-sm text-gray-600"><span className="block text-xs text-gray-400">Status</span><span className="capitalize">{label(load.status)}</span></div><PoolProgress load={load} /><span className="text-sm font-medium text-[#578C7A]">View details →</span></button>)}</div>}
      </section>
    </div>
  );
};

export default Shipments;
