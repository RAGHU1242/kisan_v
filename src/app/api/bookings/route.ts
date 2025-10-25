import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single booking by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(booking[0], { status: 200 });
    }

    // List bookings with filtering and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const farmerId = searchParams.get('farmerId');
    const ownerId = searchParams.get('ownerId');
    const resourceId = searchParams.get('resourceId');
    const status = searchParams.get('status');

    let query = db.select().from(bookings);

    // Build filter conditions
    const conditions = [];
    
    if (farmerId && !isNaN(parseInt(farmerId))) {
      conditions.push(eq(bookings.farmerId, parseInt(farmerId)));
    }
    
    if (ownerId && !isNaN(parseInt(ownerId))) {
      conditions.push(eq(bookings.ownerId, parseInt(ownerId)));
    }
    
    if (resourceId && !isNaN(parseInt(resourceId))) {
      conditions.push(eq(bookings.resourceId, parseInt(resourceId)));
    }
    
    if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      conditions.push(eq(bookings.status, status));
    }

    // Apply filters if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      farmerId,
      resourceId,
      ownerId,
      startDate,
      endDate,
      totalPrice,
      cropType,
      farmStage,
      cropWeight,
    } = body;

    // Validate required fields
    if (!farmerId) {
      return NextResponse.json(
        { error: 'Farmer ID is required', code: 'MISSING_FARMER_ID' },
        { status: 400 }
      );
    }

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required', code: 'MISSING_RESOURCE_ID' },
        { status: 400 }
      );
    }

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required', code: 'MISSING_OWNER_ID' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    if (!endDate) {
      return NextResponse.json(
        { error: 'End date is required', code: 'MISSING_END_DATE' },
        { status: 400 }
      );
    }

    if (totalPrice === undefined || totalPrice === null) {
      return NextResponse.json(
        { error: 'Total price is required', code: 'MISSING_TOTAL_PRICE' },
        { status: 400 }
      );
    }

    // Validate totalPrice is a valid number
    if (isNaN(parseFloat(totalPrice.toString()))) {
      return NextResponse.json(
        { error: 'Total price must be a valid number', code: 'INVALID_TOTAL_PRICE' },
        { status: 400 }
      );
    }

    // Validate IDs are valid integers
    if (isNaN(parseInt(farmerId.toString()))) {
      return NextResponse.json(
        { error: 'Farmer ID must be a valid integer', code: 'INVALID_FARMER_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(resourceId.toString()))) {
      return NextResponse.json(
        { error: 'Resource ID must be a valid integer', code: 'INVALID_RESOURCE_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(ownerId.toString()))) {
      return NextResponse.json(
        { error: 'Owner ID must be a valid integer', code: 'INVALID_OWNER_ID' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      farmerId: parseInt(farmerId.toString()),
      resourceId: parseInt(resourceId.toString()),
      ownerId: parseInt(ownerId.toString()),
      startDate: startDate.toString().trim(),
      endDate: endDate.toString().trim(),
      totalPrice: parseFloat(totalPrice.toString()),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (cropType !== undefined && cropType !== null) {
      insertData.cropType = cropType.toString().trim();
    }

    if (farmStage !== undefined && farmStage !== null) {
      insertData.farmStage = farmStage.toString().trim();
    }

    if (cropWeight !== undefined && cropWeight !== null) {
      insertData.cropWeight = cropWeight.toString().trim();
    }

    // Insert booking
    const newBooking = await db.insert(bookings).values(insertData).returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if booking exists
    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Validate and add fields if provided
    if (body.farmerId !== undefined) {
      if (isNaN(parseInt(body.farmerId.toString()))) {
        return NextResponse.json(
          { error: 'Farmer ID must be a valid integer', code: 'INVALID_FARMER_ID' },
          { status: 400 }
        );
      }
      updateData.farmerId = parseInt(body.farmerId.toString());
    }

    if (body.resourceId !== undefined) {
      if (isNaN(parseInt(body.resourceId.toString()))) {
        return NextResponse.json(
          { error: 'Resource ID must be a valid integer', code: 'INVALID_RESOURCE_ID' },
          { status: 400 }
        );
      }
      updateData.resourceId = parseInt(body.resourceId.toString());
    }

    if (body.ownerId !== undefined) {
      if (isNaN(parseInt(body.ownerId.toString()))) {
        return NextResponse.json(
          { error: 'Owner ID must be a valid integer', code: 'INVALID_OWNER_ID' },
          { status: 400 }
        );
      }
      updateData.ownerId = parseInt(body.ownerId.toString());
    }

    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate.toString().trim();
    }

    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate.toString().trim();
    }

    if (body.totalPrice !== undefined) {
      if (isNaN(parseFloat(body.totalPrice.toString()))) {
        return NextResponse.json(
          { error: 'Total price must be a valid number', code: 'INVALID_TOTAL_PRICE' },
          { status: 400 }
        );
      }
      updateData.totalPrice = parseFloat(body.totalPrice.toString());
    }

    if (body.status !== undefined) {
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.cropType !== undefined) {
      updateData.cropType = body.cropType ? body.cropType.toString().trim() : null;
    }

    if (body.farmStage !== undefined) {
      updateData.farmStage = body.farmStage ? body.farmStage.toString().trim() : null;
    }

    if (body.cropWeight !== undefined) {
      updateData.cropWeight = body.cropWeight ? body.cropWeight.toString().trim() : null;
    }

    // Update booking
    const updated = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete booking
    const deleted = await db
      .delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Booking deleted successfully',
        booking: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}