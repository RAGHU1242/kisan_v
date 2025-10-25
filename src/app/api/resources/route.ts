import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resources } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single resource by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const resource = await db
        .select()
        .from(resources)
        .where(eq(resources.id, parseInt(id)))
        .limit(1);

      if (resource.length === 0) {
        return NextResponse.json(
          { error: 'Resource not found', code: 'RESOURCE_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(resource[0], { status: 200 });
    }

    // List resources with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
    const type = searchParams.get('type');

    let query = db.select().from(resources);

    // Build filter conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(resources.status, status));
    }

    if (ownerId) {
      if (isNaN(parseInt(ownerId))) {
        return NextResponse.json(
          { error: 'Valid ownerId is required', code: 'INVALID_OWNER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(resources.ownerId, parseInt(ownerId)));
    }

    if (type) {
      conditions.push(eq(resources.type, type));
    }

    if (search) {
      conditions.push(
        or(
          like(resources.name, `%${search}%`),
          like(resources.location, `%${search}%`)
        )
      );
    }

    // Apply filters if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting, pagination
    const results = await query
      .orderBy(desc(resources.createdAt))
      .limit(limit)
      .offset(offset);

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
    const { ownerId, name, type, pricePerDay, location, description, capacity, latitude, longitude, imageUrl } = body;

    // Validate required fields
    if (!ownerId) {
      return NextResponse.json(
        { error: 'ownerId is required', code: 'MISSING_OWNER_ID' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string' || type.trim() === '') {
      return NextResponse.json(
        { error: 'type is required and must be a non-empty string', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (pricePerDay === undefined || pricePerDay === null) {
      return NextResponse.json(
        { error: 'pricePerDay is required', code: 'MISSING_PRICE_PER_DAY' },
        { status: 400 }
      );
    }

    if (typeof pricePerDay !== 'number' || isNaN(pricePerDay) || pricePerDay < 0) {
      return NextResponse.json(
        { error: 'pricePerDay must be a valid positive number', code: 'INVALID_PRICE_PER_DAY' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string' || location.trim() === '') {
      return NextResponse.json(
        { error: 'location is required and must be a non-empty string', code: 'MISSING_LOCATION' },
        { status: 400 }
      );
    }

    if (typeof ownerId !== 'number' || isNaN(ownerId)) {
      return NextResponse.json(
        { error: 'ownerId must be a valid number', code: 'INVALID_OWNER_ID' },
        { status: 400 }
      );
    }

    // Validate optional numeric fields
    if (latitude !== undefined && latitude !== null && (typeof latitude !== 'number' || isNaN(latitude))) {
      return NextResponse.json(
        { error: 'latitude must be a valid number', code: 'INVALID_LATITUDE' },
        { status: 400 }
      );
    }

    if (longitude !== undefined && longitude !== null && (typeof longitude !== 'number' || isNaN(longitude))) {
      return NextResponse.json(
        { error: 'longitude must be a valid number', code: 'INVALID_LONGITUDE' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      ownerId: parseInt(String(ownerId)),
      name: name.trim(),
      type: type.trim(),
      pricePerDay: parseFloat(String(pricePerDay)),
      location: location.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (description !== undefined && description !== null) {
      insertData.description = typeof description === 'string' ? description.trim() : String(description);
    }

    if (capacity !== undefined && capacity !== null) {
      insertData.capacity = typeof capacity === 'string' ? capacity.trim() : String(capacity);
    }

    if (latitude !== undefined && latitude !== null) {
      insertData.latitude = parseFloat(String(latitude));
    }

    if (longitude !== undefined && longitude !== null) {
      insertData.longitude = parseFloat(String(longitude));
    }

    if (imageUrl !== undefined && imageUrl !== null) {
      insertData.imageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : String(imageUrl);
    }

    // Insert into database
    const newResource = await db.insert(resources).values(insertData).returning();

    return NextResponse.json(newResource[0], { status: 201 });
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

    // Check if resource exists
    const existingResource = await db
      .select()
      .from(resources)
      .where(eq(resources.id, parseInt(id)))
      .limit(1);

    if (existingResource.length === 0) {
      return NextResponse.json(
        { error: 'Resource not found', code: 'RESOURCE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with validation
    const updates: any = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json(
          { error: 'name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if (body.type !== undefined) {
      if (typeof body.type !== 'string' || body.type.trim() === '') {
        return NextResponse.json(
          { error: 'type must be a non-empty string', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
      updates.type = body.type.trim();
    }

    if (body.pricePerDay !== undefined) {
      if (typeof body.pricePerDay !== 'number' || isNaN(body.pricePerDay) || body.pricePerDay < 0) {
        return NextResponse.json(
          { error: 'pricePerDay must be a valid positive number', code: 'INVALID_PRICE_PER_DAY' },
          { status: 400 }
        );
      }
      updates.pricePerDay = parseFloat(String(body.pricePerDay));
    }

    if (body.location !== undefined) {
      if (typeof body.location !== 'string' || body.location.trim() === '') {
        return NextResponse.json(
          { error: 'location must be a non-empty string', code: 'INVALID_LOCATION' },
          { status: 400 }
        );
      }
      updates.location = body.location.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description !== null && body.description !== '' 
        ? (typeof body.description === 'string' ? body.description.trim() : String(body.description))
        : null;
    }

    if (body.capacity !== undefined) {
      updates.capacity = body.capacity !== null && body.capacity !== '' 
        ? (typeof body.capacity === 'string' ? body.capacity.trim() : String(body.capacity))
        : null;
    }

    if (body.latitude !== undefined) {
      if (body.latitude !== null && (typeof body.latitude !== 'number' || isNaN(body.latitude))) {
        return NextResponse.json(
          { error: 'latitude must be a valid number', code: 'INVALID_LATITUDE' },
          { status: 400 }
        );
      }
      updates.latitude = body.latitude !== null ? parseFloat(String(body.latitude)) : null;
    }

    if (body.longitude !== undefined) {
      if (body.longitude !== null && (typeof body.longitude !== 'number' || isNaN(body.longitude))) {
        return NextResponse.json(
          { error: 'longitude must be a valid number', code: 'INVALID_LONGITUDE' },
          { status: 400 }
        );
      }
      updates.longitude = body.longitude !== null ? parseFloat(String(body.longitude)) : null;
    }

    if (body.imageUrl !== undefined) {
      updates.imageUrl = body.imageUrl !== null && body.imageUrl !== '' 
        ? (typeof body.imageUrl === 'string' ? body.imageUrl.trim() : String(body.imageUrl))
        : null;
    }

    if (body.status !== undefined) {
      if (typeof body.status !== 'string' || !['pending', 'verified', 'rejected'].includes(body.status)) {
        return NextResponse.json(
          { error: 'status must be one of: pending, verified, rejected', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.verifiedBy !== undefined) {
      if (body.verifiedBy !== null && (typeof body.verifiedBy !== 'number' || isNaN(body.verifiedBy))) {
        return NextResponse.json(
          { error: 'verifiedBy must be a valid number or null', code: 'INVALID_VERIFIED_BY' },
          { status: 400 }
        );
      }
      updates.verifiedBy = body.verifiedBy !== null ? parseInt(String(body.verifiedBy)) : null;
    }

    if (body.ownerId !== undefined) {
      if (typeof body.ownerId !== 'number' || isNaN(body.ownerId)) {
        return NextResponse.json(
          { error: 'ownerId must be a valid number', code: 'INVALID_OWNER_ID' },
          { status: 400 }
        );
      }
      updates.ownerId = parseInt(String(body.ownerId));
    }

    // If no valid updates provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update the resource
    const updated = await db
      .update(resources)
      .set(updates)
      .where(eq(resources.id, parseInt(id)))
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

    // Check if resource exists
    const existingResource = await db
      .select()
      .from(resources)
      .where(eq(resources.id, parseInt(id)))
      .limit(1);

    if (existingResource.length === 0) {
      return NextResponse.json(
        { error: 'Resource not found', code: 'RESOURCE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the resource
    const deleted = await db
      .delete(resources)
      .where(eq(resources.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Resource deleted successfully',
        resource: deleted[0],
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