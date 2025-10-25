
import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  latexCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  imageHint: {
    type: String,
    default: '',
  },
  latexCode: {
    type: String,
    required: [true, 'LaTeX code is required'],
  },
  isDefault: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
