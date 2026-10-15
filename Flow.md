# Flow

## Public entry and authentication

1. `frontend/src/index.js` mounts the router and exposes `/` and `/login`.
2. `frontend/src/components/layout/Landing.js` renders **Get Started** to `/role-selection` for registration and a direct `Link` to `/login` for existing users.
3. `frontend/src/components/layout/RoleSelection.js` collects a registration role and routes to `/register`; its secondary login link bypasses registration when appropriate.
4. `frontend/src/components/auth/Login.js` submits credentials to the Redux `login` action.
5. `frontend/src/actions/auth.js` calls `POST /api/v1/auth/login`, stores the returned bearer token through the auth reducer, and loads the canonical user profile.
6. `frontend/src/components/layout/DashboardLayout.js` reads the canonical `user_type`, selects the role dashboard, and renders `Sidebar`.

### Email verification

1. Signup passes `FRONTEND_URL/auth/callback?verified=1` as Supabase `emailRedirectTo`.
2. `EmailVerificationCallback` exchanges the PKCE code, signs out the temporary verification session, and navigates to `/login?verified=1`.
3. `Login` displays the verified confirmation and remains the only entry point for an authenticated session.

## Fleet management path

1. `DashboardLayout` routes a trucking-company user to `/dashboard/fleet` and renders `frontend/src/components/dashboard/dashboard/TruckingCompanyDashboard.js`.
2. The dashboard calls `fetchFleetData` in `fleetData.js` on mount.
3. `fetchFleetData` requests `GET /api/v1/vehicles` and `GET /api/v1/profile/company-drivers` independently with the shared Axios client. The client attaches the bearer token from `localStorage`.
4. `backend/src/routes/vehicleRoutes.js` applies `protect` and role checks before calling `getMyVehicles` in `vehicleController.js`.
5. `getMyVehicles` scopes the query to `req.user.company_id` (or `req.user.driver_id`), sorts by the stable integer `vehicle_id`, and maps database rows through `normalizeLegacyVehicle`.
6. `backend/src/routes/profileRoutes.js` applies the same protection before calling `getCompanyDrivers` in `profileController.js`.
7. `getCompanyDrivers` reads drivers for the authenticated company, optionally resolves profile names, and returns `{ data: { drivers } }`. No rows is a successful empty result.
8. The dashboard stores the two lists separately, shows onboarding text for empty lists, and shows an operation-specific alert only for a rejected request.

## Fleet write paths

- The invite button calls `POST /api/v1/profile/generate-invite-code` and updates the company invite code.
- The vehicle form calls `POST /api/v1/vehicles` with registration number, vehicle type, capacity, and assigned driver.
- `createVehicle` validates company ownership and driver membership before inserting into `vehicles`.
- On success, the dashboard reloads both fleet resources.

## Error path

1. Supabase query errors are logged by the relevant fleet controller with operation context.
2. The API returns a safe operation-specific `503` response instead of leaking raw database details.
3. `normalizeApiError` extracts the safe message for the UI.
4. `fleetData.js` reports the failed resource without discarding the successful resource.

## Current dependency order

1. Public entry/authentication access.
2. Authenticated role resolution and dashboard routing.
3. Fleet reads and onboarding writes.
4. Load pools, bids, booking acceptance, dispatch, and tracking.

The first three are the implemented dependency chain for this change; the load-pool workflow should not be built on top of a dashboard that can neither be reached directly nor load an empty fleet reliably.

## Operational load flow

1. Dedicated `/dashboard/orders` and `/dashboard/load-requests` pages request the canonical available-load endpoint; `/dashboard/accepted-loads` requests the authenticated user’s bookings.
2. `ShipmentDetails` loads the load, bids, bookings, and audit events independently. A shipper can review pending driver bids and accept one through the atomic `accept_load_bid` RPC; the page reloads pool progress and history afterward.
3. Successful load creation, bid submission, bid acceptance, and booking status changes write scoped `load_events` records.
4. `GET /api/v1/loads/:id/audit` checks load ownership or accepted participation before returning history.
