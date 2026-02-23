-- Update RLS policies to allow all users to read courses
drop policy if exists "courses_select_own" on public.courses;
create policy "courses_select_all" on public.courses
for select
using (true);

-- Update RLS policies to allow all users to read profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_all" on public.profiles
for select
using (true);
