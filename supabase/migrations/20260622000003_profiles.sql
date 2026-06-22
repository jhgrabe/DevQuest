create table profiles (
  user_id  uuid primary key references auth.users,
  username text unique not null,
  xp       int default 0
);

alter table profiles enable row level security;

create policy "users read own profile"
  on profiles for select
  using (user_id = auth.uid());

-- execute function writes XP via service role, so no UPDATE policy needed for the client

-- Auto-create a profile row when a new user registers
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (user_id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
