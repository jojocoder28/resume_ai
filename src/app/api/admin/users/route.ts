import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const userCreateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']),
  avatar: z.string().url().optional().or(z.literal('')),
});

const userUpdateSchema = z.object({
    _id: z.string(),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['user', 'admin']),
    avatar: z.string().url().optional().or(z.literal('')),
  });

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validatedData = userCreateSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const newUser = new User(validatedData);
    await newUser.save();
    
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    return NextResponse.json({ message: 'User created successfully', user: userResponse }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { _id, ...updateData } = userUpdateSchema.parse(body);

        await connectDB();

        if (updateData.password && updateData.password.length > 0) {
            // If a new password is provided, it will be hashed by the pre-save hook
        } else {
            // Do not update the password if it's not provided
            delete updateData.password;
        }

        const user = await User.findById(_id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        // Manually update fields and save to trigger pre-save hook for password
        Object.assign(user, updateData);
        await user.save();

        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        return NextResponse.json({ message: 'User updated successfully', user: userResponse });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await requireAdmin();
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        await connectDB();
        
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Also delete related requests
        await mongoose.model('Request').deleteMany({ user: id });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

// Re-import mongoose to use its model function in the DELETE handler
import mongoose from 'mongoose';
