# Supabase Database Setup & Migrations

This directory contains SQL schema files to set up the **Naurèlle Beauty** database in Supabase.

## 1. Quick Setup in Supabase Dashboard

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left navigation, click on **SQL Editor**.
3. Click **New Query**.
4. Paste the contents of `schema.sql` and click **Run**.
5. Paste the contents of `bookings.sql` and click **Run**.

## 2. Promoting a User to Admin or Staff

By default, any new user registered through Supabase Auth receives the role of `client`.

To promote an account to `admin` or `staff`, run the following in the Supabase SQL Editor:

```sql
-- Promote an existing user to Admin:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@naurellebeauty.com';

-- Or promote a staff nail artist:
UPDATE public.profiles
SET role = 'staff'
WHERE email = 'artist@naurellebeauty.com';
```

## 3. Environment Variables Configuration

Copy your API keys from **Project Settings > API** into your `.env` file:
- `SUPABASE_URL` -> Project URL
- `SUPABASE_SERVICE_ROLE_KEY` -> `service_role` secret (server only, never commit)
- `VITE_SUPABASE_URL` -> Project URL
- `VITE_SUPABASE_ANON_KEY` -> `anon` `public` key (safe for browser)
