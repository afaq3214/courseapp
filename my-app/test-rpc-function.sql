-- Test the RPC function directly
select * from get_courses_with_profiles(10, 0);

-- Also test if courses and profiles have data
select 'courses count' as table_name, count(*) as count from courses
union all
select 'profiles count' as table_name, count(*) as count from profiles
union all  
select 'courses with profiles join' as table_name, count(*) as count 
from courses c 
inner join profiles p on c.user_id = p.id;
