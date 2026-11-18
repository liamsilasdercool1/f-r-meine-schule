create table if not exists public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.player_profiles enable row level security;
alter table public.player_progress enable row level security;

drop policy if exists "Public can view player profiles" on public.player_profiles;
create policy "Public can view player profiles" on public.player_profiles for select using (true);
drop policy if exists "Players can insert own profile" on public.player_profiles;
create policy "Players can insert own profile" on public.player_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players can update own profile" on public.player_profiles;
create policy "Players can update own profile" on public.player_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Public can view leaderboard progress" on public.player_progress;
create policy "Public can view leaderboard progress" on public.player_progress for select using (true);
drop policy if exists "Players can insert own progress" on public.player_progress;
create policy "Players can insert own progress" on public.player_progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players can update own progress" on public.player_progress;
create policy "Players can update own progress" on public.player_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.is_kommaheld_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'owner', false);
$$;

create or replace function public.owner_reset_player(target_user uuid, reset_profile boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_kommaheld_owner() then raise exception 'Owner access required'; end if;
  if reset_profile then
    delete from public.player_progress where user_id = target_user;
  else
    insert into public.player_progress(user_id, progress)
    values (target_user, '{"name":"Du","niveau":null,"xp":0,"weeklyXp":0,"week":"","streak":0,"lastDay":null,"correctInRow":0,"bestRow":0,"total":0,"correct":0,"perRule":{},"badges":[],"history":[]}'::jsonb)
    on conflict (user_id) do update set progress = excluded.progress, updated_at = now();
  end if;
end;
$$;

create or replace function public.owner_delete_player(target_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_kommaheld_owner() then raise exception 'Owner access required'; end if;
  delete from auth.users where id = target_user;
end;
$$;

create or replace function public.owner_server_overview()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if not public.is_kommaheld_owner() then raise exception 'Owner access required'; end if;
  select jsonb_build_object(
    'profiles', (select count(*) from public.player_profiles),
    'progress_records', (select count(*) from public.player_progress),
    'last_sync', (select max(updated_at) from public.player_progress),
    'database', current_database(),
    'server_time', now()
  ) into result;
  return result;
end;
$$;

grant execute on function public.owner_reset_player(uuid, boolean) to authenticated;
grant execute on function public.owner_delete_player(uuid) to authenticated;
grant execute on function public.owner_server_overview() to authenticated;

create or replace function public.handle_new_kommaheld_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.player_profiles(user_id, display_name, avatar_url)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), 30), new.raw_user_meta_data ->> 'avatar_url')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_kommaheld on auth.users;
create trigger on_auth_user_created_kommaheld after insert on auth.users
for each row execute procedure public.handle_new_kommaheld_user();
