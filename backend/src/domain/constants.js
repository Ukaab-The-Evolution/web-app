export const USER_TYPES = Object.freeze({
  SHIPPER: 'shipper',
  TRUCKING_COMPANY: 'trucking_company',
  DRIVER: 'driver',
});

export const LOAD_STATUSES = Object.freeze({
  OPEN: 'open',
  BOOKED: 'booked',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

export const BID_STATUSES = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
});

export const BOOKING_STATUSES = Object.freeze({
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});
