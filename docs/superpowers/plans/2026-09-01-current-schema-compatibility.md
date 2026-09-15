# Current-schema compatibility implementation plan

## Objective

Use the supplied live-schema contract without renaming existing tables. Keep the stable `/api/v1` API names while translating to the database's integer IDs and current column names.

## Mapping

| API concept | Existing database source |
| --- | --- |
| application user | `profiles.user_id`, linked by `profiles.auth_user_id` |
| trucking company | `trucking_companies.company_id` |
| shipper account | `shippers.shipper_id` and `shipper_companies.company_id` |
| driver | `drivers.driver_id` |
| vehicle | `vehicles.vehicle_id` |
| load | `loads.load_id` |
| bid | `bids.bid_id` |
| booking | `bookings.booking_id` |
| pool state | `pool_assignments` |
| document | `documents.document_id` |

## Implementation order

1. Add pure mapping/normalization tests before production changes.
2. Refactor protection and profile aggregation to resolve `auth_user_id` to integer `profiles.user_id`, then load company/shipper/driver records.
3. Refactor load and bid controllers to use `loads`, `bids`, `vehicles`, `drivers`, and `pool_assignments`.
4. Add an atomic integer-ID `accept_load_bid` function that locks `loads` and `pool_assignments`, validates the shipper owner, rejects duplicate/over-capacity acceptance, inserts `bookings`, updates pool counters, and creates no duplicate shipment record until the existing shipment contract is defined.
5. Align document upload/review with `documents.document_id` and the database's allowed document types.
6. Keep the frontend API response shape stable while sending valid cargo/status/document values.
7. Run unit, API, build, and live schema checks before merging.

## Safety rules

- Do not drop or rename existing tables.
- Do not convert integer identifiers to UUIDs.
- Do not trust user/company/driver IDs supplied by the client for authorization.
- Do not apply the previous UUID-table migration to this database.
- Add RLS and restrict the pooling RPC before production use.
