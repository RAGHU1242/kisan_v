import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, senderId, message } = body;

    // Validate required fields
    if (!bookingId) {
      return NextResponse.json(
        { 
          error: 'Booking ID is required',
          code: 'MISSING_BOOKING_ID' 
        },
        { status: 400 }
      );
    }

    if (!senderId) {
      return NextResponse.json(
        { 
          error: 'Sender ID is required',
          code: 'MISSING_SENDER_ID' 
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { 
          error: 'Message is required',
          code: 'MISSING_MESSAGE' 
        },
        { status: 400 }
      );
    }

    // Validate message is not empty after trimming
    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { 
          error: 'Message cannot be empty',
          code: 'EMPTY_MESSAGE' 
        },
        { status: 400 }
      );
    }

    // Validate bookingId and senderId are valid integers
    const parsedBookingId = parseInt(bookingId);
    const parsedSenderId = parseInt(senderId);

    if (isNaN(parsedBookingId)) {
      return NextResponse.json(
        { 
          error: 'Invalid booking ID',
          code: 'INVALID_BOOKING_ID' 
        },
        { status: 400 }
      );
    }

    if (isNaN(parsedSenderId)) {
      return NextResponse.json(
        { 
          error: 'Invalid sender ID',
          code: 'INVALID_SENDER_ID' 
        },
        { status: 400 }
      );
    }

    // Create new chat message
    const newMessage = await db.insert(chatMessages)
      .values({
        bookingId: parsedBookingId,
        senderId: parsedSenderId,
        message: trimmedMessage,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}