import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { booking_id, email, member_name, phone, password } = await req.json();

    if (!booking_id || !email) {
      return new Response(
        JSON.stringify({ error: "booking_id and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // If password provided, use it; otherwise generate a random one
    // (User will reset via magic link anyway)
    const userPassword = password || crypto.randomUUID();

    // Create auth user with admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: member_name || '',
        phone: phone || '',
      },
    });

    if (userError) {
      // Check if user already exists
      if (userError.message?.includes('already been registered') || userError.message?.includes('already registered')) {
        // Try to find the existing user and update the booking/member
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === email);
        if (existingUser) {
          // Update booking and member with existing user_id
          await supabase.from('bookings').update({ user_id: existingUser.id }).eq('booking_id', booking_id);
          await supabase.from('members').update({ user_id: existingUser.id }).eq('email', email);
          // Confirm their email if not already
          await supabase.auth.admin.updateUserById(existingUser.id, { email_confirm: true });
          return new Response(
            JSON.stringify({ success: true, message: 'Linked existing account', user: { id: existingUser.id, email: existingUser.email } }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }
      return new Response(
        JSON.stringify({ error: userError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = userData.user.id;

    // Update the booking with the new user_id
    const { error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({ user_id: userId })
      .eq('booking_id', booking_id);

    if (bookingUpdateError) {
      console.error("Failed to update booking:", bookingUpdateError);
    }

    // Update the member record with the new user_id (if exists)
    const { error: memberUpdateError } = await supabase
      .from('members')
      .update({ user_id: userId })
      .eq('email', email);

    if (memberUpdateError) {
      console.error("Failed to update member:", memberUpdateError);
    }

    // Send password reset email so user can set their own password
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: password ? 'Account created with provided password' : 'Account created. Password reset email sent.',
        user: { id: userId, email: userData.user.email },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
