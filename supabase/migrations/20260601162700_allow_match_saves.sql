-- Allow authenticated users to save a match when they are one of the involved users.
drop policy if exists "match participants can create matches" on public.matches;
create policy "match participants can create matches"
  on public.matches
  for insert
  to authenticated
  with check (auth.uid() in (mentor_id, learner_id));
