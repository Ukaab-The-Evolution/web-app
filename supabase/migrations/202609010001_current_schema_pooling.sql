-- Compatibility migration for the existing integer-ID logistics schema.
-- This migration intentionally keeps the existing table and column names.

alter table if exists public.pool_assignments add column if not exists accepted_capacity numeric default 0;
alter table if exists public.pool_assignments add column if not exists trucks_required integer;
alter table if exists public.pool_assignments add column if not exists trucks_assigned integer default 0;
alter table if exists public.pool_assignments add column if not exists completed_at timestamp without time zone;
alter table if exists public.pool_assignments add column if not exists status text default 'not_full';

create index if not exists bids_load_status_time_idx
  on public.bids(load_id, status, bid_time);

create index if not exists pool_assignments_status_idx
  on public.pool_assignments(status, load_id);

-- The application server is the only data-plane client and uses the service role.
-- Keep the exposed public schema protected so a leaked anon/authenticated token
-- cannot read or mutate operational records directly through the Data API.
alter table if exists public.profiles enable row level security;
alter table if exists public.trucking_companies enable row level security;
alter table if exists public.shipper_companies enable row level security;
alter table if exists public.shippers enable row level security;
alter table if exists public.drivers enable row level security;
alter table if exists public.vehicles enable row level security;
alter table if exists public.loads enable row level security;
alter table if exists public.bids enable row level security;
alter table if exists public.bookings enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.vehicle_location_log enable row level security;
alter table if exists public.pool_assignments enable row level security;
alter table if exists public.documents enable row level security;
alter table if exists public.verifications enable row level security;

-- Optional profile fields used by the current pilot screens. They are additive
-- so the migration remains compatible with the supplied integer-ID schema.
alter table if exists public.profiles add column if not exists avatar_url text;
alter table if exists public.drivers add column if not exists experience_years integer;
alter table if exists public.drivers add column if not exists current_company text;
alter table if exists public.drivers add column if not exists emergency_contact text;
alter table if exists public.drivers add column if not exists emergency_contact_name text;
alter table if exists public.drivers add column if not exists address text;
alter table if exists public.drivers add column if not exists verification_status text default 'pending';
alter table if exists public.trucking_companies add column if not exists contact_person text;
alter table if exists public.shipper_companies add column if not exists contact_person text;

