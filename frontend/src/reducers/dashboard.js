import {
  DASHBOARD_OVERVIEW_SUCCESS,
  DASHBOARD_OVERVIEW_FAIL,
  DASHBOARD_PIECHART_SUCCESS,
  DASHBOARD_PIECHART_FAIL,
  DASHBOARD_LOADS_SUCCESS,
  DASHBOARD_LOADS_FAIL,
  DASHBOARD_SHIPMENTS_SUCCESS,
  DASHBOARD_SHIPMENTS_FAIL,
  DASHBOARD_LOAD_DETAILS_SUCCESS,
  DASHBOARD_LOAD_DETAILS_FAIL,
  DASHBOARD_SHIPMENT_DETAILS_SUCCESS,
  DASHBOARD_SHIPMENT_DETAILS_FAIL,
  DASHBOARD_BID_SUCCESS,
  DASHBOARD_BID_FAIL,
  DASHBOARD_ACCEPT_LOAD_SUCCESS,
  DASHBOARD_ACCEPT_LOAD_FAIL,
  DASHBOARD_SEARCH_SUCCESS,
  DASHBOARD_SEARCH_FAIL,
} from '../actions/types';

const initialState = {
  overview: null,
  pieChart: null,
  availableLoads: [],
  shipments: [],
  loadDetails: null,
  shipmentDetails: null,
  bidResult: null,
  acceptLoadResult: null,
  searchResults: [],
  loading: false,
  error: null,
};

export default function dashboardReducer(state = initialState, action) {
  switch (action.type) {
    case DASHBOARD_OVERVIEW_SUCCESS:
      return { ...state, overview: action.payload, error: null };
    case DASHBOARD_OVERVIEW_FAIL:
      return { ...state, overview: null, error: action.payload };

    case DASHBOARD_PIECHART_SUCCESS:
      return { ...state, pieChart: action.payload, error: null };
    case DASHBOARD_PIECHART_FAIL:
      return { ...state, pieChart: null, error: action.payload };

    case DASHBOARD_LOADS_SUCCESS:
      return {
        ...state,
        availableLoads: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };
    case DASHBOARD_LOADS_FAIL:
      return { ...state, availableLoads: [], error: action.payload };

    case DASHBOARD_SHIPMENTS_SUCCESS:
      return {
        ...state,
        shipments: Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload.shipments)
            ? action.payload.shipments
            : [],
        loading: false,
        error: null,
      };
    case DASHBOARD_SHIPMENTS_FAIL:
      return { ...state, shipments: [], error: action.payload };

    case DASHBOARD_LOAD_DETAILS_SUCCESS:
      return { ...state, loadDetails: action.payload, error: null };
    case DASHBOARD_LOAD_DETAILS_FAIL:
      return { ...state, loadDetails: null, error: action.payload };

    case DASHBOARD_SHIPMENT_DETAILS_SUCCESS:
      return { ...state, shipmentDetails: action.payload, error: null };
    case DASHBOARD_SHIPMENT_DETAILS_FAIL:
      return { ...state, shipmentDetails: null, error: action.payload };

    case DASHBOARD_BID_SUCCESS:
      return { ...state, bidResult: action.payload, error: null };
    case DASHBOARD_BID_FAIL:
      return { ...state, bidResult: null, error: action.payload };

    case DASHBOARD_ACCEPT_LOAD_SUCCESS:
      return { ...state, acceptLoadResult: action.payload, error: null };
    case DASHBOARD_ACCEPT_LOAD_FAIL:
      return { ...state, acceptLoadResult: null, error: action.payload };

    case DASHBOARD_SEARCH_SUCCESS:
      return {
        ...state,
        searchResults: Array.isArray(action.payload) ? action.payload : [],
        error: null,
      };
    case DASHBOARD_SEARCH_FAIL:
      return { ...state, searchResults: [], error: action.payload };

    default:
      return state;
  }
}