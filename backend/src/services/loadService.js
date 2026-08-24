import { validateLoadInput } from '../domain/validation.js';

export const getPoolState = (load = {}) => {
  const required = Number(load.required_trucks || 1);
  const accepted = Number(load.accepted_trucks || 0);
  const requiredCapacity = load.required_capacity === null || load.required_capacity === undefined
    ? null
    : Number(load.required_capacity);
  const acceptedCapacity = Number(load.accepted_capacity || 0);
  const remaining = Math.max(required - accepted, 0);
  const remainingCapacity = requiredCapacity === null
    ? null
    : Math.max(requiredCapacity - acceptedCapacity, 0);

  return {
    required,
    accepted,
    remaining,
    required_capacity: requiredCapacity,
    accepted_capacity: acceptedCapacity,
    remaining_capacity: remainingCapacity,
    pooling_allowed: Boolean(load.pooling_allowed),
    fulfilled: remaining === 0 && (remainingCapacity === null || remainingCapacity === 0),
  };
};

export const buildLoadInsert = (input, user) => {
  if (!user?.id || !user.organization_id) {
    throw new Error('Authenticated shipper organization is required');
  }

  const normalized = validateLoadInput(input);
  return {
    ...normalized,
    shipper_organization_id: user.organization_id,
    created_by: user.id,
    status: 'open',
    accepted_trucks: 0,
    accepted_capacity: 0,
  };
};

export const buildBidInsert = (input, user) => {
  const vehicleId = typeof input?.vehicle_id === 'string' ? input.vehicle_id.trim() : '';
  if (!vehicleId) throw new Error('vehicle_id is required');

  const bidAmount = Number(input.bid_amount);
  if (!Number.isFinite(bidAmount) || bidAmount < 0) {
    throw new Error('bid_amount must be zero or greater');
  }

  const proposedCapacity = Number(input.proposed_capacity);
  if (!Number.isFinite(proposedCapacity) || proposedCapacity <= 0) {
    throw new Error('proposed_capacity must be greater than zero');
  }

  if (!user?.driver_id && !user?.id) throw new Error('Authenticated driver is required');

  return {
    driver_id: user.driver_id || user.id,
    vehicle_id: vehicleId,
    bid_amount: bidAmount,
    proposed_capacity: proposedCapacity,
    status: 'pending',
  };
};

export const normalizeLoadResponse = (load) => ({
  ...load,
  pool: getPoolState(load),
});
