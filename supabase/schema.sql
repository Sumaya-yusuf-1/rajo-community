-- Run once in Supabase SQL Editor. Supabase Auth must have email/password enabled.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'member' check(role in ('member','admin')),
 created_at timestamptz not null default now()
);
create or replace function public.create_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id) values(new.id) on conflict do nothing;return new;end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
create or replace function public.is_rajo_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin');
$$;
create table if not exists public.ideas (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(title) between 4 and 120),
 description text not null check(length(description) between 10 and 2000),
 category text not null default 'Community',
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 vote_count integer not null default 0 check(vote_count>=0),
 created_at timestamptz not null default now()
);
create table if not exists public.idea_votes (
 idea_id uuid not null references public.ideas(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(idea_id,user_id)
);
create or replace function public.votes_count_sync() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' then update public.ideas set vote_count=vote_count+1 where id=new.idea_id;return new;
 elsif TG_OP='DELETE' then update public.ideas set vote_count=greatest(vote_count-1,0) where id=old.idea_id;return old;end if;
 return null;
end $$;
drop trigger if exists votes_sync on public.idea_votes;
create trigger votes_sync after insert or delete on public.idea_votes for each row execute function public.votes_count_sync();
create table if not exists public.activities (
 id uuid primary key default gen_random_uuid(),
 title_sv text not null, title_so text not null,
 description_sv text not null default '',description_so text not null default '',
 starts_at timestamptz not null,
 location text not null default 'Online',
 image_url text, capacity integer check(capacity>0),
 created_at timestamptz not null default now()
);
create table if not exists public.event_registrations (
 activity_id uuid not null references public.activities(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(activity_id,user_id)
);
create or replace function public.validate_event_capacity() returns trigger language plpgsql security definer set search_path='' as $$
declare available integer;total integer;
begin
 select capacity into available from public.activities where id=new.activity_id for update;
 if not found then raise exception 'Event not found';end if;
 if available is not null then
 select count(*) into total from public.event_registrations where activity_id=new.activity_id;
 if total>=available then raise exception 'Event is full';end if;
 end if;
 return new;
end $$;
drop trigger if exists check_event_capacity on public.event_registrations;
create trigger check_event_capacity before insert on public.event_registrations for each row execute function public.validate_event_capacity();
create table if not exists public.moments (
 id uuid primary key default gen_random_uuid(),
 title_sv text not null,title_so text not null,
 description_sv text not null default '',description_so text not null default '',
 image_url text, event_date date not null,
 location text not null default '',
 photo_consent_confirmed boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.moments add column if not exists category text not null default 'Community';
create table if not exists public.membership_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique references auth.users(id) on delete cascade,
 full_name text not null,interest text not null default '',
 adult_confirmed boolean not null check(adult_confirmed=true),
 terms_accepted_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now()
);
-- RLS: public reads approved content; private data is visible only to owner/admin.
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_votes enable row level security;
alter table public.activities enable row level security;
alter table public.event_registrations enable row level security;
alter table public.moments enable row level security;
alter table public.membership_requests enable row level security;
create policy "profiles read self or admin" on public.profiles for select using(id=(select auth.uid()) or public.is_rajo_admin());
-- No client policy to edit roles. Only trusted SQL administration can promote.
create policy "ideas public approved admin all author own" on public.ideas for select using(status='approved' or author_id=(select auth.uid()) or public.is_rajo_admin());
create policy "ideas member create" on public.ideas for insert to authenticated with check(author_id=(select auth.uid()) and status='pending' and vote_count=0);
create policy "ideas admin update" on public.ideas for update to authenticated using(public.is_rajo_admin()) with check(public.is_rajo_admin());
create policy "ideas admin delete" on public.ideas for delete to authenticated using(public.is_rajo_admin());
create policy "votes own select or admin" on public.idea_votes for select to authenticated using(user_id=(select auth.uid()) or public.is_rajo_admin());
create policy "votes members for approved only" on public.idea_votes for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.ideas where id=idea_id and status='approved'));
create policy "votes admin delete" on public.idea_votes for delete to authenticated using(public.is_rajo_admin());
create policy "activities all read" on public.activities for select using(true);
create policy "activities admin insert" on public.activities for insert to authenticated with check(public.is_rajo_admin());
create policy "activities admin update" on public.activities for update to authenticated using(public.is_rajo_admin()) with check(public.is_rajo_admin());
create policy "activities admin delete" on public.activities for delete to authenticated using(public.is_rajo_admin());
create policy "registrations own/admin select" on public.event_registrations for select to authenticated using(user_id=(select auth.uid()) or public.is_rajo_admin());
create policy "registrations member create" on public.event_registrations for insert to authenticated with check(user_id=(select auth.uid()));
create policy "registrations self cancel/admin" on public.event_registrations for delete to authenticated using(user_id=(select auth.uid()) or public.is_rajo_admin());
create policy "moments public consent only" on public.moments for select using(photo_consent_confirmed or public.is_rajo_admin());
create policy "moments admin insert" on public.moments for insert to authenticated with check(public.is_rajo_admin() and photo_consent_confirmed);
create policy "moments admin update" on public.moments for update to authenticated using(public.is_rajo_admin()) with check(public.is_rajo_admin());
create policy "moments admin delete" on public.moments for delete to authenticated using(public.is_rajo_admin());
create policy "membership own/admin select" on public.membership_requests for select to authenticated using(user_id=(select auth.uid()) or public.is_rajo_admin());
create policy "membership own insert" on public.membership_requests for insert to authenticated with check(user_id=(select auth.uid()) and status='pending');
create policy "membership own or admin update" on public.membership_requests for update to authenticated using(user_id=(select auth.uid()) or public.is_rajo_admin()) with check(user_id=(select auth.uid()) or public.is_rajo_admin());
-- Prevent members changing approval status even when updating own request.
create or replace function public.prevent_member_status_change() returns trigger language plpgsql set search_path='' as $$
begin if not public.is_rajo_admin() and new.status is distinct from old.status then raise exception 'Only admins may change status';end if;return new;end $$;
drop trigger if exists no_member_approval on public.membership_requests;
create trigger no_member_approval before update on public.membership_requests for each row execute function public.prevent_member_status_change();
create policy "membership admin delete" on public.membership_requests for delete to authenticated using(public.is_rajo_admin());
-- Grant yourself admin via SQL editor AFTER registering with your email:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL@example.com');

-- Storage: the image uploader uses this public bucket and only admins may write to it.
insert into storage.buckets (id, name, public)
values ('rajo-images', 'rajo-images', true)
on conflict (id) do update set public = true;

drop policy if exists "rajo images public read" on storage.objects;
create policy "rajo images public read"
on storage.objects for select
using (bucket_id = 'rajo-images');

drop policy if exists "rajo images admin upload" on storage.objects;
create policy "rajo images admin upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'rajo-images' and public.is_rajo_admin());

drop policy if exists "rajo images admin update" on storage.objects;
create policy "rajo images admin update"
on storage.objects for update to authenticated
using (bucket_id = 'rajo-images' and public.is_rajo_admin())
with check (bucket_id = 'rajo-images' and public.is_rajo_admin());

drop policy if exists "rajo images admin delete" on storage.objects;
create policy "rajo images admin delete"
on storage.objects for delete to authenticated
using (bucket_id = 'rajo-images' and public.is_rajo_admin());
