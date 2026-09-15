// Stable service entry point retained for existing imports. Database-specific
// mapping lives in currentSchemaService so controllers cannot drift from the
// existing integer-ID Supabase schema.
import {
  buildLegacyBidInsert,
  buildLegacyLoadInsert,
  normalizeLegacyLoad,
} from './currentSchemaService.js';

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

export const buildLoadInsert = buildLegacyLoadInsert;
export const buildBidInsert = buildLegacyBidInsert;
export const normalizeLoadResponse = normalizeLegacyLoad;
