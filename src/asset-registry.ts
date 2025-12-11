// src/asset-registry.ts
//
// Central asset registry for multi-page generation.
// Tracks all discovered assets, deduplicates by content hash,
// and provides consistent local paths across all pages.
//

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { chromium } from 'playwright';

// ============================================================================
// TYPES
// ============================================================================

export type AssetType = 'image' | 'font' | 'icon' | 'video' | 'other';

export interface AssetEntry {
    originalUrl: string;
    localPath: string;        // Relative path from site root
    absolutePath?: string;    // Absolute file path when downloaded
    type: AssetType;
    contentHash?: string;     // Hash for deduplication
    size?: number;
    sourcePages: string[];    // URLs of pages that reference this asset
    downloaded: boolean;
}

export interface AssetManifest {
    version: string;
    generated: string;
    baseDir: string;
    assets: AssetEntry[];
    stats: {
        total: number;
        byType: Record<AssetType, number>;
        totalSizeBytes: number;
        deduplicated: number;
    };
}

// ============================================================================
// ASSET REGISTRY
// ============================================================================

export class AssetRegistry {
    // Original URL → AssetEntry
    private assets = new Map<string, AssetEntry>();
    // Content hash → original URL (for deduplication)
    private hashToUrl = new Map<string, string>();
    // Base directory for assets
    private baseDir: string;
    // Counter for deduplication stats
    private deduplicatedCount = 0;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
    }

    /**
     * Register an asset, returns the local path to use
     */
    async add(
        originalUrl: string,
        type: AssetType,
        pageUrl: string,
        options?: { contentHash?: string }
    ): Promise<string> {
        // Normalize URL
        const normalizedUrl = this.normalizeUrl(originalUrl);

        // Check if already registered
        const existing = this.assets.get(normalizedUrl);
        if (existing) {
            // Add page reference if not already present
            if (!existing.sourcePages.includes(pageUrl)) {
                existing.sourcePages.push(pageUrl);
            }
            return existing.localPath;
        }

        // Check for deduplication by hash
        if (options?.contentHash) {
            const existingByHash = this.hashToUrl.get(options.contentHash);
            if (existingByHash) {
                const existingAsset = this.assets.get(existingByHash);
                if (existingAsset) {
                    // Use existing asset path, just add reference
                    if (!existingAsset.sourcePages.includes(pageUrl)) {
                        existingAsset.sourcePages.push(pageUrl);
                    }
                    // Register this URL as alias to existing
                    this.assets.set(normalizedUrl, {
                        ...existingAsset,
                        originalUrl: normalizedUrl,
                        sourcePages: [...existingAsset.sourcePages],
                    });
                    this.deduplicatedCount++;
                    return existingAsset.localPath;
                }
            }
        }

        // Generate local path
        const localPath = this.generateLocalPath(originalUrl, type);

        const entry: AssetEntry = {
            originalUrl: normalizedUrl,
            localPath,
            type,
            contentHash: options?.contentHash,
            sourcePages: [pageUrl],
            downloaded: false,
        };

        this.assets.set(normalizedUrl, entry);
        if (options?.contentHash) {
            this.hashToUrl.set(options.contentHash, normalizedUrl);
        }

        return localPath;
    }

    /**
     * Get local path for an original URL
     */
    getLocalPath(originalUrl: string): string | undefined {
        const normalized = this.normalizeUrl(originalUrl);
        return this.assets.get(normalized)?.localPath;
    }

    /**
     * Get all assets
     */
    getAllAssets(): AssetEntry[] {
        return Array.from(this.assets.values());
    }

    /**
     * Get assets by type
     */
    getAssetsByType(type: AssetType): AssetEntry[] {
        return this.getAllAssets().filter(a => a.type === type);
    }

    /**
     * Check if an asset is registered
     */
    hasAsset(originalUrl: string): boolean {
        return this.assets.has(this.normalizeUrl(originalUrl));
    }

    /**
     * Download all registered assets to output directory
     */
    async downloadAll(outputDir: string): Promise<{
        downloaded: number;
        failed: number;
        skipped: number;
    }> {
        const stats = { downloaded: 0, failed: 0, skipped: 0 };

        // Create asset directories
        await this.ensureAssetDirectories(outputDir);

        // Use Playwright for downloading to handle authentication/cookies
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();

        try {
            for (const entry of Array.from(this.assets.values())) {
                if (entry.downloaded) {
                    stats.skipped++;
                    continue;
                }

                const absolutePath = path.join(outputDir, entry.localPath);

                try {
                    await this.downloadAsset(context, entry.originalUrl, absolutePath);
                    entry.absolutePath = absolutePath;
                    entry.downloaded = true;

                    // Get file size
                    const stat = await fs.stat(absolutePath);
                    entry.size = stat.size;

                    // Compute hash if not already set
                    if (!entry.contentHash) {
                        entry.contentHash = await this.computeFileHash(absolutePath);
                        this.hashToUrl.set(entry.contentHash, entry.originalUrl);
                    }

                    stats.downloaded++;
                } catch (e: any) {
                    console.warn(`[AssetRegistry] Failed to download ${entry.originalUrl}: ${e.message}`);
                    stats.failed++;
                }
            }
        } finally {
            await browser.close();
        }

        return stats;
    }

    /**
     * Copy all assets to a single output directory
     */
    async copyAllToOutputDir(outputDir: string): Promise<void> {
        await this.ensureAssetDirectories(outputDir);

        for (const entry of Array.from(this.assets.values())) {
            if (entry.absolutePath) {
                const destPath = path.join(outputDir, entry.localPath);
                const destDir = path.dirname(destPath);
                await fs.mkdir(destDir, { recursive: true });

                try {
                    await fs.copyFile(entry.absolutePath, destPath);
                } catch (e: any) {
                    console.warn(`[AssetRegistry] Failed to copy ${entry.localPath}: ${e.message}`);
                }
            }
        }
    }

    /**
     * Get asset manifest
     */
    getManifest(): AssetManifest {
        const assets = this.getAllAssets();
        const byType: Record<AssetType, number> = {
            image: 0,
            font: 0,
            icon: 0,
            video: 0,
            other: 0,
        };

        let totalSize = 0;
        for (const asset of assets) {
            byType[asset.type]++;
            totalSize += asset.size ?? 0;
        }

        return {
            version: '1.0',
            generated: new Date().toISOString(),
            baseDir: this.baseDir,
            assets,
            stats: {
                total: assets.length,
                byType,
                totalSizeBytes: totalSize,
                deduplicated: this.deduplicatedCount,
            },
        };
    }

    /**
     * Save manifest to file
     */
    async saveManifest(outputPath: string): Promise<void> {
        const manifest = this.getManifest();
        await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
    }

    /**
     * Load from manifest file
     */
    static async fromManifest(manifestPath: string): Promise<AssetRegistry> {
        const data = await fs.readFile(manifestPath, 'utf8');
        const manifest: AssetManifest = JSON.parse(data);

        const registry = new AssetRegistry(manifest.baseDir);
        for (const asset of manifest.assets) {
            registry.assets.set(asset.originalUrl, asset);
            if (asset.contentHash) {
                registry.hashToUrl.set(asset.contentHash, asset.originalUrl);
            }
        }

        return registry;
    }

    /**
     * Generate a URL replacement map for use in generated code
     */
    getUrlReplacementMap(): Record<string, string> {
        const map: Record<string, string> = {};
        for (const asset of Array.from(this.assets.values())) {
            // Map original URL to local path
            map[asset.originalUrl] = asset.localPath;
        }
        return map;
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private normalizeUrl(url: string): string {
        try {
            const parsed = new URL(url);
            // Remove query params and hash for matching
            return parsed.origin + parsed.pathname;
        } catch {
            return url;
        }
    }

    private generateLocalPath(originalUrl: string, type: AssetType): string {
        try {
            const parsed = new URL(originalUrl);
            const pathname = parsed.pathname;

            // Get filename
            let filename = path.basename(pathname) || 'asset';

            // Ensure proper extension
            if (!path.extname(filename)) {
                filename += this.getDefaultExtension(type);
            }

            // Sanitize filename
            filename = filename.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();

            // Create path in type-specific directory
            const typeDir = this.getTypeDirectory(type);

            // Add hash prefix for uniqueness
            const hash = crypto
                .createHash('md5')
                .update(originalUrl)
                .digest('hex')
                .slice(0, 8);

            return `${typeDir}/${hash}-${filename}`;
        } catch {
            const hash = crypto
                .createHash('md5')
                .update(originalUrl)
                .digest('hex')
                .slice(0, 12);
            return `assets/${hash}${this.getDefaultExtension(type)}`;
        }
    }

    private getTypeDirectory(type: AssetType): string {
        switch (type) {
            case 'image': return 'images';
            case 'font': return 'fonts';
            case 'icon': return 'icons';
            case 'video': return 'videos';
            default: return 'assets';
        }
    }

    private getDefaultExtension(type: AssetType): string {
        switch (type) {
            case 'image': return '.png';
            case 'font': return '.woff2';
            case 'icon': return '.svg';
            case 'video': return '.mp4';
            default: return '';
        }
    }

    private async ensureAssetDirectories(outputDir: string): Promise<void> {
        const dirs = ['images', 'fonts', 'icons', 'videos', 'assets'];
        for (const dir of dirs) {
            await fs.mkdir(path.join(outputDir, dir), { recursive: true });
        }
    }

    private async downloadAsset(
        context: any,
        url: string,
        destPath: string
    ): Promise<void> {
        const page = await context.newPage();
        try {
            const response = await page.goto(url, {
                waitUntil: 'load',
                timeout: 30000,
            });

            if (!response || !response.ok()) {
                throw new Error(`HTTP ${response?.status() ?? 'unknown'}`);
            }

            const buffer = await response.body();
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, buffer);
        } finally {
            await page.close();
        }
    }

    private async computeFileHash(filePath: string): Promise<string> {
        const content = await fs.readFile(filePath);
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Detect asset type from URL
 */
export const detectAssetType = (url: string): AssetType => {
    const pathname = new URL(url, 'http://localhost').pathname.toLowerCase();
    const ext = path.extname(pathname);

    // Images
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico', '.bmp'].includes(ext)) {
        return 'image';
    }

    // Fonts
    if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
        return 'font';
    }

    // SVGs in certain paths are likely icons
    if (ext === '.svg' && /icon|logo|symbol/i.test(pathname)) {
        return 'icon';
    }

    // Videos
    if (['.mp4', '.webm', '.ogg', '.mov', '.avi'].includes(ext)) {
        return 'video';
    }

    return 'other';
};

/**
 * Create asset registry and populate from a page's assets
 */
export const createAssetRegistryFromScan = async (
    baseDir: string,
    assets: Array<{ url: string; type?: AssetType }>,
    pageUrl: string
): Promise<AssetRegistry> => {
    const registry = new AssetRegistry(baseDir);

    for (const asset of assets) {
        const type = asset.type ?? detectAssetType(asset.url);
        await registry.add(asset.url, type, pageUrl);
    }

    return registry;
};
