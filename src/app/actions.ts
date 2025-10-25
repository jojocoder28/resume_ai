'use server';

import { optimizeResume } from '@/ai/flows/optimize-resume';
import { generateCoverLetter } from '@/ai/flows/generate-cover-letter';
import { extractKeySkills } from '@/ai/flows/extract-key-skills';
import { createHash } from 'crypto';
import connectDB from '@/lib/mongodb';
import Request from '@/models/Request';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export type ProcessedData = {
  optimizedResume: string;
  optimizedResumeLatex: string;
  coverLetter: string;
  skills: string[];
};

export type CachedRequestData = ProcessedData & {
  jobDescription: string;
  resumeFileName?: string; // Or some identifier for the resume
};

async function getRequestHash(resumeDataUri: string, jobDescription: string): Promise<string> {
    return createHash('sha256').update(resumeDataUri + jobDescription).digest('hex');
}

export async function processApplication(
  resumeDataUri: string,
  jobDescription: string
): Promise<{ success: true; requestId: string } | { success: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }
    
    await connectDB();
    
    const requestHash = await getRequestHash(resumeDataUri, jobDescription);
    const cachedRequest = await Request.findOne({ user: user._id, requestHash });

    if (cachedRequest) {
      await User.findByIdAndUpdate(user._id, { $inc: { requestCount: 1 } });
      return {
        success: true,
        requestId: cachedRequest._id.toString(),
      };
    }

    const coverLetterInput = {
      resume: resumeDataUri,
      jobDescriptionText: jobDescription,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      userAddress: user.address,
      userWebsite: user.website,
      userLinkedin: user.linkedin,
    };

    // Run all AI tasks in parallel
    const [optimizationResult, skillsResult, coverLetterResult] = await Promise.all([
      optimizeResume({ resume: resumeDataUri, jobDescription }),
      extractKeySkills({ jobDescription }),
      generateCoverLetter(coverLetterInput),
    ]);
    
    const { optimizedResume, optimizedResumeLatex } = optimizationResult;
    if (!optimizedResume || !optimizedResumeLatex) {
      throw new Error('Could not optimize resume.');
    }

    if (!coverLetterResult.coverLetter) {
        throw new Error('Could not generate cover letter.');
    }

    const processedData: ProcessedData = {
      optimizedResume,
      optimizedResumeLatex,
      coverLetter: coverLetterResult.coverLetter,
      skills: skillsResult.skills,
    };
    
    // Save to cache
    const newRequest = new Request({
      user: user._id,
      requestHash,
      resume: resumeDataUri,
      jobDescription,
      ...processedData
    });
    await newRequest.save();

    // Increment user request count
    await User.findByIdAndUpdate(user._id, { $inc: { requestCount: 1 } });

    return {
      success: true,
      requestId: newRequest._id.toString(),
    };
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to process application. ${errorMessage}` };
  }
}

export async function getCachedRequest(
  requestId: string
): Promise<{ success: true; data: CachedRequestData } | { success: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    await connectDB();

    const request = await Request.findOne({ _id: requestId, user: user._id });

    if (!request) {
      return { success: false, error: 'Request not found or you do not have permission to view it.' };
    }

    return {
      success: true,
      data: {
        jobDescription: request.jobDescription,
        optimizedResume: request.optimizedResume,
        optimizedResumeLatex: request.optimizedResumeLatex,
        coverLetter: request.coverLetter,
        skills: request.skills,
      },
    };
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to retrieve cached request. ${errorMessage}` };
  }
}
