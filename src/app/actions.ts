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

async function getRequestHash(resumeDataUri: string, jobDescription: string): Promise<string> {
    return createHash('sha256').update(resumeDataUri + jobDescription).digest('hex');
}

export async function processApplication(
  resumeDataUri: string,
  jobDescription: string
): Promise<{ success: true; data: ProcessedData } | { success: false; error: string }> {
  try {
    const user = await getCurrentUser({ headers: new Headers() });
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
        data: {
          optimizedResume: cachedRequest.optimizedResume,
          optimizedResumeLatex: cachedRequest.optimizedResumeLatex,
          coverLetter: cachedRequest.coverLetter,
          skills: cachedRequest.skills,
        },
      };
    }

    const [optimizationResult, skillsResult] = await Promise.all([
      optimizeResume({ resume: resumeDataUri, jobDescription }),
      extractKeySkills({ jobDescription }),
    ]);

    const { optimizedResume, optimizedResumeLatex } = optimizationResult;
    if (!optimizedResume || !optimizedResumeLatex) {
      throw new Error('Could not optimize resume.');
    }

    const coverLetterResult = await generateCoverLetter({
      resumeText: optimizedResume,
      jobDescriptionText: jobDescription,
    });
    
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
      data: processedData,
    };
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to process application. ${errorMessage}` };
  }
}