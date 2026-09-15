# Production pilot readiness

## Summary

- Align the backend contract with the supplied integer-ID Supabase schema.
- Secure the API behind Supabase bearer-token authentication and role/ownership checks.
- Make pooled load creation and bid acceptance transactional, capacity-aware, and concurrency-safe.
- Add driver onboarding by UUID invite code, company fleet assignment, assigned-trip visibility, vehicle reservation, and booked → in-transit → delivered transitions.
- Remove fake/legacy operational flows, unsupported Google/OTP UI, false verification success, and nonfunctional settings.
- Add Render configuration, production frontend serving, lint/test/build gates, and dependency checks.

## Required database step before deployment

Apply `supabase/migrations/202609010001_current_schema_pooling.sql` to the target Supabase project before testing load creation, pooled acceptance, profile fields, or booking lifecycle transitions. The live project was reachable during read-only verification, but `create_load_with_pool` was not yet installed.

Also create a private Supabase Storage bucket named `documents` for document uploads.

## Render configuration

The root `render.yaml` defines the backend Node service and frontend static site. Configure the `sync: false` values in Render with the Supabase and deployed-service values described in `README.md`. Keep `SUPABASE_SERVICE_ROLE_KEY` on the backend only.

## Verification completed

- Backend: 9 suites, 29 tests passed.
- Frontend: 3 suites, 7 tests passed.
- Frontend lint: passed with zero warnings/errors.
- Frontend production build: passed.
- Backend/frontend runtime dependency audits: 0 high-severity findings.
- JavaScript syntax and `git diff --check`: passed.

## Post-merge release check

After applying the migration, run the authenticated pilot flow with a shipper and at least two driver/company accounts. Verify duplicate bids, over-capacity acceptance, vehicle reuse prevention, trip status transitions, document upload, and the Render health endpoint before inviting pilot users.
