import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Request from '@/models/Request';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    try {
        await requireAdmin();
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
        }

        await connectDB();
        
        const deletedRequest = await Request.findByIdAndDelete(id);
        if (!deletedRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Request deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
