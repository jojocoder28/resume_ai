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
  resume: z
    .string()
    .describe("The user's resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  jobDescriptionText: z
    .string()
    .describe('The text content of the job description.'),
  userName: z.string().describe("The user's full name."),
  userEmail: z.string().describe("The user's email address."),
  userPhone: z.string().optional().describe("The user's phone number."),
  userAddress: z.string().optional().describe("The user's physical address."),
  userWebsite: z.string().optional().describe("The user's personal website or portfolio URL."),
  userLinkedin: z.string().optional().describe("The user's LinkedIn profile URL."),
});
type GenerateCoverLetterInput = z.infer<typeof GenerateCoverLetterInputSchema>;

const GenerateCoverLetterOutputSchema = z.object({
  coverLetter: z.string().describe('The generated cover letter.'),
});
type GenerateCoverLetterOutput = z.infer<typeof GenerateCoverLetterOutputSchema>;

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<GenerateCoverLetterOutput> {
  return generateCoverLetterFlow(input);
}

const generateCoverLetterPrompt = ai.definePrompt({
  name: 'generateCoverLetterPrompt',
  input: {schema: GenerateCoverLetterInputSchema},
  output: {schema: GenerateCoverLetterOutputSchema},
  prompt: `You are an expert cover letter writer. Your task is to generate a cover letter in a strict, professional business letter format.

The output MUST follow this structure exactly, including newlines and spacing. Use the user's details provided.

1.  **Your Contact Information**:
    {{{userName}}}
    {{{userAddress}}}
    {{{userPhone}}}
    {{{userEmail}}}
    {{#if userWebsite}}
    {{{userWebsite}}}
    {{/if}}
    {{#if userLinkedin}}
    {{{userLinkedin}}}
    {{/if}}

    [Double Space]

2.  **Date**:
    Month Day, Year

    [Double Space]

3.  **Recipient's Contact Information**:
    Hiring Manager Name (if available, otherwise use "Hiring Manager")
    Hiring Manager Title
    Company Name
    Company Address

    [Double Space]

4.  **Salutation**:
    Dear [Hiring Manager Name],

    [Single Space]

5.  **Body**:
    *   **Paragraph 1 (Introduction)**: State the position you are applying for and where you saw the advertisement.
    *   **Paragraph 2-3 (Body)**: Highlight your most relevant skills and experiences from your resume that directly match the key requirements from the job description. Be specific and provide examples.
    *   **Paragraph 4 (Conclusion)**: Reiterate your interest in the role and the company. Express your enthusiasm and request an interview.

    [Single Space between each paragraph]

6.  **Closing**:
    Sincerely,

    [Triple Space for signature]

7.  **Your Name (Typed)**:
    {{{userName}}}

The tone must be professional and confident. Tailor the content to the provided resume and job description. Do not include any extra commentary. The output should be only the cover letter text itself.

Resume:
{{media url=resume}}

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
