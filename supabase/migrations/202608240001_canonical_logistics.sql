create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text not null,
  user_type text not null check (user_type in ('shipper', 'trucking_company', 'driver')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists auth_user_id uuid;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists user_type text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create unique index if not exists profiles_auth_user_id_uidx
  on public.profiles(auth_user_id)
  where auth_user_id is not null;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('shipper', 'trucking_company')),
  owner_user_id uuid not null references public.profiles(user_id) on delete restrict,
  invite_code text not null default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations add column if not exists invite_code text;
update public.organizations
set invite_code = encode(gen_random_bytes(16), 'hex')
where invite_code is null;
create unique index if not exists organizations_invite_code_uidx
  on public.organizations(invite_code)
  where invite_code is not null;

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  member_role text not null check (member_role in ('owner', 'member', 'dispatcher')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(user_id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  cnic text,
  license_number text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  registration_number text not null,
  vehicle_type text not null default 'truck',
  capacity numeric(12, 2) not null check (capacity > 0),
  status text not null default 'available' check (status in ('available', 'assigned', 'maintenance', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, registration_number)
);

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  shipper_organization_id uuid not null references public.organizations(id) on delete restrict,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  cargo_type text not null,
  load_weight numeric(12, 2) not null check (load_weight > 0),
  origin text not null,
  destination text not null,
  payment_offer numeric(14, 2) not null check (payment_offer >= 0),
  required_trucks integer not null default 1 check (required_trucks > 0),
  pooling_allowed boolean not null default true,
  required_capacity numeric(12, 2) check (required_capacity is null or required_capacity > 0),
  accepted_trucks integer not null default 0 check (accepted_trucks >= 0),
  accepted_capacity numeric(12, 2) not null default 0 check (accepted_capacity >= 0),
  status text not null default 'open' check (status in ('open', 'booked', 'in_progress', 'delivered', 'cancelled')),
  additional_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.load_bids (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  bid_amount numeric(14, 2) not null check (bid_amount >= 0),
  proposed_capacity numeric(12, 2) not null check (proposed_capacity > 0),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (load_id, driver_id, vehicle_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads(id) on delete restrict,
  bid_id uuid not null unique references public.load_bids(id) on delete restrict,
  driver_id uuid not null references public.drivers(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  accepted_capacity numeric(12, 2) not null check (accepted_capacity > 0),
  status text not null default 'active' check (status in ('active', 'cancelled', 'completed')),
  accepted_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (load_id, driver_id),
  unique (load_id, vehicle_id)
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null unique references public.loads(id) on delete restrict,
  status text not null default 'booked' check (status in ('booked', 'in_transit', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  event_type text not null check (event_type in ('booked', 'picked_up', 'location_update', 'delivered', 'cancelled')),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  note text not null default '',
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  document_type text not null,
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(user_id) on delete set null,
  reviewed_at timestamptz
);

create index if not exists documents_status_idx
  on public.documents(status, uploaded_at desc);

create index if not exists loads_open_idx
  on public.loads(status, created_at desc)
  where status = 'open';
create index if not exists loads_shipper_idx
  on public.loads(shipper_organization_id, created_at desc);
create index if not exists bids_load_status_idx
  on public.load_bids(load_id, status, created_at);
create index if not exists bookings_driver_idx
  on public.bookings(driver_id, status, accepted_at desc);
create index if not exists shipments_load_idx
  on public.shipments(load_id, status);

create or replace function public.accept_load_bid(
  p_load_id uuid,
  p_bid_id uuid,
  p_actor_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_load public.loads%rowtype;
  v_bid public.load_bids%rowtype;
  v_driver public.drivers%rowtype;
  v_vehicle public.vehicles%rowtype;
  v_new_trucks integer;
  v_new_capacity numeric;
  v_new_status text;
  v_shipment public.shipments%rowtype;
begin
  select * into v_load
  from public.loads
  where id = p_load_id
  for update;

  if not found then
    raise exception using message = 'Load not found', errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.organization_members om
    where om.organization_id = v_load.shipper_organization_id
      and om.user_id = p_actor_user_id
      and om.member_role in ('owner', 'member', 'dispatcher')
  ) then
    raise exception using message = 'Only a shipper organization member can accept bids', errcode = '42501';
  end if;

  select * into v_bid
  from public.load_bids
  where id = p_bid_id and load_id = p_load_id
  for update;

  if not found then
    raise exception using message = 'Bid not found for load', errcode = 'P0002';
  end if;

  if v_bid.status <> 'pending' then
    raise exception using message = 'Only pending bids can be accepted', errcode = 'P0001';
  end if;

  select * into v_driver from public.drivers where id = v_bid.driver_id;
  select * into v_vehicle from public.vehicles where id = v_bid.vehicle_id;

  if not found or v_driver.id is null or v_vehicle.id is null then
    raise exception using message = 'Bid driver or vehicle is invalid', errcode = 'P0002';
  end if;

  if v_driver.organization_id is distinct from v_vehicle.organization_id then
    raise exception using message = 'Driver and vehicle do not belong to the same organization', errcode = '23514';
  end if;

  if exists (
    select 1 from public.bookings b
    where b.load_id = p_load_id
      and b.status = 'active'
      and (b.driver_id = v_bid.driver_id or b.vehicle_id = v_bid.vehicle_id)
  ) then
    raise exception using message = 'Driver or vehicle is already booked on this load', errcode = '23505';
  end if;

  v_new_trucks := v_load.accepted_trucks + 1;
  v_new_capacity := v_load.accepted_capacity + v_bid.proposed_capacity;

  if not v_load.pooling_allowed and v_new_trucks > 1 then
    raise exception using message = 'This load does not allow pooling', errcode = '23514';
  end if;

  if v_new_trucks > v_load.required_trucks then
    raise exception using message = 'Load truck requirement is already full', errcode = '23514';
  end if;

  if v_load.required_capacity is not null and v_new_capacity > v_load.required_capacity then
    raise exception using message = 'Accepted capacity would exceed the load requirement', errcode = '23514';
  end if;

  if v_new_trucks >= v_load.required_trucks
     and (v_load.required_capacity is null or v_new_capacity >= v_load.required_capacity) then
    v_new_status := 'booked';
  else
    v_new_status := 'open';
  end if;

  insert into public.bookings (load_id, bid_id, driver_id, vehicle_id, accepted_capacity)
  values (p_load_id, p_bid_id, v_bid.driver_id, v_bid.vehicle_id, v_bid.proposed_capacity);

  update public.load_bids
  set status = 'accepted', updated_at = now()
  where id = p_bid_id;

  update public.loads
  set accepted_trucks = v_new_trucks,
      accepted_capacity = v_new_capacity,
      status = v_new_status,
      updated_at = now()
  where id = p_load_id;

  if v_new_status = 'booked' then
    insert into public.shipments (load_id)
    values (p_load_id)
    on conflict (load_id) do update set updated_at = now()
    returning * into v_shipment;
  end if;

  return jsonb_build_object(
    'load_id', p_load_id,
    'bid_id', p_bid_id,
    'status', v_new_status,
    'accepted_trucks', v_new_trucks,
    'required_trucks', v_load.required_trucks,
    'accepted_capacity', v_new_capacity,
    'required_capacity', v_load.required_capacity,
    'shipment_id', v_shipment.id
  );
end;
$$;

grant execute on function public.accept_load_bid(uuid, uuid, uuid) to authenticated;
