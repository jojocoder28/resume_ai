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
  prompt: `You are an expert cover letter writer. Your task is to generate a cover letter in a strict, professional business letter format.

The output MUST follow this structure:
1.  **Your Contact Information** (Name, Address, Phone, Email) at the top.
2.  **Date**.
3.  **Recipient's Contact Information** (Hiring Manager Name if available, Title, Company Name, Company Address). If the recipient's name is not available, use a generic title like "Hiring Manager".
4.  **Salutation**: A professional salutation (e.g., "Dear [Hiring Manager Name],").
5.  **Body**:
    *   An introductory paragraph stating the position you are applying for and where you saw it.
    *   Two to three paragraphs highlighting your most relevant skills and experiences from your resume that match the job description.
    *   A concluding paragraph expressing your interest and a call to action (e.g., requesting an interview).
6.  **Closing**: A professional closing (e.g., "Sincerely," or "Best regards,").
7.  **Your Name** (typed).

The tone must be professional and confident. Tailor the content to the provided resume and job description.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescriptionText}}}

Cover Letter:`,
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
