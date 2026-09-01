import { validateLoadInput } from '../domain/validation.js';

const LEGACY_CARGO_TYPES = new Set(['fragile', 'hazardous', 'perishable', 'general']);

const integerId = (value, field) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${field} must be a positive integer`);
  }
  return parsed;
};

const optionalIntegerId = (value, field) => {
  if (value === undefined || value === null || value === '') return null;
  return integerId(value, field);
};

const numberValue = (value, field, { positive = false } = {}) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (positive ? parsed <= 0 : parsed < 0)) {
    throw new Error(`${field} must be ${positive ? 'greater than zero' : 'zero or greater'}`);
  }
  return parsed;
};

const coordinatePair = (value, field) => {
  if (value && typeof value === 'object') {
    const latitude = Number(value.latitude ?? value.lat);
    const longitude = Number(value.longitude ?? value.lng ?? value.lon);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) return { latitude, longitude };
  }
  if (typeof value === 'string') {
    const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (match) return { latitude: Number(match[1]), longitude: Number(match[2]) };
  }
  throw new Error(`${field} must be coordinates in "latitude, longitude" format`);
};

const validateCoordinates = ({ latitude, longitude }, field) => {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error(`${field} contains invalid latitude or longitude`);
  }
};

export const buildLegacyLocation = (value, field) => {
  if (typeof value === 'string' && /^(?:SRID=\d+;)?POINT\s*\(/i.test(value.trim())) return value.trim();
  if (typeof value === 'string' && /^[0-9a-f]+$/i.test(value.trim()) && value.trim().length >= 34) return value.trim();
  const coordinates = coordinatePair(value, field);
  validateCoordinates(coordinates, field);
  return `SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})`;
};

const readWkbPoint = (value) => {
  if (typeof value !== 'string' || !/^[0-9a-f]+$/i.test(value) || value.length < 34) return null;
  const buffer = Buffer.from(value, 'hex');
  const littleEndian = buffer.readUInt8(0) === 1;
  const readUInt32 = littleEndian ? buffer.readUInt32LE.bind(buffer) : buffer.readUInt32BE.bind(buffer);
  const readDouble = littleEndian ? buffer.readDoubleLE.bind(buffer) : buffer.readDoubleBE.bind(buffer);
  const type = readUInt32(1);
  const hasSrid = (type & 0x20000000) !== 0;
  const baseType = type & 0x0fffffff;
  if (baseType !== 1) return null;
  const offset = hasSrid ? 9 : 5;
  const longitude = readDouble(offset);
  const latitude = readDouble(offset + 8);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
};

export const normalizeLegacyLocation = (value) => {
  const wkb = readWkbPoint(value);
  if (wkb) return { ...wkb, label: `${wkb.latitude.toFixed(6)}, ${wkb.longitude.toFixed(6)}` };
  if (typeof value === 'string') {
    const wkt = value.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
    if (wkt) {
      const longitude = Number(wkt[1]);
      const latitude = Number(wkt[2]);
      return { latitude, longitude, label: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` };
    }
  }
  return { latitude: null, longitude: null, label: value ?? '' };
};

export const normalizeLegacyStatus = (status) => {
  if (status === 'pending' || status === 'available') return 'open';
  if (status === 'in_transit') return 'in_progress';
  return status || 'open';
};

export const buildLegacyLoadInsert = (input, user) => {
  const normalized = validateLoadInput(input);
  if (!user?.shipper_id) throw new Error('Authenticated shipper is required');
  if (!LEGACY_CARGO_TYPES.has(normalized.cargo_type)) {
    throw new Error('cargo_type must be fragile, hazardous, perishable, or general');
  }

  return {
    shipper_id: integerId(user.shipper_id, 'shipper_id'),
    origin: buildLegacyLocation(normalized.origin, 'origin'),
    destination: buildLegacyLocation(normalized.destination, 'destination'),
    pickup_time: input.pickup_time || new Date().toISOString(),
    cargo_type: normalized.cargo_type,
    weight_kg: normalized.load_weight,
    special_requirements: normalized.additional_notes || null,
    payment_offer: normalized.payment_offer,
    number_of_trucks_required: normalized.required_trucks,
    is_pooling: normalized.pooling_allowed,
    status: 'available',
  };
};

