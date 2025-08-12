

import { GoogleGenAI } from "@google/genai";
import type { Wallpaper, SourceImage } from '../types';

const getAi = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("AI Service is not configured. The API_KEY environment variable is missing. Please configure it in your deployment settings.");
    }
    return new GoogleGenAI({ apiKey });
};

export async function generateWallpapers(
    prompt: string, 
    numberOfImages: number,
    aspectRatio: '9:16' | '16:9' | '1:1',
    negativePrompt: string,
    sourceImage?: SourceImage | null
): Promise<Wallpaper[]> {
    const ai = getAi();
    try {
        const basePrompt = `A stunning, ultra-high-resolution wallpaper.`;
        
        let fullPrompt = `${basePrompt} The theme is: ${prompt}`;

        if (negativePrompt.trim()) {
            fullPrompt += `. Do not include the following: ${negativePrompt}.`;
        }

        const requestPayload: any = {
            model: 'imagen-3.0-generate-002',
            prompt: fullPrompt,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        };

        if (sourceImage) {
            requestPayload.image = {
                imageBytes: sourceImage.base64,
                mimeType: sourceImage.mimeType,
            };
            requestPayload.prompt = `Using the provided image as a base, transform it into a new image. ${basePrompt} Follow these instructions for the transformation: ${prompt}${negativePrompt.trim() ? ` Do not include: ${negativePrompt}.` : ''}`;
        }

        const response = await ai.models.generateImages(requestPayload);

        if (response.generatedImages && response.generatedImages.length > 0) {
            const wallpapers: Wallpaper[] = response.generatedImages.map((image, index) => {
                 if (!image.image.imageBytes) {
                    throw new Error(`API returned an image object without image data for image ${index}.`);
                }
                return {
                    id: `${new Date().toISOString()}-${index}`,
                    prompt: prompt,
                    base64Image: image.image.imageBytes,
                    type: 'image',
                    aspectRatio: aspectRatio
                };
            });
            return wallpapers;
        } else {
            throw new Error("No images were generated. The prompt might have been blocked or the source image rejected.");
        }
    } catch (error) {
        console.error("Error generating wallpapers:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate wallpapers: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the wallpapers.");
    }
}


export async function generateVideo(
    prompt: string,
    aspectRatio: '9:16' | '16:9' | '1:1',
    sourceImage: SourceImage | null,
    seed?: number
) {
    const ai = getAi();
    try {
        const requestPayload: any = {
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                seed: seed,
            }
        };

        if (sourceImage) {
            requestPayload.image = {
                imageBytes: sourceImage.base64,
                mimeType: sourceImage.mimeType,
            };
        }
        
        const operation = await ai.models.generateVideos(requestPayload);
        return operation;

    } catch (error) {
        console.error("Error starting video generation:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to start video generation: ${error.message}`);
        }
        throw new Error("An unknown error occurred while starting video generation.");
    }
}

export async function getVideoOperationStatus(operation: any) {
    const ai = getAi();
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error polling video status:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get video operation status: ${error.message}`);
        }
        throw new Error("An unknown error occurred while polling video status.");
    }
}