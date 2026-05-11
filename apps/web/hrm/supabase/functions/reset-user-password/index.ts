import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify caller is platform admin
    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { data: isAdmin } = await anonClient.rpc('is_platform_admin', { _user_id: caller.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Not a platform admin' }), { status: 403, headers: corsHeaders });
    }

    const { user_id, new_password, new_email } = await req.json();

    if (!user_id || (!new_password && !new_email)) {
      return new Response(JSON.stringify({ error: 'Missing user_id or update fields' }), { status: 400, headers: corsHeaders });
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const updateData: Record<string, any> = {};
    if (new_password) updateData.password = new_password;
    if (new_email) updateData.email = new_email;

    const { error } = await adminClient.auth.admin.updateUserById(user_id, updateData);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
    }

    // If email changed, also update profiles and memberships
    if (new_email) {
      await adminClient.from('profiles').update({ email: new_email }).eq('user_id', user_id);
      await adminClient.from('user_company_memberships').update({ email: new_email }).eq('user_id', user_id);
      await adminClient.from('platform_admins').update({ email: new_email }).eq('user_id', user_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
