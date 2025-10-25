import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const bookingId = params.bookingId;

    // Validate bookingId
    if (!bookingId || isNaN(parseInt(bookingId))) {
      return NextResponse.json(
        {
          error: 'Valid booking ID is required',
          code: 'INVALID_BOOKING_ID',
        },
        { status: 400 }
      );
    }

    const parsedBookingId = parseInt(bookingId);

    // Get pagination params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query messages for the booking
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.bookingId, parsedBookingId))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('GET chat messages error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}