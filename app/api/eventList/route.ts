import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Add timezone info (UTC+7) to timestamps and filter future events
    const now = Date.now();
    const eventsWithTimezone = (data || []).map((event) => ({
      ...event,
      event_start: event.event_start.includes('+') || event.event_start.includes('Z') 
        ? event.event_start 
        : `${event.event_start}+07:00`
    }));

    const futureEvents = eventsWithTimezone.filter((event) => {
      const eventTime = new Date(event.event_start).getTime();
      return eventTime > now;
    });

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
