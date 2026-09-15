# Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Ukaab trucking and shipping operating-system vertical slice safe to deploy, complete the authenticated pooled-load workflow, and prepare a reviewed pull request targeting `main`.

**Architecture:** Keep the existing integer-ID Supabase schema and expose one stable `/api/v1` contract. The backend remains the authorization boundary and uses a single atomic Supabase function for pooled acceptance; the frontend consumes normalized load, pool, booking, and shipment state. Production deployment uses a Node backend service and a built static frontend.

**Tech Stack:** Node.js 20, Express, Supabase Auth/Postgres/Storage, PostgreSQL functions, React 18, Redux, React Router, Jest, Supertest, Create React App, Docker, Render.

**Spec:** `docs/superpowers/specs/2026-08-24-logistics-os-design.md`

## Global Constraints

- Preserve the existing integer identifiers and database table/column names.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit credentials/tokens.
- All load, bid, vehicle, booking, profile, document, and account writes require authenticated authorization.
- Pooled acceptance must be atomic, reject duplicates/overfill, and report truck and capacity completion consistently.
- The frontend must not show success for an operation that did not persist.
- Render deployment must use the backend production start command and frontend production build output.
- Tests must fail for the target regression before the implementation and pass after it.

---

### Task 1: Secure the release surface and remove competing APIs

**Files:**
- Modify: `docker-compose.yml`
- Modify: `backend/src/routes/bookingRoutes.js`
- Modify: `backend/src/controllers/bookingController/*`
- Modify: `backend/src/app.js`
- Modify: `.gitignore`
- Modify: `backend/src/http-tests/*.http`
- Test: `backend/src/app.test.js`

- [x] Remove tracked credentials and bearer tokens, and make local configuration reference environment variables only. Any key previously committed must still be rotated by the owner in Supabase.
- [x] Remove legacy beta booking routes until they are migrated to canonical loads/bookings, preventing unauthenticated service-role writes.
- [x] Add route-level smoke tests proving health is public and canonical operational writes require authentication.

### Task 2: Make authentication and organization onboarding complete

**Files:**
- Modify: `backend/src/controllers/auth/authController.js`
- Modify: `backend/src/controllers/profileController.js`
- Modify: `backend/src/services/authService.js`
- Modify: `frontend/src/actions/auth.js`
- Remove: the unsupported Google/OTP authentication components
- Modify: `frontend/src/components/auth/Register.js`
- Modify: `frontend/src/components/dashboard/profile/DriverProfile.js`
- Test: `backend/src/services/authService.test.js`
- Test: `frontend/src/actions/auth.test.js`

- [x] Define one supported email-verification flow and remove the nonfunctional OTP/Google flow.
- [x] Implement driver company-code joining through the UI and backend, with clear invite-code semantics.
- [x] Verify password reset, password change, logout, and account deletion error behavior without leaking credentials or creating false success.

### Task 3: Finish pooled loads, bookings, and shipment state

**Files:**
- Modify: `supabase/migrations/202609010001_current_schema_pooling.sql`
- Modify: `backend/src/controllers/loadController.js`
- Modify: `backend/src/services/currentSchemaService.js`
- Create/modify: `backend/src/controllers/shipmentController.js`
- Create/modify: `backend/src/routes/shipmentRoutes.js`
- Modify: `frontend/src/actions/loads.js`
- Modify: `frontend/src/reducers/loads.js`
- Modify: `frontend/src/components/dashboard/shipments/ShipmentDetails.js`
- Modify: `frontend/src/components/dashboard/shipments/Shipments.js`
- Test: `backend/src/services/currentSchemaService.test.js`
- Test: `backend/src/controllers/loadController.test.js`
- Test: `frontend/src/api/client.test.js`

- [x] Make fulfilled state require both truck count and capacity everywhere.
- [x] Make load-plus-pool creation transactional through `create_load_with_pool`.
- [x] Preserve atomic bid acceptance through `accept_load_bid` and persist booking/pool/load state consistent with the available schema.
- [x] Add driver bid, shipper acceptance, remaining-capacity, and post-booking states to the UI.
- [x] Enforce authorization and duplicate/over-capacity rules in the backend and database function.

### Task 4: Complete fleet, assignment, tracking, and profile workflows

**Files:**
- Modify: `backend/src/controllers/vehicleController.js`
- Modify: `backend/src/controllers/uploadController.js`
- Modify: `backend/src/controllers/profileController.js`
- Modify: `frontend/src/components/dashboard/dashboard/TruckingCompanyDashboard.js`
- Modify: `frontend/src/components/dashboard/profile/*`
- Modify: `frontend/src/components/dashboard/settings/Settings.js`
- Modify: `frontend/src/components/dashboard/settings/ChangePassword.js`
- Modify: load controller and shipment details for assigned bookings and lifecycle updates
- Test: backend and frontend workflow tests

- [x] Replace raw numeric driver-ID entry with company-driver selection and validated assignment.
- [x] Remove the misleading profile-photo upload affordance from the pilot workflow.
- [x] Validate document type before storage upload and clean up storage on database failure.
- [x] Add a validated pilot vehicle-location update path and show the latest persisted location on shipment details.
- [x] Remove the nonfunctional notification-preference toggle.

### Task 5: Repair navigation, accessibility, and dead code

**Files:**
- Modify: `frontend/src/index.js`
- Modify: `frontend/src/components/layout/DashboardLayout.js`
- Modify: `frontend/src/components/layout/ProfileLayout.js`
- Modify: `frontend/src/components/layout/Sidebar.js`
- Modify: `frontend/src/components/ui/ShipmentsList.js`
- Remove or isolate: unused beta dashboard actions/components
- Test: frontend route and accessibility checks

- [x] Ensure every visible navigation item maps to a real route and active state.
- [x] Use semantic buttons/links with keyboard access and accessible labels.
- [x] Remove undefined dummy shipment references and stale fake operational components.
- [x] Ensure unknown roles fail closed instead of rendering a shipper dashboard.

### Task 6: Add production quality gates and deployment configuration

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/.eslintrc.json`
- Modify: `backend/package.json`
- Modify: `frontend/Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `Jenkinsfile`
- Modify: `README.md`
- Modify: `docs/superpowers/verification/*`

- [x] Add linting and formatting checks that fail CI on real errors.
- [x] Add deterministic unit, API, and frontend tests with no test suppression.
- [x] Serve the frontend production build in deployment and document Render fields and environment variables.
- [x] Update verification documentation to match the actual migration and test counts.

### Task 7: Verify, review, commit, push, and open the pull request

- [x] Run backend tests, frontend tests, lint, builds, dependency checks, and `git diff --check` from the candidate tree.
- [x] Add unauthenticated/authorization smoke coverage; live authenticated workflow verification remains a post-migration deployment check.
- [x] Review the complete diff against `main` and confirm no secrets are present.
- [ ] Commit the implementation on `codex/logistics-os`.
- [ ] Push the branch and open a pull request targeting `main` with deployment and database migration instructions.

## Release gate outside the repository

The live Supabase project was reachable during read-only verification, but it did not yet expose `create_load_with_pool` (`PGRST202`). Apply `supabase/migrations/202609010001_current_schema_pooling.sql`, then run the authenticated driver-to-shipper pooled-load flow before enabling the pilot. This is intentionally left as a deployment prerequisite because applying a migration changes the user's production database.
