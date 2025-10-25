import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export const classicTemplateImage = PlaceHolderImages.find(img => img.id === 'classic-template')!;
export const modernTemplateImage = PlaceHolderImages.find(img => img.id === 'modern-template')!;
