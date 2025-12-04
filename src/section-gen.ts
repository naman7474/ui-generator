export type LayoutHint = 'full-width' | 'grid' | 'columns' | 'standard';

export interface ImageProcessingResult {
  localPath: string;
  originalUrl: string;
  width?: number;
  height?: number;
  format?: string;
  optimizedPath?: string;
}

export interface SectionGenerationRequest {
  sectionName: string;
  sectionType: 'header' | 'hero' | 'features' | 'footer' | 'content';
  baseScreenshot: string; // data URL
  assets: {
    images: ImageProcessingResult[];
    icons: string[];
  };
  textContent: {
    headings: string[];
    paragraphs: string[];
    buttons: string[];
  };
  layoutHint: LayoutHint;
  model?: string;
}

export type GeneratedSection = { html: string; imageSlots: Array<{ id: string; description?: string; dimensions?: { w: number; h: number } }>; iconSlots: Array<{ id: string; name?: string }> };

export const generateSection = async (req: SectionGenerationRequest): Promise<GeneratedSection> => {
  const api = process.env.GENERATOR_API_URL || 'http://localhost:8000';
  const payload = {
    sectionName: req.sectionName,
    sectionType: req.sectionType,
    baseScreenshot: req.baseScreenshot,
    assets: req.assets,
    textContent: req.textContent,
    layoutHint: req.layoutHint,
    model: req.model || process.env.GENERATOR_UPDATE_MODEL || 'gemini-2.5-pro',
  };
  const res = await fetch(`${api}/api/generate-section`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`generateSection failed: ${res.status} ${res.statusText}${detail ? ` - ${detail.slice(0, 300)}` : ''}`);
  }
  const data = await res.json();
  return { html: data.html || '', imageSlots: Array.isArray(data.imageSlots) ? data.imageSlots : [], iconSlots: Array.isArray(data.iconSlots) ? data.iconSlots : [] };
};
