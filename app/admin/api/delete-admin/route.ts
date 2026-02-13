import { createClient } from '@supabase/supabase-js';
import { createClient as createUserClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PROTECTED_EMAIL = 'sekuroheadmaster@gmail.com';

export async function DELETE(request: Request) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    // Get current user to prevent self-deletion
    const supabase = await createUserClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the target user's details to check their email
    const { data: targetUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(adminId);

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of protected master admin
    if (targetUser.user.email === PROTECTED_EMAIL) {
      return NextResponse.json(
        { error: 'Cannot delete the protected master admin account' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (targetUser.user.id === currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    // Delete user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(adminId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
