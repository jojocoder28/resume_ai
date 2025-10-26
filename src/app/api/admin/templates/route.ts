import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Template from '@/models/Template';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  imageUrl: z.string().url('Must be a valid URL'),
  imageHint: z.string().optional(),
  latexCode: z.string().min(20, 'LaTeX code is required'),
  isDefault: z.boolean().optional(),
});

const templateUpdateSchema = templateSchema.extend({
    _id: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validatedData = templateSchema.parse(body);

    await connectDB();
    
    // If setting a new default, unset the old one
    if (validatedData.isDefault) {
        await Template.updateMany({ isDefault: true }, { $set: { isDefault: false } });
    }

    const newTemplate = new Template(validatedData);
    await newTemplate.save();

    return NextResponse.json({ message: 'Template created successfully', template: newTemplate }, { status: 201 });
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
        const { _id, ...updateData } = templateUpdateSchema.parse(body);

        await connectDB();
        
        // If setting a new default, unset the old one
        if (updateData.isDefault) {
            await Template.updateMany({ _id: { $ne: _id }, isDefault: true }, { $set: { isDefault: false } });
        }

        const updatedTemplate = await Template.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
        
        if (!updatedTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Template updated successfully', template: updatedTemplate });
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
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        await connectDB();
        
        const deletedTemplate = await Template.findByIdAndDelete(id);
        if (!deletedTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
