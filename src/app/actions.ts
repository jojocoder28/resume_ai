'use server';

import { optimizeResume } from '@/ai/flows/optimize-resume';
import { generateCoverLetter } from '@/ai/flows/generate-cover-letter';
import { extractKeySkills } from '@/ai/flows/extract-key-skills';

export type ProcessedData = {
  optimizedResume: string;
  optimizedResumeLatex: string;
  coverLetter: string;
  skills: string[];
};

export async function processApplication(
  resumeDataUri: string,
  jobDescription: string
): Promise<{ success: true; data: ProcessedData } | { success: false; error: string }> {
  try {
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

    return {
      success: true,
      data: {
        optimizedResume,
        optimizedResumeLatex,
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
