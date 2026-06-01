-- SkillSwap MVP schema for Supabase PostgreSQL.
-- This migration is safe to run on a fresh Supabase project and avoids duplicate policy/type errors.

create extension if not exists "pgcrypto";

-- Status values kept as database enums so generated Supabase types expose useful unions.
do $$
begin
  create type public.match_status as enum ('pending', 'accepted', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.session_status as enum ('scheduled', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  availability text,
  rating_average numeric(3, 2) not null default 0 check (rating_average >= 0 and rating_average <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (
    username is null or char_length(username) between 3 and 30
  ),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-zA-Z0-9_]+$'
  )
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_teaching_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  experience_level text not null check (experience_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz not null default now(),
  unique (user_id, skill_id)
);

create table if not exists public.user_learning_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  target_level text not null check (target_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz not null default now(),
  unique (user_id, skill_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  learner_id uuid not null references public.profiles (id) on delete cascade,
  compatibility_score numeric(5, 2) not null check (
    compatibility_score >= 0 and compatibility_score <= 100
  ),
  status public.match_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (mentor_id <> learner_id),
  unique (mentor_id, learner_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(btrim(content)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  learner_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete restrict,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  status public.session_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  check (mentor_id <> learner_id),
  check (scheduled_end > scheduled_start)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  check (reviewer_id <> reviewee_id),
  unique (session_id, reviewer_id)
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists matches_mentor_id_idx on public.matches (mentor_id);
create index if not exists matches_learner_id_idx on public.matches (learner_id);
create index if not exists conversation_participants_user_id_idx on public.conversation_participants (user_id);
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists messages_sender_id_idx on public.messages (sender_id);
create index if not exists sessions_mentor_id_idx on public.sessions (mentor_id);
create index if not exists sessions_learner_id_idx on public.sessions (learner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, null, null, null)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

create or replace function public.is_conversation_participant(
  conversation_uuid uuid,
  user_uuid uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversation_participants participant
    where participant.conversation_id = conversation_uuid
      and participant.user_id = user_uuid
  );
$$;

revoke all on function public.is_conversation_participant(uuid, uuid) from public;
grant execute on function public.is_conversation_participant(uuid, uuid) to authenticated;

insert into public.skills (name, slug)
values
  ('JavaScript', 'javascript'),
  ('TypeScript', 'typescript'),
  ('React', 'react'),
  ('Next.js', 'next-js'),
  ('Node.js', 'node-js'),
  ('Python', 'python'),
  ('SQL', 'sql'),
  ('Supabase', 'supabase'),
  ('UI Design', 'ui-design'),
  ('UX Research', 'ux-research'),
  ('Figma', 'figma'),
  ('Graphic Design', 'graphic-design'),
  ('Product Management', 'product-management'),
  ('Project Management', 'project-management'),
  ('English', 'english'),
  ('Spanish', 'spanish'),
  ('Public Speaking', 'public-speaking'),
  ('Writing', 'writing'),
  ('Copywriting', 'copywriting'),
  ('Marketing', 'marketing'),
  ('SEO', 'seo'),
  ('Social Media Marketing', 'social-media-marketing'),
  ('Finance', 'finance'),
  ('Accounting', 'accounting'),
  ('Data Analysis', 'data-analysis'),
  ('Machine Learning', 'machine-learning'),
  ('Career Coaching', 'career-coaching'),
  ('Interview Preparation', 'interview-preparation'),
  ('Photography', 'photography'),
  ('Video Editing', 'video-editing'),
  ('Music Production', 'music-production'),
  ('Fitness Coaching', 'fitness-coaching')
on conflict (slug) do nothing;

alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.user_teaching_skills enable row level security;
alter table public.user_learning_skills enable row level security;
alter table public.matches enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.sessions enable row level security;
alter table public.reviews enable row level security;

-- profiles: public read, owner update.
drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles
  for select
  using (true);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- skills: public read.
drop policy if exists "skills are publicly readable" on public.skills;
create policy "skills are publicly readable"
  on public.skills
  for select
  using (true);

-- teaching skills: public read, owner CRUD.
drop policy if exists "teaching skills are publicly readable" on public.user_teaching_skills;
create policy "teaching skills are publicly readable"
  on public.user_teaching_skills
  for select
  using (true);

drop policy if exists "users can manage their teaching skills" on public.user_teaching_skills;
create policy "users can manage their teaching skills"
  on public.user_teaching_skills
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- learning skills: public read, owner CRUD.
drop policy if exists "learning skills are publicly readable" on public.user_learning_skills;
create policy "learning skills are publicly readable"
  on public.user_learning_skills
  for select
  using (true);

drop policy if exists "users can manage their learning skills" on public.user_learning_skills;
create policy "users can manage their learning skills"
  on public.user_learning_skills
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- matches: only involved users can read. Inserts/updates are reserved for trusted server flows.
drop policy if exists "match participants can read matches" on public.matches;
create policy "match participants can read matches"
  on public.matches
  for select
  to authenticated
  using (auth.uid() in (mentor_id, learner_id));

-- conversations and participants.
drop policy if exists "authenticated users can create conversations" on public.conversations;
create policy "authenticated users can create conversations"
  on public.conversations
  for insert
  to authenticated
  with check (true);

drop policy if exists "conversation participants can read conversations" on public.conversations;
create policy "conversation participants can read conversations"
  on public.conversations
  for select
  to authenticated
  using (public.is_conversation_participant(id, auth.uid()));

drop policy if exists "participants can read conversation participants" on public.conversation_participants;
create policy "participants can read conversation participants"
  on public.conversation_participants
  for select
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists "users can add themselves to conversations" on public.conversation_participants;
create policy "users can add themselves to conversations"
  on public.conversation_participants
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can leave conversations" on public.conversation_participants;
create policy "users can leave conversations"
  on public.conversation_participants
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- messages: only participants can access; senders can create/manage their own messages.
drop policy if exists "conversation participants can read messages" on public.messages;
create policy "conversation participants can read messages"
  on public.messages
  for select
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists "conversation participants can send messages" on public.messages;
create policy "conversation participants can send messages"
  on public.messages
  for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and public.is_conversation_participant(conversation_id, auth.uid())
  );

drop policy if exists "senders can update their own messages" on public.messages;
create policy "senders can update their own messages"
  on public.messages
  for update
  to authenticated
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

drop policy if exists "senders can delete their own messages" on public.messages;
create policy "senders can delete their own messages"
  on public.messages
  for delete
  to authenticated
  using (auth.uid() = sender_id);

-- sessions: only mentor and learner can access.
drop policy if exists "session participants can read sessions" on public.sessions;
create policy "session participants can read sessions"
  on public.sessions
  for select
  to authenticated
  using (auth.uid() in (mentor_id, learner_id));

drop policy if exists "session participants can create sessions" on public.sessions;
create policy "session participants can create sessions"
  on public.sessions
  for insert
  to authenticated
  with check (auth.uid() in (mentor_id, learner_id));

drop policy if exists "session participants can update sessions" on public.sessions;
create policy "session participants can update sessions"
  on public.sessions
  for update
  to authenticated
  using (auth.uid() in (mentor_id, learner_id))
  with check (auth.uid() in (mentor_id, learner_id));

-- reviews: public read, authenticated users can create valid reviews for their own sessions.
drop policy if exists "reviews are publicly readable" on public.reviews;
create policy "reviews are publicly readable"
  on public.reviews
  for select
  using (true);

drop policy if exists "authenticated users can create reviews" on public.reviews;
create policy "authenticated users can create reviews"
  on public.reviews
  for insert
  to authenticated
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1
      from public.sessions reviewed_session
      where reviewed_session.id = session_id
        and reviewed_session.status = 'completed'
        and reviewer_id in (reviewed_session.mentor_id, reviewed_session.learner_id)
        and reviewee_id in (reviewed_session.mentor_id, reviewed_session.learner_id)
        and reviewer_id <> reviewee_id
    )
  );
