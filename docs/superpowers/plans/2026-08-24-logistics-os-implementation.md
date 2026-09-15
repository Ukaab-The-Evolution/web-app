# Logistics Operating System Implementation Plan (Archived)

> Archived planning notes from the earlier canonical-schema proposal. The current implementation preserves the supplied integer-ID schema; use `docs/superpowers/plans/2026-09-15-production-readiness.md` for the active release plan.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a secure, testable first vertical slice of the trucking/shipping operating system with pooled loads, real API persistence, atomic booking, and live frontend states.

**Architecture:** Supabase Auth remains the authentication provider, while application ownership is represented by canonical `profiles`, `organizations`, `organization_members`, `drivers`, `vehicles`, `loads`, `load_bids`, `bookings`, `shipments`, and `shipment_events` tables. The backend exposes an Express API with token-bound Supabase clients and a database RPC for concurrency-safe pooled booking. The frontend consumes one normalized API contract and removes fake success/mock operational paths.

**Tech Stack:** Node.js 20, Express 4, Supabase JS/Postgres, Jest/Supertest, React 18, React Router, Redux, Axios, Create React App, Docker Compose, Jenkins.

**Spec:** `docs/superpowers/specs/2026-08-24-logistics-os-design.md`

## Global Constraints

- Canonical roles are exactly `shipper`, `trucking_company`, and `driver`.
- Service-role credentials are backend-only and never committed or exposed to the frontend.
- A pooled load closes only when its required truck count/capacity is fulfilled.
- Every protected mutation derives the acting identity from the bearer token.
- Every new behavior has a failing automated test before production code is written.
- Existing user data is not deleted or reset; migrations are additive and explicit.
- CI must fail on test, build, or dependency-contract failures.

---

### Task 1: Establish runtime configuration and a testable Express app

**Files:**
- Create: `backend/src/app.js`
- Create: `backend/src/config/env.js`
- Create: `backend/src/config/env.test.js`
- Modify: `backend/src/config/supabase.js`
- Modify: `backend/src/index.js`
- Modify: `backend/.env.example`
- Modify: `frontend/.env.example`
- Modify: `backend/package.json`

**Interfaces:**
- `loadEnv()` returns `{ supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey, port, frontendUrl, nodeEnv }` and throws a named configuration error when a required backend variable is absent.
- `createApp()` returns an Express app without binding a network port, allowing Supertest to exercise routes.
- `index.js` imports `createApp()`, creates HTTP/Socket.IO servers, and listens only when executed directly.

- [ ] Write `backend/src/config/env.test.js` with tests that reject a missing `SUPABASE_SERVICE_ROLE_KEY`, accept all required variables, and reject a frontend API URL that contains a trailing period.
- [ ] Run `cd backend && node --experimental-vm-modules node_modules/jest/bin/jest.js src/config/env.test.js --runInBand`; confirm the tests fail because the new module does not exist.
- [ ] Implement `loadEnv()` with explicit required-variable checks and safe error messages that name variables but never print values.
- [ ] Refactor Supabase client creation to use the validated configuration, retain `createUserClient(token)`, and use `Authorization: Bearer <token>` when binding a user client.
- [ ] Extract Express middleware/routes from `index.js` into `createApp()` and add Helmet, bounded JSON bodies, and a single error response shape.
- [ ] Update both environment examples; add `SUPABASE_SERVICE_ROLE_KEY` to the backend example and a real local `REACT_APP_API_URL` value without punctuation.
- [ ] Run the focused config test and `node --check` on changed backend files; confirm green.
- [ ] Commit `chore: establish validated runtime configuration`.

### Task 2: Add the canonical additive database migration and data contracts

**Files:**
- Create: `supabase/migrations/202608240001_canonical_logistics.sql`
- Create: `backend/src/domain/constants.js`
- Create: `backend/src/domain/validation.js`
- Create: `backend/src/domain/validation.test.js`
- Modify: `README.md`

