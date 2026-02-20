import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { deleteCache } from '@/lib/redis/client';

export async function POST(request: Request) {
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
    
    const { data, error } = await supabase
      .from('sekuro_event')
      .insert([body])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Invalidate all event caches
    await Promise.all([
      deleteCache('event:list'),
      deleteCache('client:event:list'),
      deleteCache('client:event:ongoing'),
      deleteCache('client:event:upcoming')
    ]);

    return NextResponse.json({
      message: 'Event added successfully',
      data: data
    });

  } catch (error) {
    console.error('Error adding event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
