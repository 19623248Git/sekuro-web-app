import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { deleteCache } from '@/lib/redis/client';

export async function PUT(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'sekuro26'
        }
      }
    );

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('sekuro_event')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Invalidate all event caches
    await Promise.all([
      deleteCache('admin:event:list'),
      deleteCache('client:event:list'),
      deleteCache('client:event:ongoing'),
      deleteCache('client:event:upcoming')
    ]);

    return NextResponse.json({
      message: 'Event updated successfully',
      data: data
    });

  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
