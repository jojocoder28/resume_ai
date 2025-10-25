import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Request from '@/models/Request';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const requests = await Request.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select('jobDescription createdAt')
      .limit(20);

    return NextResponse.json(requests);

  } catch (error: any) {
    console.error('Get requests error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
