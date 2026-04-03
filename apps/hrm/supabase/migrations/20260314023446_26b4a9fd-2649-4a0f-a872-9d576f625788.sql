
-- Update auth.identities to change email (auth.users.email is generated from this)
UPDATE auth.identities
SET identity_data = jsonb_set(
      jsonb_set(identity_data, '{email}', '"admin@unitel.com.la"'),
      '{email_verified}', 'true'
    ),
    provider_id = 'admin@unitel.com.la',
    updated_at = now()
WHERE provider_id = 'admin@unitel.la';

-- Update profiles table
UPDATE public.profiles
SET email = 'admin@unitel.com.la',
    updated_at = now()
WHERE email = 'admin@unitel.la';

-- Update platform_admins
UPDATE public.platform_admins
SET email = 'admin@unitel.com.la'
WHERE email = 'admin@unitel.la';

-- Update user_company_memberships
UPDATE public.user_company_memberships
SET email = 'admin@unitel.com.la'
WHERE email = 'admin@unitel.la';
