import {
  PROFILE_GET_SUCCESS,
  PROFILE_GET_FAIL,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_FAIL,
  PROFILE_JOIN_COMPANY_SUCCESS,
  PROFILE_JOIN_COMPANY_FAIL,
  PROFILE_GENERATE_INVITE_SUCCESS,
  PROFILE_GENERATE_INVITE_FAIL,
} from '../actions/types';

const initialState = {
  profile: null,
  loading: false,
  error: null,
  inviteCode: null,
  joinMessage: null,
};

export default function profile(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case PROFILE_GET_SUCCESS:
      return {
        ...state,
        profile: payload,
        loading: false,
        error: null,
      };
    case PROFILE_GET_FAIL:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case PROFILE_UPDATE_SUCCESS:
      return {
        ...state,
        profile: payload,
        loading: false,
        error: null,
      };
    case PROFILE_UPDATE_FAIL:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case PROFILE_JOIN_COMPANY_SUCCESS:
      return {
        ...state,
        joinMessage: payload,
        loading: false,
        error: null,
      };
    case PROFILE_JOIN_COMPANY_FAIL:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case PROFILE_GENERATE_INVITE_SUCCESS:
      return {
        ...state,
        inviteCode: payload,
        loading: false,
        error: null,
      };
    case PROFILE_GENERATE_INVITE_FAIL:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    default:
      return state;
  }
}