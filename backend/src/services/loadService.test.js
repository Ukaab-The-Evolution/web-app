import {
  buildBidInsert,
  buildLoadInsert,
  getPoolState,
} from './loadService.js';

describe('load service contracts', () => {
  test('reports remaining pooled truck and capacity requirements', () => {
    expect(getPoolState({
      required_trucks: 3,
      accepted_trucks: 1,
      required_capacity: 36000,
      accepted_capacity: 12000,
      pooling_allowed: true,
    })).toEqual({
      required: 3,
      accepted: 1,
      remaining: 2,
      required_capacity: 36000,
      accepted_capacity: 12000,
      remaining_capacity: 24000,
      pooling_allowed: true,
      fulfilled: false,
    });
  });

  test('marks a pool fulfilled only when all configured requirements are met', () => {
    expect(getPoolState({
      required_trucks: 2,
      accepted_trucks: 2,
      required_capacity: 30000,
      accepted_capacity: 30000,
      pooling_allowed: true,
    }).fulfilled).toBe(true);
  });

  test('builds a load insert for the current integer-ID schema', () => {
    expect(buildLoadInsert({
      cargo_type: 'general',
      load_weight: '10000',
      origin: '31.5204, 74.3587',
      destination: '24.8607, 67.0011',
      payment_offer: '100000',
      required_trucks: '2',
      pooling_allowed: 'Yes',
      pickup_time: '2026-09-05T09:00:00.000Z',
    }, { shipper_id: 7 })).toMatchObject({
      shipper_id: 7,
      number_of_trucks_required: 2,
      is_pooling: true,
    });
  });

  test('rejects a bid without a positive proposed capacity', () => {
    expect(() => buildBidInsert({
      load_id: 1,
      vehicle_id: 2,
      bid_amount: '50000',
      proposed_capacity: '0',
    }, { company_id: 3, driver_id: 4 })).toThrow('proposed_capacity');
  });
});
