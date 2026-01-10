import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Admin user details
    const email = 'schoolrankerafrica@gmail.com';
    const password = 'PRISM5684#';
    const fullName = 'Admin User';

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already') || authError.message.includes('exists')) {
        // Get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users?.find(u => u.email === email);
        if (existingUser) {
          // Check if already has admin role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', existingUser.id)
            .eq('role', 'admin')
            .single();

          if (existingRole) {
            return new Response(
              JSON.stringify({ success: true, message: 'Admin user already exists with admin role' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Get profile user id
          const { data: profile } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', existingUser.id)
            .single();

          if (profile) {
            // Add admin role
            await supabase.from('user_roles').upsert({
              user_id: profile.id,
              role: 'admin'
            }, { onConflict: 'user_id,role' });

            return new Response(
              JSON.stringify({ success: true, message: 'Admin role added to existing user' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
      throw authError;
    }

    const authUserId = authData.user!.id;

    // Check if profile was created by trigger
    let { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .single();

    // If not, create it manually
    if (!profile) {
      const { data: newProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUserId,
          email,
          full_name: fullName,
        })
        .select('id')
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    }

    // Add admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: profile.id,
        role: 'admin'
      });

    if (roleError && !roleError.message.includes('duplicate')) {
      throw roleError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        userId: profile.id,
        email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating admin user:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
