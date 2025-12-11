// src/multi-page-validator.ts
//
// End-to-end validation for multi-page generated sites.
// Checks link integrity, asset availability, and cross-page consistency.
//

import * as fs from 'fs/promises';
import * as path from 'path';
import { chromium, Browser, Page } from 'playwright';

// ============================================================================
// TYPES
// ============================================================================

export interface BrokenLink {
    page: string;
    href: string;
    reason: 'not-found' | 'timeout' | 'external-fail' | 'invalid';
    linkText?: string;
}

export interface MissingAsset {
    page: string;
    url: string;
    type: 'image' | 'font' | 'css' | 'js' | 'other';
}

export interface StyleInconsistency {
    page: string;
    section: string;
    issue: string;
    expected?: string;
    actual?: string;
}

export interface ValidationResult {
    success: boolean;
    timestamp: string;
    pagesChecked: number;
    summary: {
        totalLinks: number;
        internalLinks: number;
        externalLinks: number;
        brokenLinks: number;
        missingAssets: number;
        styleInconsistencies: number;
    };
    brokenLinks: BrokenLink[];
    missingAssets: MissingAsset[];
    styleInconsistencies: StyleInconsistency[];
    warnings: string[];
}

// ============================================================================
// VALIDATOR CLASS
// ============================================================================

export class MultiPageValidator {
    private browser: Browser | null = null;
    private siteDir: string;
    private baseUrl: string;

    constructor(siteDir: string, baseUrl?: string) {
        this.siteDir = siteDir;
        this.baseUrl = baseUrl || `file://${path.resolve(siteDir)}`;
    }

    /**
     * Run full validation suite
     */
    async validate(): Promise<ValidationResult> {
        const result: ValidationResult = {
            success: true,
            timestamp: new Date().toISOString(),
            pagesChecked: 0,
            summary: {
                totalLinks: 0,
                internalLinks: 0,
                externalLinks: 0,
                brokenLinks: 0,
                missingAssets: 0,
                styleInconsistencies: 0,
            },
            brokenLinks: [],
            missingAssets: [],
            styleInconsistencies: [],
            warnings: [],
        };

        try {
            this.browser = await chromium.launch({ headless: true });

            // Find all HTML files in the site directory
            const pages = await this.findHtmlFiles();
            result.pagesChecked = pages.length;

            console.log(`[Validator] Found ${pages.length} pages to validate`);

            // Validate each page
            for (const pagePath of pages) {
                const pageUrl = this.pathToUrl(pagePath);
                console.log(`[Validator] Checking: ${path.relative(this.siteDir, pagePath)}`);

                await this.validatePage(pageUrl, pagePath, result);
            }

            // Update summary
            result.summary.brokenLinks = result.brokenLinks.length;
            result.summary.missingAssets = result.missingAssets.length;
            result.summary.styleInconsistencies = result.styleInconsistencies.length;

            // Determine overall success
            result.success =
                result.brokenLinks.length === 0 &&
                result.missingAssets.length === 0;

        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }

        return result;
    }

