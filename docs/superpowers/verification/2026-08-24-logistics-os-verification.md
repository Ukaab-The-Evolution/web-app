# Logistics OS verification

## Verified locally

- Backend: 6 suites, 17 tests passed with Node ESM support and coverage enabled.
- Frontend: 2 suites, 5 tests passed in CI mode.
- Frontend production build completed successfully.
- Backend smoke test returned `200` for `/api/v1/health` and `401` for protected load and vehicle routes without a token.
- `git diff --check` passed.
- No Supabase service credential remains in source-controlled compose or application files.

## Requires environment/provider setup

- The local backend environment must contain `SUPABASE_SERVICE_ROLE_KEY`; the existing local `.env` was not modified or copied into source control.
- Apply `supabase/migrations/202608240001_canonical_logistics.sql` to the target Supabase project before exercising signup, profile, vehicle, load, bid, booking, document, or shipment persistence.
- Configure Supabase Auth email/phone providers and redirect URLs for password reset and Google sign-in.
- A live multi-driver acceptance/concurrency check requires the applied migration and two authenticated users; it was not simulated against production data.
