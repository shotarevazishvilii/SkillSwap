-- SkillSwap MVP learning requests.
do $$
begin
  create type public.learning_request_status as enum ('pending', 'accepted', 'rejected', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.learning_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete restrict,
  message text,
  status public.learning_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create unique index if not exists learning_requests_pending_unique_idx
  on public.learning_requests (sender_id, receiver_id, skill_id)
  where status = 'pending';

create index if not exists learning_requests_sender_id_idx on public.learning_requests (sender_id);
create index if not exists learning_requests_receiver_id_idx on public.learning_requests (receiver_id);
create index if not exists learning_requests_skill_id_idx on public.learning_requests (skill_id);

alter table public.learning_requests enable row level security;

drop policy if exists "request participants can read requests" on public.learning_requests;
create policy "request participants can read requests"
  on public.learning_requests
  for select
  to authenticated
  using (auth.uid() in (sender_id, receiver_id));

drop policy if exists "authenticated users can send learning requests" on public.learning_requests;
create policy "authenticated users can send learning requests"
  on public.learning_requests
  for insert
  to authenticated
  with check (auth.uid() = sender_id and status = 'pending');

drop policy if exists "receivers can accept or reject requests" on public.learning_requests;
create policy "receivers can accept or reject requests"
  on public.learning_requests
  for update
  to authenticated
  using (auth.uid() = receiver_id and status = 'pending')
  with check (auth.uid() = receiver_id and status in ('accepted', 'rejected'));

drop policy if exists "senders can cancel requests" on public.learning_requests;
create policy "senders can cancel requests"
  on public.learning_requests
  for update
  to authenticated
  using (auth.uid() = sender_id and status = 'pending')
  with check (auth.uid() = sender_id and status = 'cancelled');
