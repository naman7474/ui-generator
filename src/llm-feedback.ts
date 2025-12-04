import { generateMultiDeviceFixPrompt, DeviceArtifacts } from './gemini';

export const buildFeedback = async (artifacts: DeviceArtifacts[]): Promise<string> => {
    return generateMultiDeviceFixPrompt(artifacts);
};
