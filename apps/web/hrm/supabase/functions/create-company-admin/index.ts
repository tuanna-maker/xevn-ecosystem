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
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify caller using getClaims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const callerId = claimsData.claims.sub;

    // Verify caller is platform admin
    const { data: isAdmin } = await anonClient.rpc('is_platform_admin', { _user_id: callerId });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Not a platform admin' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { email, password, full_name, company_id, role } = await req.json();

    if (!email || !password || !company_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, company_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: userData, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || email.split('@')[0] },
      });

      if (createErr) {
        return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      userId = userData.user.id;
    }

    // Get the role_id for the requested role (default: admin)
    const targetRole = role || 'admin';
    const { data: roleData, error: roleErr } = await adminClient
      .from('system_roles')
      .select('id')
      .eq('code', targetRole)
      .single();

    if (roleErr || !roleData) {
      return new Response(JSON.stringify({ error: `Role '${targetRole}' not found` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get company name for audit
    const { data: companyData } = await adminClient
      .from('companies')
      .select('name')
      .eq('id', company_id)
      .single();

    // Check if membership already exists
    const { data: existingMembership } = await adminClient
      .from('user_company_memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', company_id)
      .maybeSingle();

    if (existingMembership) {
      // Update existing membership role
      await adminClient
        .from('user_company_memberships')
        .update({ role: targetRole, status: 'active' })
        .eq('id', existingMembership.id);
    } else {
      // Create membership
      const { error: memberErr } = await adminClient
        .from('user_company_memberships')
        .insert({
          user_id: userId,
          company_id,
          role: targetRole,
          email,
          full_name: full_name || email.split('@')[0],
          status: 'active',
          is_primary: false,
          invited_by: 'Platform Admin',
        });

      if (memberErr) {
        return new Response(JSON.stringify({ error: memberErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Assign role in permission system
    const { error: roleAssignErr } = await adminClient
      .from('company_user_roles')
      .upsert({
        user_id: userId,
        company_id,
        role_id: roleData.id,
      }, { onConflict: 'user_id,company_id,role_id' });

    if (roleAssignErr) {
      console.error('Role assign error:', roleAssignErr);
    }

    // Mark onboarding as completed since admin is created by platform
    // Use upsert to handle race condition with handle_new_user trigger
    await adminClient
      .from('profiles')
      .upsert({
        user_id: userId,
        email,
        full_name: full_name || email.split('@')[0],
        onboarding_completed: true,
      }, { onConflict: 'user_id' });

    // Log audit
    await anonClient.rpc('log_platform_audit', {
      _action: 'company_admin_created',
      _entity_type: 'company',
      _entity_id: company_id,
      _entity_name: `${email} → ${companyData?.name || company_id}`,
    });

    return new Response(JSON.stringify({
      success: true,
      user_id: userId,
      company_name: companyData?.name,
      is_existing_user: !!existingUser,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
