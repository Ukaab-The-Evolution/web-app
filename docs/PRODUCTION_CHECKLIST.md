# Pilot production checklist

## Supabase

1. Apply `supabase/migrations/202610150001_operational_audit_and_cleanup.sql` in the Supabase SQL Editor after the existing pooling migration.
2. If the unique-index statements report duplicate rows, inspect and clean the duplicate test records first, then rerun this migration. Do not remove valid historical bookings.
3. In Authentication → URL Configuration, add the deployed frontend origin to Site URL and add the exact callback URL as an Additional Redirect URL:
   `https://<frontend-render-host>/auth/callback`
4. Keep email templates using `{{ .ConfirmationURL }}`. The backend supplies the callback URL through `FRONTEND_URL`; no email-template code change is required for the redirect behavior.

## Render

- Backend `FRONTEND_URL`: the frontend’s HTTPS Render URL, with no trailing slash.
- Frontend Supabase variables: the project URL and anon key.
- Backend Supabase variables: the project URL, anon key, service-role key, and the same frontend URL.
- Redeploy the backend after changing `FRONTEND_URL` so new signup emails use the callback.

## Smoke flow

1. Register a new test account.
2. Open its email verification link; it should finish at `/login?verified=1`, not a dashboard.
3. Log in and confirm the role dashboard loads.
4. As a shipper, create a pooled load.
5. As a driver, submit one bid from an assigned available vehicle.
6. As the shipper, open the load details, review the bid, and accept it.
7. Confirm pool progress and Activity history update.
8. Repeat the bid and acceptance requests to confirm the API returns a conflict instead of creating duplicate work.
