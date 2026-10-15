import { normalizeApiError } from '../../../api/client';

const readList = (result, key) => result?.value?.data?.data?.[key] || [];

export const fetchFleetData = async (apiClient) => {
  const [vehicleResult, driverResult] = await Promise.allSettled([
    apiClient.get('/api/v1/vehicles'),
    apiClient.get('/api/v1/profile/company-drivers'),
  ]);

  return {
    vehicles: readList(vehicleResult, 'vehicles'),
    drivers: readList(driverResult, 'drivers'),
    vehicleError: vehicleResult.status === 'rejected' ? normalizeApiError(vehicleResult.reason) : null,
    driverError: driverResult.status === 'rejected' ? normalizeApiError(driverResult.reason) : null,
  };
};