**Interfaces:**
- SQL creates canonical tables and constraints without dropping existing tables.
- `normalizeRole(value)` maps legacy UI values to canonical values and rejects unknown roles.
- `validateLoadInput(input)` returns a normalized load object with numeric truck/capacity/payment fields and rejects invalid ranges.

- [ ] Write validation tests for role mapping, positive `required_trucks`, non-negative payment, origin/destination presence, and pooled versus non-pooled defaults.
- [ ] Run the focused domain tests and verify they fail before implementation.
- [ ] Implement constants and pure validation functions with no Supabase dependency.
- [ ] Write the migration for profiles/organizations/memberships, driver and vehicle ownership, loads, bids, bookings, shipments, shipment events, unique constraints, status checks, and indexes.
- [ ] Add a Postgres function `accept_load_bid(p_load_id uuid, p_bid_id uuid, p_actor_user_id uuid)` that locks the load, verifies role/ownership/status, rejects duplicate or over-capacity acceptance, inserts the booking, updates pool counters, and creates a shipment only when the requirement is fulfilled.
- [ ] Add a migration README section describing how to inspect the existing Supabase schema and apply the additive migration manually.
- [ ] Run domain tests and SQL syntax checks available locally; commit `feat: add canonical logistics model and pooling transaction`.

### Task 3: Repair authentication, roles, organizations, and protected access

