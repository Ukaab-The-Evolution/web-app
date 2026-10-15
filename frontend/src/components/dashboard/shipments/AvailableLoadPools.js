import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAvailableLoads } from '../../../actions/loads';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { selectLoads, selectLoadsError, selectLoadsLoading } from '../../../selectors/loads';
import AsyncState from '../../ui/AsyncState';

const AvailableLoadPools = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const loads = useSelector(selectLoads);
  const loading = useSelector(selectLoadsLoading);
  const error = useSelector(selectLoadsError);
  const load = useCallback(() => dispatch(getAvailableLoads()), [dispatch]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Available load pools</h1><p className="mt-1 text-gray-600">Review open loads and submit capacity from an assigned vehicle.</p></div>
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <AsyncState loading={loading} error={error} onRetry={load} empty="No open load pools are available.">
          <div className="divide-y divide-gray-100">
            {loads.map((loadItem) => (
              <button type="button" key={loadItem.id} onClick={() => navigate(`/dashboard/shipment-details/${loadItem.id}`)} className="grid w-full gap-4 p-5 text-left transition hover:bg-gray-50 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
                <div><p className="font-semibold text-gray-800">{loadItem.cargo_type || 'Load request'}</p><p className="text-sm text-gray-500">{loadItem.origin} → {loadItem.destination}</p><p className="mt-1 text-xs text-gray-400">Load {loadItem.id}</p></div>
                <span className="text-sm text-gray-600">{Number(loadItem.load_weight || 0).toLocaleString()} kg</span>
                <span className="text-sm capitalize text-gray-600">{String(loadItem.status || '').replaceAll('_', ' ')}</span>
                <span className="text-sm font-medium text-[#578C7A]">Review pool →</span>
              </button>
            ))}
          </div>
        </AsyncState>
      </section>
      {user?.user_type === 'trucking_company' && <p className="mt-4 text-sm text-gray-500">A driver and vehicle must be assigned to your company before a bid can be submitted.</p>}
    </div>
  );
};

export default AvailableLoadPools;
