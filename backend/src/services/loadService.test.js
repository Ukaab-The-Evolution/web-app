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

  test('builds a load insert owned by the authenticated shipper organization', () => {
    expect(buildLoadInsert({
      cargo_type: 'Steel',
      load_weight: '10000',
      origin: 'Lahore',
      destination: 'Karachi',
      payment_offer: '100000',
      required_trucks: '2',
      pooling_allowed: 'Yes',
    }, { id: 'user-1', organization_id: 'org-1' })).toMatchObject({
      shipper_organization_id: 'org-1',
      created_by: 'user-1',
      required_trucks: 2,
      pooling_allowed: true,
    });
  });

  test('rejects a bid without a positive proposed capacity', () => {
    expect(() => buildBidInsert({
      vehicle_id: 'vehicle-1',
      bid_amount: '50000',
      proposed_capacity: '0',
    }, { id: 'driver-1' })).toThrow('proposed_capacity');
  });
});
