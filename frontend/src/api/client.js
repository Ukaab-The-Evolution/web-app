import axios from 'axios';

export const buildAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const normalizeApiError = (error) => (
  error?.response?.data?.message
  || error?.response?.data?.error
  || error?.message
  || 'Request failed'
);

export const normalizeLoad = (load = {}) => {
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
    ...load,
    pool: load.pool || {
      required,
      accepted,
      remaining,
      required_capacity: requiredCapacity,
      accepted_capacity: acceptedCapacity,
      remaining_capacity: remainingCapacity,
      pooling_allowed: Boolean(load.pooling_allowed),
      fulfilled: remaining === 0 && (remainingCapacity === null || remainingCapacity === 0),
    },
  };
};

const apiBaseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => ({
  ...config,
  headers: {
    ...config.headers,
    ...buildAuthHeaders(),
  },
}));

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
