-- Create RPC function to get courses with profiles (bypasses schema cache issues)
create or replace function get_courses_with_profiles(
  limit_param int default 10,
  offset_param int default 0
)
returns table (
  id uuid,
  title text,
  description text,
  duration_minutes int,
  language text,
  level text,
  category text,
  created_at timestamptz,
  updated_at timestamptz,
  user_id uuid,
  username text
)
language sql
security definer
as $$
  select 
    c.id,
    c.title,
    c.description,
    c.duration_minutes,
    c.language,
    c.level,
    c.category,
    c.created_at,
    c.updated_at,
    c.user_id,
    p.username
  from courses c
  inner join profiles p on c.user_id = p.id
  order by c.created_at desc
  limit limit_param
  offset offset_param;
$$;
