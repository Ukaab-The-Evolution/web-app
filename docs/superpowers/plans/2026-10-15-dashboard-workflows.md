# Dashboard workflow and verification redirect plan

## Goal

Make the current pilot flow usable from email verification through role-specific dashboard work: verification links land on login, dashboard routes map to dedicated pages, shipper bid review/acceptance is reliable, data panels have consistent retry behavior, operational events are auditable, and duplicate/assignment protections are covered by tests.

## Dependency order

1. Trace and lock the email redirect, route map, canonical loads state, and load mutation contracts.
2. Add failing tests for the redirect and route ownership, then implement them.
3. Remove dead dashboard selectors/reducer usage and add canonical load selectors.
4. Replace generic sidebar destinations with dedicated available-pool and assigned-trip screens.
5. Harden shipper bid review/acceptance with independent loading/error/retry states and refresh after acceptance.
6. Standardize loading, empty, error, and retry states across the active dashboard data panels.
7. Add a database-backed load event history and a protected audit endpoint/UI, while keeping core mutations operational if the migration has not yet been applied.
8. Add controller/service tests for duplicate bids, invalid assignments, acceptance ownership, status transitions, and audit reads; then run the full verification suite.

## Verification gates

- Backend Jest suite passes.
- Frontend Jest and lint pass.
- Frontend production build passes.
- Migration is syntactically reviewed and documented for application in Supabase SQL editor.
- Route and UI behavior is checked against the canonical API response shapes.