create or replace function public.create_load_with_pool(
  p_shipper_id integer,
  p_actor_user_id integer,
  p_origin text,
  p_destination text,
  p_pickup_time text,
  p_cargo_type text,
  p_weight_kg numeric,
  p_special_requirements text,
  p_payment_offer numeric,
  p_trucks_required integer,
  p_is_pooling boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_load public.loads%rowtype;
  v_pool public.pool_assignments%rowtype;
begin
  if not exists (
    select 1 from public.shippers
    where shipper_id = p_shipper_id and user_id = p_actor_user_id
  ) then
    raise exception using message = 'Only the load owner can create loads', errcode = '42501';
  end if;

  if p_trucks_required < 1 or (not p_is_pooling and p_trucks_required <> 1) then
    raise exception using message = 'Invalid truck requirement', errcode = '23514';
  end if;

  insert into public.loads (
    shipper_id, origin, destination, pickup_time, cargo_type, weight_kg,
    special_requirements, payment_offer, number_of_trucks_required, is_pooling, status
  ) values (
    p_shipper_id,
    ST_GeomFromEWKT(p_origin),
    ST_GeomFromEWKT(p_destination),
    p_pickup_time::timestamp without time zone,
    p_cargo_type,
    p_weight_kg,
    nullif(p_special_requirements, ''),
    p_payment_offer,
    p_trucks_required,
    p_is_pooling,
    'available'
  ) returning * into v_load;

  insert into public.pool_assignments (
    load_id, trucks_required, trucks_assigned, accepted_capacity, status
  ) values (
    v_load.load_id, p_trucks_required, 0, 0, 'not_full'
  ) returning * into v_pool;

  return jsonb_build_object('load', to_jsonb(v_load), 'pool', to_jsonb(v_pool));
end;
$$;

revoke execute on function public.create_load_with_pool(integer, integer, text, text, text, text, numeric, text, numeric, integer, boolean) from public;
revoke execute on function public.create_load_with_pool(integer, integer, text, text, text, text, numeric, text, numeric, integer, boolean) from anon;
revoke execute on function public.create_load_with_pool(integer, integer, text, text, text, text, numeric, text, numeric, integer, boolean) from authenticated;
grant execute on function public.create_load_with_pool(integer, integer, text, text, text, text, numeric, text, numeric, integer, boolean) to service_role;

create or replace function public.accept_load_bid(
  p_load_id integer,
  p_bid_id integer,
  p_actor_user_id integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_load public.loads%rowtype;
  v_pool public.pool_assignments%rowtype;
  v_bid public.bids%rowtype;
  v_vehicle public.vehicles%rowtype;
  v_driver public.drivers%rowtype;
  v_new_trucks integer;
  v_new_capacity numeric;
  v_new_status text;
  v_booking_id integer;
begin
  select * into v_load
  from public.loads
  where load_id = p_load_id
  for update;

  if not found then
    raise exception using message = 'Load not found', errcode = 'P0002';
  end if;
  if v_load.status not in ('pending', 'available') then
    raise exception using message = 'Load is no longer available for booking', errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.shippers s
    where s.shipper_id = v_load.shipper_id
      and s.user_id = p_actor_user_id
  ) then
    raise exception using message = 'Only the load owner can accept bids', errcode = '42501';
  end if;

  select * into v_pool
  from public.pool_assignments
  where load_id = p_load_id
  for update;

  if not found then
    insert into public.pool_assignments (
      load_id, trucks_required, trucks_assigned, accepted_capacity, status
    ) values (
      p_load_id, v_load.number_of_trucks_required, 0, 0, 'not_full'
    )
    returning * into v_pool;
  end if;

  select * into v_bid
  from public.bids
  where bid_id = p_bid_id and load_id = p_load_id
  for update;

  if not found then
    raise exception using message = 'Bid not found for load', errcode = 'P0002';
  end if;
  if v_bid.status <> 'pending' then
    raise exception using message = 'Only pending bids can be accepted', errcode = 'P0001';
  end if;
  if v_bid.driver_id is null or v_bid.vehicle_id is null then
    raise exception using message = 'Bid must include a driver and vehicle', errcode = '23514';
  end if;

  select * into v_driver from public.drivers where driver_id = v_bid.driver_id;
  select * into v_vehicle from public.vehicles where vehicle_id = v_bid.vehicle_id for update;
  if v_driver.driver_id is null or v_vehicle.vehicle_id is null then
    raise exception using message = 'Bid driver or vehicle is invalid', errcode = 'P0002';
  end if;
  if v_vehicle.driver_id <> v_bid.driver_id then
    raise exception using message = 'Vehicle is not assigned to the bidding driver', errcode = '23514';
  end if;
  if v_bid.proposed_capacity is null or v_bid.proposed_capacity <= 0
     or v_bid.proposed_capacity > v_vehicle.capacity_kg then
    raise exception using message = 'Bid capacity must be positive and cannot exceed vehicle capacity', errcode = '23514';
  end if;
  if v_driver.company_id is null or v_vehicle.company_id is distinct from v_bid.company_id
     or v_vehicle.company_id is distinct from v_driver.company_id then
    raise exception using message = 'Driver, vehicle, and bid company do not match', errcode = '23514';
  end if;
  if v_vehicle.status <> 'available' then
    raise exception using message = 'Vehicle is no longer available', errcode = '23514';
  end if;

  if exists (
    select 1
    from public.bookings b
    join public.bids existing_bid on existing_bid.bid_id = b.bid_id
    where b.status in ('booked', 'in_transit')
      and (b.vehicle_id = v_bid.vehicle_id or existing_bid.driver_id = v_bid.driver_id)
  ) then
    raise exception using message = 'Driver or vehicle is already assigned to an active booking', errcode = '23505';
  end if;

  v_new_trucks := coalesce(v_pool.trucks_assigned, 0) + 1;
  v_new_capacity := coalesce(v_pool.accepted_capacity, 0) + coalesce(v_bid.proposed_capacity, v_vehicle.capacity_kg);

  if not v_load.is_pooling and v_new_trucks > 1 then
    raise exception using message = 'This load does not allow pooling', errcode = '23514';
  end if;
  if v_new_trucks > v_pool.trucks_required then
    raise exception using message = 'Load truck requirement is already full', errcode = '23514';
  end if;
  if v_new_trucks = v_pool.trucks_required and v_new_capacity < v_load.weight_kg then
    raise exception using message = 'The final truck must provide enough capacity to fulfill the load', errcode = '23514';
  end if;
  if v_new_capacity > v_load.weight_kg then
    raise exception using message = 'Accepted capacity would exceed the load weight', errcode = '23514';
  end if;
  if not v_load.is_pooling and v_new_capacity < v_load.weight_kg then
    raise exception using message = 'Vehicle capacity is insufficient for this non-pooled load', errcode = '23514';
  end if;

  if v_new_trucks >= v_pool.trucks_required
     and v_new_capacity >= v_load.weight_kg then
    v_new_status := 'full';
  else
    v_new_status := 'not_full';
  end if;

  insert into public.bookings (
    bid_id, vehicle_id, final_price, estimated_delivery_time, status
  ) values (
    p_bid_id,
    v_bid.vehicle_id,
    coalesce(v_bid.bid_amount, 0),
    v_load.pickup_time,
    'booked'
  ) returning booking_id into v_booking_id;

  update public.bids
  set status = 'accepted'
  where bid_id = p_bid_id;

  -- The current schema has no separate reserved status. `in_transit` is used
  -- as the active-assignment state until a delivered transition releases it.
  update public.vehicles
  set status = 'in_transit'
  where vehicle_id = v_bid.vehicle_id;

  update public.pool_assignments
  set trucks_assigned = v_new_trucks,
      accepted_capacity = v_new_capacity,
      status = v_new_status,
      completed_at = case when v_new_status = 'full' then coalesce(completed_at, now()) else null end
  where load_id = p_load_id;

  update public.loads
  set status = case when v_new_status = 'full' then 'booked' else 'available' end
  where load_id = p_load_id;

  return jsonb_build_object(
    'load_id', p_load_id,
    'bid_id', p_bid_id,
    'booking_id', v_booking_id,
    'status', case when v_new_status = 'full' then 'booked' else 'available' end,
    'accepted_trucks', v_new_trucks,
    'required_trucks', v_pool.trucks_required,
    'accepted_capacity', v_new_capacity,
    'required_capacity', v_load.weight_kg,
    'fulfilled', v_new_status = 'full'
  );
end;
$$;

revoke execute on function public.accept_load_bid(integer, integer, integer) from public;
revoke execute on function public.accept_load_bid(integer, integer, integer) from anon;
revoke execute on function public.accept_load_bid(integer, integer, integer) from authenticated;
grant execute on function public.accept_load_bid(integer, integer, integer) to service_role;

create or replace function public.update_booking_status(
  p_booking_id integer,
  p_actor_user_id integer,
  p_status text,
  p_confirmation_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_bid public.bids%rowtype;
  v_load public.loads%rowtype;
  v_driver public.drivers%rowtype;
  v_shipper public.shippers%rowtype;
  v_total_bookings integer;
  v_delivered_bookings integer;
  v_in_transit_bookings integer;
  v_load_status text;
begin
  if p_status is null or p_status not in ('in_transit', 'delivered') then
    raise exception using message = 'Unsupported booking status transition', errcode = '23514';
  end if;

  select * into v_booking
  from public.bookings
  where booking_id = p_booking_id
  for update;
  if not found then
    raise exception using message = 'Booking not found', errcode = 'P0002';
  end if;

  select * into v_bid from public.bids where bid_id = v_booking.bid_id;
  select * into v_load from public.loads where load_id = v_bid.load_id;
  select * into v_driver from public.drivers where driver_id = v_bid.driver_id;
  select * into v_shipper from public.shippers where shipper_id = v_load.shipper_id;

  if p_actor_user_id is distinct from v_driver.user_id
     and p_actor_user_id is distinct from v_shipper.user_id then
    raise exception using message = 'Only the assigned driver or load owner can update this booking', errcode = '42501';
  end if;
  if p_status = 'in_transit' and v_booking.status <> 'booked' then
    raise exception using message = 'Only booked trips can be started', errcode = 'P0001';
  end if;
  if p_status = 'delivered' and v_booking.status <> 'in_transit' then
    raise exception using message = 'Only in-transit trips can be delivered', errcode = 'P0001';
  end if;

  update public.bookings
  set status = p_status,
      delivered_at = case when p_status = 'delivered' then now() else delivered_at end,
      confirmation_code = case when p_confirmation_code is null or p_confirmation_code = '' then confirmation_code else p_confirmation_code end
  where booking_id = p_booking_id;

  update public.vehicles
  set status = case when p_status = 'delivered' then 'available' else 'in_transit' end
  where vehicle_id = v_booking.vehicle_id;

  select count(*),
         count(*) filter (where b.status = 'delivered'),
         count(*) filter (where b.status = 'in_transit')
  into v_total_bookings, v_delivered_bookings, v_in_transit_bookings
  from public.bookings b
  join public.bids load_bid on load_bid.bid_id = b.bid_id
  where load_bid.load_id = v_bid.load_id;

  v_load_status := case
    when v_total_bookings > 0 and v_delivered_bookings = v_total_bookings then 'delivered'
    when v_in_transit_bookings > 0 then 'in_transit'
    else 'booked'
  end;
  update public.loads set status = v_load_status where load_id = v_bid.load_id;

  return jsonb_build_object(
    'booking_id', p_booking_id,
    'status', p_status,
    'load_status', v_load_status
  );
end;
$$;

revoke execute on function public.update_booking_status(integer, integer, text, text) from public;
revoke execute on function public.update_booking_status(integer, integer, text, text) from anon;
revoke execute on function public.update_booking_status(integer, integer, text, text) from authenticated;
grant execute on function public.update_booking_status(integer, integer, text, text) to service_role;
