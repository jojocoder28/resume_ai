import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal(''))
});

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    // Validate input
    const validatedData = updateProfileSchema.parse(body);

    await connectDB();

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { ...validatedData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}