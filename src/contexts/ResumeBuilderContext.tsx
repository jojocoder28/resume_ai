'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as z from 'zod';

// Define schemas for each part of the resume
export const PersonalInfoSchema = z.object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

export const SummarySchema = z.object({
    summary: z.string().min(20, 'Summary should be at least 20 characters').max(500, 'Summary cannot exceed 500 characters'),
});

export const ExperienceSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company name is required'),
    location: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    responsibilities: z.string().min(10, 'Please list some responsibilities'),
});

export const EducationSchema = z.object({
    id: z.string().optional(),
    school: z.string().min(1, 'School/University name is required'),
    degree: z.string().min(1, 'Degree/Field of study is required'),
    location: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
});

export const SkillsSchema = z.object({
    skills: z.array(z.string()).min(1, 'Please add at least one skill'),
});

// Combine all schemas into one for the full resume
export const ResumeSchema = z.object({
    template: z.enum(['classic', 'modern']),
    personalInfo: PersonalInfoSchema,
    summary: SummarySchema,
    experience: z.array(ExperienceSchema),
    education: z.array(EducationSchema),
    skills: SkillsSchema,
});

export type ResumeFormData = z.infer<typeof ResumeSchema>;
export type PersonalInfoData = z.infer<typeof PersonalInfoSchema>;
export type SummaryData = z.infer<typeof SummarySchema>;
export type ExperienceData = z.infer<typeof ExperienceSchema>;
export type EducationData = z.infer<typeof EducationSchema>;
export type SkillsData = z.infer<typeof SkillsSchema>;


interface ResumeBuilderContextType {
    formData: ResumeFormData;
    setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
    updateTemplate: (template: 'classic' | 'modern') => void;
    updatePersonalInfo: (data: PersonalInfoData) => void;
    updateSummary: (data: SummaryData) => void;
    addExperience: (exp: ExperienceData) => void;
    updateExperience: (index: number, exp: ExperienceData) => void;
    removeExperience: (index: number) => void;
    addEducation: (edu: EducationData) => void;
    updateEducation: (index: number, edu: EducationData) => void;
    removeEducation: (index: number) => void;
    updateSkills: (data: SkillsData) => void;
}

const ResumeBuilderContext = createContext<ResumeBuilderContextType | undefined>(undefined);

export const useResumeBuilder = () => {
    const context = useContext(ResumeBuilderContext);
    if (!context) {
        throw new Error('useResumeBuilder must be used within a ResumeBuilderProvider');
    }
    return context;
};

const initialFormData: ResumeFormData = {
    template: 'classic',
    personalInfo: { name: '', email: '', phone: '', address: '', linkedin: '', website: '' },
    summary: { summary: '' },
    experience: [],
    education: [],
    skills: { skills: [] },
};

export const ResumeBuilderProvider = ({ children }: { children: ReactNode }) => {
    const [formData, setFormData] = useState<ResumeFormData>(initialFormData);

    const updateTemplate = (template: 'classic' | 'modern') => {
        setFormData(prev => ({ ...prev, template }));
    }

    const updatePersonalInfo = (data: PersonalInfoData) => {
        setFormData(prev => ({ ...prev, personalInfo: data }));
    };

    const updateSummary = (data: SummaryData) => {
        setFormData(prev => ({ ...prev, summary: data }));
    }

    const addExperience = (exp: ExperienceData) => {
        setFormData(prev => ({ ...prev, experience: [...prev.experience, { ...exp, id: Date.now().toString() }] }));
    };

    const updateExperience = (index: number, exp: ExperienceData) => {
        setFormData(prev => {
            const newExperience = [...prev.experience];
            newExperience[index] = exp;
            return { ...prev, experience: newExperience };
        });
    };

    const removeExperience = (index: number) => {
        setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
    };

    const addEducation = (edu: EducationData) => {
        setFormData(prev => ({ ...prev, education: [...prev.education, { ...edu, id: Date.now().toString() }] }));
    };

    const updateEducation = (index: number, edu: EducationData) => {
        setFormData(prev => {
            const newEducation = [...prev.education];
            newEducation[index] = edu;
            return { ...prev, education: newEducation };
        });
    };

    const removeEducation = (index: number) => {
        setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    };

    const updateSkills = (data: SkillsData) => {
        setFormData(prev => ({ ...prev, skills: data }));
    };
    
    const value = {
        formData,
        setFormData,
        updateTemplate,
        updatePersonalInfo,
        updateSummary,
        addExperience,
        updateExperience,
        removeExperience,
        addEducation,
        updateEducation,
        removeEducation,
        updateSkills,
    };

    return (
        <ResumeBuilderContext.Provider value={value}>
            {children}
        </ResumeBuilderContext.Provider>
    );
};
