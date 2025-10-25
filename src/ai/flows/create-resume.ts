'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a resume from scratch
 * based on user-provided information.
 *
 * - createResume - An exported function that takes structured user data and generates a resume.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExperienceSchema = z.object({
  title: z.string().describe('Job title'),
  company: z.string().describe('Company name'),
  location: z.string().optional().describe('Job location'),
  startDate: z.string().describe('Start date'),
  endDate: z.string().optional().describe('End date (or "Present")'),
  responsibilities: z.array(z.string()).describe('Key responsibilities and achievements'),
});

const EducationSchema = z.object({
  school: z.string().describe('Name of the school or university'),
  degree: z.string().describe('Degree or field of study'),
  location: z.string().optional().describe('School location'),
  startDate: z.string().describe('Start date'),
  endDate: z.string().optional().describe('End date or graduation date'),
});

const CreateResumeInputSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
  }),
  summary: z.string().describe("A professional summary of the person's career."),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
});
export type CreateResumeInput = z.infer<typeof CreateResumeInputSchema>;

const CreateResumeOutputSchema = z.object({
  resumeMarkdown: z.string().describe('The fully generated resume in Markdown format.'),
  resumeLatex: z.string().describe('The fully generated resume in a clean, compilable LaTeX format.'),
});
type CreateResumeOutput = z.infer<typeof CreateResumeOutputSchema>;

export async function createResume(input: CreateResumeInput): Promise<CreateResumeOutput> {
  return createResumeFlow(input);
}

const createResumePrompt = ai.definePrompt({
  name: 'createResumePrompt',
  input: { schema: CreateResumeInputSchema },
  output: { schema: CreateResumeOutputSchema },
  prompt: `You are an expert resume writer. Your task is to create a professional, well-formatted resume based on the structured information provided below. The resume should be clear, concise, and follow standard resume-writing best practices.

Use action verbs to start bullet points in the experience section. Quantify achievements whenever possible.

You must provide two outputs:
1. A Markdown version of the full resume. Use standard Markdown for headings, bold text, italics, and bullet points.
2. A full, compilable LaTeX document version of the resume. It should be a standard 'article' class document, clean, and ready for compilation.

Here is the information to use:

### Personal Information
- Name: {{{personalInfo.name}}}
- Email: {{{personalInfo.email}}}
- Phone: {{{personalInfo.phone}}}
- Address: {{{personalInfo.address}}}
{{#if personalInfo.linkedin}}- LinkedIn: {{{personalInfo.linkedin}}}{{/if}}
{{#if personalInfo.website}}- Website: {{{personalInfo.website}}}{{/if}}

### Professional Summary
{{{summary}}}

### Work Experience
{{#each experience}}
- **{{title}}** at {{company}} ({{location}})
  *{{startDate}} - {{endDate}}*
  {{#each responsibilities}}
  - {{{this}}}
  {{/each}}
{{/each}}

### Education
{{#each education}}
- **{{degree}}**, {{school}} ({{location}})
  *{{startDate}} - {{endDate}}*
{{/each}}

### Skills
{{#each skills}}
- {{{this}}}
{{/each}}

Now, generate the complete resume in both Markdown and LaTeX formats.
`,
});

const createResumeFlow = ai.defineFlow(
  {
    name: 'createResumeFlow',
    inputSchema: CreateResumeInputSchema,
    outputSchema: CreateResumeOutputSchema,
  },
  async (input) => {
    const { output } = await createResumePrompt(input);
    return output!;
  }
);
