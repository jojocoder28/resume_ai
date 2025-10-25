'use server';

import { createHash } from 'crypto';
import { optimizeResume } from '@/ai/flows/optimize-resume';
import { generateCoverLetter } from '@/ai/flows/generate-cover-letter';
import { extractKeySkills } from '@/ai/flows/extract-key-skills';
import { getCurrentUser } from '@/lib/auth';
import { headers } from 'next/headers';
import Request from '@/models/Request';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

export type ProcessedData = {
  optimizedResume: string;
  coverLetter: string;
  skills: string[];
};

function generateRequestHash(resumeDataUri: string, jobDescription: string): string {
  const hash = createHash('sha256');
  hash.update(resumeDataUri);
  hash.update(jobDescription);
  return hash.digest('hex');
}

export async function processApplication(
  resumeDataUri: string,
  jobDescription: string
): Promise<{ success: true; data: ProcessedData } | { success: false; error: string }> {
  try {
    const headersList = headers();
    const request = { headers: headersList } as any;

    const user = await getCurrentUser(request);
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }
    
    await connectDB();

    const requestHash = generateRequestHash(resumeDataUri, jobDescription);
    const cachedRequest = await Request.findOne({ requestHash, user: user._id });

    if (cachedRequest) {
      await User.findByIdAndUpdate(user._id, { $inc: { requestCount: 1 } });
      return {
        success: true,
        data: {
          optimizedResume: cachedRequest.optimizedResume,
          coverLetter: cachedRequest.coverLetter,
          skills: cachedRequest.skills,
        },
      };
    }

    const [optimizationResult, skillsResult] = await Promise.all([
      optimizeResume({ resume: resumeDataUri, jobDescription }),
      extractKeySkills({ jobDescription }),
    ]);

    const optimizedResume = optimizationResult.optimizedResume;
    if (!optimizedResume) {
      throw new Error('Could not optimize resume.');
    }

    const coverLetterResult = await generateCoverLetter({
      resumeText: optimizedResume,
      jobDescriptionText: jobDescription,
    });
    
    if (!coverLetterResult.coverLetter) {
        throw new Error('Could not generate cover letter.');
    }

    const newRequest = new Request({
        user: user._id,
        requestHash,
        resume: resumeDataUri,
        jobDescription,
        optimizedResume: optimizedResume,
        coverLetter: coverLetterResult.coverLetter,
        skills: skillsResult.skills,
    });
    await newRequest.save();

    await User.findByIdAndUpdate(user._id, { $inc: { requestCount: 1 } });


    return {
      success: true,
      data: {
        optimizedResume,
        coverLetter: coverLetterResult.coverLetter,
        skills: skillsResult.skills,
      },
    };
  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to process application. ${errorMessage}` };
  }
}