export const normalizeLegacyLoad = (row = {}, pool = null) => {
  const requiredTrucks = Number(row.number_of_trucks_required || 1);
  const acceptedTrucks = Number(pool?.trucks_assigned || 0);
  const acceptedCapacity = Number(pool?.accepted_capacity || 0);
  const requiredCapacity = Number(row.weight_kg || 0);
  const remaining = Math.max(requiredTrucks - acceptedTrucks, 0);

  const origin = normalizeLegacyLocation(row.origin);
  const destination = normalizeLegacyLocation(row.destination);
  return {
    ...row,
    id: row.load_id,
    load_id: row.load_id,
    origin: origin.label,
    destination: destination.label,
    origin_coordinates: { latitude: origin.latitude, longitude: origin.longitude },
    destination_coordinates: { latitude: destination.latitude, longitude: destination.longitude },
    load_weight: row.weight_kg,
    required_trucks: requiredTrucks,
    pooling_allowed: Boolean(row.is_pooling),
    required_capacity: requiredCapacity || null,
    accepted_trucks: acceptedTrucks,
    accepted_capacity: acceptedCapacity,
    status: normalizeLegacyStatus(row.status),
    pool: {
      required: requiredTrucks,
      accepted: acceptedTrucks,
      remaining,
      required_capacity: requiredCapacity || null,
      accepted_capacity: acceptedCapacity,
      remaining_capacity: requiredCapacity
        ? Math.max(requiredCapacity - acceptedCapacity, 0)
        : null,
      fulfilled: pool?.status === 'full' || remaining === 0,
    },
  };
};

export const buildLegacyBidInsert = (input, user) => {
  const loadId = integerId(input?.load_id, 'load_id');
  const vehicleId = integerId(input?.vehicle_id, 'vehicle_id');
  const companyId = integerId(user?.company_id, 'company_id');
  const driverId = integerId(user?.driver_id, 'driver_id');

  return {
    load_id: loadId,
    company_id: companyId,
    driver_id: driverId,
    vehicle_id: vehicleId,
    bid_amount: numberValue(input.bid_amount, 'bid_amount'),
    proposed_capacity: numberValue(input.proposed_capacity, 'proposed_capacity', { positive: true }),
    status: 'pending',
  };
};

export const normalizeLegacyBid = (row = {}) => {
  const { bid_id: _bidId, bid_time: _bidTime, ...rest } = row;
  return {
    ...rest,
    id: row.bid_id,
    created_at: row.bid_time,
  };
};

export const normalizeLegacyVehicle = (row = {}) => ({
  ...row,
  id: row.vehicle_id,
  registration_number: row.license_plate,
  capacity: row.capacity_kg,
});

export const buildLegacyUser = (profile = {}, relations = {}) => ({
  id: profile.user_id,
  user_id: profile.user_id,
  auth_user_id: profile.auth_user_id,
  full_name: profile.full_name,
  user_type: profile.user_type === 'company_employee' ? 'trucking_company' : profile.user_type,
  raw_user_type: profile.user_type,
  email: profile.email || null,
  phone: profile.phone || null,
  company_id: relations.company_id || null,
  driver_id: relations.driver_id || null,
  shipper_id: relations.shipper_id || null,
  company: relations.company || null,
  company_name: relations.company?.company_name || null,
  company_address: relations.company?.company_address || null,
  address: relations.company?.company_address || null,
  fleet_size: relations.company?.fleet_size || null,
  tax_id: relations.company?.tax_id || null,
  invite_code: relations.company?.invite_code || null,
  organizations: relations.organizations || [],
});

export const getLegacyRelations = (rows = {}) => ({
  company_id: optionalIntegerId(rows.company_id, 'company_id'),
  driver_id: optionalIntegerId(rows.driver_id, 'driver_id'),
  shipper_id: optionalIntegerId(rows.shipper_id, 'shipper_id'),
  company: rows.company || null,
  organizations: rows.organizations || [],
});
