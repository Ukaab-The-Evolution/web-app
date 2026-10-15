const emptyLoadsState = { items: [], loading: false, error: null, selected: null, bids: [] };

export const selectLoadsState = (state) => state.loads || emptyLoadsState;
export const selectLoads = (state) => selectLoadsState(state).items || [];
export const selectLoadsLoading = (state) => Boolean(selectLoadsState(state).loading);
export const selectLoadsError = (state) => selectLoadsState(state).error || '';
export const selectLoadBids = (state) => selectLoadsState(state).bids || [];

