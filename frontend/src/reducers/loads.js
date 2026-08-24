import {
  LOADS_FETCH_START,
  LOADS_FETCH_SUCCESS,
  LOADS_FETCH_FAIL,
  LOAD_CREATE_SUCCESS,
  LOAD_CREATE_FAIL,
  LOAD_SELECT_SUCCESS,
  LOAD_BIDS_SUCCESS,
  LOAD_BID_SUCCESS,
  LOAD_ACCEPT_BID_SUCCESS,
  LOAD_ACTION_FAIL,
} from '../actions/types';
import { normalizeLoad } from '../api/client';

const initialState = {
  items: [],
  selected: null,
  bids: [],
  loading: false,
  error: null,
};

export default function loads(state = initialState, action) {
  switch (action.type) {
    case LOADS_FETCH_START:
      return { ...state, loading: true, error: null };
    case LOADS_FETCH_SUCCESS:
      return {
        ...state,
        items: (action.payload || []).map(normalizeLoad),
        loading: false,
        error: null,
      };
    case LOADS_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };
    case LOAD_CREATE_SUCCESS: {
      const created = normalizeLoad(action.payload);
      return {
        ...state,
        items: [created, ...state.items.filter((item) => item.id !== created.id)],
        selected: created,
        loading: false,
        error: null,
      };
    }
    case LOAD_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload };
    case LOAD_SELECT_SUCCESS:
      return { ...state, selected: normalizeLoad(action.payload), bids: [], error: null };
    case LOAD_BIDS_SUCCESS:
      return { ...state, bids: action.payload || [], loading: false, error: null };
    case LOAD_BID_SUCCESS:
      return { ...state, bids: [...state.bids, action.payload], loading: false, error: null };
    case LOAD_ACCEPT_BID_SUCCESS: {
      const allocation = action.payload;
      const selected = state.selected
        ? normalizeLoad({
          ...state.selected,
          status: allocation.status,
          accepted_trucks: allocation.accepted_trucks,
          accepted_capacity: allocation.accepted_capacity,
        })
        : state.selected;
      return { ...state, selected, loading: false, error: null };
    }
    case LOAD_ACTION_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}
