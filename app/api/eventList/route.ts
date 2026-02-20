import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis/client';

const CACHE_KEY = 'client:event:list';
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

export async function GET() {
  try {
    // Check cache first
    const cachedData = await getCache(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json({ data: cachedData });
    }
    
    // Do database operation if cache miss
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

    const { data, error } = await supabase
      .from('sekuro_event')
      .select('*')
      .order('event_start', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Filter future events
    const now = Date.now();
    const futureEvents = (data || []).filter((event) => {
      const eventTime = new Date(event.event_start).getTime();
      return eventTime > now;
    });

    // Cache the result
    await setCache(CACHE_KEY, futureEvents, CACHE_TTL);

    return NextResponse.json({
      data: futureEvents
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
