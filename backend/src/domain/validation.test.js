import { normalizeRole, validateLoadInput } from './validation.js';

describe('canonical domain validation', () => {
  test('normalizes legacy frontend role labels', () => {
    expect(normalizeRole('truckingCompany')).toBe('trucking_company');
    expect(normalizeRole('truckDriver')).toBe('driver');
    expect(normalizeRole('shipper')).toBe('shipper');
  });

  test('rejects unknown roles', () => {
    expect(() => normalizeRole('dispatcher')).toThrow('Invalid user type');
  });

  test('normalizes a pooled load request into numeric domain values', () => {
    expect(validateLoadInput({
      cargo_type: 'Grain',
      load_weight: '12000',
      origin: 'Lahore',
      destination: 'Karachi',
      payment_offer: '250000',
      required_trucks: '3',
      pooling_allowed: 'Yes',
      required_capacity: '36000',
      additional_notes: 'Keep dry',
    })).toEqual({
      cargo_type: 'Grain',
      load_weight: 12000,
      origin: 'Lahore',
      destination: 'Karachi',
      payment_offer: 250000,
      required_trucks: 3,
      pooling_allowed: true,
      required_capacity: 36000,
      additional_notes: 'Keep dry',
    });
  });

  test('rejects an invalid pooled load requirement', () => {
    expect(() => validateLoadInput({
      cargo_type: 'Grain',
      load_weight: '12000',
      origin: 'Lahore',
      destination: 'Karachi',
      payment_offer: '250000',
      required_trucks: '0',
      pooling_allowed: 'Yes',
    })).toThrow('required_trucks');
  });
});
