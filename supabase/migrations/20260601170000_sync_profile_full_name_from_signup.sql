-- Populate profiles.full_name from auth signup metadata when a user is created.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_full_name text;
begin
  signup_full_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');

  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, null, signup_full_name, null)
  on conflict (id) do nothing;

  return new;
end;
$$;
