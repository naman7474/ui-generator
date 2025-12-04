import { generateMultiDeviceFixPrompt, generateSectionFixPrompt, DeviceArtifacts } from './gemini';

export const buildFeedback = async (artifacts: DeviceArtifacts[], focus?: string, options?: { targetDevice?: 'desktop' | 'mobile'; targetSection?: string; sectionSpecs?: any[]; structureOrder?: string[] }): Promise<string> => {
    return generateMultiDeviceFixPrompt(artifacts, focus, options);
};

export const buildSectionFeedback = async (params: {
    sectionName: string;
    device: 'desktop' | 'mobile';
    basePath: string;
    targetPath: string;
    diffPath?: string;
    sectionSpec?: any;
    structureOrder?: string[];
}): Promise<string> => {
    return generateSectionFixPrompt(params);
};
