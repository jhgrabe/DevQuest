create table submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  quest_id    uuid references quests not null,
  source_code text not null,
  language_id int not null,
  status      text default 'pending',  -- pending | passed | failed | error
  stdout      text,
  stderr      text,
  hint        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table submissions enable row level security;

create policy "users manage own submissions"
  on submissions
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Explicit DELETE permission (not covered by the default policy above)
create policy "users delete own submissions"
  on submissions for delete
  using (user_id = auth.uid());

-- Keep updated_at current on every update
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger submissions_updated_at
  before update on submissions
  for each row execute function update_updated_at();
