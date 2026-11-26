-- Fresh Drop Friday: apply only to the verified JamBeacon Supabase project.
begin;
create table public.jb_drop_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.jb_drop_admins enable row level security;
revoke all on public.jb_drop_admins from anon, authenticated;

create function public.jb_is_drop_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.jb_drop_admins where user_id = auth.uid()) $$;
revoke all on function public.jb_is_drop_admin() from public;
grant execute on function public.jb_is_drop_admin() to authenticated;

create table public.jb_weekly_drops (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 1000),
  category text not null check (category in ('instrument','outfit','accessory','hair','stage','tracks')),
  price_cents integer not null default 99 check (price_cents between 1 and 99999),
  product_id text not null unique check (product_id ~ '^[a-z0-9][a-z0-9_.]{2,99}$'),
  image_url text not null default '' check (char_length(image_url) <= 2048 and (image_url = '' or image_url ~ '^https://[^[:space:]]+$' or image_url ~ '^/[^/][^[:space:]]*$')),
  release_at timestamptz not null,
  state text not null default 'draft' check (state in ('draft','scheduled','archived')),
  featured boolean not null default true,
  notify_members boolean not null default false,
  auto_equip boolean not null default true,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
create index jb_drops_release_idx on public.jb_weekly_drops(state,release_at);
alter table public.jb_weekly_drops enable row level security;
revoke all on public.jb_weekly_drops from anon, authenticated;
grant select on public.jb_weekly_drops to anon, authenticated;
grant insert(name,description,category,price_cents,product_id,image_url,release_at,state,featured,notify_members,auto_equip) on public.jb_weekly_drops to authenticated;
grant update(name,description,category,price_cents,product_id,image_url,release_at,state,featured,notify_members,auto_equip) on public.jb_weekly_drops to authenticated;
create policy jb_released_drops on public.jb_weekly_drops for select to anon, authenticated
  using (state = 'scheduled' and release_at <= now());
create policy jb_admin_read_drops on public.jb_weekly_drops for select to authenticated using (public.jb_is_drop_admin());
create policy jb_admin_insert_drops on public.jb_weekly_drops for insert to authenticated with check (public.jb_is_drop_admin());
create policy jb_admin_update_drops on public.jb_weekly_drops for update to authenticated using (public.jb_is_drop_admin()) with check (public.jb_is_drop_admin());

create table public.jb_drop_audit (
  id bigint generated always as identity primary key,
  drop_id uuid not null,
  actor_id uuid,
  action text not null,
  changed_at timestamptz not null default now(),
  before_value jsonb,
  after_value jsonb not null
);
alter table public.jb_drop_audit enable row level security;
revoke all on public.jb_drop_audit from anon, authenticated;
grant select on public.jb_drop_audit to authenticated;
create policy jb_admin_read_audit on public.jb_drop_audit for select to authenticated using (public.jb_is_drop_admin());

create function public.jb_drop_stamp() returns trigger language plpgsql set search_path = '' as $$
begin
  -- Product identity and price of a released item must not be silently changed.
  if old.state = 'scheduled' and old.release_at <= now() and
      (new.product_id <> old.product_id or new.price_cents <> old.price_cents or new.category <> old.category or new.release_at <> old.release_at or new.state = 'draft') then
    raise exception 'Released product identity, price and release date are locked. Create a new drop instead.';
  end if;
  if old.state = 'archived' then raise exception 'Archived drops are immutable'; end if;
  new.updated_at := now(); new.version := old.version + 1; return new;
end $$;
create trigger jb_drop_stamp before update on public.jb_weekly_drops for each row execute function public.jb_drop_stamp();

create function public.jb_drop_log() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.jb_drop_audit(drop_id,actor_id,action,before_value,after_value)
  values(new.id,auth.uid(),tg_op,case when tg_op = 'UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
  return new;
end $$;
revoke all on function public.jb_drop_log() from public;
create trigger jb_drop_log after insert or update on public.jb_weekly_drops for each row execute function public.jb_drop_log();
-- Product artwork is public by URL; do not upload private or sensitive content.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('jb-drop-art','jb-drop-art',true,5242880,array['image/png','image/jpeg','image/webp']);
create policy jb_drop_art_insert on storage.objects for insert to authenticated
with check (bucket_id='jb-drop-art' and public.jb_is_drop_admin());
commit;
