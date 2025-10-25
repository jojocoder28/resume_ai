'use server';

/**
 * @fileOverview Extracts key skills from a job description.
 *
 * - extractKeySkills - A function that extracts key skills from a job description.
 * - ExtractKeySkillsInput - The input type for the extractKeySkills function.
 * - ExtractKeySkillsOutput - The return type for the extractKeySkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeySkillsInputSchema = z.object({
  jobDescription: z.string().describe('The job description to extract skills from.'),
});
type ExtractKeySkillsInput = z.infer<typeof ExtractKeySkillsInputSchema>;

const ExtractKeySkillsOutputSchema = z.object({
  skills: z.array(z.string()).describe('The key skills extracted from the job description.'),
});
type ExtractKeySkillsOutput = z.infer<typeof ExtractKeySkillsOutputSchema>;

export async function extractKeySkills(input: ExtractKeySkillsInput): Promise<ExtractKeySkillsOutput> {
  return extractKeySkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractKeySkillsPrompt',
  input: {schema: ExtractKeySkillsInputSchema},
  output: {schema: ExtractKeySkillsOutputSchema},
  prompt: `You are an expert in extracting key skills from job descriptions.

  Extract the key skills from the following job description. Respond with an array of skills.

  Job Description: {{{jobDescription}}}
  Skills:`, // Ensure the model outputs just the skills array
});

const extractKeySkillsFlow = ai.defineFlow(
  {
    name: 'extractKeySkillsFlow',
    inputSchema: ExtractKeySkillsInputSchema,
    outputSchema: ExtractKeySkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