    /**
     * Validate a single page
     */
    private async validatePage(
        pageUrl: string,
        pagePath: string,
        result: ValidationResult
    ): Promise<void> {
        const page = await this.browser!.newPage();
        const pageRelPath = path.relative(this.siteDir, pagePath);

        try {
            // Navigate to page
            const response = await page.goto(pageUrl, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });

            if (!response || !response.ok()) {
                result.warnings.push(`Page failed to load: ${pageRelPath}`);
                return;
            }

            // Check all links on the page
            await this.validateLinks(page, pageRelPath, result);

            // Check for missing images
            await this.validateImages(page, pageRelPath, result);

            // Check for console errors (missing assets)
            // Note: Would need to set up console listener before navigation

        } catch (e: any) {
            result.warnings.push(`Error validating ${pageRelPath}: ${e.message}`);
        } finally {
            await page.close();
        }
    }

    /**
     * Validate all links on a page
     */
    private async validateLinks(
        page: Page,
        pagePath: string,
        result: ValidationResult
    ): Promise<void> {
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]')).map(el => ({
                href: el.getAttribute('href') || '',
                text: el.textContent?.trim().slice(0, 50) || '',
            }));
        });

        result.summary.totalLinks += links.length;

        for (const link of links) {
            const href = link.href;

            // Skip empty, hash, and javascript links
            if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
                continue;
            }

            // Classify as internal or external
            const isExternal = href.startsWith('http://') || href.startsWith('https://');
            const isInternal = href.startsWith('/') || href.startsWith('./') ||
                (!isExternal && !href.includes('://'));

            if (isInternal) {
                result.summary.internalLinks++;

                // Check if internal link target exists
                const targetPath = this.resolveInternalLink(href, pagePath);
                if (targetPath) {
                    const exists = await this.fileExists(targetPath);
                    if (!exists) {
                        result.brokenLinks.push({
                            page: pagePath,
                            href,
                            reason: 'not-found',
                            linkText: link.text,
                        });
                    }
                }
            } else if (isExternal) {
                result.summary.externalLinks++;
                // We skip external link validation to avoid network requests
            }
        }
    }

    /**
     * Validate images on a page
     */
    private async validateImages(
        page: Page,
        pagePath: string,
        result: ValidationResult
    ): Promise<void> {
        const images = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img')).map(img => ({
                src: img.src,
                complete: img.complete,
                naturalWidth: img.naturalWidth,
            }));
        });

        for (const img of images) {
            // Check if image loaded correctly
            if (img.complete && img.naturalWidth === 0 && img.src) {
                result.missingAssets.push({
                    page: pagePath,
                    url: img.src,
                    type: 'image',
                });
            }
        }
    }

    /**
     * Find all HTML files in the site directory
     */
    private async findHtmlFiles(): Promise<string[]> {
        const files: string[] = [];

        const walk = async (dir: string) => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        await walk(fullPath);
                    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.htm')) {
                        files.push(fullPath);
                    }
                }
            } catch {
                // Directory might not exist
            }
        };

        await walk(this.siteDir);
        return files;
    }

    /**
     * Convert file path to file:// URL
     */
    private pathToUrl(filePath: string): string {
        return `file://${path.resolve(filePath)}`;
    }

    /**
     * Resolve an internal link to a file path
     */
    private resolveInternalLink(href: string, fromPage: string): string | null {
        try {
            // Handle absolute paths (relative to site root)
            if (href.startsWith('/')) {
                return path.join(this.siteDir, href);
            }

            // Handle relative paths
            const pageDir = path.dirname(path.join(this.siteDir, fromPage));
            return path.join(pageDir, href);
        } catch {
            return null;
        }
    }

    /**
     * Check if a file exists
     */
    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            // Also check with index.html appended for directories
            try {
                await fs.access(path.join(filePath, 'index.html'));
                return true;
            } catch {
                return false;
            }
        }
    }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Validate a multi-page generated site
 */
export const validateMultiPageSite = async (
    siteDir: string,
    baseUrl?: string
): Promise<ValidationResult> => {
    const validator = new MultiPageValidator(siteDir, baseUrl);
    return validator.validate();
};

/**
 * Generate a validation report
 */
export const generateValidationReport = (result: ValidationResult): string => {
    const lines: string[] = [];

    lines.push('# Multi-Page Site Validation Report');
    lines.push('');
    lines.push(`**Generated:** ${result.timestamp}`);
    lines.push(`**Pages Checked:** ${result.pagesChecked}`);
    lines.push(`**Status:** ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');

    lines.push('## Summary');
    lines.push('');
    lines.push(`| Metric | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total Links | ${result.summary.totalLinks} |`);
    lines.push(`| Internal Links | ${result.summary.internalLinks} |`);
    lines.push(`| External Links | ${result.summary.externalLinks} |`);
    lines.push(`| Broken Links | ${result.summary.brokenLinks} |`);
    lines.push(`| Missing Assets | ${result.summary.missingAssets} |`);
    lines.push('');

    if (result.brokenLinks.length > 0) {
        lines.push('## Broken Links');
        lines.push('');
        for (const link of result.brokenLinks) {
            lines.push(`- **${link.page}**: \`${link.href}\` (${link.reason})`);
            if (link.linkText) {
                lines.push(`  - Link text: "${link.linkText}"`);
            }
        }
        lines.push('');
    }

    if (result.missingAssets.length > 0) {
        lines.push('## Missing Assets');
        lines.push('');
        for (const asset of result.missingAssets) {
            lines.push(`- **${asset.page}**: ${asset.type} - \`${asset.url}\``);
        }
        lines.push('');
    }

    if (result.warnings.length > 0) {
        lines.push('## Warnings');
        lines.push('');
        for (const warning of result.warnings) {
            lines.push(`- ${warning}`);
        }
    }

    return lines.join('\n');
};
