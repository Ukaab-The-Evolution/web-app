process.env.SUPABASE_URL ||= 'https://example.supabase.co';
process.env.SUPABASE_KEY ||= 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test-service-key';
process.env.FRONTEND_URL ||= 'http://localhost:3000';

import { jest } from '@jest/globals';

const { createLoadController } = await import('./loadController.js');

const queryResult = (result) => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: () => Promise.resolve(result),
    single: () => Promise.resolve(result),
    insert: () => chain,
  };
  return chain;
};

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('load mutation protections', () => {
  test('rejects a bid when the vehicle is not assigned and available for the driver', async () => {
    const db = {
      from: jest.fn((table) => {
        if (table === 'loads') return queryResult({ data: { load_id: 10, status: 'available' }, error: null });
        if (table === 'vehicles') return queryResult({ data: null, error: null });
        throw new Error(`unexpected table ${table}`);
      }),
    };
    const controller = createLoadController({ db });
    const next = jest.fn();

    await controller.submitBid({
      user: { user_type: 'driver', driver_id: 5 },
      params: { id: '10' },
      body: { vehicle_id: '22', proposed_capacity: 1000 },
    }, response(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403, message: 'Vehicle is not available for this driver' }));
  });

  test('maps a duplicate bid constraint to a conflict and does not record a success event', async () => {
    const db = {
      from: jest.fn((table) => {
        if (table === 'loads') return queryResult({ data: { load_id: 10, status: 'available' }, error: null });
        if (table === 'vehicles') return queryResult({ data: { vehicle_id: 22, capacity_kg: 2000, company_id: 7, driver_id: 5, status: 'available' }, error: null });
        if (table === 'bids') return {
          insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { code: '23505' } }) }) }),
        };
        if (table === 'load_events') return { insert: jest.fn() };
        throw new Error(`unexpected table ${table}`);
      }),
    };
    const controller = createLoadController({ db });
    const next = jest.fn();

    await controller.submitBid({
      user: { id: 99, user_type: 'driver', driver_id: 5 },
      params: { id: '10' },
      body: { vehicle_id: '22', proposed_capacity: 1000, bid_amount: 500 },
    }, response(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409, message: 'This vehicle already has a bid on the load' }));
  });

  test('passes the authenticated shipper actor to the atomic bid acceptance RPC', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: { load_id: 10, bid_id: 20, booking_id: 30, fulfilled: false, status: 'available' },
      error: null,
    });
    const db = {
      rpc,
      from: jest.fn((table) => {
        if (table === 'load_events') return { insert: jest.fn().mockResolvedValue({ error: null }) };
        throw new Error(`unexpected table ${table}`);
      }),
    };
    const controller = createLoadController({ db });
    const res = response();

    await controller.acceptBid({
      user: { id: 44, user_type: 'shipper', shipper_id: 2 },
      params: { id: '10', bidId: '20' },
    }, res, jest.fn());

    expect(rpc).toHaveBeenCalledWith('accept_load_bid', {
      p_load_id: 10,
      p_bid_id: 20,
      p_actor_user_id: 44,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
