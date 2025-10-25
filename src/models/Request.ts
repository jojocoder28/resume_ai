import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './User';

export interface IRequest extends Document {
  user: Types.ObjectId | IUser;
  requestHash: string;
  resume: string;
  jobDescription: string;
  optimizedResume: string;
  optimizedResumeLatex: string;
  coverLetter: string;
  skills: string[];
  createdAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestHash: {
    type: String,
    required: true,
    index: true,
  },
  resume: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  optimizedResume: {
    type: String,
    required: true,
  },
  optimizedResumeLatex: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

RequestSchema.index({ user: 1, requestHash: 1 });

export default mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);
