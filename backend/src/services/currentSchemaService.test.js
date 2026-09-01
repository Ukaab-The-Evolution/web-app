import {
  buildLegacyBidInsert,
  buildLegacyLoadInsert,
  normalizeLegacyBid,
  normalizeLegacyLoad,
  normalizeLegacyVehicle,
  buildLegacyLocation,
  buildLegacyUser,
} from './currentSchemaService.js';

describe('current schema mapping', () => {
  test('builds a load insert using existing integer schema columns', () => {
    expect(buildLegacyLoadInsert({
      cargo_type: 'general',
      load_weight: '1200',
      origin: '31.5204, 74.3587',
      destination: '24.8607, 67.0011',
      payment_offer: '50000',
      required_trucks: '2',
      pooling_allowed: true,
      pickup_time: '2026-09-05T09:00:00.000Z',
    }, { shipper_id: 7 })).toEqual({
      shipper_id: 7,
      origin: 'SRID=4326;POINT(74.3587 31.5204)',
      destination: 'SRID=4326;POINT(67.0011 24.8607)',
      pickup_time: '2026-09-05T09:00:00.000Z',
      cargo_type: 'general',
      weight_kg: 1200,
      special_requirements: null,
      payment_offer: 50000,
      number_of_trucks_required: 2,
      is_pooling: true,
      status: 'available',
    });
  });

  test('normalizes legacy load and pool rows into the stable API contract', () => {
    expect(normalizeLegacyLoad({
      load_id: 12,
      shipper_id: 7,
      cargo_type: 'general',
      weight_kg: 1200,
      origin: '0101000020E6100000F4FDD478E9265240D0D556EC2FE63F40',
      destination: '0101000020E6100000C442AD69DEB05040FCA9F1D24DCD3840',
      payment_offer: 50000,
      number_of_trucks_required: 2,
      is_pooling: true,
      status: 'available',
    }, { trucks_assigned: 1, accepted_capacity: 600, status: 'not_full' })).toMatchObject({
      id: 12,
      load_weight: 1200,
      required_trucks: 2,
      pooling_allowed: true,
      accepted_trucks: 1,
      accepted_capacity: 600,
      status: 'open',
      pool: { required: 2, accepted: 1, remaining: 1, fulfilled: false },
    });
  });

  test('maps a driver bid to existing bids columns', () => {
    expect(buildLegacyBidInsert({
      load_id: '12',
      vehicle_id: '4',
      bid_amount: '25000',
      proposed_capacity: '600',
    }, { company_id: 3, driver_id: 9 })).toEqual({
      load_id: 12,
      company_id: 3,
      driver_id: 9,
      vehicle_id: 4,
      bid_amount: 25000,
      proposed_capacity: 600,
      status: 'pending',
    });
  });

  test('normalizes legacy bid identifiers', () => {
    expect(normalizeLegacyBid({ bid_id: 8, load_id: 12, company_id: 3, driver_id: 9, vehicle_id: 4, bid_amount: 25000, bid_time: '2026-09-01T00:00:00Z', status: 'pending' })).toEqual({
      id: 8,
      load_id: 12,
      company_id: 3,
      driver_id: 9,
      vehicle_id: 4,
      bid_amount: 25000,
      created_at: '2026-09-01T00:00:00Z',
      status: 'pending',
    });
  });

  test('builds the authenticated user context from integer-linked records', () => {
    expect(buildLegacyUser(
      { user_id: 5, auth_user_id: 'auth-5', full_name: 'A Driver', user_type: 'driver', email: 'driver@example.com' },
      { driver_id: 9, company_id: 3 },
    )).toMatchObject({
      id: 5,
      auth_user_id: 'auth-5',
      user_type: 'driver',
      driver_id: 9,
      company_id: 3,
    });
  });

  test('normalizes PostGIS point values and vehicle field names', () => {
    expect(normalizeLegacyLoad({
      load_id: 1,
      origin: '0101000020E61000004182C2C7988F5DC0F46C567DAE064140',
      destination: '0101000020E610000055C1A8A44EE855C00E4FAF9465F04440',
      weight_kg: 1,
      number_of_trucks_required: 1,
      status: 'pending',
    }).origin).toBe('34.052200, -118.243700');
    expect(buildLegacyLocation({ lat: 31.5204, lng: 74.3587 }, 'origin'))
      .toBe('SRID=4326;POINT(74.3587 31.5204)');
    expect(normalizeLegacyVehicle({ vehicle_id: 4, license_plate: 'ABC-4', capacity_kg: 1000 }))
      .toMatchObject({ id: 4, registration_number: 'ABC-4', capacity: 1000 });
  });
});
