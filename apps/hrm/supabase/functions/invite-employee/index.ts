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

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Allow service role key calls (for internal/admin use)
    const isServiceRole = token === serviceRoleKey;

    if (!isServiceRole) {
      const anonClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const callerId = claimsData.claims.sub;

      const { employees: _e, company_id: cid } = await req.clone().json();

      const { data: hasAccess } = await anonClient.rpc('is_company_admin', { _user_id: callerId, _company_id: cid });
      const { data: isPlatformAdmin } = await anonClient.rpc('is_platform_admin', { _user_id: callerId });

      if (!hasAccess && !isPlatformAdmin) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const results: Array<{ email: string; success: boolean; error?: string }> = [];

    // Get employee role id
    const { data: employeeRole } = await adminClient
      .from('system_roles')
      .select('id')
      .eq('code', 'employee')
      .single();

    for (const emp of employees) {
      try {
        if (!emp.email) {
          results.push({ email: emp.email || 'N/A', success: false, error: 'No email provided' });
          continue;
        }

        // Check if user already exists
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u: any) => u.email === emp.email);

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Create user with default password
          const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
            email: emp.email,
            password: '12345678',
            email_confirm: true,
            user_metadata: { full_name: emp.full_name || emp.email.split('@')[0] },
          });

          if (createErr) {
            results.push({ email: emp.email, success: false, error: createErr.message });
            continue;
          }
          userId = createData.user.id;
        }

        // Check if membership already exists
        const { data: existingMembership } = await adminClient
          .from('user_company_memberships')
          .select('id')
          .eq('user_id', userId)
          .eq('company_id', company_id)
          .maybeSingle();

        if (!existingMembership) {
          // Create membership
          await adminClient
            .from('user_company_memberships')
            .insert({
              user_id: userId,
              company_id,
              role: 'employee',
              email: emp.email,
              full_name: emp.full_name || emp.email.split('@')[0],
              employee_id: emp.employee_id || null,
              status: 'active',
              is_primary: false,
              invited_at: new Date().toISOString(),
              invited_by: 'Email Invite',
            });
        } else {
          // Update existing to active
          await adminClient
            .from('user_company_memberships')
            .update({ status: 'active' })
            .eq('id', existingMembership.id);
        }

        // Assign employee role in permission system
        if (employeeRole) {
          await adminClient
            .from('company_user_roles')
            .upsert({
              user_id: userId,
              company_id,
              role_id: employeeRole.id,
            }, { onConflict: 'user_id,company_id,role_id' });
        }

        // Mark onboarding as completed - use upsert for race condition with trigger
        await adminClient
          .from('profiles')
          .upsert({
            user_id: userId,
            email: emp.email,
            full_name: emp.full_name || emp.email.split('@')[0],
            onboarding_completed: true,
          }, { onConflict: 'user_id' });

        results.push({ email: emp.email, success: true });
      } catch (err: any) {
        results.push({ email: emp.email || 'N/A', success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({
      success: true,
      total: employees.length,
      invited: successCount,
      failed: failCount,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
