-- Drop and recreate with a simpler approach
drop function if exists get_courses_with_profiles(integer,integer);

-- Create simpler RPC function that gets courses first, then we'll get profiles separately
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
  profiles json
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
    coalesce(
      json_build_object('username', p.username), 
      json_build_object('username', 'Anonymous')
    ) as profiles
  from courses c
  left join profiles p on c.user_id = p.id
  order by c.created_at desc
  limit limit_param
  offset offset_param;
$$;
