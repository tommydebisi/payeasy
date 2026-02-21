import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createListingSchema } from '@/lib/validators/listing';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // 1. Extract and verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.landlord_id) {
      // Fallback: If landlord_id is not in our custom token payload, check standard 'sub'
      const landlord_id = decoded?.landlord_id || decoded?.sub;
      if (!landlord_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      decoded.landlord_id = landlord_id;
    }

    const landlordId = decoded.landlord_id as string;

    // 2. Parse request body
    const body = await request.json();

    // 3. Validate body with Zod
    const validationResult = createListingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const listingData = validationResult.data;

    // 4. Create listing in database via Prisma
    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        landlord_id: landlordId,
        status: 'active', // explicitly set status, although it defaults to active
      },
    });

    // 5. Return success response
    return NextResponse.json({ listing }, { status: 201 });

  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}