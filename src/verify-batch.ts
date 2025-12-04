
import { compareSites } from './comparator';
import { writeBatchReport } from './report';
import { BatchComparisonResult } from './types';
import fs from 'fs/promises';
import path from 'path';

const run = async () => {
    const baseHtml = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { margin: 0; padding: 0; font-family: sans-serif; }
      .container { padding: 20px; background: #eee; }
    </style></head>
    <body>
      <div class="container" id="main">
        <h1>Hello World</h1>
      </div>
    </body>
    </html>
  `;

    const targetHtml = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { margin: 0; padding: 0; font-family: sans-serif; }
      .container { padding: 30px; background: #eee; } /* Changed padding */
    </style></head>
    <body>
      <div class="container" id="main">
        <h1>Hello World</h1>
      </div>
    </body>
    </html>
  `;

    await fs.writeFile('base.html', baseHtml);
    await fs.writeFile('target.html', targetHtml);

    const cwd = process.cwd();
    const baseUrl = `file://${path.join(cwd, 'base.html')}`;
    const targetUrl = `file://${path.join(cwd, 'target.html')}`;
    const outputDir = path.join(cwd, 'test-batch-output');

    console.log('Comparing sites...');
    const result = await compareSites(baseUrl, targetUrl, { base: 'Base', target: 'Target' }, { outputDir });

    const batchResult: BatchComparisonResult = {
        batchId: 'test-batch',
        baseRoot: baseUrl,
        targetRoot: targetUrl,
        paths: ['/'],
        summary: {
            averageSimilarity: result.diff.similarity,
            averageDiffPixels: result.diff.diffPixels,
            averageBaseLoadMs: result.base.timing.loadTimeMs,
            averageTargetLoadMs: result.target.timing.loadTimeMs,
        },
        pages: [result],
        outputDir,
    };

    console.log('Writing batch report...');
    const reportPath = await writeBatchReport(batchResult);
    console.log(`Batch report written to ${reportPath}`);

    const reportContent = await fs.readFile(path.join(outputDir, 'batch-report.html'), 'utf-8');
    if (reportContent.includes('Layout & Style Differences') && reportContent.includes('padding-top: +10.0px')) {
        console.log('SUCCESS: Batch report contains style differences.');
    } else {
        console.error('FAILURE: Batch report missing style differences.');
    }

    // Clean up
    await fs.unlink('base.html');
    await fs.unlink('target.html');
    // await fs.rm(outputDir, { recursive: true, force: true });
};

run().catch(console.error);
