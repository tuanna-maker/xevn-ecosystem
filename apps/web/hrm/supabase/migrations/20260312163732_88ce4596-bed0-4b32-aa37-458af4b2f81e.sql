-- Enable RLS on views and add platform admin policies
ALTER VIEW public.platform_users_view SET (security_invoker = true);
ALTER VIEW public.platform_companies_view SET (security_invoker = true);
ALTER VIEW public.candidates_secure SET (security_invoker = true);

-- Grant access only to authenticated, RLS will handle the rest
REVOKE ALL ON public.platform_users_view FROM anon;
REVOKE ALL ON public.platform_companies_view FROM anon;
REVOKE ALL ON public.candidates_secure FROM anon;