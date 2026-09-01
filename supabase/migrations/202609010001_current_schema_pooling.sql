-- Compatibility migration for the existing integer-ID logistics schema.
-- This migration intentionally keeps the existing table and column names.

create index if not exists bids_load_status_time_idx
  on public.bids(load_id, status, bid_time);

create index if not exists pool_assignments_status_idx
  on public.pool_assignments(status, load_id);

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
    where existing_bid.load_id = p_load_id
      and (b.vehicle_id = v_bid.vehicle_id or existing_bid.driver_id = v_bid.driver_id)
  ) then
    raise exception using message = 'Driver or vehicle is already booked on this load', errcode = '23505';
  end if;

  v_new_trucks := coalesce(v_pool.trucks_assigned, 0) + 1;
  v_new_capacity := coalesce(v_pool.accepted_capacity, 0) + coalesce(v_bid.proposed_capacity, v_vehicle.capacity_kg);

  if not v_load.is_pooling and v_new_trucks > 1 then
    raise exception using message = 'This load does not allow pooling', errcode = '23514';
  end if;
  if v_new_trucks > v_pool.trucks_required then
    raise exception using message = 'Load truck requirement is already full', errcode = '23514';
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
