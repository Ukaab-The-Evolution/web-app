import { fetchFleetData } from './fleetData';

describe('fetchFleetData', () => {
  test('keeps successful empty fleet data when the driver request fails', async () => {
    const apiClient = {
      get: jest.fn((path) => {
        if (path === '/api/v1/vehicles') return Promise.resolve({ data: { data: { vehicles: [] } } });
        return Promise.reject({ response: { data: { message: 'Company drivers unavailable' } } });
      }),
    };

    await expect(fetchFleetData(apiClient)).resolves.toEqual({
      vehicles: [],
      drivers: [],
      vehicleError: null,
      driverError: 'Company drivers unavailable',
    });
  });

  test('treats empty successful responses as valid data', async () => {
    const apiClient = {
      get: jest.fn().mockResolvedValue({ data: { data: {} } }),
    };

    await expect(fetchFleetData(apiClient)).resolves.toEqual({
      vehicles: [],
      drivers: [],
      vehicleError: null,
      driverError: null,
    });
  });
});
