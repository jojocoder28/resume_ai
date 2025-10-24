'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a cover letter tailored to a specific job description.
 *
 * The flow takes a resume and job description as input and outputs a tailored cover letter.
 * - generateCoverLetter - A function that triggers the cover letter generation flow.
 * - GenerateCoverLetterInput - The input type for the generateCoverLetter function.
 * - GenerateCoverLetterOutput - The return type for the generateCoverLetter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverLetterInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the user resume.'),
  jobDescriptionText: z
    .string()
    .describe('The text content of the job description.'),
});
export type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
});
export type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const generateCoverLetterPrompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are an expert resume and cover letter writer. You will generate a cover letter based on the user's resume and the job description provided.  The cover letter should be tailored to the job description and highlight the user's relevant skills and experience.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Cover Letter:`, // Ensure the output is a well-formatted cover letter.
});

const generateCoverLetterFlow = ai.defineFlow(
  {
    name: 'generateCoverLetterFlow',
    inputSchema: GenerateCoverLetterInputSchema,
    outputSchema: GenerateCoverLetterOutputSchema,
  },
  async input => {
    const {output} = await generateCoverLetterPrompt(input);
    return output!;
  }
);
