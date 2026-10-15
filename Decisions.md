# Decisions

This file records the reasoning behind implementation choices for the current pilot slice.

## 2026-10-15 — Make login a first-class home-page action

The landing page previously sent every visitor to role selection through **Get Started** and provided no direct login action. Role selection is required for registration because it determines the account type; it is not required for an existing user who already has an account and role. The landing page now keeps **Get Started** for registration and adds a visible `/login` link. Role selection also includes the same link as a recovery path for users who arrive there directly.

## 2026-10-15 — Keep fleet reads independent

Vehicle data and company-driver data are separate resources. Coupling them with `Promise.all` meant one failed request replaced an otherwise valid empty fleet with the misleading global message “Something went very wrong!”. The frontend now uses `Promise.allSettled`, preserves successful responses—including empty arrays—and reports vehicle and driver failures independently.

## 2026-10-15 — Use a stable vehicle sort key

The fleet list does not need the optional location timestamp to render. Sorting by `vehicle_id` is supported by the current integer-ID schema and avoids making initial fleet loading depend on location-tracking columns. Location tracking remains available in the separate update endpoint.

## 2026-10-15 — Log database details server-side, return safe operational messages

Raw Supabase errors are useful for operators but can expose implementation details to users. Fleet controllers now log the Supabase code/message/details/hint on the server and return an operation-specific 503 message to the client. This makes production failures diagnosable without leaking database internals.

## 2026-10-15 — Verification links must end at login

The confirmation URL now lands on a small frontend callback that completes the PKCE exchange, signs out the temporary verification session, and redirects to `/login?verified=1`. This keeps email verification separate from the normal authenticated dashboard session and gives the user a clear next action.

## 2026-10-15 — One canonical dashboard data contract

The active screens already use the pooled-load state under `state.loads`; the old `state.dashboard` reducer and selectors described a different response shape and were not connected to active actions. They were removed from the store, and role dashboards now use shared load selectors. Sidebar destinations now point to dedicated available-pool and assigned-trip screens instead of reusing a generic shipment screen.

## 2026-10-15 — Audit events are best-effort for the pilot, mutations remain authoritative

Load, bid, booking, and status mutations remain protected by the existing database RPCs and constraints. The API records an operational event after each successful mutation and exposes it through a scoped load-history endpoint. If the audit migration has not yet been applied, the core mutation does not become a false failure; the history endpoint reports that the migration is required. The migration also removes the duplicate role-provisioning trigger and adds unique protections for repeated bids and active vehicle assignments.

## 2026-10-15 — Do not treat an empty fleet as a failure

The company currently has no assigned drivers and no vehicles. That is a valid onboarding state, so the API returns empty lists and the UI keeps the invite/onboarding form usable. The UI only shows an error when the corresponding request actually fails.

## Scope boundary

This change fixes the entry flow and the fleet-screen failure boundary. It does not pretend that the full trucking operating system is complete; load creation, bid/pool workflows, dispatch, tracking, documents, payments, and operational reporting remain subsequent roadmap phases.
