import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Template from '@/models/Template';

// This is a public route to fetch all templates
export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find({}).sort({ createdAt: -1 });
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
