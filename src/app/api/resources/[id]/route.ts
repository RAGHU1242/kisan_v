import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resources } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
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
        { 
          error: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate status if provided
    if (body.status && !['pending', 'verified', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { 
          error: 'Status must be one of: pending, verified, rejected',
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Validate verifiedBy if provided
    if (body.verifiedBy !== undefined && body.verifiedBy !== null) {
      if (isNaN(parseInt(body.verifiedBy))) {
        return NextResponse.json(
          { 
            error: 'verifiedBy must be a valid integer',
            code: 'INVALID_VERIFIED_BY' 
          },
          { status: 400 }
        );
      }
    }

    // Validate pricePerDay if provided
    if (body.pricePerDay !== undefined && (isNaN(parseFloat(body.pricePerDay)) || parseFloat(body.pricePerDay) < 0)) {
      return NextResponse.json(
        { 
          error: 'pricePerDay must be a valid positive number',
          code: 'INVALID_PRICE' 
        },
        { status: 400 }
      );
    }

    // Validate latitude if provided
    if (body.latitude !== undefined && body.latitude !== null) {
      const lat = parseFloat(body.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json(
          { 
            error: 'Latitude must be between -90 and 90',
            code: 'INVALID_LATITUDE' 
          },
          { status: 400 }
        );
      }
    }

    // Validate longitude if provided
    if (body.longitude !== undefined && body.longitude !== null) {
      const lon = parseFloat(body.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        return NextResponse.json(
          { 
            error: 'Longitude must be between -180 and 180',
            code: 'INVALID_LONGITUDE' 
          },
          { status: 400 }
        );
      }
    }

    // Prepare update object with only provided fields
    const updates: any = {};

    if (body.name !== undefined) {
      updates.name = body.name.trim();
      if (!updates.name) {
        return NextResponse.json(
          { 
            error: 'Name cannot be empty',
            code: 'INVALID_NAME' 
          },
          { status: 400 }
        );
      }
    }

    if (body.type !== undefined) {
      updates.type = body.type.trim();
      if (!updates.type) {
        return NextResponse.json(
          { 
            error: 'Type cannot be empty',
            code: 'INVALID_TYPE' 
          },
          { status: 400 }
        );
      }
    }

    if (body.description !== undefined) {
      updates.description = body.description ? body.description.trim() : null;
    }

    if (body.pricePerDay !== undefined) {
      updates.pricePerDay = parseFloat(body.pricePerDay);
    }

    if (body.capacity !== undefined) {
      updates.capacity = body.capacity ? body.capacity.trim() : null;
    }

    if (body.location !== undefined) {
      updates.location = body.location.trim();
      if (!updates.location) {
        return NextResponse.json(
          { 
            error: 'Location cannot be empty',
            code: 'INVALID_LOCATION' 
          },
          { status: 400 }
        );
      }
    }

    if (body.latitude !== undefined) {
      updates.latitude = body.latitude !== null ? parseFloat(body.latitude) : null;
    }

    if (body.longitude !== undefined) {
      updates.longitude = body.longitude !== null ? parseFloat(body.longitude) : null;
    }

    if (body.imageUrl !== undefined) {
      updates.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    }

    if (body.status !== undefined) {
      updates.status = body.status;
    }

    if (body.verifiedBy !== undefined) {
      updates.verifiedBy = body.verifiedBy !== null ? parseInt(body.verifiedBy) : null;
    }

    // Check if there are any updates to perform
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid fields provided for update',
          code: 'NO_UPDATE_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Update resource
    const updatedResource = await db
      .update(resources)
      .set(updates)
      .where(eq(resources.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedResource[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT /api/resources/[id] error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}