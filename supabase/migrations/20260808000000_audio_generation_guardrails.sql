-- Distributed admission control, free-plan usage, and private audio storage.
-- Apply this migration before deploying the application code that calls these RPCs.

create table if not exists public.audio_guardrail_lock (
  id smallint primary key default 1 check (id = 1),
  updated_at timestamptz not null default now()
);

insert into public.audio_guardrail_lock (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.audio_rate_limits (
  key_hash text primary key,
  request_count integer not null check (request_count >= 0),
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists audio_rate_limits_expires_at_idx
  on public.audio_rate_limits (expires_at);

create table if not exists public.audio_generation_leases (
  id uuid primary key,
  identity_hash text not null,
  kind text not null check (kind in ('document', 'preview')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists audio_generation_leases_active_idx
  on public.audio_generation_leases (kind, expires_at);

create index if not exists audio_generation_leases_identity_idx
  on public.audio_generation_leases (identity_hash, kind, expires_at);

create table if not exists public.audio_free_usage (
  identity_hash text primary key,
  used_count integer not null default 0 check (used_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.audio_free_quota_reservations (
  id uuid primary key,
  identity_hash text not null references public.audio_free_usage(identity_hash) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists audio_free_quota_reservations_expires_at_idx
  on public.audio_free_quota_reservations (expires_at);

alter table public.audios
  add column if not exists storage_path text,
  add column if not exists file_size bigint;

create unique index if not exists audios_storage_path_key
  on public.audios (storage_path)
  where storage_path is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-audio', 'user-audio', false, 104857600, array['audio/mpeg']::text[])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.check_audio_rate_limit(
  p_identity_hash text,
  p_ip_hash text,
  p_scope text,
  p_identity_limit integer,
  p_ip_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_identity_key text := p_scope || ':identity:' || p_identity_hash;
  v_ip_key text := p_scope || ':ip:' || p_ip_hash;
  v_identity_count integer := 0;
  v_ip_count integer := 0;
  v_identity_expiry timestamptz;
  v_ip_expiry timestamptz;
  v_retry integer := 1;
begin
  if p_identity_limit < 1 or p_ip_limit < 1 or p_window_seconds < 1 then
    raise exception 'Rate-limit arguments must be positive';
  end if;

  perform 1 from public.audio_guardrail_lock where id = 1 for update;
  delete from public.audio_rate_limits where expires_at <= v_now;

  select request_count, expires_at
    into v_identity_count, v_identity_expiry
    from public.audio_rate_limits
   where key_hash = v_identity_key;

  select request_count, expires_at
    into v_ip_count, v_ip_expiry
    from public.audio_rate_limits
   where key_hash = v_ip_key;

  v_identity_count := coalesce(v_identity_count, 0);
  v_ip_count := coalesce(v_ip_count, 0);

  if v_identity_count >= p_identity_limit then
    v_retry := greatest(v_retry, ceil(extract(epoch from (v_identity_expiry - v_now)))::integer);
  end if;

  if v_ip_count >= p_ip_limit then
    v_retry := greatest(v_retry, ceil(extract(epoch from (v_ip_expiry - v_now)))::integer);
  end if;

  if v_identity_count >= p_identity_limit or v_ip_count >= p_ip_limit then
    return query select false, v_retry;
    return;
  end if;

  insert into public.audio_rate_limits (key_hash, request_count, expires_at, updated_at)
  values (v_identity_key, 1, v_now + make_interval(secs => p_window_seconds), v_now)
  on conflict (key_hash) do update
     set request_count = public.audio_rate_limits.request_count + 1,
         updated_at = excluded.updated_at;

  insert into public.audio_rate_limits (key_hash, request_count, expires_at, updated_at)
  values (v_ip_key, 1, v_now + make_interval(secs => p_window_seconds), v_now)
  on conflict (key_hash) do update
     set request_count = public.audio_rate_limits.request_count + 1,
         updated_at = excluded.updated_at;

  return query select true, 0;
end;
$$;

create or replace function public.acquire_audio_generation_lease(
  p_lease_id uuid,
  p_identity_hash text,
  p_kind text,
  p_total_limit integer,
  p_kind_limit integer,
  p_per_identity_limit integer,
  p_ttl_seconds integer
)
returns table (acquired boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_total_count integer;
  v_kind_count integer;
  v_identity_count integer;
  v_next_expiry timestamptz;
  v_retry integer := 1;
begin
  if p_kind not in ('document', 'preview') then
    raise exception 'Invalid audio generation kind';
  end if;
  if p_total_limit < 1 or p_kind_limit < 1 or p_per_identity_limit < 1 or p_ttl_seconds < 1 then
    raise exception 'Lease arguments must be positive';
  end if;

  perform 1 from public.audio_guardrail_lock where id = 1 for update;
  delete from public.audio_generation_leases where expires_at <= v_now;

  select count(*) into v_total_count from public.audio_generation_leases;
  select count(*) into v_kind_count from public.audio_generation_leases where kind = p_kind;
  select count(*) into v_identity_count
    from public.audio_generation_leases
   where identity_hash = p_identity_hash;

  if v_total_count >= p_total_limit
     or v_kind_count >= p_kind_limit
     or v_identity_count >= p_per_identity_limit then
    select min(expires_at) into v_next_expiry
      from public.audio_generation_leases
     where (v_total_count >= p_total_limit)
        or (v_kind_count >= p_kind_limit and kind = p_kind)
        or (v_identity_count >= p_per_identity_limit and identity_hash = p_identity_hash);

    if v_next_expiry is not null then
      v_retry := greatest(1, ceil(extract(epoch from (v_next_expiry - v_now)))::integer);
    end if;

    return query select false, v_retry;
    return;
  end if;

  insert into public.audio_generation_leases (id, identity_hash, kind, expires_at)
  values (p_lease_id, p_identity_hash, p_kind, v_now + make_interval(secs => p_ttl_seconds));

  return query select true, 0;
end;
$$;

create or replace function public.release_audio_generation_lease(p_lease_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.audio_generation_leases where id = p_lease_id;
$$;

create or replace function public.reserve_audio_free_quota(
  p_reservation_id uuid,
  p_identity_hash text,
  p_limit integer,
  p_ttl_seconds integer
)
returns table (reserved boolean, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_used integer;
begin
  if p_limit < 1 or p_ttl_seconds < 1 then
    raise exception 'Quota arguments must be positive';
  end if;

  perform 1 from public.audio_guardrail_lock where id = 1 for update;

  with expired as (
    delete from public.audio_free_quota_reservations
     where expires_at <= v_now
     returning identity_hash
  ), expired_counts as (
    select identity_hash, count(*)::integer as expired_count
      from expired
     group by identity_hash
  )
  update public.audio_free_usage usage
     set used_count = greatest(0, usage.used_count - expired_counts.expired_count),
         updated_at = v_now
    from expired_counts
   where usage.identity_hash = expired_counts.identity_hash;

  insert into public.audio_free_usage (identity_hash, used_count, updated_at)
  values (p_identity_hash, 0, v_now)
  on conflict (identity_hash) do nothing;

  select used_count into v_used
    from public.audio_free_usage
   where identity_hash = p_identity_hash
   for update;

  if v_used >= p_limit then
    return query select false, 0;
    return;
  end if;

  update public.audio_free_usage
     set used_count = used_count + 1,
         updated_at = v_now
   where identity_hash = p_identity_hash;

  insert into public.audio_free_quota_reservations (id, identity_hash, expires_at)
  values (p_reservation_id, p_identity_hash, v_now + make_interval(secs => p_ttl_seconds));

  return query select true, greatest(0, p_limit - v_used - 1);
end;
$$;

create or replace function public.commit_audio_free_quota(p_reservation_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.audio_free_quota_reservations where id = p_reservation_id;
$$;

create or replace function public.release_audio_free_quota(p_reservation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_identity_hash text;
begin
  perform 1 from public.audio_guardrail_lock where id = 1 for update;

  delete from public.audio_free_quota_reservations
   where id = p_reservation_id
   returning identity_hash into v_identity_hash;

  if v_identity_hash is not null then
    update public.audio_free_usage
       set used_count = greatest(0, used_count - 1),
           updated_at = clock_timestamp()
     where identity_hash = v_identity_hash;
  end if;
end;
$$;

create or replace function public.get_audio_free_usage(p_identity_hash text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select used_count from public.audio_free_usage where identity_hash = p_identity_hash
  ), 0);
$$;

alter table public.audio_guardrail_lock enable row level security;
alter table public.audio_rate_limits enable row level security;
alter table public.audio_generation_leases enable row level security;
alter table public.audio_free_usage enable row level security;
alter table public.audio_free_quota_reservations enable row level security;

revoke all on public.audio_guardrail_lock from anon, authenticated;
revoke all on public.audio_rate_limits from anon, authenticated;
revoke all on public.audio_generation_leases from anon, authenticated;
revoke all on public.audio_free_usage from anon, authenticated;
revoke all on public.audio_free_quota_reservations from anon, authenticated;

revoke all on function public.check_audio_rate_limit(text, text, text, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.acquire_audio_generation_lease(uuid, text, text, integer, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.release_audio_generation_lease(uuid) from public, anon, authenticated;
revoke all on function public.reserve_audio_free_quota(uuid, text, integer, integer) from public, anon, authenticated;
revoke all on function public.commit_audio_free_quota(uuid) from public, anon, authenticated;
revoke all on function public.release_audio_free_quota(uuid) from public, anon, authenticated;
revoke all on function public.get_audio_free_usage(text) from public, anon, authenticated;

grant execute on function public.check_audio_rate_limit(text, text, text, integer, integer, integer) to service_role;
grant execute on function public.acquire_audio_generation_lease(uuid, text, text, integer, integer, integer, integer) to service_role;
grant execute on function public.release_audio_generation_lease(uuid) to service_role;
grant execute on function public.reserve_audio_free_quota(uuid, text, integer, integer) to service_role;
grant execute on function public.commit_audio_free_quota(uuid) to service_role;
grant execute on function public.release_audio_free_quota(uuid) to service_role;
grant execute on function public.get_audio_free_usage(text) to service_role;
