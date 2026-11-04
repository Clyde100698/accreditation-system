-- Link Auth users to public.users table
-- Run this in the Supabase SQL Editor after FRESH_START.sql

UPDATE public.users SET auth_user_id = '2c1925a0-9c4b-4206-8c88-70aa8e3de8af' WHERE email = 'sarah.faculty@sti.edu';
UPDATE public.users SET auth_user_id = '4a76af73-5bce-421a-a176-f9865c65d582' WHERE email = 'john.chair@sti.edu';
UPDATE public.users SET auth_user_id = '03c84dcf-a4e4-4bf9-abca-bc23b927d0f3' WHERE email = 'admin.qa@sti.edu';
UPDATE public.users SET auth_user_id = '3e0e0ed4-c9b1-4190-b026-f428bbce19af' WHERE email = 'committee@sti.edu';
