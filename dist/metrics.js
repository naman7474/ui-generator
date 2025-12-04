"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMetrics = exports.recordRun = void 0;
const counters = {
    'single:success': 0,
    'single:failure': 0,
    'batch:success': 0,
    'batch:failure': 0,
};
const durationSum = {
    single: 0,
    batch: 0,
};
const durationCount = {
    single: 0,
    batch: 0,
};
const recordRun = (type, status, durationMs) => {
    counters[`${type}:${status}`] += 1;
    durationSum[type] += durationMs;
    durationCount[type] += 1;
};
exports.recordRun = recordRun;
const renderGauge = (name, help, value, labels) => {
    const lbl = labels
        ? '{' + Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',') + '}'
        : '';
    return [`# HELP ${name} ${help}`, `# TYPE ${name} counter`, `${name}${lbl} ${value}`].join('\n');
};
const renderSummary = (name, help, type) => {
    const sum = durationSum[type];
    const count = durationCount[type];
    return [
        `# HELP ${name} ${help}`,
        `# TYPE ${name} summary`,
        `${name}_sum{type="${type}"} ${sum}`,
        `${name}_count{type="${type}"} ${count}`,
    ].join('\n');
};
const renderMetrics = () => {
    return [
        renderGauge('checker_runs_total', 'Total runs by type/status', counters['single:success'] + counters['single:failure'], {
            type: 'single',
            status: 'all',
        }),
        renderGauge('checker_runs_success_total', 'Successful runs', counters['single:success'], { type: 'single' }),
        renderGauge('checker_runs_failure_total', 'Failed runs', counters['single:failure'], { type: 'single' }),
        renderGauge('checker_runs_total', 'Total runs by type/status', counters['batch:success'] + counters['batch:failure'], {
            type: 'batch',
            status: 'all',
        }),
        renderGauge('checker_runs_success_total', 'Successful runs', counters['batch:success'], { type: 'batch' }),
        renderGauge('checker_runs_failure_total', 'Failed runs', counters['batch:failure'], { type: 'batch' }),
        renderSummary('checker_run_duration_ms', 'Run duration in milliseconds', 'single'),
        renderSummary('checker_run_duration_ms', 'Run duration in milliseconds', 'batch'),
    ].join('\n');
};
exports.renderMetrics = renderMetrics;
