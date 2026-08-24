# Logistics Operating System Design

**Date:** 2026-08-24  
**Status:** Proposed for implementation

## Goal

Turn the current prototype into a dependable first version of a trucking and shipping operating system with one complete workflow: authenticated users and organizations, pooled load requirements, trucker participation, bidding, atomic booking, shipment progress, and operational dashboards.

## Scope

The first implementation slice covers:

1. Environment validation and safe Supabase client configuration.
2. Canonical identity and role handling for shippers, trucking companies, and drivers.
3. Shipper load creation with a required truck count/capacity.
4. Driver/company participation in a load pool.
5. Bids and shipper acceptance.
6. Atomic booking allocation so a load cannot be overfilled.
7. Shipment and load status visibility.
8. Real frontend API integration for the above flows.
9. Authentication, authorization, tests, and CI verification.

Future ERP capabilities such as payroll, invoicing, maintenance, dispatch optimization, and advanced analytics remain outside this slice but must be able to build on the canonical model.

## Canonical domain model

The application will use these concepts consistently across backend, frontend, and database:

- `profiles`: one application profile linked to one Supabase Auth user.
- `organizations`: a shipper or trucking company account.
- `organization_members`: users belonging to organizations with explicit roles.
- `drivers`: driver-specific data and optional trucking-company membership.
- `vehicles`: trucks owned or managed by a trucking company and optionally assigned to a driver.
- `loads`: a shipper request with origin, destination, cargo, payment, and required pool capacity.
- `load_participants`: drivers/vehicles that have joined or bid on a load.
- `bookings`: accepted allocations from a load to one participant.
- `shipments`: the operational record created when a load becomes booked.
- `shipment_events`: append-only status/location events.

Existing `orders_beta`, `offers_beta`, and `trucks_beta` code will not be used by the canonical frontend. It will be isolated until it can be migrated to these contracts.

## Pooling behavior

Pooling is a first-class requirement, not a display-only feature.

- A load has `required_trucks` and may optionally have `required_capacity`.
- A driver joins a pool by selecting an eligible vehicle and submitting a bid/participation request.
- The load remains `open` while accepted capacity/count is below the requirement.
- The shipper can accept individual participants until the requirement is filled.
- The final acceptance that fills the requirement transitions the load to `booked` and creates the shipment.
- The database transition must lock the load row or use an atomic conditional update so two concurrent acceptances cannot exceed the required count.
- Duplicate participation by the same driver/vehicle for the same load is rejected by a unique constraint.
- If pooling is disabled, the first accepted booking closes the load.
- Cancellation releases the allocated capacity and returns the load to `open` when the requirement is no longer met.
- Notifications are emitted only after the database transaction succeeds.

## API contract

The backend will expose stable REST contracts under `/api/v1`:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /profile`
- `PATCH /profile`
- `POST /loads`
- `GET /loads/available`
- `GET /loads/:id`
- `POST /loads/:id/participants`
- `POST /loads/:id/bids`
- `GET /loads/:id/bids`
- `POST /loads/:id/bids/:bidId/accept`
- `GET /shipments`
- `GET /shipments/:id`
- `POST /shipments/:id/events`

All protected routes derive the acting user from the bearer token and enforce organization/ownership rules server-side. Client-supplied user IDs will not be trusted for authorization.

## Frontend behavior

- Registration maps UI role labels to canonical backend values.
- Dashboard routes require a valid session and render the correct role-specific view.
- Shippers can create a real load with numeric truck/capacity requirements.
- Drivers can see eligible open loads, join a pool, and submit bids.
- Shippers can see pool progress and accept participants until the requirement is fulfilled.
- Empty, loading, error, and unauthorized states are explicit; mock shipment fallback data is removed from operational views.
- API failures must prevent success navigation/toasts.

## Security and reliability

- `SUPABASE_SERVICE_ROLE_KEY` is backend-only and must never be committed or exposed to the frontend.
- All booking and location routes require authentication and ownership checks.
- Uploaded documents have bounded size/type validation.
- Socket connections authenticate before joining user-specific rooms.
- Database uniqueness, foreign keys, check constraints, and transactional functions protect state transitions.
- Request validation returns consistent errors.
- Logs must not contain access tokens, passwords, or service keys.

## Environment finding

The current `backend/.env` contains `SUPABASE_URL` and `SUPABASE_KEY` but does not contain `SUPABASE_SERVICE_ROLE_KEY`, even though the current backend configuration requires it. Implementation will fail fast with a clear configuration message and the environment template will document the required backend-only variable without including any secret value.

## Verification criteria

The implementation is complete for this slice when:

1. Backend starts using the documented environment contract.
2. Frontend builds without undeclared dependency workarounds.
3. Auth and role tests pass.
4. A shipper can create a load through the UI and retrieve it from the API.
5. Multiple drivers can join/bid on one pooled load.
6. Concurrent acceptance cannot overfill the pool.
7. The load changes to `booked` only when its requirement is fulfilled.
8. Unauthorized users cannot read or mutate other organizations' records.
9. The core frontend views use live API data and no fake success paths.
10. CI fails on test or build failure.
