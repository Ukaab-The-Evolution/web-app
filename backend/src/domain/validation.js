import { USER_TYPES } from './constants.js';

const roleAliases = new Map([
  ['shipper', USER_TYPES.SHIPPER],
  ['trucking_company', USER_TYPES.TRUCKING_COMPANY],
  ['truckingCompany', USER_TYPES.TRUCKING_COMPANY],
  ['driver', USER_TYPES.DRIVER],
  ['truckDriver', USER_TYPES.DRIVER],
]);

const requiredText = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
};

const positiveNumber = (value, field) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${field} must be greater than zero`);
  }
  return parsed;
};

const nonNegativeNumber = (value, field) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} must be zero or greater`);
  }
  return parsed;
};

const normalizeBoolean = (value, field) => {
  if (value === undefined || value === null || value === '') return true;
  if (value === true || value === 'true' || value === 'Yes' || value === 'yes') return true;
  if (value === false || value === 'false' || value === 'No' || value === 'no') return false;
  throw new Error(`${field} must be a boolean`);
};

export const normalizeRole = (value) => {
  const normalized = roleAliases.get(value);
  if (!normalized) throw new Error('Invalid user type');
  return normalized;
};

export const validateLoadInput = (input = {}) => {
  const poolingAllowed = normalizeBoolean(input.pooling_allowed, 'pooling_allowed');
  const requiredTrucks = positiveNumber(input.required_trucks ?? 1, 'required_trucks');
  const normalizedRequiredTrucks = Math.trunc(requiredTrucks);
  if (normalizedRequiredTrucks !== requiredTrucks) {
    throw new Error('required_trucks must be a whole number');
  }

  if (!poolingAllowed && normalizedRequiredTrucks !== 1) {
    throw new Error('A non-pooled load must require exactly one truck');
  }

  const requiredCapacity = input.required_capacity === undefined
    || input.required_capacity === null
    || input.required_capacity === ''
    ? null
    : positiveNumber(input.required_capacity, 'required_capacity');

  return {
    cargo_type: requiredText(input.cargo_type, 'cargo_type'),
    load_weight: positiveNumber(input.load_weight, 'load_weight'),
    origin: requiredText(input.origin, 'origin'),
    destination: requiredText(input.destination, 'destination'),
    payment_offer: nonNegativeNumber(input.payment_offer, 'payment_offer'),
    required_trucks: normalizedRequiredTrucks,
    pooling_allowed: poolingAllowed,
    required_capacity: requiredCapacity,
    additional_notes: typeof input.additional_notes === 'string'
      ? input.additional_notes.trim()
      : '',
  };
};
