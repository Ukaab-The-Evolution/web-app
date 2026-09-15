import loads from './loads';
import {
  LOAD_CREATE_SUCCESS,
  LOADS_FETCH_SUCCESS,
  LOAD_BIDS_SUCCESS,
} from '../actions/types';

describe('loads reducer', () => {
  test('stores normalized available pooled loads', () => {
    const state = loads(undefined, {
      type: LOADS_FETCH_SUCCESS,
      payload: [{
        id: 'load-1',
        required_trucks: 3,
        accepted_trucks: 1,
        required_capacity: 30000,
        accepted_capacity: 10000,
      }],
    });

    expect(state.items[0].pool.remaining).toBe(2);
    expect(state.loading).toBe(false);
  });

  test('stores a created load and server-returned bids', () => {
    const created = loads(undefined, {
      type: LOAD_CREATE_SUCCESS,
      payload: { id: 'load-1', required_trucks: 1, accepted_trucks: 0 },
    });
    const withBids = loads(created, {
      type: LOAD_BIDS_SUCCESS,
      payload: [{ id: 'bid-1', status: 'pending' }],
    });

    expect(withBids.selected.id).toBe('load-1');
    expect(withBids.bids).toHaveLength(1);
  });
});
