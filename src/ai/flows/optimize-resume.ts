'use server';
/**
 * @fileOverview This file defines a Genkit flow for optimizing a resume based on a job description.
 *
 * - optimizeResume - An exported function that takes a resume and job description as input and returns an optimized resume.
 * - OptimizeResumeInput - The input type for the optimizeResume function, including the resume and job description.
 * - OptimizeResumeOutput - The output type for the optimizeResume function, which is the optimized resume.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeResumeInputSchema = z.object({
  resume: z
    .string()
    .describe("The user's resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  jobDescription: z.string().describe('The job description for the target position.'),
});
export type OptimizeResumeInput = z.infer<typeof OptimizeResumeInputSchema>;

const OptimizeResumeOutputSchema = z.object({
  optimizedResume: z
    .string()
    .describe(
      'The optimized resume in Markdown format. Changes should be highlighted using <ins> for additions and <del> for deletions.'
    ),
  optimizedResumeLatex: z
    .string()
    .describe('The final, optimized resume in a clean, compilable LaTeX format.'),
});
export type OptimizeResumeOutput = z.infer<typeof OptimizeResumeOutputSchema>;

export async function optimizeResume(input: OptimizeResumeInput): Promise<OptimizeResumeOutput> {
  return optimizeResumeFlow(input);
}

const optimizeResumePrompt = ai.definePrompt({
  name: 'optimizeResumePrompt',
  input: {schema: OptimizeResumeInputSchema},
  output: {schema: OptimizeResumeOutputSchema},
  prompt: `You are an expert resume writer specializing in tailoring resumes to specific job descriptions and optimizing them for applicant tracking systems (ATS).

You will rewrite the resume to be ATS-friendly and highlight the skills and experiences that are most relevant to the job description.

You must provide two outputs:
1.  A Markdown version of the resume. For this version, you MUST highlight the changes you make. Use the <ins> tag for additions and the <del> tag for deletions. For example: "I have experience with <del>React</del><ins>React.js</ins>." Preserve the original structure as much as possible.
2.  A full, compilable LaTeX document version of the resume. This version should be the clean, final, optimized resume with all changes applied. Do NOT highlight the changes in this LaTeX version. It should be ready for compilation. The document should be a standard article class.

Resume:
{{media url=resume}}

Job Description:
{{jobDescription}}

Optimize the resume and provide both Markdown and LaTeX outputs.
`,
});

const optimizeResumeFlow = ai.defineFlow(
  {
    name: 'optimizeResumeFlow',
    inputSchema: OptimizeResumeInputSchema,
    outputSchema: OptimizeResumeOutputSchema,
  },
  async input => {
    const {output} = await optimizeResumePrompt(input);
    return output!;
  }
);