**Files:**
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/controllers/auth/authController.test.js`
- Create: `backend/src/controllers/profileController.test.js`
- Modify: `backend/src/controllers/auth/authController.js`
- Modify: `backend/src/models/User.js`
- Modify: `backend/src/controllers/profileController.js`
- Modify: `backend/src/routes/authRoutes.js`
- Modify: `backend/src/routes/profileRoutes.js`
- Modify: `frontend/src/actions/auth.js`
- Modify: `frontend/src/reducers/auth.js`
- Modify: `frontend/src/components/providers/SupabaseAuthProvider.js`
- Modify: `frontend/src/components/layout/DashboardLayout.js`
- Modify: `frontend/src/components/layout/ProfileLayout.js`
- Modify: `frontend/src/utils/fieldsConfig.js`

**Interfaces:**
- Signup accepts canonical `user_type`, `full_name`, email or phone, password, organization fields, and returns `{ user, session, needs_verification }`.
- `protect` attaches `{ user_id, auth_user_id, user_type, organization_id, driver_id }` from the token-bound client.
- `requireRole(...roles)` and `requireOrganizationMember()` are reusable middleware.
- Frontend auth actions return rejected promises on API failure and store the canonical user shape.

- [ ] Write tests for canonical role normalization, protected access without a token, protected access with a valid token, company/member profile retrieval, and failed signup cleanup behavior.
- [ ] Run the auth/profile tests and verify the new assertions fail.
- [ ] Implement profile lookup by `auth_user_id` first, then migrate legacy email lookup only as a compatibility fallback.
- [ ] Remove the `users` table update path, create the correct driver/shipper/company records, and make organization membership explicit.
- [ ] Bind protected queries to `createUserClient(token)` or use narrowly scoped RPCs; reserve `supabaseAdmin` for controlled admin operations.
- [ ] Normalize frontend role values and send `owns_company`/organization data explicitly.
- [ ] Replace OTP calls with Supabase email verification, align forgot/reset routes and token handling, and remove token/session console logging.
- [ ] Add route guards so `/dashboard/*` requires an authenticated session and does not default unknown roles to shipper.
- [ ] Run the focused tests and frontend build; commit `feat: normalize authentication and protected access`.

### Task 4: Implement the load, pool participation, bidding, and booking API

**Files:**
- Create: `backend/src/controllers/loadController.js`
- Create: `backend/src/routes/loadRoutes.js`
- Create: `backend/src/controllers/loadController.test.js`
- Modify: `backend/src/app.js`
- Modify: `backend/src/controllers/dashboardController.js`
- Modify: `backend/src/routes/dashboardRoutes.js`
- Modify: `backend/src/routes/bookingRoutes.js`
- Modify: `backend/src/controllers/bookingController/postOrder.js`
- Modify: `backend/src/controllers/bookingController/respondOffer.js`
- Modify: `backend/src/controllers/bookingController/truckLocationUpdate.js`

**Interfaces:**
- `POST /api/v1/loads` creates a load for the authenticated shipper organization.
- `GET /api/v1/loads/available` returns normalized loads with `pool.required`, `pool.accepted`, and `pool.remaining`.
- `POST /api/v1/loads/:id/bids` creates one unique driver/vehicle bid.
- `GET /api/v1/loads/:id/bids` returns bids only to the owning shipper organization or participating driver/company.
- `POST /api/v1/loads/:id/bids/:bidId/accept` calls the atomic database function and returns the updated pool state.
- Legacy booking beta routes are either removed from the app or protected and marked unavailable until migrated.

- [ ] Write Supertest tests for shipper-only load creation, driver-only bidding, duplicate bid rejection, shipper-only acceptance, pooled acceptance below the requirement, final acceptance that creates a shipment, and overfill rejection.
- [ ] Run the focused API tests and confirm they fail before route/controller implementation.
- [ ] Implement request validation and ownership queries using the authenticated identity rather than body-supplied IDs.
- [ ] Implement load listing/detail normalization and pagination with stable status filters.
- [ ] Implement bid creation with a unique driver/vehicle/load rule and a pending status.
- [ ] Implement acceptance through the Postgres function and emit notifications only after success.
- [ ] Add authentication and owner checks to location updates and offer response paths, or remove those beta endpoints from routing.
- [ ] Run backend tests with a deterministic Supabase adapter or test database fixture; commit `feat: implement pooled load and booking APIs`.

### Task 5: Connect the frontend auth, load creation, pooling, and bid flows

**Files:**
- Create: `frontend/src/api/client.js`
- Create: `frontend/src/api/client.test.js`
- Create: `frontend/src/actions/loads.js`
- Create: `frontend/src/reducers/loads.js`
- Modify: `frontend/src/store.js`
- Modify: `frontend/src/index.js`
- Modify: `frontend/src/components/dashboard/loadRequest/LoadRequest.js`
- Modify: `frontend/src/components/dashboard/dashboard/TruckDriverDashboard.js`
- Modify: `frontend/src/components/dashboard/dashboard/ShipperDashboard.js`
- Modify: `frontend/src/components/dashboard/dashboard/TruckingCompanyDashboard.js`
- Modify: `frontend/src/components/layout/Sidebar.js`
- Modify: `frontend/src/components/dashboard/shipments/Shipments.js`
- Modify: `frontend/src/components/ui/ShipmentsList.js`

**Interfaces:**
- API client adds the Supabase access token to protected requests and rejects non-2xx responses.
- Load actions expose `createLoad`, `getAvailableLoads`, `getLoad`, `submitBid`, `getLoadBids`, and `acceptBid`.
- Load state stores `{items, selected, bids, loading, error}` without response-shape guessing.
- The load form submits numeric values and displays pool progress from the server response.

- [ ] Write frontend tests for API token headers, failed request rejection, load-form submission payload normalization, and rendering pool progress for remaining trucks.
- [ ] Run the focused frontend tests and confirm failure before implementation.
- [ ] Implement one Axios client with a response interceptor for 401 sign-out and no token logging.
- [ ] Implement load actions/reducer with explicit API response types.
- [ ] Replace the load form's `console.log`/fake success path with `createLoad` and preserve form data on failure.
- [ ] Add driver load cards with bid/join actions and shipper bid lists with accept actions.
- [ ] Remove dummy shipment fallback data from live operational views and render loading/error/empty states.
- [ ] Fix route paths, role-driven navigation, missing handlers, and the shipment-details `location` reference.
- [ ] Run frontend tests and build; commit `feat: connect live pooled load frontend flows`.

### Task 6: Repair profiles, verification, password reset, and operational settings

**Files:**
- Create: `backend/src/controllers/documentController.js`
- Create: `backend/src/routes/documentRoutes.js`
- Create: `frontend/src/actions/documents.js`
- Modify: `backend/src/controllers/uploadController.js`
- Modify: `backend/src/routes/uploadRoutes.js`
- Modify: `frontend/src/actions/profile.js`
- Modify: `frontend/src/components/dashboard/profile/DriverProfile.js`
- Modify: `frontend/src/components/dashboard/profile/ShipperProfile.js`
- Modify: `frontend/src/components/dashboard/profile/TruckingCompanyProfile.js`
- Modify: `frontend/src/components/dashboard/settings/ChangePassword.js`
- Modify: `frontend/src/components/dashboard/settings/Settings.js`
- Modify: `frontend/src/components/auth/ForgotPassword.js`
- Modify: `frontend/src/components/auth/ResetPassword.js`

**Interfaces:**
- Profile update uses `PATCH /api/v1/profile` and returns the canonical profile.
- Document upload uses bounded multipart validation and records a reviewable document status.
- Change password calls the protected backend endpoint and reports server failures.
- Account deletion calls an explicit backend endpoint only after confirmation and removes the authenticated account/application data according to the migration policy.

- [ ] Write tests for PATCH profile updates, invite-code endpoint alignment, document size/type rejection, password update authorization, and reset-link failure handling.
- [ ] Run focused tests and confirm failure before changing implementation.
- [ ] Align frontend endpoint methods/paths and make action thunks reject errors so components cannot show false success.
- [ ] Implement document upload limits, allowed MIME types, and persisted verification status.
- [ ] Replace fake password change and fake account deletion flows with real API calls and confirmation states.
- [ ] Remove temporary object URLs on replacement/unmount and add accessible labels/actions for profile controls.
- [ ] Run focused frontend/backend tests; commit `feat: make profile and account operations real`.

### Task 7: Harden deployment, dependencies, and quality gates

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `backend/package.json`
- Modify: `backend/Dockerfile`
- Modify: `frontend/Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `Jenkinsfile`
- Modify: `.gitignore`
- Create: `backend/.env.test.example`
- Create: `frontend/src/setupTests.js`

**Interfaces:**
- `npm test -- --runInBand` is deterministic in backend and frontend CI.
- `npm run build` succeeds from a clean checkout without manual symlinks or lockfile deletion.
- Docker services use the same documented ports and never contain secrets.

- [ ] Add direct `redux` and `prop-types` dependencies, update lockfiles, and verify a clean install resolves them.
- [ ] Add frontend test setup and explicit test scripts that run once in CI.
- [ ] Remove `|| true` from Jenkins tests and stop deleting lockfiles.
- [ ] Align Docker Node versions/ports, remove hardcoded Supabase values, and pass secrets through environment files or deployment configuration.
- [ ] Add a backend test environment example with non-secret placeholders.
- [ ] Fix case-sensitive asset paths and any production-only asset failures.
- [ ] Run clean dependency install, backend tests, frontend tests, frontend build, and Docker configuration validation; commit `ci: enforce reproducible builds and tests`.

### Task 8: Full verification and handoff

**Files:**
- Modify: `README.md`
- Create: `docs/superpowers/verification/2026-08-24-logistics-os-verification.md`

- [ ] Run `git status --short` and confirm only intentional implementation files are changed.
- [ ] Run backend tests with coverage and confirm all pooling/auth/ownership cases pass.
- [ ] Run frontend tests and production build from a clean dependency state.
- [ ] Start the backend with documented environment keys without printing secrets.
- [ ] Start the frontend against the backend and verify registration, login, load creation, multi-driver pooling, final acceptance, shipment creation, profile update, and sign-out.
- [ ] Verify that a second concurrent acceptance cannot overfill a pooled load.
- [ ] Verify unauthorized load/bid/location requests return 401/403.
- [ ] Record any checks that require applying the Supabase migration or external provider configuration in the verification document.
- [ ] Commit `docs: record logistics operating system verification`.
