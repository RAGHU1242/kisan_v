import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

const VALID_ROLES = ['farmer', 'owner', 'admin'] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single user fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { 
            error: 'Valid ID is required',
            code: 'INVALID_ID' 
          },
          { status: 400 }
        );
      }

      const user = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { 
            error: 'User not found',
            code: 'USER_NOT_FOUND' 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(user[0], { status: 200 });
    }

    // List users with filtering, search, and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    let query = db.select().from(users);

    const conditions = [];

    // Role filter
    if (role) {
      if (!VALID_ROLES.includes(role as any)) {
        return NextResponse.json(
          { 
            error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
            code: 'INVALID_ROLE' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(users.role, role));
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, firebaseUid, phone } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL' 
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { 
          error: 'Name is required',
          code: 'MISSING_NAME' 
        },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { 
          error: 'Role is required',
          code: 'MISSING_ROLE' 
        },
        { status: 400 }
      );
    }

    if (!firebaseUid) {
      return NextResponse.json(
        { 
          error: 'Firebase UID is required',
          code: 'MISSING_FIREBASE_UID' 
        },
        { status: 400 }
      );
    }

    // Validate role value
    if (!VALID_ROLES.includes(role as any)) {
      return NextResponse.json(
        { 
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'INVALID_ROLE' 
        },
        { status: 400 }
      );
    }

    // Check for unique email
    const existingEmail = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { 
          error: 'Email already exists',
          code: 'DUPLICATE_EMAIL' 
        },
        { status: 400 }
      );
    }

    // Check for unique firebaseUid
    const existingFirebaseUid = await db.select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid.trim()))
      .limit(1);

    if (existingFirebaseUid.length > 0) {
      return NextResponse.json(
        { 
          error: 'Firebase UID already exists',
          code: 'DUPLICATE_FIREBASE_UID' 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedRole = role.trim();
    const sanitizedFirebaseUid = firebaseUid.trim();
    const sanitizedPhone = phone ? phone.trim() : null;

    // Insert new user
    const newUser = await db.insert(users)
      .values({
        email: sanitizedEmail,
        name: sanitizedName,
        role: sanitizedRole,
        firebaseUid: sanitizedFirebaseUid,
        phone: sanitizedPhone,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}