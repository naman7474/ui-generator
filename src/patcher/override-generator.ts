
import fs from 'fs/promises';
import path from 'path';
import { StyleChange } from '../ground-truth/types';

/**
 * Alternative approach: Instead of modifying existing CSS,
 * generate a standalone overrides file that's loaded last.
 * 
 * This is simpler and has cleaner rollback semantics.
 */

interface OverrideEntry {
    selector: string;
    property: string;
    value: string;
    addedAt: string;
    iteration: number;
}

export class OverrideManager {
    private entries: OverrideEntry[] = [];
    private filePath: string;

    constructor(siteDir: string) {
        this.filePath = path.join(siteDir, 'site', 'overrides.css');
    }

    async load(): Promise<void> {
        try {
            const metaPath = this.filePath.replace('.css', '.json');
            const meta = await fs.readFile(metaPath, 'utf-8');
            this.entries = JSON.parse(meta);
        } catch {
            this.entries = [];
        }
    }

    async save(): Promise<void> {
        // Save metadata
        const metaPath = this.filePath.replace('.css', '.json');
        await fs.writeFile(metaPath, JSON.stringify(this.entries, null, 2));

        // Generate CSS
        const css = this.generateCSS();
        await fs.writeFile(this.filePath, css);
    }

    addChange(change: StyleChange, iteration: number): void {
        // Remove existing entry for same selector+property if exists
        this.entries = this.entries.filter(e =>
            !(e.selector === change.cssSelector && e.property === change.property)
        );

        this.entries.push({
            selector: change.cssSelector,
            property: change.property,
            value: change.expected,
            addedAt: new Date().toISOString(),
            iteration
        });
    }

    removeChange(selector: string, property: string): void {
        this.entries = this.entries.filter(e =>
            !(e.selector === selector && e.property === property)
        );
    }

    rollbackIteration(iteration: number): void {
        this.entries = this.entries.filter(e => e.iteration !== iteration);
    }

    private generateCSS(): string {
        const lines: string[] = [
            '/**',
            ' * AUTO-GENERATED CSS OVERRIDES',
            ' * Do not edit manually - managed by PixelGen',
            ` * Generated: ${new Date().toISOString()}`,
            ' */',
            ''
        ];

        // Group by selector
        const bySelector = new Map<string, OverrideEntry[]>();
        for (const entry of this.entries) {
            if (!bySelector.has(entry.selector)) {
                bySelector.set(entry.selector, []);
            }
            bySelector.get(entry.selector)!.push(entry);
        }

        // Generate rules
        for (const [selector, entries] of bySelector) {
            lines.push(`${selector} {`);
            for (const entry of entries) {
                lines.push(`  ${entry.property}: ${entry.value} !important; /* iter ${entry.iteration} */`);
            }
            lines.push('}');
            lines.push('');
        }

        return lines.join('\n');
    }
}
